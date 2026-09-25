import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";

export default function Terms() {
  return (
    <div className="bg-white">
      <section className="border-b border-slate-100 bg-slate-50">
        <div className="container-page py-14 sm:py-16 lg:py-20">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-splitpe-600 transition hover:text-splitpe-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to SplitPe
          </Link>

          <div className="mt-8 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-splitpe-100 text-splitpe-700">
              <FileText className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                Terms of Service
              </h1>

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500">
                <span>
                  <strong className="font-semibold text-slate-700">
                    App:
                  </strong>{" "}
                  SplitPe (com.raotechnologies.splitpe)
                </span>
                <span>
                  <strong className="font-semibold text-slate-700">
                    Last updated:
                  </strong>{" "}
                  19 September 2026
                </span>
                <span>
                  <strong className="font-semibold text-slate-700">
                    Contact:
                  </strong>{" "}
                  <a
                    href="mailto:support@splitpe.app"
                    className="font-semibold text-splitpe-600 hover:text-splitpe-700"
                  >
                    support@splitpe.app
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <article className="container-page max-w-4xl py-12 sm:py-16 lg:py-20">
        <div className="max-w-none">
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
              It calculates who owes what and helps you settle up.{" "}
              <strong className="font-semibold text-slate-900">
                SplitPe does not hold, transmit, or move money.
              </strong>{" "}
              When you tap "Settle Up," we hand off to a UPI app you already
              have installed (Google Pay, PhonePe, etc.); that transaction
              happens entirely inside that app, outside SplitPe's control.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-950">
              2. Your Responsibilities
            </h2>

            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-3 leading-7 text-slate-600">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-splitpe-500" />
                You're responsible for the accuracy of expenses, amounts, and
                splits you enter — SplitPe reflects what you tell it.
              </li>
              <li className="flex items-start gap-3 leading-7 text-slate-600">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-splitpe-500" />
                Use SplitPe only with people you know and trust; anything you
                enter into a shared group or expense is visible to everyone
                in it.
              </li>
              <li className="flex items-start gap-3 leading-7 text-slate-600">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-splitpe-500" />
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
              from a failed UPI transaction, a mistaken entry, or a dispute
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

          <section className="mt-10 rounded-2xl border border-splitpe-100 bg-splitpe-50 p-6">
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
