"use client";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Trash2Icon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ActionButton } from "@/components/action-button";

import { authClient } from "@/lib/auth/browser";

export const DeleteAccountCard = () => {
  const t = useTranslations("Settings.security.dangerZone");
  const router = useRouter();

  return (
    <Card className="bg-destructive/5 border-destructive/10 shadow-none">
      <CardHeader>
        <CardTitle className="text-destructive/90">{t("title")}</CardTitle>
        <CardDescription className="text-destructive/90">
          {t("description")}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex justify-between">
          <div className="flex flex-col">
            <span>{t("deleteProfile.title")}</span>
            <span className="text-xs text-muted-foreground">
              {t("deleteProfile.description")}
            </span>
          </div>

          <ActionButton
            onAction={async () => {
              await authClient.deleteUser({ callbackURL: "/" });
            }}
            variant="destructive"
            title={t("deleteProfile.confirmTitle")}
            confirmText={t("deleteProfile.confirmText")}
            confirmVariant="destructive"
            onSuccess={() => router.push("/register")}
            onError={(error) => console.error("Action failed:", error)}
          >
            <Trash2Icon />
            <span>{t("deleteProfile.button")}</span>
          </ActionButton>
        </div>
      </CardContent>
    </Card>
  );
};
