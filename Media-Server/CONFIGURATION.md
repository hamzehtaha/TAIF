# Configuration Guide

This document describes all configuration options for the TAIF Media Management System.

---

## Environment Variables

Configuration is managed through environment variables, typically defined in a `.env` file at the project root.

### Required Variables

These variables **must** be set for the application to start:

| Variable | Description | Example |
|----------|-------------|---------|
| `VIDEO_UPLOAD_DIR` | Directory path for storing uploaded video files | `./videos/uploads` |
| `VIDEO_STREAM_DIR` | Directory path for storing transcoded stream files | `./videos/streams` |

### Optional Variables

These variables have default values and can be customized:

#### Server Configuration

| Variable | Description | Default | Valid Values |
|----------|-------------|---------|--------------|
| `PORT` | HTTP server port | `3000` | Any valid port number |
| `ADMIN_PORT` | Admin server port (if separate) | `3001` | Any valid port number |
| `NODE_ENV` | Environment mode | `development` | `development`, `production`, `test` |
| `LOG_LEVEL` | Logging verbosity | `info` | `error`, `warn`, `info`, `debug` |

#### Video Processing

| Variable | Description | Default | Valid Values |
|----------|-------------|---------|--------------|
| `MAX_FILE_SIZE` | Maximum upload file size in bytes | `5000000000` (5GB) | `1048576` (1MB) to `53687091200` (50GB) |
| `ENABLE_TRANSCODING` | Enable automatic video transcoding | `true` | `true`, `false` |
| `TRANSCODING_PRESETS` | Comma-separated quality presets | `360p,480p,720p,1080p` | Any combination of: `360p`, `480p`, `720p`, `1080p` |
| `ALLOWED_FORMATS` | Comma-separated allowed file extensions | `mp4,mkv,avi,mov,wmv,flv,webm` | Video file extensions |

#### CORS Configuration

| Variable | Description | Default | Valid Values |
|----------|-------------|---------|--------------|
| `CORS_ENABLED` | Enable Cross-Origin Resource Sharing | `true` | `true`, `false` |
| `ALLOWED_ORIGINS` | Allowed CORS origins | `*` | `*` (all) or comma-separated URLs |

#### Security

| Variable | Description | Default | Notes |
|----------|-------------|---------|-------|
| `JWT_SECRET` | Secret key for JWT token signing | `your-secret-key-change-in-production` | **Change in production!** |

---

## Configuration File

### .env File Structure

Create a `.env` file in the project root. Example:

```env
# Server Configuration
NODE_ENV=development
PORT=3000
ADMIN_PORT=3001
LOG_LEVEL=info

# Video Processing
VIDEO_UPLOAD_DIR=./videos/uploads
VIDEO_STREAM_DIR=./videos/streams
MAX_FILE_SIZE=5000000000

# FFmpeg Transcoding Presets
ENABLE_TRANSCODING=true
TRANSCODING_PRESETS=360p,480p,720p,1080p

# Server Settings
CORS_ENABLED=true
ALLOWED_ORIGINS=*

# Security (CHANGE IN PRODUCTION)
JWT_SECRET=your-secret-key-change-in-production
```

### .env.example

The repository includes a `.env.example` file as a template. Copy it to create your configuration:

```bash
cp .env.example .env
```

---

## Configuration Details

### NODE_ENV

Controls the application environment mode.

| Value | Behavior |
|-------|----------|
| `development` | Verbose logging, development features enabled |
| `production` | Optimized performance, reduced logging, secure cookies |
| `test` | Test mode for automated testing |

### LOG_LEVEL

Controls which log messages are output.

| Level | Messages Shown |
|-------|----------------|
| `error` | Only errors |
| `warn` | Errors and warnings |
| `info` | Errors, warnings, and informational messages |
| `debug` | All messages including debug details |

### MAX_FILE_SIZE

Maximum allowed file size for uploads, specified in bytes.

| Size | Bytes Value |
|------|-------------|
| 100 MB | `104857600` |
| 500 MB | `524288000` |
| 1 GB | `1073741824` |
| 5 GB | `5368709120` |
| 10 GB | `10737418240` |

### TRANSCODING_PRESETS

Comma-separated list of quality presets for video transcoding.

| Preset | Resolution | Typical Use |
|--------|------------|-------------|
| `360p` | 640x360 | Mobile data-saver mode |
| `480p` | 854x480 | Standard definition |
| `720p` | 1280x720 | HD streaming |
| `1080p` | 1920x1080 | Full HD streaming |

Example configurations:

```env
# All presets
TRANSCODING_PRESETS=360p,480p,720p,1080p

# Mobile-focused
TRANSCODING_PRESETS=360p,480p

# High-quality only
TRANSCODING_PRESETS=720p,1080p
```

### ALLOWED_ORIGINS

CORS allowed origins for cross-domain requests.

```env
# Allow all origins (development only)
ALLOWED_ORIGINS=*

# Single origin
ALLOWED_ORIGINS=https://myapp.com

# Multiple origins
ALLOWED_ORIGINS=http://localhost:3000,https://myapp.com,https://admin.myapp.com
```

> **Security Note**: Using `*` allows requests from any origin. Specify exact origins in production.

---

## Runtime Configuration

Some configuration values can be modified at runtime through the Admin API without restarting the server.

### Modifiable at Runtime

These fields can be updated via `PUT /api/admin/config`:

| Field | Description |
|-------|-------------|
| `LOG_LEVEL` | Change logging verbosity |
| `CORS_ENABLED` | Enable/disable CORS |
| `ALLOWED_ORIGINS` | Update allowed CORS origins |
| `MAX_FILE_SIZE` | Change upload size limit |
| `ALLOWED_FORMATS` | Change accepted file formats |
| `ENABLE_TRANSCODING` | Enable/disable transcoding |
| `TRANSCODING_PRESETS` | Change quality presets |

### Read-Only at Runtime

These require a server restart to change:

| Field | Reason |
|-------|--------|
| `PORT` | Server binding |
| `NODE_ENV` | Environment mode |
| `VIDEO_UPLOAD_DIR` | Directory paths |
| `VIDEO_STREAM_DIR` | Directory paths |
| `JWT_SECRET` | Security token signing |

---

## Production Recommendations

### Security

```env
NODE_ENV=production
JWT_SECRET=<generate-a-strong-random-secret>
CORS_ENABLED=true
ALLOWED_ORIGINS=https://yourdomain.com
```

Generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Performance

```env
LOG_LEVEL=warn
TRANSCODING_PRESETS=480p,720p,1080p
```

### Storage

Ensure upload and stream directories:
- Have sufficient disk space
- Are on fast storage (SSD recommended for streams)
- Have appropriate file system permissions

---

## Validation Rules

The system validates configuration values:

| Field | Validation |
|-------|------------|
| `MAX_FILE_SIZE` | Must be between 1MB and 50GB |
| `ALLOWED_ORIGINS` | Must be `*` or valid URLs |
| `TRANSCODING_PRESETS` | Must contain at least one valid preset |
| `LOG_LEVEL` | Must be `error`, `warn`, `info`, or `debug` |
| `PORT` | Must be a valid number |

Invalid configurations generate validation errors with descriptive messages.
