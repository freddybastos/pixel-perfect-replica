import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { formatBRL } from "@/lib/format";
import { Copy, MessageCircle, QrCode, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Cobranca() {
  const { id } = useParams();
  const { user } = useAuth();
  const [os, setOs] = useState<any>(null);
  const [cliente, setCliente] = useState<any>(null);
  const [pag, setPag] = useState<any>(null);
  const [parcelar, setParcelar] = useState(false);
  const [parcelas, setParcelas] = useState(2);
  const [gerando, setGerando] = useState(false);

  const load = async () => {
    if (!id) return;
    const { data } = await supabase.from("ordens_servico").select("*").eq("id", id).maybeSingle();
    setOs(data);
    if (data?.cliente_id) {
      const { data: c } = await supabase.from("clientes").select("*").eq("id", data.cliente_id).maybeSingle();
      setCliente(c);
    }
    const { data: p } = await supabase.from("pagamentos").select("*").eq("os_id", id).order("created_at", { ascending: false }).limit(1).maybeSingle();
    setPag(p);
  };

  useEffect(() => { load(); }, [id]);

  const gerarPix = async () => {
    if (!os || !user) return;
    setGerando(true);
    // Gera código pix simulado (formato BR Code simplificado para demo)
    const pixCode = `00020126580014BR.GOV.BCB.PIX0136${crypto.randomUUID()}5204000053039865406${os.valor_total.toFixed(2)}5802BR5913OrcaJa Pagto6009SAO PAULO62070503***6304ABCD`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixCode)}`;
    const { data, error } = await supabase.from("pagamentos").insert({
      user_id: user.id, os_id: id!, valor: os.valor_total, status: "pendente", metodo: "pix",
      pix_codigo: pixCode, pix_qrcode: qrUrl, parcelas: parcelar ? parcelas : 1,
    }).select().single();
    setGerando(false);
    if (error) { toast.error(error.message); return; }
    setPag(data);
    toast.success("Pix gerado");
  };

  const marcarPago = async () => {
    if (!pag) return;
    await supabase.from("pagamentos").update({ status: "pago", data_pagamento: new Date().toISOString() }).eq("id", pag.id);
    toast.success("Pagamento confirmado");
    load();
  };

  const copyCodigo = async () => {
    if (!pag?.pix_codigo) return;
    await navigator.clipboard.writeText(pag.pix_codigo);
    toast.success("Código Pix copiado");
  };

  const enviarWhatsApp = () => {
    if (!pag) return;
    const tel = (cliente?.telefone || "").replace(/\D/g, "");
    const msg = `Olá${cliente?.nome ? `, ${cliente.nome}` : ""}! Segue o Pix para pagamento do serviço:\n\nValor: ${formatBRL(pag.valor)}\n\nCódigo Pix (copia e cola):\n${pag.pix_codigo}`;
    window.open(`https://wa.me/${tel.length > 10 ? "55" + tel : tel}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  if (!os) return <AppShell><div className="p-8 text-center text-muted-foreground">Carregando...</div></AppShell>;

  return (
    <AppShell>
      <PageHeader title="Cobrança Pix" back={`/os/${id}`} />
      <div className="px-4 py-4 space-y-4 animate-fade-in">
        <Card className="p-5 gradient-card border-primary/30">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Valor a cobrar</p>
          <p className="mt-1 text-3xl font-extrabold text-primary">{formatBRL(os.valor_total)}</p>
          <p className="mt-1 text-sm text-muted-foreground">OS #{String(os.numero).padStart(4,"0")} • {cliente?.nome || "—"}</p>
        </Card>

        {!pag ? (
          <>
            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="parc" className="font-medium">Parcelar</Label>
                <Switch id="parc" checked={parcelar} onCheckedChange={setParcelar} />
              </div>
              {parcelar && (
                <div>
                  <Label className="text-xs text-muted-foreground">Número de parcelas</Label>
                  <Select value={String(parcelas)} onValueChange={v=>setParcelas(Number(v))}>
                    <SelectTrigger className="h-11 mt-1 rounded-lg"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[2,3,4,5,6,10,12].map(n => <SelectItem key={n} value={String(n)}>{n}x de {formatBRL(os.valor_total/n)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </Card>
            <Button onClick={gerarPix} disabled={gerando} size="lg" className="w-full h-14 gradient-primary font-semibold rounded-xl text-base">
              {gerando ? <Loader2 className="h-5 w-5 animate-spin" /> : <><QrCode className="h-5 w-5" /> Gerar Pix</>}
            </Button>
          </>
        ) : (
          <>
            <Card className="p-4 flex items-center justify-between">
              <span className="text-sm font-medium">Status do pagamento</span>
              <StatusBadge status={pag.status} />
            </Card>
            <Card className="p-5 text-center space-y-3">
              <img src={pag.pix_qrcode} alt="QR Code Pix" className="mx-auto rounded-xl" width={240} height={240} />
              <p className="text-xs text-muted-foreground">Escaneie com o app do seu banco</p>
            </Card>
            <Button onClick={copyCodigo} variant="outline" className="w-full h-12 rounded-xl"><Copy className="h-4 w-4" /> Copiar código Pix</Button>
            <Button onClick={enviarWhatsApp} className="w-full h-12 rounded-xl bg-success text-success-foreground hover:bg-success/90"><MessageCircle className="h-4 w-4" /> Enviar pelo WhatsApp</Button>
            {pag.status !== "pago" && (
              <Button onClick={marcarPago} variant="outline" className="w-full h-12 rounded-xl border-success text-success hover:bg-success/10"><CheckCircle2 className="h-4 w-4" /> Marcar como pago</Button>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
