import { Resend } from "resend";
import QRCode from "qrcode";

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

type SendTicketArgs = Omit<TicketEmailProps, "qrDataUrl"> & {
  to: string;
  /** What goes inside the QR — usually the qr_token or a check-in URL */
  qrPayload: string;
};

export async function sendTicketEmail(args: SendTicketArgs) {
  const qrDataUrl = await QRCode.toDataURL(args.qrPayload, {
    margin: 1,
    width: 480,
    errorCorrectionLevel: "M",
  });

  const from = process.env.RESEND_FROM ?? "Ingressos <onboarding@resend.dev>";

  const result = await getResend().emails.send({
    from,
    to: args.to,
    subject: `Seu ingresso · ${args.eventTitle}`,
    react: TicketEmail({ ...args, qrDataUrl }),
  });

  return result;
}
