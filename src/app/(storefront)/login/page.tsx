"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useStore } from "@/context/StoreContext";
import { Apple, ArrowRight, Chrome, Lock, Mail, ShieldCheck, Sparkles } from "lucide-react";

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
    <div className="min-h-[86vh] bg-[radial-gradient(circle_at_top_left,#FBF6EC,transparent_34%),linear-gradient(180deg,#FFFFFF,#FBFBFA)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-3xl border border-brand-border bg-white shadow-card lg:grid-cols-12">
        <div className="relative min-h-[320px] overflow-hidden bg-brand-dark p-7 text-white sm:p-10 lg:col-span-6 lg:min-h-[640px]">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?auto=format&fit=crop&w=1400&q=85"
              alt="Assorted dry fruits in bowls"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/70 to-brand-dark/20" />
          </div>

          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-brand-saffron backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              NutriNation Members
            </div>

            <div className="max-w-md space-y-5">
              <h2 className="font-serif text-4xl font-semibold leading-tight text-white sm:text-5xl">
                Your harvest shelf, saved beautifully.
              </h2>
              <p className="text-sm leading-relaxed text-white/75 sm:text-base">
                Sign in to revisit wishlists, repeat clean snack orders, and track premium dry fruit boxes from packing to doorstep.
              </p>
              <div className="grid grid-cols-3 gap-3 border-t border-white/15 pt-5 text-xs text-white/70">
                <span>Wishlist</span>
                <span>Orders</span>
                <span>Rewards</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-7 sm:p-10 lg:col-span-6 lg:p-14">
          <div>
            <p className="eyebrow text-brand-saffron">Member access</p>
            <h1 className="mt-2 text-3xl font-bold text-brand-dark sm:text-4xl">
              Welcome back
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-brand-muted">
              Use demo credentials for now, or connect Google/Apple later when authentication is ready.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-brand-border bg-white text-xs font-bold text-brand-dark shadow-xs hover:border-brand-dark hover:bg-brand-cream"
            >
              <Chrome className="h-4 w-4" />
              Continue with Google
            </button>
            <button
              type="button"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-brand-dark bg-brand-dark text-xs font-bold text-white shadow-xs hover:bg-brand-green-light"
            >
              <Apple className="h-4 w-4" />
              Continue with Apple
            </button>
          </div>

          <div className="my-7 flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-brand-muted">
            <span className="h-px flex-1 bg-brand-border" />
            or use email
            <span className="h-px flex-1 bg-brand-border" />
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
                  className="w-full rounded-2xl border border-brand-border bg-brand-cream/40 py-3.5 pl-10 pr-4 text-sm text-brand-dark focus:outline-none focus:border-brand-green"
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
                  className="w-full rounded-2xl border border-brand-border bg-brand-cream/40 py-3.5 pl-10 pr-4 text-sm text-brand-dark focus:outline-none focus:border-brand-green"
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

          <div className="mt-7 rounded-2xl border border-brand-border bg-brand-cream/50 p-4 text-xs text-brand-muted">
            <div className="flex gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-green" />
              <p>
                Google and Apple are visual placeholders right now. The email form keeps the current demo sign-in behavior.
              </p>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-brand-muted">
            <span>New to NutriNation? </span>
            <Link href="/register" className="font-bold text-brand-green hover:underline">
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
