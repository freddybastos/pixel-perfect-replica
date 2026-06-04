import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatBRL } from "@/lib/format";
import { MessageCircle, Link2, Share2, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";

export default function CompartilharOS() {
  const { id } = useParams();
  const [os, setOs] = useState<any>(null);
  const [cliente, setCliente] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    supabase.from("ordens_servico").select("*").eq("id", id).maybeSingle().then(async ({ data }) => {
      setOs(data);
      if (data?.cliente_id) {
        const { data: c } = await supabase.from("clientes").select("*").eq("id", data.cliente_id).maybeSingle();
        setCliente(c);
      }
    });
  }, [id]);

  if (!os) return <AppShell><div className="p-8 text-center text-muted-foreground">Carregando...</div></AppShell>;

  const link = `${window.location.origin}/aceite/${os.aceite_token}`;
  const msg = `Olá${cliente?.nome ? `, ${cliente.nome}` : ""}! Segue o orçamento no valor de ${formatBRL(os.valor_total)}.\n\nVocê pode visualizar e aceitar pelo link:\n${link}`;
  const tel = (cliente?.telefone || "").replace(/\D/g, "");
  const wa = `https://wa.me/${tel.length > 10 ? "55" + tel : tel}?text=${encodeURIComponent(msg)}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(link);
    toast.success("Link copiado");
  };

  const share = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: `Orçamento #${os.numero}`, text: msg, url: link }); }
      catch {}
    } else copyLink();
  };

  return (
    <AppShell>
      <PageHeader title="Compartilhar" subtitle={`OS #${String(os.numero).padStart(4,"0")}`} back={`/os/${id}`} />
      <div className="px-4 py-4 space-y-4 animate-fade-in">
        <Card className="p-5 gradient-card border-primary/20">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Valor do orçamento</p>
          <p className="mt-1 text-3xl font-extrabold text-primary">{formatBRL(os.valor_total)}</p>
          <p className="mt-1 text-sm text-muted-foreground">Para {cliente?.nome || "cliente"}</p>
        </Card>

        <Card className="p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Status do aceite</p>
          {os.aceito_em ? (
            <div className="flex items-start gap-2 text-success">
              <CheckCircle2 className="h-5 w-5 mt-0.5" />
              <div>
                <p className="font-semibold">Aceito por {os.aceito_por}</p>
                <p className="text-xs text-muted-foreground">{new Date(os.aceito_em).toLocaleString("pt-BR")}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2 text-muted-foreground">
              <Clock className="h-5 w-5 mt-0.5" />
              <p className="text-sm">Aguardando aceite do cliente</p>
            </div>
          )}
        </Card>

        <a href={wa} target="_blank" rel="noopener noreferrer">
          <Button className="w-full h-14 rounded-xl bg-success text-success-foreground hover:bg-success/90 font-semibold text-base">
            <MessageCircle className="h-5 w-5" /> Enviar pelo WhatsApp
          </Button>
        </a>

        <Button onClick={copyLink} variant="outline" className="w-full h-12 rounded-xl">
          <Link2 className="h-4 w-4" /> Copiar Link
        </Button>

        <Button onClick={share} variant="outline" className="w-full h-12 rounded-xl">
          <Share2 className="h-4 w-4" /> Compartilhar
        </Button>

        <Card className="p-3 text-xs font-mono text-muted-foreground break-all">{link}</Card>
      </div>
    </AppShell>
  );
}
