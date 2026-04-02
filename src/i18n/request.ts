/**
 * ERP-097: i18n configuration placeholder.
 * next-intl integration will be wired when pages start using useTranslations().
 * For now, provides locale detection + message loading utilities.
 */

import { defaultLocale, locales, type Locale } from "./config";

export async function getLocale(cookieValue?: string, acceptLanguage?: string): Promise<Locale> {
  if (cookieValue && (locales as readonly string[]).includes(cookieValue)) {
    return cookieValue as Locale;
  }
  if (acceptLanguage) {
    const preferred = acceptLanguage.split(",")[0]?.split("-")[0]?.trim();
    if (preferred && (locales as readonly string[]).includes(preferred)) {
      return preferred as Locale;
    }
  }
  return defaultLocale;
}

export async function getMessages(locale: Locale): Promise<Record<string, string>> {
  const messages = (await import(`./messages/${locale}.json`)).default;
  return messages;
}
