import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { defaultLocale, locales, type Locale } from "./config";

/**
 * ERP-097: next-intl server configuration.
 * Reads locale from cs_locale cookie or Accept-Language header.
 */
export default getRequestConfig(async () => {
  let locale: Locale = defaultLocale;

  // 1. Try cookie first
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("cs_locale")?.value;
  if (cookieLocale && (locales as readonly string[]).includes(cookieLocale)) {
    locale = cookieLocale as Locale;
  } else {
    // 2. Fall back to Accept-Language header
    const headerStore = await headers();
    const acceptLanguage = headerStore.get("accept-language") ?? "";
    const preferred = acceptLanguage.split(",")[0]?.split("-")[0]?.trim();
    if (preferred && (locales as readonly string[]).includes(preferred)) {
      locale = preferred as Locale;
    }
  }

  const messages = (await import(`./messages/${locale}.json`)).default;

  return {
    locale,
    messages,
  };
});
