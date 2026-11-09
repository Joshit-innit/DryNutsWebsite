"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { ArrowRight, Check, Eye, EyeOff, Loader2 } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { AuthResponse, apiErrorMessage, isAdminRole, submitCredentials, toSessionUser } from "@/lib/auth-session";
import { CATEGORY_IMAGE_SETS } from "@/lib/product-images";
import { FloatingInput } from "@/components/watermelon/floating-input";
import { cn } from "@/lib/utils";

export type AuthMode = "signin" | "register";

const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name").max(120, "That name is too long"),
    email: z.string().trim().email("Enter a valid email address"),
    password: z.string().min(12, "Use at least 12 characters").max(128, "That password is too long"),
    confirmPassword: z.string().min(1, "Enter your password again"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "These passwords don't match",
  });

type SignInValues = z.infer<typeof signInSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

/** Each form field widens its own panel, so the shelf follows the customer down the form. */
const SHELVES: Record<AuthMode, { label: string; image: string }[]> = {
  signin: [
    { label: "Almonds", image: CATEGORY_IMAGE_SETS.almonds[3] },
    { label: "Pistachios", image: CATEGORY_IMAGE_SETS.pistachios[0] },
    { label: "Cashews", image: CATEGORY_IMAGE_SETS.cashews[0] },
  ],
  register: [
    { label: "Walnuts", image: CATEGORY_IMAGE_SETS.walnuts[0] },
    { label: "Cashews", image: CATEGORY_IMAGE_SETS.cashews[1] },
    { label: "Pistachios", image: CATEGORY_IMAGE_SETS.pistachios[1] },
  ],
};

/** Where to send someone after they authenticate. Admins always land in the admin portal. */
/**
 * Keeps `?next=` on this site. Browsers read "/\\evil.com" and "/%09/evil.com" as other
 * websites, so the path is resolved the way the browser would and kept only if it stays here.
 */
function sameSitePath(next?: string): string | undefined {
  if (!next || !next.startsWith("/")) return undefined;
  try {
    const base = "https://nutrination.invalid";
    const url = new URL(next, base);
    return url.origin === base ? `${url.pathname}${url.search}${url.hash}` : undefined;
  } catch {
    return undefined;
  }
}

function destinationFor(role: string, next?: string): string {
  const safeNext = sameSitePath(next);
  if (isAdminRole(role)) {
    return safeNext?.startsWith("/admin") || safeNext?.startsWith("/cmd") ? safeNext : "/admin";
  }
  if (safeNext && !safeNext.startsWith("/admin") && !safeNext.startsWith("/cmd")) {
    return safeNext;
  }
  return "/";
}

export default function AuthPanel({ initialMode = "signin", next }: { initialMode?: AuthMode; next?: string }) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [activePanel, setActivePanel] = useState(0);
  const router = useRouter();
  const { user, setUser, logout } = useStore();

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setActivePanel(0);
    // Keep the URL shareable without triggering a navigation.
    window.history.replaceState(null, "", nextMode === "register" ? "/register" : "/login");
  };

  const completeAuth = (auth: AuthResponse) => {
    const sessionUser = toSessionUser(auth);
    setUser(sessionUser);
    toast.success(`Welcome, ${sessionUser.name.split(" ")[0]}`);
    router.replace(destinationFor(auth.role, next));
  };

  return (
    <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-8 px-2 pb-10 pt-2 sm:px-3 lg:min-h-[calc(100vh-101px)] lg:grid-cols-[minmax(0,1fr)_minmax(460px,0.72fr)] lg:gap-0 lg:pb-3">
      <Shelf key={mode} panels={SHELVES[mode]} active={activePanel} />

      <div className="flex items-center justify-center px-2 py-6 sm:px-6 lg:px-12 lg:py-10">
        <div className="mx-auto w-full max-w-[420px]">
          {user ? (
            <SignedInNotice
              name={user.name}
              email={user.email}
              isAdmin={user.role === "admin"}
              onContinue={() => router.push(user.role === "admin" ? "/admin" : "/")}
              onSignOut={async () => {
                await logout();
                toast.info("You have been signed out.");
              }}
            />
          ) : mode === "signin" ? (
            <SignInView onAuthenticated={completeAuth} onSwitch={() => switchMode("register")} onPanel={setActivePanel} />
          ) : (
            <RegisterView onAuthenticated={completeAuth} onSwitch={() => switchMode("signin")} onPanel={setActivePanel} />
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function Shelf({ panels, active }: { panels: { label: string; image: string }[]; active: number }) {
  return (
    <div aria-hidden className="flex h-40 min-w-0 gap-1.5 sm:h-56 sm:gap-2 lg:h-auto">
      {panels.map((panel, index) => (
        <div
          key={panel.label}
          style={{ flexGrow: index === active ? 3.4 : 1 }}
          className="relative min-w-0 flex-1 overflow-hidden rounded-[22px] bg-brand-beige transition-[flex-grow] duration-[900ms] ease-luxury motion-reduce:transition-none"
        >
          <img
            src={panel.image}
            alt=""
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-[transform,filter] duration-[1200ms] ease-luxury motion-reduce:transition-none",
              index === active ? "scale-100 saturate-100" : "scale-110 saturate-[0.8] brightness-[0.85]"
            )}
          />
          <div
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              index === active ? "bg-gradient-to-t from-black/60 via-black/5 to-transparent" : "bg-black/20"
            )}
          />
          {/* Open panel: the harvest's name at Display weight. Folded panels: nothing but photo. */}
          <span
            className={cn(
              "absolute bottom-5 left-5 whitespace-nowrap text-[clamp(1.75rem,4.2vw,4.25rem)] font-bold leading-[0.95] tracking-[-0.045em] text-white transition-[opacity,transform] duration-700 ease-luxury motion-reduce:transition-none sm:bottom-8 sm:left-8",
              index === active ? "translate-y-0 opacity-100 delay-300" : "translate-y-3 opacity-0"
            )}
          >
            {panel.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function Heading({ lead, accent, children }: { lead: string; accent: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h1 className="text-balance text-[clamp(2.5rem,4.4vw,3.5rem)] font-semibold leading-[1] tracking-[-0.04em]">
        {lead} <span className="font-accent font-normal italic tracking-[-0.02em]">{accent}</span>
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-brand-muted">{children}</p>
    </div>
  );
}

/** Tracks the backend waking up while a submit is in flight. */
function SubmitButton({ busy, waking, idle, working }: { busy: boolean; waking: boolean; idle: string; working: string }) {
  return (
    <div className="pt-1">
      <button
        type="submit"
        disabled={busy}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-dark text-[15px] font-medium text-white transition-[background-color,transform] duration-200 hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-brand-green active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {busy ? working : idle}
        {!busy && <ArrowRight className="h-4 w-4" />}
      </button>
      {waking && (
        <p role="status" className="mt-3 text-[13px] leading-relaxed text-brand-muted">
          Our sign-in service is waking up, which can take a couple of minutes. You don&apos;t need to do anything.
        </p>
      )}
    </div>
  );
}

function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-3 text-[14px] leading-snug text-red-800">
      {message}
    </p>
  );
}

function SwitchPrompt({ question, action, onClick }: { question: string; action: string; onClick: () => void }) {
  return (
    <p className="mt-8 border-t border-brand-border pt-5 text-[14px] text-brand-muted">
      {question}{" "}
      <button type="button" onClick={onClick} className="link-rule font-medium text-brand-dark">
        {action}
      </button>
    </p>
  );
}

interface ViewProps {
  onAuthenticated: (auth: AuthResponse) => void;
  onSwitch: () => void;
  onPanel: (index: number) => void;
}

function SignInView({ onAuthenticated, onSwitch, onPanel }: ViewProps) {
  const [waking, setWaking] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({ resolver: zodResolver(signInSchema), defaultValues: { email: "", password: "" } });

  const onSubmit = async (data: SignInValues) => {
    setFormError(null);
    try {
      onAuthenticated(await submitCredentials("/auth/login", data, () => setWaking(true)));
    } catch (error) {
      setFormError(apiErrorMessage(error, "We couldn't sign you in. Please try again."));
    } finally {
      setWaking(false);
    }
  };

  return (
    <>
      <h1 className="sr-only">Sign in to NutriNation</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
        <FloatingInput
          id="signin-email"
          type="email"
          label="Email address"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
          onFocus={() => onPanel(0)}
        />
        <PasswordField
          id="signin-password"
          label="Password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
          onFocus={() => onPanel(1)}
        />
        <div className="flex justify-end">
          <Link href="/forgot-password" className="link-rule text-[13px] text-brand-muted hover:text-brand-dark">
            Forgot your password?
          </Link>
        </div>
        <FormError message={formError} />
        <SubmitButton busy={isSubmitting} waking={waking} idle="Sign in" working="Signing you in" />
      </form>

      <SwitchPrompt question="New to NutriNation?" action="Create an account" onClick={onSwitch} />
    </>
  );
}

function RegisterView({ onAuthenticated, onSwitch, onPanel }: ViewProps) {
  const [waking, setWaking] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const password = watch("password") || "";
  const confirmPassword = watch("confirmPassword") || "";

  const onSubmit = async ({ name, email, password }: RegisterValues) => {
    setFormError(null);
    try {
      onAuthenticated(await submitCredentials("/auth/register", { name, email, password }, () => setWaking(true)));
    } catch (error) {
      setFormError(apiErrorMessage(error, "We couldn't create your account. Please try again."));
    } finally {
      setWaking(false);
    }
  };

  return (
    <>
      <Heading lead="Start your" accent="pantry.">
        Keep a wishlist and follow every order in one place.
      </Heading>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
        <FloatingInput
          id="register-name"
          label="Full name"
          autoComplete="name"
          error={errors.name?.message}
          {...register("name")}
          onFocus={() => onPanel(0)}
        />
        <FloatingInput
          id="register-email"
          type="email"
          label="Email address"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
          onFocus={() => onPanel(0)}
        />
        <div>
          <PasswordField
            id="register-password"
            label="Password, 12 characters or more"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password")}
            onFocus={() => onPanel(1)}
          />
          <PasswordStrength password={password} />
        </div>
        <PasswordField
          id="register-confirm"
          label="Password again"
          autoComplete="new-password"
          matched={!!confirmPassword && confirmPassword === password}
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
          onFocus={() => onPanel(2)}
        />
        <FormError message={formError} />
        <SubmitButton busy={isSubmitting} waking={waking} idle="Create account" working="Creating your account" />
      </form>

      <SwitchPrompt question="Already have an account?" action="Sign in" onClick={onSwitch} />
    </>
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
    <>
      <Heading lead="You're signed in," accent={`${name.split(" ")[0]}.`}>
        {email}
      </Heading>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onContinue}
          className="flex h-12 items-center justify-center gap-2 rounded-xl sm:flex-1 bg-brand-dark text-[15px] font-medium text-white transition-colors hover:bg-black"
        >
          {isAdmin ? "Open admin portal" : "Continue shopping"}
          <ArrowRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onSignOut}
          className="h-12 rounded-xl border sm:flex-1 border-brand-dark text-[15px] font-medium text-brand-dark transition-colors hover:bg-brand-dark hover:text-white"
        >
          Sign out
        </button>
      </div>
    </>
  );
}

/* ------------------------------- Form parts ------------------------------- */

type PasswordFieldProps = Omit<React.ComponentProps<typeof FloatingInput>, "type" | "trailing"> & { matched?: boolean };

const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(function PasswordField(
  { matched, ...props },
  ref
) {
  const [visible, setVisible] = useState(false);
  return (
    <FloatingInput
      ref={ref}
      type={visible ? "text" : "password"}
      className={matched ? "pr-20" : undefined}
      trailing={
        <div className="flex items-center">
          {matched && <Check className="mr-1 h-4 w-4 text-brand-green" aria-label="Passwords match" />}
          <button
            type="button"
            onClick={() => setVisible((shown) => !shown)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="rounded-lg p-2.5 text-brand-muted transition-colors hover:text-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-green"
          >
            {visible ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
          </button>
        </div>
      }
      {...props}
    />
  );
});

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "12+ characters", ok: password.length >= 12 },
    { label: "Upper and lower case", ok: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: "A number", ok: /\d/.test(password) },
    { label: "A symbol", ok: /[^A-Za-z0-9]/.test(password) },
  ];

  if (!password) return null;

  return (
    <ul className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1 text-[12px]">
      {checks.map((check) => (
        <li key={check.label} className={cn("flex items-center gap-1.5", check.ok ? "text-brand-green" : "text-brand-muted")}>
          <Check className={cn("h-3 w-3", check.ok ? "opacity-100" : "opacity-30")} />
          {check.label}
        </li>
      ))}
    </ul>
  );
}
