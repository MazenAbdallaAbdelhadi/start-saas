import { useTranslations } from "next-intl";
import { CardWrapper } from "../card-wrapper";
import { ForgotPasswordForm } from "../forms/forgot-password-form";

export const ForgotPasswordView = () => {
  const t = useTranslations("Auth.forgotPassword");

  return (
    <div className="h-svh flex flex-col items-center justify-center p-4">
      <CardWrapper
        headerLabel={t("title")}
        headerCaption={t("caption")}
        backButtonLabel={t("backButton")}
        backButtonHref={"/login"}
        showSocial
      >
        <ForgotPasswordForm />
      </CardWrapper>
    </div>
  );
};
