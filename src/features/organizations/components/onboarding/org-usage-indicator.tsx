import { cn } from "@/lib/utils";

interface OrgUsageIndicatorProps {
  used: number;
  limit: number;
  className?: string;
  showWarning?: boolean;
}

export const OrgUsageIndicator = ({ used, limit, className, showWarning = true }: OrgUsageIndicatorProps) => {
  const percentage = Math.min((used / limit) * 100, 100);
  const remaining = Math.max(limit - used, 0);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-end text-sm">
        <div className="space-y-0.5">
          <p className="font-semibold text-foreground text-xs uppercase tracking-wider">Workspace Limit</p>
          <p className="text-[11px] text-muted-foreground">{used} of {limit} organizations used</p>
        </div>
        <div className="text-right">
          <p className={cn(
            "text-[11px] font-bold uppercase",
            percentage >= 100 ? "text-destructive" : percentage >= 80 ? "text-amber-500" : "text-emerald-500"
          )}>
            {remaining} {remaining === 1 ? 'workspace' : 'workspaces'} left
          </p>
        </div>
      </div>
      
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden shadow-inner">
        <div 
          className={cn(
            "h-full transition-all duration-500 rounded-full",
            percentage >= 100 ? "bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.4)]" : 
            percentage >= 80 ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" : 
            "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {showWarning && percentage >= 100 && (
        <div className="p-2.5 rounded-lg bg-destructive/5 border border-destructive/10 animate-pulse">
          <p className="text-[10px] text-destructive font-bold text-center uppercase tracking-tight">
            ⚠️ Limit Reached. Upgrade your plan to create more workspaces.
          </p>
        </div>
      )}
    </div>
  );
};
