/**
 * Phone OTP delivery via Twilio (SMS) or Twilio WhatsApp channel.
 *
 * Set in .env.local:
 *   TWILIO_ACCOUNT_SID=ACxxxxxxxx
 *   TWILIO_AUTH_TOKEN=xxxxxxxx
 *   TWILIO_SMS_FROM=+15551234567        # any Twilio number
 *   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886   # Twilio Sandbox or your approved sender
 *
 * If those aren't set the helper falls back to a console.log so dev/demo
 * flows still work without a vendor.
 */

type Channel = "sms" | "whatsapp";

type SendResult =
  | { ok: true; provider: "twilio" | "console"; sid?: string }
  | { ok: false; error: string };

const TWILIO_API = "https://api.twilio.com/2010-04-01";

function twilioConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  );
}

function fromForChannel(channel: Channel): string | undefined {
  return channel === "whatsapp"
    ? process.env.TWILIO_WHATSAPP_FROM
    : process.env.TWILIO_SMS_FROM;
}

function toForChannel(channel: Channel, phone: string) {
  return channel === "whatsapp" ? `whatsapp:${phone}` : phone;
}

/**
 * Sends `body` to the E.164 `phone` via the requested channel.
 * Always resolves — callers should branch on the `ok` flag.
 */
export async function sendSms({
  to,
  body,
  channel = "sms",
}: {
  to: string;
  body: string;
  channel?: Channel;
}): Promise<SendResult> {
  if (!twilioConfigured()) {
    // Dev/demo fallback: log to the server console. Useful when running
    // locally without a Twilio account.
    console.log(
      `\n[sms:console] would send via ${channel} to ${to}:\n  ${body}\n`
    );
    return { ok: true, provider: "console" };
  }

  const from = fromForChannel(channel);
  if (!from) {
    return {
      ok: false,
      error: `Twilio ${channel === "whatsapp" ? "WhatsApp" : "SMS"} sender not configured.`,
    };
  }

  const sid = process.env.TWILIO_ACCOUNT_SID!;
  const token = process.env.TWILIO_AUTH_TOKEN!;

  const params = new URLSearchParams({
    To: toForChannel(channel, to),
    From: from,
    Body: body,
  });

  const res = await fetch(
    `${TWILIO_API}/Accounts/${sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    }
  );

  if (!res.ok) {
    const detail = await res.text();
    return {
      ok: false,
      error: `Twilio ${res.status}: ${detail.slice(0, 200)}`,
    };
  }
  const payload = (await res.json()) as { sid?: string };
  return { ok: true, provider: "twilio", sid: payload.sid };
}
