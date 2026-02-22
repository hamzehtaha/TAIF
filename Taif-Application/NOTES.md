 # TAIF Flutter Project Architecture Notes

## Project Structure Analysis

### 1. Architecture Pattern
The project follows **Clean Architecture** with a feature-based organization:

```
lib/
├── core/           # Shared infrastructure
│   ├── config/     # Environment configuration
│   ├── network/    # Dio client with interceptors
│   ├── routing/    # go_router configuration
│   ├── theme/      # Design tokens & themes
│   └── utils/      # Token storage, localization, logger
└── features/       # Feature modules
    └── {feature}/
        ├── domain/       # Entities, repositories (abstract), usecases
        ├── data/         # Repository implementations, models, datasources
        └── presentation/ # Screens, BLoCs, widgets
```

### 2. Routing & Navigation
- **Package**: `go_router` for declarative routing
- **Configuration**: `core/routing/app_router.dart`
- **Extension**: `BuildContextExtension` for easy navigation (`context.push()`, `context.go()`)
- **Routes**: Centralized in `AppRoutes` class as constants

### 3. State Management
- **Package**: `flutter_bloc` with `BlocProvider`/`BlocBuilder`/`BlocListener`
- **Pattern**: BLoC pattern with Events and States
- **Global Blocs**: ThemeBloc, LocaleBloc in MultiBlocProvider at app root
- **Feature Blocs**: Local to feature presentation layer

### 4. Theming Approach
- **Centralized Colors**: `core/theme/app_colors.dart`
  - 3 Brand Colors: primary, secondary, accent
  - Neutral scale (gray50-900)
  - Semantic colors (success, error, warning, info)
- **Design Tokens**: `app_design_tokens.dart` (spacing, radius, shadows)
- **Typography**: `app_typography.dart` (font families, sizes)
- **Theme Data**: `app_theme.dart` (light/dark themes using Material 3)

### 5. API & Network Layer
- **HTTP Client**: Dio with centralized configuration
- **Base URL**: From `EnvConfig.current.apiBaseUrl`
- **Interceptors**:
  - Auth: Token injection & refresh (TODO)
  - Logging: Debug logging via AppLogger
  - Request ID: Tracing header
- **Token Storage**: `flutter_secure_storage` via `TokenStorage` class
- **Environment**: Dev/Staging/Prod configs in `core/config/env.dart`

### 6. Server-API Patterns (Backend)
Based on `Server-api/TAIF.Application/`:
- **DTOs**: Requests in `DTOs/Requests/`, Responses in `DTOs/Responses/`
- **Auth Endpoints**:
  - `LoginRequest`: { email, password }
  - `RegisterRequest`: { firstName, lastName, email, password, birthday, userRoleType }
  - `AuthResponse`: { accessToken, accessTokenExpiresAt, refreshToken, refreshTokenExpiresAt }
  - `UserResponse`: User profile data
- **Services**: `AuthService` with `IAuthService` interface
- **Pattern**: Repository pattern with interface abstraction

### 7. Alignment Strategy

Following existing patterns:
1. **Auth Feature Structure**:
   - `features/auth/domain/entities/` - User entity
   - `features/auth/domain/repositories/` - AuthRepository interface
   - `features/auth/data/models/` - LoginRequest, RegisterRequest, AuthResponse models
   - `features/auth/data/repositories/` - AuthRepositoryImpl
   - `features/auth/presentation/bloc/` - AuthBloc
   - `features/auth/presentation/screens/` - login_screen.dart, register_screen.dart

2. **State Management**: Use BLoC for auth flows (login/register loading states, errors)

3. **Colors**: Update 3 brand colors based on design:
   - Primary: Teal/Green (#2D8B7E) - from SELS logo and buttons
   - Secondary: Light Teal (#E8F4F2) - from input field backgrounds
   - Accent/Background: Off-white (#F5F5F0) - from page background

4. **API Integration**: 
   - Use `NetworkClient` for HTTP calls
   - Use `TokenStorage` for saving tokens
   - Match Server-API DTO structure

5. **Navigation**: Use existing `go_router` setup with `AppRoutes`
