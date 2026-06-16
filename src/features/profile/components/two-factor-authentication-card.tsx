import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getSession } from "@/lib/auth/get-session";

import { TwoFactorAuthForm } from "./forms/two-factor-auth-form";

export const TwoFactorAuthenticationCard = async () => {
  const t = await getTranslations("Settings.security.twoFactor");
  const session = await getSession();
  if (!session) return null;

  const isTwoFactorEnabled = session.user.twoFactorEnabled ?? false;

  return (
    <Card className="bg-background border-none shadow-none">
      <CardHeader className="flex items-center justify-between gap-2">
        <CardTitle>{t("title")}</CardTitle>
        <Badge variant={isTwoFactorEnabled ? "default" : "secondary"}>
          {isTwoFactorEnabled ? t("enabled") : t("disabled")}
        </Badge>
      </CardHeader>
      <CardContent>
        <TwoFactorAuthForm isEnabled={isTwoFactorEnabled} />
      </CardContent>
    </Card>
  );
};
