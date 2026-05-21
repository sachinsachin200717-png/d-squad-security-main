import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Shield, LayoutDashboard, AlertTriangle, Activity, LogOut, ScanFace } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { logout } from "@/lib/auth";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/fraud", label: "Fraud Detection", icon: ScanFace },
  { to: "/alerts", label: "Scam Alerts", icon: AlertTriangle },
  { to: "/activity", label: "Activity", icon: Activity },
] as const;

export function AppNav() {
  const user = useAuth();
  const nav = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  if (!user) return null;

  return (
    <header className="sticky top-0 z-40 glass-strong border-b border-border/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="rounded-md bg-primary/10 p-2 neon-border">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-lg font-bold tracking-wider gradient-text">CYBER<span className="text-primary">BANK</span></div>
            <div className="font-mono text-[10px] uppercase text-muted-foreground">Security Operations Center</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = path.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all",
                  active
                    ? "bg-primary/15 text-primary shadow-[0_0_18px_oklch(0.85_0.18_195/0.25)]"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <div className="font-mono text-xs text-primary">{user.username.toUpperCase()}</div>
            <div className="text-[10px] uppercase text-muted-foreground">{user.role} · online</div>
          </div>
          <button
            onClick={() => { logout(); nav({ to: "/login" }); }}
            className="flex items-center gap-1.5 rounded-md border border-cyber-red/40 bg-cyber-red/10 px-3 py-2 text-sm text-cyber-red transition-all hover:bg-cyber-red/20 hover:shadow-[0_0_18px_oklch(0.68_0.27_25/0.4)]"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
