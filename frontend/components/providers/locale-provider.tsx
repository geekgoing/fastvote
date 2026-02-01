"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import {
  defaultLocale,
  getMessages,
  getLocaleFromCookie,
  localeCookieName,
  type Locale,
  type Messages,
} from "@/lib/i18n";

type LocaleContextValue = {
  locale: Locale;
  messages: Messages;
  setLocale: (locale: Locale) => void;
  mounted: boolean;
};

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

type LocaleProviderProps = {
  initialLocale?: Locale;
  children: React.ReactNode;
};

const ONE_YEAR = 60 * 60 * 24 * 365;

export function LocaleProvider({ initialLocale, children }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale ?? defaultLocale);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Sync locale from the cookie on the client (default is ko).
    const cookieLocale = getLocaleFromCookie(
      document.cookie
        .split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${localeCookieName}=`))
        ?.split("=")[1]
    );

    if (cookieLocale && cookieLocale !== locale) {
      setLocaleState(cookieLocale);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((nextLocale: Locale) => {
    document.cookie = `${localeCookieName}=${nextLocale}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
    setLocaleState(nextLocale);
  }, []);

  const value = useMemo(
    () => ({
      locale,
      messages: getMessages(locale),
      setLocale,
      mounted,
    }),
    [locale, mounted, setLocale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return context;
}
