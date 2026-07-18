-- Enable storage
-- Create products bucket if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('products', 'products', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Allow admins and authenticated users to upload to products bucket
CREATE POLICY "Authenticated users can upload product images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'products');

-- Allow public access to view product images
CREATE POLICY "Public can view product images" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'products');

-- Allow admins to update and delete product images
CREATE POLICY "Admins can manage product images" ON storage.objects
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin')
  )
  WITH CHECK (
    auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin')
  );
