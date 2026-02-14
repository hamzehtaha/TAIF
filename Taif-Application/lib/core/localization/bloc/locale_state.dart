part of 'locale_bloc.dart';

class LocaleState extends Equatable {
  final Locale locale;

  const LocaleState(this.locale);

  bool get isArabic => locale.languageCode == 'ar';
  bool get isEnglish => locale.languageCode == 'en';

  @override
  List<Object> get props => [locale];
}
