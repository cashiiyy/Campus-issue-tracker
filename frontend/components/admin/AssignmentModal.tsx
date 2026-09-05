"use client";

import React, { useState } from "react";
import { adminApi, teamsApi } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X, UserCheck, Users } from "lucide-react";

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  issueId: string;
  currentAssignedTo?: string | null;
  currentAssignedTeam?: string | null;
}

export function AssignmentModal({
  isOpen,
  onClose,
  issueId,
  currentAssignedTo,
  currentAssignedTeam,
}: AssignmentModalProps) {
  const [assignedTo, setAssignedTo] = useState<string>(currentAssignedTo || "");
  const [assignedTeam, setAssignedTeam] = useState<string>(currentAssignedTeam || "");
  const queryClient = useQueryClient();

  const { data: teams, isLoading: loadingTeams } = useQuery({
    queryKey: ["teams"],
    queryFn: () => teamsApi.list(),
  });

  const { data: staff, isLoading: loadingStaff } = useQuery({
    queryKey: ["staff"],
    queryFn: () => adminApi.listStaff(),
  });

  const mutation = useMutation({
    mutationFn: () =>
      adminApi.updateAssignment(issueId, {
        assigned_to: assignedTo ? assignedTo : null,
        assigned_team: assignedTeam ? assignedTeam : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-issues"] });
      queryClient.invalidateQueries({ queryKey: ["issue", issueId] });
      onClose();
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="text-lg font-bold text-slate-900">Assign Issue</h3>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Team Assignment */}
          <div>
            <label className="flex items-center text-sm font-semibold text-slate-700 mb-1.5">
              <Users className="w-4 h-4 mr-1.5 text-slate-500" />
              Department / Team
            </label>
            <select
              value={assignedTeam}
              onChange={(e) => setAssignedTeam(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- No Department Assigned --</option>
              {teams?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Personnel Assignment */}
          <div>
            <label className="flex items-center text-sm font-semibold text-slate-700 mb-1.5">
              <UserCheck className="w-4 h-4 mr-1.5 text-slate-500" />
              Assigned Staff Member
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Unassigned (General Queue) --</option>
              {staff?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.email})
                </option>
              ))}
            </select>
          </div>
        </div>

        {mutation.isError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {(mutation.error as any)?.message || "Failed to update assignment."}
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
            disabled={mutation.isPending || loadingTeams || loadingStaff}
            onClick={() => mutation.mutate()}
            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-sm"
          >
            {mutation.isPending ? "Assigning..." : "Save Assignment"}
          </button>
        </div>
      </div>
    </div>
  );
}
