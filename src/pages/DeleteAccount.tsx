import { Link } from "react-router-dom";
import { ArrowLeft, Trash2, Mail, AlertTriangle } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Open the SplitPe app",
    description: "Log in to your SplitPe account on your mobile device.",
  },
  {
    number: "02",
    title: "Go to Settings",
    description:
      "Tap on your profile icon, then navigate to Account Settings.",
  },
  {
    number: "03",
    title: "Select Delete Account",
    description:
      "Tap \"Delete Account\", confirm your decision, and follow the on-screen prompts to complete the request.",
  },
];

const dataDeleted = [
  "Your name, email address, and mobile number",
  "Your profile photo and account preferences",
  "Your group memberships and personal settings",
  "Notification tokens and device information",
];

const dataRetained = [
  "Expense and settlement records shared with other group members, which may be retained within those groups",
  "Transaction and payment records required for accounting, tax, fraud-prevention, or legal compliance purposes",
  "Information we are legally required to retain for a limited period after deletion",
];

export default function DeleteAccount() {
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
              <Trash2 className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                Delete Your Account
              </h1>

              <p className="mt-3 text-sm text-slate-500">
                Last updated: September 25, 2026
              </p>
            </div>
          </div>
        </div>
      </section>

      <article className="container-page max-w-4xl py-12 sm:py-16 lg:py-20">
        <div className="max-w-none">
          <p className="text-base leading-8 text-slate-600 sm:text-lg">
            You can request deletion of your SplitPe account and associated
            personal data at any time. This page explains how to request
            account deletion, what happens to your data, and how long the
            process takes.
          </p>

          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-950">
              How to Delete Your Account
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              You can request account deletion directly from within the
              SplitPe app:
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-3">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
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
              If you're unable to access the app, you can also request
              deletion by emailing us at{" "}
              <a
                href="mailto:support@splitpe.com?subject=Account%20Deletion%20Request"
                className="font-semibold text-splitpe-600 hover:text-splitpe-700"
              >
                support@splitpe.com
              </a>{" "}
              from your registered email address, with "Account Deletion
              Request" in the subject line. Please include your registered
              name, email address, and mobile number so we can verify and
              process your request.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-950">
              What Gets Deleted
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              Once your deletion request is verified and processed, the
              following data is permanently removed from your account:
            </p>

            <ul className="mt-4 space-y-3">
              {dataDeleted.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm leading-7 text-slate-600 sm:text-base"
                >
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-splitpe-500" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-950">
              What May Be Retained
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              In some cases, certain information cannot be immediately
              deleted:
            </p>

            <ul className="mt-4 space-y-3">
              {dataRetained.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm leading-7 text-slate-600 sm:text-base"
                >
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-splitpe-500" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-950">
              Processing Time
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              Account deletion requests are typically processed within 7
              business days of verification. You'll receive a confirmation
              email once your account and associated personal data have been
              deleted.
            </p>
          </section>

          <section className="mt-10 flex gap-4 rounded-2xl border border-amber-100 bg-amber-50 p-6">
            <AlertTriangle className="h-6 w-6 shrink-0 text-amber-600" />

            <div>
              <h2 className="text-lg font-bold text-slate-950">
                This action is permanent
              </h2>

              <p className="mt-2 leading-7 text-slate-700">
                Deleting your account is irreversible. You will lose access to
                your groups, expense history, and balances. If you have
                outstanding balances with other users, we recommend settling
                up before requesting deletion.
              </p>
            </div>
          </section>

          <section className="mt-10 rounded-2xl border border-splitpe-100 bg-splitpe-50 p-6">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-splitpe-700" />

              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Need Help?
                </h2>

                <p className="mt-3 leading-7 text-slate-700">
                  If you have questions about account deletion or run into
                  issues submitting a request, contact us at{" "}
                  <a
                    href="mailto:support@splitpe.com"
                    className="font-semibold text-splitpe-700 hover:text-splitpe-800"
                  >
                    support@splitpe.com
                  </a>
                  . For more details on how we handle your data, see our{" "}
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
