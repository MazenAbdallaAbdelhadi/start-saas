"use client";

import { useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { FieldGroup } from "@/components/ui/field";

import { LoadingButton } from "@/components/loading-button";
import { FormInput } from "@/components/hook-form";

import { authClient } from "@/lib/auth/browser";

import { ITotpSchema, totpSchema } from "@/features/auth/schemas";
import { useReturnTo } from "@/features/auth/hooks";

export const TotpForm = () => {
  const t = useTranslations("Auth.twoFactor");
  const router = useRouter();
  const [isPending, transition] = useTransition();

  const returnTo = useReturnTo();

  const form = useForm<ITotpSchema>({
    resolver: zodResolver(totpSchema),
    defaultValues: {
      code: "",
    },
  });

  function onSubmit(data: ITotpSchema) {
    transition(async () => {
      authClient.twoFactor.verifyTotp(
        { ...data },
        {
          onError: (error) => {
            toast.error(error.error.message || t("errorToast"));
          },
          onSuccess: () => {
            toast.success(t("successToast"));
            router.push(returnTo);
          },
        },
      );
    });
  }

  const { isSubmitting } = form.formState;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <FormInput control={form.control} name="code" label={t("codeLabel")} />

        <LoadingButton loading={isPending || isSubmitting}>
          {t("submitButton")}
        </LoadingButton>
      </FieldGroup>
    </form>
  );
};
