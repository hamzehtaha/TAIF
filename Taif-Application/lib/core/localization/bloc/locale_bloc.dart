import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';

part 'locale_event.dart';
part 'locale_state.dart';

/// LocaleBloc - Manages app language/locale
class LocaleBloc extends Bloc<LocaleEvent, LocaleState> {
  LocaleBloc() : super(const LocaleState(Locale('en'))) {
    on<LocaleChanged>(_onLocaleChanged);
  }

  void _onLocaleChanged(LocaleChanged event, Emitter<LocaleState> emit) {
    emit(LocaleState(event.locale));
  }
}
