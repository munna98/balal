import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Balal Finance — EMI Sales Management for Mobile Retailers',
  description:
    'Track Bajaj EMI sales, customer history, emiCover payments, and risk levels — all in one place. Built for mobile retailers in Kerala.',
}

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
