"use client";

import { useEffect } from "react";

/**
 * Tags every <img> on the page with data-img-state="loading" | "done" so the
 * global CSS can show a skeleton sheen behind photos until they arrive. Works for
 * next/image and plain <img> alike, without wrapping each one. Opt an image out
 * with data-no-skeleton.
 */
export default function ImageLoadState() {
  useEffect(() => {
    const mark = (img: HTMLImageElement) => {
      if (img.hasAttribute("data-no-skeleton")) return;
      // An <img> still waiting for its src (data not loaded yet) is a placeholder too.
      // `complete` is also true for a failed image; stop the sheen either way.
      const pending = !img.getAttribute("src") && !img.getAttribute("srcset");
      const state = pending || !img.complete ? "loading" : "done";
      if (img.getAttribute("data-img-state") !== state) img.setAttribute("data-img-state", state);
    };

    // Tagging is deferred to an idle moment: streamed Suspense content can be in the
    // DOM before React hydrates it, and an attribute added that early is reported as a
    // hydration mismatch.
    const queue = new Set<HTMLImageElement>();
    let scheduled = false;
    const idle = window.requestIdleCallback ?? ((cb: () => void, _options?: IdleRequestOptions) => window.setTimeout(cb, 1));
    const flush = () => {
      scheduled = false;
      queue.forEach(mark);
      queue.clear();
    };
    const enqueue = (img: HTMLImageElement) => {
      queue.add(img);
      if (!scheduled) {
        scheduled = true;
        idle(flush, { timeout: 300 });
      }
    };

    const scan = (root: ParentNode) => {
      if (root instanceof HTMLImageElement) enqueue(root);
      root.querySelectorAll?.("img").forEach(enqueue);
    };

    // load/error don't bubble, but they can be caught in the capture phase.
    const settle = (event: Event) => {
      if (event.target instanceof HTMLImageElement && event.target.hasAttribute("data-img-state")) {
        event.target.setAttribute("data-img-state", "done");
      }
    };
    document.addEventListener("load", settle, true);
    document.addEventListener("error", settle, true);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes") {
          enqueue(mutation.target as HTMLImageElement);
        } else {
          mutation.addedNodes.forEach((node) => node instanceof Element && scan(node));
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["src", "srcset"] });
    scan(document);

    return () => {
      observer.disconnect();
      document.removeEventListener("load", settle, true);
      document.removeEventListener("error", settle, true);
    };
  }, []);

  return null;
}
