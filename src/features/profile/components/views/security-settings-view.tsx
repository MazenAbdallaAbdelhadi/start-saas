import { headers } from "next/headers";

import { Separator } from "@/components/ui/separator";

import { auth } from "@/lib/auth/server";

import { TwoFactorAuthenticationCard } from "../two-factor-authentication-card";
import { SessionManagmentCard } from "../session-managment-card";
import { ChangePasswordCard } from "../change-password-card";
import { DeleteAccountCard } from "../delete-account-card";
import { SetPasswordCard } from "../set-password-card";

export const SecuritySettingsView = async () => {
  const accounts = await auth.api.listUserAccounts({
    headers: await headers(),
  });
  const hasPasswordAccount = accounts.some(
    (account) => account.providerId === "credential",
  );

  return (
    <div className="flex flex-col gap-2">
      {hasPasswordAccount ? (
        <>
          <ChangePasswordCard />
          <Separator />
          <TwoFactorAuthenticationCard />
        </>
      ) : <SetPasswordCard />}
      <Separator />
      <SessionManagmentCard />
      <DeleteAccountCard />
    </div>
  );
};
