-- Demo ürünler: mevcut bir satıcı hesabı varsa otomatik eklenir
DO $$
DECLARE
  seller_uuid UUID;
BEGIN
  SELECT id INTO seller_uuid FROM users WHERE role IN ('seller', 'admin') LIMIT 1;

  IF seller_uuid IS NULL THEN
    RAISE NOTICE 'Satıcı bulunamadı, demo ürünler atlandı.';
    RETURN;
  END IF;

  INSERT INTO products (id, name, slug, description, price, discount_price, stock, sku, brand, category_id, seller_id, images, status, rating, review_count, is_featured, is_bestseller, is_new)
  VALUES
  ('44444444-4444-4444-4444-444444444001', 'iPhone 15 Pro 256GB', 'iphone-15-pro-256gb', 'A17 Pro çip, titanyum tasarım.', 64999, 59999, 45, 'IPH15P-256', 'Apple', '11111111-1111-1111-1111-111111111001', seller_uuid, ARRAY['https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=600'], 'approved', 4.9, 342, true, true, true),
  ('44444444-4444-4444-4444-444444444002', 'Samsung Galaxy S24 Ultra', 'samsung-galaxy-s24-ultra', 'S Pen destekli amiral gemisi.', 54999, 49999, 32, 'SGS24U-512', 'Samsung', '11111111-1111-1111-1111-111111111001', seller_uuid, ARRAY['https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=600'], 'approved', 4.8, 256, true, true, false),
  ('44444444-4444-4444-4444-444444444003', 'Nike Air Max 270', 'nike-air-max-270', 'Konforlu spor ayakkabı.', 4999, 3499, 120, 'NIKE-AM270', 'Nike', '11111111-1111-1111-1111-111111111004', seller_uuid, ARRAY['https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=600'], 'approved', 4.6, 890, true, true, false),
  ('44444444-4444-4444-4444-444444444004', 'Sony WH-1000XM5', 'sony-wh-1000xm5', 'Gürültü engelleme kulaklık.', 12999, 10999, 67, 'SONY-XM5', 'Sony', '11111111-1111-1111-1111-111111111001', seller_uuid, ARRAY['https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=600'], 'approved', 4.9, 512, true, true, false),
  ('44444444-4444-4444-4444-444444444005', 'Adidas Originals Hoodie', 'adidas-originals-hoodie', 'Pamuklu kapüşonlu sweatshirt.', 2499, 1799, 85, 'ADID-HOOD', 'Adidas', '11111111-1111-1111-1111-111111111002', seller_uuid, ARRAY['https://images.pexels.com/photos/7671166/pexels-photo-7671166.jpeg?auto=compress&cs=tinysrgb&w=600'], 'approved', 4.5, 234, true, false, true),
  ('44444444-4444-4444-4444-444444444006', 'Xiaomi Redmi Note 13 Pro', 'xiaomi-redmi-note-13-pro', '200MP kamera, AMOLED ekran.', 14999, 12999, 95, 'XM-RN13P', 'Xiaomi', '11111111-1111-1111-1111-111111111001', seller_uuid, ARRAY['https://images.unsplash.com/photo-1598327105666-5b86a8e9a267?auto=format&fit=crop&w=600&q=80'], 'approved', 4.4, 445, true, true, true),
  ('44444444-4444-4444-4444-444444444007', 'L''Oréal Revitalift Serum', 'loreal-revitalift-serum', 'Anti-aging serum 30ml.', 899, 649, 200, 'LOR-REV30', 'L''Oréal', '11111111-1111-1111-1111-111111111005', seller_uuid, ARRAY['https://images.pexels.com/photos/3785147/pexels-photo-3785147.jpeg?auto=compress&cs=tinysrgb&w=600'], 'approved', 4.3, 678, false, true, true),
  ('44444444-4444-4444-4444-444444444008', 'Philips Airfryer XXL', 'philips-airfryer-xxl', 'Yağsız pişirme 6.2L.', 8999, 7499, 55, 'PHI-AFXXL', 'Philips', '11111111-1111-1111-1111-111111111003', seller_uuid, ARRAY['https://images.pexels.com/photos/4493661/pexels-photo-4493661.jpeg?auto=compress&cs=tinysrgb&w=600'], 'approved', 4.7, 1203, false, true, false)
  ON CONFLICT (id) DO NOTHING;
END $$;
