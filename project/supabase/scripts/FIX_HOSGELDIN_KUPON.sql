-- HOSGELDIN kuponunu düzelt (Supabase SQL Editor → Run)
UPDATE coupons
SET
  min_order_amount = 0,
  max_discount = 200,
  is_active = true,
  end_date = NOW() + INTERVAL '1 year'
WHERE code = 'HOSGELDIN';

SELECT code, type, value, min_order_amount, max_discount, is_active, end_date
FROM coupons
WHERE code = 'HOSGELDIN';
