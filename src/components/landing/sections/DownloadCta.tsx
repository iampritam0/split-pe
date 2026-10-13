import { PlayBadge } from "../Brand";
import Icon from "../Icon";

export default function DownloadCta() {
  return (
    <section className="l-section" id="download">
      <div className="l-wrap">
        <div className="cta-band reveal">
          <div style={{ position: "relative", zIndex: 1 }}>
            <h2>Next trip, split it the easy way</h2>
            <p>Add your first group in under a minute. Free on Android.</p>
          </div>
          <div className="cta-band-side">
            <PlayBadge magnetic />
            <div className="cta-trust">
              <span><Icon name="swap" />UPI or cash, your call</span>
              <span><Icon name="check" />Free to use</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
