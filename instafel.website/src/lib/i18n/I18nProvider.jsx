"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import { initializeI18n } from "./i18n";
import { namespaceGroups } from "./config";

const I18nContext = createContext({
  loadNamespaces: async () => {},
  isLoading: false,
  currentNamespaces: [],
});

export function useI18n() {
  return useContext(I18nContext);
}

function resolveNamespaces(nsInput) {
  if (!nsInput) return namespaceGroups.core;

  const result = [...namespaceGroups.core];

  if (typeof nsInput === "string") {
    if (namespaceGroups.pages[nsInput]) {
      result.push(...namespaceGroups.pages[nsInput]);
    } else {
      result.push(nsInput);
    }
  }

  if (Array.isArray(nsInput)) {
    result.push(...nsInput);
  }

  if (typeof nsInput === "object" && nsInput !== null) {
    if (nsInput.pages) {
      const pages = Array.isArray(nsInput.pages)
        ? nsInput.pages
        : [nsInput.pages];
      pages.forEach((page) => {
        if (namespaceGroups.pages[page]) {
          result.push(...namespaceGroups.pages[page]);
        }
      });
    }

    if (nsInput.custom && Array.isArray(nsInput.custom)) {
      result.push(...nsInput.custom);
    }
  }

  return [...new Set(result)];
}

export function I18nProvider({ children, initialNamespaces }) {
  const [i18n, setI18n] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentNamespaces, setCurrentNamespaces] = useState([]);

  const loadNamespaces = async (namespaces) => {
    if (!namespaces || namespaces.length === 0) return;

    const resolvedNamespaces = resolveNamespaces(namespaces);

    const namespacesToLoad = resolvedNamespaces.filter(
      (ns) => !currentNamespaces.includes(ns)
    );

    if (namespacesToLoad.length === 0) return;

    setIsLoading(true);

    try {
      if (i18n) {
        await i18n.loadNamespaces(namespacesToLoad);
      }
      setCurrentNamespaces((prev) => [
        ...new Set([...prev, ...namespacesToLoad]),
      ]);
    } catch (error) {
      console.error("Namespace yükleme hatası:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const resolvedNamespaces = resolveNamespaces(initialNamespaces);
        const i18nInstance = await initializeI18n(resolvedNamespaces);
        setI18n(i18nInstance);
        setCurrentNamespaces(resolvedNamespaces);
      } catch (error) {
        console.error("error while initalizing i18n:", error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const contextValue = {
    loadNamespaces,
    isLoading,
    currentNamespaces,
  };

  if (!i18n) {
    return (
      <div className="flex items-center justify-center h-20">
        i18n is loading...
      </div>
    );
  }

  return (
    <I18nContext.Provider value={contextValue}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </I18nContext.Provider>
  );
}
