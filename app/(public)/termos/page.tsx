import { LegalPage } from "@/components/site/legal-page";

export const metadata = {
  title: "Termos de Uso — Ingressos",
  description: "Termos de uso da plataforma Ingressos.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Termos de Uso" updatedAt="11 de maio de 2026">
      <p>
        Ao acessar ou utilizar a plataforma Ingressos (&quot;Plataforma&quot;)
        você concorda com os termos descritos neste documento. Se você não
        concordar, não utilize a Plataforma.
      </p>

      <h2>1. Quem somos</h2>
      <p>
        A Ingressos é uma plataforma de venda de ingressos online que conecta
        produtores de eventos a compradores finais, atuando como intermediadora
        técnica dos pagamentos.
      </p>

      <h2>2. Quem pode usar</h2>
      <p>
        A Plataforma está disponível para pessoas físicas com 18 anos ou mais e
        para pessoas jurídicas devidamente cadastradas. Você é responsável
        pelos dados que fornece e por manter suas credenciais em sigilo.
      </p>

      <h2>3. Compra de ingressos</h2>
      <ul>
        <li>
          O ingresso adquirido é nominal e poderá conter dados pessoais do
          comprador e do portador (nome, CPF) para fins de validação.
        </li>
        <li>
          O comprador é responsável por conferir data, horário e local antes da
          confirmação da compra.
        </li>
        <li>
          Cada ingresso possui um QR code único utilizado no controle de acesso.
          Imagens, capturas ou cópias não são válidas para entradas adicionais.
        </li>
        <li>
          A taxa de serviço cobrada do comprador é apresentada de forma clara
          antes da conclusão do pagamento.
        </li>
      </ul>

      <h2>4. Produção do evento</h2>
      <p>
        O <strong>organizador</strong> é o responsável legal pelo evento,
        incluindo realização, qualidade, autorizações e cumprimento das normas
        aplicáveis. A Ingressos não é organizadora dos eventos e não responde
        por cancelamentos, mudanças de programação ou frustrações que não sejam
        causadas por falha da Plataforma.
      </p>

      <h2>5. Cancelamento e reembolso</h2>
      <p>
        Reembolsos seguem a política descrita em{" "}
        <a
          href="/reembolso"
          className="font-medium text-foreground underline underline-offset-4"
        >
          Reembolso
        </a>{" "}
        e o Código de Defesa do Consumidor (Art. 49 — direito de
        arrependimento em 7 dias). Em caso de cancelamento do evento pelo
        organizador, o valor pago é integralmente devolvido.
      </p>

      <h2>6. Conduta e proibições</h2>
      <ul>
        <li>É vedada a revenda de ingressos por canais não autorizados.</li>
        <li>É vedada a fraude, automação abusiva ou interferência técnica.</li>
        <li>
          A Plataforma pode suspender contas que violem estes termos sem aviso
          prévio.
        </li>
      </ul>

      <h2>7. Limitação de responsabilidade</h2>
      <p>
        Na máxima extensão permitida pela lei, a Plataforma não responde por
        danos indiretos, lucros cessantes ou perda de oportunidade decorrente
        do uso ou impossibilidade de uso do serviço.
      </p>

      <h2>8. Alterações dos termos</h2>
      <p>
        Estes termos podem ser atualizados periodicamente. Mudanças relevantes
        serão comunicadas com 15 dias de antecedência por e-mail e nesta
        página.
      </p>

      <h2>9. Lei aplicável e foro</h2>
      <p>
        Estes termos são regidos pela legislação brasileira. Fica eleito o
        foro da Comarca de Florianópolis/SC para dirimir eventuais
        controvérsias.
      </p>
    </LegalPage>
  );
}
