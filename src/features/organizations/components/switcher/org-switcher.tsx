"use client";

import { BuildingIcon, ChevronsUpDownIcon, SettingsIcon } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authClient } from "@/lib/auth/browser";
import { organizationApi } from "../../api/organizations";
import { PlanBadge } from "../plan-badge";
import { hasPermission, PERMISSIONS } from "@/constants/permissions";

export const OrgSwitcher = () => {
  const t = useTranslations("Sidebar");
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: activeOrg } = authClient.useActiveOrganization();
  const { data: listData } = authClient.useListOrganizations();

  const { data: membership } = authClient.useActiveMember();

  const canViewOrgSettings = hasPermission(
    membership?.role,
    PERMISSIONS.VIEW_ORG_SETTINGS,
  );
  const list = listData ?? [];

  if (!activeOrg) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Avatar className="size-8 rounded-lg">
            <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
              {activeOrg.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
            {activeOrg.logo && <AvatarImage src={activeOrg.logo} />}
          </Avatar>

          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{activeOrg.name}</span>
            <div className="flex items-center gap-1 mt-0.5">
              <PlanBadge plan={activeOrg.plan} />
            </div>
          </div>

          <ChevronsUpDownIcon className="ms-auto size-4 shrink-0 opacity-50" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        align="start"
        sideOffset={4}
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          {t("organizations")}
        </DropdownMenuLabel>

        {list.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={async () => {
              await organizationApi.setActive(org.id, router);
              queryClient.clear();
            }}
            className="gap-2 p-2"
          >
            <div className="flex size-6 items-center justify-center rounded-sm border">
              <BuildingIcon className="size-4 shrink-0" />
            </div>
            <span className="flex-1 truncate">{org.name}</span>
            <PlanBadge plan={org.plan} className="h-4" />
          </DropdownMenuItem>
        ))}

        {/* <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            href="/onboarding"
            className="gap-2 p-2 focus:bg-accent focus:text-accent-foreground"
          >
            <div className="flex size-6 items-center justify-center rounded-sm border bg-background text-foreground">
              <PlusIcon className="size-4" />
            </div>
            <div className="font-medium">{t("subscribeToWorkspace")}</div>
          </Link>
        </DropdownMenuItem> */}

        {canViewOrgSettings && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/settings/organization"
                className="gap-2 p-2 focus:bg-accent focus:text-accent-foreground"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border bg-background text-foreground">
                  <SettingsIcon className="size-4" />
                </div>
                <div className="font-medium">{t("organizationSettings")}</div>
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
