"use client";
import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { UAParser } from "ua-parser-js";
import { Session } from "better-auth";
import { toast } from "sonner";
import { MonitorIcon, SmartphoneIcon, Trash2Icon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { LoadingButton } from "@/components/loading-button";

import { authClient } from "@/lib/auth/browser";

export const SessionCard = ({
  isCurrentSession = false,
  session,
}: {
  isCurrentSession?: boolean;
  session: Session;
}) => {
  const t = useTranslations("Settings.security.sessions");
  const router = useRouter();
  const [isPending, transition] = useTransition();

  const userAgentInfo = session.userAgent ? UAParser(session.userAgent) : null;

  function getBrowserInfo() {
    if (userAgentInfo === null) return t("unknownDevice");
    if (userAgentInfo.os.name === null && userAgentInfo.browser.name === null)
      return t("unknownDevice");

    if (userAgentInfo.browser.name === null) return userAgentInfo.os.name;
    if (userAgentInfo.os.name === null) return userAgentInfo.browser.name;

    return `${userAgentInfo.browser.name}, ${userAgentInfo.os.name}`;
  }

  function formatDate(date: Date) {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  }

  async function revokeSession() {
    await authClient.revokeSession(
      { token: session.token },
      {
        onSuccess: () => {
          toast.success(t("revokeSessionToast"));
          router.refresh();
        },
      },
    );
  }

  return (
    <Card>
      <CardHeader className="flex justify-between">
        <CardTitle>{getBrowserInfo()}</CardTitle>
        {isCurrentSession && <Badge>{t("currentSession")}</Badge>}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {userAgentInfo?.device.type === "mobile" ? (
              <SmartphoneIcon />
            ) : (
              <MonitorIcon />
            )}

            <div>
              <p className="text-sm text-muted-foreground">
                {t("created")} {formatDate(session.createdAt)}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("expires")} {formatDate(session.expiresAt)}
              </p>
            </div>
          </div>

          {!isCurrentSession && (
            <LoadingButton
              variant="destructive"
              size="icon-sm"
              onClick={() => transition(() => revokeSession())}
              loading={isPending}
            >
              <Trash2Icon />
            </LoadingButton>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
