import { ReactNode } from "react";
import { Metadata } from "next";
import { Logo } from "@/components/logo";
import { LogoutButton } from "@/features/auth";

export const metadata: Metadata = {
  title: "Onboarding | QuickRelate",
  description: "Set up your organization and start collaborating.",
};

export default function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-svh flex flex-col bg-background selection:bg-primary/10">
      <header className="h-16 px-6 flex items-center justify-between shrink-0 border-b bg-background/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Logo className="size-16" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xl font-bold tracking-tight">
              QuickRelate
            </span>
            <span className="text-xs text-muted-foreground">
              Turn chats into customers
            </span>
          </div>
        </div>

        <LogoutButton>
          <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md hover:bg-muted/50">
            Log out
          </button>
        </LogoutButton>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center ">
        <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] mask-[radial-gradient(ellipse_50%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
        {children}
      </main>

      <footer className="h-14 px-6 flex items-center justify-center shrink-0 border-t bg-muted/20 text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} QuickRelate Inc. All rights reserved.
      </footer>
    </div>
  );
}
