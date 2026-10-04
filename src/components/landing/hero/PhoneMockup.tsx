import logo from "../../../assets/logo-s.png";
import type { CSSProperties } from "react";
import Icon from "../Icon";

function StatusBar({ time, style }: { time: string; style?: CSSProperties }) {
  return (
    <div className="status-bar" style={style}>
      <span>{time}</span>
      <span className="status-icons">
        <span className="sig">
          {[4, 6, 8, 10].map((h) => (
            <i key={h} style={{ height: h }}></i>
          ))}
        </span>
        <span className="batt">
          <i></i>
        </span>
      </span>
    </div>
  );
}

// Home dashboard, copied from the real SplitPe app.
function DashboardView() {
  return (
    <div className="screen-view view-dash">
      <StatusBar time="11:11" />
      <div className="d-head">
        <div className="d-logo">
          <img src={logo} alt="" />
          <span>
            <b>
              Split<span className="grad-text">Pe</span>
            </b>
            <small>हिसाब भी, दोस्ती भी</small>
          </span>
        </div>
        <div className="d-actions">
          <span className="d-bell">
            <Icon name="bell" />
          </span>
          <span className="d-avatar">PK</span>
        </div>
      </div>
      <div className="d-greet">
        <div>
          <p>Good evening,</p>
          <h4>Pritam 👋</h4>
        </div>
        <span className="d-pill">
          <Icon name="check" />
          हिसाब भी, दोस्ती भी
        </span>
      </div>
      <div className="d-balance">
        <div className="d-balance-top">
          <span>OVERALL BALANCE</span>
          <em>↗ +12%</em>
        </div>
        <div className="d-balance-amt">
          <b data-count="2450" data-prefix="₹">₹2,450</b>
          <small>net receivable</small>
        </div>
      </div>
      <div className="d-grid">
        <div className="d-stat st-blue">
          <span className="ic"><Icon name="users" /></span>
          <p>Total Groups</p>
          <b data-count="4">4</b>
        </div>
        <div className="d-stat st-purple">
          <span className="ic"><Icon name="receipt" /></span>
          <p>Total Expenses</p>
          <b data-count="41">41</b>
        </div>
        <div className="d-stat st-red">
          <span className="ic"><Icon name="down" /></span>
          <p>You Owe</p>
          <b data-count="1200" data-prefix="₹">₹1,200</b>
        </div>
        <div className="d-stat st-green">
          <span className="ic"><Icon name="up" /></span>
          <p>You Get</p>
          <b data-count="3650" data-prefix="₹">₹3,650</b>
        </div>
      </div>
      <div className="d-quick">
        <div className="d-q q1"><span><Icon name="plus" /></span>Add Expense</div>
        <div className="d-q q2"><span><Icon name="swap" /></span>Settle Up</div>
        <div className="d-q q3"><span><Icon name="users" /></span>New Group</div>
        <div className="d-q q4"><span><Icon name="userplus" /></span>Add Friend</div>
      </div>
      <div className="d-recent-h">
        <b>Recent Activity</b>
        <a>See All ›</a>
      </div>
      <div className="d-row">
        <span className="ic"><Icon name="food" /></span>
        <div>
          <b>Goa Trip · Dinner</b>
          <small>You paid · Today</small>
        </div>
        <span className="amt">
          <b>+₹3,600</b>
          <small>Paid ₹4,800</small>
        </span>
      </div>
      <nav className="d-nav">
        <a className="on"><Icon name="home" />Home</a>
        <a><Icon name="users" />Groups</a>
        <span className="gap"></span>
        <a><Icon name="doc" />Activity</a>
        <a><Icon name="user" />Profile</a>
        <span className="d-fab"><Icon name="plus" /></span>
      </nav>
    </div>
  );
}

function SplashView() {
  return (
    <div className="screen-view view-splash">
      <StatusBar time="11:13" style={{ width: "100%" }} />
      <div className="s-body">
        <img src={logo} alt="" />
        <h3>
          Split<span className="grad-text">Pe</span>
        </h3>
        <div className="hi">हिसाब भी, दोस्ती भी</div>
        <p>Preserving bonds with financial clarity</p>
        <div className="s-ready">SECURED &amp; READY</div>
        <div className="s-bar"><i></i></div>
      </div>
      <div className="s-foot">
        <b>SplitPe</b>
        <small>Version 1.0 • Made with friendship &amp; clarity</small>
      </div>
    </div>
  );
}

// The 3D phone in the middle of the hero, with the two toasts floating around it.
export default function PhoneMockup() {
  return (
    <div className="hero-center">
      <div className="phone-stage" id="phone-stage">
        <div className="phone-shadow"></div>
        <div className="float-toast t1">
          <span className="ft-ic" style={{ color: "#16a34a", background: "#cdf5df" }}>
            <Icon name="swap" />
          </span>
          <div>
            <b data-t="">Aman paid you ₹500</b>
            <small data-s="">Marked settled · UPI · just now</small>
          </div>
        </div>
        <div className="float-toast t2">
          <span className="ft-ic" style={{ color: "#2563eb", background: "#d6e4ff" }}>
            <Icon name="plane" />
          </span>
          <div>
            <b data-t="">Goa Trip</b>
            <small data-s="">₹18,400 · split 4 ways</small>
          </div>
        </div>
        <div className="phone-scale">
          <div className="phone" id="phone" data-screen="splash">
            <div className="face front">
              <div className="screen">
                <div className="island"></div>
                <div className="p-notif">
                  <span className="pn-ic"><img src={logo} alt="" /></span>
                  <div>
                    <b>
                      <span data-n-t="">SplitPe</span>
                      <em>now</em>
                    </b>
                    <small data-n-s="">Rahul added "Chai" · you owe ₹80</small>
                  </div>
                </div>
                <DashboardView />
                <SplashView />
                <span className="home-ind"></span>
              </div>
            </div>
            <div className="face back">
              <span className="camera-bump"></span>
              <img src={logo} alt="" />
              <span>SplitPe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
