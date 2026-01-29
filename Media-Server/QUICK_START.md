# Quick Start Guide

This guide helps developers get the TAIF Media Management System running quickly.

---

## Prerequisites

### Required Software

| Software | Minimum Version | Purpose |
|----------|-----------------|---------|
| **Node.js** | 14.0.0 | JavaScript runtime |
| **npm** | 6.0.0 | Package manager |
| **FFmpeg** | 4.0+ | Video transcoding |

### System Requirements

- **OS**: Windows, macOS, or Linux
- **RAM**: 4GB minimum (8GB+ recommended for concurrent transcoding)
- **Disk**: Sufficient space for video storage (uploads + transcoded files)

### Verify FFmpeg Installation

FFmpeg must be installed and accessible in your system PATH:

```bash
ffmpeg -version
```

If not installed:
- **Windows**: Download from [ffmpeg.org](https://ffmpeg.org/download.html) and add to PATH
- **macOS**: `brew install ffmpeg`
- **Linux**: `sudo apt install ffmpeg` or equivalent

---

## Installation

### 1. Clone or Navigate to Project

```bash
cd "Streaming Server"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

**IMPORTANT**: Create your local environment file from the template:

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# macOS/Linux
cp .env.example .env
```

Then edit `.env` and update these critical settings:

- `JWT_SECRET` - **MUST CHANGE** to a strong random string for security
- `VIDEO_UPLOAD_DIR` - Directory for uploaded files (default: `videos/uploads`)
- `VIDEO_STREAM_DIR` - Directory for transcoded files (default: `videos/streams`)
- `PORT` - Server port (default: `3000`)

> **Note**: The `.env` file is git-ignored for security. Each developer/environment needs their own `.env` file created from `.env.example`.

See [CONFIGURATION.md](CONFIGURATION.md) for all available environment variables.

### 4. Create Required Directories

The server creates these automatically on first run, but you can create them manually:

```bash
mkdir -p videos/uploads videos/streams
```

---

## Running the Project

### Development Mode

Runs with hot-reload using nodemon and ts-node:

```bash
npm run dev
```

### Production Mode

Build TypeScript and run compiled JavaScript:

```bash
npm run build
npm start
```

### Build Only

Compile TypeScript to JavaScript without running:

```bash
npm run build
```

### Run Tests

```bash
npm test
```

With coverage:

```bash
npm run test:coverage
```

---

## Verify Server is Running

After starting, you should see:

```
TAIF Media Management System Started
Environment: development
Server: http://localhost:3000
API Docs: http://localhost:3000/api-docs
Admin Portal: http://localhost:3000/admin
```

Access these URLs to verify:

| URL | Purpose |
|-----|---------|
| http://localhost:3000/health | Health check endpoint |
| http://localhost:3000/api-docs | Swagger API documentation |
| http://localhost:3000/admin | Admin portal (requires login) |
| http://localhost:3000/player | Video player |

---

## Available API Endpoints

### Video Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload` | Upload a video file (multipart/form-data with `video` field) |
| `GET` | `/api/videos` | List all videos with pagination |
| `GET` | `/api/video/:videoId` | Get details for a specific video |
| `DELETE` | `/api/video/:videoId` | Delete a video and all associated files |
| `GET` | `/api/video-ids` | Get list of all video IDs |
| `POST` | `/api/refresh-cache` | Refresh in-memory video cache from disk |
| `POST` | `/api/regenerate/:videoId` | Regenerate metadata for a video |
| `GET` | `/api/stats` | Get video statistics |
| `GET` | `/api/health` | Video API health check |

### Video Streaming

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/stream/:videoId/:quality.mp4` | Stream transcoded video (supports HTTP Range) |

Quality options: `360p`, `480p`, `720p`, `1080p`

Example: `GET /stream/abc123/720p.mp4`

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Authenticate with username/password |
| `GET` | `/api/auth/verify` | Verify current token is valid |
| `POST` | `/api/auth/change-password` | Change admin password |
| `POST` | `/api/auth/logout` | Clear authentication token |

Default credentials:
- Username: `admin`
- Password: `admin`

### Administration (Requires Authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/logs` | Get application logs |
| `DELETE` | `/api/admin/logs` | Clear all logs |
| `GET` | `/api/admin/logs/levels` | Get available log levels |
| `GET` | `/api/admin/config` | Get current configuration |
| `PUT` | `/api/admin/config` | Update configuration values |
| `POST` | `/api/admin/config/reset` | Reset configuration to defaults |
| `POST` | `/api/admin/config/test` | Validate configuration without saving |
| `GET` | `/api/admin/statistics` | Get comprehensive system statistics |

### System Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Comprehensive health check (FFmpeg, disk, memory) |
| `GET` | `/ready` | Kubernetes readiness probe |
| `GET` | `/live` | Kubernetes liveness probe |
| `GET` | `/api/system/shutdown-status` | Get graceful shutdown status |

---

## Upload Example

### Using cURL

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "video=@/path/to/video.mp4" \
  -F "videoName=My Video Title"
```

### Using JavaScript (fetch)

```javascript
const formData = new FormData();
formData.append('video', fileInput.files[0]);
formData.append('videoName', 'My Video Title');

const response = await fetch('http://localhost:3000/api/upload', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result.data.streams.variants);
```

---

## Real-time Progress (Socket.IO)

Connect to receive upload and transcoding progress:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('upload:progress', (data) => {
  console.log(`Upload: ${data.percent}%`);
});

socket.on('transcode:progress', (data) => {
  console.log(`Transcoding ${data.preset}: ${data.progress}%`);
});

socket.on('transcode:complete', (data) => {
  console.log('All transcoding complete:', data);
});
```

---

## Troubleshooting

### FFmpeg Not Found

Ensure FFmpeg is in your system PATH:

```bash
which ffmpeg  # Linux/macOS
where ffmpeg  # Windows
```

### Port Already in Use

Change the port in `.env`:

```env
PORT=3001
```

### Upload Fails with Large Files

Increase `MAX_FILE_SIZE` in `.env` (in bytes):

```env
MAX_FILE_SIZE=10000000000  # 10GB
```

### CORS Errors

Enable CORS and set allowed origins in `.env`:

```env
CORS_ENABLED=true
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```
