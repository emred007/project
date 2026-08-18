-- Satıcı başvuru sistemi + admin kullanıcı yönetimi

CREATE TABLE seller_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shop_name TEXT NOT NULL,
  shop_description TEXT,
  phone TEXT NOT NULL,
  tax_id TEXT,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX seller_applications_one_pending_per_user
  ON seller_applications (user_id) WHERE status = 'pending';

ALTER TABLE seller_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_seller_application" ON seller_applications FOR SELECT
  TO authenticated USING (user_id = auth.uid());

CREATE POLICY "insert_own_seller_application" ON seller_applications FOR INSERT
  TO authenticated WITH CHECK (
    user_id = auth.uid()
    AND NOT EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND (role = 'seller' OR role = 'admin' OR is_seller = true)
    )
  );

CREATE POLICY "all_seller_applications_admin" ON seller_applications FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin: tüm kullanıcıları görebilsin / güncelleyebilsin
CREATE POLICY "select_users_admin" ON users FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "update_users_admin" ON users FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Kullanıcı kendi rolünü değiştiremesin
CREATE OR REPLACE FUNCTION prevent_self_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.uid() = NEW.id AND (
    NEW.role IS DISTINCT FROM OLD.role OR
    NEW.is_seller IS DISTINCT FROM OLD.is_seller OR
    NEW.is_admin IS DISTINCT FROM OLD.is_admin
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    ) THEN
      RAISE EXCEPTION 'Rol değişikliği için yetkiniz yok';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_self_role_change ON users;
CREATE TRIGGER prevent_self_role_change
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION prevent_self_role_change();

-- Admin kullanıcı silme (auth.users dahil)
CREATE OR REPLACE FUNCTION admin_delete_user(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Yetkisiz işlem';
  END IF;
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Kendi hesabınızı silemezsiniz';
  END IF;
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_delete_user(UUID) TO authenticated;

-- Satıcı başvurusu onayla
CREATE OR REPLACE FUNCTION admin_approve_seller_application(app_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  app seller_applications%ROWTYPE;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Yetkisiz işlem';
  END IF;

  SELECT * INTO app FROM seller_applications WHERE id = app_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Başvuru bulunamadı';
  END IF;
  IF app.status <> 'pending' THEN
    RAISE EXCEPTION 'Başvuru zaten incelenmiş';
  END IF;

  UPDATE users
  SET role = 'seller', is_seller = true, updated_at = NOW()
  WHERE id = app.user_id;

  UPDATE seller_applications
  SET status = 'approved',
      reviewed_by = auth.uid(),
      reviewed_at = NOW(),
      updated_at = NOW()
  WHERE id = app_id;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_approve_seller_application(UUID) TO authenticated;

-- Satıcı başvurusu reddet
CREATE OR REPLACE FUNCTION admin_reject_seller_application(app_id UUID, reason TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  app seller_applications%ROWTYPE;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Yetkisiz işlem';
  END IF;

  SELECT * INTO app FROM seller_applications WHERE id = app_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Başvuru bulunamadı';
  END IF;
  IF app.status <> 'pending' THEN
    RAISE EXCEPTION 'Başvuru zaten incelenmiş';
  END IF;

  UPDATE seller_applications
  SET status = 'rejected',
      rejection_reason = NULLIF(TRIM(reason), ''),
      reviewed_by = auth.uid(),
      reviewed_at = NOW(),
      updated_at = NOW()
  WHERE id = app_id;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_reject_seller_application(UUID, TEXT) TO authenticated;
