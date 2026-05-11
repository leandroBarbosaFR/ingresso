import { LegalPage } from "@/components/site/legal-page";

export const metadata = {
  title: "Política de Reembolso — Ingressos",
  description: "Como funciona o reembolso de ingressos.",
};

export default function RefundPage() {
  return (
    <LegalPage
      title="Política de Reembolso"
      updatedAt="11 de maio de 2026"
    >
      <p>
        Esta política descreve como funcionam reembolsos de ingressos
        adquiridos pela plataforma Ingressos.
      </p>

      <h2>1. Direito de arrependimento (CDC, art. 49)</h2>
      <p>
        Você pode pedir o reembolso integral em até <strong>7 dias</strong>{" "}
        corridos a partir da compra, desde que a data de início do evento
        ainda não tenha ocorrido. O pedido pode ser feito pela página{" "}
        <a
          href="/minha-conta"
          className="font-medium text-foreground underline underline-offset-4"
        >
          Minha conta
        </a>{" "}
        ou pelo e-mail{" "}
        <a
          href="mailto:atendimento@ingressos.local"
          className="font-medium text-foreground underline underline-offset-4"
        >
          atendimento@ingressos.local
        </a>
        .
      </p>

      <h2>2. Cancelamento do evento</h2>
      <p>
        Se o evento for cancelado pelo organizador, o valor pago será
        devolvido integralmente em até 30 dias, sem necessidade de
        solicitação do comprador.
      </p>

      <h2>3. Mudanças de data ou local</h2>
      <p>
        Em caso de remarcação ou alteração relevante, o comprador pode optar
        por manter o ingresso ou pedir o reembolso em até 7 dias após a
        comunicação da mudança.
      </p>

      <h2>4. Forma de devolução</h2>
      <ul>
        <li>
          <strong>Pix:</strong> devolução na mesma chave de origem, em até 3
          dias úteis.
        </li>
        <li>
          <strong>Cartão de crédito:</strong> estorno na fatura do mesmo
          cartão, podendo aparecer em até 2 ciclos seguintes conforme
          operadora.
        </li>
        <li>
          <strong>Cartão de débito:</strong> estorno em até 7 dias úteis.
        </li>
      </ul>

      <h2>5. Quando não há reembolso</h2>
      <ul>
        <li>
          Após o início do evento, exceto em caso de descumprimento pelo
          organizador.
        </li>
        <li>
          Quando solicitado fora do prazo legal e não houver cancelamento ou
          alteração do evento.
        </li>
        <li>Em caso de fraude comprovada na compra.</li>
      </ul>

      <h2>6. Taxa de serviço</h2>
      <p>
        A taxa de serviço cobrada do comprador é restituída em todas as
        hipóteses de reembolso previstas nesta política.
      </p>

      <h2>7. Dúvidas</h2>
      <p>
        Em caso de dúvida, fale com nossa equipe pelo e-mail acima ou pelo{" "}
        <a
          href="/contato"
          className="font-medium text-foreground underline underline-offset-4"
        >
          formulário de contato
        </a>
        .
      </p>
    </LegalPage>
  );
}
