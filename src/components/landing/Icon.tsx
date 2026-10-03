import type { IconName } from "./data";

// Draws a symbol from <IconSprite />.
export default function Icon({ name, className = "i" }: { name: IconName; className?: string }) {
  return (
    <svg className={className} aria-hidden="true">
      <use href={`#i-${name}`} />
    </svg>
  );
}
