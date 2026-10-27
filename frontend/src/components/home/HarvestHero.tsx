"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Product } from "@/types";
import HarvestCarousel from "./HarvestCarousel";
import styles from "./HarvestHero.module.css";

const FRAME_WIDTH = 1440;
const FRAME_HEIGHT = 940;

function Badge() {
  return (
    <span className={styles.badge} data-enter="pop">
      <svg viewBox="0 0 16 16" aria-hidden className={styles.badgeMark}>
        <path d="M8 1.5c3.6 1.4 5.4 4.2 4.6 7.6-.7 3-3.2 4.9-4.6 5.4-1.4-.5-3.9-2.4-4.6-5.4C2.6 5.7 4.4 2.9 8 1.5Z" fill="currentColor" opacity=".22" />
        <path d="M8 3.5v9.5M8 7.2l2.2-1.6M8 9.6 5.8 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" />
      </svg>
      New-season harvest · graded by hand
    </span>
  );
}

function ShopButton() {
  return (
    <span className={styles.ctaRing} data-enter="scale">
      <Link href="/products" className={styles.cta}>
        Shop the harvest
        <ArrowRight aria-hidden />
      </Link>
    </span>
  );
}

export default function HarvestHero({ products }: { products: Product[] }) {
  const rootRef = useRef<HTMLElement>(null);

  // Contained 1440×940 frame: one unit = min(width / 1440, remaining height / 940).
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const fit = () => {
      const top = root.getBoundingClientRect().top + window.scrollY;
      const available = Math.max(window.innerHeight - top, 560);
      const u = Math.min(document.documentElement.clientWidth / FRAME_WIDTH, available / FRAME_HEIGHT);
      root.style.setProperty("--u", `${u}px`);
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  // One-time entrance sequence.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.dataset.ready = "true";
      return;
    }

    const ease = "cubic-bezier(0.16, 1, 0.3, 1)";
    const animations: Animation[] = [];
    const run = (selector: string, keyframes: Keyframe[], delay: number, duration = 900, stagger = 0) => {
      root.querySelectorAll<HTMLElement>(selector).forEach((el, i) => {
        if (el.offsetParent === null && el.tagName !== "path") return;
        animations.push(el.animate(keyframes, { duration, delay: delay + i * stagger, easing: ease, fill: "both" }));
      });
    };

    run('[data-enter="pop"]', [{ opacity: 0, transform: "translateY(8px) scale(0.86)" }, { opacity: 1, transform: "none" }], 80, 700);
    run(
      '[data-enter="line"]',
      [{ opacity: 0, transform: "translateY(0.45em)", filter: "blur(12px)" }, { opacity: 1, transform: "none", filter: "blur(0)" }],
      220,
      1100,
      140
    );
    run('[data-enter="fade-up"]', [{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }], 560, 900);
    run('[data-enter="rise"]', [{ opacity: 0, transform: "translateY(70px)" }, { opacity: 1, transform: "none" }], 640, 1400);
    run('[data-enter="scale"]', [{ opacity: 0, transform: "scale(0.82)" }, { opacity: 1, transform: "none" }], 900, 800);
    run('[data-enter="draw"]', [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], 1200, 1000, 160);
    run('[data-enter="note"]', [{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], 1250, 900, 180);

    root.dataset.ready = "true";
    return () => animations.forEach((a) => a.cancel());
  }, []);

  const headline = (
    <>
      <span className={styles.line} data-enter="line">
        Hand-graded harvests,
      </span>
      <span className={`${styles.line} ${styles.line2}`} data-enter="line">
        <em>sealed fresh</em> for you.
      </span>
    </>
  );

  return (
    <section ref={rootRef} className={styles.hero} aria-labelledby="harvest-hero-title">
      {/* ------------------------------ Desktop frame ------------------------------ */}
      <div className={styles.frame}>
        <div className={styles.badgeWrap}>
          <Badge />
        </div>

        <h1 id="harvest-hero-title" className={styles.headline}>
          {headline}
        </h1>

        <p className={styles.subline} data-enter="fade-up">
          Mamra almonds from Kashmir, W-180 cashews from Mangalore and
          <br />
          plump Medjool dates — sorted by hand, nitrogen-sealed in small
          <br />
          batches, and delivered free on orders over ₹999.
        </p>

        <div className={styles.ctaWrap}>
          <ShopButton />
        </div>

        {/* Hand-drawn notes */}
        <svg className={styles.doodles} viewBox={`0 0 ${FRAME_WIDTH} ${FRAME_HEIGHT}`} aria-hidden>
          {/* "//" flourish */}
          <path data-enter="draw" pathLength={1} d="M268 330 L284 296" />
          <path data-enter="draw" pathLength={1} d="M286 334 L302 300" />
          {/* From the "fresh" note down to the reel — starts below the words */}
          <path data-enter="draw" pathLength={1} d="M1268 318 C1302 350 1300 398 1262 424 C1240 439 1214 444 1192 442" />
          <path data-enter="draw" pathLength={1} d="M1204 428 L1190 442 L1207 454" />
          {/* From the delivery note to the button */}
          <path data-enter="draw" pathLength={1} d="M536 878 C556 892 582 892 604 878" />
          <path data-enter="draw" pathLength={1} d="M592 872 L606 877 L599 890" />
        </svg>
        <p className={`${styles.note} ${styles.noteFresh}`} data-enter="note">
          Fresh from
          <br />
          this week&apos;s batch
        </p>
        <p className={`${styles.note} ${styles.noteDelivery}`} data-enter="note">
          Free delivery
          <br />
          over ₹999
        </p>
      </div>

      <HarvestCarousel products={products} mode="desktop" className={`${styles.reel} ${styles.reelDesktop}`} />

      {/* ------------------------------ Phone layout ------------------------------ */}
      <div className={styles.mobile}>
        <Badge />
        <h1 className={styles.mobileHeadline}>{headline}</h1>
        <p className={styles.mobileSubline} data-enter="fade-up">
          Mamra almonds, W-180 cashews and Medjool dates — sorted by hand and nitrogen-sealed in small batches.
        </p>
        <HarvestCarousel products={products} mode="mobile" className={`${styles.reel} ${styles.reelMobile}`} />
        <div className={styles.mobileCta}>
          <ShopButton />
          <p className={`${styles.note} ${styles.mobileNote}`} data-enter="note">
            Free delivery over ₹999
          </p>
        </div>
      </div>
    </section>
  );
}
