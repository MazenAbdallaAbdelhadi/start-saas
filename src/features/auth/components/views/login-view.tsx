import { Suspense } from "react";
import { useTranslations } from "next-intl";

import { CardWrapper } from "../card-wrapper";
import { LoginForm } from "../forms/login-form";

export const LoginView = () => {
  const t = useTranslations("Auth.login");

  return (
    <div className="h-svh flex flex-col items-center justify-center p-4">
      <CardWrapper
        headerLabel={t("title")}
        headerCaption={t("caption")}
        backButtonLabel={t("backButton")}
        backButtonHref={"/register"}
        showSocial
      >
        <Suspense>
          <LoginForm />
        </Suspense>
      </CardWrapper>
    </div>
  );
};
