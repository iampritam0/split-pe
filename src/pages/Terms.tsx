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
                Terms & Conditions
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
            These Terms & Conditions govern your access to and use of SplitPe,
            including our website, mobile applications, and related services.
            By accessing or using SplitPe, you agree to comply with these
            terms. If you do not agree with these terms, please do not use the
            service.
          </p>

          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-950">
              1. Eligibility and Account
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              You must meet the minimum legal age and other eligibility
              requirements applicable in your jurisdiction to use SplitPe. When
              creating an account, you agree to provide accurate and current
              information and to keep your account information updated.
            </p>

            <p className="mt-4 leading-8 text-slate-600">
              You are responsible for maintaining the confidentiality of your
              account credentials and for activities performed through your
              account.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-950">
              2. Use of the Service
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              SplitPe is designed to help users organize, track, calculate,
              and manage shared expenses. You agree to use the service only for
              lawful purposes and in accordance with these Terms.
            </p>

            <p className="mt-4 leading-8 text-slate-600">
              You must not misuse the service, attempt to gain unauthorized
              access, interfere with system functionality, introduce malicious
              software, impersonate another person, or use SplitPe for
              fraudulent, unlawful, or abusive activity.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-950">
              3. Expenses and User-Provided Information
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              Users are responsible for the accuracy of expenses, participants,
              amounts, descriptions, payment information, and other data they
              enter into SplitPe.
            </p>

            <p className="mt-4 leading-8 text-slate-600">
              SplitPe provides tools for calculation and organization but does
              not independently verify every expense or financial relationship
              between users. Any disagreement regarding an expense or payment
              should be resolved between the relevant users.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-950">
              4. Payments and Third-Party Services
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              Certain features may involve payment providers, banks, UPI
              services, app stores, or other third-party platforms. Those
              services may have their own terms, privacy policies, eligibility
              requirements, and fees.
            </p>

            <p className="mt-4 leading-8 text-slate-600">
              SplitPe is not responsible for failures, delays, restrictions,
              outages, or actions caused by third-party payment or financial
              service providers.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-950">
              5. Intellectual Property
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              The SplitPe name, branding, software, interface, designs, logos,
              content, graphics, and other materials provided by SplitPe are
              protected by applicable intellectual property laws.
            </p>

            <p className="mt-4 leading-8 text-slate-600">
              Except where expressly permitted, you may not copy, reproduce,
              modify, distribute, reverse engineer, sell, license, or create
              derivative works from SplitPe's proprietary materials.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-950">
              6. Service Availability
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              We aim to keep SplitPe available and reliable, but we do not
              guarantee uninterrupted, error-free, or continuously available
              service. Maintenance, upgrades, technical issues, security
              events, network failures, or circumstances beyond our reasonable
              control may affect availability.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-950">
              7. Disclaimer and Limitation of Liability
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              SplitPe is provided on an "as available" and "as is" basis to the
              extent permitted by applicable law. We do not guarantee that the
              service will always meet your requirements or operate without
              interruptions or errors.
            </p>

            <p className="mt-4 leading-8 text-slate-600">
              To the maximum extent permitted by applicable law, SplitPe and
              its operators, employees, partners, and service providers will
              not be liable for indirect, incidental, special, consequential,
              or punitive losses arising from your use of the service.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-950">
              8. Suspension and Termination
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              We may suspend or terminate accounts where we reasonably believe
              there has been a violation of these Terms, fraudulent activity,
              misuse of the service, security risk, or other conduct that may
              harm users or the platform.
            </p>

            <p className="mt-4 leading-8 text-slate-600">
              You may stop using SplitPe at any time. Certain provisions of
              these Terms, including intellectual property, liability,
              dispute-related provisions, and other provisions that naturally
              survive termination, may continue to apply.
            </p>

            <p className="mt-4 leading-8 text-slate-600">
              You may also request deletion of your account and associated
              personal data at any time. Instructions are available on our{" "}
              <Link
                to="/delete-account"
                className="font-semibold text-splitpe-600 hover:text-splitpe-700"
              >
                Delete Account
              </Link>{" "}
              page. Deletion is permanent and, once processed, cannot be
              undone.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-950">
              9. Governing Law and Disputes
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              These Terms shall be governed by the applicable laws of India,
              subject to applicable statutory protections and requirements.
              Any dispute arising in connection with the service shall be
              addressed through appropriate legal or dispute-resolution
              mechanisms applicable to the parties.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-950">
              10. Changes to These Terms
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              We may modify these Terms from time to time to reflect changes
              in our services, business operations, technology, or legal
              requirements. Updated Terms will be published on this page with
              a revised effective date.
            </p>
          </section>

          <section className="mt-10 rounded-2xl border border-splitpe-100 bg-splitpe-50 p-6">
            <h2 className="text-xl font-bold text-slate-950">
              Questions About These Terms?
            </h2>

            <p className="mt-3 leading-7 text-slate-700">
              If you have questions about these Terms & Conditions, please
              contact SplitPe through the support or contact channels provided
              on our website.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}