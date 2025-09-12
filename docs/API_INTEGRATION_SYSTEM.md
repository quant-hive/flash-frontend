# API Integration System Documentation

This document provides comprehensive documentation for the API integration mechanisms in the Flash Frontend application, covering service layers, error handling, and data management.

## Table of Contents

- [API Integration System Documentation](#api-integration-system-documentation)
  - [Table of Contents](#table-of-contents)
  - [Architecture Overview](#architecture-overview)
  - [Service Layer Structure](#service-layer-structure)
  - [HTTP Client Configuration](#http-client-configuration)
  - [Authentication Integration](#authentication-integration)
  - [Error Handling](#error-handling)
  - [Data Transformation](#data-transformation)
  - [Caching and Performance](#caching-and-performance)
  - [Type Safety](#type-safety)
  - [Usage Examples](#usage-examples)

## Architecture Overview

The API integration system follows a layered architecture pattern:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Components    │────│  Custom Hooks   │────│  Service Layer  │
│   (UI Layer)    │    │  (Logic Layer)  │    │  (API Layer)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐               │
         │              │   Error Handler │               │
         │              │   (Centralized) │               │
         │              └─────────────────┘               │
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   HTTP Client   │
                    │   (Axios)       │
                    └─────────────────┘
```

## Service Layer Structure

### API Service (Facade Pattern)

**Location**: `lib/api-service.ts`

Central API facade that provides high-level methods:

```typescript
export class ApiService {
  // Authentication methods
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return authService.login(credentials);
  }

  static async register(data: RegisterData): Promise<AuthResponse> {
    return authService.register(data);
  }

  static async getCurrentUser(): Promise<UserDetails> {
    return authService.getUserDetails();
  }

  static logout(): void {
    authService.logout();
  }

  // Backtest methods
  static async runBacktest(data: BacktestFormData): Promise<BacktestStatus> {
    return backtestService.runBacktest(data);
  }

  static async getBacktestStatus(backtestId: string): Promise<BacktestStatus> {
    return backtestService.getBacktestStatus(backtestId);
  }

  static async getBacktestResults(
    backtestId: string
  ): Promise<BacktestResults> {
    return backtestService.getBacktestResults(backtestId);
  }

  static async getUserBacktests(): Promise<BacktestStatus[]> {
    return backtestService.getUserBacktests();
  }

  static async deleteBacktest(
    backtestId: string
  ): Promise<{ message: string }> {
    return backtestService.deleteBacktest(backtestId);
  }

  // Trade and returns data
  static async getTradeReports(backtestId: string): Promise<Trade[]> {
    return backtestService.getTradeReports(backtestId);
  }

  static async getReturnsData(backtestId: string): Promise<ReturnData[]> {
    return backtestService.getReturnsData(backtestId);
  }

  // Database methods
  static async getAvailableInstruments(): Promise<string[]> {
    return databaseService.getAvailableInstruments();
  }

  static async getDatabaseInfo(): Promise<DatabaseInfo> {
    return databaseService.getDatabaseInfo();
  }

  // Utility methods
  static async authenticateAndRedirect(
    credentials: LoginCredentials,
    router: any
  ): Promise<void> {
    const response = await this.login(credentials);
    const redirectPath =
      response.user.role === "admin" ? "/admin/dashboard" : "/dashboard";
    router.push(redirectPath);
  }

  static async registerAndRedirect(
    data: RegisterData,
    router: any
  ): Promise<void> {
    const response = await this.register(data);
    const redirectPath =
      response.user.role === "admin" ? "/admin/dashboard" : "/dashboard";
    router.push(redirectPath);
  }
}
```

### Specialized Services

#### Auth Service

**Location**: `lib/auth-service.ts`

Handles authentication-specific API calls:

```typescript
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
    }
    return response.data;
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

    const response = await axios.get<UserDetails>("/api/auth/me", { headers });
    return response.data;
  },
};
```

#### Backtest Service

**Location**: `lib/backtest-service.ts`

Handles backtest-related API operations:

```typescript
export const backtestService = {
  async runBacktest(data: BacktestFormData): Promise<BacktestStatus> {
    try {
      const response = await axiosInstance.post("/api/backtest/run", data);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getBacktestStatus(backtestId: string): Promise<BacktestStatus> {
    try {
      const response = await axiosInstance.get(
        `/api/backtest/status/${backtestId}`
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getBacktestResults(backtestId: string): Promise<BacktestResults> {
    try {
      const response = await axiosInstance.get(
        `/api/backtest/results/${backtestId}`
      );
      return { ...response.data, backtest_id: backtestId };
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getTradeReports(backtestId: string): Promise<Trade[]> {
    try {
      const response = await axiosInstance.get(
        `/api/backtest/trades/${backtestId}`
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getReturnsData(backtestId: string): Promise<ReturnData[]> {
    try {
      const response = await axiosInstance.get(
        `/api/backtest/returns/${backtestId}`
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getBacktestReportUrl(
    backtestId: string,
    format: "csv" | "html" = "csv"
  ): string {
    return `${axiosInstance.defaults.baseURL}/api/backtest/download/${backtestId}?format=${format}`;
  },

  getBacktestDebugUrl(backtestId: string): string {
    return `${axiosInstance.defaults.baseURL}/api/backtest/debug/${backtestId}`;
  },
};
```

#### Database Service

**Location**: `lib/backtest-service.ts`

Handles database-related operations:

```typescript
export const databaseService = {
  async getAvailableInstruments(): Promise<string[]> {
    try {
      const response = await axiosInstance.get("/api/database/instruments");
      return response.data.tickers || [];
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getDatabaseInfo(): Promise<DatabaseInfo> {
    try {
      const response = await axiosInstance.get("/api/database/info");
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getBenchmarkReturns(
    startDate: string,
    endDate: string
  ): Promise<BenchmarkReturns> {
    try {
      const response = await axiosInstance.get(
        "/api/database/benchmark-returns",
        {
          params: { start_date: startDate, end_date: endDate },
        }
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
```

## HTTP Client Configuration

### Axios Instance Setup

**Location**: `lib/axios.ts`

```typescript
import axios, { AxiosInstance } from "axios";

// Create axios instance with base configuration
const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  timeout: 30000, // 30 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for authentication
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getTokenFromStorage();
    console.log("🔍 Axios Interceptor Debug:");
    console.log("Token from cookies:", token);
    console.log("Request URL:", config.url);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Authorization header set");
    } else {
      console.log("❌ No token found, skipping Authorization header");
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 unauthorized errors
    if (error.response?.status === 401) {
      removeAccessTokenCookie();
      console.log("🚫 401 Unauthorized - Access token removed from cookies");

      // Trigger logout through Redux and redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
```

### Cookie Management

```typescript
// Set access token in HTTP-only cookie
export const setAccessTokenCookie = (token: string): void => {
  const maxAge = 15 * 60; // 15 minutes
  document.cookie = `access_token=${token}; max-age=${maxAge}; path=/; secure; samesite=strict`;
};

// Get access token from cookie
export const getAccessTokenFromCookie = (): string | null => {
  return getCookie("access_token");
};

// Remove access token cookie
export const removeAccessTokenCookie = (): void => {
  document.cookie = "access_token=; max-age=0; path=/";
};

// Generic cookie getter
const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};
```

### Token Validation

```typescript
export const validateToken = async (): Promise<boolean> => {
  const token = getAccessTokenFromCookie();
  if (!token) {
    console.log("🚫 No access token found");
    return false;
  }

  try {
    await axiosInstance.get("/api/auth/me");
    console.log("✅ Token is valid");
    return true;
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.log("🚫 Token validation failed - 401 Unauthorized");
      removeAccessTokenCookie();
      return false;
    }
    console.log(
      "⚠️ Token validation request failed, but token might still be valid"
    );
    return true;
  }
};
```

## Authentication Integration

### Automatic Token Injection

The HTTP client automatically injects authentication tokens:

```typescript
// Automatic token injection via interceptor
axiosInstance.interceptors.request.use((config) => {
  const token = getAccessTokenFromCookie();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Token Refresh Logic

```typescript
// Automatic logout on token expiration
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      removeAccessTokenCookie();

      // Trigger app-wide logout
      const { store } = await import("@/lib/store");
      store.dispatch(logout());

      // Redirect to login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

## Error Handling

### Centralized Error Handler

```typescript
export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const handleApiError = (error: any): never => {
  if (isAxiosError(error)) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.detail || error.message || "API request failed";
    const data = error.response?.data;
    throw new ApiError(message, status, data);
  }
  throw error;
};
```

### Service-Level Error Handling

```typescript
// Example from backtest service
async getBacktestResults(backtestId: string): Promise<BacktestResults> {
  try {
    const response = await axiosInstance.get(`/api/backtest/results/${backtestId}`);
    return { ...response.data, backtest_id: backtestId };
  } catch (error) {
    return handleApiError(error); // Centralized error handling
  }
}
```

### Component-Level Error Handling

```typescript
// Using custom hooks with error handling
const { data, loading, error } = useApiState<BacktestResults>();

if (error) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
}
```

## Data Transformation

### Response Normalization

```typescript
// Ensure consistent data structure
async getBacktestResults(backtestId: string): Promise<BacktestResults> {
  const response = await axiosInstance.get(`/api/backtest/results/${backtestId}`);

  // Ensure the results contain the backtest_id
  return {
    ...response.data,
    backtest_id: backtestId,
  };
}
```

### Data Validation

```typescript
// Type validation and transformation
interface TickerResponse {
  tickers: string[];
}

async getAvailableInstruments(): Promise<string[]> {
  const response = await axiosInstance.get<TickerResponse>("/api/database/instruments");

  // Ensure we return an array even if API structure changes
  return response.data.tickers || [];
}
```

### CSV Data Processing

```typescript
// Parse CSV data for legacy endpoints
const fetchCsvData = async (backtestId: string) => {
  const csvUrl = backtestService.getBacktestReportUrl(backtestId, "csv");
  const response = await fetch(csvUrl);
  const csvText = await response.text();

  const parsedData = Papa.parse(csvText, {
    header: true,
    dynamicTyping: true,
  });

  // Transform parsed data into structured format
  const equityCurve = parsedData.data
    .filter((row: any) => row.date && row.equity)
    .map((row: any) => ({
      date: row.date,
      equity: parseFloat(row.equity),
    }));

  return { equityCurve /* other processed data */ };
};
```

## Caching and Performance

### Request Deduplication

```typescript
// Using React Query pattern for deduplication
const requestCache = new Map();

const cachedRequest = async (key: string, requestFn: () => Promise<any>) => {
  if (requestCache.has(key)) {
    return requestCache.get(key);
  }

  const promise = requestFn();
  requestCache.set(key, promise);

  try {
    const result = await promise;
    return result;
  } catch (error) {
    requestCache.delete(key);
    throw error;
  }
};
```

### Retry Logic

```typescript
// Retry failed API calls with exponential backoff
const retryRequest = async (requestFn: () => Promise<any>, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      if (attempt === maxRetries) throw error;

      const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};
```

### Background Data Fetching

```typescript
// Fetch additional data in background
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch trade reports with retry logic
      await fetchTradeData(backtestId);

      // Fetch strategy vs benchmark returns
      await fetchReturnsData(backtestId);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [backtestId]);
```

## Type Safety

### TypeScript Interfaces

```typescript
// Comprehensive type definitions
interface BacktestFormData {
  name: string;
  prompt: string;
  tickers: string[];
  initial_cash: number;
  start_date: string;
  end_date: string;
  commission: number;
}

interface BacktestResults {
  backtest_id: string;
  name?: string;
  metrics: BacktestMetrics;
  insights: string;
  improvements: string;
  strategy_code: string;
  start_date: string;
  end_date: string;
  created_at?: string;
}

interface Trade {
  id: number;
  ticker: string;
  entry_date: string;
  exit_date: string;
  trade_type: string;
  entry_price: number;
  exit_price: number;
  pnl: number;
  returns_percentage: number;
  position_size: number;
}
```

### Generic API Hook

```typescript
export function useApiState<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (apiCall: () => Promise<T>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail || err.message || "An error occurred";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, execute, reset };
}
```

## Usage Examples

### Basic API Call

```typescript
import { ApiService } from "@/lib/api-service";

const handleRunBacktest = async (formData: BacktestFormData) => {
  try {
    const result = await ApiService.runBacktest(formData);
    console.log("Backtest started:", result.backtest_id);
  } catch (error) {
    console.error("Failed to start backtest:", error);
  }
};
```

### Using Custom Hooks

```typescript
import { useUserBacktests } from "@/hooks/use-api";

function BacktestList() {
  const { backtests, loading, error, deleteBacktest } = useUserBacktests();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {backtests?.map((backtest) => (
        <div key={backtest.backtest_id}>
          <span>{backtest.name}</span>
          <button onClick={() => deleteBacktest(backtest.backtest_id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Error Handling Pattern

```typescript
const ComponentWithErrorHandling = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await ApiService.getCurrentUser();
        setData(result);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(`API Error ${err.status}: ${err.message}`);
        } else {
          setError("Unknown error occurred");
        }
      }
    };

    fetchData();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return <div>{/* Render data */}</div>;
};
```

### File Download

```typescript
const handleDownloadReport = (backtestId: string, format: "csv" | "html") => {
  const url = backtestService.getBacktestReportUrl(backtestId, format);
  window.open(url, "_blank");
};
```

This API integration system provides a robust, type-safe, and maintainable approach to handling all API communications with comprehensive error handling, authentication integration, and performance optimizations.
