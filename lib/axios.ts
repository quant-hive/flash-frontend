import axios from "axios";
import localforage from "localforage";

// Create axios instance with base URL from environment variables
const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Function to get token from Redux persist storage using localForage
const getTokenFromStorage = async (): Promise<string | null> => {
  if (typeof window === "undefined") return null;

  try {
    const persistedState = await localforage.getItem<string>("persist:root");
    if (!persistedState) return null;

    const parsedState = JSON.parse(persistedState);
    if (!parsedState.auth) return null;

    const authState = JSON.parse(parsedState.auth);
    return authState.accessToken || null;
  } catch (error) {
    console.error("Error getting token from localForage:", error);
    return null;
  }
};

// Add request interceptor to add Authorization header when token exists
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await getTokenFromStorage();
    console.log("🔍 Axios Interceptor Debug:");
    console.log("Token from localForage:", token);
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

    // Add refresh token logic here if needed

    return Promise.reject(error);
  }
);

export default axiosInstance;
