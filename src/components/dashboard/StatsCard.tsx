import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({ title, value, icon, trend, className }: StatsCardProps) {
  return (
    <Card className={cn("group hover:shadow-lg transition-all duration-300 hover:border-primary/30", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {trend && (
              <div className={cn(
                "flex items-center gap-1 text-xs font-medium",
                trend.isPositive ? "text-chart-1" : "text-destructive"
              )}>
                <span>{trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%</span>
                <span className="text-muted-foreground">vs last month</span>
              </div>
            )}
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
