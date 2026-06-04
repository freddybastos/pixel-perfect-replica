import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { formatBRL, formatDate } from "@/lib/format";
import { Plus, TrendingUp, TrendingDown, Wallet, FileText, ChevronRight } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip } from "recharts";
import { toast } from "sonner";

export default function Financeiro() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mes, setMes] = useState(new Date().getMonth());
  const [ano, setAno] = useState(new Date().getFullYear());
  const [pagamentos, setPagamentos] = useState<any[]>([]);
  const [despesas, setDespesas] = useState<any[]>([]);
  const [openDespesa, setOpenDespesa] = useState(false);
  const [dDesc, setDDesc] = useState(""); const [dValor, setDValor] = useState(""); const [dCat, setDCat] = useState("Material");

  const start = new Date(ano, mes, 1);
  const end = new Date(ano, mes+1, 0);

  const load = async () => {
    const { data: pags } = await supabase.from("pagamentos")
      .select("*, ordens_servico(numero, clientes(nome))")
      .gte("created_at", start.toISOString()).lte("created_at", end.toISOString() + "T23:59:59");
    setPagamentos(pags ?? []);
    const { data: des } = await supabase.from("despesas")
      .select("*").gte("data", start.toISOString().slice(0,10)).lte("data", end.toISOString().slice(0,10));
    setDespesas(des ?? []);
  };
  useEffect(() => { if (user) load(); }, [user, mes, ano]);

  const recebido = useMemo(()=>pagamentos.filter(p=>p.status==="pago").reduce((s,p)=>s+Number(p.valor),0),[pagamentos]);
  const aReceber = useMemo(()=>pagamentos.filter(p=>p.status==="pendente").reduce((s,p)=>s+Number(p.valor),0),[pagamentos]);
  const totalDespesas = useMemo(()=>despesas.reduce((s,d)=>s+Number(d.valor),0),[despesas]);
  const lucro = recebido - totalDespesas;

  const chart = useMemo(() => {
    const days = end.getDate();
    return Array.from({length: days}, (_,i) => {
      const dia = i+1;
      const ds = new Date(ano, mes, dia).toDateString();
      const v = pagamentos.filter(p => p.status==="pago" && new Date(p.created_at).toDateString()===ds).reduce((s,p)=>s+Number(p.valor),0);
      return { d: String(dia), v };
    });
  }, [pagamentos, mes, ano, end]);

  const pendentes = pagamentos.filter(p => p.status === "pendente");

  const salvarDespesa = async () => {
    if (!dDesc.trim() || !dValor) { toast.error("Preencha os campos"); return; }
    const { error } = await supabase.from("despesas").insert({
      user_id: user!.id, descricao: dDesc, valor: Number(dValor), categoria: dCat, data: new Date().toISOString().slice(0,10),
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Despesa registrada");
    setOpenDespesa(false); setDDesc(""); setDValor(""); load();
  };

  return (
    <AppShell>
      <PageHeader title="Financeiro" />
      <div className="px-4 py-4 space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Select value={String(mes)} onValueChange={v=>setMes(Number(v))}>
            <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>{Array.from({length:12},(_,i)=><SelectItem key={i} value={String(i)}>{new Date(2000,i,1).toLocaleDateString("pt-BR",{month:"long"})}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={String(ano)} onValueChange={v=>setAno(Number(v))}>
            <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>{[2024,2025,2026].map(y=><SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <Card className="overflow-hidden border-0 gradient-primary text-primary-foreground shadow-elevated p-5">
          <p className="text-xs uppercase tracking-wider opacity-90">Faturamento do mês</p>
          <p className="mt-1 text-3xl font-extrabold">{formatBRL(recebido)}</p>
          <div className="mt-2 text-sm opacity-90">Lucro: <strong>{formatBRL(lucro)}</strong></div>
        </Card>

        <div className="grid grid-cols-2 gap-2">
          <Card className="p-3"><div className="flex items-center gap-2 text-xs text-muted-foreground"><Wallet className="h-3.5 w-3.5 text-warning-foreground" /> A receber</div><p className="mt-1 font-bold">{formatBRL(aReceber)}</p></Card>
          <Card className="p-3"><div className="flex items-center gap-2 text-xs text-muted-foreground"><TrendingDown className="h-3.5 w-3.5 text-destructive" /> Despesas</div><p className="mt-1 font-bold">{formatBRL(totalDespesas)}</p></Card>
        </div>

        <Card className="p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Faturamento diário</p>
          <div className="h-32">
            <ResponsiveContainer>
              <LineChart data={chart}>
                <XAxis dataKey="d" tickLine={false} axisLine={false} fontSize={10} interval={Math.floor(chart.length/6)} />
                <Tooltip contentStyle={{borderRadius:12, border:"1px solid hsl(var(--border))", fontSize:12}} formatter={(v:number)=>formatBRL(v)} />
                <Line type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Cobranças pendentes</p>
            {pendentes.length > 0 && <span className="text-xs text-muted-foreground">{pendentes.length}</span>}
          </div>
          {pendentes.length === 0 ? <Card className="p-6 text-center text-sm text-muted-foreground">Nenhuma cobrança pendente</Card> :
            <div className="space-y-2">
              {pendentes.map(p => (
                <Card key={p.id} className="p-3 cursor-pointer hover:shadow-soft" onClick={()=>p.os_id && navigate(`/os/${p.os_id}/cobranca`)}>
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold truncate">{p.ordens_servico?.clientes?.nome || "—"}</p>
                      <p className="text-xs text-muted-foreground">OS #{String(p.ordens_servico?.numero ?? "----").padStart(4,"0")} • {formatDate(p.created_at)}</p>
                    </div>
                    <div className="text-right"><p className="font-bold">{formatBRL(p.valor)}</p><StatusBadge status={p.status} className="mt-1" /></div>
                  </div>
                </Card>
              ))}
            </div>
          }
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Despesas</p>
            <Button size="sm" variant="outline" onClick={()=>setOpenDespesa(true)} className="rounded-lg"><Plus className="h-3.5 w-3.5" /> Nova</Button>
          </div>
          {despesas.length === 0 ? <Card className="p-6 text-center text-sm text-muted-foreground">Sem despesas no período</Card> :
            <div className="space-y-2">
              {despesas.map(d => (
                <Card key={d.id} className="p-3"><div className="flex items-center justify-between"><div><p className="font-semibold text-sm">{d.descricao}</p><p className="text-xs text-muted-foreground">{d.categoria} • {formatDate(d.data)}</p></div><p className="font-bold text-destructive">-{formatBRL(d.valor)}</p></div></Card>
              ))}
            </div>
          }
        </div>

        <Card onClick={()=>navigate("/fiscal")} className="p-4 flex items-center gap-3 cursor-pointer hover:shadow-soft transition-base">
          <div className="grid h-11 w-11 place-items-center rounded-xl gradient-primary text-primary-foreground"><FileText className="h-5 w-5" /></div>
          <div className="flex-1">
            <p className="font-semibold">Central Fiscal</p>
            <p className="text-xs text-muted-foreground">Emitir e organizar suas guias DAS do MEI</p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </Card>

        <Button variant="outline" className="w-full h-12 rounded-xl" onClick={()=>toast.info("Exportação em PDF em breve")}>
          <TrendingUp className="h-4 w-4" /> Exportar Relatório
        </Button>
      </div>

      <Dialog open={openDespesa} onOpenChange={setOpenDespesa}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader><DialogTitle>Nova despesa</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Descrição</Label><Input value={dDesc} onChange={e=>setDDesc(e.target.value)} className="h-11 rounded-lg" /></div>
            <div className="space-y-1.5"><Label>Valor</Label><Input type="number" step="0.01" value={dValor} onChange={e=>setDValor(e.target.value)} className="h-11 rounded-lg" /></div>
            <div className="space-y-1.5"><Label>Categoria</Label>
              <Select value={dCat} onValueChange={setDCat}>
                <SelectTrigger className="h-11 rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>{["Material","Transporte","Ferramentas","Marketing","Impostos","Outro"].map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={()=>setOpenDespesa(false)}>Cancelar</Button><Button onClick={salvarDespesa} className="gradient-primary">Salvar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
