"use client";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { PlusIcon, ShieldIcon, Trash2Icon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { ActionButton } from "@/components/action-button";

import {
  SUPPORTED_OAUTH_PROVIDERS,
  SUPPORTED_OAUTH_PROVIDERS_DETAILS,
  SupportedOAuthProvider,
} from "@/constants/o-auth-providers";

import { auth } from "@/lib/auth/server";
import { authClient } from "@/lib/auth/browser";

type Account = Awaited<ReturnType<typeof auth.api.listUserAccounts>>[number];

export const AccountLinkingForm = ({ accounts }: { accounts: Account[] }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Linked Accounts</h3>

        {accounts.length === 0 ? (
          <Card>
            <CardContent>No linked accounts found</CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {accounts.map((account) => (
              <AccountCard
                key={account.id}
                provider={account.providerId}
                account={account}
              />
            ))}
          </div>
        )}
      </div>

      {SUPPORTED_OAUTH_PROVIDERS.filter(
        (provider) => !accounts.find((acc) => acc.providerId === provider),
      ).length === 0 ? null : (
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Link New Account</h3>
          <div className="grid gap-3">
            {SUPPORTED_OAUTH_PROVIDERS.filter(
              (provider) =>
                !accounts.find((acc) => acc.providerId === provider),
            ).map((provider) => (
              <AccountCard key={provider} provider={provider} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const AccountCard = ({
  provider,
  account,
}: {
  provider: string;
  account?: Account;
}) => {
  const router = useRouter();

  const providerDetails = SUPPORTED_OAUTH_PROVIDERS_DETAILS[
    provider as SupportedOAuthProvider
  ] ?? { name: provider, icon: ShieldIcon };

  async function linkAccount() {
    await authClient.linkSocial({
      provider,
      callbackURL: "/settings/profile",
    });
  }

  async function unlinkAccount() {
    if (account == null) {
      throw new Error("Account not found");
    }

    await authClient.unlinkAccount({
      accountId: account.accountId,
      providerId: provider,
    });
  }

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <providerDetails.Icon className="size-5" />
            <div>
              <p className="font-medium">{providerDetails.name}</p>
              {account == null ? (
                <p className="text-sm text-muted-foreground">
                  Connect your {providerDetails.name} account for easier sign-in
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Linked on {new Date(account.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          {account == null ? (
            <ActionButton
              variant="outline"
              size="sm"
              onAction={linkAccount}
              onSuccess={() => {
                router.refresh();
              }}
              onError={(error) => {
                console.error(error);
                toast.error("Failed to link account");
              }}
            >
              <PlusIcon />
              Link
            </ActionButton>
          ) : (
            <ActionButton
              variant="destructive"
              size="sm"
              onAction={unlinkAccount}
              onSuccess={() => {
                router.refresh();
              }}
              onError={(error) => {
                console.error(error);
                toast.error("Failed to unlink account");
              }}
            >
              <Trash2Icon />
              Unlink
            </ActionButton>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
