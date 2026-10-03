import logo from "../../assets/logo-s.png";
import { PLAY_STORE_URL } from "../../constants";
import Icon from "./Icon";

export function Logo({ href = "#top" }: { href?: string }) {
  return (
    <a className="logo" href={href} aria-label="SplitPe home">
      <img src={logo} alt="" />
      <span className="logo-word">
        <b>
          Split<span className="grad-text">Pe</span>
        </b>
        <small>हिसाब भी, दोस्ती भी</small>
      </span>
    </a>
  );
}

// Google Play badge. `magnetic` badges follow the cursor a little (see useMagnetic).
export function PlayBadge({ className = "", magnetic = false }: { className?: string; magnetic?: boolean }) {
  return (
    <a
      className={`play-badge ${magnetic ? "magnetic" : ""} ${className}`}
      href={PLAY_STORE_URL}
      target="_blank"
      rel="noopener"
      aria-label="Get SplitPe on Google Play"
    >
      <Icon name="play" className="" />
      <span>
        <small>GET IT ON</small>
        <b>Google Play</b>
      </span>
    </a>
  );
}
