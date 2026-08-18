-- Kupon okuma (sepet / checkout için)
-- Supabase SQL Editor → Run

CREATE OR REPLACE FUNCTION public.get_coupon_by_code(p_code TEXT)
RETURNS coupons
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT *
  FROM coupons
  WHERE UPPER(TRIM(code)) = UPPER(TRIM(p_code))
    AND is_active = TRUE
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_coupon_by_code(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_coupon_by_code(TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.increment_coupon_usage(p_coupon_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE coupons
  SET used_count = COALESCE(used_count, 0) + 1
  WHERE id = p_coupon_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_coupon_usage(UUID) TO authenticated;
