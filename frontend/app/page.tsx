"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  AlertTriangle,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  Users,
  Activity,
  Layers,
  Zap,
  MapPin,
  Clock,
} from "lucide-react";

/** Hook: adds "in-view" class to elements with .reveal / .reveal-left / .reveal-scale */
function useScrollReveal() {
  useEffect(() => {
    const selectors = ".reveal, .reveal-left, .reveal-scale";
    const elements = Array.from(document.querySelectorAll<HTMLElement>(selectors));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

const features = [
  {
    icon: AlertTriangle,
    color: "indigo",
    title: "9 Issue Categories",
    desc: "Infrastructure, water leaks, electrical faults, Wi-Fi, security, cleanliness, transportation, and more — all in one place.",
  },
  {
    icon: Activity,
    color: "emerald",
    title: "Real-Time Status Tracking",
    desc: "Follow every report through a clear lifecycle: Open → In Progress → Resolved → Closed, with full audit history.",
  },
  {
    icon: ShieldCheck,
    color: "purple",
    title: "Role-Based Access Control",
    desc: "Rigorous backend authorization ensures students see only their own issues while administrators retain global oversight.",
  },
  {
    icon: Zap,
    color: "amber",
    title: "Priority Management",
    desc: "Admins can escalate critical issues to High or Critical priority so the most urgent problems are resolved first.",
  },
  {
    icon: Users,
    color: "rose",
    title: "Team Assignment",
    desc: "Route issues to the right maintenance team — Electrical, Plumbing, Networking, Cleaning, Security, and more.",
  },
  {
    icon: MapPin,
    color: "cyan",
    title: "Location Context",
    desc: "Every report includes building and room details so maintenance staff can locate and resolve issues immediately.",
  },
];

const stats = [
  { value: "9", label: "Issue Categories" },
  { value: "4", label: "Status Stages" },
  { value: "4", label: "Priority Levels" },
  { value: "6+", label: "Maintenance Teams" },
];

const colorMap: Record<string, { bg: string; icon: string }> = {
  indigo: { bg: "bg-indigo-50", icon: "text-indigo-600" },
  emerald: { bg: "bg-emerald-50", icon: "text-emerald-600" },
  purple: { bg: "bg-purple-50", icon: "text-purple-600" },
  amber: { bg: "bg-amber-50", icon: "text-amber-600" },
  rose: { bg: "bg-rose-50", icon: "text-rose-600" },
  cyan: { bg: "bg-cyan-50", icon: "text-cyan-600" },
};

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  useScrollReveal();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "ADMIN") {
        router.replace("/admin");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="space-y-24 py-4">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl gradient-hero text-white px-8 py-20 sm:px-16 sm:py-28 shadow-2xl">
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-[480px] h-[480px] bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-[360px] h-[360px] bg-purple-600/15 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-indigo-400/10 rounded-full blur-2xl" />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative z-10 max-w-3xl space-y-8">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass text-xs font-semibold text-indigo-200 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Campus Facilities &amp; Incident Resolution Platform</span>
          </div>

          <h1
            className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.08] animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            Report Problems.{" "}
            <br />
            <span className="gradient-text">Track Repairs</span> in Real Time.
          </h1>

          <p
            className="text-lg text-indigo-100/85 leading-relaxed max-w-xl animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            A unified platform for university students to report broken
            facilities, electrical hazards, water leaks, and connectivity
            outages — directly to the teams that fix them.
          </p>

          <div
            className="flex flex-wrap gap-4 pt-2 animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            <Link
              href="/login"
              className="inline-flex items-center px-7 py-3.5 rounded-xl font-bold text-sm bg-white text-indigo-900 hover:bg-indigo-50 shadow-lg transition-all hover:scale-[1.03] hover:shadow-xl"
            >
              Sign In to Portal
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center px-7 py-3.5 rounded-xl font-bold text-sm glass text-white hover:bg-white/15 border-white/20 transition-all hover:scale-[1.02]"
            >
              Create Student Account
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ────────────────────────────────────────────────────── */}
      <section className="reveal">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`reveal delay-${(i + 1) * 100} bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-sm card-hover`}
            >
              <div className="text-3xl font-extrabold text-indigo-600">
                {stat.value}
              </div>
              <div className="text-xs font-medium text-slate-500 mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section className="space-y-12">
        <div className="text-center reveal">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            How it Works
          </h2>
          <p className="mt-3 text-slate-500 max-w-lg mx-auto text-sm">
            From reporting to resolution in three simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-9 left-1/4 right-1/4 h-px bg-gradient-to-r from-indigo-200 via-indigo-400 to-indigo-200" />

          {[
            {
              step: "01",
              icon: MapPin,
              title: "Report the Issue",
              desc: "Submit a detailed report with location, category, priority, and description. Takes under 60 seconds.",
            },
            {
              step: "02",
              icon: Clock,
              title: "Team Assignment",
              desc: "Administrators triage, set priority, and route to the right maintenance team immediately.",
            },
            {
              step: "03",
              icon: CheckCircle,
              title: "Track to Resolution",
              desc: "Follow your issue through each status stage. Get transparency on every update made.",
            },
          ].map((item, i) => (
            <div
              key={item.step}
              className={`reveal delay-${(i + 1) * 100} relative bg-white rounded-2xl border border-slate-200 p-7 shadow-sm card-hover text-center space-y-4`}
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md">
                <item.icon className="w-6 h-6" />
              </div>
              <div className="text-[11px] font-bold text-indigo-400 tracking-widest">
                STEP {item.step}
              </div>
              <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature Highlights ───────────────────────────────────────────── */}
      <section className="space-y-12">
        <div className="text-center reveal">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Built for the Entire Campus
          </h2>
          <p className="mt-3 text-slate-500 max-w-lg mx-auto text-sm">
            Comprehensive tools for students and administrators alike.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const colors = colorMap[f.color];
            const delay = (i % 3) * 100 + 100;
            return (
              <div
                key={f.title}
                className={`reveal delay-${delay} bg-white p-7 rounded-2xl border border-slate-200 space-y-4 shadow-sm card-hover`}
              >
                <div
                  className={`w-11 h-11 rounded-xl ${colors.bg} ${colors.icon} flex items-center justify-center`}
                >
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <section className="reveal-scale">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-indigo-800 px-10 py-14 text-center text-white shadow-xl">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-purple-500/20 rounded-full blur-2xl" />
          </div>
          <div className="relative z-10 space-y-5 max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mx-auto">
              <Layers className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Start Reporting Campus Issues Today
            </h2>
            <p className="text-indigo-100/80 text-sm">
              Join your campus community in keeping shared spaces safe,
              functional, and well-maintained.
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-2">
              <Link
                href="/register"
                className="inline-flex items-center px-7 py-3 rounded-xl font-bold text-sm bg-white text-indigo-900 hover:bg-indigo-50 shadow-md transition-all hover:scale-[1.03]"
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center px-7 py-3 rounded-xl font-bold text-sm glass text-white hover:bg-white/15 transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
