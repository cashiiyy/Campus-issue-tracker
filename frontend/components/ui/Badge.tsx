import React from "react";
import { IssueCategory, IssuePriority, IssueStatus } from "@/types";
import { getPriorityStyle, getStatusStyle } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Building,
  Sparkles,
  Zap,
  Droplets,
  Wifi,
  Shield,
  Bus,
  GraduationCap,
  HelpCircle,
} from "lucide-react";

export function StatusBadge({ status }: { status: IssueStatus }) {
  const style = getStatusStyle(status);

  const getIcon = () => {
    switch (status) {
      case "OPEN":
        return <AlertCircle className="w-3.5 h-3.5 mr-1.5" />;
      case "IN_PROGRESS":
        return <Clock className="w-3.5 h-3.5 mr-1.5 animate-spin-slow" />;
      case "RESOLVED":
        return <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />;
      case "CLOSED":
        return <XCircle className="w-3.5 h-3.5 mr-1.5" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${style.bg} ${style.border}`}
    >
      {getIcon()}
      {style.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: IssuePriority }) {
  const style = getPriorityStyle(priority);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${style.bg} ${style.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${style.dot}`} />
      {priority}
    </span>
  );
}

export function CategoryBadge({ category }: { category: IssueCategory }) {
  const getCategoryIcon = () => {
    switch (category) {
      case "Infrastructure":
        return <Building className="w-3.5 h-3.5 mr-1 text-slate-500" />;
      case "Cleanliness":
        return <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-500" />;
      case "Electrical":
        return <Zap className="w-3.5 h-3.5 mr-1 text-yellow-500" />;
      case "Water":
        return <Droplets className="w-3.5 h-3.5 mr-1 text-cyan-500" />;
      case "Internet":
        return <Wifi className="w-3.5 h-3.5 mr-1 text-indigo-500" />;
      case "Security":
        return <Shield className="w-3.5 h-3.5 mr-1 text-rose-500" />;
      case "Transportation":
        return <Bus className="w-3.5 h-3.5 mr-1 text-emerald-500" />;
      case "Academic":
        return <GraduationCap className="w-3.5 h-3.5 mr-1 text-purple-500" />;
      default:
        return <HelpCircle className="w-3.5 h-3.5 mr-1 text-slate-400" />;
    }
  };

  return (
    <span className="inline-flex items-center text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md">
      {getCategoryIcon()}
      {category}
    </span>
  );
}
