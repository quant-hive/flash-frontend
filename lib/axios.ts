import axios from "axios";
import Cookies from "js-cookie";

// Create axios instance with base URL from environment variables
const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Cookie configuration
const COOKIE_CONFIG = {
  ACCESS_TOKEN: 'access_token',
  EXPIRES_MINUTES: 30,
  SECURE: process.env.NODE_ENV === 'production',
  SAME_SITE: 'strict' as const
};

// Utility functions for cookie management
export const setAccessTokenCookie = (token: string): void => {
  const expiresInDays = COOKIE_CONFIG.EXPIRES_MINUTES / (24 * 60); // Convert to days for js-cookie
  
  Cookies.set(COOKIE_CONFIG.ACCESS_TOKEN, token, {
    expires: expiresInDays,
    secure: COOKIE_CONFIG.SECURE,
    sameSite: COOKIE_CONFIG.SAME_SITE,
    httpOnly: false, // Set to false for client-side access
    path: '/' // Ensure cookie is available across the entire site
  });
  
  console.log(`🍪 Access token cookie set with ${COOKIE_CONFIG.EXPIRES_MINUTES} minute expiry`);
};

export const getAccessTokenFromCookie = (): string | null => {
  if (typeof window === "undefined") return null;
  return Cookies.get(COOKIE_CONFIG.ACCESS_TOKEN) || null;
};

export const removeAccessTokenCookie = (): void => {
  Cookies.remove(COOKIE_CONFIG.ACCESS_TOKEN, {
    path: '/', // Ensure we remove from the same path
    secure: COOKIE_CONFIG.SECURE,
    sameSite: COOKIE_CONFIG.SAME_SITE
  });
  console.log('🗑️ Access token cookie removed');
};

// Check if token is expired (client-side validation)
export const isTokenExpired = (): boolean => {
  const token = getAccessTokenFromCookie();
  if (!token) return true;
  
  // For JWT tokens, we could decode and check exp claim
  // For now, we rely on cookie expiry which browser handles automatically
  // If cookie exists but is expired, browser won't return it
  return false;
};

// Proactive token validation - checks if token exists and is valid
export const validateToken = async (): Promise<boolean> => {
  const token = getAccessTokenFromCookie();
  if (!token) {
    console.log('🚫 No access token found');
    return false;
  }
  
  try {
    // Make a lightweight request to validate token
    const response = await axiosInstance.get('/api/auth/me');
    console.log('✅ Token is valid');
    return true;
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.log('🚫 Token validation failed - 401 Unauthorized');
      removeAccessTokenCookie();
      return false;
    }
    // For other errors, assume token might still be valid
    console.log('⚠️ Token validation request failed, but token might still be valid');
    return true;
  }
};

// Function to get token from cookies
const getTokenFromStorage = (): string | null => {
  return getAccessTokenFromCookie();
};

// Add request interceptor to add Authorization header when token exists
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getTokenFromStorage();
    console.log("🔍 Axios Interceptor Debug:");
    console.log("Token from cookies:", token);
    console.log("Request URL:", config.url);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Authorization header set:", config.headers.Authorization);
    } else {
      console.log("❌ No token found, skipping Authorization header");
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 unauthorized errors - remove expired token and redirect to login
    if (error.response?.status === 401) {
      removeAccessTokenCookie();
      console.log("🚫 401 Unauthorized - Access token removed from cookies");
      
      // Trigger logout through Redux and redirect to login
      if (typeof window !== "undefined") {
        // Dynamically import to avoid circular dependencies
        const { store } = await import("@/lib/store");
        const { logout } = await import("@/lib/store/slices/auth");
        
        // Dispatch logout action to clear Redux state
        store.dispatch(logout());
        
        // Force redirect to login page
        const currentPath = window.location.pathname;
        if (currentPath !== "/login" && currentPath !== "/register") {
          console.log("🔄 Redirecting to login due to expired/invalid token");
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
