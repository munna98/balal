import Link from 'next/link'

export default function CtaSection() {
  return (
    <section className="py-20 sm:py-28 bg-gradient-to-br from-violet-600 to-indigo-700 dark:from-violet-900 dark:to-indigo-950 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -left-16 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/[0.03]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm font-semibold text-violet-200 uppercase tracking-widest mb-4">
          Get started today
        </p>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-5">
          Ready to take control of your EMI sales?
        </h2>
        <p className="text-lg text-violet-200 mb-10 max-w-2xl mx-auto">
          Join mobile retailers across Kerala who have switched from paper diaries to Balal Finance. Your first 14 days are on us.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/signup"
            className="inline-flex items-center justify-center gap-2 bg-white dark:bg-violet-100 text-violet-700 font-bold px-8 py-3.5 rounded-xl hover:bg-violet-50 transition-all shadow-xl shadow-violet-900/30 hover:-translate-y-0.5 active:translate-y-0"
          >
            Start Free Trial
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <a
            href="https://wa.me/+919999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 border border-white/30 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.117 1.524 5.847L.057 23.927l6.224-1.449A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.65-.497-5.177-1.367l-.371-.22-3.694.861.876-3.604-.242-.382A9.968 9.968 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
            </svg>
            Chat on WhatsApp
          </a>
        </div>

        <p className="text-violet-300 text-xs mt-6">
          No credit card required · Cancel anytime · 14-day free trial
        </p>
      </div>
    </section>
  )
}
