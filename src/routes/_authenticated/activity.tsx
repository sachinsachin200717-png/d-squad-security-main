import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Smartphone, Globe, MapPin, ShieldCheck, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";
import { generateBankingRows, RISK_BG } from "@/lib/mock-data";
import {
  getDeviceEvents, getKnownDevices, revokeDevice,
  type DeviceLoginEvent, type KnownDevice,
} from "@/lib/device-tracking";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/activity")({
  head: () => ({ meta: [{ title: "Activity & Devices — CyberBank SOC" }] }),
  component: ActivityPage,
});

function ActivityPage() {
  const user = useAuth();
  const rows = useMemo(() => generateBankingRows(30), []);
  const [devices, setDevices] = useState<KnownDevice[]>([]);
  const [events, setEvents] = useState<DeviceLoginEvent[]>([]);

  useEffect(() => {
    if (!user) return;
    const refresh = () => {
      setDevices(getKnownDevices(user.username));
      setEvents(getDeviceEvents(user.username).slice(0, 8));
    };
    refresh();
    window.addEventListener("cyberbank.deviceEvents", refresh);
    return () => window.removeEventListener("cyberbank.deviceEvents", refresh);
  }, [user]);

  const onRevoke = (d: KnownDevice) => {
    if (!user) return;
    revokeDevice(user.username, d.id);
    setDevices(getKnownDevices(user.username));
    toast.success("Device revoked", { description: `${d.label} (${d.city}) will be flagged on next login.` });
  };

  return (
    <div className="space-y-6">
      <header>
        <div className="font-mono text-[11px] uppercase tracking-widest text-primary">Module · Device & Location Tracking</div>
        <h1 className="font-display text-3xl font-bold">Login <span className="gradient-text">Activity</span></h1>
        <p className="text-sm text-muted-foreground">Every device, browser, IP and geo-location for every active session.</p>
      </header>

      {/* Trusted devices for the signed-in operator */}
      <section className="glass rounded-xl p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <h2 className="font-display text-sm font-semibold uppercase tracking-widest">Your Trusted Devices</h2>
          </div>
          <span className="font-mono text-[10px] uppercase text-muted-foreground">{devices.length} registered</span>
        </div>
        {devices.length === 0 ? (
          <p className="font-mono text-xs text-muted-foreground">No devices recorded yet for this account.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {devices.map((d) => (
              <div key={d.id} className="rounded-lg border border-border/60 bg-card/40 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-display text-sm font-semibold">{d.label}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">{d.city} · {d.timezone}</div>
                  </div>
                  <button
                    onClick={() => onRevoke(d)}
                    title="Revoke device"
                    className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-cyber-red/15 hover:text-cyber-red"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <KV label="Logins" value={String(d.loginCount)} />
                  <KV label="Screen" value={d.screen} />
                  <KV label="First seen" value={shortTime(d.firstSeen)} />
                  <KV label="Last seen" value={shortTime(d.lastSeen)} />
                </div>
                <div className="mt-3 truncate font-mono text-[10px] uppercase text-muted-foreground">FP {d.id}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent device login events */}
      <section className="glass rounded-xl p-5">
        <div className="mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <h2 className="font-display text-sm font-semibold uppercase tracking-widest">Recent Login Events</h2>
        </div>
        {events.length === 0 ? (
          <p className="font-mono text-xs text-muted-foreground">No login events recorded.</p>
        ) : (
          <ul className="space-y-2 font-mono text-xs">
            {events.map((e) => {
              const tone =
                e.reason === "NEW_DEVICE" ? "border-cyber-red/40 bg-cyber-red/10 text-cyber-red"
                : e.reason === "NEW_LOCATION" ? "border-cyber-yellow/40 bg-cyber-yellow/10 text-cyber-yellow"
                : "border-cyber-green/40 bg-cyber-green/10 text-cyber-green";
              return (
                <li key={e.id} className="flex flex-wrap items-center gap-3 rounded-md border border-border/40 bg-card/30 p-3">
                  <span className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${tone}`}>
                    {e.reason.replace("_", " ")}
                  </span>
                  <span className="text-foreground">{e.device.label}</span>
                  <span className="text-muted-foreground">· {e.device.city}</span>
                  {e.previousCity && <span className="text-muted-foreground">(was {e.previousCity})</span>}
                  <span className="ml-auto text-muted-foreground">{shortTime(e.time)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <header>
        <h2 className="font-display text-2xl font-bold">Network <span className="gradient-text">Sessions</span></h2>
        <p className="text-sm text-muted-foreground">Synthetic session feed across monitored banking partners.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((r) => (
          <article key={r.id} className="glass rounded-xl p-4 animate-float-in">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-display text-base font-semibold">{r.user}</div>
                <div className="font-mono text-[11px] uppercase text-muted-foreground">{r.bank}</div>
              </div>
              <span className={`rounded border px-2 py-0.5 font-mono text-[10px] font-bold ${RISK_BG[r.risk]}`}>{r.risk}</span>
            </div>

            <div className="mt-3 space-y-1.5 font-mono text-xs">
              <Row icon={<Smartphone className="h-3.5 w-3.5" />}>{r.device} · {r.os}</Row>
              <Row icon={<Globe className="h-3.5 w-3.5" />}>{r.browser} · <span className="text-primary">{r.ip}</span></Row>
              <Row icon={<MapPin className="h-3.5 w-3.5" />}>{r.city}, {r.state}</Row>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3 font-mono text-[11px] uppercase">
              <span className="text-muted-foreground">
                Login · {new Date(r.loginTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </span>
              <span className="text-cyber-green">₹{r.amount.toLocaleString("en-IN")}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Row({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <span className="text-primary">{icon}</span>
      <span className="text-foreground">{children}</span>
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase text-muted-foreground">{label}</div>
      <div className="text-foreground">{value}</div>
    </div>
  );
}

function shortTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}
