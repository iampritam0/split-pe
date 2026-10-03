import logo from "../../../assets/logo-s.png";

// Right column: the हिसाब / दोस्ती cards that switch the theme, plus the side headline.
// Switching itself is wired up in useHeroAnimations.
export default function FlavorCarousel() {
  return (
    <div className="hero-right">
      <div className="product-carousel">
        <div className="carousel-cards">
          <button className="card active" data-flavor="hisaab" type="button">
            <div className="thumb thumb-dash">
              <i className="tb"></i>
              <i className="tc"></i>
              <span className="tg">
                <i></i>
                <i></i>
                <i></i>
                <i></i>
              </span>
              <i className="tn"></i>
            </div>
            <div className="card-info">
              <span>हिसाब</span>
              <span>Balances at a glance</span>
            </div>
          </button>
          <button className="card" data-flavor="dosti" type="button">
            <div className="thumb thumb-splash">
              <img src={logo} alt="" />
              <b>SplitPe</b>
              <i></i>
            </div>
            <div className="card-info">
              <span>दोस्ती</span>
              <span>Settle up, stay close</span>
            </div>
          </button>
        </div>
        <div className="carousel-nav">
          <button className="nav-arrow" data-dir="-1" aria-label="Previous" type="button">
            ←
          </button>
          <button className="nav-arrow" data-dir="1" aria-label="Next" type="button">
            →
          </button>
        </div>
      </div>
      <h2 className="side-title">
        <span className="line">
          <span>Stay</span>
        </span>
        <span className="line">
          <span className="grad-text">friends</span>
        </span>
      </h2>
    </div>
  );
}
