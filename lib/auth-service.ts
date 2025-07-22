import axios from "./axios";
import {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  UserDetails,
} from "@/types/auth-service";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(
      "/api/auth/token",
      credentials,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (response.data.access_token) {
      const user = await this.getUserDetails(response.data.access_token);
      return { ...response.data, user };
    } else {
      return response.data;
    }
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>("/api/auth/register", data);
    return response.data;
  },

  async getUserDetails(token?: string): Promise<UserDetails> {
    const headers: any = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios.get<UserDetails>("/api/auth/me", {
      headers,
    });
    return response.data;
  },

  // These methods will be handled by Redux now
  logout(): void {
    // This will be handled by Redux dispatch
  },

  getCurrentUser(): any {
    // This will be handled by Redux selectors
    return null;
  },

  isAuthenticated(): boolean {
    // This will be handled by Redux selectors
    return false;
  },

  isAdmin(): boolean {
    // This will be handled by Redux selectors
    return false;
  },
};
