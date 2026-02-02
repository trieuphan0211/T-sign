import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "primary" | "warning" | "success" | "pending";
  className?: string;
}

const variantStyles = {
  default: {
    card: "bg-card",
    icon: "bg-secondary text-foreground",
  },
  primary: {
    card: "bg-card",
    icon: "bg-primary/10 text-primary",
  },
  warning: {
    card: "bg-card",
    icon: "bg-warning/10 text-warning",
  },
  success: {
    card: "bg-card",
    icon: "bg-success/10 text-success",
  },
  pending: {
    card: "bg-card",
    icon: "bg-pending/10 text-pending",
  },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  className,
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border p-6 shadow-card transition-all hover:shadow-elevation-2",
        styles.card,
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {trend && (
              <span
                className={cn(
                  "text-sm font-medium",
                  trend.isPositive ? "text-success" : "text-destructive",
                )}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={cn("rounded-xl p-3", styles.icon)}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
