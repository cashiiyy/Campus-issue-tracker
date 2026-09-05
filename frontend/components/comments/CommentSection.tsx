"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { commentsApi } from "@/lib/api";
import { commentCreateSchema, CommentCreateFormData } from "@/schemas/issue";
import { formatRelativeTime } from "@/lib/utils";
import { MessageSquare, Send, User as UserIcon } from "lucide-react";

interface CommentSectionProps {
  issueId: string;
}

export function CommentSection({ issueId }: CommentSectionProps) {
  const queryClient = useQueryClient();

  const {
    data: comments,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["comments", issueId],
    queryFn: () => commentsApi.list(issueId),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommentCreateFormData>({
    resolver: zodResolver(commentCreateSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: CommentCreateFormData) =>
      commentsApi.create(issueId, data.content),
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ["comments", issueId] });
      queryClient.invalidateQueries({ queryKey: ["issue", issueId] });
    },
  });

  const onSubmit = (data: CommentCreateFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
      <div className="flex items-center space-x-2 border-b border-slate-100 pb-4">
        <MessageSquare className="w-5 h-5 text-indigo-600" />
        <h3 className="text-base font-bold text-slate-900">
          Activity & Discussion ({comments?.length ?? 0})
        </h3>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-16 bg-slate-100 rounded-lg" />
            <div className="h-16 bg-slate-100 rounded-lg" />
          </div>
        ) : isError ? (
          <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            Unable to load comments for this issue.
          </div>
        ) : comments && comments.length > 0 ? (
          comments.map((c) => (
            <div
              key={c.id}
              className="flex space-x-3 p-4 rounded-lg bg-slate-50 border border-slate-100"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-xs ${
                  c.author?.role === "ADMIN" ? "bg-purple-600" : "bg-indigo-600"
                }`}
              >
                {c.author?.name ? c.author.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-semibold text-slate-900">
                    {c.author?.name || "Anonymous User"}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      c.author?.role === "ADMIN"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {c.author?.role}
                  </span>
                  <span className="text-xs text-slate-400">
                    {formatRelativeTime(c.created_at)}
                  </span>
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {c.content}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-sm text-slate-400">
            No comments yet. Post an update or note below.
          </div>
        )}
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 pt-2">
        <div>
          <label htmlFor="comment-content" className="sr-only">
            Add a comment
          </label>
          <textarea
            id="comment-content"
            rows={3}
            placeholder="Add an update or question about this issue..."
            {...register("content")}
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-slate-400"
          />
          {errors.content && (
            <p className="mt-1 text-xs text-rose-600">{errors.content.message}</p>
          )}
        </div>

        {mutation.isError && (
          <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
            {(mutation.error as any)?.message || "Failed to post comment."}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || mutation.isPending}
            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
          >
            <Send className="w-3.5 h-3.5 mr-1.5" />
            {mutation.isPending ? "Posting..." : "Post Comment"}
          </button>
        </div>
      </form>
    </div>
  );
}
