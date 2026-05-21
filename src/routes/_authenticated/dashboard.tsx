import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Activity, AlertTriangle, ShieldCheck, Wifi, IndianRupee, Users } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar, CartesianGrid,
} from "recharts";
import { StatCard } from "@/components/StatCard";
import { DeviceAlertBanner } from "@/components/DeviceAlertBanner";
import { generateBankingRows, RISK_BG, type RiskLevel } from "@/lib/mock-data";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — CyberBank SOC" }] }),
  component: Dashboard,
});

function Dashboard() {
  const user = useAuth();
  const rows = useMemo(() => generateBankingRows(40), []);

  const stats = useMemo(() => {
    const total = rows.length;
    const critical = rows.filter((r) => r.risk === "CRITICAL").length;
    const high = rows.filter((r) => r.risk === "HIGH").length;
    const blocked = rows.filter((r) => r.otpStatus === "FAILED" || r.otpStatus === "BYPASSED").length;
    const volume = rows.reduce((s, r) => s + r.amount, 0);
    return { total, critical, high, blocked, volume };
  }, [rows]);

  const timeline = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        t: `${String(i * 2).padStart(2, "0")}:00`,
        threats: 4 + Math.round(Math.sin(i * 0.6) * 6 + Math.random() * 6),
        blocked: 2 + Math.round(Math.cos(i * 0.5) * 4 + Math.random() * 4),
      })),
    [],
  );

  const riskDist: { name: RiskLevel; value: number }[] = useMemo(() => {
    const m: Record<RiskLevel, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    rows.forEach((r) => (m[r.risk] += 1));
    return (Object.keys(m) as RiskLevel[]).map((k) => ({ name: k, value: m[k] }));
  }, [rows]);

  const RISK_HEX: Record<RiskLevel, string> = {
    LOW: "oklch(0.82 0.22 145)",
    MEDIUM: "oklch(0.88 0.18 90)",
    HIGH: "oklch(0.68 0.27 25)",
    CRITICAL: "oklch(0.65 0.25 305)",
  };

  const bankBars = useMemo(() => {
    const m = new Map<string, number>();
    rows.forEach((r) => m.set(r.bank, (m.get(r.bank) ?? 0) + 1));
    return Array.from(m.entries()).map(([bank, count]) => ({ bank: bank.split(" ")[0], count })).slice(0, 8);
  }, [rows]);

  const recent = rows.slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-widest text-primary">Live · SOC Console</div>
          <h1 className="font-display text-3xl font-bold">
            Welcome back, <span className="gradient-text">{user?.username.toUpperCase() ?? "OPERATOR"}</span>
          </h1>
          <p className="text-sm text-muted-foreground">Real-time threat posture across Indian banking partners.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-cyber-green/40 bg-cyber-green/10 px-3 py-1.5 font-mono text-[11px] uppercase text-cyber-green">
          <span className="h-2 w-2 animate-pulse rounded-full bg-cyber-green" />
          Threat engine nominal
        </div>
      </div>

      <DeviceAlertBanner />
      <div className="overflow-hidden rounded-md border border-border/60 bg-card/40 py-2">
        <div className="flex animate-ticker whitespace-nowrap font-mono text-xs text-muted-foreground">
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k} className="flex shrink-0 items-center gap-8 px-8">
              <span>⚠ SBI · phishing domain blocked · 14:02</span>
              <span className="text-cyber-red">⛔ HDFC · OTP bypass attempt · 14:11</span>
              <span className="text-cyber-yellow">▲ ICICI · location anomaly · 14:18</span>
              <span>✓ Axis · MFA enforced · 14:24</span>
              <span className="text-cyber-red">⛔ Kotak · SIM-swap flagged · 14:31</span>
              <span>▲ Yes Bank · velocity rule triggered · 14:37</span>
              <span>✓ PNB · session rotated · 14:42</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Sessions" value={stats.total} tone="cyan" icon={<Users className="h-5 w-5" />} delta="12% vs 1h" />
        <StatCard label="Critical Threats" value={stats.critical} tone="red" icon={<AlertTriangle className="h-5 w-5" />} sub="auto-quarantined" />
        <StatCard label="Blocked OTP Attempts" value={stats.blocked} tone="yellow" icon={<ShieldCheck className="h-5 w-5" />} />
        <StatCard label="24h Volume" value={`₹${(stats.volume / 100000).toFixed(1)}L`} tone="green" icon={<IndianRupee className="h-5 w-5" />} delta="3.4% vs yday" />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass rounded-xl p-5 lg:col-span-2">
          <ChartHeader icon={<Activity className="h-4 w-4" />} title="Attack Timeline · 24h" sub="Detected vs Blocked" />
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={timeline} margin={{ left: -10, right: 10, top: 10 }}>
              <defs>
                <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.85 0.18 195)" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="oklch(0.85 0.18 195)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g2" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.68 0.27 25)" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="oklch(0.68 0.27 25)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="oklch(0.85 0.18 195 / 0.08)" />
              <XAxis dataKey="t" stroke="oklch(0.65 0.04 220)" fontSize={11} />
              <YAxis stroke="oklch(0.65 0.04 220)" fontSize={11} />
              <Tooltip contentStyle={{ background: "oklch(0.14 0.05 250)", border: "1px solid oklch(0.85 0.18 195 / 0.4)", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="threats" stroke="oklch(0.68 0.27 25)" fill="url(#g2)" strokeWidth={2} />
              <Area type="monotone" dataKey="blocked" stroke="oklch(0.85 0.18 195)" fill="url(#g1)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-xl p-5">
          <ChartHeader icon={<AlertTriangle className="h-4 w-4" />} title="Risk Distribution" sub="Across active sessions" />
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={riskDist} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} stroke="oklch(0.12 0.04 250)">
                {riskDist.map((d) => <Cell key={d.name} fill={RISK_HEX[d.name]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "oklch(0.14 0.05 250)", border: "1px solid oklch(0.85 0.18 195 / 0.4)", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-[11px]">
            {riskDist.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: RISK_HEX[d.name] }} />
                <span className="text-muted-foreground">{d.name}</span>
                <span className="ml-auto text-foreground">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass rounded-xl p-5 lg:col-span-1">
          <ChartHeader icon={<Wifi className="h-4 w-4" />} title="Sessions per Bank" />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={bankBars}>
              <CartesianGrid stroke="oklch(0.85 0.18 195 / 0.08)" />
              <XAxis dataKey="bank" stroke="oklch(0.65 0.04 220)" fontSize={10} />
              <YAxis stroke="oklch(0.65 0.04 220)" fontSize={10} />
              <Tooltip contentStyle={{ background: "oklch(0.14 0.05 250)", border: "1px solid oklch(0.85 0.18 195 / 0.4)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" fill="oklch(0.85 0.18 195)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent activity */}
        <div className="glass rounded-xl p-5 lg:col-span-2">
          <ChartHeader icon={<Activity className="h-4 w-4" />} title="Recent Banking Activity" sub="Synthetic demo data" />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <tr className="border-b border-border/60">
                  <th className="py-2 pr-3">User</th>
                  <th className="py-2 pr-3">Bank</th>
                  <th className="py-2 pr-3">Amount</th>
                  <th className="py-2 pr-3">Device</th>
                  <th className="py-2 pr-3">Location</th>
                  <th className="py-2 pr-3">Risk</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs">
                {recent.map((r) => (
                  <tr key={r.id} className="border-b border-border/30 hover:bg-primary/5">
                    <td className="py-2 pr-3">{r.user}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{r.bank}</td>
                    <td className="py-2 pr-3 text-cyber-green">₹{r.amount.toLocaleString("en-IN")}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{r.device}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{r.city}</td>
                    <td className="py-2 pr-3">
                      <span className={`rounded border px-2 py-0.5 text-[10px] font-bold ${RISK_BG[r.risk]}`}>{r.risk}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChartHeader({ icon, title, sub }: { icon: React.ReactNode; title: string; sub?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-primary">{icon}</span>
        <h3 className="font-display text-sm font-semibold uppercase tracking-widest">{title}</h3>
      </div>
      {sub && <span className="font-mono text-[10px] uppercase text-muted-foreground">{sub}</span>}
    </div>
  );
}
