import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Bell, ShieldOff, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { generateScamAlerts, RISK_BG, type RiskLevel } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/alerts")({
  head: () => ({ meta: [{ title: "Scam Alerts — CyberBank SOC" }] }),
  component: AlertsPage,
});

function AlertsPage() {
  const initial = useMemo(() => generateScamAlerts(10), []);
  const [alerts, setAlerts] = useState(initial);
  const [muted, setMuted] = useState(true);

  // Auto-inject a new alert every ~12s for the live feel
  useEffect(() => {
    const id = setInterval(() => {
      const fresh = generateScamAlerts(1)[0];
      const newAlert = { ...fresh, id: `live-${Date.now()}`, time: new Date().toISOString() };
      setAlerts((prev) => [newAlert, ...prev].slice(0, 24));
      if (newAlert.severity === "CRITICAL" || newAlert.severity === "HIGH") {
        toast.error(`⚠ ${newAlert.type}`, { description: newAlert.message });
      }
    }, 12000);
    return () => clearInterval(id);
  }, []);

  const counts = useMemo(() => {
    const m: Record<RiskLevel, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    alerts.forEach((a) => (m[a.severity] += 1));
    return m;
  }, [alerts]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-widest text-primary">Module · Real-Time Scam Alerts</div>
          <h1 className="font-display text-3xl font-bold">Scam <span className="gradient-text">Alert Engine</span></h1>
          <p className="text-sm text-muted-foreground">Phishing, OTP, KYC, UPI and device-takeover alerts streaming in real time.</p>
        </div>
        <button
          onClick={() => setMuted((m) => !m)}
          className="flex items-center gap-2 rounded-md border border-border bg-card/40 px-3 py-2 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-all hover:border-primary/60 hover:text-primary"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-primary" />}
          {muted ? "Alerts Muted" : "Alerts Live"}
        </button>
      </header>

      <div className="grid gap-3 sm:grid-cols-4">
        {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as RiskLevel[]).map((lvl) => (
          <div key={lvl} className={`rounded-xl border p-4 ${RISK_BG[lvl]} ${lvl === "CRITICAL" ? "" : "bg-opacity-10"}`}>
            <div className="font-mono text-[10px] uppercase tracking-widest opacity-80">{lvl}</div>
            <div className="font-display text-3xl font-bold">{counts[lvl]}</div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {alerts.map((a) => (
          <article
            key={a.id}
            className={`glass relative overflow-hidden rounded-xl p-4 animate-float-in ${
              a.severity === "CRITICAL" ? "danger-border animate-pulse-glow" : ""
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`shrink-0 rounded-lg p-3 ${
                a.severity === "CRITICAL" || a.severity === "HIGH" ? "bg-cyber-red/15 text-cyber-red" : "bg-primary/15 text-primary"
              }`}>
                {a.severity === "CRITICAL" ? <ShieldOff className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg font-semibold">{a.type}</h3>
                  <span className={`rounded border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest ${RISK_BG[a.severity]}`}>
                    {a.severity}
                  </span>
                  <span className="ml-auto font-mono text-[11px] uppercase text-muted-foreground">
                    {new Date(a.time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{a.message}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  <Bell className="h-3 w-3 text-primary" /> Source: <span className="text-primary">{a.source}</span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
