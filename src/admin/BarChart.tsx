import { useState } from "react";

export type BarDatum = { label: string; value: number };

/**
 * Small single-series column chart for the Overview (one brand-blue hue, so
 * no legend — the card title names the series). Thin bars with rounded tops
 * anchored to the baseline, 2px gaps, a recessive baseline, hover tooltip
 * per bar with a hit area taller than the bar, and a visually-hidden table
 * for screen readers.
 */
export default function BarChart({ data, unit }: { data: BarDatum[]; unit: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div>
      <div className="relative flex h-36 items-end gap-[2px] border-b border-slate-200" role="img" aria-label={`${total} ${unit} over ${data.length} days`}>
        {data.map((d, i) => (
          <div
            key={d.label}
            className="relative flex h-full flex-1 cursor-default items-end"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <div
              className={`w-full rounded-t-[4px] transition-colors ${hover === i ? "bg-splitpe-700" : "bg-splitpe-600"}`}
              style={{ height: d.value ? `${Math.max(4, (d.value / max) * 100)}%` : "2px", opacity: d.value ? 1 : 0.35 }}
            />
            {hover === i && (
              <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs text-white shadow-lg">
                <b className="font-semibold">{d.value}</b> {unit}
                <span className="ml-1 text-slate-400">· {d.label}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-slate-400">
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
      <table className="sr-only">
        <tbody>
          {data.map((d) => (
            <tr key={d.label}><th>{d.label}</th><td>{d.value}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
