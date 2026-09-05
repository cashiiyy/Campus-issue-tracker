"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { issuesApi } from "@/lib/api";
import { CategoryBadge, PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { StatusTimeline } from "@/components/issues/StatusTimeline";
import { CommentSection } from "@/components/comments/CommentSection";
import { StatusModal } from "@/components/admin/StatusModal";
import { PriorityModal } from "@/components/admin/PriorityModal";
import { AssignmentModal } from "@/components/admin/AssignmentModal";
import { formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit3,
  MapPin,
  Shield,
  UserCheck,
  User as UserIcon,
  Users,
  ShieldAlert,
} from "lucide-react";

export default function AdminIssueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const issueId = params.id as string;
  const { user, isLoading: authLoading } = useAuth();

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (!authLoading && user && user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const {
    data: issue,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["issue", issueId],
    queryFn: () => issuesApi.get(issueId),
    enabled: !!user && !!issueId,
  });

  if (authLoading || isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 space-y-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-28" />
        <div className="bg-white p-8 rounded-2xl border border-slate-200 space-y-4">
          <div className="h-8 bg-slate-200 rounded w-2/3" />
          <div className="h-4 bg-slate-100 rounded w-1/3" />
          <div className="h-24 bg-slate-50 rounded" />
        </div>
      </div>
    );
  }

  if (isError || !issue) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Issue Not Found</h2>
        <p className="text-sm text-slate-500">
          The requested campus ticket does not exist or may have been deleted.
        </p>
        <Link
          href="/admin/issues"
          className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to all issues
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6">
      {/* Back button and Admin Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/admin/issues"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to all issues
        </Link>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsStatusOpen(true)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
          >
            Update Status
          </button>
          <button
            onClick={() => setIsPriorityOpen(true)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
          >
            Change Priority
          </button>
          <button
            onClick={() => setIsAssignOpen(true)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors"
          >
            Assign Team/Staff
          </button>
        </div>
      </div>

      {/* Main Issue Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge category={issue.category} />
            <PriorityBadge priority={issue.priority} />
          </div>
          <StatusBadge status={issue.status} />
        </div>

        {/* Title & Description */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
            {issue.title}
          </h1>
          <p className="mt-4 text-base text-slate-700 whitespace-pre-wrap leading-relaxed">
            {issue.description}
          </p>
        </div>

        {/* Timeline */}
        <div className="pt-4 border-t border-slate-100">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Incident Resolution Lifecycle
          </div>
          <StatusTimeline currentStatus={issue.status} />
        </div>

        {/* Details Grid */}
        <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 font-medium">Campus Location</span>
            <div className="flex items-center text-slate-800 font-semibold">
              <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
              <span>{issue.location}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-medium">Reported By</span>
            <div className="flex items-center text-slate-800 font-semibold">
              <UserIcon className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
              <span>{issue.creator?.name} ({issue.creator?.email})</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-medium">Assigned Department</span>
            <div className="flex items-center text-slate-800 font-semibold">
              <Users className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
              <span>{issue.team ? issue.team.name : "Unassigned"}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-medium">Assigned Personnel</span>
            <div className="flex items-center text-slate-800 font-semibold">
              <UserCheck className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
              <span>{issue.assignee ? issue.assignee.name : "Unassigned"}</span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-400">
          <span>Submitted: {formatDate(issue.created_at)}</span>
          <span>Last modified: {formatDate(issue.updated_at)}</span>
        </div>
      </div>

      {/* Discussion & Activity */}
      <CommentSection issueId={issue.id} />

      {/* Modals */}
      <StatusModal
        isOpen={isStatusOpen}
        onClose={() => setIsStatusOpen(false)}
        issueId={issue.id}
        currentStatus={issue.status}
      />

      <PriorityModal
        isOpen={isPriorityOpen}
        onClose={() => setIsPriorityOpen(false)}
        issueId={issue.id}
        currentPriority={issue.priority}
      />

      <AssignmentModal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        issueId={issue.id}
        currentAssignedTo={issue.assigned_to}
        currentAssignedTeam={issue.assigned_team}
      />
    </div>
  );
}
