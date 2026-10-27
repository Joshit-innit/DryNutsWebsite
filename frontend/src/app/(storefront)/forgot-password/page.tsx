"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotForm) => {
    await new Promise((res) => setTimeout(res, 600));
    setSubmitted(true);
    toast.success("Reset link sent!", {
      description: `Password recovery instructions sent to ${data.email}`,
    });
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl border border-brand-border p-8 sm:p-12 shadow-card max-w-md w-full text-center space-y-6">
        {!submitted ? (
          <>
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-brand-green">
                SECURITY & RECOVERY
              </span>
              <h1 className="font-serif font-black text-2xl sm:text-3xl text-brand-dark mt-1">
                RESET YOUR PASSWORD
              </h1>
              <p className="text-xs text-brand-muted mt-2">
                Enter your registered email address and we will send a secure link to reset your account password.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-green hover:bg-brand-green-dark text-white font-bold text-xs py-3.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? "Sending Link..." : "SEND RESET LINK"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-brand-green/20 text-brand-green flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="font-serif font-bold text-2xl text-brand-dark">Check Your Inbox</h2>
            <p className="text-xs text-brand-muted leading-relaxed">
              We have sent password reset instructions to your email address. Please follow the instructions to secure your account.
            </p>
          </div>
        )}

        <div className="pt-2 border-t border-brand-border">
          <Link
            href="/login"
            className="text-xs font-bold text-brand-muted hover:text-brand-dark flex items-center justify-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
