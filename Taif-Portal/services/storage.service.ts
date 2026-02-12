import { AuthResponse } from "@/dtos/auth";
import { LocalStorageService } from "@/services/local-storage.service";

export class StorageService {
    
    static getUser(): string | null {
        return LocalStorageService.get("auth_user");
    }

    static setUser(user: string): void {
        LocalStorageService.set("auth_user", user);
    }

    static clearUser(): void {
        LocalStorageService.remove("auth_user");
    }

    static getAccessToken(): string | null {
        return LocalStorageService.getString("access_token");
    }

    static getRefreshToken(): string | null {
        return LocalStorageService.getString("refresh_token");
    }

    static getAccessTokenExpiresAt(): string {
        return LocalStorageService.getString("access_token_expires_at") || "";
    }

    static getRefreshTokenExpiresAt(): string {
        return LocalStorageService.getString("refresh_token_expires_at") || "";
    }

    static clearTokens(): void {
        LocalStorageService.remove("access_token");
        LocalStorageService.remove("refresh_token");
        LocalStorageService.remove("access_token_expires_at");
        LocalStorageService.remove("refresh_token_expires_at");
    }

    static setTokens(authResponse: AuthResponse): void {
        LocalStorageService.setString("access_token", authResponse.accessToken);
        LocalStorageService.setString("refresh_token", authResponse.refreshToken);
        LocalStorageService.setString("access_token_expires_at", authResponse.accessTokenExpiresAt);
        LocalStorageService.setString("refresh_token_expires_at", authResponse.refreshTokenExpiresAt);
    }

    static isAuthenticated(): boolean {
        const token = StorageService.getAccessToken();
        if (!token) return false;

        // Check if access token is valid
        const accessExpiresAt = StorageService.getAccessTokenExpiresAt();
        if (accessExpiresAt && new Date(accessExpiresAt) > new Date()) {
            return true;
        }

        // Access token expired - check if refresh token is still valid
        const refreshToken = StorageService.getRefreshToken();
        if (!refreshToken) return false;

        const refreshExpiresAt = StorageService.getRefreshTokenExpiresAt();
        if (refreshExpiresAt && new Date(refreshExpiresAt) > new Date()) {
            // Refresh token is still valid, user can be re-authenticated
            return true;
        }

        return false;
    }
}