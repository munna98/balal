// TODO: Replace dummy testimonials below with real shop owner quotes once collected.

const testimonials = [
  {
    quote:
      "Before Balal Finance, I used to keep all my EMI sales in a diary. I lost track of who owed me what. Now everything is in one place and I can check any customer's history in seconds.",
    name: 'Muhammed Rashid',
    shop: 'Al Ameen Mobiles, Malappuram',
    initials: 'MR',
    color: 'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300',
  },
  {
    quote:
      "The risk badge system is a game changer. I had a customer who defaulted at my brother's shop — Balal flagged him as High Risk when he came to mine. Saved me from a big mistake.",
    name: 'Anvar Sadiq',
    shop: 'Star Mobile World, Kozhikode',
    initials: 'AS',
    color: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300',
  },
  {
    quote:
      "The advance tracker is exactly what I needed. I used to forget how much extra I paid for customers' EMIs and then struggle to collect. Now I just open the app and it's all there.",
    name: 'Faisal Rahman K.',
    shop: 'City Mobile, Thrissur',
    initials: 'FR',
    color: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300',
  },
]

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 sm:py-28 bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-widest mb-3">
            Testimonials
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Retailers love Balal Finance
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Shop owners across Kerala are replacing paper diaries with Balal Finance.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-slate-50 dark:bg-gray-900 border border-gray-100 dark:border-white/10 rounded-2xl p-6 flex flex-col gap-4 hover:shadow-md dark:hover:shadow-black/20 hover:border-gray-200 dark:hover:border-white/20 transition-all"
            >
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.08 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.518-4.674z" />
                  </svg>
                ))}
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-white/10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${t.color}`}>
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.shop}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
