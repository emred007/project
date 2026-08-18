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
('33333333-3333-3333-3333-333333333001', 'Yeni Sezon Fırsatları', 'Tüm mod ürünlerde %50''ye varan indirim!', 'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', '/kategori/moda', 'Hemen Al', 1, true),
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