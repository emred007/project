export function digitsOnly(value: string, maxLength?: number): string {
  const digits = value.replace(/\D/g, '')
  return maxLength != null ? digits.slice(0, maxLength) : digits
}

export function formatTurkishPhoneInput(value: string): string {
  let digits = digitsOnly(value)
  if (digits.startsWith('90') && digits.length > 10) {
    digits = digits.slice(2)
  }
  if (digits.length > 0 && digits[0] !== '0') {
    digits = `0${digits}`
  }
  return digits.slice(0, 11)
}

export function isValidTurkishPhone(value: string): boolean {
  return /^05\d{9}$/.test(digitsOnly(value, 11))
}

export function formatTcKimlikInput(value: string): string {
  let digits = digitsOnly(value, 11)
  if (digits.length > 0 && digits[0] === '0') {
    digits = digits.slice(1)
  }
  return digits.slice(0, 11)
}

export function formatTaxIdOrTcInput(value: string): string {
  return digitsOnly(value, 11)
}

export function isValidTcKimlik(value: string): boolean {
  const digits = formatTcKimlikInput(value)
  if (!/^[1-9]\d{10}$/.test(digits)) return false

  const d = digits.split('').map(Number)
  const oddSum = d[0] + d[2] + d[4] + d[6] + d[8]
  const evenSum = d[1] + d[3] + d[5] + d[7]
  const check10 = (oddSum * 7 - evenSum) % 10
  if (check10 !== d[9]) return false

  const check11 = d.slice(0, 10).reduce((sum, n) => sum + n, 0) % 10
  return check11 === d[10]
}

/** Vergi no (10 hane) veya TC kimlik (11 hane) — opsiyonel alanlar için */
export function isValidTaxIdOrTc(value: string): boolean {
  const digits = digitsOnly(value)
  if (!digits) return true
  if (digits.length === 10) return /^\d{10}$/.test(digits)
  if (digits.length === 11) return isValidTcKimlik(digits)
  return false
}

export function blockNonDigitKey(event: KeyboardEvent) {
  const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End']
  if (allowed.includes(event.key) || event.ctrlKey || event.metaKey) return
  if (!/^\d$/.test(event.key)) {
    event.preventDefault()
  }
}
