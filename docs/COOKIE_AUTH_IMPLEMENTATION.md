# Cookie-Based Authentication Implementation

## Overview
This document outlines the changes made to implement cookie-based authentication for access tokens with localStorage for user data persistence.

## Key Changes

### 1. Updated Axios Configuration (`lib/axios.ts`)
- **Before**: Used `localforage` to retrieve access tokens from Redux persist storage
- **After**: Uses `js-cookie` to manage access tokens in cookies with 15-minute expiry

#### New Features:
- `setAccessTokenCookie(token)`: Sets access token in cookie with 15-minute expiry
- `getAccessTokenFromCookie()`: Retrieves access token from cookie
- `removeAccessTokenCookie()`: Removes access token cookie on logout/401 errors
- Automatic 401 error handling to remove expired tokens

#### Cookie Configuration:
```typescript
const COOKIE_CONFIG = {
  ACCESS_TOKEN: 'access_token',
  EXPIRES_MINUTES: 15,
  SECURE: process.env.NODE_ENV === 'production',
  SAME_SITE: 'strict' as const
};
```

### 2. Updated Redux Auth Slice (`lib/store/slices/auth.ts`)
- **Added**: Cookie integration in auth actions
- **Added**: `initializeFromCookie()` action to restore token from cookies on app startup
- **Modified**: `setCredentials()` and `setAccessToken()` now automatically set cookies
- **Modified**: `logout()` now automatically removes cookies

### 3. Updated Redux Store Configuration (`lib/store/index.ts`)
- **Added**: Custom persist configuration for auth slice
- **Modified**: Access tokens are blacklisted from localStorage persistence
- **Result**: Only user data persists in localStorage, access tokens only in cookies

### 4. Updated Auth Context (`context/auth.tsx`)
- **Added**: Cookie initialization on app startup
- **Modified**: Auth initialization flow to check cookies first
- **Added**: Import for `initializeFromCookie` action

### 5. New Utility File (`lib/cookie-auth-utils.ts`)
- Provides helper functions for cookie management
- Includes comprehensive usage examples
- Documents the new authentication flow

## Security Benefits

1. **Shorter Token Lifespan**: 15-minute expiry reduces exposure window
2. **Automatic Cleanup**: Tokens automatically expire and are removed
3. **Separation of Concerns**: Tokens in cookies, user data in localStorage
4. **CSRF Protection**: SameSite=strict cookie policy
5. **Secure in Production**: Cookies marked secure in production environment

## Migration Impact

### What Stays the Same:
- User data persistence in localStorage via Redux
- Login/logout flows (just dispatch the same Redux actions)
- Component authentication checks using Redux selectors

### What Changes:
- Access tokens automatically managed via cookies
- Shorter token lifespan (15 minutes vs indefinite)
- Automatic token cleanup on expiry/errors

## Usage Examples

### Login Flow:
```typescript
const handleLogin = async (credentials) => {
  const response = await authService.login(credentials);
  if (response.access_token && response.user) {
    // Automatically sets token in cookie
    dispatch(setCredentials({
      user: response.user,
      accessToken: response.access_token
    }));
  }
};
```

### Logout Flow:
```typescript
const handleLogout = () => {
  // Automatically removes token from cookie
  dispatch(logout());
};
```

### Check Authentication:
```typescript
const isAuthenticated = useSelector(selectIsAuthenticated);
const user = useSelector(selectCurrentUser);
```

## Testing Checklist

- [ ] Login sets cookie with 15-minute expiry
- [ ] Logout removes cookie immediately
- [ ] Page refresh maintains authentication state
- [ ] Token expiry after 15 minutes logs user out
- [ ] 401 responses automatically clear tokens
- [ ] User data persists in localStorage
- [ ] Access tokens do not persist in localStorage

## Browser Support
Compatible with all modern browsers that support:
- ES6 modules
- Cookies
- LocalStorage
- Redux Persist

## Security Considerations

1. **HttpOnly**: Currently set to `false` for client-side access. Consider setting to `true` for enhanced security if server-side token access is sufficient.
2. **Token Refresh**: Consider implementing refresh token logic in the response interceptor.
3. **HTTPS**: Cookies are marked secure in production, ensure HTTPS is used.
