-- Tabela de guias DAS / fiscais
CREATE TABLE public.guias_das (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  competencia DATE NOT NULL,
  valor NUMERIC(10,2) NOT NULL DEFAULT 0,
  vencimento DATE NOT NULL,
  data_pagamento DATE,
  status TEXT NOT NULL DEFAULT 'pendente',
  pdf_url TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.guias_das ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own guias" ON public.guias_das FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own guias" ON public.guias_das FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own guias" ON public.guias_das FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own guias" ON public.guias_das FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_guias_das_updated_at
BEFORE UPDATE ON public.guias_das
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_guias_das_user ON public.guias_das(user_id, competencia DESC);

-- Storage bucket privado para PDFs das guias
INSERT INTO storage.buckets (id, name, public) VALUES ('guias-fiscais', 'guias-fiscais', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users read own guia files" ON storage.objects FOR SELECT
  USING (bucket_id = 'guias-fiscais' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users upload own guia files" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'guias-fiscais' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own guia files" ON storage.objects FOR UPDATE
  USING (bucket_id = 'guias-fiscais' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own guia files" ON storage.objects FOR DELETE
  USING (bucket_id = 'guias-fiscais' AND auth.uid()::text = (storage.foldername(name))[1]);