import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ScanFace, Search, Filter } from "lucide-react";
import { generateBankingRows, RISK_BG, type RiskLevel } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/fraud")({
  head: () => ({ meta: [{ title: "Fraud Detection — CyberBank SOC" }] }),
  component: FraudPage,
});

const RISKS: ("ALL" | RiskLevel)[] = ["ALL", "LOW", "MEDIUM", "HIGH", "CRITICAL"];

function FraudPage() {
  const all = useMemo(() => generateBankingRows(60), []);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<typeof RISKS[number]>("ALL");

  const rows = useMemo(() => {
    return all.filter((r) => {
      if (filter !== "ALL" && r.risk !== filter) return false;
      if (q) {
        const s = q.toLowerCase();
        return (
          r.user.toLowerCase().includes(s) ||
          r.bank.toLowerCase().includes(s) ||
          r.upi.toLowerCase().includes(s) ||
          r.txnId.toLowerCase().includes(s) ||
          r.ip.includes(s)
        );
      }
      return true;
    });
  }, [all, q, filter]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-widest text-primary">Module · Banking Fraud Engine</div>
          <h1 className="font-display text-3xl font-bold">Fraud <span className="gradient-text">Detection</span></h1>
          <p className="text-sm text-muted-foreground">Behavioral scoring across UPI, transfers, OTP and device fingerprint.</p>
        </div>
      </header>

      <div className="glass flex flex-wrap items-center gap-3 rounded-xl p-3">
        <div className="flex flex-1 items-center gap-2 rounded-md border border-border bg-input px-3 py-2">
          <Search className="h-4 w-4 text-primary" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search user, bank, UPI, IP, TXN…"
            className="w-full bg-transparent font-mono text-sm outline-none placeholder:text-muted-foreground/60"
          />
        </div>
        <div className="flex items-center gap-1.5 rounded-md border border-border bg-input p-1">
          <Filter className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
          {RISKS.map((r) => (
            <button
              key={r}
              onClick={() => setFilter(r)}
              className={`rounded px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-all ${
                filter === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="glass rounded-xl p-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <tr className="border-b border-border/60">
                <Th>User</Th><Th>Bank · Account</Th><Th>UPI</Th><Th>TXN ID</Th>
                <Th>Amount</Th><Th>Device</Th><Th>IP / City</Th><Th>OTP</Th><Th>Risk</Th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs">
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border/20 hover:bg-primary/5">
                  <td className="px-3 py-2">{r.user}</td>
                  <td className="px-3 py-2">
                    <div className="text-foreground">{r.bank}</div>
                    <div className="text-muted-foreground">{r.account}</div>
                  </td>
                  <td className="px-3 py-2 text-primary">{r.upi}</td>
                  <td className="px-3 py-2 text-muted-foreground">{r.txnId}</td>
                  <td className="px-3 py-2 text-cyber-green">₹{r.amount.toLocaleString("en-IN")}</td>
                  <td className="px-3 py-2">
                    <div>{r.device}</div>
                    <div className="text-muted-foreground">{r.browser}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div>{r.ip}</div>
                    <div className="text-muted-foreground">{r.city}, {r.state}</div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`rounded border px-2 py-0.5 text-[10px] font-bold ${
                      r.otpStatus === "VERIFIED" ? "border-cyber-green/40 bg-cyber-green/15 text-cyber-green"
                      : r.otpStatus === "PENDING" ? "border-cyber-yellow/40 bg-cyber-yellow/15 text-cyber-yellow"
                      : "border-cyber-red/40 bg-cyber-red/15 text-cyber-red"
                    }`}>{r.otpStatus}</span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`rounded border px-2 py-0.5 text-[10px] font-bold ${RISK_BG[r.risk]}`}>
                      <ScanFace className="mr-1 inline h-3 w-3" />{r.risk}
                    </span>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr><td colSpan={9} className="py-12 text-center text-muted-foreground">No matching activity.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-center font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        Synthetic demo dataset · No real banking customer data
      </p>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2">{children}</th>;
}
