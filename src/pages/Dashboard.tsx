import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { formatBRL, formatDateShort } from "@/lib/format";
import { Plus, TrendingUp, Wallet, Calendar, ChevronRight, Settings, Bell } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from "recharts";

interface OS { id: string; numero: number; descricao: string | null; valor_total: number; status: string; data_execucao: string | null; clientes: { nome: string } | null; }

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [osList, setOsList] = useState<OS[]>([]);
  const [pendentes, setPendentes] = useState(0);
  const [faturamentoMes, setFaturamentoMes] = useState(0);
  const [pagPendente, setPagPendente] = useState(0);
  const [chart, setChart] = useState<{ d: string; v: number }[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: prof } = await supabase.from("profiles").select("nome").eq("id", user.id).maybeSingle();
      if (prof) setNome(prof.nome.split(" ")[0]);

      const { data: os } = await supabase
        .from("ordens_servico")
        .select("id, numero, descricao, valor_total, status, data_execucao, clientes(nome)")
        .order("created_at", { ascending: false })
        .limit(5);
      setOsList((os as any) ?? []);

      const { count } = await supabase
        .from("ordens_servico").select("id", { count: "exact", head: true })
        .in("status", ["enviado", "aceito", "em_andamento"]);
      setPendentes(count ?? 0);

      const start = new Date(); start.setDate(1); start.setHours(0,0,0,0);
      const { data: pagos } = await supabase
        .from("pagamentos").select("valor, status, created_at")
        .gte("created_at", start.toISOString());
      setFaturamentoMes((pagos ?? []).filter((p:any)=>p.status==="pago").reduce((s:number,p:any)=>s+Number(p.valor),0));
      setPagPendente((pagos ?? []).filter((p:any)=>p.status==="pendente").reduce((s:number,p:any)=>s+Number(p.valor),0));

      // weekly chart from pagos pagos
      const days = Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));return d;});
      const chartData = days.map(d => ({
        d: d.toLocaleDateString("pt-BR",{weekday:"short"}).slice(0,3),
        v: (pagos ?? []).filter((p:any)=>p.status==="pago" && new Date(p.created_at).toDateString()===d.toDateString())
            .reduce((s:number,p:any)=>s+Number(p.valor),0),
      }));
      setChart(chartData);
    })();
  }, [user]);

  return (
    <AppShell>
      <div className="px-4 pt-6 pb-4 flex items-start justify-between safe-top">
        <div>
          <p className="text-sm text-muted-foreground">Olá,</p>
          <h1 className="text-2xl font-extrabold tracking-tight">{nome || "bem-vindo"} 👋</h1>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full"><Bell className="h-5 w-5" /></Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={()=>navigate("/configuracoes")}><Settings className="h-5 w-5" /></Button>
        </div>
      </div>

      <div className="px-4">
        <Card className="overflow-hidden border-0 gradient-primary text-primary-foreground shadow-elevated">
          <div className="p-5">
            <p className="text-xs font-medium opacity-90 uppercase tracking-wider">Faturamento do mês</p>
            <p className="mt-1 text-3xl font-extrabold tracking-tight">{formatBRL(faturamentoMes)}</p>
            <div className="mt-4 flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5"><Wallet className="h-4 w-4" /><span className="opacity-90">A receber: <strong>{formatBRL(pagPendente)}</strong></span></div>
              <button onClick={()=>navigate("/financeiro")} className="flex items-center gap-1 font-semibold">
                Ver <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Card>
      </div>

      <div className="px-4 mt-4 grid grid-cols-2 gap-3">
        <Button onClick={()=>navigate("/os/nova")} className="h-14 gradient-primary font-semibold shadow-soft text-base rounded-2xl">
          <Plus className="h-5 w-5" /> Nova OS
        </Button>
        <Button variant="outline" onClick={()=>navigate("/agenda")} className="h-14 rounded-2xl font-semibold text-base border-2">
          <Calendar className="h-5 w-5" /> Agenda
        </Button>
      </div>

      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Faturamento da semana</h2>
        </div>
        <Card className="p-4">
          <div className="h-32">
            <ResponsiveContainer>
              <BarChart data={chart}>
                <XAxis dataKey="d" tickLine={false} axisLine={false} fontSize={11} />
                <Tooltip cursor={{ fill: "hsl(var(--accent))" }} contentStyle={{borderRadius: 12, border: "1px solid hsl(var(--border))", fontSize: 12}} formatter={(v:number)=>formatBRL(v)} />
                <Bar dataKey="v" fill="hsl(var(--primary))" radius={[8,8,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Últimas OS</h2>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5" /> {pendentes} pendentes
          </div>
        </div>
        {osList.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            Você ainda não tem ordens de serviço. <br />
            <Link to="/os/nova" className="text-primary font-semibold">Criar a primeira →</Link>
          </Card>
        ) : (
          <div className="space-y-2">
            {osList.map((os) => (
              <Link key={os.id} to={`/os/${os.id}`}>
                <Card className="p-4 transition-base hover:shadow-soft hover:border-primary/30">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground">#{String(os.numero).padStart(4,"0")}</span>
                        <StatusBadge status={os.status} />
                      </div>
                      <p className="mt-1 truncate font-semibold">{os.clientes?.nome || "Sem cliente"}</p>
                      <p className="truncate text-xs text-muted-foreground">{os.descricao || "—"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatBRL(os.valor_total)}</p>
                      <p className="text-xs text-muted-foreground">{formatDateShort(os.data_execucao)}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
