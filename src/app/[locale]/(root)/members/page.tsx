import { headers } from "next/headers";
import { redirect } from "@/i18n/navigation";

import { hasPermission, PERMISSIONS } from "@/constants/permissions";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth/server";

import { getOrganizationSeatUsage } from "@/features/organizations/server/service";
import { MembersView } from "@/features/organizations/components/members/members-view";

export default async function MembersPage(params: Promise<{ locale: string }>) {
  const { locale } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.session.activeOrganizationId) {
    redirect({ href: "/onboarding", locale });
  }

  const activeOrgId = session?.session.activeOrganizationId ?? undefined;

  // Parallel fetch for UI speed
  const [activeOrg, members, currentMember, invitations, seatUsage] =
    await Promise.all([
      auth.api.getFullOrganization({
        query: { organizationId: activeOrgId },
        headers: await headers(),
      }),
      prisma.member.findMany({
        where: { organizationId: activeOrgId },
        include: { user: true },
      }),
      prisma.member.findFirst({
        where: { organizationId: activeOrgId, userId: session?.user.id },
      }),
      prisma.invitation.findMany({
        where: { organizationId: activeOrgId, status: "pending" },
      }),
      getOrganizationSeatUsage(activeOrgId ?? ""),
    ]);

  if (
    !activeOrg ||
    !hasPermission(currentMember?.role, PERMISSIONS.MANAGE_MEMBERS)
  ) {
    redirect({ href: "/dashboard", locale });
  }

  return (
    <MembersView
      currentMember={currentMember}
      activeOrg={
        activeOrg
          ? {
              id: activeOrg.id,
              plan: activeOrg.plan,
            }
          : null
      }
      invitations={invitations}
      members={members}
      seatUsage={seatUsage}
    />
  );
}
