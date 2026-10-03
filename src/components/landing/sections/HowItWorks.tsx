import Icon from "../Icon";
import { CATEGORIES, STEPS, USE_CASES } from "../data";
import SectionHead from "./SectionHead";

function UseChip({ cat, title, text }: (typeof USE_CASES)[number]) {
  const c = CATEGORIES[cat];
  return (
    <div className="use-chip glass-tile">
      <span className="use-ic" style={{ color: c.fg, background: c.bg }}>
        <Icon name={c.icon} />
      </span>
      <span>
        <b>{title}</b>
        <small>{text}</small>
      </span>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section className="l-section" id="how-it-works">
      <div className="l-wrap">
        <SectionHead pill="तीन आसान कदम" title={<>Split in <span className="grad-text">three taps</span></>}>
          From the first chai to the final settle-up — here is how SplitPe keeps the हिसाब clean.
        </SectionHead>
        <div className="steps">
          {STEPS.map((s, i) => (
            <article key={s.title} className="step glass-tile reveal">
              <span className="step-num grad-text">0{i + 1}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              <span className="step-chip">
                <Icon name={s.icon} />
                {s.chip}
              </span>
            </article>
          ))}
        </div>
      </div>
      {/* Doubled list so the marquee loops without a gap */}
      <div className="uses reveal" style={{ marginTop: "2.6rem" }} aria-label="What people split with SplitPe">
        <div className="uses-track">
          {[...USE_CASES, ...USE_CASES].map((u, i) => (
            <UseChip key={i} {...u} />
          ))}
        </div>
      </div>
    </section>
  );
}
