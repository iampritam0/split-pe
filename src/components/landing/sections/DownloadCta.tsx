import { Link } from "react-router-dom";
import { PlayBadge } from "../Brand";
import Icon from "../Icon";

export default function DownloadCta() {
  return (
    <section className="l-section" id="download">
      <div className="l-wrap">
        <div className="cta-band reveal">
          <div style={{ position: "relative", zIndex: 1 }}>
            <h2>Next trip, split it the easy way</h2>
            <div className="hi">हिसाब भी, दोस्ती भी</div>
            <p>Add your first group in under a minute. Free on Android, no bank details needed.</p>
          </div>
          <div className="cta-band-side">
            <div className="cta-band-actions">
              <PlayBadge magnetic />
              <Link className="prereg-btn on-band" to="/register">
                <Icon name="userplus" className="" />
                Pre-register
              </Link>
            </div>
            <div className="cta-trust">
              <span><Icon name="lock" />No bank data</span>
              <span><Icon name="swap" />UPI or cash, your call</span>
              <span><Icon name="check" />Free to use</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
