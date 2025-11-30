-- Supabase Storage Policies for slot-images bucket
-- Run this in Supabase SQL Editor after creating the bucket

-- Allow anyone to upload images
CREATE POLICY "Allow public upload"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'slot-images');

-- Allow anyone to read/download images
CREATE POLICY "Allow public read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'slot-images');

-- Allow anyone to update images (optional)
CREATE POLICY "Allow public update"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'slot-images')
WITH CHECK (bucket_id = 'slot-images');

-- Allow anyone to delete images (optional - be careful with this in production)
CREATE POLICY "Allow public delete"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'slot-images');
