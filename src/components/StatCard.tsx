import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatCard({
  label, value, delta, tone = "cyan", icon, sub,
}: {
  label: string;
  value: ReactNode;
  delta?: string;
  tone?: "cyan" | "red" | "green" | "yellow";
  icon?: ReactNode;
  sub?: string;
}) {
  const toneRing = {
    cyan: "before:bg-primary",
    red: "before:bg-cyber-red",
    green: "before:bg-cyber-green",
    yellow: "before:bg-cyber-yellow",
  }[tone];
  const toneText = {
    cyan: "text-primary",
    red: "text-cyber-red",
    green: "text-cyber-green",
    yellow: "text-cyber-yellow",
  }[tone];
  return (
    <div className={cn(
      "glass relative overflow-hidden rounded-xl p-5 animate-float-in",
      "before:absolute before:inset-y-0 before:left-0 before:w-[3px]",
      toneRing,
    )}>
      <div className="flex items-start justify-between">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{label}</div>
          <div className={cn("mt-2 font-display text-3xl font-bold", toneText)}>{value}</div>
          {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
        </div>
        {icon && <div className={cn("rounded-lg bg-background/40 p-2.5", toneText)}>{icon}</div>}
      </div>
      {delta && <div className="mt-3 font-mono text-xs text-cyber-green">▲ {delta}</div>}
    </div>
  );
}
