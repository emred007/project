-- Supabase SQL Editor → Run
-- 1) Admin RLS düzeltmesi  2) Admin rolünü geri yükleme

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated;

DROP POLICY IF EXISTS "select_users_admin" ON users;
CREATE POLICY "select_users_admin" ON users FOR SELECT
  TO authenticated USING (public.is_admin_user());

DROP POLICY IF EXISTS "update_users_admin" ON users;
CREATE POLICY "update_users_admin" ON users FOR UPDATE
  TO authenticated USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

CREATE OR REPLACE FUNCTION prevent_self_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.uid() = NEW.id AND (
    NEW.role IS DISTINCT FROM OLD.role OR
    NEW.is_seller IS DISTINCT FROM OLD.is_seller OR
    NEW.is_admin IS DISTINCT FROM OLD.is_admin
  ) THEN
    IF NOT public.is_admin_user() THEN
      RAISE EXCEPTION 'Rol değişikliği için yetkiniz yok';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'seller_applications'
  ) THEN
    DROP POLICY IF EXISTS "all_seller_applications_admin" ON seller_applications;
    CREATE POLICY "all_seller_applications_admin" ON seller_applications FOR ALL
      TO authenticated USING (public.is_admin_user());
  END IF;
END $$;

-- Admin rolünü geri yükle (e-postayı gerekirse değiştirin)
UPDATE public.users
SET role = 'admin', is_admin = true, is_seller = true, updated_at = NOW()
WHERE email = 'orcun.sanli1903@gmail.com';

SELECT id, email, role, is_admin, is_seller
FROM public.users
WHERE email = 'orcun.sanli1903@gmail.com';
