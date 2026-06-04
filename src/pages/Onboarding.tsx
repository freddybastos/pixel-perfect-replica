import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, FileText, QrCode } from "lucide-react";
import heroImg from "@/assets/onboarding-hero.jpg";

export default function Onboarding() {
  const navigate = useNavigate();
  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-b from-accent via-background to-background">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 pt-10 pb-8 safe-top safe-bottom">
        <div className="flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl gradient-primary shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-extrabold tracking-tight">OrcaJá</span>
        </div>

        <div className="mt-6 flex justify-center animate-fade-in">
          <img src={heroImg} alt="Prestador usando OrcaJá" width={1024} height={1024} className="w-72 max-w-full rounded-3xl shadow-elevated" />
        </div>

        <div className="mt-8 space-y-3 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Seu orçamento profissional <span className="text-primary">em 1 minuto</span>
          </h1>
          <p className="text-muted-foreground">
            Crie OS, envie pelo WhatsApp e receba via Pix — tudo do seu celular.
          </p>
        </div>

        <ul className="mt-8 space-y-3">
          <Feature icon={<FileText className="h-4 w-4" />} text="Orçamentos e ordens de serviço prontos em segundos" />
          <Feature icon={<QrCode className="h-4 w-4" />} text="Receba pagamentos via Pix com QR Code automático" />
          <Feature icon={<Sparkles className="h-4 w-4" />} text="Dashboard financeiro com tudo no controle" />
        </ul>

        <div className="mt-auto pt-10 space-y-3">
          <div className="flex justify-center gap-1.5">
            <span className="h-1.5 w-6 rounded-full bg-primary" />
            <span className="h-1.5 w-1.5 rounded-full bg-muted" />
            <span className="h-1.5 w-1.5 rounded-full bg-muted" />
          </div>
          <Button size="lg" className="w-full h-12 text-base font-semibold gradient-primary shadow-soft" onClick={() => navigate("/")}>
            Começar
          </Button>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">{icon}</span>
      <span className="text-sm font-medium">{text}</span>
    </li>
  );
}
