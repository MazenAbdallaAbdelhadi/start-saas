import { getTranslations } from "next-intl/server";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ThemeSettingsPage() {
  const t = await getTranslations("Settings.theme");

  return (
    <div>
      <Card className="mx-auto max-w-md  bg-background border-none shadow-none">
        <CardHeader className="text-center">
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ModeToggle />
        </CardContent>
      </Card>
    </div>
  );
}
