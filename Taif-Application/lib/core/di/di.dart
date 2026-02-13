import 'package:get_it/get_it.dart';

/// TAIF Dependency Injection Container
/// Uses GetIt for dependency injection
///
/// NOTE: Run `flutter pub run build_runner build` to generate DI configuration
/// after adding new @injectable annotated classes
final GetIt getIt = GetIt.instance;

/// Initialize dependencies
/// This will be replaced with generated code after running build_runner
void configureDependencies() {
  // TODO: Add your dependencies here or run build_runner to generate
  // Example:
  // getIt.registerSingleton<NetworkClient>(NetworkClient());
}

/// Shortcut for getting dependencies
T get<T extends Object>() => getIt<T>();
