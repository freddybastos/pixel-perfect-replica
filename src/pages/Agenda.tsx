import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { formatBRL } from "@/lib/format";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Agenda() {
  const navigate = useNavigate();
  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState<Date>(new Date());
  const [items, setItems] = useState<any[]>([]);

  const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);

  useEffect(() => {
    const start = monthStart.toISOString().slice(0,10);
    const end = monthEnd.toISOString().slice(0,10);
    supabase.from("ordens_servico")
      .select("id, numero, descricao, valor_total, status, data_execucao, clientes(nome)")
      .gte("data_execucao", start).lte("data_execucao", end)
      .then(({ data }) => setItems(data ?? []));
  }, [cursor]);

  const dias = useMemo(() => {
    const startDay = monthStart.getDay();
    const total = monthEnd.getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let d = 1; d <= total; d++) cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    return cells;
  }, [cursor]);

  const countByDay = useMemo(() => {
    const m = new Map<string, number>();
    items.forEach(i => { if (i.data_execucao) m.set(i.data_execucao, (m.get(i.data_execucao) ?? 0) + 1); });
    return m;
  }, [items]);

  const selStr = selected.toISOString().slice(0,10);
  const doDia = items.filter(i => i.data_execucao === selStr);

  return (
    <AppShell>
      <PageHeader title="Agenda" right={
        <Button size="sm" className="gradient-primary rounded-lg" onClick={()=>navigate(`/os/nova?data=${selStr}`)}><Plus className="h-4 w-4" /></Button>
      } />
      <div className="px-4 py-4 space-y-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <Button variant="ghost" size="icon" onClick={()=>setCursor(new Date(cursor.getFullYear(), cursor.getMonth()-1, 1))}><ChevronLeft className="h-4 w-4" /></Button>
            <p className="font-semibold capitalize">{cursor.toLocaleDateString("pt-BR",{month:"long",year:"numeric"})}</p>
            <Button variant="ghost" size="icon" onClick={()=>setCursor(new Date(cursor.getFullYear(), cursor.getMonth()+1, 1))}><ChevronRight className="h-4 w-4" /></Button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted-foreground mb-1">
            {["D","S","T","Q","Q","S","S"].map((d,i)=><div key={i}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {dias.map((d, i) => {
              if (!d) return <div key={i} />;
              const ds = d.toISOString().slice(0,10);
              const isSel = ds === selStr;
              const isToday = ds === new Date().toISOString().slice(0,10);
              const c = countByDay.get(ds) ?? 0;
              return (
                <button key={i} onClick={()=>setSelected(d)} className={cn(
                  "aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-base relative",
                  isSel ? "bg-primary text-primary-foreground font-bold shadow-soft" :
                  isToday ? "border border-primary text-primary font-semibold" :
                  "hover:bg-accent"
                )}>
                  {d.getDate()}
                  {c > 0 && !isSel && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" />}
                </button>
              );
            })}
          </div>
        </Card>

        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Serviços de {selected.toLocaleDateString("pt-BR",{day:"2-digit", month:"long"})}
          </p>
          {doDia.length === 0 ? (
            <Card className="p-8 text-center text-sm text-muted-foreground">Nenhum serviço agendado</Card>
          ) : (
            <div className="space-y-2">
              {doDia.map((os:any) => (
                <Link key={os.id} to={`/os/${os.id}`}>
                  <Card className="p-4 transition-base hover:shadow-soft hover:border-primary/30">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2"><span className="text-xs font-mono">#{String(os.numero).padStart(4,"0")}</span><StatusBadge status={os.status} /></div>
                        <p className="mt-1 truncate font-semibold">{os.clientes?.nome || "Sem cliente"}</p>
                        <p className="truncate text-xs text-muted-foreground">{os.descricao || "—"}</p>
                      </div>
                      <p className="font-bold">{formatBRL(os.valor_total)}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
