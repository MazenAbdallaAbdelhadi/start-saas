import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";

import { CardWrapper } from "../card-wrapper";
import { TotpForm } from "../forms/totp-form";
import { BackupCodeForm } from "../forms/backup-code-form";

export const TwoFactorAuthenticationView = () => {
  const t = useTranslations("Auth.twoFactor");

  return (
    <div className="h-svh flex flex-col items-center justify-center p-4">
      <CardWrapper
        headerLabel={t("title")}
        headerCaption={t("caption")}
        backButtonLabel={t("backButton")}
        backButtonHref="/register"
      >
        <Tabs defaultValue="totp">
          <TabsList className="w-full grid grid-cols-2 mb-8">
            <TabsTrigger value="totp">{t("authenticatorTab")}</TabsTrigger>
            <TabsTrigger value="backup">{t("backupCodeTab")}</TabsTrigger>
          </TabsList>

          <TabsContent value="totp">
            <TotpForm />
          </TabsContent>

          <TabsContent value="backup">
            <BackupCodeForm />
          </TabsContent>
        </Tabs>
      </CardWrapper>
    </div>
  );
};
