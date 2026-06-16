import { getTranslations } from "next-intl/server";
import { NotificationsSettingsForm } from "@/features/notifications/components/notifications-settings-form";
import { Separator } from "@/components/ui/separator";
import { trpc, getQueryClient } from "@/trpc/server";

export default async function NotificationsSettingsPage() {
  const t = await getTranslations("Settings.notifications");
  const queryClient = getQueryClient();
  const settings = await queryClient.fetchQuery(
    trpc.notifications.getSettings.queryOptions(),
  );

  return (
    <div className="flex-1 space-y-6 max-w-4xl pt-6">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>
      <Separator />
      <NotificationsSettingsForm initialSettings={settings} />
    </div>
  );
}
