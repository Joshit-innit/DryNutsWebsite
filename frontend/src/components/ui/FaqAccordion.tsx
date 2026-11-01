"use client";

/**
 * Adapted from the Watermelon UI "faq-1" block (ui.watermelon.sh/block/faq-1),
 * rebuilt on framer-motion and the brand palette instead of shadcn's Accordion.
 */
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
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
                    "grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors",
                    isOpen ? "bg-brand-dark text-white" : "bg-white text-brand-muted"
                  )}
                >
                  {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
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
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
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
