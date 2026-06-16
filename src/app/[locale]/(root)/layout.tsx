import { auth } from "@/lib/auth/server";
import prisma from "@/lib/prisma";
import { headers, cookies } from "next/headers";
import { redirect } from "@/i18n/navigation";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { BreadcrumbProvider } from "@/components/app-breadcrumb";
import { SiteHeader } from "@/components/site-header";
// import { ImpersonationBanner } from "@/features/admin/components/impersonation-banner";

export default async function PrivatePagesLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect({ href: "/login", locale });
  }

  // Handle sidebar state
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  // 1. Verify existing active organization membership still exists
  let activeOrgId = session?.session.activeOrganizationId ?? undefined;
  if (activeOrgId) {
    const activeMemberRecord = await prisma.member.findFirst({
      where: { organizationId: activeOrgId, userId: session?.user.id },
    });

    // If the member was removed (database record deleted), we clear the activeOrgId from our logic
    if (!activeMemberRecord) {
      activeOrgId = undefined;
    }
  }

  // 2. If no valid active organization, try to pick another one or redirect to onboarding
  if (!activeOrgId && session?.user.role !== "admin") {
    const membership = await prisma.member.findFirst({
      where: { userId: session?.user.id },
      orderBy: { createdAt: "desc" },
    });

    if (membership) {
      // Silently set a new one as active
      await auth.api.setActiveOrganization({
        body: { organizationId: membership.organizationId },
        headers: await headers(),
      });
      // The session in the request is still the old one, but for layout purposes we've attempted activation
    } else {
      redirect({ href: "/onboarding", locale });
    }
  }

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
