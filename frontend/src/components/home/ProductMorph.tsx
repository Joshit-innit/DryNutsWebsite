"use client";

import React from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { getProductImage } from "@/lib/product-images";
import { lowestPrice, shortName, sized } from "@/lib/landing";
import { formatPrice } from "@/lib/utils";
import { Product } from "@/types";

/**
 * "The Harvest Reel": a pinned, scroll-driven showcase. Products take the stage one
 * after another and morph into each other: the photo's organic frame reshapes, the
 * photos dissolve through blur and scale, the name re-forms letter by letter and
 * the backdrop shifts to the next harvest's tint.
 */

const ease = [0.16, 1, 0.3, 1] as const;

// Organic frames the photo morphs between (border-radius blobs).
const BLOBS = [
  "62% 38% 46% 54% / 54% 44% 56% 46%",
  "40% 60% 58% 42% / 46% 58% 42% 54%",
  "54% 46% 36% 64% / 62% 40% 60% 38%",
  "46% 54% 62% 38% / 40% 56% 44% 60%",
  "58% 42% 50% 50% / 48% 62% 38% 52%",
  "38% 62% 44% 56% / 58% 46% 54% 42%",
];

// Backdrop tint per harvest; all keep body text above 4.5:1 against brand-dark ink.
const TINTS: Record<string, string> = {
  cashews: "#F4EAD8",
  pistachios: "#E6EDDC",
  almonds: "#F1E5D6",
  walnuts: "#EAE2D6",
  raisins: "#EEE2E8",
  dates: "#F0E3D5",
  apricots: "#F8E7CF",
  figs: "#ECE0E6",
  prunes: "#E6E1EB",
  combos: "#EFE8DC",
  "gift-boxes": "#F2E6D6",
};

const tintFor = (product: Product) => TINTS[product.category] ?? "#F3EEE6";

/** The product name, re-formed letter by letter on every change. */
function MorphingName({ text, reduced }: { text: string; reduced: boolean }) {
  const words = text.split(" ");
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.h3
        key={text}
        className="font-accent !not-italic text-[clamp(2.4rem,5vw,4.75rem)] !font-medium leading-[1] tracking-[-0.025em] text-brand-dark"
        aria-label={text}
      >
        {words.map((word, w) => (
          <span key={`${word}-${w}`} className="mr-[0.22em] inline-block whitespace-nowrap last:mr-0" aria-hidden>
            {word.split("").map((char, c) => {
              const order = words.slice(0, w).join("").length + c;
              return (
                <motion.span
                  key={c}
                  className="inline-block"
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: "0.45em", filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, y: "-0.35em", filter: "blur(8px)" }}
                  transition={{ duration: reduced ? 0.2 : 0.55, delay: reduced ? 0 : order * 0.018, ease }}
                >
                  {char}
                </motion.span>
              );
            })}
          </span>
        ))}
      </motion.h3>
    </AnimatePresence>
  );
}

export default function ProductMorph({ products }: { products: Product[] }) {
  const items = products.slice(0, 6);
  const count = items.length;
  const sectionRef = React.useRef<HTMLElement>(null);
  const reduced = useReducedMotion() ?? false;
  const [active, setActive] = React.useState(0);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const rotate = useTransform(progress, [0, 1], reduced ? [0, 0] : [-8, 8]);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const next = Math.min(count - 1, Math.max(0, Math.floor(value * count)));
    setActive((current) => (current === next ? current : next));
  });

  /** Scrolls so that product `index` holds the stage. */
  const goTo = (index: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    const travel = section.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + (travel * (index + 0.5)) / count, behavior: reduced ? "auto" : "smooth" });
  };

  if (count === 0) return null;
  const product = items[active];

  return (
    <motion.section
      ref={sectionRef}
      aria-label="Featured harvests"
      className="relative"
      style={{ height: `${count * 90 + 10}svh` }}
      animate={{ backgroundColor: tintFor(product) }}
      transition={{ duration: reduced ? 0 : 0.9, ease }}
    >
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden">
        {/* Spacer under the navbar; position announced to screen readers only */}
        <div className="pt-24 sm:pt-28">
          <p className="sr-only" aria-live="polite">
            Showing product {active + 1} of {count}
          </p>
        </div>

        {/* Stage */}
        <div className="mx-auto grid w-full max-w-[1440px] flex-1 grid-rows-[minmax(0,1fr)_auto] items-center gap-6 px-4 pb-8 sm:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)_minmax(0,2fr)] lg:grid-rows-1 lg:gap-10 lg:px-12 lg:pb-12">
          {/* Morphing photo (first on phones, centre on desktop) */}
          <div className="relative mx-auto aspect-square h-full max-h-[min(62svh,560px)] min-h-0 w-auto max-w-full lg:order-2 lg:max-h-[min(70svh,640px)]">
            {/* Ghost index behind the photo */}
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={active}
                aria-hidden
                className="pointer-events-none absolute -left-[6%] -top-[10%] select-none font-accent text-[clamp(7rem,16vw,15rem)] italic leading-none text-brand-dark/[0.07]"
                initial={{ opacity: 0, y: reduced ? 0 : 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduced ? 0 : -40 }}
                transition={{ duration: 0.7, ease }}
              >
                {String(active + 1).padStart(2, "0")}
              </motion.span>
            </AnimatePresence>

            <motion.div
              className="relative h-full w-full overflow-hidden bg-brand-beige shadow-[0_40px_80px_-40px_rgba(30,52,35,0.45)]"
              style={{ rotate }}
              animate={{ borderRadius: BLOBS[active % BLOBS.length] }}
              transition={{ duration: reduced ? 0 : 1.1, ease }}
            >
              {items.map((item, index) => {
                const on = index === active;
                return (
                  // eslint-disable-next-line @next/next/no-img-element
                  <motion.img
                    key={item.id}
                    src={sized(getProductImage(item), 1100)}
                    alt={on ? shortName(item.name) : ""}
                    aria-hidden={!on}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading={index < 2 ? "eager" : "lazy"}
                    initial={false}
                    animate={
                      reduced
                        ? { opacity: on ? 1 : 0 }
                        : {
                            opacity: on ? 1 : 0,
                            scale: on ? 1 : index < active ? 1.18 : 0.86,
                            filter: on ? "blur(0px) saturate(1)" : "blur(18px) saturate(1.3)",
                          }
                    }
                    transition={{ duration: reduced ? 0.25 : 1, ease }}
                  />
                );
              })}
            </motion.div>
          </div>

          {/* Copy */}
          <div className="min-w-0 lg:order-1">
            <MorphingName text={shortName(product.name)} reduced={reduced} />

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`meta-${product.id}`}
                initial={{ opacity: 0, y: reduced ? 0 : 14 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: reduced ? 0 : 0.15, ease } }}
                exit={{ opacity: 0, y: reduced ? 0 : -10, transition: { duration: 0.25, ease } }}
              >
                <p className="mt-5 max-w-[38ch] text-[17px] leading-[1.65] text-brand-dark/80 sm:text-[19px]">
                  {product.shortDescription}
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                  <span className="text-[17px] text-brand-dark">
                    From <span className="text-[1.75rem] font-semibold tracking-[-0.03em]">{formatPrice(lowestPrice(product))}</span>
                  </span>
                </div>
                <Link
                  href={`/products/${product.slug}`}
                  className="group mt-7 inline-flex h-12 cursor-pointer items-center gap-2 rounded-xl bg-brand-dark px-6 text-[15px] font-medium text-white transition-colors duration-200 hover:bg-brand-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark"
                >
                  View this harvest
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Index rail (desktop) */}
          <nav aria-label="Jump to a harvest" className="hidden lg:order-3 lg:block">
            <ol className="space-y-1">
              {items.map((item, index) => {
                const on = index === active;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => goTo(index)}
                      aria-current={on ? "true" : undefined}
                      className="relative flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[14px] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-dark"
                    >
                      {on && (
                        <motion.span
                          layoutId="morph-rail-pill"
                          className="absolute inset-0 rounded-lg bg-white/80 shadow-sm"
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        />
                      )}
                      <span className={`relative min-w-0 ${on ? "font-semibold text-brand-dark" : "text-brand-muted"}`}>
                        <span className="block truncate">{shortName(item.name)}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>

        {/* Progress bar + phone dots */}
        <div className="mx-auto flex w-full max-w-[1440px] items-center gap-4 px-4 pb-24 sm:px-6 lg:px-12 lg:pb-6">
          <div className="h-[2px] flex-1 overflow-hidden rounded-full bg-brand-dark/10">
            <motion.div className="h-full origin-left bg-brand-dark" style={{ scaleX: progress }} />
          </div>
          <div className="flex gap-1.5 lg:hidden">
            {items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Show ${shortName(item.name)}`}
                className="grid h-11 w-6 cursor-pointer place-items-center"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all duration-300 ${index === active ? "w-5 bg-brand-dark" : "w-1.5 bg-brand-dark/30"}`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
