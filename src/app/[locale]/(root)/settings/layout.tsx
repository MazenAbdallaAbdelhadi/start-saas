"use client";
import { PropsWithChildren } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import {
  BellIcon,
  ShieldCheck,
  SunMoonIcon,
  UserCircleIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function SettingsLayout({ children }: PropsWithChildren) {
  const t = useTranslations("Settings.menu");
  const pathname = usePathname();

  const settingsMenu = [
    {
      label: t("profile"),
      href: "/profile",
      icon: UserCircleIcon,
    },
    {
      label: t("security"),
      href: "/security",
      icon: ShieldCheck,
    },
    {
      label: t("notifications"),
      href: "/notifications",
      icon: BellIcon,
    },
    {
      label: t("theme"),
      href: "/theme",
      icon: SunMoonIcon,
    },
  ];

  return (
    <div className="flex flex-col h-full gap-6 px-2 md:px-4 py-4 md:py-6">
      <ScrollArea>
        <div className="flex gap-2 items-center">
          {settingsMenu.map((item) => (
            <Button
              key={item.href}
              variant={pathname.endsWith(item.href) ? "secondary" : "ghost"}
              asChild
            >
              <Link href={`/settings${item.href}`}>
                <item.icon />
                <span>{item.label}</span>
              </Link>
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <div className=" flex-1 mx-4 my-2">
        <div className="max-w-4xl mx-auto">{children}</div>
      </div>
    </div>
  );
}
