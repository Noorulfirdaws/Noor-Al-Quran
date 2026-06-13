"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/** Instantly jump to the top, with smooth-scroll temporarily disabled. */
function scrollTopInstant() {
  const html = document.documentElement;
  const prev = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto";
  window.scrollTo(0, 0);
  requestAnimationFrame(() => { html.style.scrollBehavior = prev; });
}

/** Remove the #hash from the address bar WITHOUT adding a history entry. */
function stripHash() {
  if (!window.location.hash) return;
  history.replaceState(
    history.state,
    "",
    window.location.pathname + window.location.search
  );
}

/**
 * Scroll behaviour controller.
 *
 * The bug this solves: in-page anchor links like `/#features` leave `#features`
 * stuck in the URL. Later, when the user returns to the home page, the browser
 * jumps straight to that section (e.g. the phone-mockup "features" block)
 * instead of starting at the top.
 *
 * Strategy — a section hash must NEVER persist in the URL:
 *   1. In-page anchor click → smooth-scroll to the section, then strip the hash.
 *   2. A real deep-link (page opened/navigated with a hash) → honour it once,
 *      then strip the hash so a future return starts at the top.
 *   3. Any other route entry → land at the top.
 */
export default function ScrollToTop() {
  const pathname = usePathname();
  const isFirst = useRef(true);

  // Browser must not try to restore scroll on its own.
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

  // 2 + 3. On every route entry decide where to land.
  useEffect(() => {
    const hash = window.location.hash;

    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        // Honour the deep-link once (content may need a beat to render), then
        // strip the hash so returning here later starts at the top.
        const go = () => {
          const target = document.getElementById(hash.slice(1));
          if (target) target.scrollIntoView({ block: "start" });
          stripHash();
        };
        requestAnimationFrame(go);
        const t = setTimeout(go, 120);
        isFirst.current = false;
        return () => clearTimeout(t);
      }
      // Hash points at nothing here — clear it and fall through to top.
      stripHash();
    }

    isFirst.current = false;
    scrollTopInstant();
  }, [pathname]);

  // Back/forward from bfcache → start at top too.
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) { stripHash(); scrollTopInstant(); }
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  return null;
}
