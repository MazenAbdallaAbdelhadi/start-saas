"use client";

import { SparklesIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/browser";

interface GetStartedStepProps {
  onCreateClick: () => void;
}

export const GetStartedStep = ({ onCreateClick }: GetStartedStepProps) => {
  const t = useTranslations("Onboarding.getStarted");
  const { data: session } = authClient.useSession();

  const firstName = session?.user?.name.split(" ")[0] || "there";

  return (
    <div className="text-center space-y-10 py-12">
      <div className="space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          {t("title", { name: firstName })}
        </h1>
        <p className="text-muted-foreground text-lg max-w-lg mx-auto">
          {t("description")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 max-w-md mx-auto">
        <Card
          className="group relative hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer border-2 py-0 overflow-hidden bg-card"
          onClick={onCreateClick}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-colors" />

          <CardContent className="flex-1 p-8 flex flex-col items-center gap-6 relative z-10">
            <div className="inline-flex px-3 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest mb-2">
              {t("subscribe.badge")}
            </div>

            <div className="size-16 rounded-2xl flex items-center justify-center transition-all bg-primary/10 group-hover:bg-primary/20 group-hover:scale-110 shadow-inner">
              <SparklesIcon className="size-8 text-primary" />
            </div>

            <div className="space-y-2 text-center">
              <h3 className="text-2xl font-bold tracking-tight">
                {t("subscribe.title")}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("subscribe.description")}
              </p>
            </div>

            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-4xl font-bold">{t("subscribe.price")}</span>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                {t("subscribe.priceDesc")}
              </span>
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-4">
            <Button className="w-full h-12 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)] group-hover:shadow-[0_0_25px_rgba(var(--primary-rgb),0.4)] transition-all">
              {t("subscribe.button")}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
