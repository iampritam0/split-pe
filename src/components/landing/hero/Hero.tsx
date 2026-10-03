import logo from "../../../assets/logo-s.png";
import FlavorCarousel from "./FlavorCarousel";
import HeroCopy from "./HeroCopy";
import PhoneMockup from "./PhoneMockup";

// Empty slots — useHeroAnimations fills them with ₹ coins and category tiles.
function Berries({ ids, className }: { ids: number[]; className: string }) {
  return (
    <div className={className}>
      {ids.map((n) => (
        <div key={n} className={`berry b${n}`}></div>
      ))}
    </div>
  );
}

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-content">
        <div className="leaves-container">
          {[1, 2, 3, 4].map((n) => (
            <img key={n} className={`leaf l${n}`} src={logo} alt="" />
          ))}
        </div>
        <HeroCopy />
        <Berries className="berries-container-bg" ids={[7, 8, 9]} />
        <PhoneMockup />
        <Berries className="berries-container" ids={[1, 2, 3, 4, 5, 6]} />
        <FlavorCarousel />
      </div>
    </section>
  );
}
