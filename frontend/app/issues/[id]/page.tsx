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
import { EditIssueModal } from "@/components/issues/EditIssueModal";
import { formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit3,
  Lock,
  MapPin,
  ShieldAlert,
  User as UserIcon,
  Users,
  AlertTriangle,
} from "lucide-react";

export default function IssueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const issueId = params.id as string;
  const { user, isLoading: authLoading } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
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

  if (isError) {
    const err = error as any;
    const isForbidden = err?.status === 403;
    const isNotFound = err?.status === 404;

    return (
      <div className="max-w-xl mx-auto py-12 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          {isForbidden
            ? "Access Restricted (403 Forbidden)"
            : isNotFound
            ? "Issue Not Found (404)"
            : "Error Loading Issue"}
        </h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          {isForbidden
            ? "You do not have permission to view this issue. Students may only view and edit issues they personally reported."
            : isNotFound
            ? "The requested issue could not be found or has been deleted."
            : err?.message || "An unexpected error occurred."}
        </p>
        <div className="pt-2">
          <Link
            href="/issues"
            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to my issues
          </Link>
        </div>
      </div>
    );
  }

  if (!issue) return null;

  const isOwner = user?.id === issue.created_by;
  const isLocked = issue.status === "RESOLVED" || issue.status === "CLOSED";
  const canEdit = (isOwner || user?.role === "ADMIN") && !isLocked;

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6">
      {/* Back button and Edit Action */}
      <div className="flex items-center justify-between">
        <Link
          href={user?.role === "ADMIN" ? "/admin/issues" : "/issues"}
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          {user?.role === "ADMIN" ? "Back to all issues" : "Back to my issues"}
        </Link>

        {canEdit && (
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 mr-1.5" />
            Edit Issue
          </button>
        )}
      </div>

      {/* Main Issue Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Top Badges */}
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

        {/* Status Timeline */}
        <div className="pt-4 border-t border-slate-100">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Incident Resolution Timeline
          </div>
          <StatusTimeline currentStatus={issue.status} />
        </div>

        {/* Audit Lock Banner if Resolved/Closed */}
        {isLocked && (
          <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <Lock className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              This issue has been marked as <strong>{issue.status}</strong>. Its contents are locked to maintain audit integrity.
            </span>
          </div>
        )}

        {/* Meta Details Grid */}
        <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 font-medium">Campus Location</span>
            <div className="flex items-center text-slate-800 font-semibold">
              <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
              <span className="truncate">{issue.location}</span>
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
            <span className="text-slate-400 font-medium">Reported Date</span>
            <div className="flex items-center text-slate-800 font-semibold">
              <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
              <span>{formatDate(issue.created_at)}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-medium">Last Updated</span>
            <div className="flex items-center text-slate-800 font-semibold">
              <Clock className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
              <span>{formatDate(issue.updated_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Comments & Activity Thread */}
      <CommentSection issueId={issue.id} />

      {/* Edit Issue Modal */}
      {canEdit && (
        <EditIssueModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          issue={issue}
        />
      )}
    </div>
  );
}
