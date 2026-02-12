import { httpService } from "@/services/http.service";
import { LoginRequest, RegisterRequest, AuthResponse, RefreshTokenRequest } from "@/dtos/auth";
import { UserDto } from "@/dtos/user.dto";
import { UserMapper } from "@/mappers/user.mapper";
import { User } from "@/models/user.model";
import { StorageService } from "@/services/storage.service";


class AuthService {
  private serviceBaseUrl = "api/auth";

  async register(request: RegisterRequest): Promise<AuthResponse> {
    const response = await httpService.post<AuthResponse>(
      `${this.serviceBaseUrl}/register`,
      {
        firstName: request.firstName,
        lastName: request.lastName,
        email: request.email,
        password: request.password,
      }
    );

    httpService.setAuthTokens(response);
    
    // Fetch user profile after registration
    await this.getUserProfile();
    
    return response;
  }

  async login(request: LoginRequest): Promise<AuthResponse> {
    const response = await httpService.post<AuthResponse>(`${this.serviceBaseUrl}/login`, {
      email: request.email,
      password: request.password,
    });

    httpService.setAuthTokens(response);
    
    // Fetch user profile after login
    await this.getUserProfile();
    
    return response;
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const request: RefreshTokenRequest = { refreshToken };
    const response = await httpService.post<AuthResponse>(`${this.serviceBaseUrl}/refresh`, request);

    httpService.setAuthTokens(response);
    return response;
  }

  async logout(): Promise<void> {
    httpService.clearAuthTokens();
    this.clearUser();
  }

  async getUserProfile(): Promise<User | null> {
    try {
      const dto = await httpService.get<UserDto>(`${this.serviceBaseUrl}/me`);
      const user = UserMapper.map(dto);
      this.setUser(user);
      return user;
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      return null;
    }
  }

  getAccessToken(): string | null {
    return StorageService.getAccessToken();
  }

  getRefreshToken(): string | null {
    return StorageService.getRefreshToken();
  }

  isAuthenticated(): boolean {
    return StorageService.isAuthenticated();
  }

  /**
   * Check if access token is expired but refresh token is still valid
   */
  needsTokenRefresh(): boolean {
    const accessExpiresAt = StorageService.getAccessTokenExpiresAt();
    const refreshExpiresAt = StorageService.getRefreshTokenExpiresAt();
    
    if (!accessExpiresAt || !refreshExpiresAt) return false;

    const accessExpired = new Date(accessExpiresAt) <= new Date();
    const refreshValid = new Date(refreshExpiresAt) > new Date();

    return accessExpired && refreshValid;
  }

  /**
   * Proactively refresh the token if it's expired or about to expire
   */
  async ensureValidToken(): Promise<boolean> {
    if (!this.needsTokenRefresh()) {
      return this.isAuthenticated();
    }

    const refreshToken = StorageService.getRefreshToken();
    if (!refreshToken) return false;

    try {
      await this.refreshToken(refreshToken);
      return true;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      return false;
    }
  }

  getUser(): User | null {
    const user = StorageService.getUser();
    return user ? JSON.parse(user) : null;
  }

  setUser(user: User): void {
    StorageService.setUser(JSON.stringify(user));
  }

  clearUser(): void {
    StorageService.clearUser();
  }

  hasInterests(): boolean {
    const user = this.getUser();
    return user?.interests != null && user.interests.length > 0;
  }
}

export const authService = new AuthService();
