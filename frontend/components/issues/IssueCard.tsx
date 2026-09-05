import React from "react";
import Link from "next/link";
import { Issue } from "@/types";
import { CategoryBadge, PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { MapPin, MessageSquare, Users, ChevronRight } from "lucide-react";

interface IssueCardProps {
  issue: Issue;
  href?: string;
}

export function IssueCard({ issue, href }: IssueCardProps) {
  const targetHref = href || `/issues/${issue.id}`;

  return (
    <Link
      href={targetHref}
      className="block group bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      <div className="p-5">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <CategoryBadge category={issue.category} />
            <PriorityBadge priority={issue.priority} />
          </div>
          <StatusBadge status={issue.status} />
        </div>

        {/* Title & Description preview */}
        <h3 className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1.5">
          {issue.title}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed">
          {issue.description}
        </p>

        {/* Footer meta */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center space-x-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate max-w-[200px]">{issue.location}</span>
          </div>

          <div className="flex items-center space-x-4 shrink-0">
            {issue.team && (
              <div className="flex items-center space-x-1 text-slate-600">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate max-w-[120px]">{issue.team.name}</span>
              </div>
            )}

            <div className="flex items-center space-x-1 text-slate-500">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              <span>{issue.comment_count ?? issue.comments?.length ?? 0}</span>
            </div>

            <span className="text-slate-400">{formatRelativeTime(issue.created_at)}</span>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
          </div>
        </div>
      </div>
    </Link>
  );
}
