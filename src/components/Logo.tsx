import logoMark from "../assets/logo-mark.png";

interface LogoProps {
  markSize?: number;
  textClassName?: string;
  splitClassName?: string;
  className?: string;
}

export default function Logo({
  markSize = 36,
  textClassName = "text-xl sm:text-2xl",
  splitClassName = "text-slate-950",
  className = "",
}: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <img
        src={logoMark}
        alt="SplitPe"
        width={markSize}
        height={markSize}
        style={{ width: markSize, height: markSize }}
        className="shrink-0"
      />

      <span className={`font-extrabold tracking-tight ${textClassName}`}>
        <span className={splitClassName}>Split</span>
        <span className="bg-brand-gradient bg-clip-text text-transparent">
          Pe
        </span>
      </span>
    </span>
  );
}
