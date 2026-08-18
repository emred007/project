-- Admin rolü geri yükleme (Supabase SQL Editor → Run)
-- E-postayı kendi adresinizle değiştirin

UPDATE public.users
SET
  role = 'admin',
  is_admin = true,
  is_seller = true,
  updated_at = NOW()
WHERE email = 'orcun.sanli1903@gmail.com';

-- Kontrol: role = admin, is_admin = true görünmeli
SELECT id, email, role, is_admin, is_seller
FROM public.users
WHERE email = 'orcun.sanli1903@gmail.com';
