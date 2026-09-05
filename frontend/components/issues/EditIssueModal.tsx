"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Issue } from "@/types";
import { issuesApi } from "@/lib/api";
import {
  issueCategories,
  issueEditSchema,
  issuePriorities,
  IssueEditFormData,
} from "@/schemas/issue";
import { X, Edit3 } from "lucide-react";

interface EditIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: Issue;
}

export function EditIssueModal({ isOpen, onClose, issue }: EditIssueModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IssueEditFormData>({
    resolver: zodResolver(issueEditSchema),
    defaultValues: {
      title: issue.title,
      description: issue.description,
      category: issue.category,
      location: issue.location,
      priority: issue.priority,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: IssueEditFormData) => issuesApi.update(issue.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issue", issue.id] });
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      onClose();
    },
  });

  if (!isOpen) return null;

  const onSubmit = (data: IssueEditFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 my-8">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Edit3 className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">Edit Reported Issue</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Issue Title
            </label>
            <input
              type="text"
              {...register("title")}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-rose-600">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                {...register("category")}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {issueCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Urgency Priority
              </label>
              <select
                {...register("priority")}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {issuePriorities.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Campus Location
            </label>
            <input
              type="text"
              {...register("location")}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.location && (
              <p className="mt-1 text-xs text-rose-600">{errors.location.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Description
            </label>
            <textarea
              rows={4}
              {...register("description")}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-rose-600">{errors.description.message}</p>
            )}
          </div>

          {mutation.isError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {(mutation.error as any)?.message || "Failed to save issue changes."}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || mutation.isPending}
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-sm"
            >
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
