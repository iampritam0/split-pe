import logo from "../../../assets/logo-s.png";
import playQr from "../../../assets/play-qr.svg";
import { PLAY_STORE_URL } from "../../../constants";
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
          {/* One white card: scan the QR, or tap the Play badge */}
          <div className="cta-band-side">
            <div className="cta-card">
              <a className="cta-qr" href={PLAY_STORE_URL} target="_blank" rel="noopener" aria-label="Scan to download SplitPe on Google Play">
                <img src={playQr} alt="" />
                <img className="cta-qr-logo" src={logo} alt="" />
              </a>
              <div className="cta-get">
                <small className="cta-card-label">Scan the code or tap below</small>
                <PlayBadge />
                <div className="cta-trust">
                  <span><Icon name="swap" />UPI or cash</span>
                  <span><Icon name="check" />Free to use</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
