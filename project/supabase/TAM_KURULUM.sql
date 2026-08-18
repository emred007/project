-- ============================================================
-- MarketPlace — TAM VERİTABANI KURULUMU
-- Supabase Dashboard → SQL Editor → New query
-- Bu dosyanın TAMAMINI yapıştır → Run
--
-- ⚠️  Sadece YENİ / BOŞ Supabase projesinde çalıştırın.
--     Daha önce tablo oluşturduysanız hata alırsınız.
--
-- URL ve anon key SQL'e yazılmaz — proje .env dosyasına gider.
-- ============================================================


-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  username TEXT UNIQUE,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'seller', 'admin')),
  is_seller BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  discount_price DECIMAL(10,2),
  stock INT NOT NULL DEFAULT 0,
  sku TEXT UNIQUE,
  brand TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  images TEXT[] DEFAULT '{}',
  specifications JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,
  is_bestseller BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  images TEXT[] DEFAULT '{}',
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

-- Addresses table
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  address TEXT NOT NULL,
  postal_code TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cart items table
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Favorites table
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  items JSONB NOT NULL DEFAULT '[]',
  shipping_address JSONB NOT NULL,
  billing_address JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  coupon_code TEXT,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coupons table
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2),
  max_discount DECIMAL(10,2),
  usage_limit INT,
  used_count INT DEFAULT 0,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Banners table
CREATE TABLE banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  button_text TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_products_bestseller ON products(is_bestseller) WHERE is_bestseller = TRUE;
CREATE INDEX idx_products_new ON products(is_new) WHERE is_new = TRUE;
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_cart_user ON cart_items(user_id);
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_addresses_user ON addresses(user_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users RLS
CREATE POLICY "select_own_user" ON users FOR SELECT
  TO authenticated USING (auth.uid() = id);
CREATE POLICY "update_own_user" ON users FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "insert_own_user" ON users FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

-- Categories (public read, admin write)
CREATE POLICY "select_categories_public" ON categories FOR SELECT
  TO PUBLIC USING (is_active = TRUE);
CREATE POLICY "all_categories_admin" ON categories FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Products (public read approved, seller/admin write)
CREATE POLICY "select_products_approved" ON products FOR SELECT
  TO PUBLIC USING (status = 'approved');
CREATE POLICY "select_own_products" ON products FOR SELECT
  TO authenticated USING (seller_id = auth.uid());
CREATE POLICY "insert_products_seller" ON products FOR INSERT
  TO authenticated WITH CHECK (seller_id = auth.uid());
CREATE POLICY "update_own_products" ON products FOR UPDATE
  TO authenticated USING (seller_id = auth.uid()) WITH CHECK (seller_id = auth.uid());
CREATE POLICY "delete_own_products" ON products FOR DELETE
  TO authenticated USING (seller_id = auth.uid());
CREATE POLICY "all_products_admin" ON products FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Reviews (public read, user write own)
CREATE POLICY "select_reviews_public" ON reviews FOR SELECT
  TO PUBLIC USING (TRUE);
CREATE POLICY "insert_reviews_user" ON reviews FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "update_own_reviews" ON reviews FOR UPDATE
  TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "delete_own_reviews" ON reviews FOR DELETE
  TO authenticated USING (user_id = auth.uid());

-- Addresses (user own)
CREATE POLICY "select_own_addresses" ON addresses FOR SELECT
  TO authenticated USING (user_id = auth.uid());
CREATE POLICY "insert_own_addresses" ON addresses FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "update_own_addresses" ON addresses FOR UPDATE
  TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "delete_own_addresses" ON addresses FOR DELETE
  TO authenticated USING (user_id = auth.uid());

-- Cart items (user own)
CREATE POLICY "select_own_cart" ON cart_items FOR SELECT
  TO authenticated USING (user_id = auth.uid());
CREATE POLICY "insert_own_cart" ON cart_items FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "update_own_cart" ON cart_items FOR UPDATE
  TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "delete_own_cart" ON cart_items FOR DELETE
  TO authenticated USING (user_id = auth.uid());

-- Favorites (user own)
CREATE POLICY "select_own_favorites" ON favorites FOR SELECT
  TO authenticated USING (user_id = auth.uid());
CREATE POLICY "insert_own_favorites" ON favorites FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "delete_own_favorites" ON favorites FOR DELETE
  TO authenticated USING (user_id = auth.uid());

-- Orders (user own, admin all)
CREATE POLICY "select_own_orders" ON orders FOR SELECT
  TO authenticated USING (user_id = auth.uid());
CREATE POLICY "insert_own_orders" ON orders FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "update_own_orders" ON orders FOR UPDATE
  TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "all_orders_admin" ON orders FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Coupons (public read active, admin write)
CREATE POLICY "select_active_coupons" ON coupons FOR SELECT
  TO PUBLIC USING (is_active = TRUE);
CREATE POLICY "all_coupons_admin" ON coupons FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Banners (public read active, admin write)
CREATE POLICY "select_active_banners" ON banners FOR SELECT
  TO PUBLIC USING (is_active = TRUE);
CREATE POLICY "all_banners_admin" ON banners FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Notifications (user own)
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT
  TO authenticated USING (user_id = auth.uid());
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE
  TO authenticated USING (user_id = auth.uid());

-- Insert default categories
INSERT INTO categories (id, name, slug, description, sort_order, is_active) VALUES
('11111111-1111-1111-1111-111111111001', 'Elektronik', 'elektronik', 'Elektronik ürünler', 1, true),
('11111111-1111-1111-1111-111111111002', 'Moda', 'moda', 'Giyim ve aksesuar', 2, true),
('11111111-1111-1111-1111-111111111003', 'Ev & Yaşam', 'ev-yasam', 'Ev dekorasyon ve yaşam ürünleri', 3, true),
('11111111-1111-1111-1111-111111111004', 'Spor', 'spor', 'Spor ve outdoor ürünleri', 4, true),
('11111111-1111-1111-1111-111111111005', 'Kozmetik', 'kozmetik', 'Güzellik ve kişisel bakım', 5, true),
('11111111-1111-1111-1111-111111111006', 'Kitap', 'kitap', 'Kitap ve dergi', 6, true),
('11111111-1111-1111-1111-111111111007', 'Oyuncak', 'oyuncak', 'Oyuncak ve oyun', 7, true),
('11111111-1111-1111-1111-111111111008', 'Otomotiv', 'otomotiv', 'Otomotiv ve aksesuar', 8, true);

-- Insert subcategories
INSERT INTO categories (id, name, slug, parent_id, sort_order, is_active) VALUES
('22222222-2222-2222-2222-222222222001', 'Cep Telefonu', 'cep-telefonu', '11111111-1111-1111-1111-111111111001', 1, true),
('22222222-2222-2222-2222-222222222002', 'Laptop', 'laptop', '11111111-1111-1111-1111-111111111001', 2, true),
('22222222-2222-2222-2222-222222222003', 'Tablet', 'tablet', '11111111-1111-1111-1111-111111111001', 3, true),
('22222222-2222-2222-2222-222222222004', 'Aksesuar', 'aksesuar', '11111111-1111-1111-1111-111111111001', 4, true),
('22222222-2222-2222-2222-222222222005', 'Kadın Giyim', 'kadin-giyim', '11111111-1111-1111-1111-111111111002', 1, true),
('22222222-2222-2222-2222-222222222006', 'Erkek Giyim', 'erkek-giyim', '11111111-1111-1111-1111-111111111002', 2, true),
('22222222-2222-2222-2222-222222222007', 'Ayakkabı', 'ayakkabi', '11111111-1111-1111-1111-111111111002', 3, true),
('22222222-2222-2222-2222-222222222008', 'Çanta', 'canta', '11111111-1111-1111-1111-111111111002', 4, true);

-- Insert demo banners
INSERT INTO banners (id, title, subtitle, image_url, link_url, button_text, sort_order, is_active) VALUES
('33333333-3333-3333-3333-333333333001', 'Yeni Sezon Fırsatları', 'Tüm moda ürünlerde %50''ye varan indirim!', 'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', '/kategori/moda', 'Hemen Al', 1, true),
('33333333-3333-3333-3333-333333333002', 'Elektronik Festivali', 'En yeni teknolojik ürünler burada!', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1920&q=80', '/kategori/elektronik', 'Keşfet', 2, true);

-- Insert demo coupons
INSERT INTO coupons (code, type, value, min_order_amount, max_discount, start_date, end_date, is_active) VALUES
('HOSGELDIN', 'percentage', 10, 200, 50, NOW(), NOW() + INTERVAL '1 year', true),
('KARGO_UCRETSIZ', 'fixed', 29.99, 300, NULL, NOW(), NOW() + INTERVAL '6 months', true);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Demo ürünleri ekleyen fonksiyon (satıcı UUID gerekir)
CREATE OR REPLACE FUNCTION public.seed_demo_products(p_seller_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted_count INTEGER;
BEGIN
  IF p_seller_id IS NULL THEN
    RAISE EXCEPTION 'Satıcı UUID boş olamaz';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_seller_id) THEN
    RAISE EXCEPTION 'users tablosunda bu UUID bulunamadı. Önce siteye kayıt olun.';
  END IF;

  INSERT INTO products (
    id, name, slug, description, price, discount_price, stock, sku, brand,
    category_id, seller_id, images, status, rating, review_count,
    is_featured, is_bestseller, is_new
  ) VALUES
  ('44444444-4444-4444-4444-444444444001', 'iPhone 15 Pro 256GB', 'iphone-15-pro-256gb', 'A17 Pro çip, titanyum tasarım, 48MP kamera.', 64999, NULL, 45, 'IPH15P-256', 'Apple', '11111111-1111-1111-1111-111111111001', p_seller_id, ARRAY['https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=600'], 'approved', 4.9, 342, true, true, true),
  ('44444444-4444-4444-4444-444444444002', 'Samsung Galaxy S24 Ultra', 'samsung-galaxy-s24-ultra', 'S Pen destekli amiral gemisi telefon.', 54999, 49999, 32, 'SGS24U-512', 'Samsung', '11111111-1111-1111-1111-111111111001', p_seller_id, ARRAY['https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=600'], 'approved', 4.8, 256, true, true, false),
  ('44444444-4444-4444-4444-444444444003', 'MacBook Air M3 13"', 'macbook-air-m3-13', 'Ultra ince, güçlü M3 işlemci, 18 saat pil.', 42999, NULL, 18, 'MBA-M3-13', 'Apple', '11111111-1111-1111-1111-111111111001', p_seller_id, ARRAY['https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600'], 'approved', 4.7, 189, true, false, true),
  ('44444444-4444-4444-4444-444444444004', 'Sony WH-1000XM5 Kulaklık', 'sony-wh-1000xm5', 'Industry leading gürültü engelleme.', 12999, 10999, 67, 'SONY-XM5', 'Sony', '11111111-1111-1111-1111-111111111001', p_seller_id, ARRAY['https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=600'], 'approved', 4.9, 512, true, true, false),
  ('44444444-4444-4444-4444-444444444005', 'Nike Air Max 270', 'nike-air-max-270', 'Günlük kullanım için konforlu spor ayakkabı.', 4999, 3499, 120, 'NIKE-AM270', 'Nike', '11111111-1111-1111-1111-111111111004', p_seller_id, ARRAY['https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=600'], 'approved', 4.6, 890, true, true, false),
  ('44444444-4444-4444-4444-444444444006', 'Adidas Originals Hoodie', 'adidas-originals-hoodie', 'Pamuklu, rahat kesim kapüşonlu sweatshirt.', 2499, NULL, 85, 'ADID-HOOD', 'Adidas', '11111111-1111-1111-1111-111111111002', p_seller_id, ARRAY['https://images.pexels.com/photos/7671166/pexels-photo-7671166.jpeg?auto=compress&cs=tinysrgb&w=600'], 'approved', 4.5, 234, true, false, true),
  ('44444444-4444-4444-4444-444444444007', 'Dyson V15 Detect Süpürge', 'dyson-v15-detect', 'Lazer toz algılama teknolojisi.', 24999, 21999, 14, 'DYS-V15', 'Dyson', '11111111-1111-1111-1111-111111111003', p_seller_id, ARRAY['https://images.pexels.com/photos/4108710/pexels-photo-4108710.jpeg?auto=compress&cs=tinysrgb&w=600'], 'approved', 4.8, 167, true, true, false),
  ('44444444-4444-4444-4444-444444444008', 'Xiaomi Redmi Note 13 Pro', 'xiaomi-redmi-note-13-pro', '200MP kamera, 120Hz AMOLED ekran.', 14999, NULL, 95, 'XM-RN13P', 'Xiaomi', '11111111-1111-1111-1111-111111111001', p_seller_id, ARRAY['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80'], 'approved', 4.4, 445, true, true, true),
  ('44444444-4444-4444-4444-444444444009', 'L''Oréal Paris Revitalift Serum', 'loreal-revitalift-serum', 'Anti-aging cilt bakım serumu 30ml.', 899, NULL, 200, 'LOR-REV30', 'L''Oréal', '11111111-1111-1111-1111-111111111005', p_seller_id, ARRAY['https://images.pexels.com/photos/3785147/pexels-photo-3785147.jpeg?auto=compress&cs=tinysrgb&w=600'], 'approved', 4.3, 678, false, true, true),
  ('44444444-4444-4444-4444-444444444010', 'Lenovo IdeaPad Gaming 3', 'lenovo-ideapad-gaming-3', 'RTX 4050, 144Hz ekran, oyun laptopu.', 32999, NULL, 22, 'LEN-IPG3', 'Lenovo', '11111111-1111-1111-1111-111111111001', p_seller_id, ARRAY['https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600'], 'approved', 4.5, 98, false, true, true),
  ('44444444-4444-4444-4444-444444444011', 'Zara Oversize Blazer Ceket', 'zara-oversize-blazer', 'Şık oversize kesim blazer ceket.', 3299, NULL, 40, 'ZARA-BLZ', 'Zara', '11111111-1111-1111-1111-111111111002', p_seller_id, ARRAY['https://images.pexels.com/photos/2983464/pexels-photo-2983464.jpeg?auto=compress&cs=tinysrgb&w=600'], 'approved', 4.2, 56, false, false, true),
  ('44444444-4444-4444-4444-444444444012', 'Philips Airfryer XXL', 'philips-airfryer-xxl', 'Yağsız pişirme, 6.2L kapasite.', 8999, 7499, 55, 'PHI-AFXXL', 'Philips', '11111111-1111-1111-1111-111111111003', p_seller_id, ARRAY['https://images.pexels.com/photos/4493661/pexels-photo-4493661.jpeg?auto=compress&cs=tinysrgb&w=600'], 'approved', 4.7, 1203, false, true, false),
  ('44444444-4444-4444-4444-444444444013', 'Under Armour Spor Tayt', 'under-armour-spor-tayt', 'Nefes alabilir kumaş, yüksek bel.', 1899, NULL, 75, 'UA-TAYT', 'Under Armour', '11111111-1111-1111-1111-111111111004', p_seller_id, ARRAY['https://images.pexels.com/photos/3076516/pexels-photo-3076516.jpeg?auto=compress&cs=tinysrgb&w=600'], 'approved', 4.4, 312, false, true, true),
  ('44444444-4444-4444-4444-444444444014', 'Kindle Paperwhite 16GB', 'kindle-paperwhite-16gb', 'Su geçirmez e-okuyucu, ayarlanabilir sıcaklık.', 5499, NULL, 38, 'KIN-PW16', 'Amazon', '11111111-1111-1111-1111-111111111006', p_seller_id, ARRAY['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'], 'approved', 4.8, 445, false, false, true),
  ('44444444-4444-4444-4444-444444444015', 'LEGO Star Wars X-Wing', 'lego-star-wars-xwing', '734 parça, koleksiyonluk set.', 3999, NULL, 28, 'LEGO-XWING', 'LEGO', '11111111-1111-1111-1111-111111111007', p_seller_id, ARRAY['https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=600'], 'approved', 4.9, 89, false, true, true),
  ('44444444-4444-4444-4444-444444444016', 'Bosch Akü Şarj Cihazı', 'bosch-aku-sarj-cihazi', '12V/24V uyumlu akıllı şarj.', 3499, NULL, 42, 'BOS-CHG', 'Bosch', '11111111-1111-1111-1111-111111111008', p_seller_id, ARRAY['https://images.pexels.com/photos/3807277/pexels-photo-3807277.jpeg?auto=compress&cs=tinysrgb&w=600'], 'approved', 4.6, 134, false, false, true)
  ON CONFLICT (slug) DO NOTHING;

  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  RETURN inserted_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.seed_demo_products(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.seed_demo_products(UUID) TO service_role;


-- Kategori görselleri
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80' WHERE slug = 'elektronik';
UPDATE categories SET image_url = 'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE slug = 'moda';
UPDATE categories SET image_url = 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE slug = 'ev-yasam';
UPDATE categories SET image_url = 'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE slug = 'spor';
UPDATE categories SET image_url = 'https://images.pexels.com/photos/3685530/pexels-photo-3685530.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE slug = 'kozmetik';
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80' WHERE slug = 'kitap';
UPDATE categories SET image_url = 'https://images.pexels.com/photos/163036/mario-luigi-yoschi-figures-163036.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE slug = 'oyuncak';
UPDATE categories SET image_url = 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE slug = 'otomotiv';

-- Üçüncü banner (ev dekorasyon)
INSERT INTO banners (id, title, subtitle, image_url, link_url, button_text, sort_order, is_active)
VALUES (
  '33333333-3333-3333-3333-333333333003',
  'Ev Dekorasyonu',
  'Evinizi yenileyin, %40 indirim fırsatı!',
  'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1920',
  '/kategori/ev-yasam',
  'Keşfet',
  3,
  true
) ON CONFLICT (id) DO NOTHING;

-- HOSGELDIN kuponu: minimum tutar kaldır
UPDATE coupons SET min_order_amount = 0, max_discount = 200 WHERE code = 'HOSGELDIN';

-- Satıcı siparişlerini görebilsin (ürünleri içeren siparişler)
CREATE POLICY "select_seller_orders" ON orders FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM jsonb_array_elements(items) AS item
      WHERE (item->>'seller_id')::uuid = auth.uid()
    )
  );
