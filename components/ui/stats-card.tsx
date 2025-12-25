import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
  iconColor?: string
}

export function StatsCard({ title, value, description, icon: Icon, trend, className, iconColor }: StatsCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/50 bg-card p-3 transition-all duration-200 hover:border-border hover:shadow-sm sm:p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1.5 sm:space-y-3 min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground sm:text-[13px] line-clamp-1">{title}</p>
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <p className="text-xl font-semibold tracking-tight text-foreground sm:text-3xl">{value}</p>
            {trend && (
              <span
                className={cn(
                  "text-[10px] font-medium sm:text-xs",
                  trend.isPositive ? "text-success" : "text-destructive",
                )}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}%
              </span>
            )}
          </div>
          {description && <p className="text-[10px] text-muted-foreground sm:text-xs">{description}</p>}
        </div>
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors sm:h-10 sm:w-10",
            iconColor || "bg-primary/[0.08]",
          )}
        >
          <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", iconColor ? "text-foreground" : "text-primary")} />
        </div>
      </div>
    </div>
  )
}
