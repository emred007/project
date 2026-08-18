-- Türkçe karakter düzeltmesi (Supabase SQL Editor → Run)
-- Bozuk görünen: FÄ±rsatlarÄ±, TÃ¼m, Ã¼rÃ¼n vb.

-- Bannerlar
UPDATE banners SET
  title = 'Yeni Sezon Fırsatları',
  subtitle = 'Tüm moda ürünlerde %50''ye varan indirim!',
  button_text = 'Hemen Al'
WHERE id = '33333333-3333-3333-3333-333333333001';

UPDATE banners SET
  title = 'Elektronik Festivali',
  subtitle = 'En yeni teknolojik ürünler burada!',
  button_text = 'Keşfet'
WHERE id = '33333333-3333-3333-3333-333333333002';

UPDATE banners SET
  title = 'Ev Dekorasyonu',
  subtitle = 'Evinizi yenileyin, %40 indirim fırsatı!',
  button_text = 'Keşfet'
WHERE id = '33333333-3333-3333-3333-333333333003';

-- Ana kategoriler
UPDATE categories SET name = 'Elektronik', description = 'Elektronik ürünler' WHERE slug = 'elektronik';
UPDATE categories SET name = 'Moda', description = 'Giyim ve aksesuar' WHERE slug = 'moda';
UPDATE categories SET name = 'Ev & Yaşam', description = 'Ev dekorasyon ve yaşam ürünleri' WHERE slug = 'ev-yasam';
UPDATE categories SET name = 'Spor', description = 'Spor ve outdoor ürünleri' WHERE slug = 'spor';
UPDATE categories SET name = 'Kozmetik', description = 'Güzellik ve kişisel bakım' WHERE slug = 'kozmetik';
UPDATE categories SET name = 'Kitap', description = 'Kitap ve dergi' WHERE slug = 'kitap';
UPDATE categories SET name = 'Oyuncak', description = 'Oyuncak ve oyun' WHERE slug = 'oyuncak';
UPDATE categories SET name = 'Otomotiv', description = 'Otomotiv ve aksesuar' WHERE slug = 'otomotiv';

-- Alt kategoriler
UPDATE categories SET name = 'Kadın Giyim' WHERE slug = 'kadin-giyim';
UPDATE categories SET name = 'Erkek Giyim' WHERE slug = 'erkek-giyim';
UPDATE categories SET name = 'Ayakkabı' WHERE slug = 'ayakkabi';
UPDATE categories SET name = 'Çanta' WHERE slug = 'canta';

-- Ürünler
UPDATE products SET name = 'iPhone 15 Pro 256GB', description = 'A17 Pro çip, titanyum tasarım, 48MP kamera.' WHERE slug = 'iphone-15-pro-256gb';
UPDATE products SET name = 'Samsung Galaxy S24 Ultra', description = 'S Pen destekli amiral gemisi telefon.' WHERE slug = 'samsung-galaxy-s24-ultra';
UPDATE products SET name = 'MacBook Air M3 13"', description = 'Ultra ince, güçlü M3 işlemci, 18 saat pil.' WHERE slug = 'macbook-air-m3-13';
UPDATE products SET name = 'Sony WH-1000XM5 Kulaklık', description = 'Industry leading gürültü engelleme.' WHERE slug = 'sony-wh-1000xm5';
UPDATE products SET name = 'Nike Air Max 270', description = 'Günlük kullanım için konforlu spor ayakkabı.' WHERE slug = 'nike-air-max-270';
UPDATE products SET name = 'Adidas Originals Hoodie', description = 'Pamuklu, rahat kesim kapüşonlu sweatshirt.' WHERE slug = 'adidas-originals-hoodie';
UPDATE products SET name = 'Dyson V15 Detect Süpürge', description = 'Lazer toz algılama teknolojisi.' WHERE slug = 'dyson-v15-detect';
UPDATE products SET name = 'Xiaomi Redmi Note 13 Pro', description = '200MP kamera, 120Hz AMOLED ekran.' WHERE slug = 'xiaomi-redmi-note-13-pro';
UPDATE products SET name = 'L''Oréal Paris Revitalift Serum', brand = 'L''Oréal', description = 'Anti-aging cilt bakım serumu 30ml.' WHERE slug = 'loreal-revitalift-serum';
UPDATE products SET name = 'Lenovo IdeaPad Gaming 3', description = 'RTX 4050, 144Hz ekran, oyun laptopu.' WHERE slug = 'lenovo-ideapad-gaming-3';
UPDATE products SET name = 'Zara Oversize Blazer Ceket', description = 'Şık oversize kesim blazer ceket.' WHERE slug = 'zara-oversize-blazer';
UPDATE products SET name = 'Philips Airfryer XXL', description = 'Yağsız pişirme, 6.2L kapasite.' WHERE slug = 'philips-airfryer-xxl';
UPDATE products SET name = 'Under Armour Spor Tayt', description = 'Nefes alabilir kumaş, yüksek bel.' WHERE slug = 'under-armour-spor-tayt';
UPDATE products SET name = 'Kindle Paperwhite 16GB', description = 'Su geçirmez e-okuyucu, ayarlanabilir sıcaklık.' WHERE slug = 'kindle-paperwhite-16gb';
UPDATE products SET name = 'LEGO Star Wars X-Wing', description = '734 parça, koleksiyonluk set.' WHERE slug = 'lego-star-wars-xwing';
UPDATE products SET name = 'Bosch Akü Şarj Cihazı', description = '12V/24V uyumlu akıllı şarj.' WHERE slug = 'bosch-aku-sarj-cihazi';
