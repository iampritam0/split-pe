import { PLAY_STORE_URL } from "../../../constants";
import { PlayBadge } from "../Brand";
import Icon from "../Icon";

// Left column: live pill, rolling headline, pitch and the Play Store CTA.
export default function HeroCopy() {
  return (
    <div className="hero-left">
      <div className="pill-row">
        <a className="live-pill" href={PLAY_STORE_URL} target="_blank" rel="noopener">
          <span className="live-dot"></span>
          <b>LIVE</b> on Google Play · Android
        </a>
        <span className="tag-pill">
          <Icon name="check" />
          हिसाब भी, दोस्ती भी
        </span>
      </div>
      <h1 className="main-title" aria-label="Split bills, keep friendship">
        <span className="line">
          <span className="roll" aria-hidden="true">
            <span>Split</span>
            <span>Keep</span>
          </span>
        </span>
        <span className="line">
          <span className="roll" aria-hidden="true">
            <span className="grad-text">bills</span>
            <span className="grad-text">friendship</span>
          </span>
        </span>
      </h1>
      <p className="description">
        Trips, flatmates, late-night chai — add it once, <br />
        split it fairly and keep track of who has paid. <br />
        <b>Clear balances. Zero awkward reminders.</b>
      </p>
      <div className="cta-group">
        <PlayBadge magnetic />
        <span className="cta-note">
          <Icon name="android" className="" />
          Free to download on Android
        </span>
      </div>
      <div className="award-badge">
        <div className="award-icon">
          <svg className="i" width="24" height="24" aria-hidden="true">
            <use href="#i-shield" />
          </svg>
        </div>
        <div className="award-text">
          <span className="award-title">SECURED &amp; READY</span>
          <span className="award-subtitle">Your bank data never touches us</span>
        </div>
      </div>
    </div>
  );
}
