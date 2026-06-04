import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, FileText, Plus, Upload, Loader2, CheckCircle2, AlertCircle, Clock, Trash2, Download } from "lucide-react";
import { toast } from "sonner";
import { formatBRL as brl } from "@/lib/format";

const PORTAL_DAS = "https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/";

type Guia = {
  id: string;
  competencia: string;
  valor: number;
  vencimento: string;
  data_pagamento: string | null;
  status: string;
  pdf_url: string | null;
  observacoes: string | null;
};

const statusInfo = (g: Guia) => {
  if (g.status === "pago") return { label: "Pago", icon: CheckCircle2, cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" };
  const venc = new Date(g.vencimento);
  if (venc < new Date()) return { label: "Atrasado", icon: AlertCircle, cls: "bg-destructive/15 text-destructive" };
  return { label: "Pendente", icon: Clock, cls: "bg-amber-500/15 text-amber-700 dark:text-amber-400" };
};

export default function Fiscal() {
  const { user } = useAuth();
  const [guias, setGuias] = useState<Guia[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ competencia: "", valor: "", vencimento: "", file: null as File | null });

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from("guias_das").select("*").order("competencia", { ascending: false });
    setGuias((data ?? []) as Guia[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, [user]);

  const proximoVencimento = (() => {
    const d = new Date();
    const m = d.getMonth() + 1; const y = d.getFullYear();
    const venc = new Date(y, m, 20); // dia 20 do mês seguinte
    return venc;
  })();

  const totalPago = guias.filter(g => g.status === "pago").reduce((s, g) => s + Number(g.valor), 0);
  const pendentes = guias.filter(g => g.status !== "pago").length;

  const abrirReceita = () => {
    window.open(PORTAL_DAS, "_blank", "noopener,noreferrer");
    toast.success("Portal da Receita aberto", { description: "Após emitir, volte aqui e importe o PDF da guia." });
  };

  const salvar = async () => {
    if (!user || !form.competencia || !form.valor || !form.vencimento) {
      toast.error("Preencha competência, valor e vencimento"); return;
    }
    setSaving(true);
    let pdf_url: string | null = null;
    if (form.file) {
      const path = `${user.id}/${Date.now()}-${form.file.name}`;
      const { error: upErr } = await supabase.storage.from("guias-fiscais").upload(path, form.file);
      if (upErr) { toast.error(upErr.message); setSaving(false); return; }
      const { data: signed } = await supabase.storage.from("guias-fiscais").createSignedUrl(path, 60 * 60 * 24 * 365);
      pdf_url = signed?.signedUrl ?? path;
    }
    const { error } = await supabase.from("guias_das").insert({
      user_id: user.id,
      competencia: form.competencia + "-01",
      valor: Number(form.valor),
      vencimento: form.vencimento,
      pdf_url,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Guia importada");
    setForm({ competencia: "", valor: "", vencimento: "", file: null });
    setOpen(false); load();
  };

  const marcarPaga = async (g: Guia) => {
    const { error } = await supabase.from("guias_das").update({
      status: "pago", data_pagamento: new Date().toISOString().slice(0, 10),
    }).eq("id", g.id);
    if (error) return toast.error(error.message);
    toast.success("Guia marcada como paga"); load();
  };

  const excluir = async (g: Guia) => {
    const { error } = await supabase.from("guias_das").delete().eq("id", g.id);
    if (error) return toast.error(error.message);
    toast.success("Guia removida"); load();
  };

  return (
    <AppShell>
      <PageHeader title="Central Fiscal" subtitle="Suas guias DAS do MEI" />
      <div className="px-4 py-4 space-y-5">

        {/* Resumo */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Próximo DAS</p>
            <p className="font-bold text-lg">{proximoVencimento.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</p>
            <p className="text-xs text-muted-foreground mt-1">Vence todo dia 20</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Pago no ano</p>
            <p className="font-bold text-lg">{brl(totalPago)}</p>
            <p className="text-xs text-muted-foreground mt-1">{pendentes} pendente(s)</p>
          </Card>
        </div>

        {/* CTA Receita */}
        <Card className="p-4 gradient-card border-primary/30 space-y-3">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl gradient-primary text-primary-foreground shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">Emitir DAS na Receita Federal</p>
              <p className="text-xs text-muted-foreground">Acesse o portal oficial PGMEI, gere a guia em PDF e importe aqui.</p>
            </div>
          </div>
          <Button onClick={abrirReceita} className="w-full h-11 gradient-primary rounded-xl font-semibold">
            <ExternalLink className="h-4 w-4" /> Abrir Portal PGMEI
          </Button>
        </Card>

        {/* Importar */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full h-11 rounded-xl">
              <Plus className="h-4 w-4" /> Importar guia DAS
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Importar guia DAS</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Competência</Label>
                <Input type="month" value={form.competencia} onChange={e => setForm({ ...form, competencia: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Valor</Label>
                <Input type="number" step="0.01" placeholder="75.90" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Vencimento</Label>
                <Input type="date" value={form.vencimento} onChange={e => setForm({ ...form, vencimento: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>PDF da guia (opcional)</Label>
                <label className="block">
                  <input type="file" accept="application/pdf" className="hidden" onChange={e => setForm({ ...form, file: e.target.files?.[0] ?? null })} />
                  <Button asChild variant="outline" className="w-full rounded-lg">
                    <span><Upload className="h-4 w-4" /> {form.file ? form.file.name : "Anexar PDF"}</span>
                  </Button>
                </label>
              </div>
              <Button onClick={salvar} disabled={saving} className="w-full h-11 gradient-primary rounded-xl">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar guia"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Histórico */}
        <section className="space-y-3">
          <h2 className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Histórico</h2>
          {loading ? (
            <div className="py-8 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" /></div>
          ) : guias.length === 0 ? (
            <Card className="p-6 text-center text-sm text-muted-foreground">
              Nenhuma guia importada ainda.
            </Card>
          ) : (
            <div className="space-y-2">
              {guias.map(g => {
                const s = statusInfo(g);
                const Icon = s.icon;
                const comp = new Date(g.competencia).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
                return (
                  <Card key={g.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold capitalize truncate">{comp}</p>
                        <p className="text-xs text-muted-foreground">Vence em {new Date(g.vencimento).toLocaleDateString("pt-BR")}</p>
                      </div>
                      <Badge className={s.cls + " gap-1 border-0"}><Icon className="h-3 w-3" />{s.label}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="font-bold">{brl(Number(g.valor))}</p>
                      <div className="flex gap-1">
                        {g.pdf_url && (
                          <Button size="icon" variant="ghost" asChild className="h-8 w-8">
                            <a href={g.pdf_url} target="_blank" rel="noreferrer"><Download className="h-4 w-4" /></a>
                          </Button>
                        )}
                        {g.status !== "pago" && (
                          <Button size="sm" variant="outline" className="h-8 rounded-lg" onClick={() => marcarPaga(g)}>
                            Marcar paga
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => excluir(g)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
