export const APP_NAME = 'Balal Finance'
export const APP_URL = 'https://app.balal.in'
export const MARKETING_URL = 'https://balal.in'
export const SUPPORT_WHATSAPP = 'https://wa.me/91XXXXXXXXXX' // replace with your number
export const TRIAL_DAYS = 14

export const RISK_LEVELS = {
  DANGER:   { label: 'Danger',   level: 1, color: 'bg-red-500',    text: 'text-red-500',    description: 'High fraud risk / Defaulter. Do not sell.' },
  WARNING:  { label: 'Warning',  level: 2, color: 'bg-orange-500', text: 'text-orange-500', description: 'Past payment delays or suspicious links.' },
  NEUTRAL:  { label: 'Neutral',  level: 3, color: 'bg-yellow-400', text: 'text-yellow-400', description: 'New customer / No history yet.' },
  RELIABLE: { label: 'Reliable', level: 4, color: 'bg-green-400',  text: 'text-green-400',  description: 'Good history with at least one completed loan.' },
  SAFE:     { label: 'Safe',     level: 5, color: 'bg-green-600',  text: 'text-green-600',  description: 'Perfect record / Trusted regular customer.' },
} as const

export const DEFAULT_MOBILE_LABELS = {
  mobile2_label: 'Father',
  mobile3_label: 'Mother',
  mobile4_label: 'Friend',
} as const

export const TENURE_MIN = 1
export const TENURE_MAX = 24

export const SUBSCRIPTION_STATUS_LABELS = {
  TRIAL:     { label: 'Trial',     color: 'bg-yellow-400' },
  ACTIVE:    { label: 'Active',    color: 'bg-green-500'  },
  SUSPENDED: { label: 'Suspended', color: 'bg-red-500'    },
} as const
