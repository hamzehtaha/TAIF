import { AuthResponse, RefreshTokenRequest } from "@/dtos/auth";
import { setCookie, getCookie, deleteCookie } from "@/lib/cookies";

interface RequestOptions extends RequestInit {
  baseURL?: string;
  skipAuth?: boolean;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

interface BackendApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
  errors: string[];
  errorCode?: any;
}

const PUBLIC_ENDPOINTS = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
];

class HttpService {
  private baseURL: string;
  private isRefreshing: boolean = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor(baseURL?: string) {
    if (baseURL) {
      this.baseURL = baseURL;
    } else if (typeof window !== "undefined") {
      this.baseURL = (window as any).ENV?.NEXT_PUBLIC_API_URL || "https://localhost:7277";
    } else {
      this.baseURL = "https://localhost:7277";
    }
  }

  private isPublicEndpoint(endpoint: string): boolean {
    return PUBLIC_ENDPOINTS.some((publicEndpoint) =>
      endpoint.includes(publicEndpoint)
    );
  }

  private getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
  }

  private getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("refresh_token");
  }

  private setTokens(authResponse: AuthResponse): void {
    if (typeof window === "undefined") return;
    
    localStorage.setItem("access_token", authResponse.accessToken);
    localStorage.setItem("refresh_token", authResponse.refreshToken);
    localStorage.setItem(
      "access_token_expires_at",
      authResponse.accessTokenExpiresAt
    );
    localStorage.setItem(
      "refresh_token_expires_at",
      authResponse.refreshTokenExpiresAt
    );
    
    setCookie("access_token", authResponse.accessToken, 7);
    setCookie("refresh_token", authResponse.refreshToken, 30);
  }

  private clearTokens(): void {
    if (typeof window === "undefined") return;
    
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("access_token_expires_at");
    localStorage.removeItem("refresh_token_expires_at");
    
    deleteCookie("access_token");
    deleteCookie("refresh_token");
  }

  private onRefreshed(token: string): void {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  private addRefreshSubscriber(callback: (token: string) => void): void {
    this.refreshSubscribers.push(callback);
  }

  private async refreshAccessToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.clearTokens();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return null;
    }

    try {
      const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken } as RefreshTokenRequest),
      });

      if (!response.ok) {
        throw new Error("Refresh token failed");
      }

      const authResponse: AuthResponse = await response.json();
      this.setTokens(authResponse);
      return authResponse.accessToken;
    } catch (error) {
      console.error("Token refresh failed:", error);
      this.clearTokens();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = `${options.baseURL || this.baseURL}${endpoint}`;
    const isPublic = this.isPublicEndpoint(endpoint) || options.skipAuth;

    let headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (!isPublic) {
      const token = this.getAccessToken();
      if (token) {
        headers = {
          ...headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401 && !isPublic) {
        if (!this.isRefreshing) {
          this.isRefreshing = true;
          const newToken = await this.refreshAccessToken();
          this.isRefreshing = false;

          if (newToken) {
            this.onRefreshed(newToken);
            headers = {
              ...headers,
              Authorization: `Bearer ${newToken}`,
            };

            const retryResponse = await fetch(url, {
              ...options,
              headers,
            });

            if (retryResponse.ok) {
              const data = await retryResponse.json();
              return {
                data,
                status: retryResponse.status,
                statusText: retryResponse.statusText,
              };
            }
          }
        } else {
          return new Promise((resolve, reject) => {
            this.addRefreshSubscriber((token: string) => {
              headers = {
                ...headers,
                Authorization: `Bearer ${token}`,
              };

              fetch(url, {
                ...options,
                headers,
              })
                .then(async (retryResponse) => {
                  if (retryResponse.ok) {
                    const data = await retryResponse.json();
                    resolve({
                      data,
                      status: retryResponse.status,
                      statusText: retryResponse.statusText,
                    });
                  } else {
                    reject(
                      new Error(
                        `HTTP ${retryResponse.status}: ${retryResponse.statusText}`
                      )
                    );
                  }
                })
                .catch(reject);
            });
          });
        }
      }

      let data: T;

      if (response.ok) {
        try {
          const jsonResponse = await response.json();
          // Check if response is wrapped in BackendApiResponse
          if (jsonResponse && typeof jsonResponse === 'object' && 'isSuccess' in jsonResponse && 'data' in jsonResponse) {
            const backendResponse = jsonResponse as BackendApiResponse<T>;
            if (!backendResponse.isSuccess) {
              throw new Error(backendResponse.message || 'Request failed');
            }
            data = backendResponse.data;
          } else {
            data = jsonResponse as T;
          }
        } catch (error) {
          if (error instanceof Error && error.message !== 'Request failed') {
            data = {} as T;
          } else {
            throw error;
          }
        }
      } else {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      return {
        data,
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error) {
      console.error(`API Error: ${endpoint}`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const response = await this.request<T>(endpoint, {
      ...options,
      method: "GET",
    });
    return response.data;
  }

  async post<T>(
    endpoint: string,
    data: unknown,
    options?: RequestOptions
  ): Promise<T> {
    const response = await this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async put<T>(
    endpoint: string,
    data: unknown,
    options?: RequestOptions
  ): Promise<T> {
    const response = await this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const response = await this.request<T>(endpoint, {
      ...options,
      method: "DELETE",
    });
    return response.data;
  }

  setAuthTokens(authResponse: AuthResponse): void {
    this.setTokens(authResponse);
  }

  clearAuthTokens(): void {
    this.clearTokens();
  }
}

export const httpService = new HttpService();
