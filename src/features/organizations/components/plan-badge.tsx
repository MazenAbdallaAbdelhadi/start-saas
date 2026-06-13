import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PlanBadgeProps {
  plan?: string | null;
  className?: string;
}

export const PlanBadge = ({ plan, className }: PlanBadgeProps) => {
  const normalizedPlan = (plan || "FREE").toUpperCase();

  const variantsColors: Record<string, string> = {
    FREE: "bg-muted text-muted-foreground border-transparent",
    PLUS: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-900",
    PRO: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-900",
  };

  const selectedClass = variantsColors[normalizedPlan] || variantsColors.FREE;

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium uppercase tracking-wider text-[10px] px-1.5 py-0 h-4.5 rounded-sm select-none shadow-none",
        selectedClass,
        className
      )}
    >
      {normalizedPlan}
    </Badge>
  );
};
