import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Building2, Bell, Shield, LogOut, Crown, Upload, Loader2, Download } from "lucide-react";
import { toast } from "sonner";

export default function Configuracoes() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({data}) => setProfile(data));
  }, [user]);

  const update = (patch: any) => setProfile({ ...profile, ...patch });

  const salvar = async () => {
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      nome: profile.nome, telefone: profile.telefone, nome_fantasia: profile.nome_fantasia,
      cidade: profile.cidade, notificacoes_push: profile.notificacoes_push,
    }).eq("id", user!.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Dados salvos");
  };

  const onLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || !user) return;
    setUploading(true);
    const path = `${user.id}/logo-${Date.now()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("logos").upload(path, file, { upsert: true });
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data: pub } = supabase.storage.from("logos").getPublicUrl(path);
    await supabase.from("profiles").update({ logo_url: pub.publicUrl }).eq("id", user.id);
    update({ logo_url: pub.publicUrl });
    setUploading(false); toast.success("Logo atualizada");
  };

  const exportar = async () => {
    const [{data: c}, {data: o}, {data: p}, {data: d}] = await Promise.all([
      supabase.from("clientes").select("*"),
      supabase.from("ordens_servico").select("*"),
      supabase.from("pagamentos").select("*"),
      supabase.from("despesas").select("*"),
    ]);
    const blob = new Blob([JSON.stringify({ profile, clientes: c, ordens: o, pagamentos: p, despesas: d }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `orcaja-meus-dados-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Dados exportados");
  };

  const sair = async () => { await signOut(); navigate("/"); };

  if (!profile) return <AppShell><div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></div></AppShell>;

  return (
    <AppShell>
      <PageHeader title="Configurações" />
      <div className="px-4 py-4 space-y-5">

        <Card className="p-4 flex items-center gap-3 gradient-card border-primary/30">
          <div className="grid h-12 w-12 place-items-center rounded-xl gradient-primary text-primary-foreground"><Crown className="h-5 w-5" /></div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Plano atual</p>
            <p className="font-bold capitalize">{profile.plano}</p>
          </div>
          <Button size="sm" onClick={()=>toast.info("Planos em breve")} className="gradient-primary rounded-lg">Upgrade</Button>
        </Card>

        <section className="space-y-3">
          <h2 className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Meus dados</h2>
          <Card className="p-4 space-y-3">
            <div className="space-y-1.5"><Label>Nome</Label><Input value={profile.nome ?? ""} onChange={e=>update({nome:e.target.value})} className="h-11 rounded-lg" /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input value={profile.email ?? ""} disabled className="h-11 rounded-lg" /></div>
            <div className="space-y-1.5"><Label>Telefone</Label><Input value={profile.telefone ?? ""} onChange={e=>update({telefone:e.target.value})} className="h-11 rounded-lg" /></div>
          </Card>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> Minha empresa</h2>
          <Card className="p-4 space-y-3">
            <div className="space-y-1.5"><Label>Nome fantasia</Label><Input value={profile.nome_fantasia ?? ""} onChange={e=>update({nome_fantasia:e.target.value})} className="h-11 rounded-lg" /></div>
            <div className="space-y-1.5"><Label>Cidade</Label><Input value={profile.cidade ?? ""} onChange={e=>update({cidade:e.target.value})} className="h-11 rounded-lg" /></div>
            <div className="space-y-1.5">
              <Label>Logo</Label>
              <div className="flex items-center gap-3">
                {profile.logo_url ? <img src={profile.logo_url} alt="" className="h-14 w-14 rounded-lg border object-cover" /> :
                  <div className="h-14 w-14 rounded-lg bg-muted grid place-items-center"><Building2 className="h-6 w-6 text-muted-foreground" /></div>}
                <label className="flex-1">
                  <input type="file" accept="image/*" onChange={onLogo} className="hidden" />
                  <Button asChild variant="outline" className="w-full rounded-lg" disabled={uploading}>
                    <span>{uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Upload className="h-4 w-4" /> Enviar logo</>}</span>
                  </Button>
                </label>
              </div>
            </div>
          </Card>
        </section>

        <Button onClick={salvar} disabled={saving} className="w-full h-12 gradient-primary rounded-xl font-semibold">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar alterações"}
        </Button>

        <section className="space-y-3">
          <h2 className="text-xs uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-1"><Bell className="h-3.5 w-3.5" /> Notificações</h2>
          <Card className="p-4 flex items-center justify-between">
            <div><p className="font-medium">Notificações push</p><p className="text-xs text-muted-foreground">Receba avisos de aceites e pagamentos</p></div>
            <Switch checked={profile.notificacoes_push} onCheckedChange={async v=>{update({notificacoes_push:v}); await supabase.from("profiles").update({notificacoes_push:v}).eq("id",user!.id);}} />
          </Card>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> LGPD e privacidade</h2>
          <Card className="p-4">
            <Button variant="outline" onClick={exportar} className="w-full rounded-lg"><Download className="h-4 w-4" /> Exportar meus dados</Button>
            <p className="mt-2 text-xs text-muted-foreground">Você pode solicitar uma cópia de todos os seus dados conforme a LGPD.</p>
          </Card>
        </section>

        <Separator />

        <Button onClick={sair} variant="ghost" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl h-12">
          <LogOut className="h-4 w-4" /> Sair
        </Button>
      </div>
    </AppShell>
  );
}
