import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { MatrixRain } from "@/components/MatrixRain";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register — CyberBank SOC" },
      { name: "description", content: "Request operator access to the CyberBank Security Console." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <div className="relative min-h-screen cyber-grid">
      <MatrixRain opacity={0.18} />
      <div className="relative z-10 mx-auto grid min-h-screen max-w-md items-center px-6 py-16">
        <div className="glass rounded-2xl p-8">
          <div className="mb-6 flex items-center gap-2">
            <div className="rounded-md bg-primary/15 p-2 neon-border">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div className="font-display text-xl font-bold tracking-wider gradient-text">
              CYBER<span className="text-primary">BANK</span>
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold">Request Operator Access</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Self-registration is disabled in this demo build. Use one of the pre-provisioned demo accounts on the login page to enter the SOC.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-3 font-mono text-sm font-bold uppercase tracking-widest text-primary-foreground transition-all hover:shadow-[0_0_30px_oklch(0.85_0.18_195/0.6)]"
          >
            Go to Login →
          </Link>
        </div>
      </div>
    </div>
  );
}
