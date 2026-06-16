"use client";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { LucideIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export const NavMain = ({
  items,
  label = "Menu",
}: {
  items: {
    href: string;
    title: string;
    icon?: LucideIcon;
    badge?: number;
    external?: boolean;
  }[];
  label?: string;
}) => {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                isActive={!item.external && pathname.includes(item.href)}
                asChild
              >
                {item.external ? (
                  <a href={item.href} target="_blank" rel="noopener noreferrer">
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </a>
                ) : (
                  <Link href={item.href} prefetch>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                )}
              </SidebarMenuButton>

              {!!item.badge && (
                <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
