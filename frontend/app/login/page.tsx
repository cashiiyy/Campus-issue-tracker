"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/lib/auth";
import { authApi } from "@/lib/api";
import { loginSchema, LoginFormData } from "@/schemas/auth";
import { AlertCircle, Lock, Mail, LogIn, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      const resp = await authApi.login(data.email, data.password);
      login(resp.access_token, resp.user);
      if (resp.user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setServerError(err.message || "Invalid credentials. Please try again.");
    }
  };

  const fillDemo = (email: string, pass: string) => {
    setValue("email", email);
    setValue("password", pass);
    setServerError(null);
  };

  return (
    <div className="max-w-md mx-auto py-10">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-8 space-y-6">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <LogIn className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Sign in to your account</h1>
          <p className="text-xs text-slate-500">
            Enter your credentials to access the campus reporting portal
          </p>
        </div>

        {/* Evaluator Demo Quick Fill Buttons */}
        <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-2">
          <div className="flex items-center text-[11px] font-bold text-indigo-900 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-600" />
            Quick Fill Demo Accounts
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemo("student@example.com", "StudentPass123!")}
              className="px-2.5 py-1.5 text-xs font-semibold bg-white text-slate-700 hover:bg-indigo-50 border border-slate-200 rounded-lg shadow-xs transition-colors"
            >
              Demo Student
            </button>
            <button
              type="button"
              onClick={() => fillDemo("admin@example.com", "AdminPass123!")}
              className="px-2.5 py-1.5 text-xs font-semibold bg-white text-slate-700 hover:bg-indigo-50 border border-slate-200 rounded-lg shadow-xs transition-colors"
            >
              Campus Admin
            </button>
          </div>
        </div>

        {serverError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-2.5 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="student@example.com"
                {...register("email")}
                className="w-full pl-9 pr-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="••••••••••••"
                {...register("password")}
                className="w-full pl-9 pr-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-sm transition-all"
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-slate-500 border-t border-slate-100">
          Need a student account?{" "}
          <Link href="/register" className="font-semibold text-indigo-600 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
