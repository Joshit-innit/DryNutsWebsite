import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SUPPORT_EMAIL } from "@/lib/support";

export const metadata = { title: "Forgot your password — NutriNation" };

// Self-service reset needs an email provider, which isn't connected yet.
export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto flex min-h-[65vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-[clamp(2.25rem,5vw,3rem)] tracking-[-0.04em]">Forgot your password?</h1>
      <p className="mt-4 text-[15px] leading-relaxed text-brand-muted">
        Email us from the address on your account and we&apos;ll help you back in. Automatic reset links aren&apos;t
        available yet.
      </p>
      <a
        href={`mailto:${SUPPORT_EMAIL}?subject=Password%20reset`}
        className="mt-7 flex h-12 items-center justify-center rounded-xl bg-brand-dark text-[15px] font-medium text-white transition-colors hover:bg-black"
      >
        Email {SUPPORT_EMAIL}
      </a>
      <Link href="/login" className="mt-5 inline-flex items-center gap-1.5 text-[14px] text-brand-muted transition-colors hover:text-brand-dark">
        <ArrowLeft className="h-4 w-4" />
        Back to sign in
      </Link>
    </div>
  );
}
