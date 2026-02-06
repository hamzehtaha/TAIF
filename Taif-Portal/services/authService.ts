import { httpService } from "./httpService";
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenRequest,
} from "@/dtos/auth";
import { UserDto } from "@/dtos/user/UserDto";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive?: boolean;
  interests?: string[];
}

class AuthService {
  private userKey = "auth_user";

  /**
   * Register a new user
   * POST /api/auth/register
   */
  async register(request: RegisterRequest): Promise<AuthResponse> {
    const response = await httpService.post<AuthResponse>(
      "/api/auth/register",
      {
        firstName: request.firstName,
        lastName: request.lastName,
        email: request.email,
        password: request.password,
      }
    );

    httpService.setAuthTokens(response);
    
    // Fetch user profile after registration
    await this.fetchAndStoreUserProfile();
    
    return response;
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  async login(request: LoginRequest): Promise<AuthResponse> {
    const response = await httpService.post<AuthResponse>("/api/auth/login", {
      email: request.email,
      password: request.password,
    });

    httpService.setAuthTokens(response);
    
    // Fetch user profile after login
    await this.fetchAndStoreUserProfile();
    
    return response;
  }

  /**
   * Refresh access token
   * POST /api/auth/refresh
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const request: RefreshTokenRequest = { refreshToken };
    const response = await httpService.post<AuthResponse>(
      "/api/auth/refresh",
      request
    );

    httpService.setAuthTokens(response);
    return response;
  }

  /**
   * Logout user - clear all tokens and user data
   */
  async logout(): Promise<void> {
    httpService.clearAuthTokens();
    this.clearUser();
  }

  /**
   * Get current user profile from API
   * GET /api/auth/me
   */
  async fetchUserProfile(): Promise<User> {
    const dto = await httpService.get<UserDto>("/api/auth/me");
    return this.mapDtoToUser(dto);
  }

  /**
   * Fetch user profile and store in localStorage
   */
  async fetchAndStoreUserProfile(): Promise<User | null> {
    try {
      const user = await this.fetchUserProfile();
      this.setUser(user);
      return user;
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      return null;
    }
  }

  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
  }

  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("refresh_token");
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    // Check if access token is valid
    const accessExpiresAt = localStorage.getItem("access_token_expires_at");
    if (accessExpiresAt && new Date(accessExpiresAt) > new Date()) {
      return true;
    }

    // Access token expired - check if refresh token is still valid
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    const refreshExpiresAt = localStorage.getItem("refresh_token_expires_at");
    if (refreshExpiresAt && new Date(refreshExpiresAt) > new Date()) {
      // Refresh token is still valid, user can be re-authenticated
      return true;
    }

    return false;
  }

  /**
   * Check if access token is expired but refresh token is still valid
   */
  needsTokenRefresh(): boolean {
    const accessExpiresAt = localStorage.getItem("access_token_expires_at");
    const refreshExpiresAt = localStorage.getItem("refresh_token_expires_at");
    
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

    const refreshToken = this.getRefreshToken();
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
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  setUser(user: User): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  clearUser(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(this.userKey);
  }

  /**
   * Map backend DTO to frontend User model
   */
  private mapDtoToUser(dto: UserDto): User {
    return {
      id: dto.id,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      isActive: dto.isActive,
      interests: dto.interests || [],
    };
  }

  /**
   * Check if user has set their interests
   */
  hasInterests(): boolean {
    const user = this.getUser();
    return user?.interests != null && user.interests.length > 0;
  }
}

export const authService = new AuthService();
