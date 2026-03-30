/**
 * ERP-097: i18n configuration — locales and default locale.
 */

export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** RTL locales for layout direction */
export const rtlLocales: Locale[] = ["ar"];

export function isRtl(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}
