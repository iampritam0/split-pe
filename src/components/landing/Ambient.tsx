import { useEffect, useRef } from "react";

// Fixed backdrop, the cursor glow and the bubbles that rise behind everything.
export default function Ambient() {
  const bubbles = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = bubbles.current;
    if (!host || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timers = new Set<number>();
    const create = () => {
      if (document.hidden) return;
      const bubble = document.createElement("span");
      bubble.className = "bubble-img";
      bubble.style.width = Math.random() * 20 + 10 + "px";
      bubble.style.left = Math.random() * 100 + "%";
      bubble.style.bottom = "-50px";
      const duration = Math.random() * 6 + 4;
      bubble.style.animation = `floatUpImg ${duration}s linear forwards`;
      host.appendChild(bubble);
      const t = window.setTimeout(() => {
        bubble.remove();
        timers.delete(t);
      }, duration * 1000);
      timers.add(t);
    };
    const interval = window.setInterval(create, 400);
    return () => {
      clearInterval(interval);
      timers.forEach(clearTimeout);
      host.replaceChildren();
    };
  }, []);

  return (
    <>
      <div className="landing-bg" />
      <div id="cursor-glow" />
      <div id="bubbles-container" ref={bubbles} />
    </>
  );
}
