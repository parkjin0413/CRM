export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

/** Formats digits-only input into a hyphenated Korean phone number for display. */
export function formatPhone(phone: string): string {
  const digits = normalizePhone(phone)

  if (digits.length === 11) {
    return digits.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
  }
  if (digits.length === 10) {
    return digits.startsWith('02')
      ? digits.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3')
      : digits.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
  }
  if (digits.length === 9) {
    return digits.startsWith('02')
      ? digits.replace(/(\d{2})(\d{3})(\d{4})/, '$1-$2-$3')
      : digits.replace(/(\d{3})(\d{2})(\d{4})/, '$1-$2-$3')
  }
  if (digits.length === 8) {
    return digits.replace(/(\d{4})(\d{4})/, '$1-$2')
  }
  return digits
}
