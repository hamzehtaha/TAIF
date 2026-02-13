# TAIF Architecture Documentation

## Executive Summary

TAIF uses a **Layered (Clean) Architecture** combining the best of Clean Architecture with pragmatic Flutter patterns for maximum maintainability and scalability.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Screens   │  │   Widgets   │  │  BLoC (State Mgmt)      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          DOMAIN LAYER                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Entities   │  │  Use Cases  │  │  Repository Interfaces  │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                           DATA LAYER                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Models    │  │Repositories │  │  Data Sources (API/DB)  │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack & Rationale

### State Management: **BLoC (flutter_bloc)**

**Why BLoC?**
- Predictable state management with unidirectional data flow
- Excellent testability - events in, states out
- Clear separation of UI and business logic
- Built-in debugging tools (BlocObserver)
- Industry standard for production Flutter apps

**Tradeoffs:**
- More boilerplate than Provider/Riverpod
- Steeper learning curve

### Dependency Injection: **GetIt + Injectable**

**Why GetIt?**
- Service locator pattern - simple and fast
- Compile-time code generation (injectable)
- No reflection, works with tree shaking
- Easy to mock for testing

### Networking: **Dio + Retrofit**

**Why Dio?**
- Feature-rich HTTP client for Dart
- Built-in interceptors for auth/logging
- Excellent error handling
- Request cancellation support

**Add-ons:**
- `dio_smart_retry`: Automatic retry for safe methods
- `retrofit`: Type-safe API clients

### Routing: **GoRouter**

**Why GoRouter?**
- Declarative routing (URL-based)
- Deep linking support out of the box
- Works seamlessly with Navigator 2.0
- Simple API, easy to maintain

### Local Storage: **Hive + flutter_secure_storage**

**Why Hive?**
- Fast, lightweight NoSQL database
- Native Dart (no platform channel overhead)
- Type-safe with adapters
- Good for caching

**Why flutter_secure_storage?**
- iOS Keychain + Android Keystore
- Encrypted storage for tokens
- Platform security best practices

### Localization: **Custom Implementation**

**Why Custom?**
- Full control over RTL/LTR handling
- Simple JSON-based translations
- Easy to add new languages
- Dynamic language switching

---

## Project Structure

```
lib/
├── core/                          # Shared infrastructure
│   ├── config/                    # Environment configuration
│   │   └── env.dart              # Dev/Stage/Prod configs
│   ├── constants/                 # App constants
│   ├── di/                        # Dependency injection
│   │   └── di.dart               # GetIt configuration
│   ├── errors/                    # Error handling
│   │   └── app_error.dart        # Unified error model
│   ├── extensions/                # Dart/Flutter extensions
│   ├── network/                   # Networking layer
│   │   └── network_client.dart   # Dio configuration
│   ├── routing/                   # Navigation
│   │   └── app_router.dart       # GoRouter setup
│   ├── theme/                     # Design system
│   │   ├── app_colors.dart       # 3 Brand Colors (SSOT)
│   │   ├── app_typography.dart   # Text styles
│   │   ├── app_design_tokens.dart # Spacing/radius/elevation
│   │   └── app_theme.dart        # Light/Dark themes
│   └── utils/                     # Utilities
│       ├── app_localizations.dart # AR/EN localization
│       ├── logger.dart           # Structured logging
│       └── token_storage.dart    # Secure token storage
│
├── features/                      # Feature modules
│   ├── auth/                     # Authentication feature
│   │   ├── data/
│   │   │   ├── datasources/
│   │   │   ├── models/
│   │   │   └── repositories/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   ├── repositories/
│   │   │   └── usecases/
│   │   └── presentation/
│   │       ├── bloc/
│   │       ├── screens/
│   │       └── widgets/
│   ├── home/
│   ├── profile/
│   ├── settings/
│   └── example_feature/          # Reference implementation
│
├── generated/                     # Code-gen files
├── l10n/                          # Localization files
│   ├── app_en.json               # English translations
│   └── app_ar.json               # Arabic translations
│
└── main.dart                      # App entry point
```

---

## Critical Implementation Details

### 1. Centralized Brand Colors (Single Source of Truth)

**File:** `lib/core/theme/app_colors.dart`

```dart
// ONLY these 3 colors should be used for branding
static const Color primary = Color(0xFF0066CC);    // Main CTAs
static const Color secondary = Color(0xFF00A86B); // Secondary actions  
static const Color accent = Color(0xFFFF6B35);    // Warnings/Highlights
```

**Rule:** No hardcoded colors anywhere in the app. Always reference `AppColors`.

### 2. Centralized Server Base URL

**File:** `lib/core/config/env.dart`

```dart
// Single source of truth for API URLs
static const EnvConfig dev = EnvConfig._(
  apiBaseUrl: 'https://api-dev.taif.app/v1',
  // ...
);
```

**Rule:** Never hardcode URLs in API files. Always use `EnvConfig.current.apiBaseUrl`.

### 3. RTL Support for Arabic

**Implementation:**
- `AppLocalizations` handles text direction
- `Directionality` widget wraps the app
- Arabic font (Cairo) vs English font (Inter)
- All UI components respect `TextDirection.rtl`

---

## Feature Development Guide

### How to Add a New Feature

1. **Create feature folder:**
   ```
   lib/features/new_feature/
   ├── data/
   │   ├── datasources/
   │   ├── models/
   │   └── repositories/
   ├── domain/
   │   ├── entities/
   │   ├── repositories/
   │   └── usecases/
   └── presentation/
       ├── bloc/
       ├── screens/
       └── widgets/
   ```

2. **Define the entity** (domain layer)
3. **Create repository interface** (domain layer)
4. **Implement repository** (data layer)
5. **Create use case** (domain layer)
6. **Implement BLoC** (presentation layer)
7. **Build UI screens** (presentation layer)
8. **Add routing** in `app_router.dart`
9. **Register DI** in `di.dart`

---

## Performance Guidelines

### App Startup
- Initialize only critical dependencies in `main()`
- Defer non-critical initializations
- Use `SplashScreen` with initialization progress

### Widget Rebuilds
- Use `const` constructors everywhere
- Implement `Equatable` in all state classes
- Use `BlocSelector` for selective rebuilds

### Images
- Use `cached_network_image` for remote images
- Pre-cache critical assets
- Use appropriate image formats (WebP)

### Lists
- Always use `ListView.builder` for long lists
- Implement pagination with standard pattern
- Use `AutomaticKeepAliveClientMixin` where needed

---

## Security Best Practices

1. **Token Storage:** Always use `flutter_secure_storage`
2. **Logging:** Never log tokens (use `AppLogger.safeLog()`)
3. **Network:** TLS 1.3, certificate pinning (optional)
4. **Input:** Validate all user input
5. **API Keys:** Never commit to repo, use env vars

---

## Testing Strategy

### Unit Tests
- Use cases
- Repositories (mocked data sources)
- BLoCs (mocked use cases)

### Widget Tests
- Screen rendering
- User interactions
- Golden tests for UI components

### Integration Tests
- End-to-end flows
- Real API calls (test environment)

### Mocking
- Use `mocktail` for all mocking
- Mock only external boundaries

---

## CI/CD Pipeline

```
Push to main/develop
        │
        ▼
   ┌─────────┐
   │ Analyze │  ← Lint + Format check
   └────┬────┘
        │
        ▼
   ┌─────────┐
   │  Test   │  ← Unit + Widget tests
   └────┬────┘
        │
        ▼
   ┌─────────┐
   │  Build  │  ← APK + IPA
   └────┬────┘
        │
        ▼
   ┌─────────┐
   │ Deploy  │  ← Firebase Distribution
   └─────────┘
```

---

## Code Generation

Run these commands after adding new injectable classes or Retrofit APIs:

```bash
# Generate DI config
flutter pub run build_runner build --delete-conflicting-outputs

# Generate Retrofit clients
flutter pub run retrofit_generator:build

# Generate Hive adapters
flutter pub run hive_generator:build
```

---

## Getting Started

```bash
# 1. Install dependencies
flutter pub get

# 2. Generate code
flutter pub run build_runner build --delete-conflicting-outputs

# 3. Run with specific flavor
flutter run --flavor dev -t lib/main.dart

# 4. Run tests
flutter test
```

---

## Additional Resources

- [Flutter BLoC Documentation](https://bloclibrary.dev/)
- [Dio Documentation](https://pub.dev/packages/dio)
- [GoRouter Documentation](https://pub.dev/packages/go_router)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
