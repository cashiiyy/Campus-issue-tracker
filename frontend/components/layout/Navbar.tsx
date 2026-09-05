"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard,
  ListOrdered,
  PlusCircle,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  MapPin,
} from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const isActive = (path: string) => {
    if (path === "/issues" && pathname === "/issues") return true;
    if (path === "/admin/issues" && pathname === "/admin/issues") return true;
    return pathname === path;
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center">
            <Link href={user ? (user.role === "ADMIN" ? "/admin" : "/dashboard") : "/"} className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-sm">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900">Campus Tracker</span>
                <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  Issue Portal
                </span>
              </div>
            </Link>

            {/* Navigation Links for Authenticated Users */}
            {user && (
              <div className="hidden md:ml-8 md:flex md:space-x-2">
                {user.role === "STUDENT" ? (
                  <>
                    <Link
                      href="/dashboard"
                      className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive("/dashboard")
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4 mr-1.5" />
                      Dashboard
                    </Link>
                    <Link
                      href="/issues"
                      className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive("/issues")
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <ListOrdered className="w-4 h-4 mr-1.5" />
                      My Issues
                    </Link>
                    <Link
                      href="/issues/new"
                      className={`inline-flex items-center px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive("/issues/new")
                          ? "bg-indigo-600 text-white"
                          : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                      }`}
                    >
                      <PlusCircle className="w-4 h-4 mr-1.5" />
                      Report Issue
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/admin"
                      className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive("/admin")
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4 mr-1.5" />
                      Operations Hub
                    </Link>
                    <Link
                      href="/admin/issues"
                      className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive("/admin/issues")
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 mr-1.5" />
                      Manage All Issues
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right Section: User details or Auth links */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-900">{user.name}</div>
                  <div className="flex items-center justify-end space-x-1">
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        user.role === "ADMIN"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {user.role}
                    </span>
                    <span className="text-xs text-slate-400">{user.email}</span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-slate-900"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2">
          {user ? (
            <>
              <div className="py-2 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">{user.name}</div>
                  <div className="text-xs text-slate-500">{user.email}</div>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                    user.role === "ADMIN"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {user.role}
                </span>
              </div>

              {user.role === "STUDENT" ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/issues"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    My Issues
                  </Link>
                  <Link
                    href="/issues/new"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-indigo-700 bg-indigo-50 font-semibold"
                  >
                    + Report New Issue
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Operations Hub
                  </Link>
                  <Link
                    href="/admin/issues"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Manage All Issues
                  </Link>
                </>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-rose-600 hover:bg-rose-50 flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 space-y-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg"
              >
                Log In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
