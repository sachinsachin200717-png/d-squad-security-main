// Frontend-only demo auth. Hardcoded credentials per project spec.
// Session is held in localStorage so demo users can log out/in freely.

export type Role = "admin" | "user";
export interface SessionUser {
  username: string;
  email: string;
  role: Role;
  loggedAt: string;
}

const SESSION_KEY = "cyberbank.session";

const DEMO_ACCOUNTS: Array<{ username: string; password: string; email: string; role: Role }> = [
  { username: "admin", password: "Admin@123", email: "admin@cyberbank.in", role: "admin" },
  { username: "user1", password: "User@123", email: "user1@cyberbank.in", role: "user" },
  { username: "cyberuser", password: "Cyber@123", email: "cyber@cyberbank.in", role: "user" },
];

export async function login(username: string, password: string): Promise<SessionUser> {
  const acct = DEMO_ACCOUNTS.find(
    (a) => a.username.toLowerCase() === username.trim().toLowerCase() && a.password === password,
  );
  if (!acct) throw new Error("Invalid credentials. Use a demo account.");
  const user: SessionUser = {
    username: acct.username,
    email: acct.email,
    role: acct.role,
    loggedAt: new Date().toISOString(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  // Multi-device detection runs before we announce the session so the
  // dashboard banner can read the latest event on first paint.
  try {
    const { recordLoginDevice } = await import("./device-tracking");
    await recordLoginDevice(acct.username);
  } catch (e) {
    console.warn("Device tracking failed:", e);
  }
  window.dispatchEvent(new Event("cyberbank.auth"));
  return user;
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event("cyberbank.auth"));
}

export function getSession(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

export const DEMO_CREDENTIALS = DEMO_ACCOUNTS.map(({ username, password, role }) => ({
  username,
  password,
  role,
}));
