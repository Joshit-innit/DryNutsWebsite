"use client";

/**
 * Adapted from the Watermelon UI "faq-1" block (ui.watermelon.sh/block/faq-1),
 * rebuilt on framer-motion and the brand palette instead of shadcn's Accordion.
 */
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface FaqAccordionItem {
  id: string;
  question: string;
  answer: string;
}

export default function FaqAccordion({
  items,
  className,
  defaultOpen = null,
}: {
  items: FaqAccordionItem[];
  className?: string;
  defaultOpen?: string | null;
}) {
  const [open, setOpen] = React.useState<string | null>(defaultOpen);

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      {items.map((item) => {
        const isOpen = open === item.id;
        const panelId = `faq-panel-${item.id}`;
        return (
          <div
            key={item.id}
            className={cn(
              "rounded-2xl border px-5 transition-colors sm:px-7",
              isOpen ? "border-brand-border-dark bg-white" : "border-transparent bg-brand-beige/60 hover:bg-brand-beige"
            )}
          >
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : item.id)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="flex w-full items-center gap-4 py-5 text-left sm:py-6"
              >
                <span className="flex-1 text-base font-medium tracking-[-0.02em] text-brand-dark sm:text-lg">
                  {item.question}
                </span>
                <span
                  className={cn(
                    "grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors duration-200",
                    isOpen ? "bg-brand-green-dark text-white" : "bg-white text-brand-muted"
                  )}
                >
                  {/* One plus sign whose upright folds away into a minus. */}
                  <svg viewBox="0 0 14 14" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden>
                    <path d="M2 7h10" />
                    <path
                      d="M7 2v10"
                      className="origin-center transition-transform duration-200 ease-luxury"
                      style={{ transform: isOpen ? "scaleY(0)" : "scaleY(1)", transformBox: "fill-box" }}
                    />
                  </svg>
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  key="panel"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } }}
                  transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-3xl pb-6 text-[15px] leading-relaxed text-brand-muted">{item.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
