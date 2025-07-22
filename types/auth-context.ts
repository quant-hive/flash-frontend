// Interface for the authentication context shape
export interface AuthContextType {
  user: any | null; // The current user object or null if not authenticated
  isLoading: boolean; // Whether authentication state is being determined
  isAuthenticated: boolean; // True if a user is logged in
  isAdmin: boolean; // True if the user has admin privileges
  login: (
    credentials: import("@/types/auth-service").LoginCredentials
  ) => Promise<import("@/types/auth-service").AuthResponse>; // Login function
  register: (
    data: import("@/types/auth-service").RegisterData
  ) => Promise<import("@/types/auth-service").AuthResponse>; // Register function
  logout: () => void; // Logout function
}
