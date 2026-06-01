import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PoliticaPrivacidade() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-semibold text-lg">Política de Privacidade</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 text-sm text-muted-foreground leading-relaxed">
        <p className="text-xs text-muted-foreground">Última atualização: 28 de maio de 2026</p>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">1. Sobre o OrcaJá</h2>
          <p>
            O OrcaJá é um aplicativo para criação de orçamentos, ordens de serviço e cobrança via Pix,
            desenvolvido para profissionais autônomos e microempreendedores. Levamos sua privacidade
            a sério e coletamos apenas os dados necessários para o funcionamento do serviço.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">2. Dados que coletamos</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Dados de cadastro:</strong> nome, e-mail, telefone e cidade.</li>
            <li><strong>Dados profissionais:</strong> nome fantasia, tipo de serviço, logo e chave Pix.</li>
            <li><strong>Dados operacionais:</strong> clientes cadastrados, ordens de serviço, itens, valores e status de pagamento.</li>
            <li><strong>Dados financeiros:</strong> registros de despesas e guias DAS (inseridos pelo próprio usuário).</li>
            <li><strong>Dados de uso:</strong> logs de acesso para segurança e diagnóstico de erros.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">3. Como usamos seus dados</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Fornecer e melhorar as funcionalidades do aplicativo.</li>
            <li>Gerar QR Codes Pix com sua chave cadastrada.</li>
            <li>Enviar notificações sobre status de OS e pagamentos (somente com sua autorização).</li>
            <li>Garantir a segurança da sua conta.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">4. Compartilhamento de dados</h2>
          <p>
            Não vendemos seus dados. Compartilhamos apenas com:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Supabase:</strong> plataforma de banco de dados e autenticação (servidores na AWS).</li>
            <li><strong>QR Server API:</strong> serviço público para geração de QR Codes Pix (recebe apenas o código Pix, sem dados pessoais).</li>
            <li>Autoridades competentes, quando exigido por lei.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">5. Seus direitos (LGPD)</h2>
          <p>Conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018), você tem direito a:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Acessar seus dados pessoais.</li>
            <li>Corrigir dados incompletos ou desatualizados.</li>
            <li>Solicitar a exclusão de seus dados.</li>
            <li>Revogar o consentimento a qualquer momento.</li>
            <li>Exportar seus dados.</li>
          </ul>
          <p>Para exercer esses direitos, entre em contato: <strong>privacidade@orcaja.com.br</strong></p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">6. Segurança</h2>
          <p>
            Seus dados são protegidos por autenticação JWT, Row Level Security (RLS) no banco de dados
            — cada usuário acessa apenas seus próprios dados — e conexões HTTPS/TLS em todas as comunicações.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">7. Retenção de dados</h2>
          <p>
            Mantemos seus dados enquanto sua conta estiver ativa. Ao solicitar exclusão da conta,
            seus dados são removidos em até 30 dias, exceto quando a retenção for exigida por
            obrigação legal.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">8. Menores de idade</h2>
          <p>
            O OrcaJá é destinado exclusivamente a maiores de 18 anos. Não coletamos intencionalmente
            dados de menores de idade.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">9. Alterações nesta política</h2>
          <p>
            Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas
            pelo e-mail cadastrado ou por notificação no aplicativo.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">10. Contato</h2>
          <p>
            Dúvidas sobre esta política? Fale conosco:<br />
            <strong>E-mail:</strong> privacidade@orcaja.com.br<br />
            <strong>Site:</strong> www.orcaja.com.br
          </p>
        </section>

        <div className="pt-4 border-t">
          <p className="text-xs">
            © 2026 OrcaJá. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
