"use client";

import { useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";

import { FormInput, RHFField } from "@/components/hook-form";
import { LoadingButton } from "@/components/loading-button";
import { PasswordInput } from "@/components/password-input";

import { authClient } from "@/lib/auth/browser";

import { ILoginSchema, loginSchema } from "@/features/auth/schemas";
import { useReturnTo } from "@/features/auth/hooks";

export const LoginForm = () => {
  const t = useTranslations("Auth.login");
  const router = useRouter();

  const [isPending, transition] = useTransition();

  const returnTo = useReturnTo();

  const form = useForm<ILoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(data: ILoginSchema) {
    transition(async () => {
      await authClient.signIn.email(
        {
          ...data,
        },
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
          name="email"
          type="email"
          label={t("emailLabel")}
          placeholder={t("emailPlaceholder")}
        />

        <RHFField control={form.control} name="password">
          {(field, fieldState) => {
            const errorElement = fieldState.invalid && (
              <FieldError errors={[fieldState.error]} />
            );

            return (
              <Field data-invalid={fieldState.invalid}>
                <FieldContent className="flex flex-row justify-between items-center">
                  <FieldLabel htmlFor={field.name}>
                    {t("passwordLabel")}
                  </FieldLabel>
                  <Button variant={"link"} className="text-sm p-0" asChild>
                    <Link href={"/forgot-password"}>{t("forgotPassword")}</Link>
                  </Button>
                </FieldContent>

                <PasswordInput
                  {...field}
                  placeholder={t("passwordPlaceholder")}
                />

                {errorElement}
              </Field>
            );
          }}
        </RHFField>

        <LoadingButton loading={isPending || isSubmitting}>
          {t("submitButton")}
        </LoadingButton>
      </FieldGroup>
    </form>
  );
};
