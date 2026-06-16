import { getSession } from "@/lib/auth/get-session";
import prisma from "@/lib/prisma";

import { Skeleton } from "@/components/ui/skeleton";

import { OrganizationMembersAvatars } from "./organization-members-avatars";

export const SiteOrganizationMembers = async () => {
  const session = await getSession();

  if (!session?.session.activeOrganizationId) {
    return null;
  }

  const members = await prisma.member.findMany({
    where: {
      organizationId: session.session.activeOrganizationId,
    },

    select: {
      id: true,
      role: true,
      user: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <OrganizationMembersAvatars
      members={members.map((m) => ({
        id: m.id,
        role: m.role,
        user: m.user,
      }))}
    />
  );
};

export const SiteOrganizationMembersSkeleton = () => {
  return (
    <div className="flex -space-x-2 items-center">
      <Skeleton className="size-8 rounded-full border-2 border-background" />
      <Skeleton className="size-8 rounded-full border-2 border-background" />
      <Skeleton className="size-8 rounded-full border-2 border-background" />
    </div>
  );
};
