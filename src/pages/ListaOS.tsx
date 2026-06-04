import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { formatBRL, formatDateShort } from "@/lib/format";
import { Plus, Search, FileText } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OS { id: string; numero: number; descricao: string | null; valor_total: number; status: string; data_execucao: string | null; clientes: { nome: string } | null; }

export default function ListaOS() {
  const [items, setItems] = useState<OS[]>([]);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todas");

  useEffect(() => {
    let q = supabase.from("ordens_servico")
      .select("id, numero, descricao, valor_total, status, data_execucao, clientes(nome)")
      .order("created_at", { ascending: false });
    if (filtro !== "todas") q = q.eq("status", filtro as any);
    q.then(({ data }) => setItems((data as any) ?? []));
  }, [filtro]);

  const visible = items.filter(o =>
    !busca || (o.clientes?.nome.toLowerCase().includes(busca.toLowerCase()) || o.descricao?.toLowerCase().includes(busca.toLowerCase()))
  );

  return (
    <AppShell>
      <PageHeader title="Ordens de Serviço" right={
        <Link to="/os/nova"><Button size="sm" className="gradient-primary rounded-lg"><Plus className="h-4 w-4" /></Button></Link>
      } />
      <div className="px-4 py-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por cliente ou descrição..." value={busca} onChange={e=>setBusca(e.target.value)} className="h-11 pl-9 rounded-xl" />
        </div>
        <Tabs value={filtro} onValueChange={setFiltro}>
          <TabsList className="w-full overflow-x-auto justify-start gap-1 bg-transparent p-0 h-auto">
            {[["todas","Todas"],["rascunho","Rascunhos"],["enviado","Enviados"],["aceito","Aceitos"],["em_andamento","Em andamento"],["concluido","Concluídos"]].map(([v,l]) => (
              <TabsTrigger key={v} value={v} className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground bg-muted text-xs h-8 px-3">{l}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        {visible.length === 0 ? (
          <Card className="p-10 text-center mt-6">
            <FileText className="h-10 w-10 mx-auto text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">Nenhuma OS encontrada</p>
            <Link to="/os/nova"><Button className="mt-4 gradient-primary"><Plus className="h-4 w-4" /> Criar OS</Button></Link>
          </Card>
        ) : (
          <div className="space-y-2">
            {visible.map(os => (
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
