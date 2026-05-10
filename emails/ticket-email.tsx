import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export type TicketEmailProps = {
  holderName: string;
  eventTitle: string;
  eventStartsAt: string; // formatted: "12 mai · 20h"
  venueName: string;
  venueAddress: string;
  ticketTypeName: string;
  qrDataUrl: string; // data: URL produced by qrcode.toDataURL
  ticketUrl: string;
  orderId: string;
};

const main = {
  backgroundColor: "#fafafa",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #e4e4e7",
  borderRadius: "12px",
  margin: "32px auto",
  maxWidth: "560px",
  padding: "32px",
};

const brand = {
  color: "#09090b",
  fontSize: "14px",
  fontWeight: 600,
  letterSpacing: "-0.01em",
  margin: 0,
};

const eyebrow = {
  color: "#71717a",
  fontSize: "12px",
  letterSpacing: "0.06em",
  textTransform: "uppercase" as const,
  margin: "24px 0 4px",
};

const title = {
  color: "#09090b",
  fontSize: "24px",
  fontWeight: 600,
  letterSpacing: "-0.02em",
  lineHeight: "1.2",
  margin: "0 0 24px",
};

const ticketCard = {
  backgroundColor: "#fafafa",
  border: "1px solid #e4e4e7",
  borderRadius: "10px",
  padding: "24px",
  textAlign: "center" as const,
};

const qrWrap = {
  display: "inline-block",
  padding: "12px",
  backgroundColor: "#ffffff",
  border: "1px solid #e4e4e7",
  borderRadius: "8px",
};

const qrImage = {
  display: "block",
  width: "180px",
  height: "180px",
};

const detailRow = {
  borderTop: "1px solid #e4e4e7",
  padding: "12px 0",
};

const detailLabel = {
  color: "#71717a",
  fontSize: "12px",
  margin: "0 0 2px",
};

const detailValue = {
  color: "#09090b",
  fontSize: "14px",
  fontWeight: 500,
  margin: 0,
};

const buttonLink = {
  backgroundColor: "#09090b",
  borderRadius: "8px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: 500,
  padding: "10px 18px",
  textDecoration: "none",
};

const muted = {
  color: "#71717a",
  fontSize: "12px",
  lineHeight: "1.5",
  margin: "12px 0 0",
};

export function TicketEmail({
  holderName,
  eventTitle,
  eventStartsAt,
  venueName,
  venueAddress,
  ticketTypeName,
  qrDataUrl,
  ticketUrl,
  orderId,
}: TicketEmailProps) {
  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>Seu ingresso para {eventTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={brand}>Ingressos</Text>

          <Text style={eyebrow}>Seu ingresso</Text>
          <Heading style={title}>{eventTitle}</Heading>

          <Section style={ticketCard}>
            <div style={qrWrap}>
              <Img
                src={qrDataUrl}
                alt="QR code do ingresso"
                style={qrImage}
                width={180}
                height={180}
              />
            </div>
            <Text style={{ ...muted, marginTop: "16px" }}>
              Apresente este QR code na entrada do evento.
            </Text>
          </Section>

          <Section style={{ marginTop: "24px" }}>
            <div style={detailRow}>
              <Text style={detailLabel}>Participante</Text>
              <Text style={detailValue}>{holderName}</Text>
            </div>
            <div style={detailRow}>
              <Text style={detailLabel}>Tipo de ingresso</Text>
              <Text style={detailValue}>{ticketTypeName}</Text>
            </div>
            <div style={detailRow}>
              <Text style={detailLabel}>Data e horário</Text>
              <Text style={detailValue}>{eventStartsAt}</Text>
            </div>
            <div style={detailRow}>
              <Text style={detailLabel}>Local</Text>
              <Text style={detailValue}>{venueName}</Text>
              <Text style={{ ...detailValue, fontWeight: 400, color: "#52525b" }}>
                {venueAddress}
              </Text>
            </div>
          </Section>

          <Section style={{ marginTop: "24px", textAlign: "center" }}>
            <Link href={ticketUrl} style={buttonLink}>
              Abrir ingresso no navegador
            </Link>
          </Section>

          <Hr style={{ borderColor: "#e4e4e7", margin: "32px 0 16px" }} />

          <Text style={muted}>
            Pedido <span style={{ color: "#09090b" }}>#{orderId}</span>. Caso
            precise de ajuda, responda este e-mail. Você pode solicitar reembolso
            em até 7 dias da compra, conforme o Código de Defesa do Consumidor.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default TicketEmail;
