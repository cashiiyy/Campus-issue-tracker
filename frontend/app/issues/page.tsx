"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { issuesApi } from "@/lib/api";
import { IssueCategory, IssueStatus } from "@/types";
import { issueCategories, issueStatuses } from "@/schemas/issue";
import { IssueCard } from "@/components/issues/IssueCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardsSkeleton } from "@/components/ui/LoadingSkeleton";
import {
  Search,
  Filter,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

export default function StudentIssuesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<IssueCategory | "">("");
  const [status, setStatus] = useState<IssueStatus | "">("");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: ["student-issues", debouncedSearch, category, status, page],
    queryFn: () =>
      issuesApi.list({
        search: debouncedSearch || undefined,
        category: category || undefined,
        status: status || undefined,
        page,
        page_size: pageSize,
      }),
    enabled: !!user,
  });

  const resetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setCategory("");
    setStatus("");
    setPage(1);
  };

  const hasActiveFilters = search !== "" || category !== "" || status !== "";

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Reported Issues</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View, search, and track the real-time status of all your campus requests.
          </p>
        </div>
        <Link
          href="/issues/new"
          className="inline-flex items-center px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Report New Issue
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, location, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-3">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as IssueCategory | "");
                setPage(1);
              }}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
            >
              <option value="">All Categories</option>
              {issueCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as IssueStatus | "");
                setPage(1);
              }}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
            >
              <option value="">All Statuses</option>
              {issueStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>Filtering results</span>
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

      {/* Issues Grid / List */}
      {isLoading ? (
        <CardsSkeleton count={6} />
      ) : data?.items && data.items.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.items.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-200">
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
          title={hasActiveFilters ? "No matching issues" : "No issues reported yet"}
          description={
            hasActiveFilters
              ? "Try adjusting your search query or filter selections."
              : "You haven't reported any campus problems yet."
          }
          actionText={hasActiveFilters ? "Clear Filters" : "Report an Issue"}
          actionHref={hasActiveFilters ? undefined : "/issues/new"}
          onActionClick={hasActiveFilters ? resetFilters : undefined}
        />
      )}
    </div>
  );
}
