export type EmiCoverStatusTab = 'all' | 'outstanding' | 'settled'

export type AgingFilter = 'all' | '0-30' | '30-60' | '60-90' | '90plus'

export function parseAging(raw: string | undefined): AgingFilter {
  if (
    raw === '0-30' ||
    raw === '30-60' ||
    raw === '60-90' ||
    raw === '90plus'
  ) {
    return raw
  }
  return 'all'
}

export function parseTab(raw: string | undefined): EmiCoverStatusTab {
  if (raw === 'settled' || raw === 'all') return raw
  return 'outstanding'
}

export function emiCoversListPath(tab: EmiCoverStatusTab, aging: AgingFilter) {
  const q = new URLSearchParams()
  q.set('tab', tab)
  if (aging !== 'all') q.set('aging', aging)
  const query = q.toString()
  return query ? `/emi-covers?${query}` : '/emi-covers'
}
