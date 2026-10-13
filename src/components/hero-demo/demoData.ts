// Hooks, timeline helpers and chapters for the home-page demo hero.
import { useCallback, useEffect, useRef, useState } from "react";

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** True once (or while, with `once = false`) the element is on screen. */
export function useInView<T extends Element>(once = true, rootMargin = "0px 0px -10% 0px") {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) setInView(false);
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once, rootMargin]);
  return [ref, inView] as const;
}

/**
 * A looping clock in milliseconds — the "video" timeline behind the scripted
 * demos. It only runs while `active` (on screen) and not paused.
 */
export function useLoopClock(total: number, active: boolean, tick = 50) {
  const reduced = prefersReducedMotion();
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(!reduced);
  useEffect(() => {
    if (!playing || !active) return;
    const id = window.setInterval(() => setT((v) => (v + tick) % total), tick);
    return () => clearInterval(id);
  }, [playing, active, total, tick]);
  const seek = useCallback((ms: number) => setT(((ms % total) + total) % total), [total]);
  return { t, playing, setPlaying, seek };
}

// Small timeline helpers
export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const ramp = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const typed = (text: string, t: number, start: number, perChar: number) =>
  text.slice(0, Math.max(0, Math.floor((t - start) / perChar)));
export const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

// The scripted app demo (AppDemo.tsx) and its chapters (used by the scrubber)
export const DEMO_TOTAL = 20000;

export const DEMO_STEPS = [
  { title: "Add an expense", text: "Tap +, type what it was and how much. Takes five seconds.", start: 0, end: 8000 },
  { title: "Split it fairly", text: "Pick who was there. SplitPe works out everyone's share.", start: 8000, end: 11500 },
  { title: "Everyone's in the loop", text: "Friends get notified and balances update instantly.", start: 11500, end: 15500 },
  { title: "Settle up", text: "Paid by UPI or cash? Mark it settled.", start: 15500, end: DEMO_TOTAL },
] as const;

