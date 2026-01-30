import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AppProviders } from "@/components/providers/app-providers";
import { defaultLocale, getLocaleFromCookie, localeCookieName } from "@/lib/i18n";
import { cookies } from "next/headers";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FastVote",
  description: "빠른 익명 투표",
  icons: {
    icon: "/fastvote.png",
    shortcut: "/fastvote.png",
    apple: "/fastvote.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read locale cookie server-side using Next.js cookies() API
  const cookieLocale = await cookies().then((c) => c.get(localeCookieName)?.value ?? undefined);
  const locale = getLocaleFromCookie(cookieLocale ?? defaultLocale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProviders initialLocale={locale}>{children}</AppProviders>
      </body>
    </html>
  );
}
