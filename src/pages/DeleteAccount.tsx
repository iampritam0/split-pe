import { Link } from "react-router-dom";
import PageHero from "../components/PageHero";
import { Trash2, Mail, AlertTriangle, Zap } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Open your Profile",
    description:
      "In the SplitPe app, tap the Profile tab, then go to Privacy & Security.",
  },
  {
    number: "02",
    title: "Go to Danger Zone",
    description: "Scroll down to Danger Zone and tap \"Delete Account\".",
  },
  {
    number: "03",
    title: "Confirm deletion",
    description:
      "Confirm in the dialog. Your account is deleted immediately — no waiting period.",
  },
];

const dataDeleted = [
  "Your profile — name, email, mobile number, and photo",
  "Your login credentials",
  "Your personal settings and preferences",
];

const dataRetained = [
  "Shared expenses stay visible to the other members of your groups, but your name on them will no longer resolve to an account",
  "Information we're legally required to retain (e.g. for fraud prevention or accounting) for a limited period",
];

export default function DeleteAccount() {
  return (
    <div>
      <PageHero
        icon={Trash2}
        tag="एक टैप में डिलीट"
        title="Delete your"
        highlight="account."
        meta={[{ label: "Last updated", value: "September 25, 2026" }]}
      />

      <article className="container-page max-w-5xl pb-16 sm:pb-20">
        <div className="legal glass-card rise p-6 sm:p-10 lg:p-12" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-start gap-3 rounded-[22px] border border-mint-200 bg-mint-50/90 p-5">
            <Zap className="h-5 w-5 shrink-0 text-mint-700" />
            <p className="text-sm leading-6 text-mint-800 sm:text-base">
              <strong className="font-semibold">
                Deletion is instant.
              </strong>{" "}
              Unlike most apps, deleting your SplitPe account isn't a support
              ticket or a 30-day wait — it happens immediately, right from
              Settings.
            </p>
          </div>

          <p className="mt-8 text-base leading-8 text-slate-600 sm:text-lg">
            You can permanently delete your SplitPe account and its
            associated personal data at any time, directly from the app. This
            page explains how, and exactly what happens to your data.
          </p>

          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-950">
              How to Delete Your Account
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-3">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="rounded-[22px] border border-white bg-white/80 p-6 shadow-[0_14px_34px_-14px_rgba(30,64,175,0.25)] transition duration-300 hover:-translate-y-1"
                >
                  <span className="text-xs font-bold tracking-widest text-splitpe-600">
                    STEP {step.number}
                  </span>

                  <h3 className="mt-2 text-base font-bold text-slate-950">
                    {step.title}
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-6 leading-8 text-slate-600">
              Can't access the app? Email us at{" "}
              <a
                href="mailto:support@splitpe.xyz?subject=Account%20Deletion%20Request"
                className="font-semibold text-splitpe-600 hover:text-splitpe-700"
              >
                support@splitpe.xyz
              </a>{" "}
              from your registered email address with "Account Deletion
              Request" in the subject line, and we'll process it for you.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-950">
              What Gets Deleted
            </h2>

            <ul className="mt-4 space-y-3">
              {dataDeleted.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm leading-7 text-slate-600 sm:text-base"
                >
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-splitpe-600 to-mint-500" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-950">
              What May Be Retained
            </h2>

            <ul className="mt-4 space-y-3">
              {dataRetained.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm leading-7 text-slate-600 sm:text-base"
                >
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-splitpe-600 to-mint-500" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10 flex gap-4 rounded-[22px] border border-amber-200 bg-amber-50/90 p-6">
            <AlertTriangle className="h-6 w-6 shrink-0 text-amber-600" />

            <div>
              <h2 className="text-lg font-bold text-slate-950">
                This action is permanent
              </h2>

              <p className="mt-2 leading-7 text-slate-700">
                Deleting your account permanently removes your profile,
                login, and leaves every group you're in. Shared expenses stay
                visible to other members, but your name on them will no
                longer resolve. This cannot be undone — if you have
                outstanding balances, settle up first.
              </p>
            </div>
          </section>

          <section className="mt-10 callout p-6">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-splitpe-700" />

              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Need Help?
                </h2>

                <p className="mt-3 leading-7 text-slate-700">
                  Questions about account deletion? Write to{" "}
                  <a
                    href="mailto:support@splitpe.xyz"
                    className="font-semibold text-splitpe-700 hover:text-splitpe-800"
                  >
                    support@splitpe.xyz
                  </a>
                  . For more on how we handle your data, see our{" "}
                  <Link
                    to="/privacy-policy"
                    className="font-semibold text-splitpe-700 hover:text-splitpe-800"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </div>
          </section>
        </div>
      </article>
    </div>
  );
}
