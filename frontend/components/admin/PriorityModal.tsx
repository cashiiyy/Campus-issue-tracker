"use client";

import React, { useState } from "react";
import { IssuePriority } from "@/types";
import { adminApi } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";

interface PriorityModalProps {
  isOpen: boolean;
  onClose: () => void;
  issueId: string;
  currentPriority: IssuePriority;
}

export function PriorityModal({
  isOpen,
  onClose,
  issueId,
  currentPriority,
}: PriorityModalProps) {
  const [selectedPriority, setSelectedPriority] = useState<IssuePriority>(currentPriority);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (priority: IssuePriority) => adminApi.updatePriority(issueId, priority),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-issues"] });
      queryClient.invalidateQueries({ queryKey: ["issue", issueId] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      onClose();
    },
  });

  if (!isOpen) return null;

  const priorities: { key: IssuePriority; label: string; desc: string; color: string }[] = [
    { key: "LOW", label: "Low", desc: "Cosmetic or minor issue with low impact.", color: "bg-slate-400" },
    { key: "MEDIUM", label: "Medium", desc: "Routine maintenance needed within regular schedule.", color: "bg-sky-500" },
    { key: "HIGH", label: "High", desc: "Urgent issue affecting campus learning or operations.", color: "bg-orange-500" },
    { key: "CRITICAL", label: "Critical", desc: "Immediate safety hazard or major building shutdown.", color: "bg-rose-600" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="text-lg font-bold text-slate-900">Change Priority Level</h3>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          {priorities.map((p) => (
            <label
              key={p.key}
              className={`flex items-start p-3 rounded-lg border cursor-pointer transition-all ${
                selectedPriority === p.key
                  ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/20"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name="priority"
                value={p.key}
                checked={selectedPriority === p.key}
                onChange={() => setSelectedPriority(p.key)}
                className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${p.color}`} />
                  <span className="text-sm font-semibold text-slate-900">{p.label}</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{p.desc}</div>
              </div>
            </label>
          ))}
        </div>

        {mutation.isError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {(mutation.error as any)?.message || "Failed to update priority."}
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate(selectedPriority)}
            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-sm"
          >
            {mutation.isPending ? "Saving..." : "Update Priority"}
          </button>
        </div>
      </div>
    </div>
  );
}
