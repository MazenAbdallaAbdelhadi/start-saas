import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { auth } from "@/lib/auth/server";
import { getSession } from "@/lib/auth/get-session";

import { SessionManagmentForm } from "./forms/session-managment-form";

export const SessionManagmentCard = async () => {
  const t = await getTranslations("Settings.security.sessions");
  const sessions = await auth.api.listSessions({ headers: await headers() });
  const currentSession = await getSession();

  return (
    <Card className="bg-background border-none shadow-none">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <SessionManagmentForm
          sessions={sessions}
          currentSessionToken={currentSession!.session.token}
        />
      </CardContent>
    </Card>
  );
};
