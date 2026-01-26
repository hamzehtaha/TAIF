import { useLanguage } from "./useLanguage";
import { translations } from "@/i18n/translations";

export function useTranslation() {
  const { language } = useLanguage();
  return translations[language];
}
