"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { MailIcon, ShieldCheckIcon, AlertTriangleIcon } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { LoadingButton } from "@/components/loading-button";
import { authClient } from "@/lib/auth/browser";

import { CardWrapper } from "@/features/auth/components/card-wrapper";

import { organizationApi } from "../../api/organizations";

interface InvitationAcceptanceProps {
  token: string;
  details: {
    id: string;
    organizationName: string;
    inviterName: string;
    role: string | null;
    status: string;
    expiresAt: Date;
  } | null;
}

export const InvitationAcceptance = ({
  token,
  details,
}: InvitationAcceptanceProps) => {
  const t = useTranslations("Auth.invite");
  const router = useRouter();
  const [isAccepting, setIsAccepting] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  const handleAccept = async () => {
    if (!session) {
      toast.error(t("loginRequired"));
      router.push(`/login?returnTo=/invite?token=${token}`);
      return;
    }

    setIsAccepting(true);
    await organizationApi.accept(token, router);
    setIsAccepting(false);
  };

  if (!details) {
    return (
      <CardWrapper
        headerLabel={t("invalidCodeTitle")}
        headerCaption={t("invalidCodeCaption")}
        backButtonLabel={t("invalidCodeBackButton")}
        backButtonHref="/dashboard"
      >
        <div className="flex flex-col items-center gap-6 py-6 text-center">
          <div className="size-20 bg-muted/50 rounded-full flex items-center justify-center border-4 border-muted">
            <AlertTriangleIcon className="size-10 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">
            {t("invalidCodeBody")}
          </p>
        </div>
      </CardWrapper>
    );
  }

  const isExpired = new Date(details.expiresAt) < new Date();
  const isPendingStatus = details.status === "pending";

  if (isExpired) {
    return (
      <CardWrapper
        headerLabel={t("expiredTitle")}
        headerCaption={t("expiredCaption")}
        backButtonLabel={t("expiredBackButton")}
        backButtonHref="/dashboard"
      >
        <div className="flex flex-col items-center gap-6 py-6 text-center text-destructive">
          <div className="size-20 bg-destructive/5 rounded-full flex items-center justify-center border-4 border-destructive/10">
            <AlertTriangleIcon className="size-10" />
          </div>
          <p className="text-muted-foreground text-sm">
            {t("expiredBody", {
              date: new Date(details.expiresAt).toLocaleDateString(),
            })}
          </p>
        </div>
      </CardWrapper>
    );
  }

  if (!isPendingStatus) {
    return (
      <CardWrapper
        headerLabel={t("usedTitle")}
        headerCaption={t("usedCaption")}
        backButtonLabel={t("usedBackButton")}
        backButtonHref="/dashboard"
      >
        <div className="flex flex-col items-center gap-6 py-6 text-center">
          <div className="size-20 bg-emerald-50 rounded-full flex items-center justify-center border-4 border-emerald-100">
            <ShieldCheckIcon className="size-10 text-emerald-600" />
          </div>
          <p className="text-muted-foreground text-sm">
            {t.rich("usedBody", {
              orgName: details.organizationName,
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </p>
        </div>
      </CardWrapper>
    );
  }

  return (
    <CardWrapper
      headerLabel={t("pendingTitle")}
      headerCaption={t("pendingCaption", { orgName: details.organizationName })}
      backButtonLabel={t("pendingBackButton")}
      backButtonHref="/login"
    >
      <div className="flex flex-col items-center gap-8 py-4">
        <div className="size-24 bg-primary/5 rounded-full flex items-center justify-center border-4 border-primary/10 shadow-inner group">
          <MailIcon className="size-12 text-primary group-hover:scale-110 transition-transform duration-300" />
        </div>

        <div className="w-full bg-muted/30 border rounded-xl p-5 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground font-medium">
              {t("inviterLabel")}
            </span>
            <span className="font-semibold text-foreground">
              {details.inviterName}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground font-medium">
              {t("organizationLabel")}
            </span>
            <span className="font-semibold text-foreground">
              {details.organizationName}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground font-medium">
              {t("yourRoleLabel")}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] uppercase font-bold tracking-tight">
              {details.role || "Member"}
            </span>
          </div>
        </div>

        <LoadingButton
          className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20 hover:shadow-xl transition-all"
          onClick={handleAccept}
          disabled={isAccepting || isPending}
          loading={isAccepting || isPending}
        >
          {t("acceptButton")}
        </LoadingButton>
      </div>
    </CardWrapper>
  );
};
