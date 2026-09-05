"use client";

import React, { useState } from "react";
import { IssueStatus } from "@/types";
import { adminApi } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, CheckCircle } from "lucide-react";

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  issueId: string;
  currentStatus: IssueStatus;
}

export function StatusModal({
  isOpen,
  onClose,
  issueId,
  currentStatus,
}: StatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<IssueStatus>(currentStatus);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (status: IssueStatus) => adminApi.updateStatus(issueId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-issues"] });
      queryClient.invalidateQueries({ queryKey: ["issue", issueId] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      onClose();
    },
  });

  if (!isOpen) return null;

  const statuses: { key: IssueStatus; label: string; desc: string }[] = [
    { key: "OPEN", label: "Open", desc: "Issue newly reported, awaiting work." },
    { key: "IN_PROGRESS", label: "In Progress", desc: "Technician dispatched and repairing." },
    { key: "RESOLVED", label: "Resolved", desc: "Repairs verified and issue fixed." },
    { key: "CLOSED", label: "Closed", desc: "Final closure; archived from active queue." },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="text-lg font-bold text-slate-900">Update Issue Status</h3>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          {statuses.map((s) => (
            <label
              key={s.key}
              className={`flex items-start p-3 rounded-lg border cursor-pointer transition-all ${
                selectedStatus === s.key
                  ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/20"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name="status"
                value={s.key}
                checked={selectedStatus === s.key}
                onChange={() => setSelectedStatus(s.key)}
                className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
              />
              <div className="ml-3">
                <div className="text-sm font-semibold text-slate-900">{s.label}</div>
                <div className="text-xs text-slate-500">{s.desc}</div>
              </div>
            </label>
          ))}
        </div>

        {mutation.isError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {(mutation.error as any)?.message || "Failed to update status."}
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
            onClick={() => mutation.mutate(selectedStatus)}
            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-sm"
          >
            {mutation.isPending ? "Saving..." : "Update Status"}
          </button>
        </div>
      </div>
    </div>
  );
}
