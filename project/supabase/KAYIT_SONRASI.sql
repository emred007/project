-- ============================================================
-- ADIM 2 — Siteye kayıt olduktan SONRA (TAM_KURULUM'dan sonra)
-- ============================================================
--
-- NEDEN GEREKLİ?
-- Ürünler veritabanında bir "satıcıya" bağlı olmalı.
-- Satıcı = sitede kayıt olan gerçek bir kullanıcı.
-- Önce siteye kayıt olursunuz, sonra kendinizi admin/satıcı
-- yapar ve demo ürünleri hesabınıza bağlarsınız.
--
-- NASIL ÇALIŞTIRILIR?
-- Supabase → SQL Editor → New query
-- Aşağıdaki adımları SIRAYLA yapın (her seferinde ilgili
-- satırları seçip Run, veya hepsini tek seferde Run).
-- ============================================================


-- ── ADIM A: Kayıt olduğunuzu doğrulayın ─────────────────────
-- Sonuç BOŞ gelirse → henüz kimse kayıt olmamış demektir.
-- Önce siteden /kayit ile kayıt olun VEYA
-- Supabase → Authentication → Users → Add user → Create new user
-- (Dashboard URL'niz .env dosyasındaki URL ile aynı proje olmalı!)
--
-- Alternatif kontrol: Supabase sol menü → Authentication → Users
SELECT id, email FROM auth.users;


-- ── ADIM B: Kendinizi admin + satıcı yapın ──────────────────
-- 'orcun.sanli1903@gmail.com' yerine KENDİ e-postanızı yazın.
UPDATE public.users
SET role = 'admin', is_admin = true, is_seller = true
WHERE email = 'orcun.sanli1903@gmail.com';


-- ── ADIM C: Demo ürünleri ekleyin ───────────────────────────
-- 1) ADIM A'daki sonuçtan "id" sütunundaki UUID'yi kopyalayın
--    Örnek: a1b2c3d4-e5f6-7890-abcd-ef1234567890
-- 2) Aşağıdaki satırın başındaki -- işaretlerini silin
-- 3) BURAYA-UUID-YAPISTIR yerine kopyaladığınız UUID'yi yapıştırın
-- 4) Sadece bu satırı seçip Run deyin

-- SELECT seed_demo_products('BURAYA-UUID-YAPISTIR');


-- ── ADIM D: Her şey tamam mı kontrol edin ───────────────────
-- urun_sayisi = 16 olmalı
SELECT COUNT(*) AS urun_sayisi FROM products WHERE status = 'approved';

-- HOSGELDIN kuponu görünmeli
SELECT code, min_order_amount, max_discount FROM coupons WHERE code = 'HOSGELDIN';
