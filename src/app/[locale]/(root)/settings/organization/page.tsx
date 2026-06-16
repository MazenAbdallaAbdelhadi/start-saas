import { BuildingIcon } from "lucide-react";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";

import { auth } from "@/lib/auth/server";
import prisma from "@/lib/prisma";
import { Separator } from "@/components/ui/separator";
import { OrganizationSettingsForm } from "@/features/organizations/components/settings/organization-settings-form";
import { DangerZone } from "@/features/organizations/components/settings/danger-zone";
import { hasPermission, PERMISSIONS } from "@/constants/permissions";

export default async function OrganizationSettingsPage(
  params: Promise<{ locale: string }>,
) {
  const { locale } = await params;
  const t = await getTranslations("Settings.organization");
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.session.activeOrganizationId) {
    redirect({ href: "/onboarding", locale });
  }

  const activeOrgId = session?.session.activeOrganizationId ?? undefined;
  const [activeOrg, currentMember] = await Promise.all([
    auth.api.getFullOrganization({
      query: { organizationId: activeOrgId },
      headers: await headers(),
    }),
    prisma.member.findFirst({
      where: { organizationId: activeOrgId, userId: session?.user.id },
    }),
  ]);

  if (
    !activeOrg ||
    !hasPermission(currentMember?.role, PERMISSIONS.VIEW_ORG_SETTINGS)
  ) {
    redirect({ href: "/dashboard", locale });
  }

  const canEdit = hasPermission(
    currentMember?.role,
    PERMISSIONS.MANAGE_ORG_SETTINGS,
  );

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-10">
      <div className="space-y-1 pb-6 border-b">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <BuildingIcon className="size-8 text-primary" />
          {t("generalTitle")}
        </h1>
        <p className="text-muted-foreground font-medium">
          {t("generalDescription")}
        </p>
      </div>

      {/* CORE INFO SECTION */}
      <OrganizationSettingsForm
        organization={{
          id: activeOrg?.id ?? "",
          name: activeOrg?.name ?? "",
          slug: activeOrg?.slug ?? "",
        }}
        canEdit={canEdit}
      />

      {/* DANGER ZONE */}
      {canEdit && <DangerZone organizationId={activeOrg?.id ?? ""} />}

      <Separator className="my-12 opacity-50" />

      <div className="text-center">
        <p className="text-muted-foreground text-xs leading-relaxed">
          {t("organizationIdLabel")}{" "}
          <code className="bg-muted px-2 py-0.5 rounded-sm font-bold select-all">
            {activeOrg?.id}
          </code>
        </p>
      </div>
    </div>
  );
}
