import { httpService } from "./http.service";

export interface VideoUploadRequest {
  title?: string;
  description?: string;
  originalFileName?: string;
}

export interface VideoUploadResponse {
  videoAssetId: string;
  uploadUrl: string;
  uploadId?: string;
}

export interface VideoPlaybackInfo {
  id: string;
  playbackId?: string;
  provider: VideoProvider;
  playbackUrl?: string;
  durationInSeconds: number;
  thumbnailUrl?: string;
  title?: string;
  status: VideoAssetStatus;
}

export interface VideoStatus {
  id: string;
  status: VideoAssetStatus;
  errorMessage?: string;
  isReady: boolean;
}

export interface SignedPlaybackToken {
  token: string;
  playbackId: string;
  expiresAt: string;
  expiresInSeconds: number;
  thumbnailToken?: string;
}

export enum VideoProvider {
  Mux = 0,
  CloudflareStream = 1,
  AwsMediaConvert = 2,
}

export enum VideoAssetStatus {
  Pending = 0,
  Processing = 1,
  Ready = 2,
  Failed = 3,
}

class VideoService {
  private readonly basePath = "/api/videos";

  async createUpload(request: VideoUploadRequest): Promise<VideoUploadResponse> {
    return httpService.post<VideoUploadResponse>(`${this.basePath}/create-upload`, request);
  }

  async getVideo(id: string): Promise<VideoPlaybackInfo> {
    return httpService.get<VideoPlaybackInfo>(`${this.basePath}/${id}`);
  }

  async getVideoStatus(id: string): Promise<VideoStatus> {
    return httpService.get<VideoStatus>(`${this.basePath}/${id}/status`);
  }

  /**
   * Get a signed playback token for a video asset.
   * Token is valid for 1 hour and required for signed/private videos.
   */
  async getSignedToken(videoAssetId: string): Promise<SignedPlaybackToken> {
    return httpService.get<SignedPlaybackToken>(`${this.basePath}/${videoAssetId}/token`);
  }

  /**
   * Get a signed playback token using a playback ID directly.
   * Token is valid for 1 hour and required for signed/private videos.
   */
  async getSignedTokenByPlaybackId(playbackId: string): Promise<SignedPlaybackToken> {
    return httpService.get<SignedPlaybackToken>(`${this.basePath}/playback/${playbackId}/token`);
  }

  getStatusLabel(status: VideoAssetStatus): string {
    switch (status) {
      case VideoAssetStatus.Pending:
        return "Pending";
      case VideoAssetStatus.Processing:
        return "Processing";
      case VideoAssetStatus.Ready:
        return "Ready";
      case VideoAssetStatus.Failed:
        return "Failed";
      default:
        return "Unknown";
    }
  }

  getProviderLabel(provider: VideoProvider): string {
    switch (provider) {
      case VideoProvider.Mux:
        return "Mux";
      case VideoProvider.CloudflareStream:
        return "Cloudflare Stream";
      case VideoProvider.AwsMediaConvert:
        return "AWS MediaConvert";
      default:
        return "Unknown";
    }
  }
}

export const videoService = new VideoService();
