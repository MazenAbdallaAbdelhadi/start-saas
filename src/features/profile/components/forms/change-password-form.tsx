"use client";

import { useId, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { FieldGroup } from "@/components/ui/field";

import { FormCheckbox, FormPassword } from "@/components/hook-form";
import { LoadingButton } from "@/components/loading-button";

import {
  changePasswordSchema,
  IChangePasswordSchema,
} from "@/features/profile/schemas";

import { authClient } from "@/lib/auth/browser";

export const ChangePasswordForm = () => {
  const t = useTranslations("Settings.security.changePassword.form");
  const toastId = useId();
  const [isPending, transition] = useTransition();

  const form = useForm<IChangePasswordSchema>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      newPasswordConfirm: "",
      revokeOtherSessions: true,
    },
  });

  function onSubmit(data: IChangePasswordSchema) {
    transition(async () => {
      await authClient.changePassword(
        {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
          revokeOtherSessions: data.revokeOtherSessions,
        },
        {
          onRequest: () => {
            toast.loading(t("loadingToast"), { id: toastId });
          },
          onError: (error) => {
            toast.error(error.error.message || t("errorToast"), {
              id: toastId,
            });
          },
          onSuccess: () => {
            toast.success(t("successToast"), { id: toastId });
            form.reset();
          },
        },
      );
    });
  }

  const { isSubmitting, isDirty } = form.formState;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <FormPassword
          control={form.control}
          name="currentPassword"
          label={t("currentPasswordLabel")}
          placeholder={t("currentPasswordPlaceholder")}
        />
        <FormPassword
          control={form.control}
          name="newPassword"
          label={t("newPasswordLabel")}
          placeholder={t("newPasswordPlaceholder")}
        />
        <FormPassword
          control={form.control}
          name="newPasswordConfirm"
          label={t("newPasswordConfirmLabel")}
          placeholder={t("newPasswordConfirmPlaceholder")}
        />
        <FormCheckbox
          control={form.control}
          name="revokeOtherSessions"
          label={t("revokeOtherSessionsLabel")}
        />

        <LoadingButton
          type="submit"
          className="self-end"
          loading={isSubmitting || isPending}
          disabled={!isDirty}
        >
          {t("submitButton")}
        </LoadingButton>
      </FieldGroup>
    </form>
  );
};
