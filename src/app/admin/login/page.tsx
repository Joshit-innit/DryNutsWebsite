"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, User, Leaf, AlertCircle } from "lucide-react";
import { Suspense } from "react";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        // Store in localStorage so client-side can check session
        localStorage.setItem("nn_admin_authenticated", "true");
        localStorage.setItem("nn_admin_user", username);
        router.push(from);
        router.refresh();
      } else {
        setError(data.message || "Invalid credentials. Access denied.");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-green/20 border border-brand-green/40 mb-4">
            <Leaf className="w-8 h-8 text-brand-green" />
          </div>
          <h1 className="font-casanova text-3xl sm:text-4xl text-white tracking-[0.03em] font-normal">
            NutriNation
          </h1>
          <p className="text-xs text-white/50 mt-1 uppercase tracking-widest font-mono">
            Admin Portal — Restricted Access
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm space-y-6">
          <div>
            <h2 className="text-white font-bold text-lg">Authorized Sign-in</h2>
            <p className="text-white/50 text-xs mt-0.5">
              This portal is restricted to authorized NutriNation administrators only.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/70 uppercase tracking-wider block">
                Administrator Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  autoComplete="off"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-brand-green transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/70 uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-brand-green transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-950/50 border border-red-800/50 rounded-xl p-3 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-brand-green hover:bg-brand-green-dark text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {loading ? "Authenticating..." : "Sign In to Admin Portal"}
            </button>
          </form>

          <p className="text-center text-xs text-white/30 pt-2 border-t border-white/10">
            Unauthorized access attempts are logged and tracked.
          </p>
        </div>

        <p className="text-center mt-6 text-xs text-white/30">
          ← Return to{" "}
          <a href="/" className="text-brand-green hover:underline font-semibold">
            Customer Storefront
          </a>
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-dark" />}>
      <AdminLoginForm />
    </Suspense>
  );
}
