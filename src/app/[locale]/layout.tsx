import type { Metadata } from "next";
import {
  Plus_Jakarta_Sans,
  Lora,
  IBM_Plex_Mono,
  Cairo,
} from "next/font/google";
import "@/app/globals.css";

import { NuqsAdapter } from "nuqs/adapters/next/app";

import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { isRtlLang } from "rtl-detect";
import { notFound } from "next/navigation";

import { TRPCReactProvider } from "@/trpc/client";
import { AppProvider } from "@/components/providers";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontSerif = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
});

const fontMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "QuickRelate",
  description:
    "whatsapp CRM for businesses to manage their customer relationships and interactions effectively.",
  icons: {
    icon: "/favicon.ico",
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  // Ensure that the incoming `locale` is valid
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const isRTL = isRtlLang(locale);

  // Enable static rendering
  setRequestLocale(locale);

  return (
    <NextIntlClientProvider locale={locale}>
      <html
        lang={locale}
        dir={isRTL ? "rtl" : "ltr"}
        className={cn(
          `${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} h-full antialiased scroll-smooth`,
          {
            [cairo.variable]: isRTL,
          },
        )}
        suppressHydrationWarning
      >
        <body className="min-h-full">
          <TRPCReactProvider>
            <NuqsAdapter>
              <AppProvider dir={isRTL ? "rtl" : "ltr"}>{children}</AppProvider>
            </NuqsAdapter>
          </TRPCReactProvider>
        </body>
      </html>
    </NextIntlClientProvider>
  );
}
