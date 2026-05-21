import { useEffect, useState } from "react";
import { getSession, type SessionUser } from "@/lib/auth";

export function useAuth() {
  const [user, setUser] = useState<SessionUser | null>(() => getSession());

  useEffect(() => {
    const sync = () => setUser(getSession());
    window.addEventListener("cyberbank.auth", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("cyberbank.auth", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return user;
}
