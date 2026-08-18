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
