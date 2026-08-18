import type { Coupon } from '@/types'
import { supabase } from '@/plugins/supabase'

export async function fetchCouponByCode(code: string): Promise<Coupon | null> {
  const normalized = code.trim().toUpperCase()
  if (!normalized) return null

  const { data: rpcData, error: rpcError } = await supabase.rpc('get_coupon_by_code', {
    p_code: normalized,
  })

  if (!rpcError && rpcData) {
    return rpcData as Coupon
  }

  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('is_active', true)
    .ilike('code', normalized)
    .maybeSingle()

  if (!error && data) {
    return data as Coupon
  }

  return null
}

export function normalizeCoupon(raw: Coupon): Coupon {
  return {
    ...raw,
    value: Number(raw.value),
    min_order_amount: raw.min_order_amount != null ? Number(raw.min_order_amount) : 0,
    max_discount: raw.max_discount != null ? Number(raw.max_discount) : undefined,
    usage_limit: raw.usage_limit != null ? Number(raw.usage_limit) : undefined,
    used_count: Number(raw.used_count ?? 0),
  }
}

export function validateCouponForCart(
  rawCoupon: Coupon,
  subtotal: number
): { ok: true; coupon: Coupon } | { ok: false; error: string } {
  const coupon = normalizeCoupon(rawCoupon)
  const now = new Date()
  const startDate = new Date(coupon.start_date)
  const endDate = new Date(coupon.end_date)

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return { ok: false, error: 'Kupon tarih bilgisi geçersiz' }
  }

  if (now < startDate) {
    return { ok: false, error: 'Kupon henüz geçerli değil' }
  }

  if (now > endDate) {
    return { ok: false, error: 'Kupon süresi dolmuş' }
  }

  if (coupon.min_order_amount > 0 && subtotal < coupon.min_order_amount) {
    return {
      ok: false,
      error: `Minimum sipariş tutarı ${coupon.min_order_amount.toLocaleString('tr-TR')} TL olmalıdır`,
    }
  }

  if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
    return { ok: false, error: 'Kupon kullanım limiti dolmuş' }
  }

  if (Number.isNaN(coupon.value) || coupon.value <= 0) {
    return { ok: false, error: 'Kupon değeri geçersiz' }
  }

  return { ok: true, coupon }
}

export function calculateCouponDiscount(coupon: Coupon, subtotal: number): number {
  const normalized = normalizeCoupon(coupon)

  if (normalized.type === 'percentage') {
    const amount = subtotal * (normalized.value / 100)
    if (normalized.max_discount != null && !Number.isNaN(normalized.max_discount)) {
      return Math.min(amount, normalized.max_discount)
    }
    return amount
  }

  return Math.min(normalized.value, subtotal)
}
