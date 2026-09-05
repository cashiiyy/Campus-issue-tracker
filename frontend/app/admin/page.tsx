"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { adminApi } from "@/lib/api";
import { StatusBadge, PriorityBadge, CategoryBadge } from "@/components/ui/Badge";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import {
  ShieldAlert,
  AlertCircle,
  Clock,
  CheckCircle2,
  FileText,
  Flame,
  ArrowRight,
  BarChart3,
  Layers,
  Users,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (!authLoading && user && user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminApi.getStats(),
    enabled: !!user && user?.role === "ADMIN",
  });

  if (authLoading || isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-2xl border border-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded bg-purple-100 text-purple-800 text-xs font-bold mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Campus Operations Center</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Administrative Overview
          </h1>
          <p className="text-xs text-slate-500">
            Monitor real-time campus repair throughput, dispatch departments, and address critical hazards.
          </p>
        </div>

        <Link
          href="/admin/issues"
          className="inline-flex items-center px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
        >
          Manage All Issues
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Total Incidents</span>
            <FileText className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {stats?.total_issues ?? 0}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-xs font-bold uppercase">Open Tickets</span>
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-blue-700">
            {stats?.open_issues ?? 0}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-xs font-bold uppercase">In Progress</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-amber-700">
            {stats?.in_progress_issues ?? 0}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-bold uppercase">Resolved</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700">
            {stats?.resolved_issues ?? 0}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-200 bg-rose-50/40 shadow-xs space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-rose-600">
            <span className="text-xs font-bold uppercase">Critical Priority</span>
            <Flame className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-rose-700">
            {stats?.critical_issues ?? 0}
          </div>
        </div>
      </div>

      {/* Distribution Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Category */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center">
              <Layers className="w-4 h-4 mr-2 text-indigo-600" />
              Issues by Campus Category
            </h3>
          </div>
          <div className="space-y-2.5">
            {stats?.by_category &&
              Object.entries(stats.by_category).map(([cat, count]) => {
                const total = stats.total_issues || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700">{cat}</span>
                      <span className="text-slate-500 font-medium">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* By Priority & Status */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          {/* Priority Breakdown */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center border-b border-slate-100 pb-3">
              <BarChart3 className="w-4 h-4 mr-2 text-indigo-600" />
              Issues by Urgency Priority
            </h3>
            <div className="grid grid-cols-4 gap-2 text-center">
              {stats?.by_priority &&
                Object.entries(stats.by_priority).map(([p, count]) => (
                  <div key={p} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-xs font-bold text-slate-500">{p}</div>
                    <div className="text-lg font-extrabold text-slate-900 mt-0.5">{count}</div>
                  </div>
                ))}
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center border-b border-slate-100 pb-3">
              <Clock className="w-4 h-4 mr-2 text-indigo-600" />
              Lifecycle Status Distribution
            </h3>
            <div className="grid grid-cols-4 gap-2 text-center">
              {stats?.by_status &&
                Object.entries(stats.by_status).map(([s, count]) => (
                  <div key={s} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-xs font-bold text-slate-500">{s.replace("_", " ")}</div>
                    <div className="text-lg font-extrabold text-slate-900 mt-0.5">{count}</div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Incidents Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Latest Reported Incidents</h3>
            <p className="text-xs text-slate-500">Most recent campus submissions requiring attention</p>
          </div>
          <Link
            href="/admin/issues"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            View full directory
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Title & Location</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Priority</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Reported</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.recent_issues && stats.recent_issues.length > 0 ? (
                stats.recent_issues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 line-clamp-1">{issue.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{issue.location}</div>
                    </td>
                    <td className="px-6 py-4">
                      <CategoryBadge category={issue.category} />
                    </td>
                    <td className="px-6 py-4">
                      <PriorityBadge priority={issue.priority} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={issue.status} />
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {formatRelativeTime(issue.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/issues/${issue.id}`}
                        className="inline-flex items-center px-3 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        Manage &rarr;
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-xs text-slate-400">
                    No recent issues found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
