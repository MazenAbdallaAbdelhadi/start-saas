import { Suspense } from "react";
import { useTranslations } from "next-intl";

import { CardWrapper } from "../card-wrapper";
import { RegisterForm } from "../forms/register-form";

export const RegisterView = () => {
  const t = useTranslations("Auth.register");

  return (
    <div className="h-svh flex flex-col items-center justify-center p-4">
      <CardWrapper
        headerLabel={t("title")}
        headerCaption={t("caption")}
        backButtonLabel={t("backButton")}
        backButtonHref={"/login"}
        showSocial
      >
        <Suspense>
          <RegisterForm />
        </Suspense>
      </CardWrapper>
    </div>
  );
};
