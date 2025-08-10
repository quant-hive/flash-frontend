/**
 * Utility functions for cookie-based authentication
 * 
 * This file provides helper functions to work with the new cookie-based
 * authentication system where access tokens are stored in cookies with
 * 15-minute expiry time, while user data remains in localStorage.
 */

import { 
  setAccessTokenCookie, 
  getAccessTokenFromCookie, 
  removeAccessTokenCookie 
} from "./axios";

/**
 * Set access token in cookie (automatically called by Redux actions)
 * @param token - The access token to store
 */
export const storeAccessToken = (token: string): void => {
  setAccessTokenCookie(token);
};

/**
 * Get access token from cookie
 * @returns The access token or null if not found/expired
 */
export const getStoredAccessToken = (): string | null => {
  return getAccessTokenFromCookie();
};

/**
 * Remove access token from cookie (for logout)
 */
export const clearAccessToken = (): void => {
  removeAccessTokenCookie();
};

/**
 * Check if user is authenticated (has valid token in cookie)
 * Note: This only checks if token exists, not if it's valid with the server
 * @returns true if token exists in cookie, false otherwise
 */
export const hasValidToken = (): boolean => {
  const token = getAccessTokenFromCookie();
  return !!token;
};

/**
 * Example usage in a component:
 * 
 * import { useSelector, useDispatch } from '@/lib/store';
 * import { setCredentials, logout } from '@/lib/store/slices/auth';
 * import { authService } from '@/lib/auth-service';
 * 
 * const LoginComponent = () => {
 *   const dispatch = useDispatch();
 *   
 *   const handleLogin = async (credentials) => {
 *     try {
 *       const response = await authService.login(credentials);
 *       if (response.access_token && response.user) {
 *         // This will automatically set the token in cookies
 *         dispatch(setCredentials({
 *           user: response.user,
 *           accessToken: response.access_token
 *         }));
 *       }
 *     } catch (error) {
 *       console.error('Login failed:', error);
 *     }
 *   };
 *   
 *   const handleLogout = () => {
 *     // This will automatically remove the token from cookies
 *     dispatch(logout());
 *   };
 * };
 */
