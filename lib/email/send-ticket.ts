import { Resend } from "resend";

import { TicketEmail, type TicketEmailProps } from "../../emails/ticket-email";

let resendClient: Resend | null = null;

function getResend() {
  if (!resendClient) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

type SendTicketArgs = Omit<TicketEmailProps, "qrImageUrl"> & {
  to: string;
  /**
   * The `tickets.qr_token` uuid. Drives both the QR payload and the path
   * segment of the hosted PNG served at /api/qr/[token].
   */
  qrToken: string;
};

/**
 * Sends one ticket per call. The QR is fetched from a real URL (not inlined
 * as a `data:` URI) because Gmail mobile / iOS Mail / Outlook strip those.
 */
export async function sendTicketEmail(args: SendTicketArgs) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const qrImageUrl = `${appUrl}/api/qr/${args.qrToken}`;

  const from = process.env.RESEND_FROM ?? "Ingressos <onboarding@resend.dev>";

  const result = await getResend().emails.send({
    from,
    to: args.to,
    subject: `Seu ingresso · ${args.eventTitle}`,
    react: TicketEmail({ ...args, qrImageUrl }),
  });

  return result;
}
