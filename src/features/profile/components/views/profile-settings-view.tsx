import { getTranslations } from "next-intl/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { getSession } from "@/lib/auth/get-session";

import { AccountLinkingCard } from "../account-linking-card";
import { ProfileForm } from "../forms/profile-form";

export const ProfileSettingsView = async () => {
  const t = await getTranslations("Settings.profile");
  const session = await getSession();
  if (!session) return null;

  return (
    <div className="space-y-6">
      <Card className="bg-background border-none shadow-none">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm user={session.user} />
        </CardContent>
      </Card>

      <Separator />

      <AccountLinkingCard />
    </div>
  );
};
