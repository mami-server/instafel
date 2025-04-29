export const defaultLocale = "tr";
export const locales = ["tr", "en"];

export const namespaceGroups = {
  core: ["common"],

  pages: {
    home: ["home"],
    backup: ["backup"],
    library: ["library"],
    settings: ["settings"],
  },
};

export const i18nBaseConfig = {
  supportedLngs: locales,
  fallbackLng: defaultLocale,
  fallbackNS: "common",
  defaultNS: "common",
  react: {
    useSuspense: false, // değişebilir ssr için
  },
};
