"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { ShieldAlertIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActionButton } from "@/components/action-button";

import { organizationApi } from "../../api/organizations";

interface DangerZoneProps {
  organizationId: string;
}

export const DangerZone = ({ organizationId }: DangerZoneProps) => {
  const t = useTranslations("Settings.organization.dangerZone");
  const router = useRouter();

  const handleDelete = async () => {
    await organizationApi.delete(organizationId, router);
  };

  const handleArchive = () => {
    toast.info(t("archiveToast"));
  };

  return (
    <Card className="border-destructive/30 border-2 bg-destructive/5 overflow-hidden shadow-lg shadow-destructive/5 py-0">
      <CardHeader className="bg-destructive/10 p-6 flex flex-row items-center gap-4">
        <div className="size-12 rounded-xl bg-destructive/10 flex items-center justify-center border border-destructive/20">
          <ShieldAlertIcon className="size-6 text-destructive" />
        </div>
        <div className="space-y-1 flex-1">
          <CardTitle className="text-xl font-bold text-destructive">
            {t("title")}
          </CardTitle>
          <CardDescription className="text-destructive/70 font-bold">
            {t("description")}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-8 space-y-6 text-foreground/80">
        <div className="flex items-center justify-between gap-4 p-5 rounded-xl border border-destructive/10 bg-background/50">
          <div className="space-y-1">
            <p className="text-sm font-bold text-foreground">
              {t("archive.title")}
            </p>
            <p className="text-xs text-muted-foreground font-medium">
              {t("archive.description")}
            </p>
          </div>
          <Button
            onClick={handleArchive}
            variant="secondary"
            className="font-bold border-destructive/20 text-destructive hover:bg-destructive/5"
          >
            {t("archive.button")}
          </Button>
        </div>

        <div className="flex items-center justify-between gap-4 p-5 rounded-xl border border-destructive/20 bg-background/50 shadow-sm transition-all hover:bg-destructive/5 duration-300">
          <div className="space-y-1">
            <p className="text-sm font-bold text-foreground">
              {t("delete.title")}
            </p>
            <p className="text-xs text-muted-foreground font-medium opacity-70">
              {t("delete.description")}
            </p>
          </div>
          <ActionButton
            title={t("delete.confirmTitle")}
            description={t("delete.confirmDescription")}
            cancelText={t("delete.cancelText")}
            confirmText={t("delete.confirmText")}
            onAction={handleDelete}
            variant="destructive"
            className="font-bold shadow-md shadow-destructive/20 py-5"
          >
            <Trash2Icon className="size-4 me-2" />
            {t("delete.confirmText")}
          </ActionButton>
        </div>
      </CardContent>
    </Card>
  );
};
