import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { formatBRL, formatDate } from "@/lib/format";
import { Sparkles, CheckCircle2, Loader2, Building2 } from "lucide-react";
import { toast } from "sonner";

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aceite-publico`;

export default function AceitePublico() {
  const { token } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState("");
  const [aceito, setAceito] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    fetch(`${FN_URL}?token=${token}`, {
      headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
    })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  const enviarAceite = async () => {
    if (!nome.trim() || !aceito) return;
    setEnviando(true);
    const r = await fetch(`${FN_URL}?token=${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
      body: JSON.stringify({ nome }),
    });
    const j = await r.json();
    setEnviando(false);
    if (!r.ok) { toast.error(j.error || "Erro"); return; }
    setSucesso(true);
  };

  if (loading) return <div className="min-h-screen grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!data || data.error) return <div className="min-h-screen grid place-items-center p-6 text-center text-muted-foreground">Orçamento não encontrado.</div>;

  const { os, itens, profile, cliente } = data;

  if (sucesso || os.aceito_em) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-accent to-background">
        <Card className="max-w-md w-full p-8 text-center space-y-3">
          <div className="mx-auto h-16 w-16 rounded-full bg-success/15 grid place-items-center">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <h1 className="text-2xl font-bold">Orçamento aceito!</h1>
          <p className="text-sm text-muted-foreground">
            {profile?.nome_fantasia || profile?.nome || "O prestador"} foi notificado e entrará em contato em breve.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent via-background to-background">
      <div className="mx-auto max-w-md px-4 py-6 space-y-4">
        <div className="flex items-center gap-3">
          {profile?.logo_url ? (
            <img src={profile.logo_url} alt="" className="h-12 w-12 rounded-xl object-cover border" />
          ) : (
            <div className="h-12 w-12 rounded-xl gradient-primary grid place-items-center"><Building2 className="h-6 w-6 text-primary-foreground" /></div>
          )}
          <div>
            <p className="font-bold text-lg leading-tight">{profile?.nome_fantasia || profile?.nome || "Prestador"}</p>
            {profile?.cidade && <p className="text-xs text-muted-foreground">{profile.cidade}</p>}
          </div>
        </div>

        <Card className="p-5 gradient-card border-primary/30">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Orçamento #{String(os.numero).padStart(4,"0")}</p>
          <p className="mt-1 text-4xl font-extrabold text-primary">{formatBRL(os.valor_total)}</p>
          {cliente?.nome && <p className="mt-2 text-sm">Para: <strong>{cliente.nome}</strong></p>}
          {os.data_execucao && <p className="text-sm text-muted-foreground">Execução: {formatDate(os.data_execucao)}</p>}
        </Card>

        {os.descricao && (
          <Card className="p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Descrição</p>
            <p className="mt-1 whitespace-pre-wrap text-sm">{os.descricao}</p>
          </Card>
        )}

        {itens.length > 0 && (
          <Card className="p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Itens</p>
            <div className="space-y-2">
              {itens.map((it: any, i: number) => (
                <div key={i} className="flex justify-between items-start text-sm border-b last:border-0 pb-2 last:pb-0">
                  <div className="flex-1">
                    <p className="font-medium">{it.descricao}</p>
                    <p className="text-xs text-muted-foreground">{it.quantidade} × {formatBRL(it.valor_unitario)}</p>
                  </div>
                  <p className="font-semibold">{formatBRL(it.quantidade * it.valor_unitario)}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nome">Seu nome completo</Label>
            <Input id="nome" required value={nome} onChange={e=>setNome(e.target.value)} className="h-12 rounded-xl" />
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox checked={aceito} onCheckedChange={(v) => setAceito(!!v)} className="mt-0.5" />
            <span className="text-sm">Li e concordo com o orçamento apresentado.</span>
          </label>
          <Button onClick={enviarAceite} disabled={!nome.trim() || !aceito || enviando} size="lg" className="w-full h-12 gradient-primary font-semibold">
            {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : "Aceitar Orçamento"}
          </Button>
        </Card>

        <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
          Enviado por <Sparkles className="h-3 w-3 text-primary" /> <strong className="text-primary">OrcaJá</strong>
        </p>
      </div>
    </div>
  );
}
