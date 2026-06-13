"use client";
import { DirectionProvider } from "@radix-ui/react-direction";
import NextTopLoader from "nextjs-toploader";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

import { ThemeProvider } from "./theme-provider";

export const AppProvider = ({
  children,
  dir,
}: {
  children: React.ReactNode;
  dir: "rtl" | "ltr";
}) => {
  return (
    <DirectionProvider dir={dir}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <NextTopLoader color="var(--primary)" showSpinner={false} />
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster position="top-right" />
      </ThemeProvider>
    </DirectionProvider>
  );
};
