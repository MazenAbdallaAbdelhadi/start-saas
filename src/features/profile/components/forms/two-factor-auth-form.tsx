"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import QRCode from "react-qr-code";
import { toast } from "sonner";

import { FieldGroup } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

import { FormInput, FormPassword } from "@/components/hook-form";
import { LoadingButton } from "@/components/loading-button";

import { authClient } from "@/lib/auth/browser";

import {
  IQrSchema,
  ITwoFactorAuthSchema,
  qrSchema,
  twoFactorAuthSchema,
} from "@/features/profile/schemas";

type TwoFactorData = {
  qrCodeUrl: string;
  recoveryCodes: string[];
};

export const TwoFactorAuthForm = ({ isEnabled }: { isEnabled: boolean }) => {
  const t = useTranslations("Settings.security.twoFactor.form");
  const [isPending, transition] = useTransition();

  const router = useRouter();

  const [twoFactorData, setTwoFactorData] = useState<TwoFactorData | null>(
    null,
  );

  const form = useForm<ITwoFactorAuthSchema>({
    resolver: zodResolver(twoFactorAuthSchema),
    defaultValues: {
      password: "",
    },
  });

  function onSubmit(data: ITwoFactorAuthSchema) {
    transition(async () => {
      // if enable then disable it
      if (isEnabled) {
        await authClient.twoFactor.disable(
          { password: data.password },
          {
            onError: (error) => {
              toast.error(error.error.message || t("disableError"));
            },
            onSuccess: () => {
              toast.success(t("disableSuccess"));
              form.reset();
              router.refresh();
            },
          },
        );
      }
      // if disable then enable it
      else {
        const result = await authClient.twoFactor.enable({
          password: data.password,
        });

        if (result.error) {
          toast.error(result.error.message || t("enableError"));
          return;
        } else {
          setTwoFactorData({
            qrCodeUrl: result.data.totpURI,
            recoveryCodes: result.data.backupCodes,
          });
          form.reset();
        }
      }
    });
  }

  if (twoFactorData) {
    return (
      <QRCodeVerify {...twoFactorData} onDone={() => setTwoFactorData(null)} />
    );
  }

  const { isSubmitting } = form.formState;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <FormPassword
          control={form.control}
          name="password"
          label={t("passwordLabel")}
          placeholder={t("passwordPlaceholder")}
        />

        <LoadingButton
          type="submit"
          variant={isEnabled ? "destructive" : "default"}
          className="self-end"
          loading={isSubmitting || isPending}
        >
          {isEnabled ? t("disableButton") : t("enableButton")}
        </LoadingButton>
      </FieldGroup>
    </form>
  );
};

const QRCodeVerify = ({
  qrCodeUrl,
  recoveryCodes,
  onDone,
}: TwoFactorData & { onDone: () => void }) => {
  const t = useTranslations("Settings.security.twoFactor.form");
  const [isPending, transition] = useTransition();

  const router = useRouter();
  const [success, setSucess] = useState(false);

  const form = useForm<IQrSchema>({
    resolver: zodResolver(qrSchema),
    defaultValues: {
      token: "",
    },
  });

  function onSubmit(data: IQrSchema) {
    transition(async () => {
      await authClient.twoFactor.verifyTotp(
        { code: data.token },
        {
          onError: (error) => {
            toast.error(error.error.message || t("verifyError"));
          },
          onSuccess: () => {
            router.refresh();
            setSucess(true);
          },
        },
      );
    });
  }

  if (success) {
    return (
      <>
        <p className="text-sm text-muted-foreground mb-2">
          {t("backupCodesDescription")}
        </p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {recoveryCodes.map((code) => (
            <div key={code} className="font-mono text-sm">
              {code}
            </div>
          ))}
        </div>
        <Button variant="outline" onClick={onDone}>
          {t("doneButton")}
        </Button>
      </>
    );
  }

  const { isSubmitting } = form.formState;

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">{t("qrDescription")}</p>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <FormInput
            control={form.control}
            name="token"
            label={t("codeLabel")}
          />

          <LoadingButton
            type="submit"
            className="self-end"
            loading={isSubmitting || isPending}
          >
            {t("submitCodeButton")}
          </LoadingButton>
        </FieldGroup>
      </form>

      <div className="p-4 bg-white w-fit">
        <QRCode size={256} value={qrCodeUrl} />
      </div>
    </div>
  );
};
