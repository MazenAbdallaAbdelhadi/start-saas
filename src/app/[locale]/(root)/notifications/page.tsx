import { useTranslations } from "next-intl";

import { NotificationsList } from "@/features/notifications/components/notifications-list";
import { Separator } from "@/components/ui/separator";

export default function NotificationsPage() {
  const t = useTranslations("Notifications.page");

  return (
    <div className="flex-1 space-y-6 max-w-5xl mx-auto p-8 pt-8 w-full">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">{t("title")}</h2>
          <p className="text-muted-foreground text-sm">{t("description")}</p>
        </div>
      </div>
      <Separator />

      <NotificationsList />
    </div>
  );
}
