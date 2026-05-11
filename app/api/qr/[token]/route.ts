import { NextResponse } from "next/server";
import QRCode from "qrcode";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Serves a QR PNG for the given token (the `tickets.qr_token` uuid).
 *
 * Why this exists: many e-mail clients (Gmail mobile, iOS Mail, Outlook)
 * strip inline `data:` image URIs as a security measure, leaving a broken
 * image in the ticket e-mail. Hosting the QR at a real URL fixes that.
 *
 * We don't need DB access here — the token IS the payload encoded into the
 * QR. Validation (org ownership + ticket status) happens at check-in time
 * via the existing `checkInLookup` server action.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  if (!UUID_RE.test(token)) {
    return new NextResponse("Bad token", { status: 400 });
  }

  const buf = await QRCode.toBuffer(token, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 480,
    type: "png",
  });

  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      // Aggressive cache because the QR payload (uuid) is immutable.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
