import prisma from "@/lib/prisma";

import { isWithinLimit } from "@/constants/entitlements";

/**
 * Returns the total number of taken seats.
 * Pending invitations (not expired) are counted as active seats.
 */
export async function getOrganizationSeatUsage(
  organizationId: string,
): Promise<number> {
  const [memberCount, pendingInviteCount] = await prisma.$transaction([
    prisma.member.count({
      where: { organizationId },
    }),
    prisma.invitation.count({
      where: {
        organizationId,
        status: "pending",
        expiresAt: {
          gt: new Date(),
        },
      },
    }),
  ]);

  return memberCount + pendingInviteCount;
}

/**
 * Validates if the organization can take another member based on its plan limit.
 */
export async function canAddMember(organizationId: string): Promise<boolean> {
  const currentUsage = await getOrganizationSeatUsage(organizationId);
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
  });

  if (!organization) {
    throw new Error("Organization not found");
  }

  return isWithinLimit(organization, currentUsage, "maxMembers");
}

/**
 * Fetches invitation details including organization name and inviter name.
 */
export async function getInvitationDetails(id: string) {
  const invitation = await prisma.invitation.findUnique({
    where: { id },
    include: {
      organization: {
        select: {
          name: true,
        },
      },
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!invitation) return null;

  return {
    id: invitation.id,
    organizationName: invitation.organization.name,
    inviterName: invitation.user.name,
    role: invitation.role,
    status: invitation.status,
    expiresAt: invitation.expiresAt,
  };
}
