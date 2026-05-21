import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppNav } from "@/components/AppNav";
import { MatrixRain } from "@/components/MatrixRain";
import { getSession } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ location }) => {
    if (typeof window !== "undefined" && !getSession()) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: () => (
    <div className="relative min-h-screen cyber-grid">
      <MatrixRain opacity={0.12} />
      <AppNav />
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  ),
});
