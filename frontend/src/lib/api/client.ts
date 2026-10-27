export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
  requestId: string;
  timestamp: string;
}

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;
  requestId: string;

  constructor(status: number, message: string, code = "API_ERROR", details?: unknown, requestId = "") {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.requestId = requestId || `req_${Math.random().toString(36).substring(2, 9)}`;
  }
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const requestId = `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
    const url = `${this.baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Request-Id": requestId,
      ...(options.headers as Record<string, string>),
    };

    try {
      // In standalone frontend prototype / mock mode, we gracefully wrap responses
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: response.statusText };
        }

        switch (response.status) {
          case 401:
            throw new ApiError(401, errorData.message || "Authentication required. Please sign in.", "UNAUTHORIZED", errorData, requestId);
          case 403:
            throw new ApiError(403, errorData.message || "Access denied. Insufficient permissions.", "FORBIDDEN", errorData, requestId);
          case 404:
            throw new ApiError(404, errorData.message || "Requested resource could not be found.", "NOT_FOUND", errorData, requestId);
          case 409:
            throw new ApiError(409, errorData.message || "Resource conflict. Please refresh.", "CONFLICT", errorData, requestId);
          case 422:
            throw new ApiError(422, errorData.message || "Validation failed. Please verify input.", "UNPROCESSABLE_ENTITY", errorData, requestId);
          case 429:
            throw new ApiError(429, errorData.message || "Too many requests. Please slow down.", "RATE_LIMITED", errorData, requestId);
          case 500:
          default:
            throw new ApiError(response.status || 500, errorData.message || "Internal server error.", "SERVER_ERROR", errorData, requestId);
        }
      }

      const json = await response.json();
      return {
        data: json,
        status: response.status,
        requestId,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      if (err instanceof ApiError) {
        throw err;
      }
      throw new ApiError(500, (err as Error).message || "Network error", "NETWORK_ERROR", null, requestId);
    }
  }

  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET", headers });
  }

  async post<T>(endpoint: string, body?: unknown, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  async put<T>(endpoint: string, body?: unknown, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  async patch<T>(endpoint: string, body?: unknown, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE", headers });
  }
}

export const apiClient = new ApiClient();
