import { Link } from "react-router-dom";
import PageHero from "../components/PageHero";
import { FileText } from "lucide-react";

export default function Terms() {
  return (
    <div>
      <PageHero
        icon={FileText}
        tag="साफ़ नियम, साफ़ हिसाब"
        title="Terms of"
        highlight="Service."
        meta={[
          { label: "App", value: "SplitPe (com.raotechnologies.splitpe)" },
          { label: "Last updated", value: "19 September 2026" },
          { label: "Contact", value: <a href="mailto:support@splitpe.app" className="font-semibold text-splitpe-600 hover:text-splitpe-700">support@splitpe.app</a> },
        ]}
      />

      <article className="container-page max-w-5xl pb-16 sm:pb-20">
        <div className="legal glass-card rise p-6 sm:p-10 lg:p-12" style={{ animationDelay: "0.3s" }}>
          <p className="text-base leading-8 text-slate-600 sm:text-lg">
            By creating an account or using SplitPe, you agree to these
            terms.
          </p>

          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-950">
              1. What SplitPe Is
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              SplitPe is a record-keeping tool for shared expenses among
              people you know — trips, roommates, meals, and similar groups.
              It calculates who owes what and lets you record settle-ups.{" "}
              <strong className="font-semibold text-slate-900">
                SplitPe does not make, process, hold, or move any payment.
              </strong>{" "}
              You pay each other outside the app — by UPI, cash, or any other
              way — and then mark the payment as settled in SplitPe, noting
              whether it was paid by UPI or cash. That note is only a record;
              SplitPe does not verify that a payment actually happened.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-950">
              2. Your Responsibilities
            </h2>

            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-3 leading-7 text-slate-600">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-splitpe-600 to-mint-500" />
                You're responsible for the accuracy of expenses, amounts, and
                splits you enter — SplitPe reflects what you tell it.
              </li>
              <li className="flex items-start gap-3 leading-7 text-slate-600">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-splitpe-600 to-mint-500" />
                Use SplitPe only with people you know and trust; anything you
                enter into a shared group or expense is visible to everyone
                in it.
              </li>
              <li className="flex items-start gap-3 leading-7 text-slate-600">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-splitpe-600 to-mint-500" />
                Don't use SplitPe for anything unlawful, fraudulent, or to
                harass another person.
              </li>
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-950">
              3. Ads and Free Features
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              SplitPe is free and supported by ads (Google AdMob). To keep
              expense-tracking sustainable, after 5 expenses added in a day,
              the next one may ask you to watch a short rewarded ad before
              continuing — watching it unlocks 5 more for that day. Every
              core feature — unlimited groups, currency conversion, receipt
              photos, charts, custom splits, and search — is free; nothing in
              SplitPe is paywalled.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-950">
              4. Account & Termination
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              You need a verified email to use SplitPe. You can delete your
              account at any time from Settings — see our{" "}
              <Link
                to="/delete-account"
                className="font-semibold text-splitpe-600 hover:text-splitpe-700"
              >
                Delete Account
              </Link>{" "}
              page. We may suspend or remove accounts that violate these
              terms or abuse the service (e.g., spam, fraud, attempts to
              bypass security).
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-950">
              5. No Warranty, Limited Liability
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              SplitPe is provided "as is." We work to keep balances accurate
              and the app available, but we're not liable for losses arising
              from a payment made outside SplitPe, a mistaken entry, or a dispute
              between you and someone in your group — those happen between
              you and the other party, or between you and your payment
              provider.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-950">
              6. Changes & Governing Law
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              We may update these terms as SplitPe evolves; continuing to use
              the app after an update means you accept the current terms.
              These terms are governed by the laws of India.
            </p>
          </section>

          <section className="mt-10 callout p-6">
            <h2 className="text-xl font-bold text-slate-950">
              Questions About These Terms?
            </h2>

            <p className="mt-3 leading-7 text-slate-700">
              Write to{" "}
              <a
                href="mailto:support@splitpe.app"
                className="font-semibold text-splitpe-700 hover:text-splitpe-800"
              >
                support@splitpe.app
              </a>{" "}
              — we respond to every request.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
