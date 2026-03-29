import Link from 'next/link'

const included = [
  'Unlimited customer profiles with Aadhaar & 4 contacts',
  '5-level color-coded risk flag system',
  'Full EMI sale records with IMEI tracking',
  'EMI cover payment tracker per customer',
  'Multiple shop management under one account',
  'Cross-shop fraud detection',
  'Customer photo upload',
  'EMI history & repayment tracking',
  '14-day free trial, no credit card required',
]

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20 sm:py-28 bg-slate-50 dark:bg-gray-900/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-widest mb-3">
            Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Simple, honest pricing
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            No confusing tiers. One plan, everything included.
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <div className="relative bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-white/10 shadow-xl shadow-gray-100/60 dark:shadow-black/30 overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 to-indigo-500" />

            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                    Balal Finance
                  </h3>
                  <p className="text-sm text-gray-400 mt-0.5">Full access, all features</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-extrabold text-violet-700 dark:text-violet-400">
                    Custom
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Contact us for pricing</p>
                </div>
              </div>

              <div className="h-px bg-gray-100 dark:bg-white/10 mb-6" />

              <ul className="space-y-3 mb-8">
                {included.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <svg
                      className="w-4 h-4 mt-0.5 text-emerald-500 shrink-0"
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
                className="block w-full text-center bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-violet-100 dark:shadow-violet-900/30 hover:shadow-violet-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                Start 14-day free trial
              </Link>
              <p className="text-center text-xs text-gray-400 mt-3">
                No credit card required. Cancel anytime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
