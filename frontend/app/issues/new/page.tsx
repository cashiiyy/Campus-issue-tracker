"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { issuesApi } from "@/lib/api";
import {
  issueCategories,
  issueCreateSchema,
  issuePriorities,
  IssueCreateFormData,
} from "@/schemas/issue";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  MapPin,
  Send,
} from "lucide-react";

export default function NewIssuePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IssueCreateFormData>({
    resolver: zodResolver(issueCreateSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      category: "Infrastructure",
      priority: "MEDIUM",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: IssueCreateFormData) => issuesApi.create(data),
    onSuccess: (newIssue) => {
      queryClient.invalidateQueries({ queryKey: ["student-issues"] });
      queryClient.invalidateQueries({ queryKey: ["student-recent-issues"] });
      queryClient.invalidateQueries({ queryKey: ["student-stats"] });
      router.push(`/issues/${newIssue.id}`);
    },
    onError: (err: any) => {
      setServerError(err.message || "Failed to submit issue. Please check all fields.");
    },
  });

  const onSubmit = (data: IssueCreateFormData) => {
    setServerError(null);
    mutation.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      {/* Back Link */}
      <Link
        href="/issues"
        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to my issues
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Campus Problem Submission</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Report an Issue</h1>
          <p className="text-xs text-slate-500 mt-1">
            Provide clear details so our facilities, electrical, or IT teams can resolve the problem promptly.
          </p>
        </div>

        {serverError && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Issue Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Issue Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Broken Air Conditioner in Library 3rd Floor East"
              {...register("title")}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-rose-600">{errors.title.message}</p>
            )}
          </div>

          {/* Category & Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                {...register("category")}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-700"
              >
                {issueCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-xs text-rose-600">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Urgency Priority <span className="text-rose-500">*</span>
              </label>
              <select
                {...register("priority")}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-700"
              >
                {issuePriorities.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              {errors.priority && (
                <p className="mt-1 text-xs text-rose-600">{errors.priority.message}</p>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Specific Campus Location <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g., Central Library - Room 302 / West Study Area"
                {...register("location")}
                className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
              />
            </div>
            {errors.location && (
              <p className="mt-1 text-xs text-rose-600">{errors.location.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={5}
              placeholder="Describe the problem, when it started, and its impact on students or classes..."
              {...register("description")}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400 leading-relaxed"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-rose-600">{errors.description.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex justify-end space-x-3">
            <Link
              href="/issues"
              className="px-5 py-2.5 rounded-xl font-semibold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || mutation.isPending}
              className="inline-flex items-center px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-md transition-all hover:scale-[1.01]"
            >
              <Send className="w-4 h-4 mr-2" />
              {mutation.isPending ? "Submitting Report..." : "Submit Campus Issue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
