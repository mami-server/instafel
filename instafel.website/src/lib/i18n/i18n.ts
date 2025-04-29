import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { i18nBaseConfig } from "@/lib/i18n/config";

let i18nInstance = null;

export async function initializeI18n(namespaces = ["common"]) {
  if (i18nInstance) {
    await i18nInstance.loadNamespaces(namespaces);
    return i18nInstance;
  }

  i18nInstance = i18next
    .use(initReactI18next)
    .use(Backend)
    .use(LanguageDetector);

  await i18nInstance.init({
    ...i18nBaseConfig,
    ns: namespaces,
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

  return i18nInstance;
}

export function getI18nInstance() {
  return i18nInstance;
}

/*import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    supportedLngs: ["en", "tr"],
    fallbackLng: "en",
    lng: "tr",
    debug: true,
    load: "currentOnly",
    ns: [
      "backup",
      "common",
      "download",
      "guides",
      "home",
      "library_backup",
      "updater",
    ],
    defaultNS: "common",
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
    detection: {
      order: ["cookie"],
      lookupQuerystring: "lng",
      lookupCookie: "i18next",
      caches: ["cookie"],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
*/
