"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Leaf,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Truck,
  User,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { backendApi, unwrapData } from "@/lib/api/axios";
import { AuthResponse, apiErrorMessage, isAdminRole, saveSession } from "@/lib/auth-session";
import { cn } from "@/lib/utils";

export type AuthMode = "signin" | "register";

const signInSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(1, "Please enter your password"),
});

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Please enter your full name").max(120, "Name is too long"),
    email: z.string().trim().email("Please enter a valid email address"),
    password: z
      .string()
      .min(12, "Use at least 12 characters")
      .max(128, "Password is too long"),
    confirmPassword: z.string().min(1, "Please re-enter your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type SignInForm = z.infer<typeof signInSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

const PANEL_COPY: Record<AuthMode, { eyebrow: string; title: string; body: string }> = {
  signin: {
    eyebrow: "NutriNation Members",
    title: "Your harvest shelf, saved beautifully.",
    body: "Sign in to revisit your wishlist, reorder favourites, and track every box from packing to doorstep.",
  },
  register: {
    eyebrow: "Join NutriNation",
    title: "Begin your ritual of mindful snacking.",
    body: "Create an account to save favourites, check out faster, and follow your orders in one place.",
  },
};

const PERKS = [
  { icon: Leaf, label: "Hand-graded harvests" },
  { icon: Truck, label: "Free delivery over ₹999" },
  { icon: ShieldCheck, label: "Secure checkout" },
];

/** Where to send someone after they authenticate. Admins always land in the admin portal. */
function destinationFor(role: string, next?: string): string {
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : undefined;
  if (isAdminRole(role)) {
    return safeNext?.startsWith("/admin") ? safeNext : "/admin";
  }
  if (safeNext && !safeNext.startsWith("/admin") && !safeNext.startsWith("/cmd")) {
    return safeNext;
  }
  return "/";
}

export default function AuthPanel({ initialMode = "signin", next }: { initialMode?: AuthMode; next?: string }) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const router = useRouter();
  const { user, setUser, logout } = useStore();

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    // Keep the URL shareable without triggering a navigation.
    window.history.replaceState(null, "", nextMode === "register" ? "/register" : "/login");
  };

  const completeAuth = (auth: AuthResponse, fallback: { name?: string; email: string }) => {
    const sessionUser = saveSession(auth, fallback);
    setUser(sessionUser);
    if (isAdminRole(auth.role)) {
      toast.success(`Welcome, ${sessionUser.name}`, { description: "Opening the admin portal." });
    } else {
      toast.success(`Welcome to NutriNation, ${sessionUser.name.split(" ")[0]}!`);
    }
    router.replace(destinationFor(auth.role, next));
  };

  const copy = PANEL_COPY[mode];

  return (
    <div className="min-h-[86vh] bg-[radial-gradient(circle_at_top_left,#F3E7D1,transparent_38%),linear-gradient(180deg,#F6F0E4,#FFFDF8)] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-3xl border border-brand-border bg-white shadow-card lg:grid-cols-12">
        {/* Visual panel */}
        <div className="relative min-h-[280px] overflow-hidden bg-brand-dark p-7 text-white sm:p-10 lg:col-span-6 lg:min-h-[680px]">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=1400&q=85"
              alt="Premium almonds"
              className="h-full w-full object-cover animate-kenburns"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/70 to-brand-dark/15" />
          </div>

          <div className="relative z-10 flex h-full flex-col justify-between gap-10">
            <Link href="/" className="flex w-fit items-baseline" aria-label="NutriNation home">
              <span className="text-[1.6rem] font-bold leading-none tracking-[-0.055em] text-white">NutriNation</span>
              <span className="ml-0.5 h-[7px] w-[7px] rounded-full bg-brand-green-light" />
            </Link>

            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-md space-y-5"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-brand-saffron backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5" />
                  {copy.eyebrow}
                </div>
                <h2 className="font-serif text-4xl leading-tight text-white sm:text-5xl">{copy.title}</h2>
                <p className="text-sm leading-relaxed text-white/75 sm:text-base">{copy.body}</p>
                <ul className="grid grid-cols-1 gap-3 border-t border-white/15 pt-5 text-xs text-white/80 sm:grid-cols-3">
                  {PERKS.map(({ icon: Icon, label }) => (
                    <li key={label} className="flex items-center gap-2">
                      <Icon className="h-4 w-4 flex-shrink-0 text-brand-saffron" />
                      {label}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Form panel */}
        <div className="flex flex-col justify-center p-7 sm:p-10 lg:col-span-6 lg:p-14">
          {user ? (
            <SignedInNotice
              name={user.name}
              email={user.email}
              isAdmin={user.role === "admin"}
              onContinue={() => router.push(user.role === "admin" ? "/admin" : "/")}
              onSignOut={() => {
                logout();
                toast.info("You have been signed out.");
              }}
            />
          ) : (
            <>
              <div
                role="tablist"
                aria-label="Account access"
                className="relative mb-8 grid grid-cols-2 rounded-full border border-brand-border bg-brand-cream p-1"
              >
                {(["signin", "register"] as AuthMode[]).map((tab) => (
                  <button
                    key={tab}
                    role="tab"
                    type="button"
                    aria-selected={mode === tab}
                    onClick={() => switchMode(tab)}
                    className={cn(
                      "relative z-10 rounded-full py-2.5 text-xs font-bold uppercase tracking-wider transition-colors",
                      mode === tab ? "text-white" : "text-brand-muted hover:text-brand-dark"
                    )}
                  >
                    {mode === tab && (
                      <motion.span
                        layoutId="auth-tab"
                        className="absolute inset-0 -z-10 rounded-full bg-brand-dark shadow-subtle"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                    {tab === "signin" ? "Sign in" : "Create account"}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, x: mode === "signin" ? -16 : 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: mode === "signin" ? 16 : -16 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  {mode === "signin" ? (
                    <SignInForm onAuthenticated={completeAuth} onSwitch={() => switchMode("register")} />
                  ) : (
                    <RegisterFormView onAuthenticated={completeAuth} onSwitch={() => switchMode("signin")} />
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="mt-8 flex gap-2 rounded-2xl border border-brand-border bg-brand-cream/60 p-4 text-xs leading-relaxed text-brand-muted">
                <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-green" />
                <p>Your session stays on this browser tab only and ends when you close it.</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

type AuthenticatedHandler = (auth: AuthResponse, fallback: { name?: string; email: string }) => void;

function SignInForm({ onAuthenticated, onSwitch }: { onAuthenticated: AuthenticatedHandler; onSwitch: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInForm>({ resolver: zodResolver(signInSchema), defaultValues: { email: "", password: "" } });

  const onSubmit = async (data: SignInForm) => {
    try {
      const response = await backendApi.post("/auth/login", { email: data.email, password: data.password });
      onAuthenticated(unwrapData<AuthResponse>(response), { email: data.email });
    } catch (error) {
      toast.error("We could not sign you in.", {
        description: apiErrorMessage(error, "Check your email and password, then try again."),
      });
    }
  };

  return (
    <div>
      <p className="eyebrow text-brand-saffron">Welcome back</p>
      <h1 className="mt-2 font-serif text-3xl text-brand-dark sm:text-4xl">Sign in to NutriNation</h1>
      <p className="mt-2 text-sm leading-relaxed text-brand-muted">
        Use the email and password for your account.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
        <Field label="Email address" error={errors.email?.message} htmlFor="signin-email">
          <IconInput icon={Mail} id="signin-email" type="email" autoComplete="email" placeholder="name@example.com" invalid={!!errors.email} {...register("email")} />
        </Field>

        <Field
          label="Password"
          error={errors.password?.message}
          htmlFor="signin-password"
          action={
            <Link href="/forgot-password" className="text-[11px] font-semibold text-brand-green hover:underline">
              Forgot password?
            </Link>
          }
        >
          <PasswordInput id="signin-password" autoComplete="current-password" invalid={!!errors.password} {...register("password")} />
        </Field>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-70">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          <span>{isSubmitting ? "Signing in..." : "Sign in"}</span>
          {!isSubmitting && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-brand-muted">
        New to NutriNation?{" "}
        <button type="button" onClick={onSwitch} className="font-bold text-brand-green hover:underline">
          Create an account
        </button>
      </p>
    </div>
  );
}

function RegisterFormView({ onAuthenticated, onSwitch }: { onAuthenticated: AuthenticatedHandler; onSwitch: () => void }) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const password = watch("password") || "";
  const confirmPassword = watch("confirmPassword") || "";

  const onSubmit = async (data: RegisterForm) => {
    try {
      const response = await backendApi.post("/auth/register", {
        name: data.name,
        email: data.email,
        password: data.password,
      });
      onAuthenticated(unwrapData<AuthResponse>(response), { name: data.name, email: data.email });
    } catch (error) {
      toast.error("We could not create your account.", {
        description: apiErrorMessage(error, "Please check your details and try again."),
      });
    }
  };

  return (
    <div>
      <p className="eyebrow text-brand-saffron">New member</p>
      <h1 className="mt-2 font-serif text-3xl text-brand-dark sm:text-4xl">Create your account</h1>
      <p className="mt-2 text-sm leading-relaxed text-brand-muted">It takes less than a minute.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
        <Field label="Full name" error={errors.name?.message} htmlFor="register-name">
          <IconInput icon={User} id="register-name" type="text" autoComplete="name" placeholder="Your full name" invalid={!!errors.name} {...register("name")} />
        </Field>

        <Field label="Email address" error={errors.email?.message} htmlFor="register-email">
          <IconInput icon={Mail} id="register-email" type="email" autoComplete="email" placeholder="name@example.com" invalid={!!errors.email} {...register("email")} />
        </Field>

        <Field label="Password" error={errors.password?.message} htmlFor="register-password">
          <PasswordInput id="register-password" autoComplete="new-password" placeholder="At least 12 characters" invalid={!!errors.password} {...register("password")} />
          <PasswordStrength password={password} />
        </Field>

        <Field label="Re-enter password" error={errors.confirmPassword?.message} htmlFor="register-confirm">
          <PasswordInput
            id="register-confirm"
            autoComplete="new-password"
            placeholder="Type it once more"
            invalid={!!errors.confirmPassword}
            matched={!!confirmPassword && confirmPassword === password}
            {...register("confirmPassword")}
          />
        </Field>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-70">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          <span>{isSubmitting ? "Creating account..." : "Create account"}</span>
          {!isSubmitting && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-brand-muted">
        Already have an account?{" "}
        <button type="button" onClick={onSwitch} className="font-bold text-brand-green hover:underline">
          Sign in
        </button>
      </p>
    </div>
  );
}

function SignedInNotice({
  name,
  email,
  isAdmin,
  onContinue,
  onSignOut,
}: {
  name: string;
  email: string;
  isAdmin: boolean;
  onContinue: () => void;
  onSignOut: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-green font-serif text-2xl text-white">
        {name.charAt(0).toUpperCase()}
      </div>
      <div>
        <p className="eyebrow text-brand-saffron">Already signed in</p>
        <h1 className="mt-2 font-serif text-3xl text-brand-dark">Hello, {name}</h1>
        <p className="mt-1 text-sm text-brand-muted">{email}</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={onContinue} className="btn-primary flex-1">
          <span>{isAdmin ? "Open admin portal" : "Continue shopping"}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onSignOut}
          className="flex-1 rounded-lg border border-brand-border px-6 py-3.5 text-[13px] font-semibold uppercase tracking-wider text-brand-dark transition-colors hover:border-brand-dark"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

/* ------------------------------- Form parts ------------------------------- */

function Field({
  label,
  htmlFor,
  error,
  action,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={htmlFor} className="text-xs font-bold text-brand-dark">
          {label}
        </label>
        {action}
      </div>
      {children}
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass = (invalid?: boolean) =>
  cn(
    "w-full rounded-2xl border bg-brand-cream/40 py-3.5 pl-10 text-sm text-brand-dark placeholder:text-brand-muted-light focus:bg-white focus:outline-none focus:ring-4",
    invalid
      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
      : "border-brand-border focus:border-brand-green focus:ring-brand-green/10"
  );

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };

const IconInput = React.forwardRef<HTMLInputElement, InputProps & { icon: React.ElementType }>(
  function IconInput({ icon: Icon, invalid, className, ...props }, ref) {
    return (
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
        <input ref={ref} aria-invalid={invalid} className={cn(inputClass(invalid), "pr-4", className)} {...props} />
      </div>
    );
  }
);

const PasswordInput = React.forwardRef<HTMLInputElement, InputProps & { matched?: boolean }>(
  function PasswordInput({ invalid, matched, placeholder = "••••••••••••", ...props }, ref) {
    const [visible, setVisible] = useState(false);
    return (
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
        <input
          ref={ref}
          type={visible ? "text" : "password"}
          aria-invalid={invalid}
          placeholder={placeholder}
          className={cn(inputClass(invalid), matched ? "pr-20" : "pr-12")}
          {...props}
        />
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {matched && <Check className="h-4 w-4 text-brand-green" aria-label="Passwords match" />}
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="rounded-full p-2 text-brand-muted transition-colors hover:bg-brand-beige hover:text-brand-dark"
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
    );
  }
);

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "12+ characters", ok: password.length >= 12 },
    { label: "Upper & lower case", ok: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: "A number", ok: /\d/.test(password) },
    { label: "A symbol", ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const barColor = ["bg-brand-border", "bg-red-400", "bg-brand-orange", "bg-brand-saffron", "bg-brand-green"][score];

  if (!password) return null;

  return (
    <div className="mt-2.5 space-y-2">
      <div className="grid grid-cols-4 gap-1.5">
        {checks.map((_, i) => (
          <span key={i} className={cn("h-1 rounded-full transition-colors", i < score ? barColor : "bg-brand-border")} />
        ))}
      </div>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
        {checks.map((c) => (
          <li key={c.label} className={cn("flex items-center gap-1.5", c.ok ? "text-brand-green" : "text-brand-muted")}>
            <Check className={cn("h-3 w-3", c.ok ? "opacity-100" : "opacity-30")} />
            {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
