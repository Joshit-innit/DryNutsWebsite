"use client";

import React from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Pause, Play } from "lucide-react";
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
 *
 * Autoplay holds while the pointer or keyboard focus is inside, while the hero is
 * scrolled away or the tab is hidden, and whenever the visitor presses pause.
 */
export default function HeroGallery({ slides }: { slides: CarouselSlide[] }) {
  const reduced = useReducedMotion() ?? false;
  const [active, setActive] = React.useState(0);
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [offstage, setOffstage] = React.useState(false);
  const [stopped, setStopped] = React.useState(false);
  const sectionRef = React.useRef<HTMLElement>(null);
  const [isPhone, setIsPhone] = React.useState(false);
  const pointerType = React.useRef<string>("mouse");

  React.useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const update = () => setIsPhone(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  React.useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let inView = true;
    const sync = () => setOffstage(!inView || document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    observer.observe(section);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  const paused = hovered || focused || offstage || stopped;

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
    <section ref={sectionRef} aria-labelledby="hero-gallery-title" className="mx-auto w-full max-w-[1600px] px-2 pb-6 pt-3 sm:px-4 lg:px-6">
      <h1 id="hero-gallery-title" className="sr-only">
        NutriNation premium dry fruits
      </h1>

      <div
        className="flex h-[calc(100svh-13rem)] max-h-[880px] min-h-[460px] flex-col md:h-[calc(100svh-7.5rem)] md:min-h-[520px] gap-2 md:flex-row md:gap-3"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={(e) => {
          // Only keyboard focus holds the cycle; a click also focuses the link.
          if ((e.target as HTMLElement).matches(":focus-visible")) setFocused(true);
        }}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
        }}
      >
        {count === 0
          ? // Placeholders while the photos load, so the page doesn't jump.
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton flex-1 !rounded-[22px]" style={{ flexGrow: i === 0 ? 5 : 1 }} />
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
                        scale: reduced ? 1 : on ? (paused ? 1.14 : 1.08) : 1.22,
                        filter: on ? "saturate(1.05) brightness(1)" : "saturate(0.75) brightness(0.8)",
                      }}
                      transition={{
                        // Open: a slow push-in across the cycle; held, it settles midway and waits.
                        scale: { duration: on && !paused ? CYCLE_MS / 1000 + 1 : 1, ease: on && !paused ? "linear" : ease },
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
                          {!reduced && count > 1 && (
                            <span className="mt-5 block h-[3px] w-28 overflow-hidden rounded-full bg-white/25" aria-hidden>
                              <motion.span
                                // Restarts with each panel, and from empty when play resumes.
                                key={`bar-${active}-${paused ? "held" : "run"}`}
                                className="block h-full origin-left rounded-full bg-white"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: paused ? 0 : 1 }}
                                transition={{ duration: paused ? 0 : CYCLE_MS / 1000, ease: "linear" }}
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

                  {on && !reduced && count > 1 && (
                    <motion.button
                      type="button"
                      onClick={() => setStopped((s) => !s)}
                      aria-label={stopped ? "Play the gallery" : "Pause the gallery"}
                      aria-pressed={stopped}
                      className="absolute right-4 top-4 grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-black/30 text-white backdrop-blur-md transition-colors duration-200 hover:bg-black/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-6 sm:top-6"
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.5, ease }}
                      whileTap={{ scale: 0.92 }}
                    >
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                          key={stopped ? "play" : "pause"}
                          className="grid place-items-center"
                          initial={{ opacity: 0, scale: 0.6 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.1 } }}
                          transition={{ duration: 0.18, ease }}
                        >
                          {stopped ? <Play className="ml-0.5 h-4 w-4 fill-current" /> : <Pause className="h-4 w-4 fill-current" />}
                        </motion.span>
                      </AnimatePresence>
                    </motion.button>
                  )}
                </motion.div>
              );
            })}
      </div>
    </section>
  );
}
