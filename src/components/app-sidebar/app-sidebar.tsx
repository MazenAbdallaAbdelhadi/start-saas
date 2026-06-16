"use client";
import {
  SettingsIcon,
  LayoutDashboardIcon,
  Users2Icon,
  ShieldIcon,
  BuildingIcon,
  MegaphoneIcon,
  HelpCircleIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { isRtlLang } from "rtl-detect";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";

import { UserSidebarButton } from "@/features/auth";

import { authClient } from "@/lib/auth/browser";

import { NavMain } from "./nav-main";
import { Logo } from "../logo";

export const AppSidebar = ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  const t = useTranslations("Sidebar");
  const { data: session } = authClient.useSession();
  const locale = useLocale();

  const isRTL = isRtlLang(locale);

  const isSysAdmin = session?.user?.role === "admin";

  const mainNavData = [
    {
      title: t("dashboard"),
      href: "/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: t("contacts"),
      href: "/contacts",
      icon: Users2Icon,
    },
  ];

  const settingsItems = [
    {
      title: t("settings"),
      href: "/settings",
      icon: SettingsIcon,
    },
    {
      title: t("feedbackSupport"),
      href: "https://forms.gle/B1VGAEzUoxTtGc528",
      icon: HelpCircleIcon,
      external: true,
    },
  ];

  const sysAdminItems = [
    {
      title: t("platformUsers"),
      href: "/admin/users",
      icon: ShieldIcon,
    },
    {
      title: t("workspaces"),
      href: "/admin/organizations",
      icon: BuildingIcon,
    },
    {
      title: t("broadcasts"),
      href: "/admin/broadcasts",
      icon: MegaphoneIcon,
    },
  ];

  return (
    <Sidebar
      variant="inset"
      collapsible="icon"
      side={isRTL ? "right" : "left"}
      {...props}
    >
      <SidebarHeader>
        <Logo />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={mainNavData} label={t("mainMenu")} />
        <NavMain items={settingsItems} label={t("settingsGroup")} />
        {isSysAdmin && (
          <NavMain items={sysAdminItems} label={t("sysAdminControl")} />
        )}
      </SidebarContent>

      <SidebarFooter>
        <UserSidebarButton />
      </SidebarFooter>
    </Sidebar>
  );
};
