// Interfaces for authentication service
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  username: string;
}

export interface AuthResponse {
  access_token: string;
  user: UserDetails;
}

export interface UserDetails {
  id: string;
  email: string;
  name: string;
  role: string;
  username: string;
  is_active: boolean;
  created_at: string;
}
