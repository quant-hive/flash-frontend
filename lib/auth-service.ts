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

    // Store the token in localStorage
    if (response.data.access_token) {
      localStorage.setItem("accessToken", response.data.access_token);
      // localStorage.setItem('user', JSON.stringify(response.data.user));
      const user = await this.getUserDetails();
      localStorage.setItem("user", JSON.stringify(user));
      return { ...response.data, user };
    } else {
      return response.data;
    }
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>("/api/auth/register", data);

    // Store the token in localStorage
    if (response.data.access_token) {
      localStorage.setItem("accessToken", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response.data;
  },

  async getUserDetails(): Promise<UserDetails> {
    const response = await axios.get<UserDetails>("/api/auth/me");
    return response.data;
  },

  logout(): void {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  },

  getCurrentUser(): any {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem("accessToken");
  },

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user && user.role === "admin";
  },
};
