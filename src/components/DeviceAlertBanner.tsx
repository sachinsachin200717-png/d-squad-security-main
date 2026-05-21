import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ShieldAlert, MapPin, Smartphone, X } from "lucide-react";
import {
  acknowledgeEvent,
  getDeviceEvents,
  type DeviceLoginEvent,
} from "@/lib/device-tracking";
import { useAuth } from "@/hooks/use-auth";

/** Banner shown on the dashboard whenever the latest login was from a
 *  new device or a new location. Auto-hides once acknowledged. */
export function DeviceAlertBanner() {
  const user = useAuth();
  const [evt, setEvt] = useState<DeviceLoginEvent | null>(null);

  useEffect(() => {
    if (!user) return;
    const refresh = () => {
      const last = getDeviceEvents(user.username).find(
        (e) => !e.acknowledged && (e.reason === "NEW_DEVICE" || e.reason === "NEW_LOCATION"),
      );
      setEvt(last ?? null);
    };
    refresh();
    window.addEventListener("cyberbank.deviceEvents", refresh);
    return () => window.removeEventListener("cyberbank.deviceEvents", refresh);
  }, [user]);

  if (!evt) return null;

  const isLocation = evt.reason === "NEW_LOCATION";

  return (
    <div className="danger-border animate-blink-danger relative flex flex-wrap items-start gap-4 rounded-xl p-4 animate-float-in">
      <div className="rounded-lg bg-cyber-red/20 p-3 text-cyber-red">
        <ShieldAlert className="h-6 w-6" />
      </div>
      <div className="flex-1">
        <div className="font-display text-base font-bold uppercase tracking-widest text-cyber-red">
          {isLocation ? "Suspicious login · new location" : "Suspicious login · new device"}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-foreground">
          <span className="flex items-center gap-1.5"><Smartphone className="h-3.5 w-3.5 text-primary" /> {evt.device.label}</span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-primary" /> {evt.device.city}
            {isLocation && evt.previousCity && (
              <span className="text-muted-foreground">(was {evt.previousCity})</span>
            )}
          </span>
          <span className="text-muted-foreground">
            {new Date(evt.time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          If this wasn't you, review trusted devices and revoke access immediately.
        </div>
        <div className="mt-3 flex gap-2">
          <Link
            to="/activity"
            className="rounded-md border border-primary/50 bg-primary/15 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-primary transition-all hover:bg-primary/25"
          >
            Review devices →
          </Link>
          <button
            onClick={() => { acknowledgeEvent(evt.id); setEvt(null); }}
            className="rounded-md border border-border bg-card/40 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground transition-all hover:text-foreground"
          >
            This was me
          </button>
        </div>
      </div>
      <button
        onClick={() => { acknowledgeEvent(evt.id); setEvt(null); }}
        aria-label="Dismiss"
        className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
