import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().trim().email("Email inválido").max(255),
  senha: z.string().min(6, "Mínimo 6 caracteres").max(72),
});

const signupSchema = z.object({
  nome: z.string().trim().min(2, "Nome muito curto").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  senha: z.string().min(8, "Mínimo 8 caracteres").max(72),
  telefone: z.string().trim().min(8, "Telefone inválido").max(20),
  tipo_servico: z.string().min(1, "Selecione um tipo"),
});

const TIPOS = [
  "Eletricista", "Encanador", "Pintor", "Pedreiro", "Marceneiro",
  "Jardineiro", "Chaveiro", "Limpeza", "Refrigeração", "Tecnologia", "Outro",
];

export default function Auth() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);

  // login
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  // signup
  const [sNome, setSNome] = useState("");
  const [sEmail, setSEmail] = useState("");
  const [sSenha, setSSenha] = useState("");
  const [sTel, setSTel] = useState("");
  const [sTipo, setSTipo] = useState("");

  useEffect(() => {
    if (!authLoading && user) navigate("/dashboard", { replace: true });
  }, [user, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ email, senha });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.senha });
    setLoading(false);
    if (error) {
      toast.error(error.message === "Invalid login credentials" ? "Email ou senha incorretos" : error.message);
      return;
    }
    navigate("/dashboard", { replace: true });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signupSchema.safeParse({ nome: sNome, email: sEmail, senha: sSenha, telefone: sTel, tipo_servico: sTipo });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.senha,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { nome: parsed.data.nome, telefone: parsed.data.telefone, tipo_servico: parsed.data.tipo_servico },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message.includes("already") ? "Esse email já está cadastrado" : error.message);
      return;
    }
    toast.success("Conta criada! Bem-vindo ao OrcaJá");
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-accent via-background to-background">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 pt-10 pb-8 safe-top safe-bottom">
        <Link to="/onboarding" className="flex items-center gap-2 self-start">
          <div className="grid h-9 w-9 place-items-center rounded-lg gradient-primary shadow-glow">
            <Sparkles className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-extrabold tracking-tight">OrcaJá</span>
        </Link>

        <div className="mt-8 mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Bem-vindo</h1>
          <p className="text-sm text-muted-foreground">Acesse sua conta ou cadastre-se gratuitamente.</p>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-2 h-11 rounded-xl bg-muted p-1">
            <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Entrar</TabsTrigger>
            <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Cadastrar</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-6 space-y-4 animate-fade-in">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" inputMode="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="senha">Senha</Label>
                <Input id="senha" type="password" autoComplete="current-password" required value={senha} onChange={(e) => setSenha(e.target.value)} className="h-12 rounded-xl" />
              </div>
              <Button type="submit" disabled={loading} size="lg" className="w-full h-12 gradient-primary font-semibold">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
              </Button>
              <button type="button" className="block w-full text-center text-sm font-medium text-primary hover:underline">
                Esqueceu a senha?
              </button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="mt-6 animate-fade-in">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="snome">Nome completo</Label>
                <Input id="snome" required value={sNome} onChange={(e) => setSNome(e.target.value)} className="h-12 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="semail">Email</Label>
                <Input id="semail" type="email" inputMode="email" autoComplete="email" required value={sEmail} onChange={(e) => setSEmail(e.target.value)} className="h-12 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ssenha">Senha</Label>
                <Input id="ssenha" type="password" autoComplete="new-password" required value={sSenha} onChange={(e) => setSSenha(e.target.value)} className="h-12 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="stel">Telefone WhatsApp</Label>
                <Input id="stel" type="tel" inputMode="tel" placeholder="(11) 99999-9999" required value={sTel} onChange={(e) => setSTel(e.target.value)} className="h-12 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label>Tipo de serviço</Label>
                <Select value={sTipo} onValueChange={setSTipo}>
                  <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {TIPOS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={loading} size="lg" className="w-full h-12 gradient-primary font-semibold">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar Conta Gratuita"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Ao criar conta você concorda com nossos termos e política de privacidade.
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
