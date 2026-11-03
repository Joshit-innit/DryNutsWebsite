"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { lowestPrice, shortName } from "@/lib/landing";
import { formatPrice } from "@/lib/utils";
import { Product } from "@/types";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * "Harvest of the Day": one product, told simply. The photo opens out from a
 * smaller frame and drifts with the scroll; the copy is set large for easy reading.
 */
export default function FeaturedHarvest({ product, photo }: { product: Product; photo?: string }) {
  const ref = React.useRef<HTMLElement>(null);
  const reduced = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["-7%", "7%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5], reduced ? [1, 1] : [1.18, 1.04]);

  const name = shortName(product.name);
  const href = `/products/${product.slug}`;

  return (
    <section ref={ref} aria-labelledby="featured-harvest-title" className="mx-auto max-w-[1440px] px-4 py-24 sm:px-6 sm:py-32 lg:px-12">
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
        {/* Photo */}
        <motion.div
          className="relative overflow-hidden rounded-[28px] bg-brand-beige"
          initial={reduced ? false : { clipPath: "inset(10% 10% 10% 10% round 28px)", opacity: 0.4 }}
          whileInView={{ clipPath: "inset(0% 0% 0% 0% round 28px)", opacity: 1 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 1.3, ease }}
        >
          <Link href={href} aria-label={name} className="group block cursor-pointer">
            <div className="aspect-[4/3] w-full overflow-hidden lg:aspect-[5/4]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <motion.img
                src={photo}
                alt={name}
                style={{ y, scale }}
                className="h-full w-full object-cover transition-[filter] duration-700 group-hover:brightness-105"
                loading="lazy"
              />
            </div>
          </Link>
        </motion.div>

        {/* Copy */}
        <div className="max-w-xl">
          <motion.p
            className="mb-5 text-[15px] font-medium uppercase tracking-[0.14em] text-brand-green"
            initial={{ opacity: 0, y: reduced ? 0 : 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease }}
          >
            Harvest of the Day
          </motion.p>

          <h2
            id="featured-harvest-title"
            className="font-accent !not-italic text-[clamp(2.5rem,4.6vw,4.5rem)] !font-medium leading-[1.02] tracking-[-0.025em] text-brand-dark"
          >
            {name.split(" ").map((word, i) => (
              <span key={`${word}-${i}`} className="mr-[0.24em] inline-block overflow-hidden pb-[0.08em] align-bottom last:mr-0">
                <motion.span
                  className="inline-block"
                  initial={{ y: reduced ? 0 : "105%", opacity: reduced ? 0 : 1 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: reduced ? 0 : 0.1 + i * 0.07, ease }}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </h2>

          <motion.div
            initial={{ opacity: 0, y: reduced ? 0 : 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: reduced ? 0 : 0.35, ease }}
          >
            <p className="mt-7 text-[18px] leading-[1.7] text-brand-dark/80 sm:text-[20px]">{product.shortDescription}</p>

            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
              <p className="text-[17px] text-brand-dark">
                From <span className="text-[2rem] font-semibold tracking-[-0.03em]">{formatPrice(lowestPrice(product))}</span>
              </p>
              <Link
                href={href}
                className="group inline-flex h-14 cursor-pointer items-center gap-2.5 rounded-2xl bg-brand-dark px-7 text-[16px] font-medium text-white transition-colors duration-200 hover:bg-brand-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark"
              >
                Shop now
                <ArrowUpRight className="h-[18px] w-[18px] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
