// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:taif/main.dart';
import 'package:taif/core/config/env.dart';
import 'package:taif/core/utils/logger.dart';
import 'package:taif/core/theme/bloc/theme_bloc.dart';
import 'package:taif/core/localization/bloc/locale_bloc.dart';

void main() {
  testWidgets('TaifApp builds', (WidgetTester tester) async {
    EnvConfig.initialize(Environment.dev);
    AppLogger.initialize();

    try {
      await tester.pumpWidget(
        MultiBlocProvider(
          providers: [
            BlocProvider(create: (_) => ThemeBloc()),
            BlocProvider(create: (_) => LocaleBloc()),
          ],
          child: const TaifApp(),
        ),
      );

      await tester.pump();
    } catch (e) {
      fail('TaifApp threw during build: $e');
    }

    final exception = tester.takeException();
    if (exception != null) {
      fail('TaifApp threw during build: $exception');
    }
  });
}
