import React from "react";

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full space-y-3 animate-pulse">
      <div className="h-10 bg-slate-200 rounded-lg w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 bg-slate-100 rounded-lg w-full flex items-center px-4 space-x-4">
          <div className="h-4 bg-slate-200 rounded w-1/4" />
          <div className="h-4 bg-slate-200 rounded w-1/6" />
          <div className="h-4 bg-slate-200 rounded w-1/6" />
          <div className="h-4 bg-slate-200 rounded w-1/12" />
          <div className="h-4 bg-slate-200 rounded w-1/12" />
        </div>
      ))}
    </div>
  );
}

export function CardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-4 bg-slate-200 rounded w-1/3" />
            <div className="h-6 bg-slate-200 rounded-full w-20" />
          </div>
          <div className="h-6 bg-slate-200 rounded w-3/4" />
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-2/3" />
          <div className="pt-4 border-t border-slate-100 flex justify-between">
            <div className="h-4 bg-slate-200 rounded w-1/4" />
            <div className="h-4 bg-slate-200 rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
