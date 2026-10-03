import logo from "../../assets/logo-s.png";

// Intro splash, mirrors the app's own launch screen. useLandingIntro animates it out.
export default function Loader() {
  return (
    <div id="loader">
      <img src={logo} alt="" />
      <h2>
        Split<span className="grad-text">Pe</span>
      </h2>
      <div className="hi">हिसाब भी, दोस्ती भी</div>
      <p>Preserving bonds with financial clarity</p>
      <div className="ld-bar">
        <i></i>
      </div>
    </div>
  );
}
