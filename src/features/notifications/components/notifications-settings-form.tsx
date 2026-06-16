"use client";

import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";

import { AppRouter } from "@/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";

type RouterOutput = inferRouterOutputs<AppRouter>;

export function NotificationsSettingsForm({
  initialSettings,
}: {
  initialSettings: RouterOutput["notifications"]["getSettings"];
}) {
  const t = useTranslations("Settings.notifications.form");
  const [settings, setSettings] = useState(initialSettings);
  const trpc = useTRPC();

  const updateSettingMutation = useMutation(
    trpc.notifications.updateSetting.mutationOptions({
      onSuccess: () => {
        toast.success(t("successToast"), {
          description: t("successToastDescription"),
        });
      },
      onError: () => {
        toast.error(t("updateErrorToast"));
      },
    }),
  );

  const isPending = updateSettingMutation.isPending;
  const [permissionStatus, setPermissionStatus] =
    useState<NotificationPermission | null>(null);

  useEffect(() => {
    if ("Notification" in window) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPermissionStatus(Notification.permission);
    }
  }, []);

  const handleToggle = (type: string, value: boolean) => {
    // Optimistic UI update
    const previousSettings = [...settings];
    setSettings((prev) =>
      prev.map((s) =>
        s.type === type ? { ...s, inApp: value, push: value } : s,
      ),
    );

    updateSettingMutation.mutate(
      { type, inApp: value, push: value },
      {
        onError: () => {
          setSettings(previousSettings); // Revert on failure
        },
      },
    );
  };

  return (
    <div className="space-y-6 pb-20">
      {permissionStatus !== "granted" && permissionStatus !== null ? (
        <div className="bg-destructive/5 border-destructive/20 border p-8 rounded-xl flex flex-col items-center justify-center text-center space-y-5 shadow-sm">
          <div className="p-4 bg-destructive/10 text-destructive rounded-full">
            <BellOff className="w-8 h-8" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="font-semibold text-xl tracking-tight">
              {t("permissionDisabled.title")}
            </h3>
            <p className="text-sm text-foreground/80 leading-relaxed">
              {t("permissionDisabled.description")}
            </p>
          </div>
          <Button
            size="lg"
            className="mt-2"
            onClick={() => {
              if ("Notification" in window) {
                Notification.requestPermission().then((perm) => {
                  setPermissionStatus(perm);
                  if (perm === "granted") {
                    window.location.reload(); // Reload to let useFCM automatically acquire and db-register the new token
                  } else {
                    toast.error(t("permissionDeniedToast"), {
                      description: t("permissionDeniedDescription"),
                    });
                  }
                });
              }
            }}
            variant="default"
          >
            {t("enableNotificationsButton")}
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {settings.map((setting) => (
            <div
              key={setting.type}
              className="flex flex-col gap-4 p-5 rounded-xl border bg-card/60 backdrop-blur-sm text-card-foreground shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 w-10 h-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Bell className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold tracking-tight text-lg">
                    {setting?.meta?.label || setting.type}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {setting?.meta?.description}
                  </p>
                </div>
                <Switch
                  checked={setting.inApp && setting.push}
                  onCheckedChange={(v: boolean) =>
                    handleToggle(setting.type, v)
                  }
                  disabled={isPending}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
