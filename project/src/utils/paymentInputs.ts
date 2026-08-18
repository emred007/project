export function digitsOnly(value: string, maxLength?: number): string {
  const digits = value.replace(/\D/g, '')
  return maxLength != null ? digits.slice(0, maxLength) : digits
}

export function formatCardNumberInput(value: string): string {
  const digits = digitsOnly(value, 16)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

export function formatExpiryInput(value: string): string {
  const digits = digitsOnly(value, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

export function isValidExpiryDate(value: string): boolean {
  const match = value.match(/^(\d{2})\/(\d{2})$/)
  if (!match) return false
  const month = Number(match[1])
  const year = Number(match[2])
  if (month < 1 || month > 12) return false

  const now = new Date()
  const currentYear = now.getFullYear() % 100
  const currentMonth = now.getMonth() + 1
  if (year < currentYear) return false
  if (year === currentYear && month < currentMonth) return false

  return true
}

export function expiryDateError(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return 'Son kullanma tarihi gerekli'
  if (!/^\d{2}\/\d{2}$/.test(trimmed)) return 'AA/YY formatında girin (ör. 12/28)'

  const match = trimmed.match(/^(\d{2})\/(\d{2})$/)
  if (!match) return 'Geçersiz tarih'
  const month = Number(match[1])
  if (month < 1 || month > 12) return 'Ay 01 ile 12 arasında olmalı'

  if (!isValidExpiryDate(trimmed)) return 'Kartın süresi dolmuş'

  return null
}

export function cardNumberDigits(value: string): string {
  return digitsOnly(value, 16)
}
