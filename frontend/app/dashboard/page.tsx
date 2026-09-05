"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { issuesApi } from "@/lib/api";
import { IssueCard } from "@/components/issues/IssueCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardsSkeleton } from "@/components/ui/LoadingSkeleton";
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowRight,
  ListOrdered,
} from "lucide-react";

export default function StudentDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (!authLoading && user && user.role === "ADMIN") {
      router.push("/admin");
    }
  }, [user, authLoading, router]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["student-stats"],
    queryFn: () => issuesApi.getStudentStats(),
    enabled: !!user,
  });

  const { data: issuesData, isLoading: issuesLoading } = useQuery({
    queryKey: ["student-recent-issues"],
    queryFn: () => issuesApi.list({ page: 1, page_size: 4 }),
    enabled: !!user,
  });

  if (authLoading || !user) {
    return <CardsSkeleton count={3} />;
  }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {user.name}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track your submitted campus problem reports and monitor maintenance progress.
          </p>
        </div>
        <Link
          href="/issues/new"
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all hover:scale-[1.02] shrink-0"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Report New Issue
        </Link>
      </div>

      {/* KPI Stats Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              Total Reported
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {statsLoading ? "..." : stats?.total_issues ?? 0}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600 uppercase">
              Open Awaiting
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-700">
            {statsLoading ? "..." : stats?.open_issues ?? 0}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 uppercase">
              In Progress
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4 animate-spin-slow" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-700">
            {statsLoading ? "..." : stats?.in_progress_issues ?? 0}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 uppercase">
              Resolved
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
            {statsLoading ? "..." : stats?.resolved_issues ?? 0}
          </div>
        </div>
      </div>

      {/* Recent Issues Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ListOrdered className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Recent Reported Issues</h2>
          </div>
          <Link
            href="/issues"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            View all my issues
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {issuesLoading ? (
          <CardsSkeleton count={2} />
        ) : issuesData?.items && issuesData.items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {issuesData.items.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No campus issues reported yet"
            description="Notice a broken light, slow Wi-Fi, or water leak? Submit a ticket so facilities can fix it."
            actionText="Report Your First Issue"
            actionHref="/issues/new"
          />
        )}
      </div>
    </div>
  );
}
