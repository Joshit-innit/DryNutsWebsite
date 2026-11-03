import React from "react";
import Link from "next/link";

export interface PolicySection {
  id: string;
  heading: string;
  body: React.ReactNode;
}

const POLICY_LINKS = [
  { href: "/return-policy", label: "Return policy" },
  { href: "/refund-policy", label: "Refund policy" },
  { href: "/privacy-policy", label: "Privacy policy" },
];

import { SUPPORT_EMAIL, SUPPORT_PHONE, SUPPORT_PHONE_HREF } from "@/lib/support";

export { SUPPORT_EMAIL, SUPPORT_PHONE };

export default function PolicyPage({
  eyebrow,
  title,
  intro,
  updated,
  current,
  sections,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  updated: string;
  current: string;
  sections: PolicySection[];
}) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <header className="max-w-3xl space-y-3 mb-12">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="font-serif font-medium text-4xl sm:text-5xl text-brand-dark">{title}</h1>
        <p className="text-sm text-brand-muted leading-relaxed">{intro}</p>
        <p className="text-xs text-brand-muted">Last updated {updated}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <aside className="lg:col-span-3 lg:sticky lg:top-28 space-y-6">
          <nav aria-label="On this page" className="hidden lg:block">
            <p className="text-[11px] uppercase font-bold tracking-wider text-brand-muted mb-3">On this page</p>
            <ul className="space-y-2 text-sm">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-brand-muted hover:text-brand-dark transition-colors">
                    {s.heading}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Policies" className="flex flex-wrap lg:flex-col gap-2">
            {POLICY_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={l.href === current ? "page" : undefined}
                className={`text-xs font-semibold px-3 py-2 rounded-xl border transition-colors ${
                  l.href === current
                    ? "bg-brand-dark text-white border-brand-dark"
                    : "border-brand-border text-brand-dark hover:bg-brand-cream"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </aside>

        <article className="lg:col-span-9 bg-white rounded-3xl border border-brand-border p-6 sm:p-10 shadow-card space-y-10">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-28 space-y-3">
              <h2 className="font-semibold tracking-[-0.025em] text-lg text-brand-dark">
                <span className="text-brand-muted mr-2">{String(i + 1).padStart(2, "0")}</span>
                {s.heading}
              </h2>
              <div className="text-sm text-brand-muted leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_strong]:text-brand-dark">
                {s.body}
              </div>
            </section>
          ))}

          <div className="rounded-2xl bg-brand-cream border border-brand-border p-5 text-sm text-brand-muted">
            Questions about this policy? Email{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-brand-green hover:underline">
              {SUPPORT_EMAIL}
            </a>{" "}
            or call{" "}
            <a href={SUPPORT_PHONE_HREF} className="font-semibold text-brand-green hover:underline">
              {SUPPORT_PHONE}
            </a>{" "}
            (Mon–Sat, 9 AM–7 PM IST).
          </div>
        </article>
      </div>
    </div>
  );
}
