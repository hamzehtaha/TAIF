import { httpService } from "./httpService";
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenRequest,
} from "@/dtos/auth";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  createdAt?: string;
}

class AuthService {
  private userKey = "auth_user";
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
    return response;
  }

  async login(request: LoginRequest): Promise<AuthResponse> {
    const response = await httpService.post<AuthResponse>("/api/auth/login", {
      email: request.email,
      password: request.password,
    });

    httpService.setAuthTokens(response);
    return response;
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const request: RefreshTokenRequest = { refreshToken };
    const response = await httpService.post<AuthResponse>(
      "/api/auth/refresh",
      request
    );

    httpService.setAuthTokens(response);
    return response;
  }

  async logout(): Promise<void> {
    httpService.clearAuthTokens();
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

    const expiresAt = localStorage.getItem("access_token_expires_at");
    if (!expiresAt) return false;

    return new Date(expiresAt) > new Date();
  }

  async getProfile(): Promise<{ message: string }> {
    return await httpService.get<{ message: string }>("/api/profile");
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
}

export const authService = new AuthService();
