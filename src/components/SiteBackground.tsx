// Gradient backdrop + rising bubbles — the same ambience as the landing page.
// Positions are fixed (not random) so the layout is stable between renders.
const bubbles = [
  { left: 6, size: 14, duration: 9, delay: 0 },
  { left: 14, size: 22, duration: 12, delay: 3 },
  { left: 23, size: 11, duration: 8, delay: 6 },
  { left: 31, size: 26, duration: 14, delay: 1.5 },
  { left: 42, size: 13, duration: 10, delay: 4.5 },
  { left: 53, size: 18, duration: 11, delay: 7 },
  { left: 61, size: 10, duration: 7.5, delay: 2 },
  { left: 70, size: 24, duration: 13, delay: 5.5 },
  { left: 78, size: 15, duration: 9.5, delay: 0.8 },
  { left: 86, size: 20, duration: 12.5, delay: 3.8 },
  { left: 94, size: 12, duration: 8.5, delay: 6.5 },
];

export default function SiteBackground() {
  return (
    <div className="site-bg" aria-hidden="true">
      {bubbles.map((b) => (
        <span
          key={b.left}
          className="site-bubble"
          style={{
            left: `${b.left}%`,
            width: b.size,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
