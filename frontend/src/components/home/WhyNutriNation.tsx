"use client";

/**
 * Adapted from the Watermelon UI "feature-1" bento block (ui.watermelon.sh/block/feature-1),
 * re-themed to the NutriNation palette with lucide icons and the site's Reveal motion.
 */
import React from "react";
import { Gift, MapPin, PackageCheck, ScanSearch, Truck, type LucideIcon } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

function IconTile({ icon: Icon, tone }: { icon: LucideIcon; tone: string }) {
  return (
    <div className="mb-4 size-fit rounded-xl bg-brand-beige p-px">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-[inset_0px_2px_0_1px_rgba(255,255,255,1),0_0px_6px_0_rgba(0,0,0,0.06),0_2px_4px_0_rgba(0,0,0,0.04)]">
        <Icon className={cn("h-5 w-5", tone)} strokeWidth={1.75} />
      </div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex rounded-lg bg-brand-beige p-0.5">
      <span className="inline-flex items-center rounded-md bg-white px-2.5 py-1 text-[11px] font-medium text-brand-muted shadow-[0_0px_2px_0_rgba(0,0,0,0.06),0_1px_3px_0_rgba(0,0,0,0.04)]">
        {children}
      </span>
    </div>
  );
}

const cardClass =
  "h-full rounded-3xl border border-brand-border bg-white/70 p-6 transition-shadow duration-300 hover:shadow-hover sm:p-7";

const smallCards = [
  {
    icon: ScanSearch,
    tone: "text-brand-saffron",
    title: "Hand-graded, kernel by kernel",
    body: "Every batch is sorted for size, colour and oil content before it is packed. Broken pieces never make the cut.",
    chip: "W-180 · Mamra · Medjool",
  },
  {
    icon: MapPin,
    tone: "text-brand-green",
    title: "Traced to the grove",
    body: "Almonds and walnuts from Kashmir, cashews from Mangalore, dates from Jordan. Origin is printed on every pack.",
    chip: "Single-origin harvests",
  },
  {
    icon: Truck,
    tone: "text-brand-orange",
    title: "At your door in 2–3 days",
    body: "Dispatched across India by ground and air, with next-day express for major metro cities.",
    chip: "Express in metros",
  },
  {
    icon: Gift,
    tone: "text-brand-gold",
    title: "Gifting, done properly",
    body: "Wooden caskets, brass hampers and custom sleeves for festivals, weddings and corporate milestones.",
    chip: "Bespoke hampers",
  },
];

const freshness = [
  { label: "Packing", value: "Nitrogen-flushed" },
  { label: "Pouch", value: "Multilayer O₂ barrier" },
  { label: "Rancidity", value: "Zero tolerance" },
];

export default function WhyNutriNation() {
  const [first, second, ...rest] = smallCards;

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-24 sm:px-6 sm:py-32 lg:px-12">
      <div className="mb-12 text-center sm:mb-16">
        <p className="section-label mb-4">Why NutriNation</p>
        <h2 className="section-title mx-auto max-w-3xl">
          Pantry staples, held to a <span className="font-accent text-brand-green">jeweller&apos;s</span> standard.
        </h2>
      </div>

      <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[first, second].map((card) => (
          <StaggerItem key={card.title}>
            <div className={cardClass}>
              <IconTile icon={card.icon} tone={card.tone} />
              <h3 className="mb-1.5 text-lg font-semibold tracking-[-0.025em]">{card.title}</h3>
              <p className="mb-4 text-sm leading-relaxed text-brand-muted">{card.body}</p>
              <Chip>{card.chip}</Chip>
            </div>
          </StaggerItem>
        ))}

        <StaggerItem className="md:row-span-2">
          <div className={cn(cardClass, "flex flex-col justify-between bg-brand-dark text-white hover:shadow-hover")}>
            <div>
              <div className="mb-4 size-fit rounded-xl bg-white/10 p-px">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                  <PackageCheck className="h-5 w-5 text-brand-saffron-light" strokeWidth={1.75} />
                </div>
              </div>
              <h3 className="mb-2 text-2xl font-semibold tracking-[-0.035em] text-white">Sealed the day it&apos;s packed</h3>
              <p className="mb-8 text-sm leading-relaxed text-white/65">
                Clean-room packing locks the natural oils in and keeps moisture and oxidation out, so the last handful
                tastes like the first.
              </p>
              <div className="space-y-2.5">
                {freshness.map((row) => (
                  <div key={row.label} className="flex items-center justify-between rounded-xl bg-white/[0.06] px-4 py-3 text-[13px]">
                    <span className="text-white/60">{row.label}</span>
                    <span className="font-medium text-white">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-8">
              <span className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-1.5 text-[12px] text-white/75">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-green-light" />
                Freshness checked every batch
              </span>
            </div>
          </div>
        </StaggerItem>

        {rest.map((card) => (
          <StaggerItem key={card.title}>
            <div className={cardClass}>
              <IconTile icon={card.icon} tone={card.tone} />
              <h3 className="mb-1.5 text-lg font-semibold tracking-[-0.025em]">{card.title}</h3>
              <p className="mb-4 text-sm leading-relaxed text-brand-muted">{card.body}</p>
              <Chip>{card.chip}</Chip>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
