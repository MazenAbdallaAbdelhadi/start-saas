import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { auth } from "@/lib/auth/server";
import { AccountLinkingForm } from "./forms/account-linking-form";

export const AccountLinkingCard = async () => {
  const t = await getTranslations("Settings.profile.accounts");
  const accounts = await auth.api.listUserAccounts({
    headers: await headers(),
  });
  const nonCredentialAccounts = accounts.filter(
    (account) => account.providerId !== "credential",
  );

  return (
    <Card className="bg-background border-none shadow-none">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <AccountLinkingForm accounts={nonCredentialAccounts} />
      </CardContent>
    </Card>
  );
};
