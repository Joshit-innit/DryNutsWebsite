"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Product } from "@/types";
import { getProductImage } from "@/lib/product-images";
import { formatPrice } from "@/lib/utils";
import styles from "./HarvestHero.module.css";

/**
 * A curved, endlessly drifting product reel — cards read like the inside of a cylinder.
 * Geometry is in "units": the carousel derives its unit size from its own width
 * (1440 units on desktop, 640 on phones), so it scales with its container.
 */

export type CarouselMode = "desktop" | "mobile";

const CARD_COUNT = 10;
const PITCH = 196; // even spacing between card centres before the outward push
const SPEED = 50; // units per second, right → left
const MOMENTUM_KEEP_PER_SECOND = 0.05; // velocity decays ~95% each second
const CORNER = 15;

const MODES: Record<CarouselMode, { width: number; radius: number; textScale: number }> = {
  desktop: { width: 1440, radius: 706, textScale: 1 },
  mobile: { width: 640, radius: 314, textScale: 1.35 },
};

type CardRefs = {
  root: HTMLAnchorElement | null;
  media: HTMLImageElement | null;
  shade: HTMLDivElement | null;
  info: HTMLDivElement | null;
  icon: HTMLSpanElement | null;
};

function shortName(name: string) {
  return name.replace(/\s*\(.*?\)\s*/g, " ").replace(/\s+/g, " ").trim();
}

function cardImage(product: Product) {
  return getProductImage(product).replace(/([?&])w=\d+/, "$1w=720");
}

/** Rounded polygon through the given corners, as an SVG path for clip-path. */
function roundedQuad(points: [number, number][], r: number) {
  const n = points.length;
  const cut = (from: [number, number], to: [number, number]): [number, number] => {
    const dx = to[0] - from[0];
    const dy = to[1] - from[1];
    const len = Math.hypot(dx, dy) || 1;
    const k = Math.min(r, len / 2) / len;
    return [from[0] + dx * k, from[1] + dy * k];
  };
  let d = "";
  for (let i = 0; i <= n; i++) {
    const p = points[i % n];
    const prev = points[(i - 1 + n) % n];
    const next = points[(i + 1) % n];
    const a = cut(p, prev);
    const b = cut(p, next);
    d += i === 0 ? `M${b[0].toFixed(2)} ${b[1].toFixed(2)}` : `L${a[0].toFixed(2)} ${a[1].toFixed(2)}Q${p[0].toFixed(2)} ${p[1].toFixed(2)} ${b[0].toFixed(2)} ${b[1].toFixed(2)}`;
  }
  return `path('${d}Z')`;
}

export default function HarvestCarousel({
  products,
  mode,
  className,
}: {
  products: Product[];
  mode: CarouselMode;
  className?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<CardRefs[]>(
    Array.from({ length: CARD_COUNT }, () => ({ root: null, media: null, shade: null, info: null, icon: null }))
  );

  // Fill all ten slots even when the catalogue is smaller.
  const slots = Array.from({ length: CARD_COUNT }, (_, i) => products[i % Math.max(products.length, 1)]).filter(Boolean);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !slots.length) return;

    const { width: FRAME_W, radius: R, textScale } = MODES[mode];
    const total = CARD_COUNT * PITCH;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Images that finished loading before hydration never fire onLoad; reveal them now.
    cardRefs.current.forEach(({ media }) => {
      if (media?.complete && media.naturalWidth > 0) media.setAttribute("data-ready", "true");
    });

    // Long-running Web Animations clock so the drift is time-based, not frame-based.
    const clock = document.documentElement.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1e9 });
    let lastTime = Number(clock.currentTime ?? 0) / 1000;

    let scroll = 0;
    let momentum = 0;
    let dragging = false;
    let dragMoved = 0;
    let lastX = 0;
    let lastMoveTime = 0;
    let dragVelocity = 0;
    let frame = 0;

    // Desktop runs full-bleed: it takes its unit from the hero frame (--u) rather than its own width.
    const unit = () => {
      const frameUnit = mode === "desktop" ? parseFloat(getComputedStyle(track).getPropertyValue("--u")) : NaN;
      return Number.isFinite(frameUnit) && frameUnit > 0 ? frameUnit : track.clientWidth / FRAME_W;
    };

    const render = (seconds: number) => {
      if (!track.clientWidth) return; // hidden (the other layout is active)
      const u = unit();
      const W = track.clientWidth / u;
      const C = W / 2;
      const bandUnits = track.clientHeight / u;
      const cyBase = bandUnits / 2;

      cardRefs.current.forEach((refs, i) => {
        const root = refs.root;
        if (!root) return;

        const t = ((i * PITCH - scroll + total / 2) % total + total) % total - total / 2;
        const x = C + t * (1 + 0.083 * (t / R) ** 2);
        // Past the frame edge the cylinder stops growing, so wide screens don't get giant cards.
        const d = Math.min(Math.abs(x - C) / R, 1.12);
        const w = 170 + 48 * d * d;
        const xL = x - w / 2;
        const xR = x + w / 2;

        if (xR < -40 || xL > W + 40) {
          // off-screen
          root.style.visibility = "hidden";
          return;
        }
        root.style.visibility = "visible";

        const qL = Math.min(Math.abs(xL - C) / R, 1.12);
        const qR = Math.min(Math.abs(xR - C) / R, 1.12);
        const hL = 280 + 92 * qL ** 2.6;
        const hR = 280 + 92 * qR ** 2.6;
        const cy = cyBase - 12 * d * d;

        const px = (v: number) => v * u;
        const quad: [number, number][] = [
          [px(xL), px(cy - hL / 2)],
          [px(xR), px(cy - hR / 2)],
          [px(xR), px(cy + hR / 2)],
          [px(xL), px(cy + hL / 2)],
        ];
        root.style.clipPath = roundedQuad(quad, px(CORNER));

        const top = Math.min(cy - hL / 2, cy - hR / 2);
        const height = Math.max(hL, hR);
        const box = `left:${px(xL)}px;top:${px(top)}px;width:${px(w)}px;height:${px(height)}px;`;

        if (refs.media) {
          // Each card breathes on its own phase, like a slow product clip.
          const drift = reduceMotion ? 0 : Math.sin(seconds * 0.35 + i * 1.7);
          // Zoom always exceeds twice the drift, so the photo never uncovers the card edge.
          const zoom = reduceMotion ? 1.04 : 1.1 + 0.04 * Math.sin(seconds * 0.22 + i);
          refs.media.style.cssText = `${box}transform:translate3d(${(drift * 1.6).toFixed(2)}%,${(drift * -1.2).toFixed(2)}%,0) scale(${zoom.toFixed(4)});`;
        }
        if (refs.shade) refs.shade.style.cssText = box;

        const bottomLeft = cy + hL / 2;
        const icon = 34 * Math.min(textScale, 1.25);
        if (refs.icon) {
          refs.icon.style.cssText = `left:${px(xL + 12)}px;top:${px(bottomLeft - 12 - icon)}px;width:${px(icon)}px;height:${px(icon)}px;`;
        }
        if (refs.info) {
          refs.info.style.cssText = `left:${px(xL + 14)}px;bottom:${px(bandUnits - (bottomLeft - 20 - icon))}px;width:${px(w - 28)}px;font-size:${px(14.5 * textScale)}px;`;
        }
      });
    };

    const tick = () => {
      const now = Number(clock.currentTime ?? 0) / 1000;
      const dt = Math.min(Math.max(now - lastTime, 0), 0.1);
      lastTime = now;

      if (!dragging) {
        scroll += ((reduceMotion ? 0 : SPEED) + momentum) * dt;
        momentum *= MOMENTUM_KEEP_PER_SECOND ** dt;
        if (Math.abs(momentum) < 0.5) momentum = 0;
      }
      render(now);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    // ---- Drag / fling ------------------------------------------------------
    const unitsPerPx = () => 1 / unit();

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      dragging = true;
      dragMoved = 0;
      momentum = 0;
      dragVelocity = 0;
      lastX = e.clientX;
      lastMoveTime = performance.now();
      track.setPointerCapture(e.pointerId);
      track.dataset.dragging = "true";
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const nowMs = performance.now();
      const delta = -dx * unitsPerPx();
      scroll += delta;
      dragMoved += Math.abs(dx);
      const elapsed = Math.max(nowMs - lastMoveTime, 1) / 1000;
      dragVelocity = dragVelocity * 0.6 + (delta / elapsed) * 0.4;
      lastX = e.clientX;
      lastMoveTime = nowMs;
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      delete track.dataset.dragging;
      if (track.hasPointerCapture(e.pointerId)) track.releasePointerCapture(e.pointerId);
      // A stale pointer (held still before release) should not fling.
      momentum = performance.now() - lastMoveTime > 120 ? 0 : Math.max(-4000, Math.min(4000, dragVelocity));
    };
    // A drag must not also open the product.
    const onClickCapture = (e: MouseEvent) => {
      if (dragMoved > 6) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    track.addEventListener("pointerdown", onDown);
    track.addEventListener("pointermove", onMove);
    track.addEventListener("pointerup", onUp);
    track.addEventListener("pointercancel", onUp);
    track.addEventListener("click", onClickCapture, true);

    return () => {
      cancelAnimationFrame(frame);
      clock.cancel();
      track.removeEventListener("pointerdown", onDown);
      track.removeEventListener("pointermove", onMove);
      track.removeEventListener("pointerup", onUp);
      track.removeEventListener("pointercancel", onUp);
      track.removeEventListener("click", onClickCapture, true);
    };
    // slots is derived from products; re-run only when the catalogue or mode changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, mode]);

  return (
    <div
      ref={trackRef}
      className={`${styles.track} ${className ?? ""}`}
      role="region"
      aria-roledescription="carousel"
      aria-label="Bestselling dry fruits"
    >
      {slots.map((product, i) => {
        const isDuplicate = i >= products.length;
        const price = Math.min(...product.variants.map((v) => v.price));
        return (
          <Link
            key={`${product.id}-${i}`}
            href={`/products/${product.slug}`}
            ref={(el) => {
              cardRefs.current[i].root = el;
            }}
            className={styles.card}
            draggable={false}
            aria-label={`${product.name}, from ${formatPrice(price)}`}
            aria-hidden={isDuplicate || undefined}
            tabIndex={isDuplicate ? -1 : undefined}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={(el) => {
                cardRefs.current[i].media = el;
              }}
              src={cardImage(product)}
              alt=""
              className={styles.cardMedia}
              draggable={false}
              loading={i < 6 ? "eager" : "lazy"}
              decoding="async"
              onLoad={(e) => e.currentTarget.setAttribute("data-ready", "true")}
            />
            <div
              ref={(el) => {
                cardRefs.current[i].shade = el;
              }}
              className={styles.cardShade}
            />
            <div
              ref={(el) => {
                cardRefs.current[i].info = el;
              }}
              className={styles.cardInfo}
            >
              <span className={styles.cardName}>{shortName(product.name)}</span>
              <span className={styles.cardPrice}>from {formatPrice(price)}</span>
            </div>
            <span
              ref={(el) => {
                cardRefs.current[i].icon = el;
              }}
              className={styles.cardIcon}
              aria-hidden
            >
              <ArrowUpRight />
            </span>
          </Link>
        );
      })}
    </div>
  );
}
