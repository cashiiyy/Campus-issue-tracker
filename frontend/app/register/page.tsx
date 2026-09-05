"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authApi } from "@/lib/api";
import { registerSchema, RegisterFormData } from "@/schemas/auth";
import { AlertCircle, Lock, Mail, UserPlus, User as UserIcon, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      await authApi.register(data.name, data.email, data.password);
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setServerError(err.message || "Registration failed. Please check your details and try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-4 shadow-md">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Create an Account</h1>
          <p className="text-sm text-slate-500">
            Sign up to report campus issues and track maintenance progress
          </p>
        </div>

        {success ? (
          <div className="p-6 text-center space-y-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="text-base font-bold text-emerald-900">Registration Successful!</h3>
            <p className="text-sm text-emerald-700">
              Your account has been created. Redirecting to sign in…
            </p>
          </div>
        ) : (
          <>
            {serverError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-2.5 text-rose-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    autoComplete="name"
                    {...register("name")}
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  University Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    autoComplete="email"
                    {...register("email")}
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    autoComplete="new-password"
                    {...register("password")}
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-sm transition-all hover:shadow-md mt-2"
              >
                {isSubmitting ? "Creating Account…" : "Create Account"}
              </button>
            </form>

            <div className="text-center pt-1 text-sm text-slate-500 border-t border-slate-100">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-indigo-600 hover:underline">
                Sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
