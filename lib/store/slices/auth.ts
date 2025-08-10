import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  setAccessTokenCookie,
  removeAccessTokenCookie,
  getAccessTokenFromCookie,
} from "@/lib/axios";

interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
};

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

      // Set the access token in cookies (user data will stay in localStorage via Redux persist)
      setAccessTokenCookie(accessToken);
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      // Set the access token in cookies
      setAccessTokenCookie(action.payload);
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;

      // Remove the access token from cookies
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
    // New action to initialize auth state from cookies
    initializeFromCookie: (state) => {
      const tokenFromCookie = getAccessTokenFromCookie();
      if (tokenFromCookie && !state.accessToken) {
        state.accessToken = tokenFromCookie;
        // Don't set isAuthenticated to true until we verify the token
      }
    },
  },
});

export const {
  setCredentials,
  setUser,
  setAccessToken,
  logout,
  setLoading,
  updateUser,
  initializeFromCookie,
} = authSlice.actions;

export default authSlice.reducer;

// Selectors - Updated to work with Redux Persist
export const selectCurrentUser = (state: any) => state.auth?.user || null;
export const selectAccessToken = (state: any) =>
  state.auth?.accessToken || null;
export const selectIsAuthenticated = (state: any) =>
  state.auth?.isAuthenticated || false;
export const selectIsLoading = (state: any) => state.auth?.isLoading ?? true;
export const selectIsAdmin = (state: any) => state.auth?.user?.role === "admin";
