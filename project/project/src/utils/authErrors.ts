const AUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: 'E-posta veya şifre hatalı.',
  email_not_confirmed: 'E-posta adresiniz henüz doğrulanmamış.',
  user_not_found: 'Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı.',
  invalid_grant: 'E-posta veya şifre hatalı.',
  over_request_rate_limit: 'Çok fazla deneme yaptınız. Lütfen bir süre sonra tekrar deneyin.',
  user_banned: 'Hesabınız askıya alınmış. Destek ile iletişime geçin.',
  weak_password: 'Şifre çok zayıf. En az 6 karakter kullanın.',
  email_exists: 'Bu e-posta adresi zaten kayıtlı.',
  signup_disabled: 'Yeni kayıt şu anda kapalı.',
  same_password: 'Yeni şifre mevcut şifrenizle aynı olamaz.',
}

const MESSAGE_PATTERNS: Array<[RegExp, string]> = [
  [/invalid login credentials/i, 'E-posta veya şifre hatalı.'],
  [/invalid email/i, 'Geçersiz e-posta adresi.'],
  [/email not confirmed/i, 'E-posta adresiniz henüz doğrulanmamış.'],
  [/user not found/i, 'Kullanıcı bulunamadı.'],
  [/password.*at least/i, 'Şifre en az 6 karakter olmalıdır.'],
  [/too many requests/i, 'Çok fazla deneme yaptınız. Lütfen bir süre sonra tekrar deneyin.'],
  [/network/i, 'Bağlantı hatası. İnternet bağlantınızı kontrol edin.'],
]

export function translateAuthError(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') return fallback

  const authError = error as { code?: string; message?: string }
  if (authError.code && AUTH_ERROR_MESSAGES[authError.code]) {
    return AUTH_ERROR_MESSAGES[authError.code]
  }

  const message = authError.message ?? ''
  for (const [pattern, turkish] of MESSAGE_PATTERNS) {
    if (pattern.test(message)) return turkish
  }

  return fallback
}
