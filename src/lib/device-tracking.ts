// Multi-device login detection. Frontend-only demo: builds a stable
// fingerprint from UA + screen + timezone + a per-browser random salt,
// stores known devices per username, and emits an event when login
// happens from a NEW device or a NEW location (timezone/city).

const KNOWN_KEY = (u: string) => `cyberbank.devices.${u.toLowerCase()}`;
const EVENTS_KEY = "cyberbank.deviceEvents";
const SALT_KEY = "cyberbank.deviceSalt";

export interface KnownDevice {
  id: string;          // fingerprint hash
  label: string;       // e.g. "Chrome on macOS"
  ua: string;
  screen: string;
  timezone: string;
  city: string;        // derived from timezone
  firstSeen: string;
  lastSeen: string;
  loginCount: number;
}

export interface DeviceLoginEvent {
  id: string;
  username: string;
  device: KnownDevice;
  reason: "NEW_DEVICE" | "NEW_LOCATION" | "TRUSTED";
  previousCity?: string;
  time: string;
  acknowledged: boolean;
}

function getSalt(): string {
  let s = localStorage.getItem(SALT_KEY);
  if (!s) {
    s = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(SALT_KEY, s);
  }
  return s;
}

async function sha256(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function detectBrowser(ua: string): string {
  if (/edg\//i.test(ua)) return "Edge";
  if (/chrome\//i.test(ua) && !/edg|opr/i.test(ua)) return "Chrome";
  if (/firefox\//i.test(ua)) return "Firefox";
  if (/safari\//i.test(ua) && !/chrome/i.test(ua)) return "Safari";
  if (/opr\//i.test(ua)) return "Opera";
  return "Unknown browser";
}

function detectOS(ua: string): string {
  if (/iphone|ipad|ipod/i.test(ua)) return "iOS";
  if (/android/i.test(ua)) return "Android";
  if (/mac os x/i.test(ua)) return "macOS";
  if (/windows/i.test(ua)) return "Windows";
  if (/linux/i.test(ua)) return "Linux";
  return "Unknown OS";
}

function cityFromTimezone(tz: string): string {
  // "Asia/Kolkata" -> "Kolkata"
  const tail = tz.split("/").pop() ?? tz;
  return tail.replaceAll("_", " ");
}

function readKnown(username: string): KnownDevice[] {
  try {
    const raw = localStorage.getItem(KNOWN_KEY(username));
    return raw ? (JSON.parse(raw) as KnownDevice[]) : [];
  } catch {
    return [];
  }
}

function writeKnown(username: string, list: KnownDevice[]) {
  localStorage.setItem(KNOWN_KEY(username), JSON.stringify(list));
}

function readEvents(): DeviceLoginEvent[] {
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    return raw ? (JSON.parse(raw) as DeviceLoginEvent[]) : [];
  } catch {
    return [];
  }
}

function writeEvents(list: DeviceLoginEvent[]) {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(list.slice(0, 30)));
  window.dispatchEvent(new Event("cyberbank.deviceEvents"));
}

export async function recordLoginDevice(username: string): Promise<DeviceLoginEvent> {
  const ua = navigator.userAgent;
  const screen = `${window.screen.width}x${window.screen.height}@${window.devicePixelRatio}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const city = cityFromTimezone(timezone);
  const id = (await sha256(`${getSalt()}|${ua}|${screen}|${timezone}|${navigator.language}`)).slice(0, 24);
  const label = `${detectBrowser(ua)} on ${detectOS(ua)}`;
  const now = new Date().toISOString();

  const known = readKnown(username);
  const existing = known.find((d) => d.id === id);
  let reason: DeviceLoginEvent["reason"] = "TRUSTED";
  let previousCity: string | undefined;

  if (!existing) {
    reason = known.length === 0 ? "TRUSTED" : "NEW_DEVICE";
    const fresh: KnownDevice = {
      id, label, ua, screen, timezone, city,
      firstSeen: now, lastSeen: now, loginCount: 1,
    };
    writeKnown(username, [fresh, ...known]);
  } else {
    if (existing.city !== city) {
      reason = "NEW_LOCATION";
      previousCity = existing.city;
    }
    existing.lastSeen = now;
    existing.loginCount += 1;
    existing.city = city;
    existing.timezone = timezone;
    writeKnown(username, [existing, ...known.filter((d) => d.id !== id)]);
  }

  const device = readKnown(username).find((d) => d.id === id)!;
  const event: DeviceLoginEvent = {
    id: `evt-${Date.now()}`,
    username,
    device,
    reason,
    previousCity,
    time: now,
    acknowledged: reason === "TRUSTED",
  };
  writeEvents([event, ...readEvents()]);
  return event;
}

export function getDeviceEvents(username?: string): DeviceLoginEvent[] {
  const all = readEvents();
  return username ? all.filter((e) => e.username === username) : all;
}

export function getKnownDevices(username: string): KnownDevice[] {
  return readKnown(username);
}

export function acknowledgeEvent(id: string) {
  const list = readEvents().map((e) => (e.id === id ? { ...e, acknowledged: true } : e));
  writeEvents(list);
}

export function revokeDevice(username: string, deviceId: string) {
  writeKnown(username, readKnown(username).filter((d) => d.id !== deviceId));
}export function addLoginEvent(username: string) {

  const events =
    JSON.parse(
      localStorage.getItem("cyberbank_device_events") || "[]"
    );

  const event = {
    id: crypto.randomUUID(),

    username,

    device: navigator.platform,

    browser: navigator.userAgent,

    city: "Bangalore",

    ipAddress: "192.168.1.10",

    timestamp: new Date().toISOString(),

    trusted: true,
  };

  events.unshift(event);

  localStorage.setItem(
    "cyberbank_device_events",
    JSON.stringify(events)
  );

  window.dispatchEvent(
    new Event("cyberbank.deviceEvents")
  );
}
