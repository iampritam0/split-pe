import {
  ArrowRight,
  Ban,
  BarChart3,
  ChevronRight,
  Infinity as InfinityIcon,
  Lock,
  PieChart,
  PlusCircle,
  Receipt,
  Search,
  Sparkles,
  Trash2,
  UserPlus,
  Users,
  UsersRound,
  Wallet,
  Check,
} from "lucide-react";

const features = [
  {
    icon: InfinityIcon,
    title: "Unlimited expenses",
    description: "Add as many expenses as you like, no limits.",
  },
  {
    icon: Wallet,
    title: "Currency conversion",
    description:
      "Pay in any currency — it converts to your default automatically.",
  },
  {
    icon: Receipt,
    title: "Receipt itemization",
    description:
      "Every item, assigned to the right person, with the Items split method.",
  },
  {
    icon: BarChart3,
    title: "Charts and graphs",
    description: "Track spending trends over time, by category.",
  },
  {
    icon: PieChart,
    title: "Custom split ratios",
    description:
      "Set a custom split with a person or group using the Shares method.",
  },
  {
    icon: Search,
    title: "Expense search",
    description: "Find any expense without endless scrolling.",
  },
];

const trust = [
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
      "An expense is visible to the friends and group members you added — no public feed, no strangers.",
  },
  {
    icon: Ban,
    title: "We don't sell data. Full stop.",
    description:
      "No data brokers, no \"trusted partners\" list to opt out of. Your expenses fund nothing but the app.",
  },
];

const steps = [
  {
    number: "01",
    icon: Receipt,
    title: "Split expenses easily",
    description:
      "Share expenses with friends and groups without doing the math yourself.",
  },
  {
    number: "02",
    icon: BarChart3,
    title: "Track balances in real time",
    description:
      "See exactly who owes what across every group, updated instantly.",
  },
  {
    number: "03",
    icon: Wallet,
    title: "Settle up in one tap",
    description:
      "Record payments and keep everyone's ledger clean and clear.",
  },
];

const quickActions = [
  {
    label: "Add Expense",
    icon: PlusCircle,
    tone: "gradient" as const,
  },
  {
    label: "Settle Up",
    icon: Wallet,
    tone: "green" as const,
  },
  {
    label: "New Group",
    icon: Users,
    tone: "purple" as const,
  },
  {
    label: "Add Friend",
    icon: UserPlus,
    tone: "blue" as const,
  },
];

const toneClasses: Record<string, string> = {
  gradient: "bg-brand-gradient text-white",
  green: "bg-mint-100 text-mint-700",
  purple: "bg-violet-100 text-violet-600",
  blue: "bg-splitpe-100 text-splitpe-600",
};

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-50">
        <div className="absolute -left-40 top-20 h-72 w-72 rounded-full bg-splitpe-200/40 blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-mint-100/60 blur-3xl" />

        <div className="container-page relative">
          <div className="grid min-h-[calc(100vh-5rem)] items-center gap-14 py-16 lg:grid-cols-2 lg:gap-20 lg:py-20 xl:py-24">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-splitpe-200 bg-white px-3 py-1.5 text-sm font-semibold text-splitpe-700 shadow-sm">
                <Sparkles className="h-4 w-4" />
                हिसाब भी, दोस्ती भी
              </div>

              <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl">
                Split bills.
                <span className="block bg-brand-gradient bg-clip-text text-transparent">
                  Not friendships.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg md:text-xl">
                SplitPe helps you split bills, track shared expenses, and
                settle up with friends and family — keeping your books and
                your bonds equally clear.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#download"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-gradient px-6 py-3.5 text-sm font-bold text-black shadow-lg shadow-splitpe-600/20 transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-splitpe-500 focus:ring-offset-2 sm:px-7"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </a>

                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:px-7"
                >
                  See how it works
                  <ChevronRight className="h-4 w-4" />
                </a>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-mint-600" />
                  Every feature is free — no paywall
                </div>

                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-mint-600" />
                  Delete your account anytime
                </div>
              </div>
            </div>

            {/* Hero Product Preview */}
            <div className="relative mx-auto w-full max-w-xl lg:ml-auto">
              <div className="absolute -inset-4 rounded-[2rem] bg-splitpe-200/50 blur-2xl" />

              <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-4 shadow-card sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Good morning,</p>
                    <p className="text-lg font-bold text-slate-950">
                      Priya 👋
                    </p>
                  </div>

                  <span className="inline-flex items-center rounded-full bg-mint-50 px-3 py-1 text-xs font-semibold text-mint-700">
                    हिसाब भी, दोस्ती भी
                  </span>
                </div>

                <div className="mt-5 rounded-2xl bg-slate-950 p-5 text-white sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">
                        Overall balance
                      </p>
                      <p className="mt-1 text-3xl font-bold">₹4,860</p>
                    </div>

                    <div className="rounded-xl bg-white/10 p-3">
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

                <div className="mt-5 grid grid-cols-4 gap-2">
                  {quickActions.map((action) => {
                    const Icon = action.icon;

                    return (
                      <div
                        key={action.label}
                        className="flex flex-col items-center gap-1.5"
                      >
                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-full shadow-sm ${toneClasses[action.tone]}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <p className="text-center text-[11px] font-semibold text-slate-600">
                          {action.label}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5">
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
                            <Receipt className="h-5 w-5" />
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
            <span className="section-label">
              All free — no paywall
            </span>

            <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              Shared expenses without the spreadsheet headache
            </h2>

            <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">
              Everything below is available to every SplitPe user, always —
              nothing in the app is paywalled.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-splitpe-200 hover:shadow-soft sm:p-7"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-splitpe-50 text-splitpe-600 transition group-hover:bg-brand-gradient group-hover:text-white">
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

      {/* Trust / privacy */}
      <section id="about" className="section-padding bg-slate-50">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <span className="section-label">Why it's different here</span>

            <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              Privacy isn't a footnote at SplitPe — it's the product
            </h2>

            <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">
              Splitting bills means sharing money details with people. We
              built SplitPe so that circle stays exactly as small as you draw
              it, and nothing else.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:mt-16">
            {trust.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-splitpe-50 text-splitpe-600">
                    <Icon className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-950">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
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

      {/* Download / CTA */}
      <section id="download" className="section-padding bg-white">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-splitpe-500/20 blur-3xl" />
            <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-mint-500/10 blur-3xl" />

            <div className="relative mx-auto max-w-3xl text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient text-white">
                <Wallet className="h-7 w-7" />
              </div>

              <h2 className="mt-6 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                Ready to make shared expenses easier?
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
                Join SplitPe and bring clarity to every shared expense. Create
                groups, track spending and settle up without the stress.
              </p>

              <div className="mt-8 flex flex-col items-center gap-3">
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-gradient px-6 py-3.5 text-sm font-bold text-white transition hover:opacity-90"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </button>

                <p className="text-xs font-medium text-slate-500">
                  Coming soon to the Play Store & App Store
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
