import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description: string;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, icon, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-accent/30 to-background border p-6 md:p-8", className)}>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          {icon && (
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 shadow-sm">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-serif text-foreground">{title}</h1>
            <p className="text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
