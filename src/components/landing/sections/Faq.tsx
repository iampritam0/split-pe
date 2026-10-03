import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { SUPPORT_EMAIL } from "../../../constants";
import Icon from "../Icon";
import SectionHead from "./SectionHead";

const FAQS: { q: string; a: ReactNode }[] = [
  {
    q: "Is SplitPe free?",
    a: "Yes. SplitPe is free to download and every core feature — unlimited groups, custom splits, receipt photos, charts, search and currency conversion — is free. The app is supported by ads.",
  },
  {
    q: "Does SplitPe hold or move my money?",
    a: "No. SplitPe only keeps the हिसाब. When you tap Settle Up, it opens the UPI app you already use (Google Pay, PhonePe, Paytm…) and the payment happens there.",
  },
  {
    q: "Is my bank data safe?",
    a: (
      <>
        We never see, store or process your bank account or card numbers. Expenses are visible only to the friends and
        group members you share them with. Read the full <Link to="/privacy-policy">Privacy Policy</Link>.
      </>
    ),
  },
  {
    q: "Which UPI apps can I settle with?",
    a: "Any UPI app on your phone — Google Pay, PhonePe, Paytm, BHIM or your bank's app. SplitPe hands off the exact amount and you confirm the payment there.",
  },
  {
    q: "Is there an iPhone app?",
    a: "Not yet — SplitPe is on Android today and the iOS app is on our upcoming list, synced with your Android groups.",
  },
  {
    q: "How do I delete my account?",
    a: (
      <>
        In the app, open Profile → Privacy & Security, or follow the steps on our <Link to="/delete-account">Delete Account</Link>{" "}
        page. Questions? Write to <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </>
    ),
  },
];

export default function Faq() {
  return (
    <section className="l-section" id="faq">
      <div className="l-wrap">
        <SectionHead pill="सवाल-जवाब" title={<>Questions, <span className="grad-text">answered</span></>}>
          Everything you might want to know before your first split.
        </SectionHead>
        <div className="faq">
          {FAQS.map((f, i) => (
            <details key={f.q} className="faq-item glass-tile reveal" open={i === 0}>
              <summary>
                {f.q}
                <span className="faq-plus"><Icon name="plus" /></span>
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
