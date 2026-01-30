"use client";

import { ThemeProvider } from "next-themes";

import { LocaleProvider } from "@/components/providers/locale-provider";
import type { Locale } from "@/lib/i18n";

type AppProvidersProps = {
  children: React.ReactNode;
  initialLocale: Locale;
};

export function AppProviders({ children, initialLocale }: AppProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="theme"
      disableTransitionOnChange
    >
      <LocaleProvider initialLocale={initialLocale}>{children}</LocaleProvider>
    </ThemeProvider>
  );
}
