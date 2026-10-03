import Icon from "../Icon";
import { FEATURES } from "../data";
import SectionHead from "./SectionHead";

export default function Features() {
  return (
    <section className="l-section" id="features">
      <div className="l-wrap">
        <SectionHead pill="सब कुछ, एक जगह" title={<>Everything a <span className="grad-text">group needs</span></>}>
          Every core feature is free — no premium tier, no locked splits.
        </SectionHead>
        <div className="feat-grid">
          {FEATURES.map((f) => (
            <article key={f.title} className="l-card glass-tile reveal">
              <span className="l-ic"><Icon name={f.icon} /></span>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
