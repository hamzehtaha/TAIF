import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// TAIF Localization Delegate
/// Custom delegate for loading AR/EN translations with RTL support
class AppLocalizations {
  final Locale locale;
  late Map<String, String> _localizedStrings;

  AppLocalizations(this.locale);

  static AppLocalizations? of(BuildContext context) =>
      Localizations.of<AppLocalizations>(context, AppLocalizations);

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  static const List<Locale> supportedLocales = [
    Locale('en', ''), // English
    Locale('ar', ''), // Arabic
  ];

  Future<bool> load() async {
    final jsonString = await rootBundle.loadString(
      'lib/Multilingual/app_${locale.languageCode}.json',
    );
    final Map<String, dynamic> jsonMap =
        json.decode(jsonString) as Map<String, dynamic>;

    _localizedStrings =
        jsonMap.map((key, value) => MapEntry(key, value.toString()));

    return true;
  }

  String translate(String key, {Map<String, String>? params}) {
    var translation = _localizedStrings[key] ?? key;

    if (params != null) {
      params.forEach((paramKey, paramValue) {
        translation = translation.replaceAll('{$paramKey}', paramValue);
      });
    }

    return translation;
  }

  /// Current language code
  String get languageCode => locale.languageCode;

  /// Check if current locale is RTL (Arabic)
  bool get isRtl => locale.languageCode == 'ar';

  /// Get appropriate text direction
  TextDirection get textDirection =>
      isRtl ? TextDirection.rtl : TextDirection.ltr;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) => ['en', 'ar'].contains(locale.languageCode);

  @override
  Future<AppLocalizations> load(Locale locale) async {
    final localizations = AppLocalizations(locale);
    await localizations.load();
    return localizations;
  }

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

/// Extension for easy access in widgets
extension AppLocalizationsExtension on BuildContext {
  AppLocalizations get l10n => AppLocalizations.of(this)!;
  bool get isRtl => l10n.isRtl;
  TextDirection get textDirection => l10n.textDirection;
}
