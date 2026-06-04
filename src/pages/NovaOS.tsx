import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, UserPlus, Loader2, Search } from "lucide-react";
import { formatBRL } from "@/lib/format";
import { toast } from "sonner";

interface Cliente { id: string; nome: string; telefone: string | null; }
interface Item { descricao: string; quantidade: number; valor_unitario: number; }

export default function NovaOS() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteId, setClienteId] = useState<string>("");
  const [busca, setBusca] = useState("");
  const [endereco, setEndereco] = useState("");
  const [descricao, setDescricao] = useState("");
  const [data, setData] = useState("");
  const [itens, setItens] = useState<Item[]>([{ descricao: "", quantidade: 1, valor_unitario: 0 }]);
  const [saving, setSaving] = useState(false);
  const [openNovo, setOpenNovo] = useState(false);
  const [nNome, setNNome] = useState(""); const [nTel, setNTel] = useState(""); const [nEnd, setNEnd] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase.from("clientes").select("id, nome, telefone").order("nome").then(({ data }) => setClientes(data ?? []));
  }, [user]);

  const total = itens.reduce((s, i) => s + (Number(i.quantidade) || 0) * (Number(i.valor_unitario) || 0), 0);

  const filtrados = busca ? clientes.filter(c => c.nome.toLowerCase().includes(busca.toLowerCase())) : clientes;
  const clienteSelecionado = clientes.find(c => c.id === clienteId);

  const addItem = () => setItens([...itens, { descricao: "", quantidade: 1, valor_unitario: 0 }]);
  const updateItem = (i: number, patch: Partial<Item>) => setItens(itens.map((it, idx) => idx === i ? { ...it, ...patch } : it));
  const removeItem = (i: number) => setItens(itens.length > 1 ? itens.filter((_, idx) => idx !== i) : itens);

  const criarCliente = async () => {
    const schema = z.object({ nome: z.string().trim().min(2).max(100), telefone: z.string().trim().max(20).optional(), endereco: z.string().trim().max(255).optional() });
    const parsed = schema.safeParse({ nome: nNome, telefone: nTel || undefined, endereco: nEnd || undefined });
    if (!parsed.success) { toast.error("Nome obrigatório"); return; }
    const { data, error } = await supabase.from("clientes").insert({ user_id: user!.id, nome: parsed.data.nome, telefone: parsed.data.telefone, endereco: parsed.data.endereco }).select().single();
    if (error) { toast.error(error.message); return; }
    setClientes([data, ...clientes]); setClienteId(data.id); setOpenNovo(false);
    setNNome(""); setNTel(""); setNEnd("");
    toast.success("Cliente criado");
  };

  const salvar = async (status: "rascunho" | "enviado") => {
    if (!user) return;
    setSaving(true);
    const { data: os, error } = await supabase.from("ordens_servico").insert({
      user_id: user.id,
      cliente_id: clienteId || null,
      endereco: endereco || null,
      descricao: descricao || null,
      data_execucao: data || null,
      valor_total: total,
      status,
    }).select().single();
    if (error || !os) { setSaving(false); toast.error(error?.message || "Erro"); return; }

    const itensOk = itens.filter(i => i.descricao.trim());
    if (itensOk.length) {
      const { error: e2 } = await supabase.from("itens_os").insert(itensOk.map((i, idx) => ({
        os_id: os.id, descricao: i.descricao, quantidade: Number(i.quantidade), valor_unitario: Number(i.valor_unitario), ordem: idx,
      })));
      if (e2) { setSaving(false); toast.error(e2.message); return; }
    }
    setSaving(false);
    toast.success(status === "rascunho" ? "Rascunho salvo" : "OS criada e pronta para enviar");
    navigate(status === "enviado" ? `/os/${os.id}/compartilhar` : `/os/${os.id}`);
  };

  return (
    <AppShell>
      <PageHeader title="Nova OS" subtitle="Preencha os dados do serviço" back="/dashboard" />
      <div className="px-4 py-4 space-y-5 animate-fade-in">

        <section className="space-y-2">
          <Label>Cliente</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={clienteSelecionado?.nome || "Buscar cliente..."}
              value={busca} onChange={e=>{setBusca(e.target.value); setClienteId("")}}
              className="h-12 pl-9 rounded-xl"
            />
          </div>
          {busca && (
            <Card className="max-h-48 overflow-auto p-1">
              {filtrados.length === 0 ? <p className="p-3 text-sm text-muted-foreground">Nenhum cliente encontrado</p> :
                filtrados.map(c => (
                  <button key={c.id} type="button" onClick={()=>{setClienteId(c.id); setBusca("")}} className="block w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-accent">
                    <p className="font-medium">{c.nome}</p>
                    {c.telefone && <p className="text-xs text-muted-foreground">{c.telefone}</p>}
                  </button>
                ))
              }
            </Card>
          )}
          <Button type="button" variant="outline" size="sm" onClick={()=>setOpenNovo(true)} className="rounded-lg">
            <UserPlus className="h-4 w-4" /> Novo cliente
          </Button>
        </section>

        <section className="space-y-2">
          <Label htmlFor="end">Endereço do serviço</Label>
          <Input id="end" value={endereco} onChange={e=>setEndereco(e.target.value)} className="h-12 rounded-xl" />
        </section>

        <section className="space-y-2">
          <Label htmlFor="desc">Descrição do serviço</Label>
          <Textarea id="desc" rows={3} value={descricao} onChange={e=>setDescricao(e.target.value)} className="rounded-xl resize-none" placeholder="Descreva o que será feito..." />
        </section>

        <section className="space-y-2">
          <Label htmlFor="data">Data de execução</Label>
          <Input id="data" type="date" value={data} onChange={e=>setData(e.target.value)} className="h-12 rounded-xl" />
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Itens</Label>
            <Button type="button" variant="ghost" size="sm" onClick={addItem}><Plus className="h-4 w-4" /> Adicionar</Button>
          </div>
          {itens.map((it, i) => (
            <Card key={i} className="p-3 space-y-2">
              <div className="flex items-start gap-2">
                <Input placeholder="Descrição do item" value={it.descricao} onChange={e=>updateItem(i,{descricao:e.target.value})} className="h-10 rounded-lg flex-1" />
                <Button type="button" variant="ghost" size="icon" className="h-10 w-10 text-destructive" onClick={()=>removeItem(i)}><Trash2 className="h-4 w-4" /></Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Qtd</Label>
                  <Input type="number" min="0" step="0.01" value={it.quantidade} onChange={e=>updateItem(i,{quantidade:Number(e.target.value)})} className="h-10 rounded-lg" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Valor unit.</Label>
                  <Input type="number" min="0" step="0.01" value={it.valor_unitario} onChange={e=>updateItem(i,{valor_unitario:Number(e.target.value)})} className="h-10 rounded-lg" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Subtotal</Label>
                  <div className="h-10 rounded-lg bg-muted px-3 flex items-center text-sm font-semibold">{formatBRL(it.quantidade * it.valor_unitario)}</div>
                </div>
              </div>
            </Card>
          ))}
        </section>

        <Card className="p-4 flex items-center justify-between gradient-card border-primary/30">
          <span className="text-sm font-medium text-muted-foreground">Total</span>
          <span className="text-2xl font-extrabold text-primary">{formatBRL(total)}</span>
        </Card>

        <div className="flex flex-col gap-2 pt-2">
          <Button onClick={()=>salvar("enviado")} disabled={saving} size="lg" className="h-12 gradient-primary font-semibold rounded-xl">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Gerar Orçamento"}
          </Button>
          <Button onClick={()=>salvar("rascunho")} disabled={saving} variant="outline" size="lg" className="h-12 rounded-xl">
            Salvar Rascunho
          </Button>
        </div>
      </div>

      <Dialog open={openNovo} onOpenChange={setOpenNovo}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader><DialogTitle>Novo cliente</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Nome</Label><Input value={nNome} onChange={e=>setNNome(e.target.value)} className="h-11 rounded-lg" /></div>
            <div className="space-y-1.5"><Label>Telefone</Label><Input type="tel" value={nTel} onChange={e=>setNTel(e.target.value)} className="h-11 rounded-lg" /></div>
            <div className="space-y-1.5"><Label>Endereço</Label><Input value={nEnd} onChange={e=>setNEnd(e.target.value)} className="h-11 rounded-lg" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setOpenNovo(false)}>Cancelar</Button>
            <Button onClick={criarCliente} className="gradient-primary">Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
