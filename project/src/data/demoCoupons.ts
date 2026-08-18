import type { Coupon } from '@/types'

const now = new Date()
const yearAhead = new Date(now)
yearAhead.setFullYear(yearAhead.getFullYear() + 1)

export const DEMO_COUPONS: Coupon[] = [
  {
    id: 'demo-coupon-hosgeldin',
    code: 'HOSGELDIN',
    type: 'percentage',
    value: 10,
    min_order_amount: 0,
    max_discount: 200,
    usage_limit: 10000,
    used_count: 0,
    start_date: now.toISOString(),
    end_date: yearAhead.toISOString(),
    is_active: true,
    created_at: now.toISOString(),
  },
]

export function findDemoCoupon(code: string): Coupon | undefined {
  const normalized = code.trim().toUpperCase()
  return DEMO_COUPONS.find((c) => c.code === normalized && c.is_active)
}
