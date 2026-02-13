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
  title: {
    default: "FastVote",
    template: "%s | FastVote",
  },
  description: "빠른 익명 투표 - 간편하게 투표를 만들고 공유하세요",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://fastvote.geekgoing.org"),
  openGraph: {
    title: "FastVote",
    description: "빠른 익명 투표 - 간편하게 투표를 만들고 공유하세요",
    siteName: "FastVote",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FastVote - 빠른 익명 투표",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FastVote",
    description: "빠른 익명 투표 - 간편하게 투표를 만들고 공유하세요",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
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
