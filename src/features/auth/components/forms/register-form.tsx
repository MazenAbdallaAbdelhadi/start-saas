"use client";

import { useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { FieldGroup } from "@/components/ui/field";

import { LoadingButton } from "@/components/loading-button";
import { FormInput, FormPassword } from "@/components/hook-form";

import { authClient } from "@/lib/auth/browser";

import { IRegisterSchema, registerSchema } from "@/features/auth/schemas";
import { useReturnTo } from "@/features/auth/hooks";

export const RegisterForm = () => {
  const t = useTranslations("Auth.register");
  const router = useRouter();

  const [isPending, transition] = useTransition();

  const returnTo = useReturnTo();

  const form = useForm<IRegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  function onSubmit(data: IRegisterSchema) {
    transition(async () => {
      await authClient.signUp.email(
        { ...data, callbackURL: returnTo },
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
        <FormInput
          control={form.control}
          name="name"
          label={t("nameLabel")}
          placeholder={t("namePlaceholder")}
        />
        <FormInput
          control={form.control}
          name="email"
          type="email"
          label={t("emailLabel")}
          placeholder={t("emailPlaceholder")}
        />
        <FormPassword
          control={form.control}
          name="password"
          label={t("passwordLabel")}
          placeholder={t("passwordPlaceholder")}
        />

        <LoadingButton loading={isPending || isSubmitting}>
          {t("submitButton")}
        </LoadingButton>
      </FieldGroup>
    </form>
  );
};
