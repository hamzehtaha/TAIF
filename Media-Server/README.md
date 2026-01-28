# TAIF Media Management System

A professional video streaming server built with Node.js and TypeScript, featuring FFmpeg transcoding, multi-quality MP4 streaming, and real-time progress tracking via Socket.IO.

## Project Overview

### What It Does

TAIF Media Management System is a complete backend solution for video processing and streaming. It handles:

- **Video Upload**: Accept video files in multiple formats (MP4, MKV, AVI, MOV, WMV, FLV, WebM)
- **Video Transcoding**: Automatically transcode videos to multiple quality presets (360p, 480p, 720p, 1080p) using FFmpeg
- **Video Streaming**: Serve transcoded videos with HTTP range support for seamless seeking
- **Real-time Progress**: Track upload and transcoding progress via WebSocket (Socket.IO)
- **Admin Portal**: Web-based admin interface for managing videos and monitoring system status

### Problem It Solves

Modern video delivery requires adaptive streaming to accommodate users on different devices and network conditions. This system solves the complexity of:

1. **Multi-quality encoding** - Automatically transcodes uploads to multiple resolutions
2. **Efficient delivery** - HTTP range support enables seeking without downloading entire files
3. **Progress visibility** - Real-time updates for long-running transcoding operations
4. **Resource management** - Tracks disk usage, active streams, and system health

### Who It's For

- **Content platforms** requiring self-hosted video infrastructure
- **Development teams** building video-enabled applications
- **Organizations** needing control over their media processing pipeline
- **Developers** learning video streaming backend architecture

---

## Architecture / High-Level Design

### Key Components

`
┌─────────────────────────────────────────────────────────────────────┐
│                        Express HTTP Server                          │
├─────────────┬─────────────┬─────────────┬─────────────┬────────────┤
│   Video     │   Stream    │    Auth     │   Config    │   Admin    │
│   Routes    │   Routes    │   Routes    │   Routes    │   Routes   │
└──────┬──────┴──────┬──────┴──────┬──────┴──────┬──────┴─────┬──────┘
       │             │             │             │            │
       ▼             ▼             ▼             ▼            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          Service Layer                              │
├─────────────┬─────────────┬─────────────┬─────────────┬────────────┤
│   Video     │   Socket    │    Auth     │  Statistics │   Health   │
│  Processor  │   Service   │   Service   │   Service   │  Service   │
└──────┬──────┴──────┬──────┴─────────────┴─────────────┴────────────┘
       │             │
       ▼             ▼
┌─────────────┐ ┌─────────────┐
│   FFmpeg    │ │  Socket.IO  │
│ (Transcode) │ │ (Real-time) │
└─────────────┘ └─────────────┘
`

### Component Interactions

1. **Client uploads video** → Upload Middleware validates file → Video Routes handle request
2. **Video Routes** → Video Processor extracts metadata → Starts FFmpeg transcoding
3. **During transcoding** → Socket Service emits progress events to connected clients
4. **Client requests stream** → Stream Routes serve MP4 with HTTP range support
5. **Admin actions** → Auth Middleware verifies JWT → Admin routes handle requests
6. **Health monitoring** → Health Service checks FFmpeg, disk space, memory

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Runtime** | Node.js (>= 14.0.0) |
| **Language** | TypeScript 5.3 |
| **Web Framework** | Express 4.18 |
| **Video Processing** | FFmpeg via fluent-ffmpeg |
| **Real-time** | Socket.IO 4.8 |
| **Authentication** | JWT (jsonwebtoken) + bcrypt |
| **API Documentation** | Swagger (swagger-jsdoc + swagger-ui-express) |
| **Logging** | Winston with daily rotation |
| **Testing** | Jest + Supertest |
| **Package Manager** | npm |

---

## Key Features

- **Multi-Format Upload**: Supports MP4, MKV, AVI, MOV, WMV, FLV, WebM
- **Adaptive Quality**: Automatic transcoding to 360p, 480p, 720p, 1080p
- **HTTP Range Support**: Enables seeking and partial content delivery
- **Real-time Progress**: Socket.IO events for upload and transcoding progress
- **JWT Authentication**: Secure admin endpoints with HTTP-only cookies
- **Swagger API Docs**: Interactive API documentation at `/api-docs`
- **Health Monitoring**: Kubernetes-ready health, readiness, and liveness probes
- **Graceful Shutdown**: Completes in-flight requests before shutdown
- **Disk Usage Tracking**: Monitors storage consumption
- **Auto Video Discovery**: Scans existing videos on startup

---

## Project Structure

`
Streaming Server/
├── src/                      # TypeScript source code
│   ├── server.ts             # Application entry point
│   ├── config/
│   │   ├── config.ts         # Centralized configuration
│   │   └── swagger.ts        # Swagger/OpenAPI setup
│   ├── middleware/
│   │   ├── authMiddleware.ts # JWT authentication
│   │   ├── errorHandler.ts   # Global error handling
│   │   └── uploadMiddleware.ts # Multer file upload
│   ├── routes/
│   │   ├── videoRoutes.ts    # Video CRUD operations
│   │   ├── streamRoutes.ts   # MP4 streaming
│   │   ├── authRoutes.ts     # Login/logout
│   │   ├── configRoutes.ts   # Runtime configuration
│   │   ├── logsRoutes.ts     # Log viewing
│   │   └── statisticsRoutes.ts # System metrics
│   ├── services/
│   │   ├── videoProcessor.ts # FFmpeg transcoding
│   │   ├── socketService.ts  # Real-time events
│   │   ├── authService.ts    # Authentication logic
│   │   ├── healthService.ts  # Health checks
│   │   ├── statisticsService.ts # Metrics tracking
│   │   ├── cleanupService.ts # Cleanup scheduler
│   │   ├── diskUsageService.ts # Storage monitoring
│   │   └── shutdownManager.ts # Graceful shutdown
│   ├── types/
│   │   └── index.ts          # TypeScript interfaces
│   └── utils/
│       ├── logger.ts         # Logging utility
│       ├── winstonLogger.ts  # Winston configuration
│       ├── fileUtil.ts       # File operations
│       ├── validator.ts      # Input validation
│       └── apiResponse.ts    # Response formatting
├── public/                   # Static frontend files
│   ├── admin.html            # Admin portal
│   ├── login.html            # Login page
│   ├── player.html           # Video player
│   └── index.html            # Home page
├── videos/
│   ├── uploads/              # Original uploaded files
│   └── streams/              # Transcoded MP4 files
├── logs/                     # Application logs
├── dist/                     # Compiled JavaScript
├── tests/                    # Jest test files
├── .env                      # Environment variables
├── .env.example              # Environment template
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── jest.config.js            # Jest configuration
`

---

## Quick Start

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create environment file** (⚠️ Required)
   ```bash
   # Windows
   Copy-Item .env.example .env
   
   # macOS/Linux
   cp .env.example .env
   ```
   
   Edit `.env` and change `JWT_SECRET` to a secure random string.

3. **Run the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm run build
   npm start
   ```

For detailed installation and configuration, see [QUICK_START.md](QUICK_START.md).

---

## Configuration

For environment variables and configuration options, see [CONFIGURATION.md](CONFIGURATION.md).

---

## API Overview

The API is organized into the following endpoint groups:

| Category | Base Path | Description |
|----------|-----------|-------------|
| **Videos** | `/api` | Upload, list, get, delete videos |
| **Streaming** | `/stream` | Serve transcoded MP4 files |
| **Authentication** | `/api/auth` | Login, logout, token verification |
| **Administration** | `/api/admin` | Logs, configuration, statistics |
| **System** | `/` | Health, readiness, liveness probes |

For complete endpoint documentation, see the [Available API Endpoints](QUICK_START.md#available-api-endpoints) section in QUICK_START.md.

Interactive API documentation is available at `http://localhost:3000/api-docs` when the server is running.

---

## License

MIT License
