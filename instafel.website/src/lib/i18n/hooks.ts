"use client";

import { useTranslation as useTranslationOriginal } from "react-i18next";
import { useEffect } from "react";
import { useI18n } from "./I18nProvider";

export function useTranslationSafe(namespaces) {
  const { loadNamespaces, isLoading } = useI18n();

  useEffect(() => {
    if (namespaces) {
      loadNamespaces(namespaces);
    }
  }, [namespaces, loadNamespaces]);

  return {
    ...useTranslationOriginal(
      Array.isArray(namespaces) ? namespaces : [namespaces]
    ),
    isLoading,
  };
}
