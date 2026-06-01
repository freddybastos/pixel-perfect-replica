/**
 * Edge Function: gerar-pix
 * Gera payload Pix estático (EMV/QRCPS-MPM) conforme padrão BACEN.
 * Não requer gateway externo — funciona com qualquer chave Pix cadastrada.
 *
 * POST /functions/v1/gerar-pix
 * Body: { os_id: string }
 *
 * Retorna: { pix_codigo: string, pix_qrcode: string (base64 SVG) }
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ──────────────────────────────────────────────
// Pix Payload Builder (padrão BACEN EMV QRCPS-MPM)
// ──────────────────────────────────────────────

function tlv(id: string, value: string): string {
  const len = String(value.length).padStart(2, "0");
  return `${id}${len}${value}`;
}

function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, "0");
}

function buildPixPayload(opts: {
  chavePix: string;
  nomeRecebedor: string;
  cidadeRecebedor: string;
  valor?: number;
  txid?: string;
  descricao?: string;
}): string {
  const { chavePix, nomeRecebedor, cidadeRecebedor, valor, txid, descricao } = opts;

  // 26 – Merchant Account Information
  const gui = tlv("00", "BR.GOV.BCB.PIX");
  const chave = tlv("01", chavePix);
  const info = descricao ? tlv("02", descricao.slice(0, 72)) : "";
  const mai = tlv("26", gui + chave + info);

  // 62 – Additional Data (txid)
  const txRef = (txid ?? "***").replace(/[^a-zA-Z0-9]/g, "").slice(0, 25) || "***";
  const addData = tlv("62", tlv("05", txRef));

  // Campos obrigatórios
  let payload =
    tlv("00", "01") +          // Payload Format Indicator
    tlv("01", "12") +          // Point of Initiation Method (12 = único uso)
    mai +
    tlv("52", "0000") +        // Merchant Category Code
    tlv("53", "986") +         // Currency (BRL)
    (valor && valor > 0
      ? tlv("54", valor.toFixed(2))
      : "") +
    tlv("58", "BR") +          // Country Code
    tlv("59", nomeRecebedor.slice(0, 25)) +
    tlv("60", cidadeRecebedor.slice(0, 15)) +
    addData +
    "6304";                    // CRC placeholder

  payload += crc16(payload);
  return payload;
}

// ──────────────────────────────────────────────
// QR Code SVG simples via API pública
// ──────────────────────────────────────────────

async function pixToQRCodeBase64(pixString: string): Promise<string> {
  // Usa API pública do QR Server (sem chave, sem custo)
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&format=svg&data=${encodeURIComponent(pixString)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Falha ao gerar QR code");
  const svg = await res.text();
  return btoa(svg);
}

// ──────────────────────────────────────────────
// Handler principal
// ──────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Autenticar usuário via JWT
    const jwt = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!jwt) return json({ error: "Não autorizado" }, 401);

    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    if (authError || !user) return json({ error: "Sessão inválida" }, 401);

    const { os_id } = await req.json();
    if (!os_id) return json({ error: "os_id obrigatório" }, 400);

    // Buscar OS e validar dono
    const { data: os, error: osError } = await supabase
      .from("ordens_servico")
      .select("id, numero, valor_total, status, user_id")
      .eq("id", os_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (osError || !os) return json({ error: "OS não encontrada" }, 404);
    if (os.valor_total <= 0) return json({ error: "Valor da OS deve ser maior que zero" }, 400);

    // Buscar perfil do profissional (chave Pix)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("nome, nome_fantasia, cidade, pix_key")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile) return json({ error: "Perfil não encontrado" }, 404);
    if (!profile.pix_key) return json({ error: "Chave Pix não cadastrada. Configure em Configurações." }, 400);

    const nomeRecebedor = (profile.nome_fantasia || profile.nome || "Profissional").normalize("NFD").replace(/[̀-ͯ]/g, "");
    const cidadeRecebedor = (profile.cidade || "Brasil").normalize("NFD").replace(/[̀-ͯ]/g, "");
    const txid = `OS${os.numero}`;
    const descricao = `OS ${os.numero}`;

    // Gerar payload Pix
    const pixCodigo = buildPixPayload({
      chavePix: profile.pix_key,
      nomeRecebedor,
      cidadeRecebedor,
      valor: os.valor_total,
      txid,
      descricao,
    });

    // Gerar QR Code em base64
    const pixQrcode = await pixToQRCodeBase64(pixCodigo);

    // Salvar na tabela pagamentos
    const { data: pagamento, error: pgError } = await supabase
      .from("pagamentos")
      .upsert({
        os_id: os.id,
        user_id: user.id,
        valor: os.valor_total,
        metodo: "pix",
        status: "pendente",
        pix_codigo: pixCodigo,
        pix_qrcode: pixQrcode,
      }, { onConflict: "os_id,metodo" })
      .select("id")
      .maybeSingle();

    if (pgError) {
      console.error("Erro ao salvar pagamento:", pgError);
    }

    return json({
      ok: true,
      pix_codigo: pixCodigo,
      pix_qrcode: pixQrcode,
      valor: os.valor_total,
      pagamento_id: pagamento?.id ?? null,
    });

  } catch (e) {
    console.error("gerar-pix error:", e);
    return json({ error: e instanceof Error ? e.message : "Erro interno" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
