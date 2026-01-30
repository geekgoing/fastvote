import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { defaultLocale, isLocale, localeCookieName } from "@/lib/i18n";

export function middleware(request: NextRequest) {
  const cookieLocale = request.cookies.get(localeCookieName)?.value;
  const resolvedLocale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;
  const response = NextResponse.next();

  if (cookieLocale !== resolvedLocale) {
    response.cookies.set(localeCookieName, resolvedLocale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
