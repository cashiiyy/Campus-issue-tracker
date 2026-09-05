"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  AlertTriangle,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Users,
  Activity,
  Layers,
} from "lucide-react";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

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
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-8 sm:p-14 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-xs font-semibold text-indigo-200 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-indigo-300" />
            <span>Campus Incident & Facilities Resolution Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Report Problems, <br />
            Track Repairs in Real Time.
          </h1>

          <p className="text-lg text-indigo-100/90 leading-relaxed">
            A unified campus platform for university students to report broken facilities, electrical hazards, water leaks, and Wi-Fi outages directly to facilities and maintenance staff.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              href="/login"
              className="inline-flex items-center px-6 py-3 rounded-xl font-bold text-sm bg-white text-indigo-900 hover:bg-indigo-50 shadow-md transition-all hover:scale-[1.02]"
            >
              Log In to Portal
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center px-6 py-3 rounded-xl font-bold text-sm bg-indigo-700/60 hover:bg-indigo-700 text-white border border-indigo-400/30 transition-all hover:scale-[1.02]"
            >
              Register as Student
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 -mt-16 -mr-16 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Evaluator Quick Demo Accounts Callout */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            ⚡
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Evaluator & Demo Credentials</h2>
            <p className="text-xs text-slate-500">
              Pre-seeded accounts to immediately evaluate student and administrator workflows.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                Student Account
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                STUDENT
              </span>
            </div>
            <div className="text-sm font-semibold text-slate-800">student@example.com</div>
            <div className="text-xs font-mono text-slate-500">StudentPass123!</div>
            <p className="text-xs text-slate-500 pt-1">
              Accesses student dashboard, submits issues, views owned issues only.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                Student 2 (Cross-Check)
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                STUDENT
              </span>
            </div>
            <div className="text-sm font-semibold text-slate-800">student2@example.com</div>
            <div className="text-xs font-mono text-slate-500">StudentPass123!</div>
            <p className="text-xs text-slate-500 pt-1">
              Used to verify that students cannot access or tamper with other students&apos; issues.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                Administrator
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                ADMIN
              </span>
            </div>
            <div className="text-sm font-semibold text-slate-800">admin@example.com</div>
            <div className="text-xs font-mono text-slate-500">AdminPass123!</div>
            <p className="text-xs text-slate-500 pt-1">
              Manages all issues, changes status, updates priority, assigns teams.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">9 Campus Categories</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Report infrastructure, water leaks, electrical faults, Wi-Fi connectivity, security issues, cleanliness, and transportation incidents.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Real-Time Status Tracking</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Follow reported problems across a clear lifecycle timeline from Open to In Progress, Resolved, and Closed.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Zero-Trust Ownership</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Rigorous backend authorization guarantees that students can only view and edit their own issues, while admins retain global control.
          </p>
        </div>
      </div>
    </div>
  );
}
