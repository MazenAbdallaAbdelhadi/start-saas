import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";

import {
  apiPrefix,
  authRoutes,
  DEFAULT_LOGIN_REDIRECT,
  publicRoutes,
} from "@/constants/routes";

import { getSession } from "@/lib/auth/get-session";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

function isAuthRoute(pathname: string) {
  return authRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );
}

function isPublicRoute(pathname: string) {
  return publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );
}

function isApiRoute(pathname: string) {
  return pathname.startsWith(apiPrefix);
}

export async function proxy(request: NextRequest) {
  try {
    const { nextUrl } = request;

    // 1. Extract pathname without locale for route matching
    const pathSegments = nextUrl.pathname.split("/");
    const hasLocalePrefix = routing.locales.includes(
      pathSegments[1] as "en" | "ar",
    );
    const localePrefix = hasLocalePrefix ? `/${pathSegments[1]}` : "";

    const pathnameWithoutLocale = hasLocalePrefix
      ? "/" + pathSegments.slice(2).join("/")
      : nextUrl.pathname;

    if (isApiRoute(pathnameWithoutLocale)) {
      // API routes typically don't need internationalization middleware
      return NextResponse.next();
    }

    const session = await getSession();
    const isLoggedIn = !!session;
    const isAdmin = session?.user?.role === "admin";

    if (isAuthRoute(pathnameWithoutLocale)) {
      if (isLoggedIn) {
        const returnTo =
          nextUrl.searchParams.get("returnTo") || DEFAULT_LOGIN_REDIRECT;

        return NextResponse.redirect(
          new URL(`${localePrefix}${returnTo}`, nextUrl),
        );
      }
      return intlMiddleware(request);
    }

    if (!isLoggedIn && !isPublicRoute(pathnameWithoutLocale)) {
      let callbackUrl = pathnameWithoutLocale;

      if (nextUrl.search) {
        callbackUrl += nextUrl.search;
      }

      const encodedCallbackUrl = encodeURIComponent(callbackUrl);

      return NextResponse.redirect(
        new URL(
          `${localePrefix}/login?returnTo=${encodedCallbackUrl}`,
          nextUrl,
        ),
      );
    }

    // Proceed to next-intl middleware for all other requests
    return intlMiddleware(request);
  } catch (error) {
    console.error("[PROXY] unexpected error", error);
    // Since we caught an error, also preserve locale if it was there
    const pathSegments = request.nextUrl.pathname.split("/");
    const hasLocalePrefix = routing.locales.includes(
      pathSegments[1] as "en" | "ar",
    );
    const localePrefix = hasLocalePrefix ? `/${pathSegments[1]}` : "";
    return NextResponse.redirect(
      new URL(`${localePrefix}/login`, request.nextUrl),
    );
  }
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    // "/(api|trpc)(.*)",
  ],
};
