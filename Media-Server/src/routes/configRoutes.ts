import { Router, Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { asyncHandler } from '../middleware/errorHandler';
import { adminAuthMiddleware } from '../middleware/authMiddleware';
import { Config } from '../config/config';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { VideoQuality } from '../types';

const router = Router();

/**
 * Validation constants for configuration
 */
const MIN_FILE_SIZE = 1024 * 1024; // 1MB
const MAX_FILE_SIZE = 50 * 1024 * 1024 * 1024; // 50GB
const VALID_PRESETS = Object.values(VideoQuality);

/**
 * Validate URL format
 */
function isValidUrl(url: string): boolean {
  if (url === '*') return true;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate configuration values
 */
interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

function validateConfig(updates: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate MAX_FILE_SIZE
  if ('MAX_FILE_SIZE' in updates) {
    const size = Number(updates.MAX_FILE_SIZE);
    if (isNaN(size) || size < MIN_FILE_SIZE || size > MAX_FILE_SIZE) {
      errors.push(`MAX_FILE_SIZE must be between ${MIN_FILE_SIZE} (1MB) and ${MAX_FILE_SIZE} (50GB)`);
    }
  }

  // Validate ALLOWED_ORIGINS
  if ('ALLOWED_ORIGINS' in updates) {
    const origins = String(updates.ALLOWED_ORIGINS);
    if (origins === '*') {
      warnings.push('WARNING: ALLOWED_ORIGINS=* allows requests from any origin. Not recommended for production.');
    } else {
      const originList = origins.split(',').map(o => o.trim());
      const invalidOrigins = originList.filter(o => !isValidUrl(o));
      if (invalidOrigins.length > 0) {
        errors.push(`Invalid CORS origins: ${invalidOrigins.join(', ')}`);
      }
    }
  }

  // Validate TRANSCODING_PRESETS
  if ('TRANSCODING_PRESETS' in updates) {
    const presets = String(updates.TRANSCODING_PRESETS).split(',').map(p => p.trim());
    const validPresets = presets.filter(p => VALID_PRESETS.includes(p as VideoQuality));
    const invalidPresets = presets.filter(p => !VALID_PRESETS.includes(p as VideoQuality));
    
    if (invalidPresets.length > 0) {
      warnings.push(`Invalid transcoding presets will be ignored: ${invalidPresets.join(', ')}. Valid: ${VALID_PRESETS.join(', ')}`);
    }
    
    if (validPresets.length === 0) {
      warnings.push('WARNING: No valid transcoding presets specified. All presets are invalid.');
    }
  }

  // Validate LOG_LEVEL
  if ('LOG_LEVEL' in updates) {
    const validLevels = ['error', 'warn', 'info', 'debug'];
    const level = String(updates.LOG_LEVEL).toLowerCase();
    if (!validLevels.includes(level)) {
      errors.push(`LOG_LEVEL must be one of: ${validLevels.join(', ')}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

// Get current configuration
router.get('/config', adminAuthMiddleware, (_req: Request, res: Response) => {
  const config = Config.getInstance();
  
  sendSuccess(res, {
    // Server config
    PORT: config.getPort(),
    NODE_ENV: config.getEnvironment(),
    LOG_LEVEL: config.getLogLevel(),
    
    // Directory config
    VIDEO_UPLOAD_DIR: config.getUploadsDir(),
    VIDEO_STREAM_DIR: config.getStreamsDir(),
    PUBLIC_DIR: config.getPublicDir(),
    
    // CORS config
    CORS_ENABLED: config.isCorsEnabled(),
    ALLOWED_ORIGINS: config.getAllowedOrigins(),
    
    // Video config
    MAX_FILE_SIZE: config.getMaxFileSize(),
    ALLOWED_FORMATS: config.getAllowedFormats().join(','),
    
    // Transcoding config
    ENABLE_TRANSCODING: config.isTranscodingEnabled(),
    TRANSCODING_PRESETS: config.getTranscodingPresets().join(',')
  });
});

// Update configuration
router.put('/config', adminAuthMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const updates = req.body;
  
  // Validate updates
  const allowedFields = [
    'LOG_LEVEL',
    'CORS_ENABLED',
    'ALLOWED_ORIGINS',
    'MAX_FILE_SIZE',
    'ALLOWED_FORMATS',
    'ENABLE_TRANSCODING',
    'TRANSCODING_PRESETS'
  ];

  const invalidFields = Object.keys(updates).filter(key => !allowedFields.includes(key));
  if (invalidFields.length > 0) {
    sendError(res, 400, 'INVALID_FIELDS', `Cannot update fields: ${invalidFields.join(', ')}`, { allowedFields });
    return;
  }

  // Validate configuration values
  const validation = validateConfig(updates);
  if (!validation.valid) {
    sendError(res, 400, 'VALIDATION_ERROR', validation.errors.join('; '), { errors: validation.errors });
    return;
  }

  // Read current .env file
  const envPath = path.join(process.cwd(), '.env');
  let envContent = '';
  
  try {
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf-8');
    }
  } catch (error) {
    envContent = '';
  }

  // Parse existing env
  const envLines = envContent.split('\n');
  const envMap = new Map<string, string>();
  
  envLines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key) {
        envMap.set(key.trim(), valueParts.join('=').trim());
      }
    }
  });

  // Update values
  Object.entries(updates).forEach(([key, value]) => {
    envMap.set(key, String(value));
    process.env[key] = String(value);
  });

  // Write back to .env
  const newEnvContent = Array.from(envMap.entries())
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  fs.writeFileSync(envPath, newEnvContent, 'utf-8');

  // Return response with warnings if any
  const responseData: Record<string, unknown> = {
    ...updates,
    warnings: validation.warnings.length > 0 ? validation.warnings : undefined
  };

  sendSuccess(res, responseData, 'Configuration updated successfully. Server restart required for some changes to take effect.');
}));

// Reset configuration to defaults
router.post('/config/reset', adminAuthMiddleware, asyncHandler(async (_req: Request, res: Response) => {
  const defaultEnv = `PORT=3000
NODE_ENV=development
UPLOADS_DIR=./videos/uploads
STREAMS_DIR=./videos/streams
PUBLIC_DIR=./public
LOG_LEVEL=INFO
CORS_ENABLED=true
ALLOWED_ORIGINS=*
MAX_FILE_SIZE=500000000
ALLOWED_FORMATS=mp4,mkv,avi,mov,wmv,flv,webm`;

  const envPath = path.join(process.cwd(), '.env');
  fs.writeFileSync(envPath, defaultEnv, 'utf-8');

  sendSuccess(res, null, 'Configuration reset to defaults. Server restart required.');
}));

// Test configuration (validate without saving)
router.post('/config/test', adminAuthMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const updates = req.body;
  
  const validation = validateConfig(updates);
  
  sendSuccess(res, {
    valid: validation.valid,
    errors: validation.errors,
    warnings: validation.warnings
  }, validation.valid ? 'Configuration is valid' : 'Configuration has errors');
}));

export default router;
