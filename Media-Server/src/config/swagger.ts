/**
 * Swagger/OpenAPI Configuration
 * Auto-generates API documentation from JSDoc comments
 */

import swaggerJSDoc from 'swagger-jsdoc';
import { Config } from './config';

const config = Config.getInstance();

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'TAIF Media Management System API',
    version: '2.0.0',
    description: `Professional video streaming server with FFmpeg transcoding, multi-quality MP4 streaming, real-time upload progress, and concurrent upload support.

## Authentication
All admin endpoints require JWT authentication. Obtain a token via \`POST /api/auth/login\` and include it as a Bearer token or in the \`token\` cookie.

## Error Codes
| Code | Description |
|------|-------------|
| UPLOAD_FAILED | Video upload failed |
| TRANSCODE_FAILED | Video transcoding failed |
| VIDEO_NOT_FOUND | Requested video does not exist |
| INVALID_FORMAT | Unsupported video format |
| FILE_TOO_LARGE | File exceeds MAX_FILE_SIZE |
| DUPLICATE_ID | Video ID already exists |
| VALIDATION_ERROR | Request validation failed |
| AUTH_FAILED | Authentication failed |
| UNAUTHORIZED | Missing or invalid token |

## Socket.IO Events
Connect to the server root URL for real-time updates:
- \`upload:subscribe\` - Subscribe to upload progress
- \`upload:progress\` - Receive upload progress updates
- \`transcode:progress\` - Receive transcoding progress updates
`,
    contact: {
      name: 'API Support',
      email: 'support@videoserver.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: `http://localhost:${config.getPort()}`,
      description: 'Development server'
    }
  ],
  tags: [
    { name: 'Auth', description: 'Authentication endpoints' },
    { name: 'Videos', description: 'Video upload, list, and streaming' },
    { name: 'Streaming', description: 'Video playback endpoints' },
    { name: 'Config', description: 'Server configuration management' },
    { name: 'Statistics', description: 'Server statistics and metrics' },
    { name: 'Health', description: 'Health check endpoints' },
    { name: 'Logs', description: 'Log file access' }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Authorization header using the Bearer scheme. Example: "Bearer {token}"'
      },
      CookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'token',
        description: 'JWT token stored in HTTP-only cookie'
      }
    },
    schemas: {
      Video: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Unique video identifier',
            example: 'c15d40d9-ab89-4147-ad0d-e2fa04fce11a'
          },
          videoId: {
            type: 'string',
            description: 'Custom video ID if provided',
            example: 'my-custom-video'
          },
          videoName: {
            type: 'string',
            description: 'Custom video name if provided',
            example: 'Product Demo Video'
          },
          filename: {
            type: 'string',
            description: 'Original filename',
            example: 'demo.mp4'
          },
          duration: {
            type: 'number',
            description: 'Video duration in seconds',
            example: 125.5
          },
          filesize: {
            type: 'integer',
            description: 'File size in bytes',
            example: 52428800
          },
          uploadedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Upload timestamp',
            example: '2025-01-23T10:30:00.000Z'
          },
          metadata: {
            $ref: '#/components/schemas/VideoMetadata'
          },
          transcoded: {
            type: 'object',
            description: 'Available transcoded qualities',
            example: {
              '360p': '/streams/video-id/360p.mp4',
              '720p': '/streams/video-id/720p.mp4'
            }
          }
        }
      },
      VideoMetadata: {
        type: 'object',
        properties: {
          width: { type: 'integer', description: 'Video width in pixels', example: 1920 },
          height: { type: 'integer', description: 'Video height in pixels', example: 1080 },
          codec: { type: 'string', description: 'Video codec', example: 'h264' },
          audioCodec: { type: 'string', description: 'Audio codec', example: 'aac' },
          fps: { type: 'number', description: 'Frames per second', example: 30 },
          bitrate: { type: 'integer', description: 'Bitrate in bps', example: 5000000 },
          duration: { type: 'number', description: 'Duration in seconds', example: 125.5 }
        }
      },
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'object', description: 'Response payload' },
          message: { type: 'string', example: 'Operation completed successfully' }
        }
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'array', items: { type: 'object' } },
          pagination: {
            $ref: '#/components/schemas/PaginationMeta'
          }
        }
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 50 },
          totalItems: { type: 'integer', example: 150 },
          totalPages: { type: 'integer', example: 3 },
          hasMore: { type: 'boolean', example: true }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string', example: 'Video not found' },
          code: { type: 'string', example: 'VIDEO_NOT_FOUND' }
        }
      },
      UploadResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              uploadId: { type: 'string', example: 'upload-abc123' },
              videoId: { type: 'string', example: 'c15d40d9-ab89-4147-ad0d-e2fa04fce11a' },
              videoName: { type: 'string', example: 'My Video' },
              filename: { type: 'string', example: 'video.mp4' },
              duration: { type: 'number', example: 125.5 },
              message: { type: 'string', example: 'Upload accepted, transcoding started' }
            }
          }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: { type: 'string', example: 'admin' },
          password: { type: 'string', example: 'password123' }
        }
      },
      LoginResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
              expiresIn: { type: 'string', example: '24h' }
            }
          }
        }
      },
      HealthResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['healthy', 'degraded', 'unhealthy'], example: 'healthy' },
          timestamp: { type: 'string', format: 'date-time' },
          uptime: { type: 'number', description: 'Server uptime in seconds', example: 3600 },
          checks: {
            type: 'object',
            properties: {
              ffmpeg: { type: 'boolean', example: true },
              diskSpace: { type: 'boolean', example: true },
              memory: { type: 'boolean', example: true }
            }
          }
        }
      },
      ConfigResponse: {
        type: 'object',
        properties: {
          PORT: { type: 'integer', example: 3000 },
          NODE_ENV: { type: 'string', example: 'development' },
          LOG_LEVEL: { type: 'string', example: 'info' },
          VIDEO_UPLOAD_DIR: { type: 'string', example: './videos/uploads' },
          VIDEO_STREAM_DIR: { type: 'string', example: './videos/streams' },
          MAX_FILE_SIZE: { type: 'string', example: '5GB' },
          ALLOWED_FORMATS: { type: 'string', example: 'mp4,webm,mov,avi' },
          ENABLE_TRANSCODING: { type: 'boolean', example: true },
          TRANSCODING_PRESETS: { type: 'string', example: '360p,480p,720p,1080p' },
          CORS_ENABLED: { type: 'boolean', example: true },
          ALLOWED_ORIGINS: { type: 'string', example: 'http://localhost:3000' }
        }
      },
      StatisticsResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              uploads: {
                type: 'object',
                properties: {
                  active: { type: 'integer', example: 2 },
                  completed: { type: 'integer', example: 150 },
                  failed: { type: 'integer', example: 3 }
                }
              },
              transcodes: {
                type: 'object',
                properties: {
                  active: { type: 'integer', example: 1 },
                  completed: { type: 'integer', example: 450 },
                  failed: { type: 'integer', example: 5 }
                }
              },
              videos: {
                type: 'object',
                properties: {
                  total: { type: 'integer', example: 150 }
                }
              },
              diskUsage: {
                type: 'object',
                properties: {
                  uploads: { type: 'integer', description: 'Bytes used', example: 5368709120 },
                  streams: { type: 'integer', description: 'Bytes used', example: 10737418240 },
                  total: { type: 'integer', example: 16106127360 }
                }
              },
              uptime: { type: 'number', example: 86400 }
            }
          }
        }
      }
    }
  }
};

const options = {
  swaggerDefinition,
  apis: [
    './src/routes/*.ts',
    './src/server.ts'
  ]
};

export const swaggerSpec = swaggerJSDoc(options);
