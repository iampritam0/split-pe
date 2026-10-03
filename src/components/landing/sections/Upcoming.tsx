import { SUPPORT_EMAIL } from "../../../constants";
import { UPCOMING } from "../data";
import SectionHead from "./SectionHead";

export default function Upcoming() {
  return (
    <section className="l-section" id="upcoming">
      <div className="l-wrap">
        <SectionHead pill="जल्द आ रहा है" title={<>Upcoming <span className="grad-text">features</span></>}>
          We are just getting started. Here is what we are building next to make हिसाब even easier — and दोस्ती even
          stronger.
        </SectionHead>
        <div className="up-grid">
          {UPCOMING.map((u) => (
            <article key={u.title} className="l-card glass-tile reveal">
              <span className="up-tag">{u.tag}</span>
              <span className="l-ic">{u.emoji}</span>
              <h3>{u.title}</h3>
              <p>{u.text}</p>
              <span className="up-soon">
                <span className="live-dot"></span>Coming soon
              </span>
            </article>
          ))}
        </div>
        <div className="up-foot reveal">
          <p>Have an idea that would make splitting easier?</p>
          <a className="primary-btn magnetic" href={`mailto:${SUPPORT_EMAIL}?subject=SplitPe%20feature%20idea`}>
            Suggest a feature
            <span className="plus-icon">+</span>
          </a>
        </div>
      </div>
    </section>
  );
}
