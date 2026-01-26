# Frontend-Backend Alignment Document

## Overview
This document verifies the alignment between Taif-Portal (Next.js Frontend) and TAIF (ASP.NET Core Backend).

## API Endpoints Mapping

### Authentication Endpoints

| Frontend Call | Backend Endpoint | Method | Request DTO | Response DTO | Status |
|--------------|------------------|--------|-------------|--------------|--------|
| `authService.register()` | `/api/auth/register` | POST | `RegisterRequest` | `AuthResponse` | ✅ Aligned |
| `authService.login()` | `/api/auth/login` | POST | `LoginRequest` | `AuthResponse` | ✅ Aligned |
| `authService.refreshToken()` | `/api/auth/refresh` | POST | `RefreshTokenRequest` | `AuthResponse` | ✅ Aligned |
| `authService.getProfile()` | `/api/profile` | GET | - | `{ message: string }` | ✅ Aligned |

### DTO Alignment

#### RegisterRequest
**Frontend** (`dtos/auth/RegisterRequest.ts`):
```typescript
{
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
```

**Backend** (`TAIF.Application/DTOs/RegisterRequest.cs`):
```csharp
{
  FirstName: string;
  LastName: string;
  Email: string;
  Password: string;
}
```
✅ **Status**: Aligned (camelCase vs PascalCase handled by JSON serialization)

#### LoginRequest
**Frontend** (`dtos/auth/LoginRequest.ts`):
```typescript
{
  email: string;
  password: string;
}
```

**Backend** (`TAIF.Application/DTOs/LoginRequest.cs`):
```csharp
{
  Email: string;
  Password: string;
}
```
✅ **Status**: Aligned

#### RefreshTokenRequest
**Frontend** (`dtos/auth/RefreshTokenRequest.ts`):
```typescript
{
  refreshToken: string;
}
```

**Backend** (`TAIF.Application/DTOs/RefreshTokenRequest.cs`):
```csharp
{
  RefreshToken: string;
}
```
✅ **Status**: Aligned

#### AuthResponse
**Frontend** (`dtos/auth/AuthResponse.ts`):
```typescript
{
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}
```

**Backend** (`TAIF.Application/DTOs/AuthResponse.cs`):
```csharp
{
  AccessToken: string;
  AccessTokenExpiresAt: DateTime;
  RefreshToken: string;
  RefreshTokenExpiresAt: DateTime;
}
```
✅ **Status**: Aligned (DateTime serialized to ISO string)

## Route Protection

### Public Routes (No Authentication Required)
- `/login` - Login page
- `/signup` - Registration page
- `/` - Home page
- `/about` - About page
- `/contact` - Contact page

### Protected Routes (Authentication Required)
- `/dashboard/*` - All dashboard routes
- Any route not in public list

### Protection Mechanisms
1. **Server-side**: `middleware.ts` checks cookies
2. **Client-side**: `AuthGuard.tsx` checks localStorage
3. **API-level**: `httpService.ts` adds Bearer token to headers

## Token Management

### Storage Strategy
- **Access Token**: localStorage + cookies (7 days)
- **Refresh Token**: localStorage + cookies (30 days)
- **Token Expiration**: Tracked in localStorage

### Token Flow
1. User logs in → Receives `AuthResponse`
2. Tokens stored in both localStorage and cookies
3. All API calls include `Authorization: Bearer {accessToken}`
4. On 401 error → Attempt refresh with refresh token
5. If refresh succeeds → Retry original request
6. If refresh fails → Redirect to `/login`

## Environment Configuration

### Frontend (.env)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Backend (Expected)
- Running on: `http://localhost:5000`
- CORS enabled for frontend origin
- JWT authentication configured

## API Call Strategy

### Home Page (`/`)
- ❌ **No API calls** on initial load
- Only static content displayed
- Courses section shows "Browse All Courses" button
- Prevents unnecessary API errors before authentication

### Dashboard Pages
- ✅ API calls allowed (protected routes)
- Automatic token injection
- Automatic refresh on 401

## Testing Checklist

### Authentication Flow
- [ ] Register new user at `/signup`
- [ ] Login at `/login`
- [ ] Verify redirect to `/dashboard`
- [ ] Check tokens in localStorage and cookies
- [ ] Test protected route access
- [ ] Test logout functionality

### Token Refresh
- [ ] Wait for token expiration
- [ ] Make API call
- [ ] Verify automatic refresh
- [ ] Verify request retry

### Route Guards
- [ ] Try accessing `/dashboard` without login → Should redirect to `/login`
- [ ] Login and access `/dashboard` → Should work
- [ ] Logout and try `/dashboard` → Should redirect to `/login`

### Profile API Test
- [ ] Navigate to `/dashboard/profile-test`
- [ ] Click "Test Profile API"
- [ ] Should see: `{ message: "You are authorized" }`

## Known Issues & Resolutions

### Issue 1: `authService.getUser is not a function`
**Status**: ✅ Fixed
**Solution**: Added `getUser()` and `setUser()` methods to `authService.ts`

### Issue 2: Failed to fetch on home page
**Status**: ✅ Fixed
**Solution**: Removed automatic course loading from home page

### Issue 3: `/signin` route not found
**Status**: ✅ Fixed
**Solution**: Renamed `/signin` to `/login` throughout the application

## File Structure

### Frontend Authentication Files
```
Taif-Portal/
├── dtos/auth/
│   ├── LoginRequest.ts
│   ├── RegisterRequest.ts
│   ├── RefreshTokenRequest.ts
│   ├── AuthResponse.ts
│   └── index.ts
├── services/
│   ├── authService.ts (Auth operations)
│   └── httpService.ts (HTTP interceptor)
├── lib/
│   └── cookies.ts (Cookie utilities)
├── components/guards/
│   └── AuthGuard.tsx (Client-side guard)
├── middleware.ts (Server-side guard)
└── app/
    ├── login/ (Login page)
    ├── signup/ (Signup page)
    └── dashboard/
        └── profile-test/ (Test page)
```

### Backend Authentication Files
```
TAIF/
├── TAIF/Controllers/
│   ├── AuthController.cs
│   └── ProfileController.cs
└── TAIF.Application/
    ├── DTOs/
    │   ├── LoginRequest.cs
    │   ├── RegisterRequest.cs
    │   ├── RefreshTokenRequest.cs
    │   └── AuthResponse.cs
    ├── Interfaces/
    │   └── IAuthService.cs
    └── Services/
        └── AuthService.cs
```

## CORS Configuration (Backend Required)

Ensure your backend has CORS configured:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

app.UseCors("AllowFrontend");
```

## Next Steps

1. ✅ Start backend server: `dotnet run` (in TAIF project)
2. ✅ Start frontend server: `npm run dev` (in Taif-Portal)
3. ✅ Navigate to `http://localhost:3000/login`
4. ✅ Test registration and login
5. ✅ Test protected routes
6. ✅ Test token refresh
7. ✅ Test profile API at `/dashboard/profile-test`

## Summary

✅ **All DTOs aligned between frontend and backend**
✅ **All API endpoints properly mapped**
✅ **Route guards implemented (server + client)**
✅ **Token management with automatic refresh**
✅ **Public routes accessible without authentication**
✅ **Protected routes require valid tokens**
✅ **No unnecessary API calls on public pages**

The frontend and backend are now fully aligned and ready for testing!
