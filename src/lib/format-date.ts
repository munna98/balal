/** Fixed locale so SSR and browser produce the same string (avoids hydration mismatches). */
const DATE_LOCALE = 'en-IN'

const dateOpts: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
}

export function formatLocaleDate(isoOrDate: string | Date) {
  const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate
  return d.toLocaleDateString(DATE_LOCALE, dateOpts)
}
