import Link from 'next/link'

const plans = [
  {
    name: 'Monthly Plan',
    price: '₹399',
    cadence: '/ month',
    description: 'Flexible, pay-as-you-go access.',
    footnote: 'No credit card required.',
    accent: 'from-violet-500 to-indigo-500',
    featured: false,
    features: [
      '1-Click WhatsApp Reminders',
      'Unlimited Customer Ledger',
      'Live Cross-Shop Fraud Alerts',
      '5-Level Color-Coded Risk Flags',
      'Secure Aadhaar storage',
      '4 Emergency Contacts per Customer',
      'Full IMEI & Sale Tracking',
      'Multi-Shop Management',
      'Cloud Backup & Photo Uploads',
    ],
  },
  {
    name: 'Yearly Plan (Best Value)',
    price: '₹3,999',
    cadence: '/ year',
    description: '2 Months Free — Our most popular plan.',
    footnote: 'Save ₹789 compared to monthly.',
    accent: 'from-amber-500 via-orange-500 to-rose-500',
    featured: true,
    features: [
      '1-Click WhatsApp Reminders',
      'Unlimited Customer Ledger',
      'Live Cross-Shop Fraud Alerts',
      '5-Level Color-Coded Risk Flags',
      'Secure Aadhaar storage',
      '4 Emergency Contacts per Customer',
      'Full IMEI & Sale Tracking',
      'Multi-Shop Management',
      'Cloud Backup & Photo Uploads',
    ],
  },
] as const

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20 sm:py-28 bg-slate-50 dark:bg-gray-900/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-widest mb-3">
            Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Simple, Professional Pricing
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Stop losing money to bad EMI sales. Switch from paper to Balal Finance today.
          </p>
        </div>

        <div className="grid max-w-6xl mx-auto gap-8 lg:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative overflow-hidden rounded-3xl border bg-white shadow-xl shadow-gray-100/60 dark:bg-gray-900 dark:shadow-black/30 ${
                plan.featured
                  ? 'border-orange-200 dark:border-orange-400/30 lg:-translate-y-2'
                  : 'border-gray-100 dark:border-white/10'
              }`}
            >
              <div className={`h-1.5 w-full bg-gradient-to-r ${plan.accent}`} />

              <div className="p-8">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                      {plan.name}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {plan.description}
                    </p>
                  </div>
                  {plan.featured ? (
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
                      Best Value
                    </span>
                  ) : null}
                </div>

                <div className="mb-6">
                  <p className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                    {plan.price}
                    <span className="text-lg font-semibold text-gray-500 dark:text-gray-400">
                      {' '}
                      {plan.cadence}
                    </span>
                  </p>
                </div>

                <div className="mb-6 h-px bg-gray-100 dark:bg-white/10" />

                <div className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                  Features Included:
                </div>

                <ul className="mb-8 space-y-3">
                  {plan.features.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <svg
                        className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                      >
                        <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm3.3 5.3l-4 4a.75.75 0 01-1.06 0l-2-2a.75.75 0 111.06-1.06L7 8.69l3.47-3.47a.75.75 0 111.06 1.06z" />
                      </svg>
                      <span className="text-sm text-gray-600 dark:text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/auth/signup"
                  className={`block w-full rounded-xl px-6 py-3 text-center font-semibold text-white transition-all hover:-translate-y-0.5 active:translate-y-0 ${
                    plan.featured
                      ? 'bg-orange-500 shadow-lg shadow-orange-100 hover:bg-orange-600 dark:shadow-orange-900/30'
                      : 'bg-violet-600 shadow-lg shadow-violet-100 hover:bg-violet-700 dark:shadow-violet-900/30'
                  }`}
                >
                  Start 14-Day Free Trial
                </Link>
                <p className="mt-3 text-center text-xs text-gray-400">{plan.footnote}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
