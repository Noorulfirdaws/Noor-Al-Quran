"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Instantly jump to the top (no animation). Global smooth-scroll is disabled,
 * so this never produces the "bouncing" we had before. */
function scrollTopInstant() {
  window.scrollTo(0, 0);
}

/** Remove the #hash from the address bar WITHOUT adding a history entry. */
function stripHash() {
  if (!window.location.hash) return;
  history.replaceState(history.state, "", window.location.pathname + window.location.search);
}

/**
 * Scroll behaviour controller.
 *
 * Goal: every page — especially the home page — opens at the TOP. Returning to
 * the home page must show the hero, never a mid-page section like "Features".
 *
 *   1. Browser scroll restoration is disabled (manual) so it never silently
 *      restores a previous mid-page position on back/forward or reload.
 *   2. In-page anchor click (`/#features`) → smooth-scroll to the section, then
 *      strip the hash so it can never linger and re-trigger later.
 *   3. A real deep-link opened WITH a hash → honour it once, then strip it.
 *   4. Any other route entry → land at the top (instant).
 */
export default function ScrollToTop() {
  const pathname = usePathname();

  // The browser must not restore scroll on its own — we always control it.
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  }, []);

  // 1. Intercept in-page anchor clicks (`#id` or `/#id` to the current page).
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const anchor = (e.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;

      const hashIdx = href.indexOf("#");
      if (hashIdx === -1) return;            // not a hash link
      const id = href.slice(hashIdx + 1);
      if (!id) return;

      const path = href.slice(0, hashIdx);   // "" or "/" or "/blog" …
      const isCurrentPage = path === "" || path === "/" ? pathname === "/" : path === pathname;
      if (!isCurrentPage) return;            // cross-page link — let it navigate normally

      const el = document.getElementById(id);
      if (!el) return;                       // target not on this page — let it navigate

      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      stripHash();                           // never let the hash linger
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [pathname]);

  // 2 + 3 + 4. On every route entry decide where to land — default is the top.
  useEffect(() => {
    const hash = window.location.hash;

    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        // Honour a forward deep-link (e.g. clicking "Features") once, then strip.
        const go = () => {
          const target = document.getElementById(hash.slice(1));
          if (target) target.scrollIntoView({ block: "start" });
          stripHash();
        };
        requestAnimationFrame(go);
        const t = setTimeout(go, 120);
        return () => clearTimeout(t);
      }
      stripHash(); // hash points at nothing here — clear it
    }

    // Always land at the top. Instant + repeated across two frames so it wins
    // even if the browser tries a late restore.
    scrollTopInstant();
    requestAnimationFrame(scrollTopInstant);
  }, [pathname]);

  // Reload / bfcache restore → also start at the top, hash stripped.
  useEffect(() => {
    const onPageShow = () => { stripHash(); scrollTopInstant(); };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  return null;
}
