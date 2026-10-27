"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUp } from "lucide-react";

const DOCK_LINKS = [
  { label: "Cashews", href: "/category/cashews" },
  { label: "Almonds", href: "/category/almonds" },
  { label: "Pistachios", href: "/category/pistachios" },
  { label: "Dates", href: "/category/dates" },
  { label: "Combos", href: "/category/combos" },
];

/** Gallery-style floating dock and back-to-top control (desktop only; phones keep MobileNav). */
export default function FloatingDock() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 520);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname.startsWith("/checkout")) return null;

  return (
    <>
      <nav
        aria-label="Quick harvest links"
        className={`fixed bottom-6 left-1/2 z-40 hidden -translate-x-1/2 items-stretch gap-1 rounded-2xl border border-white/10 bg-[#2A2926]/95 p-1.5 shadow-hover backdrop-blur-md transition-all duration-500 lg:flex ${
          visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
        }`}
      >
        <Link
          href="/"
          className="grid w-12 place-items-center rounded-xl bg-brand-dark text-lg font-bold tracking-[-0.06em] text-white"
          aria-label="NutriNation home"
        >
          <span>
            N<span className="text-brand-green-light">.</span>
          </span>
        </Link>
        <div className="flex gap-1 rounded-xl bg-white/[0.04] p-1">
          {DOCK_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg border px-3.5 py-2 text-[13px] transition-colors ${
                  active
                    ? "border-white/60 text-white"
                    : "border-white/10 text-white/70 hover:border-white/30 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
        <Link
          href="/products"
          className="grid place-items-center rounded-xl bg-[#F1EEE8] px-4 text-[13px] font-semibold text-brand-dark transition-colors hover:bg-white"
        >
          Shop all
        </Link>
      </nav>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        className={`fixed bottom-6 left-6 z-40 hidden h-14 w-14 place-items-center rounded-xl bg-brand-dark text-white shadow-hover transition-all duration-500 hover:bg-black lg:grid ${
          visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
        }`}
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </>
  );
}
