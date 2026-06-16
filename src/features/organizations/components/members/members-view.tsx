import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ShieldIcon, SparklesIcon, UsersIcon } from "lucide-react";

import { ENTITLEMENTS, type Role } from "@/constants/entitlements";
import { hasPermission, PERMISSIONS } from "@/constants/permissions";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { MembersTable } from "./members-list";
import { SeatUsageBar } from "./seat-usage-bar";
import { InviteMemberDialog } from "./invite-member-dialog";

import type { Invitation, Member, User } from "@/generated/prisma/client";

type MemberWithUser = Member & { user: User };

interface MembersViewProps {
  currentMember: Member | null;
  activeOrg: {
    plan: string | undefined;
    id: string;
  } | null;
  invitations: Invitation[];
  members: MemberWithUser[];
  seatUsage: number;
}

export const MembersView = async ({
  currentMember,
  activeOrg,
  invitations,
  members,
  seatUsage,
}: MembersViewProps) => {
  const t = await getTranslations("Settings.members");

  const canManageMembers = hasPermission(
    currentMember?.role,
    PERMISSIONS.MANAGE_MEMBERS,
  );
  const canManageBilling = hasPermission(
    currentMember?.role,
    PERMISSIONS.MANAGE_BILLING,
  );

  const planLimit =
    ENTITLEMENTS[(activeOrg?.plan as keyof typeof ENTITLEMENTS) ?? "CORE"]
      .maxMembers;

  const activeOrgId = activeOrg?.id ?? undefined;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/60">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <UsersIcon className="size-8 text-primary" />
            {t("title")}
          </h1>
          <p className="text-muted-foreground font-medium">
            {t("description")}
          </p>
        </div>
        {canManageMembers && (
          <InviteMemberDialog organizationId={activeOrgId ?? ""} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* MEMBERS LIST - MAIN CONTENT */}
        <div className="lg:col-span-2">
          <MembersTable
            currentMemberId={currentMember?.id}
            currentUserRole={(currentMember?.role as Role) ?? "member"}
            members={members.map((m) => ({
              id: m.id,
              name: m.user.name,
              email: m.user.email,
              role: m.role,
              image: m.user.image || undefined,
            }))}
            invitations={
              canManageMembers
                ? invitations
                    .filter((i) => i.status === "pending")
                    .map((i) => ({
                      id: i.id,
                      email: i.email,
                      role: i.role || "member",
                      status: i.status,
                    }))
                : []
            }
          />
        </div>

        {/* SIDEBAR - USAGE & PLAN */}
        <div className="space-y-6">
          <Card className="border-2 shadow-md bg-card/60 backdrop-blur-xs overflow-hidden py-0">
            <CardHeader className="p-6 bg-muted/20 border-b">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <ShieldIcon className="size-5 text-primary" />
                {t("orgStatistics")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              <SeatUsageBar used={seatUsage} limit={planLimit} />

              <div className="pt-6 border-t space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border-2 border-primary/10">
                  <SparklesIcon className="size-8 text-primary shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-foreground capitalize">
                      {t("plan")}: {activeOrg?.plan || "Free"}
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-snug">
                      You&apos;re currently using the basic tier with essential
                      features.
                    </p>
                  </div>
                </div>

                {canManageBilling && (
                  <Button
                    className="w-full font-bold h-11 shadow-sm"
                    variant="secondary"
                    asChild
                  >
                    <Link href="/settings/billing">
                      {t("upgradeWorkspace")}
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="p-6 rounded-2xl bg-muted/30 border border-dashed text-center space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest leading-relaxed">
              {t("proTip")}
            </p>
            <p className="text-sm text-balance leading-relaxed">
              {t("proTipDescription")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
