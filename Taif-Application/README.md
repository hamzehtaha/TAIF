# TAIF - Production-Grade Flutter Application

A scalable, maintainable Flutter application following Clean Architecture principles with comprehensive infrastructure for production deployment.

---

## Quick Start

```bash
# Install dependencies
flutter pub get

# Generate code (DI, adapters, etc.)
flutter pub run build_runner build --delete-conflicting-outputs

# Run with dev flavor
flutter run --flavor dev

# Run tests
flutter test
```

---

## Architecture Overview

TAIF uses **Layered Clean Architecture** with:

- **Presentation Layer**: BLoC pattern, Screens, Widgets
- **Domain Layer**: Entities, Use Cases, Repository Interfaces
- **Data Layer**: Models, Repository Implementations, Data Sources

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed documentation.

---

## Key Features

### 1. Centralized Brand Colors (3 colors only)
**File:** `lib/core/theme/app_colors.dart`

- `primary` (0xFF0066CC) - Main CTAs, primary actions
- `secondary` (0xFF00A86B) - Secondary actions, success
- `accent` (0xFFFF6B35) - Warnings, highlights

**Rule:** No hardcoded colors anywhere in the app.

### 2. Centralized Server Base URL
**File:** `lib/core/config/env.dart`

Single source of truth for API base URLs:
- Dev: `https://api-dev.taif.app/v1`
- Staging: `https://api-staging.taif.app/v1`
- Prod: `https://api.taif.app/v1`

**Rule:** Never hardcode URLs in API files.

### 3. Multilingual Support (Arabic + English)
**Files:** `lib/Multilingual/app_*.json`, `lib/core/utils/app_localizations.dart`

- Full RTL/LTR handling
- Arabic font: Cairo
- English font: Inter
- Dynamic language switching

### 4. Production-Ready Infrastructure

| Component | Technology | Purpose |
|-----------|-----------|---------|
| State Management | BLoC (flutter_bloc) | Predictable state |
| Navigation | GoRouter | URL-based routing |
| Networking | Dio + Retrofit | HTTP client |
| DI | GetIt + Injectable | Dependency injection |
| Local Storage | Hive | Caching |
| Secure Storage | flutter_secure_storage | Tokens, secrets |
| Logging | Logger | Structured logging |

---

## Project Structure

```
lib/
├── core/                    # Infrastructure
│   ├── config/             # Environment (dev/stage/prod)
│   ├── di/                 # Dependency injection
│   ├── errors/             # Error handling
│   ├── network/            # Dio client
│   ├── routing/            # Navigation
│   ├── theme/              # Design system (colors, typography)
│   └── utils/              # Utilities (logging, localization)
│
├── features/               # Feature modules
│   ├── auth/
│   ├── home/
│   ├── profile/
│   ├── settings/
│   └── example_feature/   # Reference implementation
│
└── main.dart              # App entry
```

---

## Environment Configuration

```dart
// lib/core/config/env.dart
enum Environment { dev, staging, prod }

// Initialize at app startup
EnvConfig.initialize(Environment.dev);
```

Access configuration anywhere:
```dart
final baseUrl = EnvConfig.current.apiBaseUrl;
final timeout = EnvConfig.current.apiTimeout;
```

---

## Adding a New Feature

1. Create feature folder structure:
```bash
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

2. Define entity (domain)
3. Create repository interface (domain)
4. Implement repository (data)
5. Create use case (domain)
6. Implement BLoC (presentation)
7. Build UI (presentation)
8. Add route in `app_router.dart`
9. Register DI in `di.dart`

---

## Testing

```bash
# Run all tests
flutter test

# Run with coverage
flutter test --coverage

# Run specific test file
flutter test test/unit/example_usecase_test.dart
```

### Test Structure
- `test/unit/` - Unit tests (use cases, repositories)
- `test/widget/` - Widget tests (screens, components)
- `test/integration/` - Integration tests (E2E flows)

---

## CI/CD

GitHub Actions workflow in `.github/workflows/ci.yml`:

1. **Analyze** - Lint + Format check
2. **Test** - Unit + Widget tests with coverage
3. **Build** - Android APK + iOS IPA
4. **Deploy** - Firebase App Distribution

---

## Code Generation

After adding new injectable classes or APIs:

```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

---

## Dependencies

Key packages:

```yaml
# State Management
flutter_bloc: ^8.1.3

# Navigation
go_router: ^13.0.1

# Networking
dio: ^5.4.0
retrofit: ^4.0.3

# DI
get_it: ^7.6.4
injectable: ^2.3.2

# Storage
hive: ^2.2.3
flutter_secure_storage: ^9.0.0

# Utilities
logger: ^2.0.2
dartz: ^0.10.1
```

---

## Security

- JWT stored in secure storage (iOS Keychain/Android Keystore)
- Automatic token refresh handling
- Safe logging (tokens redacted)
- Certificate pinning ready

---

## Performance

- Const constructors for widgets
- Equatable for state classes
- Cached network images
- ListView.builder for long lists
- Request cancellation support

---

## Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - Detailed architecture guide
- [API Documentation] - Add your API docs link
- [Design System] - Add your Figma/design link

---

## License

Proprietary - TAIF Team

---

## Support

For questions or issues:
- Create an issue in the repository
- Contact the development team

---

**Built with ❤️ by the TAIF Team**
