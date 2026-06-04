import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { formatBRL, formatDate } from "@/lib/format";
import { Camera, Share2, CheckCircle2, Trash2, Wallet, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function DetalheOS() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [os, setOs] = useState<any>(null);
  const [itens, setItens] = useState<any[]>([]);
  const [cliente, setCliente] = useState<any>(null);
  const [fotos, setFotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    if (!id) return;
    const { data } = await supabase.from("ordens_servico").select("*").eq("id", id).maybeSingle();
    setOs(data);
    if (data?.cliente_id) {
      const { data: c } = await supabase.from("clientes").select("*").eq("id", data.cliente_id).maybeSingle();
      setCliente(c);
    }
    const { data: it } = await supabase.from("itens_os").select("*").eq("os_id", id).order("ordem");
    setItens(it ?? []);
    const { data: ft } = await supabase.from("fotos_os").select("*").eq("os_id", id).order("created_at", { ascending: false });
    setFotos(ft ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const updateStatus = async (status: string) => {
    await supabase.from("ordens_servico").update({ status: status as any }).eq("id", id!);
    toast.success("Status atualizado");
    load();
  };

  const concluir = async () => {
    await updateStatus("concluido");
    toast.success("Serviço concluído! Crie a cobrança.");
    navigate(`/os/${id}/cobranca`);
  };

  const excluir = async () => {
    await supabase.from("ordens_servico").delete().eq("id", id!);
    toast.success("OS excluída");
    navigate("/os");
  };

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const path = `${user.id}/${id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("fotos-os").upload(path, file);
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data: pub } = supabase.storage.from("fotos-os").getPublicUrl(path);
    await supabase.from("fotos_os").insert({ os_id: id!, user_id: user.id, url: pub.publicUrl });
    setUploading(false);
    toast.success("Foto adicionada");
    load();
  };

  if (loading) return <AppShell><div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></div></AppShell>;
  if (!os) return <AppShell><div className="p-8 text-center text-muted-foreground">OS não encontrada</div></AppShell>;

  return (
    <AppShell>
      <PageHeader title={`OS #${String(os.numero).padStart(4,"0")}`} back="/os" right={<StatusBadge status={os.status} />} />
      <div className="px-4 py-4 space-y-4 animate-fade-in">

        <Card className="p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Status</p>
          <Select value={os.status} onValueChange={updateStatus}>
            <SelectTrigger className="mt-1 h-11 rounded-lg"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="rascunho">Rascunho</SelectItem>
              <SelectItem value="enviado">Enviado</SelectItem>
              <SelectItem value="aceito">Aceito</SelectItem>
              <SelectItem value="em_andamento">Em andamento</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </Card>

        <Card className="p-4 space-y-1">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Cliente</p>
          <p className="font-semibold">{cliente?.nome || "—"}</p>
          {cliente?.telefone && <p className="text-sm text-muted-foreground">{cliente.telefone}</p>}
          {os.endereco && <p className="text-sm text-muted-foreground">{os.endereco}</p>}
        </Card>

        {os.descricao && (
          <Card className="p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Descrição</p>
            <p className="mt-1 whitespace-pre-wrap text-sm">{os.descricao}</p>
          </Card>
        )}

        <Card className="p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Itens</p>
          {itens.length === 0 ? <p className="text-sm text-muted-foreground">Sem itens</p> :
            <div className="space-y-2">
              {itens.map(it => (
                <div key={it.id} className="flex justify-between items-start text-sm border-b last:border-0 border-border/50 pb-2 last:pb-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{it.descricao}</p>
                    <p className="text-xs text-muted-foreground">{it.quantidade} × {formatBRL(it.valor_unitario)}</p>
                  </div>
                  <p className="font-semibold">{formatBRL(it.quantidade * it.valor_unitario)}</p>
                </div>
              ))}
            </div>
          }
          <div className="flex justify-between items-center mt-4 pt-3 border-t-2 border-primary/20">
            <span className="font-semibold">Total</span>
            <span className="text-2xl font-extrabold text-primary">{formatBRL(os.valor_total)}</span>
          </div>
          {os.data_execucao && <p className="mt-2 text-xs text-muted-foreground">Execução: {formatDate(os.data_execucao)}</p>}
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Fotos</p>
            <label className="cursor-pointer">
              <input type="file" accept="image/*" capture="environment" onChange={onUpload} className="hidden" />
              <Button asChild size="sm" variant="outline" className="rounded-lg" disabled={uploading}>
                <span>{uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Camera className="h-4 w-4" /> Adicionar</>}</span>
              </Button>
            </label>
          </div>
          {fotos.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma foto ainda</p> :
            <div className="grid grid-cols-3 gap-2">
              {fotos.map(f => <img key={f.id} src={f.url} alt="" className="aspect-square rounded-lg object-cover" />)}
            </div>
          }
        </Card>

        <div className="grid grid-cols-2 gap-2">
          <Link to={`/os/${id}/compartilhar`}><Button variant="outline" className="w-full h-12 rounded-xl"><Share2 className="h-4 w-4" /> Compartilhar</Button></Link>
          <Link to={`/os/${id}/cobranca`}><Button variant="outline" className="w-full h-12 rounded-xl"><Wallet className="h-4 w-4" /> Cobrança</Button></Link>
        </div>

        <Button onClick={concluir} className="w-full h-12 rounded-xl bg-success text-success-foreground hover:bg-success/90">
          <CheckCircle2 className="h-4 w-4" /> Concluir Serviço
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /> Excluir OS</Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir esta OS?</AlertDialogTitle>
              <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={excluir} className="bg-destructive text-destructive-foreground">Excluir</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppShell>
  );
}
