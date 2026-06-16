import { getTranslations } from "next-intl/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSession } from "@/lib/auth/get-session";

import { SetPasswordButton } from "./set-password-button";

export const SetPasswordCard = async () => {
  const t = await getTranslations("Settings.security.changePassword");
  const session = await getSession();

  if (!session) return null;

  return (
    <Card className="bg-background border-none shadow-none">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <SetPasswordButton email={session?.user?.email} />
      </CardContent>
    </Card>
  );
};
