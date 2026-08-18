-- Satış sonrası stok düşürme (alıcı RLS ile güncelleyemez; SECURITY DEFINER gerekir)

CREATE OR REPLACE FUNCTION public.decrement_products_stock(p_items JSONB)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item JSONB;
  pid UUID;
  qty INT;
BEGIN
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RETURN;
  END IF;

  FOR item IN SELECT value FROM jsonb_array_elements(p_items) AS t(value)
  LOOP
    pid := (item->>'product_id')::UUID;
    qty := COALESCE((item->>'quantity')::INT, 0);

    IF qty <= 0 THEN
      CONTINUE;
    END IF;

    UPDATE products
    SET stock = stock - qty,
        updated_at = NOW()
    WHERE id = pid
      AND stock >= qty;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Yetersiz stok: ürün %', pid;
    END IF;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.restore_products_stock(p_items JSONB)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item JSONB;
  pid UUID;
  qty INT;
BEGIN
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RETURN;
  END IF;

  FOR item IN SELECT value FROM jsonb_array_elements(p_items) AS t(value)
  LOOP
    pid := (item->>'product_id')::UUID;
    qty := COALESCE((item->>'quantity')::INT, 0);

    IF qty <= 0 THEN
      CONTINUE;
    END IF;

    UPDATE products
    SET stock = stock + qty,
        updated_at = NOW()
    WHERE id = pid;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.decrement_products_stock(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.restore_products_stock(JSONB) TO authenticated;
