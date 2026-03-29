import Link from 'next/link'

const RISK_COLORS: Record<string, string> = {
  Safe: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Low: 'bg-sky-100 text-sky-700 border-sky-200',
  Medium: 'bg-amber-100 text-amber-700 border-amber-200',
  High: 'bg-orange-100 text-orange-700 border-orange-200',
  Danger: 'bg-red-100 text-red-700 border-red-200',
}

function MockupCard() {
  return (
    <div className="relative w-full max-w-sm mx-auto lg:mx-0 lg:ml-auto">
      <div className="absolute inset-0 -m-4 bg-gradient-to-br from-violet-400/20 to-indigo-400/20 rounded-3xl blur-2xl" />

      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center text-violet-700 dark:text-violet-300 font-bold text-sm">
              AJ
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Ajmal Khan</p>
              <p className="text-xs text-gray-400">Kochi, Kerala</p>
            </div>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${RISK_COLORS['Safe']}`}>
            ✓ Safe
          </span>
        </div>

        <div className="h-px bg-gray-100 dark:bg-white/10" />

        <div className="space-y-2.5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Latest EMI Sale</p>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">I Phone 16 Pro</p>
              <p className="text-xs text-gray-500 mt-0.5">IMEI: 867323•••6472</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-violet-700 dark:text-violet-400">₹21,999</p>
              <p className="text-xs text-gray-400">Bajaj EMI</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1">
            {[
              { label: 'Tenure', value: '12 mo' },
              { label: 'Down Pay', value: '₹2,000' },
              { label: 'Status', value: 'Active' },
            ].map((item) => (
              <div key={item.label} className="bg-gray-50 dark:bg-white/5 rounded-lg p-2 text-center">
                <p className="text-xs text-gray-400">{item.label}</p>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="h-px bg-gray-100 dark:bg-white/10" />

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Payment Balance</p>
            <span className="text-xs font-bold text-emerald-600">+₹500</span>
          </div>
          <div className="flex gap-1.5">
            {[true, true, false, false, false].map((paid, i) => (
              <div
                key={i}
                className={`flex-1 h-1.5 rounded-full ${paid ? 'bg-violet-500' : 'bg-gray-100 dark:bg-white/10'}`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">2 of 5 repaid</p>
        </div>
      </div>

      <div className="absolute -bottom-3 -right-3 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-white/10 px-3 py-2 flex items-center gap-2">
        <span className="text-base">🛡️</span>
        <div>
          <p className="text-xs font-bold text-gray-800 dark:text-white">Fraud Alert</p>
          <p className="text-xs text-gray-400">0 flagged</p>
        </div>
      </div>
    </div>
  )
}

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-violet-50 dark:from-gray-950 dark:via-gray-950 dark:to-indigo-950/40 pt-28 pb-20 sm:pt-36 sm:pb-28">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-violet-100/60 dark:from-violet-900/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-indigo-100/40 dark:from-indigo-900/20 to-transparent rounded-full translate-y-1/2 -translate-x-1/3 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-violet-50 dark:bg-violet-900/30 border border-violet-100 dark:border-violet-800/50 text-violet-700 dark:text-violet-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
              Built for Bajaj EMI retailers in Kerala
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white leading-[1.1] tracking-tight mb-5">
              Stop managing{' '}
              <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Bajaj EMI sales
              </span>{' '}
              on paper
            </h1>

            <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
              Balal Finance helps mobile retailers track EMI sales, customer
              history, and payment tracking — all in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-violet-200 dark:shadow-violet-900/40 hover:shadow-violet-300 hover:-translate-y-0.5 active:translate-y-0"
              >
                Start Free Trial
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 font-semibold px-6 py-3 rounded-xl hover:border-violet-300 dark:hover:border-violet-500 hover:text-violet-700 dark:hover:text-violet-300 transition-all hover:bg-violet-50 dark:hover:bg-violet-900/20"
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="8" cy="8" r="6" />
                  <path d="M6 8l2 2 2-2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                See how it works
              </a>
            </div>

            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-emerald-500" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm3.3 5.3l-4 4a.75.75 0 01-1.06 0l-2-2a.75.75 0 111.06-1.06L7 8.69l3.47-3.47a.75.75 0 111.06 1.06z" />
              </svg>
              No credit card required · 14-day free trial
            </p>
          </div>

          <MockupCard />
        </div>
      </div>
    </section>
  )
}
