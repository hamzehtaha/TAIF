# Authentication System Setup

## Overview

This document describes the authentication system implemented for the Taif-Portal Next.js application, including DTOs, guards, interceptors, and token management.

## Architecture

### 1. DTOs (Data Transfer Objects)

Located in `dtos/auth/`:

- **LoginRequest.ts**: Email and password for login
- **RegisterRequest.ts**: User registration data (firstName, lastName, email, password)
- **RefreshTokenRequest.ts**: Refresh token for token renewal
- **AuthResponse.ts**: Authentication response with access/refresh tokens and expiration dates

All DTOs match the backend C# API structure exactly.

### 2. HTTP Service with Interceptor

**File**: `services/httpService.ts`

**Features**:
- Automatic token injection for authenticated requests
- Token refresh on 401 errors
- Public endpoint whitelist
- Cookie and localStorage token storage
- Request queuing during token refresh

**Public Endpoints** (no auth required):
- `/api/auth/login`
- `/api/auth/register`
- `/api/auth/refresh`

**Token Storage**:
- Access token stored in both localStorage and cookies
- Refresh token stored in both localStorage and cookies
- Expiration dates tracked in localStorage

**Interceptor Logic**:
1. Check if endpoint is public
2. If private, add `Authorization: Bearer {token}` header
3. On 401 response, attempt token refresh
4. Retry original request with new token
5. If refresh fails, redirect to login

### 3. Auth Service

**File**: `services/authService.ts`

**Methods**:
- `register(request: RegisterRequest)`: Register new user
- `login(request: LoginRequest)`: Login user
- `refreshToken(refreshToken: string)`: Refresh access token
- `logout()`: Clear all tokens and logout
- `getAccessToken()`: Get current access token
- `getRefreshToken()`: Get current refresh token
- `isAuthenticated()`: Check if user is authenticated
- `getProfile()`: Test authenticated endpoint

### 4. Route Guards

#### Server-Side Middleware

**File**: `middleware.ts`

- Runs on every request
- Checks for access token in cookies
- Redirects unauthenticated users to `/signin`
- Preserves original URL for redirect after login

**Public Routes** (accessible without auth):
- `/login`
- `/signup`
- `/` (home)
- `/about`
- `/contact`

#### Client-Side Guard

**File**: `components/guards/AuthGuard.tsx`

- Client-side authentication check
- Shows loading spinner during auth check
- Redirects to login if not authenticated
- Can be wrapped around protected components

### 5. Cookie Management

**File**: `lib/cookies.ts`

Helper functions for cookie operations:
- `setCookie(name, value, days)`: Set cookie with expiration
- `getCookie(name)`: Get cookie value
- `deleteCookie(name)`: Delete cookie

## API Integration

### Backend Endpoints

The system integrates with these TAIF backend endpoints:

1. **POST /api/auth/register**
   - Body: `{ firstName, lastName, email, password }`
   - Response: `AuthResponse`

2. **POST /api/auth/login**
   - Body: `{ email, password }`
   - Response: `AuthResponse`

3. **POST /api/auth/refresh**
   - Body: `{ refreshToken }`
   - Response: `AuthResponse`

4. **GET /api/profile** (Protected)
   - Headers: `Authorization: Bearer {token}`
   - Response: `{ message: "You are authorized" }`

### Environment Configuration

**File**: `.env`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Update this URL to point to your TAIF backend server.

## Usage Examples

### Login Page

```tsx
import { authService } from "@/services/authService";

const handleLogin = async () => {
  try {
    await authService.login({
      email: "user@example.com",
      password: "password123"
    });
    router.push("/dashboard");
  } catch (error) {
    console.error("Login failed:", error);
  }
};
```

### Register Page

```tsx
import { authService } from "@/services/authService";

const handleRegister = async () => {
  try {
    await authService.register({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "password123"
    });
    router.push("/dashboard");
  } catch (error) {
    console.error("Registration failed:", error);
  }
};
```

### Protected API Call

```tsx
import { httpService } from "@/services/httpService";

// Automatically includes auth token
const data = await httpService.get("/api/some-protected-endpoint");
```

### Logout

```tsx
import { authService } from "@/services/authService";

const handleLogout = async () => {
  await authService.logout();
  window.location.href = "/signin";
};
```

## Testing

### Profile Test Page

Navigate to `/dashboard/profile-test` to test the authentication system:

- Test authenticated API calls
- View current token information
- Test logout functionality

## Security Features

1. **Token Expiration**: Access tokens expire and are automatically refreshed
2. **Secure Storage**: Tokens stored in both localStorage and httpOnly-compatible cookies
3. **CSRF Protection**: SameSite cookie policy
4. **Route Protection**: Both server and client-side guards
5. **Automatic Refresh**: Transparent token refresh on expiration

## Flow Diagrams

### Login Flow

```
User enters credentials
    ↓
authService.login()
    ↓
POST /api/auth/login
    ↓
Receive AuthResponse
    ↓
Store tokens (localStorage + cookies)
    ↓
Redirect to dashboard
```

### Protected Request Flow

```
User requests protected resource
    ↓
httpService adds Authorization header
    ↓
API returns 401?
    ↓ Yes
Refresh token
    ↓
Retry request with new token
    ↓ Success
Return data
```

### Middleware Guard Flow

```
User navigates to page
    ↓
Middleware checks cookie
    ↓
Token exists?
    ↓ No
Redirect to /login?redirect={original-url}
    ↓ Yes
Allow access
```

## Troubleshooting

### Issue: "Cannot find module errors"

The TypeScript errors about missing modules (react, next/server, etc.) are normal during development and will resolve when you run `npm install` or `pnpm install`.

### Issue: 401 Unauthorized

1. Check if backend is running on correct port
2. Verify `NEXT_PUBLIC_API_URL` in `.env`
3. Check token expiration
4. Verify backend CORS settings

### Issue: Infinite redirect loop

1. Check if tokens are being stored correctly
2. Verify middleware public routes list
3. Check browser console for errors

### Issue: Token refresh fails

1. Verify refresh token is valid
2. Check backend refresh endpoint
3. Ensure refresh token hasn't expired

## Recent Fixes

### ✅ Fixed: `authService.getUser is not a function`
Added `getUser()` and `setUser()` methods to `authService.ts` with User interface export.

### ✅ Fixed: Failed to fetch on home page
Removed automatic course loading from home page. Courses now only load when explicitly navigating to `/dashboard/courses`.

### ✅ Fixed: Route renamed from /signin to /login
All references updated throughout the application:
- Created `/app/login/` directory
- Updated middleware, guards, and all navigation links
- Updated httpService redirect logic

## Next Steps

1. ✅ Install dependencies: `npm install` (already done)
2. Update `.env` with your backend URL (default: http://localhost:5000)
3. Start backend server: `dotnet run` in TAIF project
4. Start frontend: `npm run dev`
5. Test login at `/login`
6. Test protected route at `/dashboard/profile-test`

## Files Created/Modified

### New Files
- `dtos/auth/LoginRequest.ts`
- `dtos/auth/RegisterRequest.ts`
- `dtos/auth/RefreshTokenRequest.ts`
- `dtos/auth/AuthResponse.ts`
- `dtos/auth/index.ts`
- `lib/cookies.ts`
- `components/guards/AuthGuard.tsx`
- `middleware.ts`
- `app/login/page.tsx` (renamed from signin)
- `app/login/loading.tsx`
- `app/dashboard/profile-test/page.tsx`
- `FRONTEND_BACKEND_ALIGNMENT.md`

### Modified Files
- `services/httpService.ts` - Added interceptor, token refresh, and cookie support
- `services/authService.ts` - Refactored to use DTOs, added getUser/setUser methods
- `app/signup/page.tsx` - Updated to use new authService
- `app/page.tsx` - Removed automatic course loading
- `components/layout/Header.tsx` - Updated to use /login route
- `.env` - Added NEXT_PUBLIC_API_URL
- `.env.example` - Updated with backend URL

## Support

For issues or questions, refer to:
- Backend API documentation in TAIF project
- Next.js authentication best practices
- This documentation
