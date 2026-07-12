-- Enable RLS for all tables (though most already are)
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reviews ENABLE ROW LEVEL SECURITY;

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
