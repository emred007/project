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