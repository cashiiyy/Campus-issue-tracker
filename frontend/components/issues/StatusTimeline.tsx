import React from "react";
import { IssueStatus } from "@/types";
import { Check, Clock, AlertCircle } from "lucide-react";

interface StatusTimelineProps {
  currentStatus: IssueStatus;
}

export function StatusTimeline({ currentStatus }: StatusTimelineProps) {
  const steps: { key: IssueStatus; label: string; desc: string }[] = [
    { key: "OPEN", label: "Reported", desc: "Submitted & awaiting review" },
    { key: "IN_PROGRESS", label: "In Progress", desc: "Assigned & under active repair" },
    { key: "RESOLVED", label: "Resolved", desc: "Maintenance work completed" },
    { key: "CLOSED", label: "Closed", desc: "Verified & archived" },
  ];

  const statusOrder: Record<IssueStatus, number> = {
    OPEN: 0,
    IN_PROGRESS: 1,
    RESOLVED: 2,
    CLOSED: 3,
  };

  const currentIndex = statusOrder[currentStatus] ?? 0;

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Background Connecting Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 w-full z-0" />
        
        {/* Progress Colored Line */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-600 z-0 transition-all duration-500"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isPending = idx > currentIndex;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors duration-300 ${
                  isDone
                    ? "bg-indigo-600 text-white shadow"
                    : isCurrent
                    ? "bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-md"
                    : "bg-white border-2 border-slate-300 text-slate-400"
                }`}
              >
                {isDone ? (
                  <Check className="w-5 h-5 stroke-[2.5]" />
                ) : isCurrent ? (
                  <Clock className="w-4 h-4 animate-spin-slow" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              <div className="mt-2 text-center">
                <div
                  className={`text-xs font-semibold ${
                    isCurrent ? "text-indigo-600" : isDone ? "text-slate-800" : "text-slate-400"
                  }`}
                >
                  {step.label}
                </div>
                <div className="hidden sm:block text-[11px] text-slate-400 mt-0.5">
                  {step.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
