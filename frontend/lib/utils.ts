import { IssueCategory, IssuePriority, IssueStatus } from "@/types";

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return "just now";
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return `${Math.floor(diffSeconds / 86400)}d ago`;
  } catch {
    return dateString;
  }
}

export function getStatusStyle(status: IssueStatus): {
  bg: string;
  text: string;
  border: string;
  label: string;
} {
  switch (status) {
    case "OPEN":
      return {
        bg: "bg-blue-50 text-blue-700",
        border: "border-blue-200",
        text: "text-blue-700",
        label: "Open",
      };
    case "IN_PROGRESS":
      return {
        bg: "bg-amber-50 text-amber-700",
        border: "border-amber-200",
        text: "text-amber-700",
        label: "In Progress",
      };
    case "RESOLVED":
      return {
        bg: "bg-emerald-50 text-emerald-700",
        border: "border-emerald-200",
        text: "text-emerald-700",
        label: "Resolved",
      };
    case "CLOSED":
      return {
        bg: "bg-slate-100 text-slate-700",
        border: "border-slate-300",
        text: "text-slate-700",
        label: "Closed",
      };
  }
}

export function getPriorityStyle(priority: IssuePriority): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (priority) {
    case "LOW":
      return {
        bg: "bg-slate-50 text-slate-700",
        border: "border-slate-200",
        text: "text-slate-700",
        dot: "bg-slate-400",
      };
    case "MEDIUM":
      return {
        bg: "bg-sky-50 text-sky-700",
        border: "border-sky-200",
        text: "text-sky-700",
        dot: "bg-sky-500",
      };
    case "HIGH":
      return {
        bg: "bg-orange-50 text-orange-700",
        border: "border-orange-200",
        text: "text-orange-700",
        dot: "bg-orange-500",
      };
    case "CRITICAL":
      return {
        bg: "bg-rose-50 text-rose-700",
        border: "border-rose-200",
        text: "text-rose-700",
        dot: "bg-rose-600",
      };
  }
}
