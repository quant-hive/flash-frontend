# State Management System Documentation

This document provides comprehensive documentation for the state management mechanisms in the Flash Frontend application, covering Redux, React Context, and local state patterns.

## Table of Contents

- [State Management System Documentation](#state-management-system-documentation)
  - [Table of Contents](#table-of-contents)
  - [Architecture Overview](#architecture-overview)
  - [Redux Store Structure](#redux-store-structure)
  - [React Context Providers](#react-context-providers)
  - [Custom Hooks](#custom-hooks)
  - [State Persistence](#state-persistence)
  - [Implementation Details](#implementation-details)
  - [Best Practices](#best-practices)
  - [Usage Examples](#usage-examples)

## Architecture Overview

The Flash Frontend uses a multi-layered state management approach:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Redux Store   │    │ React Context   │    │  Local State    │
│   (Global)      │    │ (Feature-based) │    │ (Component)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐               │
         │              │  Redux Persist  │               │
         │              │  (localStorage) │               │
         │              └─────────────────┘               │
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Custom Hooks  │
                    │   (Abstraction) │
                    └─────────────────┘
```

## Redux Store Structure

### Store Configuration

**Location**: `lib/store/index.ts`

```typescript
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./slices/auth";
import settingsReducer from "./slices/settings";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "settings"], // Only persist specific slices
};

const rootReducer = combineReducers({
  auth: authReducer,
  settings: settingsReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});
```

### Auth Slice

**Location**: `lib/store/slices/auth.ts`

Manages authentication state and user data:

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  username: string;
  is_active: boolean;
  created_at: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; accessToken: string }>
    ) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      state.isLoading = false;

      // Set token in cookies
      setAccessTokenCookie(accessToken);
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;

      // Remove token from cookies
      removeAccessTokenCookie();
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    initializeFromCookie: (state) => {
      const tokenFromCookie = getAccessTokenFromCookie();
      if (tokenFromCookie && !state.accessToken) {
        state.accessToken = tokenFromCookie;
      }
    },
  },
});
```

**Selectors**:

```typescript
export const selectCurrentUser = (state: RootState) => state.auth?.user || null;
export const selectAccessToken = (state: RootState) =>
  state.auth?.accessToken || null;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth?.isAuthenticated || false;
export const selectIsLoading = (state: RootState) =>
  state.auth?.isLoading ?? true;
export const selectIsAdmin = (state: RootState) =>
  state.auth?.user?.role === "admin";
```

### Settings Slice

**Location**: `lib/store/slices/settings.ts`

Manages user preferences and application settings:

```typescript
interface UserSettings {
  avatar: string;
  fullName: string;
  email: string;
  phone: string;
  timezone: string;
  language: string;
  currency: string;
  dateFormat: string;
  fontSize: number;
  theme: "light" | "dark" | "system";
  layout: "default" | "compact" | "expanded";
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    accountActivity: boolean;
    newFeatures: boolean;
    marketing: boolean;
    frequency: "real-time" | "daily" | "weekly";
    quietHoursStart: string;
    quietHoursEnd: string;
  };
  privacy: {
    analyticsSharing: boolean;
    personalizedAds: boolean;
    visibility: "public" | "private";
    dataRetention: "6-months" | "1-year" | "2-years" | "indefinite";
  };
}

const settingsSlice = createSlice({
  name: "settings",
  initialState: { settings: defaultSettings },
  reducers: {
    updateSettings: (state, action: PayloadAction<Partial<UserSettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    updateNotificationSettings: (
      state,
      action: PayloadAction<Partial<UserSettings["notifications"]>>
    ) => {
      state.settings.notifications = {
        ...state.settings.notifications,
        ...action.payload,
      };
    },
    updatePrivacySettings: (
      state,
      action: PayloadAction<Partial<UserSettings["privacy"]>>
    ) => {
      state.settings.privacy = {
        ...state.settings.privacy,
        ...action.payload,
      };
    },
    resetSettings: (state) => {
      state.settings = defaultSettings;
    },
  },
});
```

## React Context Providers

### Auth Context

**Location**: `context/auth.tsx`

Provides authentication functions and state to components:

```typescript
interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => void;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const isLoading = useSelector(selectIsLoading);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);

  // Login function integrates with Redux
  const login = async (
    credentials: LoginCredentials
  ): Promise<AuthResponse> => {
    const response = await ApiService.login(credentials);
    dispatch(
      setCredentials({
        user: response.user,
        accessToken: response.access_token,
      })
    );

    // Handle redirect logic
    const redirectParam = searchParams?.get("redirectTo");
    const target =
      (redirectParam && redirectParam.startsWith("/") && redirectParam) ||
      (response.user?.role === "admin" ? "/admin" : "/dashboard");
    router.replace(target);

    return response;
  };

  const logout = () => {
    dispatch(logoutAction());
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
```

### Settings Context

**Location**: `context/settings.tsx`

Provides settings management functions:

```typescript
interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  updateNotificationSettings: (
    settings: Partial<UserSettings["notifications"]>
  ) => void;
  updatePrivacySettings: (settings: Partial<UserSettings["privacy"]>) => void;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const settings = useSelector(selectUserSettings);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    dispatch(updateSettingsAction(newSettings));
  };

  const updateNotificationSettings = (
    notificationSettings: Partial<UserSettings["notifications"]>
  ) => {
    dispatch(updateNotificationSettingsAction(notificationSettings));
  };

  const updatePrivacySettings = (
    privacySettings: Partial<UserSettings["privacy"]>
  ) => {
    dispatch(updatePrivacySettingsAction(privacySettings));
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        updateNotificationSettings,
        updatePrivacySettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
```

### Backtest Results Context

**Location**: `context/backtest-results-context.tsx`

Manages backtest results state for dashboard components:

```typescript
interface BacktestResultsContextType {
  currentBacktest: BacktestResults | null;
  setCurrentBacktest: (backtest: BacktestResults | null) => void;
  tradeData: Trade[];
  setTradeData: (trades: Trade[]) => void;
  returnsData: ReturnData[];
  setReturnsData: (returns: ReturnData[]) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export function BacktestResultsProvider({ children }: { children: ReactNode }) {
  const [currentBacktest, setCurrentBacktest] =
    useState<BacktestResults | null>(null);
  const [tradeData, setTradeData] = useState<Trade[]>([]);
  const [returnsData, setReturnsData] = useState<ReturnData[]>([]);
  const [loading, setLoading] = useState(false);

  return (
    <BacktestResultsContext.Provider
      value={{
        currentBacktest,
        setCurrentBacktest,
        tradeData,
        setTradeData,
        returnsData,
        setReturnsData,
        loading,
        setLoading,
      }}
    >
      {children}
    </BacktestResultsContext.Provider>
  );
}
```

## Custom Hooks

### API State Management

**Location**: `hooks/use-api.ts`

Generic hook for managing API call states:

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

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}
```

### Backtest Management

```typescript
export function useUserBacktests() {
  const { data, loading, error, execute, reset } =
    useApiState<BacktestStatus[]>();

  const fetchBacktests = useCallback(() => {
    return execute(() => ApiService.getUserBacktests());
  }, [execute]);

  const deleteBacktest = useCallback(
    async (backtestId: string) => {
      await ApiService.deleteBacktest(backtestId);
      return fetchBacktests(); // Refresh list after deletion
    },
    [fetchBacktests]
  );

  useEffect(() => {
    fetchBacktests();
  }, [fetchBacktests]);

  return {
    backtests: data,
    loading,
    error,
    refetch: fetchBacktests,
    deleteBacktest,
    reset,
  };
}
```

### Route Protection

**Location**: `hooks/use-route-protection.tsx`

Manages route access and authentication checks:

```typescript
export function useRouteProtection(options: UseRouteProtectionOptions = {}) {
  const {
    requireAuth = true,
    requireAdmin = false,
    redirectTo = "/login",
  } = options;
  const { isLoading, isAuthenticated, isAdmin, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      if (isLoading) return;

      // Check authentication requirements
      if (requireAuth && !isAuthenticated) {
        const current = `${pathname}${window.location.search}${window.location.hash}`;
        const loginUrl = `${redirectTo}?redirectTo=${encodeURIComponent(
          current
        )}`;
        router.push(loginUrl);
        return;
      }

      // Check admin requirements
      if (requireAdmin && isAuthenticated && !isAdmin) {
        router.push("/dashboard");
        return;
      }

      // Validate token for authenticated users
      if (isAuthenticated) {
        const isTokenValid = await validateToken();
        if (!isTokenValid) {
          logout();
          router.push(
            `${redirectTo}?redirectTo=${encodeURIComponent(current)}`
          );
        }
      }
    };

    checkAuthAndRedirect();
  }, [isLoading, isAuthenticated, isAdmin, requireAuth, requireAdmin]);

  return {
    isLoading,
    isAuthenticated,
    isAdmin,
    canAccess:
      !isLoading &&
      (!requireAuth ||
        (requireAuth && isAuthenticated && (!requireAdmin || isAdmin))),
  };
}
```

## State Persistence

### Redux Persist Configuration

```typescript
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "settings"], // Persist auth and settings
  blacklist: ["api"], // Don't persist API state
};
```

### Cookie-Based Token Storage

```typescript
// Store sensitive tokens in HTTP-only cookies
export const setAccessTokenCookie = (token: string): void => {
  const maxAge = 15 * 60; // 15 minutes
  document.cookie = `access_token=${token}; max-age=${maxAge}; path=/; secure; samesite=strict`;
};

// Retrieve token from cookies
export const getAccessTokenFromCookie = (): string | null => {
  return getCookie("access_token");
};
```

### Local Storage Integration

```typescript
// Settings are automatically persisted via Redux Persist
const settings = useSelector(selectUserSettings);

// Manual localStorage for specific data
useEffect(() => {
  localStorage.setItem("userPreferences", JSON.stringify(preferences));
}, [preferences]);
```

## Implementation Details

### Provider Hierarchy

```typescript
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <CursorProvider>
      <ReduxProvider>
        <AuthProvider>
          <ThemeProvider>
            <SettingsProvider>{children}</SettingsProvider>
          </ThemeProvider>
        </AuthProvider>
      </ReduxProvider>
    </CursorProvider>
  );
}
```

### Redux Integration with Context

```typescript
// Context uses Redux selectors for state
export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Context provides functions that dispatch Redux actions
  const login = async (credentials: LoginCredentials) => {
    const response = await ApiService.login(credentials);
    dispatch(
      setCredentials({
        user: response.user,
        accessToken: response.access_token,
      })
    );
    return response;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### State Synchronization

```typescript
// Sync cookie token with Redux state on app initialization
useEffect(() => {
  const initializeAuth = async () => {
    dispatch(initializeFromCookie());

    const currentToken = accessToken || getAccessTokenFromCookie();
    if (currentToken && !user) {
      try {
        const userData = await ApiService.getCurrentUser();
        dispatch(setCredentials({ user: userData, accessToken: currentToken }));
      } catch (error) {
        dispatch(logout());
      }
    }
  };

  initializeAuth();
}, []);
```

## Best Practices

### State Structure

1. **Normalize Data**: Keep data flat and normalized
2. **Separate Concerns**: Different slices for different domains
3. **Immutable Updates**: Use Redux Toolkit's Immer integration

### Performance Optimization

```typescript
// Memoize selectors for computed values
const selectUserRole = createSelector(
  [selectCurrentUser],
  (user) => user?.role || "guest"
);

// Use specific selectors to avoid unnecessary re-renders
const username = useSelector((state) => state.auth.user?.name);
```

### Error Handling

```typescript
// Centralized error handling in API hooks
const { data, loading, error } = useApiState();

if (error) {
  return <ErrorComponent message={error} />;
}
```

### Type Safety

```typescript
// Typed selectors and actions
export const selectCurrentUser = (state: RootState): User | null =>
  state.auth?.user || null;

// Typed hooks
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();
```

## Usage Examples

### Using Redux State

```typescript
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, updateUser } from "@/lib/store/slices/auth";

function UserProfile() {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);

  const handleUpdateProfile = (userData: Partial<User>) => {
    dispatch(updateUser(userData));
  };

  return (
    <div>
      <h1>{user?.name}</h1>
      <button onClick={() => handleUpdateProfile({ name: "New Name" })}>
        Update Name
      </button>
    </div>
  );
}
```

### Using Context

```typescript
import { useAuth } from "@/context/auth";

function LoginButton() {
  const { isAuthenticated, login, logout } = useAuth();

  if (isAuthenticated) {
    return <button onClick={logout}>Logout</button>;
  }

  return (
    <button onClick={() => login({ username: "user", password: "pass" })}>
      Login
    </button>
  );
}
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

### Route Protection

```typescript
import { useRouteProtection } from "@/hooks/use-route-protection";

function AdminPanel() {
  const { isLoading, canAccess } = useRouteProtection({
    requireAuth: true,
    requireAdmin: true,
  });

  if (isLoading) return <div>Loading...</div>;
  if (!canAccess) return null; // Will redirect automatically

  return <div>Admin Content</div>;
}
```

This state management system provides a robust, scalable, and type-safe approach to managing application state with excellent developer experience and performance characteristics.
