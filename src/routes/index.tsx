import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Shield, Activity, AlertTriangle, Lock, Eye, Cpu, ArrowRight } from "lucide-react";
import { MatrixRain } from "@/components/MatrixRain";
import { getSession } from "@/lib/auth";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && getSession()) {
      throw redirect({ to: "/dashboard" });
    }
  },
  head: () => ({
    meta: [
      { title: "CyberBank SOC — Banking Cyber Security Monitoring" },
      { name: "description", content: "Real-time fraud detection, scam alerts, device tracking and threat monitoring for Indian banking systems." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden cyber-grid">
      <MatrixRain opacity={0.22} />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between border-b border-border/40 px-6 py-4 glass-strong">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-primary/15 p-2 neon-border">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div className="font-display text-lg font-bold tracking-wider gradient-text">
            CYBER<span className="text-primary">BANK</span>
          </div>
        </div>
        <Link
          to="/login"
          className="rounded-md border border-primary/40 bg-primary/10 px-4 py-2 font-mono text-xs uppercase tracking-widest text-primary transition-all hover:bg-primary/20 animate-pulse-glow"
        >
          Access Console →
        </Link>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 py-20 text-center">
        <div className="mb-6 flex items-center gap-2 rounded-full border border-cyber-green/40 bg-cyber-green/10 px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest text-cyber-green">
          <span className="h-2 w-2 animate-pulse rounded-full bg-cyber-green" />
          System Online · Threat Engine Active
        </div>
        <h1 className="font-display text-5xl font-bold leading-tight md:text-7xl">
          Defend Indian Banking <br />
          <span className="gradient-text">Against Cyber Threats</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          A futuristic Security Operations Center that detects fraud, blocks phishing, monitors devices and stops OTP scams across SBI, HDFC, ICICI, Axis and more — in real time.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/login"
            className="group flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-mono text-sm font-bold uppercase tracking-widest text-primary-foreground shadow-[0_0_30px_oklch(0.85_0.18_195/0.5)] transition-all hover:scale-105"
          >
            Launch SOC Console
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/register"
            className="rounded-lg border border-border/80 bg-card/40 px-6 py-3 font-mono text-sm uppercase tracking-widest text-foreground transition-all hover:border-primary/60"
          >
            Create Account
          </Link>
        </div>

        {/* feature grid */}
        <div className="mt-20 grid w-full gap-4 md:grid-cols-3">
          {[
            { icon: Eye, title: "Live Threat Monitoring", desc: "Track every login, device and transaction across 12+ banks." },
            { icon: AlertTriangle, title: "Scam Alert Engine", desc: "Instant alerts for UPI, OTP, KYC and phishing fraud." },
            { icon: Cpu, title: "AI Fraud Prediction", desc: "Behavioral models flag account takeover before money moves." },
            { icon: Activity, title: "Banking Analytics", desc: "Animated charts on volume, geography, risk distribution." },
            { icon: Lock, title: "Hardened Auth", desc: "Hashed sessions, multi-device detection, attempt limiter." },
            { icon: Shield, title: "Admin Command Center", desc: "Block users, freeze devices, export forensic reports." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass rounded-xl p-5 text-left animate-float-in">
              <Icon className="h-6 w-6 text-primary" />
              <div className="mt-3 font-display text-lg font-semibold">{title}</div>
              <div className="mt-1 text-sm text-muted-foreground">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 border-t border-border/30 py-6 text-center font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        Demo data only · No real customer information · For educational use
      </footer>
    </div>
  );
}
