-- ============================================================
-- ADIM 4: Demo ürünleri veritabanına ekle
-- Önce 02_admin_ve_satici_yap.sql çalıştırılmış olmalı.
-- ============================================================

-- Kendi kullanıcı UUID'nizi buraya yapıştırın:
-- SELECT seed_demo_products('00000000-0000-0000-0000-000000000000');

-- UUID'nizi bulmak için:
SELECT u.id, u.email, p.role, p.is_seller
FROM auth.users u
LEFT JOIN public.users p ON p.id = u.id;
