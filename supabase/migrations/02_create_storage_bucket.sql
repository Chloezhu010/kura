-- Private bucket for bean photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('bean-photos', 'bean-photos', false);

-- Only the owning user can upload to their folder
CREATE POLICY "owner_upload" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'bean-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Only the owning user can read their photos
CREATE POLICY "owner_read" ON storage.objects FOR SELECT
  USING (
    bucket_id = 'bean-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Only the owning user can delete their photos
CREATE POLICY "owner_delete" ON storage.objects FOR DELETE
  USING (
    bucket_id = 'bean-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
