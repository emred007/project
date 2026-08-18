-- ============================================================
-- ADIM 3: Hesabınızı admin + satıcı yapın
-- Önce siteden kayıt olun, sonra e-postanızı aşağıya yazın.
-- ============================================================

-- E-postanızı buraya yazın:
-- UPDATE public.users
-- SET role = 'admin', is_admin = true, is_seller = true
-- WHERE email = 'SIZIN@EMAIL.com';

-- Kullanıcı ID'nizi görmek için:
SELECT id, email, role FROM auth.users;

-- Örnek (UUID'yi kendi ID'nizle değiştirin):
-- UPDATE public.users
-- SET role = 'admin', is_admin = true, is_seller = true
-- WHERE id = '00000000-0000-0000-0000-000000000000';
