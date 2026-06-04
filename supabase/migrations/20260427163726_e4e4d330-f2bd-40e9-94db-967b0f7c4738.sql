-- Drop permissive policies
DROP POLICY IF EXISTS "Public update aceite by token" ON public.ordens_servico;

-- Restrict storage SELECT to authenticated owners (objects ainda acessíveis via URL pública direta do bucket)
DROP POLICY IF EXISTS "Public read logos" ON storage.objects;
DROP POLICY IF EXISTS "Public read fotos-os" ON storage.objects;

CREATE POLICY "Owner list logos" ON storage.objects FOR SELECT
  USING (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Owner list fotos-os" ON storage.objects FOR SELECT
  USING (bucket_id = 'fotos-os' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Fix function search paths
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Restrict EXECUTE on internal functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;