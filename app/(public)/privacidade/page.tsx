import { LegalPage } from "@/components/site/legal-page";

export const metadata = {
  title: "Política de Privacidade — Ingressos",
  description: "Como tratamos seus dados pessoais conforme a LGPD.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Política de Privacidade"
      updatedAt="11 de maio de 2026"
    >
      <p>
        Esta política descreve como a Ingressos coleta, utiliza, compartilha e
        protege seus dados pessoais, em conformidade com a Lei Geral de
        Proteção de Dados (Lei 13.709/2018 — LGPD).
      </p>

      <h2>1. Dados que coletamos</h2>
      <ul>
        <li>
          <strong>Cadastro:</strong> nome, e-mail, senha (armazenada em hash),
          número de telefone (opcional).
        </li>
        <li>
          <strong>Compras:</strong> CPF, dados do portador do ingresso e
          informações de pagamento processadas pelo Mercado Pago.
        </li>
        <li>
          <strong>Organizadores:</strong> razão social, CNPJ, regime
          tributário, inscrição municipal e certificado digital usado para
          NFS-e.
        </li>
        <li>
          <strong>Uso:</strong> registros de acesso, IP, agente do navegador,
          interações com check-in.
        </li>
      </ul>

      <h2>2. Por que tratamos seus dados</h2>
      <ul>
        <li>Executar o contrato de compra/venda de ingressos.</li>
        <li>Emitir nota fiscal de serviço (NFS-e) conforme legislação.</li>
        <li>Prevenir fraudes e abusos.</li>
        <li>Comunicar alterações de eventos e enviar ingressos por e-mail.</li>
        <li>Cumprir obrigações legais e regulatórias.</li>
      </ul>

      <h2>3. Com quem compartilhamos</h2>
      <ul>
        <li>
          <strong>Mercado Pago</strong> — processamento de pagamentos.
        </li>
        <li>
          <strong>PlugNotas</strong> — emissão de NFS-e em nome do organizador.
        </li>
        <li>
          <strong>Resend</strong> — envio de e-mails transacionais (confirmação
          de compra, entrega do ingresso).
        </li>
        <li>
          <strong>Supabase</strong> — infraestrutura de banco de dados e
          autenticação.
        </li>
        <li>Autoridades públicas, quando exigido por lei.</li>
      </ul>

      <h2>4. Tempo de retenção</h2>
      <p>
        Dados de compras são mantidos por 5 anos (prazo decadencial). Dados de
        cadastro podem ser excluídos sob solicitação, exceto se houver
        obrigação legal de retenção.
      </p>

      <h2>5. Seus direitos (LGPD)</h2>
      <ul>
        <li>Acessar seus dados.</li>
        <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
        <li>Solicitar anonimização, bloqueio ou eliminação.</li>
        <li>Portabilidade dos dados.</li>
        <li>Revogar consentimento.</li>
      </ul>
      <p>
        Para exercer seus direitos, escreva para{" "}
        <a
          href="mailto:privacidade@ingressos.local"
          className="font-medium text-foreground underline underline-offset-4"
        >
          privacidade@ingressos.local
        </a>
        .
      </p>

      <h2>6. Segurança</h2>
      <p>
        Adotamos controles técnicos (criptografia em trânsito via TLS, senhas
        com hash, controle de acesso por papéis) e organizacionais para
        proteger seus dados. Apesar de aplicarmos as melhores práticas,
        nenhuma transmissão pela internet é 100% segura.
      </p>

      <h2>7. Cookies</h2>
      <p>
        Utilizamos cookies essenciais para autenticação e preferências
        (tema). Cookies analíticos só são ativados após o consentimento dado
        no banner de boas-vindas.
      </p>

      <h2>8. Encarregado (DPO)</h2>
      <p>
        Encarregado pelo Tratamento de Dados Pessoais: contato via{" "}
        <a
          href="mailto:dpo@ingressos.local"
          className="font-medium text-foreground underline underline-offset-4"
        >
          dpo@ingressos.local
        </a>
        .
      </p>
    </LegalPage>
  );
}
