"use client";

import React from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { sized } from "@/lib/landing";

/** One panel in the hero: a product or an admin-managed landing photo. */
export interface CarouselSlide {
  id: string;
  image: string;
  title: string;
  caption?: string;
  href: string;
}

const ease = [0.16, 1, 0.3, 1] as const;
const CYCLE_MS = 4200;

/**
 * Hero: an expanding panel gallery. One photo opens wide while the others fold
 * into slim strips; it advances on its own, and pointing at (or focusing) a panel
 * opens it at once. Every panel links to its product. Images and names only.
 */
export default function HeroGallery({ slides }: { slides: CarouselSlide[] }) {
  const reduced = useReducedMotion() ?? false;
  const [active, setActive] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [isPhone, setIsPhone] = React.useState(false);
  const pointerType = React.useRef<string>("mouse");

  React.useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const update = () => setIsPhone(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const panels = slides.slice(0, isPhone ? 5 : 7);
  const count = panels.length;

  React.useEffect(() => {
    if (paused || reduced || count < 2) return;
    const id = window.setTimeout(() => setActive((i) => (i + 1) % count), CYCLE_MS);
    return () => window.clearTimeout(id);
  }, [active, paused, reduced, count]);

  React.useEffect(() => {
    if (active >= count && count > 0) setActive(0);
  }, [active, count]);

  return (
    <section aria-labelledby="hero-gallery-title" className="mx-auto w-full max-w-[1600px] px-2 pb-6 pt-3 sm:px-4 lg:px-6">
      <h1 id="hero-gallery-title" className="sr-only">
        NutriNation premium dry fruits
      </h1>

      <div
        className="flex h-[calc(100svh-13rem)] max-h-[880px] min-h-[460px] flex-col md:h-[calc(100svh-7.5rem)] md:min-h-[520px] gap-2 md:flex-row md:gap-3"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {count === 0
          ? // Placeholders while the photos load, so the page doesn't jump.
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex-1 animate-pulse rounded-[22px] bg-brand-beige" style={{ flexGrow: i === 0 ? 5 : 1 }} />
            ))
          : panels.map((slide, index) => {
              const on = index === active;
              return (
                <motion.div
                  key={slide.id}
                  className="relative min-h-0 min-w-0 overflow-hidden rounded-[22px] bg-brand-beige"
                  initial={reduced ? false : { opacity: 0, y: 60, clipPath: "inset(100% 0% 0% 0% round 22px)" }}
                  animate={{
                    flexGrow: on ? (isPhone ? 5 : 7) : 1,
                    opacity: 1,
                    y: 0,
                    clipPath: "inset(0% 0% 0% 0% round 22px)",
                  }}
                  style={{ flexBasis: 0 }}
                  transition={{
                    flexGrow: { duration: reduced ? 0 : 0.9, ease },
                    default: { duration: 1.1, delay: reduced ? 0 : 0.08 * index, ease },
                  }}
                >
                  <Link
                    href={slide.href}
                    aria-label={slide.title}
                    className="group absolute inset-0 block cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white/80"
                    onPointerDown={(e) => {
                      pointerType.current = e.pointerType;
                    }}
                    onMouseEnter={() => setActive(index)}
                    onFocus={() => setActive(index)}
                    onClick={(e) => {
                      // On touch, the first tap opens a folded panel; the next tap follows the link.
                      if (!on && pointerType.current !== "mouse") {
                        e.preventDefault();
                        setActive(index);
                      }
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <motion.img
                      src={sized(slide.image, 1400)}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                      loading={index < 3 ? "eager" : "lazy"}
                      initial={false}
                      animate={{
                        scale: reduced ? 1 : on ? 1.08 : 1.22,
                        filter: on ? "saturate(1.05) brightness(1)" : "saturate(0.75) brightness(0.8)",
                      }}
                      transition={{
                        scale: { duration: on ? CYCLE_MS / 1000 + 1 : 1, ease: on ? "linear" : ease },
                        filter: { duration: 0.8, ease },
                      }}
                    />

                    {/* Shade for legible names */}
                    <div
                      className={`absolute inset-0 transition-opacity duration-700 ${
                        on ? "bg-gradient-to-t from-black/65 via-black/10 to-transparent" : "bg-black/25"
                      }`}
                    />

                    {/* Name: large on the open panel, a side label on folded strips */}
                    <AnimatePresence initial={false} mode="popLayout">
                      {on ? (
                        <motion.span
                          key="open"
                          className="absolute inset-x-0 bottom-0 block p-5 sm:p-8"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, transition: { duration: 0.15 } }}
                        >
                          <span className="block max-w-[16ch] overflow-hidden text-[clamp(1.75rem,4.2vw,4rem)] font-bold leading-[0.95] tracking-[-0.045em] text-white">
                            {slide.title.split(" ").map((word, w) => (
                              <motion.span
                                key={`${word}-${w}`}
                                className="mr-[0.25em] inline-block"
                                initial={reduced ? { opacity: 0 } : { opacity: 0, y: "110%", rotate: 4 }}
                                animate={{ opacity: 1, y: 0, rotate: 0 }}
                                transition={{ duration: 0.7, delay: reduced ? 0 : 0.25 + w * 0.06, ease }}
                              >
                                {word}
                              </motion.span>
                            ))}
                          </span>
                          {/* Time until the next panel opens */}
                          {!paused && !reduced && (
                            <span className="mt-5 block h-[3px] w-28 overflow-hidden rounded-full bg-white/25" aria-hidden>
                              <motion.span
                                key={`bar-${active}`}
                                className="block h-full origin-left rounded-full bg-white"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ duration: CYCLE_MS / 1000, ease: "linear" }}
                              />
                            </span>
                          )}
                        </motion.span>
                      ) : (
                        <motion.span
                          key="folded"
                          className="absolute inset-0 flex items-center justify-start p-4 md:items-end md:justify-center md:p-0 md:pb-6"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1, transition: { duration: 0.5, delay: 0.35 } }}
                          exit={{ opacity: 0, transition: { duration: 0.1 } }}
                        >
                          <span className="truncate text-[15px] font-semibold tracking-[-0.01em] text-white [text-shadow:0_1px_12px_rgba(0,0,0,0.45)] md:max-h-[85%] md:rotate-180 md:[writing-mode:vertical-rl]">
                            {slide.title}
                          </span>
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </motion.div>
              );
            })}
      </div>
    </section>
  );
}
