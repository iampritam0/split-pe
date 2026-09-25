import {
  ArrowRight,
  Bell,
  Check,
  ChevronRight,
  IndianRupee,
  ReceiptText,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
  Wallet,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Group Tracking",
    description:
      "Create groups for trips, roommates, dinners, events, or everyday shared expenses and keep everything organized in one place.",
  },
  {
    icon: IndianRupee,
    title: "Easy Expense Splitting",
    description:
      "Add an expense, choose who paid, select the people involved, and let SplitPe calculate everyone's share automatically.",
  },
  {
    icon: Zap,
    title: "Quick Settlements",
    description:
      "See exactly who owes whom and simplify your outstanding balances so settling up takes just a few taps.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description:
      "Stay updated with expense additions, payment reminders, settlement activity, and important group updates.",
  },
];

const steps = [
  {
    number: "01",
    icon: Users,
    title: "Create a group",
    description:
      "Start a group for your trip, home, friends, colleagues, or any shared activity.",
  },
  {
    number: "02",
    icon: ReceiptText,
    title: "Add expenses",
    description:
      "Record bills and expenses as they happen. Split them fairly among the people involved.",
  },
  {
    number: "03",
    icon: Wallet,
    title: "Settle up",
    description:
      "Check balances, understand who owes whom, and settle your shared expenses with confidence.",
  },
];

const testimonials = [
  {
    quote:
      "SplitPe made our Goa trip so much easier. We stopped maintaining messy spreadsheets and could instantly see everyone's expenses.",
    name: "Rohan Mehta",
    role: "Frequent Traveller",
    initials: "RM",
  },
  {
    quote:
      "Managing household expenses with roommates used to be a monthly headache. Now we add expenses as they happen and everything stays clear.",
    name: "Ananya Sharma",
    role: "Working Professional",
    initials: "AS",
  },
  {
    quote:
      "The biggest difference is how simple it feels. I don't need to calculate everyone's share manually anymore.",
    name: "Karan Verma",
    role: "Startup Founder",
    initials: "KV",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-50">
        <div className="absolute -left-40 top-20 h-72 w-72 rounded-full bg-splitpe-200/40 blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-splitpe-100/60 blur-3xl" />

        <div className="container-page relative">
          <div className="grid min-h-[calc(100vh-5rem)] items-center gap-14 py-16 lg:grid-cols-2 lg:gap-20 lg:py-20 xl:py-24">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-splitpe-200 bg-white px-3 py-1.5 text-sm font-semibold text-splitpe-700 shadow-sm">
                <Sparkles className="h-4 w-4" />
                Shared expenses, made simple
              </div>

              <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl">
                Split bills.
                <span className="block text-splitpe-600">
                  Not friendships.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg md:text-xl">
                SplitPe makes sharing expenses with friends, family, roommates
                and travel groups effortless. Track who paid, understand who
                owes what, and settle up without the awkward calculations.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#download"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-splitpe-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-splitpe-600/20 transition hover:bg-splitpe-700 focus:outline-none focus:ring-2 focus:ring-splitpe-500 focus:ring-offset-2 sm:px-7"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </a>

                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:px-7"
                >
                  See how it works
                  <ChevronRight className="h-4 w-4" />
                </a>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-splitpe-600" />
                  Simple expense tracking
                </div>

                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-splitpe-600" />
                  Clear group balances
                </div>
              </div>
            </div>

            {/* Hero Product Preview */}
            <div className="relative mx-auto w-full max-w-xl lg:ml-auto">
              <div className="absolute -inset-4 rounded-[2rem] bg-splitpe-200/50 blur-2xl" />

              <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-4 shadow-card sm:p-6">
                <div className="rounded-2xl bg-slate-950 p-5 text-white sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Group balance</p>
                      <p className="mt-1 text-3xl font-bold">₹4,860</p>
                    </div>

                    <div className="rounded-xl bg-splitpe-500/15 p-3">
                      <Wallet className="h-6 w-6 text-splitpe-400" />
                    </div>
                  </div>

                  <div className="mt-7 grid grid-cols-3 gap-3">
                    <div className="rounded-xl bg-white/5 p-3">
                      <p className="text-xs text-slate-400">You paid</p>
                      <p className="mt-1 text-lg font-bold">₹2,450</p>
                    </div>

                    <div className="rounded-xl bg-white/5 p-3">
                      <p className="text-xs text-slate-400">You owe</p>
                      <p className="mt-1 text-lg font-bold">₹860</p>
                    </div>

                    <div className="rounded-xl bg-white/5 p-3">
                      <p className="text-xs text-slate-400">Friends</p>
                      <p className="mt-1 text-lg font-bold">5</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">
                      Recent expenses
                    </h3>

                    <span className="text-xs font-semibold text-splitpe-600">
                      View all
                    </span>
                  </div>

                  <div className="space-y-3">
                    {[
                      ["Dinner", "Rahul paid", "₹1,800"],
                      ["Cab", "You paid", "₹620"],
                      ["Hotel", "Priya paid", "₹6,400"],
                    ].map(([title, person, amount]) => (
                      <div
                        key={title}
                        className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-splitpe-600 shadow-sm">
                            <ReceiptText className="h-5 w-5" />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {title}
                            </p>
                            <p className="text-xs text-slate-500">{person}</p>
                          </div>
                        </div>

                        <p className="text-sm font-bold text-slate-900">
                          {amount}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="section-padding bg-white">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <span className="section-label">Everything in one place</span>

            <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              Shared expenses without the spreadsheet headache
            </h2>

            <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">
              SplitPe brings your shared expenses, balances and settlements
              together in one simple experience.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-splitpe-200 hover:shadow-soft sm:p-7"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-splitpe-50 text-splitpe-600 transition group-hover:bg-splitpe-600 group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="mt-6 text-lg font-bold text-slate-950">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* About / trust */}
      <section id="about" className="section-padding bg-slate-50">
        <div className="container-page">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <span className="section-label">Built for real life</span>

              <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                Money conversations don't have to be complicated.
              </h2>

              <p className="mt-6 text-base leading-8 text-slate-600 sm:text-lg">
                Whether you're planning a weekend trip, sharing rent with
                roommates, organizing a dinner, or managing recurring household
                expenses, SplitPe helps everyone stay on the same page.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Know exactly where your money is going.",
                  "Keep every group expense organized.",
                  "Reduce awkward money follow-ups.",
                  "Make settling up clear and transparent.",
                  "Stay in control of your data, with the option to delete your account anytime.",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-splitpe-100">
                      <Check className="h-4 w-4 text-splitpe-700" />
                    </div>

                    <p className="text-sm font-medium text-slate-700 sm:text-base">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft sm:p-7">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-splitpe-600 text-white">
                    <ShieldCheck className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="font-bold text-slate-900">
                      Clear group finances
                    </p>
                    <p className="text-sm text-slate-500">
                      Everyone knows what's happening
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-5">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-700">
                          A
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            Ananya
                          </p>
                          <p className="text-xs text-slate-500">
                            paid ₹2,400
                          </p>
                        </div>
                      </div>

                      <span className="text-sm font-bold text-splitpe-600">
                        +₹800
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-700">
                          R
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            Rahul
                          </p>
                          <p className="text-xs text-slate-500">
                            owes the group
                          </p>
                        </div>
                      </div>

                      <span className="text-sm font-bold text-slate-700">
                        ₹800
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-splitpe-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-splitpe-600 text-white">
                        <Check className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-splitpe-800">
                          Everything balances out
                        </p>
                        <p className="text-xs text-splitpe-700">
                          No manual calculations required
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="section-padding bg-white">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <span className="section-label">How it works</span>

            <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              Three steps. Zero confusion.
            </h2>

            <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">
              Start tracking shared expenses in minutes and let SplitPe handle
              the calculations.
            </p>
          </div>

          <div className="relative mt-12 grid gap-6 md:grid-cols-3 lg:mt-16">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div key={step.number} className="relative">
                  {index < steps.length - 1 && (
                    <div className="absolute left-[calc(50%+4rem)] right-[-4rem] top-12 hidden border-t border-dashed border-slate-200 md:block" />
                  )}

                  <div className="relative rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-splitpe-50 text-splitpe-600">
                      <Icon className="h-7 w-7" />
                    </div>

                    <span className="mt-6 block text-xs font-bold tracking-widest text-splitpe-600">
                      STEP {step.number}
                    </span>

                    <h3 className="mt-2 text-xl font-bold text-slate-950">
                      {step.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="section-padding bg-slate-50">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <span className="section-label">Loved by groups</span>

            <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Less calculating. More enjoying.
            </h2>

            <p className="mt-5 text-base leading-7 text-slate-600">
              A better way to handle shared money without unnecessary friction.
            </p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article
                key={testimonial.name}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7"
              >
                <div className="flex gap-1 text-splitpe-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star}>★</span>
                  ))}
                </div>

                <blockquote className="mt-5 text-sm leading-7 text-slate-600 sm:text-base">
                  “{testimonial.quote}”
                </blockquote>

                <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-splitpe-100 text-sm font-bold text-splitpe-700">
                    {testimonial.initials}
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Download / CTA */}
      <section id="download" className="section-padding bg-white">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-splitpe-500/20 blur-3xl" />
            <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-splitpe-500/10 blur-3xl" />

            <div className="relative mx-auto max-w-3xl text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-splitpe-500 text-white">
                <Smartphone className="h-7 w-7" />
              </div>

              <h2 className="mt-6 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                Ready to make shared expenses easier?
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
                Join SplitPe and bring clarity to every shared expense. Create
                groups, track spending and settle up without the stress.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-splitpe-500 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-splitpe-400"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-slate-900"
                >
                  <Smartphone className="h-4 w-4" />
                  Download App
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}