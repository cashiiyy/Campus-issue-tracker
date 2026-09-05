"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { issuesApi, teamsApi } from "@/lib/api";
import { Issue, IssueCategory, IssuePriority, IssueStatus } from "@/types";
import { issueCategories, issuePriorities, issueStatuses } from "@/schemas/issue";
import { CategoryBadge, PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { StatusModal } from "@/components/admin/StatusModal";
import { PriorityModal } from "@/components/admin/PriorityModal";
import { AssignmentModal } from "@/components/admin/AssignmentModal";
import { TableSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatRelativeTime } from "@/lib/utils";
import {
  Search,
  Filter,
  Users,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  SlidersHorizontal,
  UserCheck,
  Eye,
  Shield,
} from "lucide-react";

export default function AdminIssuesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Filter and search states
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<IssueCategory | "">("");
  const [status, setStatus] = useState<IssueStatus | "">("");
  const [priority, setPriority] = useState<IssuePriority | "">("");
  const [assignedTeam, setAssignedTeam] = useState<string>("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Modals state
  const [statusModalIssue, setStatusModalIssue] = useState<Issue | null>(null);
  const [priorityModalIssue, setPriorityModalIssue] = useState<Issue | null>(null);
  const [assignModalIssue, setAssignModalIssue] = useState<Issue | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (!authLoading && user && user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch teams for filter dropdown
  const { data: teams } = useQuery({
    queryKey: ["teams"],
    queryFn: () => teamsApi.list(),
    enabled: !!user && user.role === "ADMIN",
  });

  // Fetch issues list
  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: [
      "admin-issues",
      debouncedSearch,
      category,
      status,
      priority,
      assignedTeam,
      page,
    ],
    queryFn: () =>
      issuesApi.list({
        search: debouncedSearch || undefined,
        category: category || undefined,
        status: status || undefined,
        priority: priority || undefined,
        assigned_team: assignedTeam || undefined,
        page,
        page_size: pageSize,
      }),
    enabled: !!user && user.role === "ADMIN",
  });

  const resetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setCategory("");
    setStatus("");
    setPriority("");
    setAssignedTeam("");
    setPage(1);
  };

  const hasActiveFilters =
    search !== "" ||
    category !== "" ||
    status !== "" ||
    priority !== "" ||
    assignedTeam !== "";

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Queue</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Campus Issue Management</h1>
          <p className="text-xs text-slate-500">
            Triage, update status, adjust priority, and route issues to specialized maintenance teams.
          </p>
        </div>
      </div>

      {/* Multi-Criteria Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search title, description, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category */}
          <div className="sm:col-span-2">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as IssueCategory | "");
                setPage(1);
              }}
              className="w-full px-2.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
            >
              <option value="">All Categories</option>
              {issueCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="sm:col-span-2">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as IssueStatus | "");
                setPage(1);
              }}
              className="w-full px-2.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
            >
              <option value="">All Statuses</option>
              {issueStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div className="sm:col-span-2">
            <select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value as IssuePriority | "");
                setPage(1);
              }}
              className="w-full px-2.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
            >
              <option value="">All Priorities</option>
              {issuePriorities.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Team Filter */}
          <div className="sm:col-span-2">
            <select
              value={assignedTeam}
              onChange={(e) => {
                setAssignedTeam(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
            >
              <option value="">All Teams</option>
              {teams?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>Filtering administrative results</span>
            <button
              onClick={resetFilters}
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset filters
            </button>
          </div>
        )}
      </div>

      {/* Issues Table */}
      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : data?.items && data.items.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Title & Location</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Reporter</th>
                  <th className="px-4 py-3">Assigned Team</th>
                  <th className="px-4 py-3">Reported</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map((issue) => (
                  <tr key={issue.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 text-xs font-mono text-slate-400">
                      {issue.id.substring(0, 8)}...
                    </td>
                    <td className="px-4 py-3.5 max-w-xs">
                      <Link
                        href={`/admin/issues/${issue.id}`}
                        className="font-semibold text-slate-900 hover:text-indigo-600 line-clamp-1"
                      >
                        {issue.title}
                      </Link>
                      <div className="text-xs text-slate-400 line-clamp-1">{issue.location}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <CategoryBadge category={issue.category} />
                    </td>
                    <td className="px-4 py-3.5">
                      <PriorityBadge priority={issue.priority} />
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={issue.status} />
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-700">
                      <div className="font-medium">{issue.creator?.name || "Student"}</div>
                      <div className="text-[11px] text-slate-400">{issue.creator?.email}</div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">
                      {issue.team ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                          {issue.team.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-400">
                      {formatRelativeTime(issue.created_at)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="inline-flex items-center space-x-1">
                        <button
                          onClick={() => setStatusModalIssue(issue)}
                          title="Change Status"
                          className="px-2 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded"
                        >
                          Status
                        </button>
                        <button
                          onClick={() => setPriorityModalIssue(issue)}
                          title="Change Priority"
                          className="px-2 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded"
                        >
                          Priority
                        </button>
                        <button
                          onClick={() => setAssignModalIssue(issue)}
                          title="Assign Issue"
                          className="px-2 py-1 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded"
                        >
                          Assign
                        </button>
                        <Link
                          href={`/admin/issues/${issue.id}`}
                          title="View Details"
                          className="p-1 text-slate-400 hover:text-slate-600 rounded"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
            <div className="text-xs text-slate-500">
              Showing page <span className="font-bold text-slate-900">{data.page}</span> of{" "}
              <span className="font-bold text-slate-900">{data.total_pages}</span> ({data.total} total)
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((old) => Math.max(old - 1, 1))}
                disabled={page === 1}
                className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>
              <button
                onClick={() => {
                  if (!isPlaceholderData && page < data.total_pages) {
                    setPage((old) => old + 1);
                  }
                }}
                disabled={page >= data.total_pages}
                className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No issues match your filters"
          description="Try broadening your filter criteria or clearing the search keyword."
          actionText="Clear Filters"
          onActionClick={resetFilters}
        />
      )}

      {/* Modals */}
      {statusModalIssue && (
        <StatusModal
          isOpen={!!statusModalIssue}
          onClose={() => setStatusModalIssue(null)}
          issueId={statusModalIssue.id}
          currentStatus={statusModalIssue.status}
        />
      )}

      {priorityModalIssue && (
        <PriorityModal
          isOpen={!!priorityModalIssue}
          onClose={() => setPriorityModalIssue(null)}
          issueId={priorityModalIssue.id}
          currentPriority={priorityModalIssue.priority}
        />
      )}

      {assignModalIssue && (
        <AssignmentModal
          isOpen={!!assignModalIssue}
          onClose={() => setAssignModalIssue(null)}
          issueId={assignModalIssue.id}
          currentAssignedTo={assignModalIssue.assigned_to}
          currentAssignedTeam={assignModalIssue.assigned_team}
        />
      )}
    </div>
  );
}
