import type { Plan, Prisma, RiskLevel, SubscriptionStatus } from '@prisma/client'

export type Decimal = Prisma.Decimal

export type Tenant = {
  id: string
  supabase_user_id: string
  name: string
  phone: string | null
  plan: Plan
  shop_limit: number
  subscription_status: SubscriptionStatus
  trial_ends_at: Date | null
  subscribed_at: Date | null
  admin_notes: string | null
  created_at: Date
}

export type Shop = {
  id: string
  tenant_id: string
  name: string
  address: string | null
  phone: string | null
  is_active: boolean
  created_at: Date
}

export type Customer = {
  id: string
  tenant_id: string
  name: string
  aadhaar: string | null
  photo_url: string | null
  mobile1: string
  mobile2: string | null
  mobile2_label: string | null
  mobile3: string | null
  mobile3_label: string | null
  mobile4: string | null
  mobile4_label: string | null
  risk_level: RiskLevel
  risk_score: number | null
  created_at: Date
}

export type Sale = {
  id: string
  shop_id: string
  customer_id: string
  loan_issue_date: Date
  down_payment: Decimal
  loan_amount: Decimal
  tenure_months: number
  emi_amount: Decimal
  device_name: string
  imei: string | null
  reference_number: string | null
  co_name: string | null
  co_mobile: string | null
  is_second_party: boolean
  second_party_customer_id: string | null
  notes: string | null
  created_at: Date
}

export type Payment = {
  id: string
  shop_id: string
  sale_id: string
  paid_date: Date
  amount_paid: Decimal
  repaid_date: Date | null
  amount_repaid: Decimal | null
  note: string | null
  created_at: Date
}

export type RiskLevelKey = 'DANGER' | 'WARNING' | 'NEUTRAL' | 'RELIABLE' | 'SAFE'
export type SubscriptionStatusKey = 'TRIAL' | 'ACTIVE' | 'SUSPENDED'

export type ShopWithStats = Shop & {
  _count: { sales: number }
  total_payment_balance: number
}

export type CustomerWithSales = Customer & {
  sales: Sale[]
  total_payment_balance: number
}

export type SaleWithPayments = Sale & {
  payments: Payment[]
  total_paid: number
  total_repaid: number
  balance: number
  customer: Customer
  second_party_customer: Customer | null
}

export type TenantWithShops = Tenant & {
  shops: Shop[]
  _count: { customers: number; shops: number }
}
