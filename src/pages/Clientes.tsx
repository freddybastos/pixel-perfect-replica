import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Plus, Search, Users, Phone, MapPin, FileText } from "lucide-react";
import { formatBRL, formatDateShort } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { z } from "zod";
import { toast } from "sonner";

interface Cliente { id: string; nome: string; telefone: string | null; email: string | null; endereco: string | null; created_at: string; }

export default function Clientes() {
  const { user } = useAuth();
  const [items, setItems] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState("");
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Cliente | null>(null);
  const [detail, setDetail] = useState<Cliente | null>(null);
  const [historico, setHistorico] = useState<any[]>([]);

  const [nome, setNome] = useState(""); const [tel, setTel] = useState(""); const [email, setEmail] = useState(""); const [end, setEnd] = useState("");

  const load = async () => {
    const { data } = await supabase.from("clientes").select("*").order("nome");
    setItems(data ?? []);
  };
  useEffect(() => { if (user) load(); }, [user]);

  useEffect(() => {
    if (!detail) return;
    supabase.from("ordens_servico").select("id, numero, descricao, valor_total, status, data_execucao").eq("cliente_id", detail.id).order("created_at", { ascending: false }).then(({data}) => setHistorico(data ?? []));
  }, [detail]);

  const openNovo = () => { setEdit(null); setNome(""); setTel(""); setEmail(""); setEnd(""); setOpen(true); };
  const openEditar = (c: Cliente) => { setEdit(c); setNome(c.nome); setTel(c.telefone||""); setEmail(c.email||""); setEnd(c.endereco||""); setOpen(true); setDetail(null); };

  const salvar = async () => {
    const schema = z.object({ nome: z.string().trim().min(2,"Nome muito curto").max(100), telefone: z.string().trim().max(20).optional(), email: z.string().trim().email().optional().or(z.literal("")), endereco: z.string().trim().max(255).optional() });
    const parsed = schema.safeParse({ nome, telefone: tel, email, endereco: end });
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    const payload = { user_id: user!.id, nome: parsed.data.nome, telefone: tel || null, email: email || null, endereco: end || null };
    const res = edit
      ? await supabase.from("clientes").update(payload).eq("id", edit.id)
      : await supabase.from("clientes").insert(payload);
    if (res.error) { toast.error(res.error.message); return; }
    toast.success(edit ? "Cliente atualizado" : "Cliente criado");
    setOpen(false); load();
  };

  const filtrados = items.filter(c => !busca || c.nome.toLowerCase().includes(busca.toLowerCase()) || (c.telefone||"").includes(busca));

  return (
    <AppShell>
      <PageHeader title="Clientes" right={<Button size="sm" onClick={openNovo} className="gradient-primary rounded-lg"><Plus className="h-4 w-4" /></Button>} />
      <div className="px-4 py-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou WhatsApp..." value={busca} onChange={e=>setBusca(e.target.value)} className="h-11 pl-9 rounded-xl" />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full bg-accent text-accent-foreground px-2.5 py-1 font-semibold">
            <Users className="h-3 w-3" /> {items.length} clientes
          </span>
        </div>
        {filtrados.length === 0 ? (
          <Card className="p-10 text-center"><Users className="h-10 w-10 mx-auto text-muted-foreground/40" /><p className="mt-3 text-sm text-muted-foreground">Nenhum cliente</p></Card>
        ) : (
          <div className="space-y-2">
            {filtrados.map(c => (
              <Card key={c.id} onClick={()=>setDetail(c)} className="p-4 cursor-pointer transition-base hover:shadow-soft hover:border-primary/30">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary font-bold">{c.nome[0]?.toUpperCase()}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{c.nome}</p>
                    <p className="truncate text-xs text-muted-foreground">{c.telefone || c.email || "—"}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader><DialogTitle>{edit ? "Editar cliente" : "Novo cliente"}</DialogTitle><DialogDescription>Preencha os dados de contato</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Nome *</Label><Input value={nome} onChange={e=>setNome(e.target.value)} className="h-11 rounded-lg" /></div>
            <div className="space-y-1.5"><Label>Telefone</Label><Input type="tel" value={tel} onChange={e=>setTel(e.target.value)} className="h-11 rounded-lg" /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="h-11 rounded-lg" /></div>
            <div className="space-y-1.5"><Label>Endereço</Label><Input value={end} onChange={e=>setEnd(e.target.value)} className="h-11 rounded-lg" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={()=>setOpen(false)}>Cancelar</Button><Button onClick={salvar} className="gradient-primary">Salvar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={!!detail} onOpenChange={o=>!o&&setDetail(null)}>
        <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-auto">
          {detail && (
            <>
              <SheetHeader><SheetTitle className="text-left">{detail.nome}</SheetTitle></SheetHeader>
              <div className="mt-4 space-y-3">
                {detail.telefone && <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-primary" /> {detail.telefone}</div>}
                {detail.endereco && <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-primary" /> {detail.endereco}</div>}
                <Button onClick={()=>openEditar(detail)} variant="outline" className="w-full rounded-xl">Editar cliente</Button>
                <div className="pt-2">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1"><FileText className="h-3 w-3" /> Histórico</p>
                  {historico.length === 0 ? <p className="text-sm text-muted-foreground">Sem ordens de serviço</p> :
                    <div className="space-y-2">
                      {historico.map((os: any) => (
                        <Card key={os.id} className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2"><span className="text-xs font-mono">#{String(os.numero).padStart(4,"0")}</span><StatusBadge status={os.status} /></div>
                              <p className="truncate text-sm mt-1">{os.descricao || "—"}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-sm">{formatBRL(os.valor_total)}</p>
                              <p className="text-xs text-muted-foreground">{formatDateShort(os.data_execucao)}</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  }
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}
