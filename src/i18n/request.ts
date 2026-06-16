import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  // Force cache invalidation for JSON files
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  // Merge all split namespace files together
  return {
    locale,
    messages: {
      ...(await import(`../messages/${locale}/common.json`)).default,
      ...(await import(`../messages/${locale}/auth.json`)).default,
      ...(await import(`../messages/${locale}/onboarding.json`)).default,
      ...(await import(`../messages/${locale}/settings.json`)).default,
      ...(await import(`../messages/${locale}/sidebar.json`)).default,
      ...(await import(`../messages/${locale}/site-header.json`)).default,
      ...(await import(`../messages/${locale}/notifications.json`)).default,
    },
  };
});
