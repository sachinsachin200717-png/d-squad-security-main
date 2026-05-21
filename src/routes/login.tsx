import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Shield, Lock, User, AlertCircle, Copy } from "lucide-react";
import { toast } from "sonner";
import { MatrixRain } from "@/components/MatrixRain";
import { DEMO_CREDENTIALS, getSession, login } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && getSession()) throw redirect({ to: "/dashboard" });
  },
  head: () => ({
    meta: [
      { title: "Login — CyberBank SOC" },
      { name: "description", content: "Secure access to the cyber security monitoring console." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const u = await login(username, password);
      const { getDeviceEvents } = await import("@/lib/device-tracking");
      const last = getDeviceEvents(u.username)[0];
      if (last?.reason === "NEW_DEVICE") {
        toast.warning("⚠ New device detected", {
          description: `First-time sign-in from ${last.device.label} (${last.device.city}).`,
          duration: 8000,
        });
      } else if (last?.reason === "NEW_LOCATION") {
        toast.warning("⚠ New location detected", {
          description: `${last.device.label} just connected from ${last.device.city} (was ${last.previousCity}).`,
          duration: 8000,
        });
      } else {
        toast.success(`Welcome ${u.username}`, { description: "Trusted device · secure session established." });
      }
      nav({ to: "/dashboard" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const fill = (u: string, p: string) => { setUsername(u); setPassword(p); };

  return (
    <div className="relative min-h-screen cyber-grid">
      <MatrixRain opacity={0.18} />
      <div className="relative z-10 mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-6 py-16 lg:grid-cols-2">
        {/* Login form */}
        <div className="glass relative overflow-hidden rounded-2xl p-8 scanline">
          <div className="mb-6 flex items-center gap-2">
            <div className="rounded-md bg-primary/15 p-2 neon-border">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-display text-xl font-bold tracking-wider gradient-text">CYBER<span className="text-primary">BANK</span> SOC</div>
              <div className="font-mono text-[10px] uppercase text-muted-foreground">Secure Operator Console</div>
            </div>
          </div>

          <h1 className="font-display text-2xl font-bold">Operator Sign-In</h1>
          <p className="mt-1 text-sm text-muted-foreground">All access is logged and monitored.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <Field icon={<User className="h-4 w-4" />} label="Username">
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
                placeholder="admin"
                className="w-full bg-transparent font-mono text-sm outline-none placeholder:text-muted-foreground/60"
              />
            </Field>
            <Field icon={<Lock className="h-4 w-4" />} label="Password">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="w-full bg-transparent font-mono text-sm outline-none placeholder:text-muted-foreground/60"
              />
            </Field>

            {error && (
              <div className="flex items-center gap-2 rounded-md border border-cyber-red/40 bg-cyber-red/10 p-3 text-sm text-cyber-red">
                <AlertCircle className="h-4 w-4" /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-md bg-primary px-4 py-3 font-mono text-sm font-bold uppercase tracking-widest text-primary-foreground transition-all hover:shadow-[0_0_30px_oklch(0.85_0.18_195/0.6)] disabled:opacity-60"
            >
              {busy ? "Authenticating…" : "Authenticate ▸"}
            </button>

            <div className="text-center text-xs text-muted-foreground">
              No account?{" "}
              <a href="/register" className="text-primary hover:underline">Register here</a>
            </div>
          </form>
        </div>

        {/* Demo credentials */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-full border border-cyber-green/40 bg-cyber-green/10 px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest text-cyber-green w-fit">
            <span className="h-2 w-2 animate-pulse rounded-full bg-cyber-green" />
            Demo Login Credentials Available
          </div>
          <h2 className="font-display text-2xl">Pre-Provisioned Accounts</h2>
          <p className="text-sm text-muted-foreground">Click any card to autofill the form. These are demo-only accounts.</p>
          <div className="space-y-3">
            {DEMO_CREDENTIALS.map((c) => (
              <button
                key={c.username}
                type="button"
                onClick={() => fill(c.username, c.password)}
                className="group flex w-full items-center justify-between rounded-xl border border-border/60 bg-card/40 p-4 text-left transition-all hover:border-primary/60 hover:bg-primary/5"
              >
                <div>
                  <div className="font-mono text-xs uppercase tracking-widest text-primary">
                    {c.role === "admin" ? "Admin Login" : c.username === "user1" ? "Demo User Login" : "Cyber User Login"}
                  </div>
                  <div className="mt-2 font-mono text-sm">
                    <span className="text-muted-foreground">Username:</span> <span className="text-foreground">{c.username}</span>
                  </div>
                  <div className="font-mono text-sm">
                    <span className="text-muted-foreground">Password:</span> <span className="text-foreground">{c.password}</span>
                  </div>
                </div>
                <Copy className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="flex items-center gap-2 rounded-md border border-border bg-input px-3 py-2.5 transition-colors focus-within:border-primary focus-within:shadow-[0_0_12px_oklch(0.85_0.18_195/0.3)]">
        <span className="text-primary">{icon}</span>
        {children}
      </div>
    </label>
  );
}
