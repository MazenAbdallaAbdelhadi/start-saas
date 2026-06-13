"use client";

import { useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { FieldGroup } from "@/components/ui/field";

import { LoadingButton } from "@/components/loading-button";
import { FormPassword } from "@/components/hook-form";

import { authClient } from "@/lib/auth/browser";

import {
  IResetPasswordSchema,
  resetPasswordSchema,
} from "@/features/auth/schemas";

export const ResetPasswordForm = () => {
  const t = useTranslations("Auth.resetPassword");
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isPending, transition] = useTransition();

  const form = useForm<IResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: searchParams.get("token") || "",
      newPassword: "",
    },
  });

  function onSubmit(data: IResetPasswordSchema) {
    transition(async () => {
      await authClient.resetPassword(
        { ...data },
        {
          onError: (error) => {
            toast.error(error.error.message || t("errorToast"));
          },
          onSuccess: () => {
            toast.success(t("successToast"));
            router.push("/login");
          },
        },
      );
    });
  }

  const { isSubmitting } = form.formState;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <FormPassword
          control={form.control}
          name="newPassword"
          label={t("newPasswordLabel")}
          placeholder={t("newPasswordPlaceholder")}
        />

        <LoadingButton loading={isPending || isSubmitting}>
          {t("submitButton")}
        </LoadingButton>
      </FieldGroup>
    </form>
  );
};
