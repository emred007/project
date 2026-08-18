# MarketPlace — Supabase Kurulum Rehberi

Bu rehber, sitenin **tamamen Supabase veritabanından** çalışması için gereken adımları anlatır.

---

## 1. Supabase projesi oluştur

1. [https://supabase.com](https://supabase.com) → **New Project**
2. Proje adı: `marketplace` (veya istediğiniz)
3. Database şifresini kaydedin
4. Region: **Frankfurt** veya size en yakın

---

## 2. API anahtarlarını al

**Project Settings → API** bölümünden:

| Alan | Nereye yazılacak |
|------|------------------|
| **Project URL** | `.env` → `VITE_SUPABASE_URL` |
| **anon public** key | `.env` → `VITE_SUPABASE_ANON_KEY` |

Proje kökünde `.env` dosyası oluşturun (`.env.example` dosyasına bakın):

```env
VITE_SUPABASE_URL=https://XXXXXXXX.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **service_role** anahtarını asla frontend'e koymayın. Sadece sunucu tarafında kullanılır.

---

## 3. Veritabanı tablolarını oluştur (SQL)

Supabase Dashboard → **SQL Editor** → **New query**

Aşağıdaki dosyaları **sırayla** çalıştırın (her birini ayrı sorgu olarak yapıştırıp **Run**):

| Sıra | Dosya | Ne yapar |
|------|-------|----------|
| 1 | `migrations/20260613175056_001_initial_schema.sql` | Tablolar (users, products, orders, cart...) |
| 2 | `migrations/20260613175115_002_rls_policies.sql` | Güvenlik kuralları (RLS) |
| 3 | `migrations/20260613175139_003_seed_data.sql` | Kategoriler, bannerlar, kuponlar, kayıt trigger |
| 4 | `migrations/20260614120000_005_seed_products_function.sql` | Ürün ekleme fonksiyonu |
| 5 | `migrations/20260614120100_006_enrichment.sql` | Kategori görselleri, kupon düzeltmesi |
| 6 | `migrations/20260614130000_007_seller_applications.sql` | Satıcı başvuru sistemi, admin kullanıcı silme |

> Eski `004_seed_products.sql` dosyasını **atlayın** — yerine 005 fonksiyonu kullanılıyor.

> **Mevcut projede** satıcı başvuru özelliği için: `scripts/SELLER_BASVURU_KURULUM.sql` dosyasını SQL Editor'de çalıştırın.

---

## 4. Siteye kayıt olun

1. Projeyi çalıştırın: `npm run dev`
2. `/kayit` sayfasından hesap oluşturun
3. E-posta doğrulaması açıksa gelen linki onaylayın

Kayıt olunca `handle_new_user` trigger'ı otomatik `public.users` satırı oluşturur.

---

## 5. Kendinizi admin + satıcı yapın

SQL Editor'de çalıştırın (`scripts/02_admin_ve_satici_yap.sql`):

```sql
-- UUID'nizi bulun
SELECT id, email FROM auth.users;

-- E-postanızla admin yapın (e-postayı değiştirin)
UPDATE public.users
SET role = 'admin', is_admin = true, is_seller = true
WHERE email = 'SIZIN@EMAIL.com';
```

---

## 6. Demo ürünleri ekleyin

SQL Editor'de:

```sql
-- UUID'nizi yapıştırın
SELECT seed_demo_products('BURAYA-UUID-YAPIŞTIR');
```

16 ürün eklenir. `ON CONFLICT` sayesinde tekrar çalıştırmak güvenlidir.

---

## 7. Auth ayarları (önemli)

**Authentication → Providers → Email**:
- Email provider: **Enabled**
- **Confirm email: KAPALI** (geliştirme için önerilir — kapalıyken kayıt sonrası direkt giriş yapılır)
- Confirm email açıksa kullanıcı e-postasındaki onay linkine tıklamadan giriş yapamaz

**Authentication → URL Configuration**:
- Site URL: `http://localhost:5173` (geliştirme)
- Redirect URLs: `http://localhost:5173/**`

Canlıya alınca kendi domain'inizi ekleyin.

---

## 8. Test listesi

| Özellik | Kontrol |
|---------|---------|
| Ana sayfa kategorileri | Supabase `categories` tablosundan gelmeli |
| Ürün listesi | `products` tablosundan |
| Sepete ekle | `cart_items` tablosuna yazmalı |
| HOSGELDIN kuponu | `coupons` tablosundan, indirim görünmeli |
| Sipariş | `orders` tablosuna kayıt |
| Admin panel | `/admin` — ürün onaylama, banner yönetimi |

---

## Veritabanı tabloları

| Tablo | Açıklama |
|-------|----------|
| `users` | Kullanıcı profilleri (auth.users ile bağlı) |
| `categories` | Ürün kategorileri |
| `products` | Ürünler |
| `cart_items` | Sepet |
| `favorites` | Favoriler |
| `orders` | Siparişler |
| `coupons` | İndirim kuponları |
| `banners` | Ana sayfa slider |
| `reviews` | Ürün yorumları |

---

## Sorun giderme

**Ürünler görünmüyor**
→ `SELECT seed_demo_products(...)` çalıştırıldı mı?
→ `products` tablosunda `status = 'approved'` olan kayıt var mı?

**Giriş yapamıyorum**
→ `.env` URL ve anon key doğru mu?
→ Auth → Users'da kullanıcı var mı?

**Kupon çalışmıyor**
→ `coupons` tablosunda `HOSGELDIN` ve `is_active = true` mu?
→ 006 migration çalıştırıldı mı?

**RLS hatası (permission denied)**
→ 002 migration tam çalıştı mı?
→ Kullanıcı giriş yapmış mı?

**Türkçe harfler bozuk görünüyor (FÄ±rsatlarÄ±, TÃ¼m vb.)**
→ Veritabanına yanlış kodlamayla yazılmış metinler vardır.
→ SQL Editor'de `scripts/FIX_TURKCE_METINLER.sql` dosyasını çalıştırın.
→ Sayfayı yenileyin (Ctrl+F5).

---

## Supabase linkinizi paylaştığınızda

Bana şunları gönderin:
1. **Project URL** (`https://xxx.supabase.co`)
2. **anon key** (public — frontend'de zaten görünür)

`.env` dosyanızı birlikte doğrularız ve bağlantıyı test ederiz.

---

## Dosya yapısı

```
supabase/
├── KURULUM.md              ← Bu dosya
├── migrations/             ← SQL migration dosyaları
│   ├── 001_initial_schema.sql
│   ├── 002_rls_policies.sql
│   ├── 003_seed_data.sql
│   ├── 005_seed_products_function.sql
│   └── 006_enrichment.sql
└── scripts/
    ├── FIX_TURKCE_METINLER.sql   ← Bozuk Türkçe metinleri düzeltir
    ├── FIX_KAYIT_TRIGGER.sql
    ├── 02_admin_ve_satici_yap.sql
    └── 03_urunleri_ekle.sql
```
