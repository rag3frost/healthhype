-- Create storage bucket for skin images
INSERT INTO storage.buckets (id, name, public)
VALUES ('skin-images', 'skin-images', true);

-- Set up storage policies
CREATE POLICY "Give users access to own folder 1b5t1lw_0" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'skin-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Give users access to own folder 1b5t1lw_1" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'skin-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Give users access to own folder 1b5t1lw_2" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'skin-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Give users access to own folder 1b5t1lw_3" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'skin-images' AND (storage.foldername(name))[1] = auth.uid()::text);
