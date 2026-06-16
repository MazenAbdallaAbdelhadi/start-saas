"use client";
import { toast } from "sonner";

import { ActionButton } from "@/components/action-button";
import { authClient } from "@/lib/auth/browser";

export const SetPasswordButton = ({ email }: { email: string }) => {
  return (
    <ActionButton
      onAction={async () => {
        await authClient.requestPasswordReset({
          email,
        });
      }}
      onSuccess={() => {
        toast.success("Password reset email sent");
      }}
      onError={() => {
        toast.error("Failed to send password reset email");
      }}
      variant="outline"
      title="Set Password"
      description="You will receive an email with a link to set your password"
      confirmText="Send Password Reset Email"
    >
      <span>Set Password</span>
    </ActionButton>
  );
};
