import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { CardWrapper } from "../card-wrapper";
import { ResetPasswordForm } from "../forms/reset-password-form";

export const ResetPasswordView = () => {
  const t = useTranslations("Auth.resetPassword");

  return (
    <div className="h-svh flex flex-col items-center justify-center p-4">
      <CardWrapper
        headerLabel={t("title")}
        headerCaption={t("caption")}
        backButtonLabel={t("backButton")}
        backButtonHref={"/login"}
      >
        <Suspense>
          <ResetPasswordForm />
        </Suspense>
      </CardWrapper>
    </div>
  );
};
