"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useStore } from "@/context/StoreContext";
import { ArrowRight, User, Mail, Phone, Lock, Sparkles } from "lucide-react";

const registerSchema = z
  .object({
    name: z.string().min(2, "Full name is required"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().min(10, "Valid 10-digit phone number is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
    agreeTerms: z.boolean().refine((val) => val === true, "You must agree to the Terms of Service"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      agreeTerms: true,
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    await new Promise((res) => setTimeout(res, 600));
    setUser({
      id: `user-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: "customer",
    });
    toast.success("Welcome to the NutriNation family!", {
      description: "Your connoisseur account has been created.",
    });
    router.push("/account");
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-3xl border border-brand-border shadow-card overflow-hidden max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12">
        {/* Left Visual */}
        <div className="lg:col-span-5 relative bg-brand-dark text-white p-8 sm:p-10 flex flex-col justify-between overflow-hidden min-h-[280px] lg:min-h-[580px]">
          <div className="absolute inset-0 z-0 opacity-35">
            <img
              src="https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=800&q=80"
              alt="NutriNation Kashmiri Mamra"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/70 to-transparent" />
          </div>

          <div className="relative z-10 space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-brand-saffron">
              JOIN THE HARVEST
            </span>
            <h3 className="font-serif font-bold text-2xl text-white">
              Nourish Your Body with 100% Pure Botanical Superfruits.
            </h3>
          </div>

          <div className="relative z-10 space-y-2 text-xs text-white/70">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-saffron" />
              <span>Earn rewards on every harvest order</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-saffron" />
              <span>Priority access to seasonal crop reserves</span>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 space-y-6">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-brand-green">
              NEW MEMBER REGISTRATION
            </span>
            <h1 className="font-serif font-black text-2xl sm:text-3xl text-brand-dark mt-1">
              JOIN THE NUTRINATION FAMILY
            </h1>
            <p className="text-xs text-brand-muted mt-1">
              Create an account to start your customized wellness journey.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  {...register("name")}
                  type="text"
                  placeholder="e.g. Chandu Tammana"
                  className="w-full text-xs pl-10 pr-4 py-2.5 bg-brand-cream/30 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
                />
              </div>
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="name@example.com"
                    className="w-full text-xs pl-10 pr-4 py-2.5 bg-brand-cream/30 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    {...register("phone")}
                    type="tel"
                    placeholder="9876543210"
                    className="w-full text-xs pl-10 pr-4 py-2.5 bg-brand-cream/30 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
                  />
                </div>
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    {...register("password")}
                    type="password"
                    placeholder="••••••••"
                    className="w-full text-xs pl-10 pr-4 py-2.5 bg-brand-cream/30 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
                  />
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    {...register("confirmPassword")}
                    type="password"
                    placeholder="••••••••"
                    className="w-full text-xs pl-10 pr-4 py-2.5 bg-brand-cream/30 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-brand-muted">
                <input
                  {...register("agreeTerms")}
                  type="checkbox"
                  className="w-4 h-4 rounded text-brand-green accent-brand-green"
                />
                <span>I agree to the Terms of Service & Privacy Policy</span>
              </label>
              {errors.agreeTerms && <p className="text-xs text-red-500 mt-1">{errors.agreeTerms.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand-green hover:bg-brand-green-dark text-white font-bold text-xs py-3.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? "Creating Account..." : "CREATE ACCOUNT"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-brand-border text-xs text-brand-muted">
            <span>Already have an account? </span>
            <Link href="/login" className="text-brand-green font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
