import { getTranslations } from "next-intl/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ChangePasswordForm } from "./forms/change-password-form";

export const ChangePasswordCard = async () => {
  const t = await getTranslations("Settings.security.changePassword");

  return (
    <Card className="bg-background border-none shadow-none">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChangePasswordForm />
      </CardContent>
    </Card>
  );
};
