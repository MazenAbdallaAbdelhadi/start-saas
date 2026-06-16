import { cookies } from "next/headers";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { BreadcrumbProvider } from "@/components/app-breadcrumb";
import { SiteHeader } from "@/components/site-header";
// import { ImpersonationBanner } from "@/features/admin/components/impersonation-banner";

export default async function PrivatePagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Handle sidebar state
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 60)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar collapsible="icon" variant="inset" />
      <SidebarInset>
        {/* {session?.session.impersonatedBy && <ImpersonationBanner />} */}
        <BreadcrumbProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
        </BreadcrumbProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}
