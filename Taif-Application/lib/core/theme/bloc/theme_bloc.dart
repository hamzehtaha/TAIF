import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';

part 'theme_event.dart';
part 'theme_state.dart';

/// ThemeBloc - Manages app theme mode (light/dark/system)
class ThemeBloc extends Bloc<ThemeEvent, ThemeState> {
  ThemeBloc() : super(const ThemeState(ThemeMode.system)) {
    on<ThemeModeChanged>(_onThemeModeChanged);
    on<ToggleTheme>(_onToggleTheme);
  }

  void _onThemeModeChanged(ThemeModeChanged event, Emitter<ThemeState> emit) {
    emit(ThemeState(event.themeMode));
  }

  void _onToggleTheme(ToggleTheme event, Emitter<ThemeState> emit) {
    final newMode =
        state.themeMode == ThemeMode.light ? ThemeMode.dark : ThemeMode.light;
    emit(ThemeState(newMode));
  }
}
