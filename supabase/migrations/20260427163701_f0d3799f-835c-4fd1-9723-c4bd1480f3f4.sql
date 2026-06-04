-- ============ ENUMS ============
CREATE TYPE public.os_status AS ENUM ('rascunho', 'enviado', 'aceito', 'em_andamento', 'concluido', 'cancelado');
CREATE TYPE public.pagamento_status AS ENUM ('pendente', 'pago', 'vencido', 'cancelado');
CREATE TYPE public.pagamento_metodo AS ENUM ('pix', 'dinheiro', 'cartao', 'boleto', 'transferencia');

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  tipo_servico TEXT,
  nome_fantasia TEXT,
  cidade TEXT,
  logo_url TEXT,
  notificacoes_push BOOLEAN NOT NULL DEFAULT true,
  plano TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ============ TIMESTAMP TRIGGER ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ AUTO-CREATE PROFILE ON SIGNUP ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, telefone, tipo_servico)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'telefone',
    NEW.raw_user_meta_data->>'tipo_servico'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ CLIENTES ============
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  endereco TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner all clientes" ON public.clientes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER set_clientes_updated_at BEFORE UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_clientes_user ON public.clientes(user_id);

-- ============ MODELOS DE SERVICO ============
CREATE TABLE public.modelos_servico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  itens JSONB NOT NULL DEFAULT '[]'::jsonb,
  valor_padrao NUMERIC(12,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.modelos_servico ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner all modelos" ON public.modelos_servico FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ ORDENS DE SERVICO ============
CREATE TABLE public.ordens_servico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  numero SERIAL,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  endereco TEXT,
  descricao TEXT,
  data_execucao DATE,
  valor_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  status public.os_status NOT NULL DEFAULT 'rascunho',
  aceite_token UUID NOT NULL DEFAULT gen_random_uuid(),
  aceito_em TIMESTAMPTZ,
  aceito_por TEXT,
  aceito_ip TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ordens_servico ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner all OS" ON public.ordens_servico FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public view by token" ON public.ordens_servico FOR SELECT USING (true);
CREATE POLICY "Public update aceite by token" ON public.ordens_servico FOR UPDATE USING (true) WITH CHECK (true);
CREATE TRIGGER set_os_updated_at BEFORE UPDATE ON public.ordens_servico FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_os_user ON public.ordens_servico(user_id);
CREATE INDEX idx_os_token ON public.ordens_servico(aceite_token);
CREATE INDEX idx_os_data ON public.ordens_servico(data_execucao);

-- ============ ITENS OS ============
CREATE TABLE public.itens_os (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id UUID NOT NULL REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  quantidade NUMERIC(12,2) NOT NULL DEFAULT 1,
  valor_unitario NUMERIC(12,2) NOT NULL DEFAULT 0,
  ordem INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.itens_os ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner all itens via OS" ON public.itens_os FOR ALL
  USING (EXISTS (SELECT 1 FROM public.ordens_servico o WHERE o.id = os_id AND o.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.ordens_servico o WHERE o.id = os_id AND o.user_id = auth.uid()));
CREATE POLICY "Public view itens" ON public.itens_os FOR SELECT USING (true);
CREATE INDEX idx_itens_os ON public.itens_os(os_id);

-- ============ FOTOS OS ============
CREATE TABLE public.fotos_os (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id UUID NOT NULL REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  legenda TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.fotos_os ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner all fotos" ON public.fotos_os FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public view fotos" ON public.fotos_os FOR SELECT USING (true);

-- ============ PAGAMENTOS ============
CREATE TABLE public.pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  os_id UUID REFERENCES public.ordens_servico(id) ON DELETE SET NULL,
  valor NUMERIC(12,2) NOT NULL,
  status public.pagamento_status NOT NULL DEFAULT 'pendente',
  metodo public.pagamento_metodo NOT NULL DEFAULT 'pix',
  pix_codigo TEXT,
  pix_qrcode TEXT,
  parcelas INT NOT NULL DEFAULT 1,
  data_vencimento DATE,
  data_pagamento TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner all pagamentos" ON public.pagamentos FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER set_pag_updated_at BEFORE UPDATE ON public.pagamentos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_pag_user ON public.pagamentos(user_id);

-- ============ DESPESAS ============
CREATE TABLE public.despesas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  valor NUMERIC(12,2) NOT NULL,
  categoria TEXT,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.despesas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner all despesas" ON public.despesas FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_despesas_user ON public.despesas(user_id);

-- ============ STORAGE ============
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('fotos-os', 'fotos-os', true) ON CONFLICT DO NOTHING;

CREATE POLICY "Public read logos" ON storage.objects FOR SELECT USING (bucket_id = 'logos');
CREATE POLICY "Users upload own logo" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own logo" ON storage.objects FOR UPDATE USING (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own logo" ON storage.objects FOR DELETE USING (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public read fotos-os" ON storage.objects FOR SELECT USING (bucket_id = 'fotos-os');
CREATE POLICY "Users upload own fotos-os" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'fotos-os' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own fotos-os" ON storage.objects FOR DELETE USING (bucket_id = 'fotos-os' AND auth.uid()::text = (storage.foldername(name))[1]);