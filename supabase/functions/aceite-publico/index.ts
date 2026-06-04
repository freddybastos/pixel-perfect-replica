import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    if (!token) return json({ error: "token requerido" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (req.method === "GET") {
      // public read of OS by token
      const { data: os, error } = await supabase
        .from("ordens_servico")
        .select("id, numero, descricao, valor_total, status, data_execucao, endereco, aceito_em, aceito_por, user_id, cliente_id")
        .eq("aceite_token", token)
        .maybeSingle();
      if (error || !os) return json({ error: "Orçamento não encontrado" }, 404);

      const [{ data: itens }, { data: profile }, { data: cliente }] = await Promise.all([
        supabase.from("itens_os").select("descricao, quantidade, valor_unitario, ordem").eq("os_id", os.id).order("ordem"),
        supabase.from("profiles").select("nome, nome_fantasia, telefone, logo_url, cidade").eq("id", os.user_id).maybeSingle(),
        os.cliente_id ? supabase.from("clientes").select("nome").eq("id", os.cliente_id).maybeSingle() : Promise.resolve({ data: null }),
      ]);

      return json({ os, itens: itens ?? [], profile, cliente });
    }

    if (req.method === "POST") {
      const body = await req.json();
      const nome = String(body?.nome ?? "").trim().slice(0, 200);
      if (!nome) return json({ error: "Nome obrigatório" }, 400);

      const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

      const { data, error } = await supabase
        .from("ordens_servico")
        .update({
          status: "aceito",
          aceito_em: new Date().toISOString(),
          aceito_por: nome,
          aceito_ip: ip,
        })
        .eq("aceite_token", token)
        .select("id")
        .maybeSingle();
      if (error || !data) return json({ error: "Não foi possível registrar o aceite" }, 400);
      return json({ ok: true });
    }

    return json({ error: "method not allowed" }, 405);
  } catch (e) {
    console.error("aceite-publico error:", e);
    return json({ error: e instanceof Error ? e.message : "unknown" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
