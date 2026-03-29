export function normalizeAadhaarInput(value: string) {
  return value.replace(/\D/g, '').slice(0, 12)
}

export function formatAadhaarInput(value: string) {
  const digits = normalizeAadhaarInput(value)
  const groups = digits.match(/.{1,4}/g)
  return groups ? groups.join('-') : ''
}
