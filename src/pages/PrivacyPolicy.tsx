import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";

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

              <p className="mt-3 text-sm text-slate-500">
                Last updated: September 25, 2026
              </p>
            </div>
          </div>
        </div>
      </section>

      <article className="container-page max-w-4xl py-12 sm:py-16 lg:py-20">
        <div className="prose prose-slate max-w-none">
          <p className="text-base leading-8 text-slate-600 sm:text-lg">
            At SplitPe, we respect your privacy and are committed to protecting
            the information you provide when using our website, mobile
            applications, and related services. This Privacy Policy explains
            what information we collect, how we use it, how we protect it, and
            the choices available to you.
          </p>

          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-950">
              1. Information We Collect
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              We may collect information that you provide directly when you
              create an account, use SplitPe, contact our support team, create
              groups, add expenses, or interact with our services.
            </p>

            <p className="mt-4 leading-8 text-slate-600">
              This information may include your name, email address, mobile
              number, profile information, group information, expense details,
              transaction-related information, device information, and
              communications with us.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-950">
              2. How We Use Information
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              We use collected information to provide, operate, maintain, and
              improve SplitPe and its features. We may use information to
              create and manage your account, calculate expense shares, display
              group balances, provide notifications, respond to support
              requests, prevent fraud and misuse, and communicate important
              service updates.
            </p>

            <p className="mt-4 leading-8 text-slate-600">
              We may also use aggregated or de-identified information for
              analytics, product improvement, security, and business planning.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-950">
              3. Information Sharing
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              SplitPe does not sell your personal information for monetary
              consideration. We may share information with trusted service
              providers who help us operate our infrastructure, analytics,
              communications, customer support, security, and other business
              functions.
            </p>

            <p className="mt-4 leading-8 text-slate-600">
              We may also disclose information when required by applicable law,
              legal process, court order, governmental request, or when
              reasonably necessary to protect our users, services, rights, or
              property.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-950">
              4. Data Security
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              We use reasonable technical and organizational safeguards
              designed to protect your information against unauthorized access,
              alteration, disclosure, or destruction.
            </p>

            <p className="mt-4 leading-8 text-slate-600">
              However, no internet transmission, electronic storage system, or
              online service can be guaranteed to be completely secure. You are
              responsible for protecting your account credentials and notifying
              us promptly if you believe your account has been compromised.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-950">
              5. Cookies and Analytics
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              SplitPe may use cookies, local storage, analytics tools, and
              similar technologies to remember preferences, understand usage
              patterns, improve performance, maintain security, and measure the
              effectiveness of our services.
            </p>

            <p className="mt-4 leading-8 text-slate-600">
              You may be able to control certain cookies through your browser
              or device settings. Disabling certain technologies may affect
              some functionality.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-950">
              6. Your Rights and Choices
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              Depending on applicable law, you may have rights to access,
              correct, update, delete, or request information about your
              personal data. You may also have rights to object to or restrict
              certain processing activities.
            </p>

            <p className="mt-4 leading-8 text-slate-600">
              To make a privacy-related request, contact us using the support
              details provided on our website. We may need to verify your
              identity before processing certain requests.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-950">
              7. Children's Privacy
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              SplitPe is not intended for children who are below the minimum
              age required to use the service under applicable law. We do not
              knowingly collect personal information from children in violation
              of applicable requirements.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-950">
              8. Changes to This Privacy Policy
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              We may update this Privacy Policy from time to time to reflect
              changes to our services, technology, legal requirements, or
              business practices. Updated versions will be posted on this page
              with a revised effective date.
            </p>
          </section>

          <section className="mt-10 rounded-2xl border border-splitpe-100 bg-splitpe-50 p-6">
            <h2 className="text-xl font-bold text-slate-950">
              Contact Us
            </h2>

            <p className="mt-3 leading-7 text-slate-700">
              If you have questions about this Privacy Policy or how your
              information is handled, please contact SplitPe through the
              support or contact channels provided on our website.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}