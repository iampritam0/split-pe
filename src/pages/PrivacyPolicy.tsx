import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Lock, Trash2, UsersRound, Ban } from "lucide-react";

const usps = [
  {
    icon: Lock,
    title: "Your bank never touches us",
    description:
      "Settling up hands off to your own UPI app. We don't see, store, or process account or card numbers — ever.",
  },
  {
    icon: Trash2,
    title: "Delete everything, one tap",
    description:
      "Account deletion is permanent and instant from Settings — not a support ticket, not a 30-day wait.",
  },
  {
    icon: UsersRound,
    title: "Only your circle sees it",
    description:
      "An expense is visible to the friends and group members you added to it — no public feed, no discovery of your spending by strangers.",
  },
  {
    icon: Ban,
    title: "We don't sell data. Full stop.",
    description:
      "No data brokers, no \"trusted partners\" list to opt out of. Your expenses fund nothing but the app you're using.",
  },
];

export default function PrivacyPolicy() {
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
              <ShieldCheck className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                Privacy Policy
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
          <section className="rounded-2xl border border-splitpe-100 bg-gradient-to-br from-splitpe-50 to-white p-6 sm:p-8">
            <span className="section-label">Why it's different here</span>

            <h2 className="text-xl font-bold text-slate-950 sm:text-2xl">
              Privacy isn't a footnote at SplitPe — it's the product
            </h2>

            <p className="mt-3 leading-7 text-slate-600">
              Splitting bills means sharing money details with people. We
              built SplitPe so that circle stays exactly as small as you draw
              it, and nothing else.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {usps.map((usp) => {
                const Icon = usp.icon;

                return (
                  <div
                    key={usp.title}
                    className="rounded-xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-splitpe-50 text-splitpe-600">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="mt-3 text-sm font-bold text-slate-950">
                      {usp.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {usp.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <p className="mt-10 text-base leading-8 text-slate-600 sm:text-lg">
            SplitPe ("we", "us") helps you track and split shared expenses
            with friends and groups. This policy explains what information we
            collect through the app, why, and how you can control it.
          </p>

          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-950">
              1. Information We Collect
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              We collect only what's needed to run the app's core features:
              keeping your account, showing your name and photo to people you
              split expenses with, and recording expenses, groups, and
              settlements.
            </p>

            <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[560px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 font-semibold">What</th>
                    <th className="px-4 py-3 font-semibold">Why</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      Account
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      Name, email address, mobile number (optional), password
                      (encrypted by Firebase Authentication — we never see it
                      in plain text)
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      Create and secure your account, sign you in
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      Profile
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      Profile photo (optional)
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      Shown to your friends and group members
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      Google Sign-In
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      Name, email, and profile photo from your Google
                      account, if you choose that sign-in method
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      Faster sign-in, in place of creating a password
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      Expense data
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      Expenses, amounts, categories, notes, receipt photos,
                      groups, friends, split ratios, settlements, UPI ID (if
                      you add one)
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      The core purpose of the app — tracking who owes what
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      Contacts (optional)
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      If you use "Import from Contacts", the names and
                      numbers already on your phone
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      To check which of your contacts already use SplitPe, so
                      you can add them as friends. We look up each number
                      against our systems; we do not upload or store your
                      full contact list
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      Device & usage
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      Push notification token, general device/app
                      diagnostics, advertising identifier
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      Deliver notifications about new expenses and payments;
                      show ads that keep the app free
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-950">
              2. What We Never Collect
            </h2>

            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-3 leading-7 text-slate-600">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-splitpe-500" />
                <span>
                  <strong className="font-semibold text-slate-900">
                    Bank or card numbers.
                  </strong>{" "}
                  When you settle up, SplitPe hands off to the UPI app of
                  your choice (Google Pay, PhonePe, Paytm, etc.) — payment
                  details never pass through or get stored by SplitPe.
                </span>
              </li>
              <li className="flex items-start gap-3 leading-7 text-slate-600">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-splitpe-500" />
                <span>
                  <strong className="font-semibold text-slate-900">
                    Your full contact list.
                  </strong>{" "}
                  Contact import only checks phone numbers you choose to
                  import against existing SplitPe accounts; the raw list
                  stays on your device.
                </span>
              </li>
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-950">
              3. Who Your Data Is Shared With
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              Your name, photo, and the expenses/balances you're part of are
              visible to the specific friends and group members you share
              them with — that's how splitting a bill works. Beyond that:
            </p>

            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-3 leading-7 text-slate-600">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-splitpe-500" />
                <span>
                  <strong className="font-semibold text-slate-900">
                    Google Firebase
                  </strong>{" "}
                  stores your account and data (Authentication, Firestore
                  Database, Cloud Storage) and delivers push notifications,
                  under Google's own privacy terms.
                </span>
              </li>
              <li className="flex items-start gap-3 leading-7 text-slate-600">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-splitpe-500" />
                <span>
                  <strong className="font-semibold text-slate-900">
                    Google AdMob
                  </strong>{" "}
                  shows ads in the app and may use your advertising
                  identifier for ad delivery and measurement.
                </span>
              </li>
              <li className="flex items-start gap-3 leading-7 text-slate-600">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-splitpe-500" />
                We do not sell your personal data to anyone, for any reason.
              </li>
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-950">
              4. How We Protect It
            </h2>

            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-3 leading-7 text-slate-600">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-splitpe-500" />
                All traffic between the app and our servers is encrypted in
                transit (TLS).
              </li>
              <li className="flex items-start gap-3 leading-7 text-slate-600">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-splitpe-500" />
                Your session token is stored in your device's encrypted
                secure storage, not in plain text.
              </li>
              <li className="flex items-start gap-3 leading-7 text-slate-600">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-splitpe-500" />
                Firestore security rules restrict every read and write to the
                account that owns it, or to people you've explicitly shared a
                group/friend/expense with.
              </li>
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-950">
              5. Your Controls
            </h2>

            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-3 leading-7 text-slate-600">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-splitpe-500" />
                <span>
                  <strong className="font-semibold text-slate-900">
                    Delete your account
                  </strong>{" "}
                  anytime from Profile → Privacy & Security → Delete Account.
                  This permanently removes your profile, groups, and expense
                  history. See our{" "}
                  <Link
                    to="/delete-account"
                    className="font-semibold text-splitpe-600 hover:text-splitpe-700"
                  >
                    Delete Account
                  </Link>{" "}
                  page for details.
                </span>
              </li>
              <li className="flex items-start gap-3 leading-7 text-slate-600">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-splitpe-500" />
                <span>
                  <strong className="font-semibold text-slate-900">
                    Hide amounts
                  </strong>{" "}
                  on your home screen, and control which notifications you
                  receive, from Settings.
                </span>
              </li>
              <li className="flex items-start gap-3 leading-7 text-slate-600">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-splitpe-500" />
                <span>
                  <strong className="font-semibold text-slate-900">
                    Revoke contacts access
                  </strong>{" "}
                  anytime from your phone's system settings — SplitPe still
                  works without it, you'll just add friends by email/phone/
                  search instead.
                </span>
              </li>
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-950">
              6. Children's Privacy
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              SplitPe involves splitting real money and linking UPI payments,
              so it's intended for users{" "}
              <strong className="font-semibold text-slate-900">
                18 and older
              </strong>
              . We don't knowingly collect data from children.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-950">
              7. Changes to This Policy
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              If this policy changes in a way that matters, we'll update the
              date at the top of this page and, for significant changes,
              notify you in the app.
            </p>
          </section>

          <section className="mt-10 rounded-2xl border border-splitpe-100 bg-splitpe-50 p-6">
            <h2 className="text-xl font-bold text-slate-950">Contact Us</h2>

            <p className="mt-3 leading-7 text-slate-700">
              Questions about your data? Write to{" "}
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
