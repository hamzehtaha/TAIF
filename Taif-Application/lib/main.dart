import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'core/config/env.dart';
import 'core/theme/app_theme.dart';
import 'core/theme/bloc/theme_bloc.dart';
import 'core/localization/bloc/locale_bloc.dart';
import 'core/routing/app_router.dart';
import 'core/utils/app_localizations.dart';
import 'core/utils/logger.dart';

/// TAIF Main App Entry Point
/// Configures environment, initializes dependencies, and starts the app
void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Set preferred orientations
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // Initialize environment (dev/staging/prod)
  EnvConfig.initialize(Environment.dev);

  // Initialize logging
  AppLogger.initialize();

  // TODO: Initialize Firebase, crash reporting, analytics
  // await Firebase.initializeApp();

  // TODO: Initialize dependency injection
  // configureDependencies();

  AppLogger.info('🚀 TAIF App starting...');

  runApp(
    MultiBlocProvider(
      providers: [
        BlocProvider(create: (_) => ThemeBloc()),
        BlocProvider(create: (_) => LocaleBloc()),
      ],
      child: const TaifApp(),
    ),
  );
}

/// TAIF Application Root Widget
class TaifApp extends StatelessWidget {
  const TaifApp({super.key});

  @override
  Widget build(BuildContext context) {
    final router = AppRouter.createRouter();

    return BlocBuilder<ThemeBloc, ThemeState>(
      builder: (context, themeState) => BlocBuilder<LocaleBloc, LocaleState>(
        builder: (context, localeState) => MaterialApp.router(
          title: EnvConfig.current.appName,
          debugShowCheckedModeBanner: false,

          // Theme - Dynamic based on Bloc state
          theme: AppTheme.light,
          darkTheme: AppTheme.dark,
          themeMode: themeState.themeMode,

          // Locale - Dynamic based on Bloc state
          locale: localeState.locale,

          // Localization
          localizationsDelegates: const [
            AppLocalizations.delegate,
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          supportedLocales: AppLocalizations.supportedLocales,
          localeResolutionCallback: (locale, supportedLocales) {
            // Use bloc locale if set, otherwise check device locale
            if (localeState.locale.languageCode != 'en') {
              return localeState.locale;
            }

            if (locale == null) return const Locale('en');

            // Check if the current device locale is supported
            for (final supportedLocale in supportedLocales) {
              if (supportedLocale.languageCode == locale.languageCode) {
                return supportedLocale;
              }
            }

            // Default to English if not supported
            return const Locale('en');
          },

          // Routing
          routerConfig: router,
        ),
      ),
    );
  }
}
