import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface SeatUsageBarProps {
  used: number;
  limit: number;
  className?: string;
}

export const SeatUsageBar = ({ used, limit, className }: SeatUsageBarProps) => {
  const t = useTranslations("Settings.members");
  const percentage = Math.min((used / limit) * 100, 100);
  const remaining = limit - used;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex justify-between items-end text-sm">
        <div className="space-y-0.5">
          <p className="font-semibold text-foreground">{t("seatUsage")}</p>
          <p className="text-xs text-muted-foreground">
            {used} of {limit} members used
          </p>
        </div>
        <div className="text-right">
          <p
            className={cn(
              "font-medium",
              percentage >= 100
                ? "text-destructive"
                : percentage >= 80
                  ? "text-amber-500"
                  : "text-emerald-500",
            )}
          >
            {remaining}{" "}
            {remaining === 1 ? t("seatRemaining") : t("seatsRemaining")}
          </p>
        </div>
      </div>

      <div className="h-3 w-full bg-muted rounded-full overflow-hidden shadow-inner">
        <div
          className={cn(
            "h-full transition-all duration-500 rounded-full",
            percentage >= 100
              ? "bg-destructive"
              : percentage >= 80
                ? "bg-amber-500"
                : "bg-emerald-500",
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {percentage >= 100 && (
        <p className="text-[11px] text-destructive font-medium flex items-center gap-1 animate-pulse">
          ⚠️ {t("organizationFull")}
        </p>
      )}
    </div>
  );
};
