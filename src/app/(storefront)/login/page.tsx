"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useStore } from "@/context/StoreContext";
import { ArrowRight, Lock, Mail, Sparkles } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "chandu@nutrination.in",
      password: "password123",
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginForm) => {
    await new Promise((res) => setTimeout(res, 500));
    setUser({
      id: "user-1",
      name: "Chandu Tammana",
      email: data.email,
      role: "customer",
    });
    toast.success("Welcome back to NutriNation!", {
      description: "Signed in successfully.",
    });
    router.push("/account");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-3xl border border-brand-border shadow-card overflow-hidden max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12">
        {/* Left Editorial Visual */}
        <div className="lg:col-span-5 relative bg-brand-dark text-white p-8 sm:p-10 flex flex-col justify-between overflow-hidden min-h-[280px] lg:min-h-[500px]">
          <div className="absolute inset-0 z-0 opacity-40">
            <img
              src="https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=800&q=80"
              alt="King cashews"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/70 to-transparent" />
          </div>

          <div className="relative z-10 space-y-2">
            <p className="eyebrow">Nourish naturally</p>
            <h3 className="font-serif font-medium text-3xl text-white leading-tight">
              Everyday wellness in every harvest.
            </h3>
          </div>

          <div className="relative z-10 text-xs text-white/70">
            <p>Access your saved harvest wishlist, tracked shipments, and exclusive connoisseur perks.</p>
          </div>
        </div>

        {/* Right Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 space-y-6">
          <div>
            <p className="eyebrow">Member access</p>
            <h1 className="font-serif font-medium text-3xl sm:text-4xl text-brand-dark mt-1">
              Welcome back
            </h1>
            <p className="text-xs text-brand-muted mt-1">
              Sign in to manage your orders and subscription boxes.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="name@example.com"
                  className="w-full text-xs pl-10 pr-4 py-3 bg-brand-cream/30 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-brand-dark">Password</label>
                <Link href="/forgot-password" className="text-[11px] text-brand-green hover:underline font-semibold">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  {...register("password")}
                  type="password"
                  placeholder="••••••••"
                  className="w-full text-xs pl-10 pr-4 py-3 bg-brand-cream/30 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
                />
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-brand-muted">
                <input
                  {...register("rememberMe")}
                  type="checkbox"
                  className="w-4 h-4 rounded text-brand-green accent-brand-green"
                />
                <span>Remember me on this device</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary"
            >
              <span>{isSubmitting ? "Signing in..." : "Sign in"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-brand-border text-xs text-brand-muted">
            <span>New to NutriNation? </span>
            <Link href="/register" className="text-brand-green font-bold hover:underline">
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
