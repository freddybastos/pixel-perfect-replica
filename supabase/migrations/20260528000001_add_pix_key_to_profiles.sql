-- Adiciona chave Pix ao perfil do profissional
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS pix_key TEXT,
  ADD COLUMN IF NOT EXISTS pix_key_type TEXT CHECK (pix_key_type IN ('cpf', 'cnpj', 'telefone', 'email', 'aleatoria'));

COMMENT ON COLUMN public.profiles.pix_key IS 'Chave Pix do profissional para recebimento';
COMMENT ON COLUMN public.profiles.pix_key_type IS 'Tipo da chave Pix: cpf, cnpj, telefone, email ou aleatoria';

-- Garante unicidade no pagamento por OS + método (para o upsert funcionar)
ALTER TABLE public.pagamentos
  DROP CONSTRAINT IF EXISTS pagamentos_os_metodo_unique;

ALTER TABLE public.pagamentos
  ADD CONSTRAINT pagamentos_os_metodo_unique UNIQUE (os_id, metodo);
