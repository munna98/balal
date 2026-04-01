type SaleWhatsAppMessageInput = {
  customerName: string
  shopName?: string | null
  shopPhone?: string | null
  loanIssueDate: string | Date
  deviceName: string
  deviceAmount: number
  accessoriesAmount: number
  downPayment: number
  loanAmount: number
  emiAmount: number
  tenureMonths: number
  imei?: string | null
  referenceNumber?: string | null
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatMessageDate(value: string | Date) {
  const date = typeof value === 'string' ? new Date(value) : value

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function normalizeWhatsAppNumber(phone: string) {
  const digits = phone.replace(/\D/g, '')

  if (digits.length === 10) return `91${digits}`
  if (digits.length === 12 && digits.startsWith('91')) return digits

  return digits
}

export function isShareableWhatsAppNumber(phone: string) {
  const normalized = normalizeWhatsAppNumber(phone)
  return normalized.length >= 10
}

export function buildSaleWhatsAppMessage(input: SaleWhatsAppMessageInput) {
  const productTotal = input.deviceAmount + input.accessoriesAmount

  const lines = [
    `Hello ${input.customerName},`,
    '',
    'Your sale has been created successfully.',
    `Device: ${input.deviceName}`,
    `Sale date: ${formatMessageDate(input.loanIssueDate)}`,
    `Product total: Rs. ${formatMoney(productTotal)}`,
    `Down payment: Rs. ${formatMoney(input.downPayment)}`,
    `Loan amount: Rs. ${formatMoney(input.loanAmount)}`,
    `EMI: Rs. ${formatMoney(input.emiAmount)} x ${input.tenureMonths} months`,
  ]

  if (input.imei) {
    lines.push(`IMEI: ${input.imei}`)
  }

  if (input.referenceNumber) {
    lines.push(`Reference no: ${input.referenceNumber}`)
  }

  if (input.shopPhone) {
    lines.push(`Shop contact: ${input.shopPhone}`)
  }

  lines.push('')
  lines.push(input.shopName ? `Thank you from "${input.shopName}"` : 'Thank you.')

  return lines.join('\n')
}

export function buildWhatsAppShareUrl(phone: string, message: string) {
  const normalized = normalizeWhatsAppNumber(phone)
  const params = new URLSearchParams({
    phone: normalized,
    text: message,
  })

  return `https://wa.me/?${params.toString()}`
}
