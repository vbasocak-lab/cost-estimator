import { getRequestConfig } from "next-intl/server";

const locales = ["fr", "en", "de", "tr"];

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !locales.includes(locale)) {
    locale = "fr";
  }

  return {
    locale,
    timeZone: "Europe/Paris",
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
