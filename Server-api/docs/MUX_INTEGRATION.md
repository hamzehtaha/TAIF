# Mux Video Integration Guide

This document describes the Mux video integration architecture for the TAIF learning platform.

## Architecture Overview

The integration follows a **provider pattern** that allows switching video providers (Mux, Cloudflare Stream, AWS MediaConvert) with minimal code changes.

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Admin Portal   │     │    Backend      │     │      Mux        │
│   (Next.js)     │     │   (.NET Core)   │     │     (API)       │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ VideoUploader   │────▶│ POST /videos/   │────▶│ Create Direct   │
│ Component       │     │ create-upload   │     │ Upload URL      │
│                 │◀────│                 │◀────│                 │
│                 │     │                 │     │                 │
│ Direct Upload   │─────────────────────────────▶│ PUT Upload URL  │
│ to Mux          │     │                 │     │                 │
│                 │     │                 │     │                 │
│                 │     │ POST /videos/   │◀────│ Webhook:        │
│                 │     │ webhook         │     │ asset.ready     │
└─────────────────┘     └─────────────────┘     └─────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Student Portal  │     │    Backend      │     │      Mux        │
│   (Next.js)     │     │   (.NET Core)   │     │    (Stream)     │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ VideoPlayer     │────▶│ GET /videos/{id}│     │                 │
│ Component       │◀────│ (playback_id)   │     │                 │
│                 │     │                 │     │                 │
│ Mux Player      │─────────────────────────────▶│ HLS Stream      │
│ (Web Component) │◀────────────────────────────│                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Backend Components

### 1. Video Provider Abstraction

**Interface:** `IVideoProvider` (`TAIF.Application/Interfaces/Services/IVideoProvider.cs`)

```csharp
public interface IVideoProvider
{
    Task<ProviderUploadResult> CreateDirectUploadAsync(string? correlationId = null);
    Task<ProviderAssetInfo?> GetAssetInfoAsync(string assetId);
    string GeneratePlaybackUrl(string playbackId);
    string GenerateThumbnailUrl(string playbackId, int? width = null, int? height = null, double? time = null);
    bool ValidateWebhookSignature(string payload, string signature, string webhookSecret);
    Task<ProviderAssetInfo?> ParseWebhookEventAsync(string payload);
}
```

### 2. Mux Provider Implementation

**Class:** `MuxVideoProvider` (`TAIF.Infrastructure/Services/MuxVideoProvider.cs`)

Implements the `IVideoProvider` interface with Mux-specific API calls.

### 3. Video Asset Entity

**Entity:** `VideoAsset` (`TAIF.Domain/Entities/VideoAsset.cs`)

| Field | Type | Description |
|-------|------|-------------|
| Id | Guid | Primary key |
| LessonItemId | Guid? | Link to lesson item |
| Provider | VideoProvider | Mux, CloudflareStream, or AwsMediaConvert |
| ProviderUploadId | string? | Mux upload ID |
| ProviderAssetId | string? | Mux asset ID |
| ProviderPlaybackId | string? | Mux playback ID |
| DurationInSeconds | double | Video duration |
| ThumbnailUrl | string? | Generated thumbnail URL |
| Status | VideoAssetStatus | Pending, Processing, Ready, Failed |
| Title | string? | Video title |
| Description | string? | Video description |
| OriginalFileName | string? | Original file name |
| ErrorMessage | string? | Error message if failed |
| ProcessedAt | DateTime? | When processing completed |

### 4. API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/videos/create-upload` | POST | ContentCreatorOrAbove | Create Mux direct upload URL |
| `/api/videos/webhook` | POST | Anonymous | Receive Mux webhooks |
| `/api/videos/{id}` | GET | Authorized | Get video playback info |
| `/api/videos/by-lesson-item/{lessonItemId}` | GET | Authorized | Get video by lesson item |
| `/api/videos/{id}/status` | GET | Authorized | Get video processing status |

## Configuration

### Environment Variables

Add these to your `appsettings.json` or environment:

```json
{
  "Mux": {
    "TokenId": "YOUR_MUX_TOKEN_ID",
    "TokenSecret": "YOUR_MUX_TOKEN_SECRET",
    "WebhookSecret": "YOUR_MUX_WEBHOOK_SECRET"
  }
}
```

### Getting Mux Credentials

1. Sign up at [mux.com](https://mux.com)
2. Go to Settings → API Access Tokens
3. Create a new token with Video permissions
4. Copy the Token ID and Token Secret
5. Go to Settings → Webhooks
6. Add a webhook endpoint: `https://your-api-domain/api/videos/webhook`
7. Copy the Webhook Signing Secret

## Frontend Components

### Installation

Install the Mux Player package in your Next.js project:

```bash
npm install @mux/mux-player @mux/mux-player-react
# or
pnpm add @mux/mux-player @mux/mux-player-react
```

### VideoUploader Component

For admin/instructor use - allows direct upload to Mux:

```tsx
import { VideoUploader } from "@/components/video";

<VideoUploader
  lessonItemId="lesson-item-uuid"
  title="My Video"
  onUploadComplete={(videoAssetId) => {
    console.log("Upload complete:", videoAssetId);
  }}
  onUploadError={(error) => {
    console.error("Upload failed:", error);
  }}
/>
```

### VideoPlayer Component

For student use - plays videos using Mux Player:

```tsx
import { VideoPlayer } from "@/components/video";

// By video ID
<VideoPlayer
  videoId="video-asset-uuid"
  onTimeUpdate={(currentTime, duration) => {
    console.log("Progress:", currentTime / duration * 100);
  }}
  onEnded={() => {
    console.log("Video finished");
  }}
/>

// By lesson item ID
<VideoPlayer
  lessonItemId="lesson-item-uuid"
/>

// Direct playback ID (if known)
<VideoPlayer
  playbackId="mux-playback-id"
  autoPlay
  muted
/>
```

## Upload Flow

1. **Admin clicks upload** → Frontend calls `POST /videos/create-upload`
2. **Backend creates VideoAsset** → Calls Mux API → Returns upload URL
3. **Frontend uploads directly to Mux** → PUT request to upload URL
4. **Mux processes video** → Sends webhook to `/videos/webhook`
5. **Backend updates VideoAsset** → Sets playbackId, duration, thumbnail, status=Ready

## Switching Providers

To switch from Mux to another provider:

1. Create a new provider class implementing `IVideoProvider`
2. Update DI registration in `Program.cs`:
   ```csharp
   // Replace MuxVideoProvider with your new provider
   builder.Services.AddHttpClient<IVideoProvider, CloudflareVideoProvider>();
   ```
3. Update configuration section name if needed
4. The VideoAssetService and frontend components work without changes

## Database Migration

After adding the VideoAsset entity, run:

```bash
dotnet ef migrations add AddVideoAsset
dotnet ef database update
```

Or the migration will auto-apply on startup if configured.

## Webhook Security

The Mux webhook endpoint validates signatures using HMAC-SHA256:

1. Mux sends `Mux-Signature` header with `t=timestamp,v1=signature`
2. Backend computes signature from `timestamp.payload` using webhook secret
3. Request is rejected if signatures don't match

## Thumbnail Generation

Thumbnails are automatically generated by Mux. The URL format:
```
https://image.mux.com/{playback_id}/thumbnail.jpg?width=640&height=360&time=10
```

Parameters:
- `width` / `height`: Image dimensions
- `time`: Frame time in seconds
