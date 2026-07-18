-- Enable RLS for all tables (though most already are)
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_uploads ENABLE ROW LEVEL SECURITY;

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM public.users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy: Admin can do everything on all tables
CREATE POLICY "Admin can do anything on users" ON public.users
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin can do anything on categories" ON public.categories
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin can do anything on products" ON public.products
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin can do anything on addresses" ON public.addresses
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin can do anything on orders" ON public.orders
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin can do anything on order_items" ON public.order_items
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin can do anything on wishlist" ON public.wishlist
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin can do anything on reviews" ON public.reviews
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin can do anything on product_uploads" ON public.product_uploads
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Policies: Customers can manage their own data
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Categories and products are visible to everyone
CREATE POLICY "Everyone can view active categories" ON public.categories
  FOR SELECT
  USING (is_active = true OR is_admin());

CREATE POLICY "Everyone can view active products" ON public.products
  FOR SELECT
  USING (is_active = true OR is_admin());

-- Addresses: users manage their own
CREATE POLICY "Users can view their own addresses" ON public.addresses
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own addresses" ON public.addresses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses" ON public.addresses
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own addresses" ON public.addresses
  FOR DELETE
  USING (auth.uid() = user_id);

-- Orders: users view their own
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Order items: users view their own
CREATE POLICY "Users can view their own order items" ON public.order_items
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid()));

-- Wishlist: users manage their own
CREATE POLICY "Users can view their own wishlist" ON public.wishlist
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wishlist items" ON public.wishlist
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlist items" ON public.wishlist
  FOR DELETE
  USING (auth.uid() = user_id);

-- Reviews: users can view published, manage their own
CREATE POLICY "Everyone can view published reviews" ON public.reviews
  FOR SELECT
  USING (status = 'published');

CREATE POLICY "Users can view their own reviews" ON public.reviews
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reviews" ON public.reviews
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON public.reviews
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON public.reviews
  FOR DELETE
  USING (auth.uid() = user_id);

-- Product uploads: users manage their own
CREATE POLICY "Users can view their own product uploads" ON public.product_uploads
  FOR SELECT
  USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can insert their own product uploads" ON public.product_uploads
  FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete their own product uploads" ON public.product_uploads
  FOR DELETE
  USING (auth.uid() = uploaded_by);
