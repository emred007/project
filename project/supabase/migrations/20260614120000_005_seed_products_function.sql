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
