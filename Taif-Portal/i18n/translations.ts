import enTranslations from './en.json';
import arTranslations from './ar.json';

export const translations = {
  en: enTranslations,
  ar: arTranslations,
};

export type Language = "en" | "ar";
export type TranslationKeys = typeof enTranslations;
