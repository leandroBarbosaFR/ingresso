"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod/v3";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/data/user";
import {
  OTP_MAX_ATTEMPTS,
  OTP_TTL_MS,
  codeMatches,
  generateOtp,
  hashOtp,
  isExpired,
} from "@/lib/auth/otp";
import { sendSms } from "@/lib/sms/send";

// ---------------------------------------------------------------------------
// Step 1 — document, name, DOB, terms
// ---------------------------------------------------------------------------

const identitySchema = z
  .object({
    document_type: z.enum(["cpf", "cnpj", "passport"]),
    document_number: z.string().trim().min(3, "Documento inválido.").max(32),
    full_name: z.string().trim().min(2, "Informe o nome completo."),
    date_of_birth: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida."),
    terms_accepted: z.literal("on"),
  })
  .superRefine((data, ctx) => {
    const onlyDigits = data.document_number.replace(/\D/g, "");
    if (data.document_type === "cpf" && onlyDigits.length !== 11) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["document_number"],
        message: "CPF deve ter 11 dígitos.",
      });
    }
    if (data.document_type === "cnpj" && onlyDigits.length !== 14) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["document_number"],
        message: "CNPJ deve ter 14 dígitos.",
      });
    }
    if (data.document_type === "passport" && onlyDigits.length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["document_number"],
        message: "Número de passaporte muito curto.",
      });
    }
    const dob = new Date(data.date_of_birth);
    if (Number.isNaN(dob.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["date_of_birth"],
        message: "Data inválida.",
      });
      return;
    }
    const age =
      (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    if (age < 16) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["date_of_birth"],
        message: "Você precisa ter pelo menos 16 anos.",
      });
    }
    if (age > 120) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["date_of_birth"],
        message: "Data inválida.",
      });
    }
  });

export type IdentityResult = { ok: true } | { ok: false; error: string } | null;

export async function saveIdentity(
  _prev: IdentityResult,
  formData: FormData
): Promise<IdentityResult> {
  const me = await requireUser();

  const parsed = identitySchema.safeParse({
    document_type: formData.get("document_type"),
    document_number: formData.get("document_number"),
    full_name: formData.get("full_name"),
    date_of_birth: formData.get("date_of_birth"),
    terms_accepted: formData.get("terms_accepted"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      document_type: parsed.data.document_type,
      document_number: parsed.data.document_number.replace(/\D/g, ""),
      document_country: parsed.data.document_type === "passport" ? null : "BR",
      date_of_birth: parsed.data.date_of_birth,
      terms_accepted_at: new Date().toISOString(),
    })
    .eq("id", me.id);
  if (error) {
    // Unique violation = doc used by another account.
    if ((error as { code?: string }).code === "23505") {
      return { ok: false, error: "Este documento já está em uso." };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/completar-perfil");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Step 2 — request phone OTP
// ---------------------------------------------------------------------------

const phoneSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ()\-]{8,20}$/, "Telefone inválido."),
  channel: z.enum(["sms", "whatsapp"]),
});

export type OtpRequestResult =
  | { ok: true; provider: string; phone: string }
  | { ok: false; error: string }
  | null;

export async function requestPhoneOtp(
  _prev: OtpRequestResult,
  formData: FormData
): Promise<OtpRequestResult> {
  const me = await requireUser();

  const parsed = phoneSchema.safeParse({
    phone: formData.get("phone"),
    channel: formData.get("channel"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Telefone inválido." };
  }

  // Normalize to E.164. We default the country to Brazil (+55) when the user
  // doesn't supply a leading +. This is a pragmatic heuristic for the
  // Brazilian audience; international users should type the leading +.
  const digits = parsed.data.phone.replace(/[^\d+]/g, "");
  const e164 = digits.startsWith("+")
    ? digits
    : `+55${digits.replace(/^0+/, "")}`;

  const code = generateOtp();
  const codeHash = hashOtp(code);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS).toISOString();

  const admin = createAdminClient();

  // Mark any older non-verified codes for this user as expired.
  await admin
    .from("phone_verifications")
    .update({ expires_at: new Date().toISOString() })
    .eq("user_id", me.id)
    .is("verified_at", null);

  const { error: insertErr } = await admin.from("phone_verifications").insert({
    user_id: me.id,
    phone: e164,
    code_hash: codeHash,
    channel: parsed.data.channel,
    expires_at: expiresAt,
  });
  if (insertErr) return { ok: false, error: insertErr.message };

  // Also stash the phone on the profile (unverified for now).
  await admin
    .from("profiles")
    .update({ phone: e164, phone_verified_at: null })
    .eq("id", me.id);

  const sendResult = await sendSms({
    to: e164,
    channel: parsed.data.channel,
    body: `Ingressos · seu código é ${code}. Vale por 10 minutos. Não compartilhe.`,
  });

  if (!sendResult.ok) {
    return { ok: false, error: sendResult.error };
  }

  return { ok: true, provider: sendResult.provider, phone: e164 };
}

// ---------------------------------------------------------------------------
// Step 3 — verify the OTP
// ---------------------------------------------------------------------------

const verifySchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/, "Código inválido."),
});

export type OtpVerifyResult =
  | { ok: true }
  | { ok: false; error: string }
  | null;

export async function verifyPhoneOtp(
  _prev: OtpVerifyResult,
  formData: FormData
): Promise<OtpVerifyResult> {
  const me = await requireUser();
  const parsed = verifySchema.safeParse({ code: formData.get("code") });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Código inválido." };
  }

  const admin = createAdminClient();
  const { data: rows } = await admin
    .from("phone_verifications")
    .select("id, phone, code_hash, expires_at, attempts, verified_at")
    .eq("user_id", me.id)
    .is("verified_at", null)
    .order("created_at", { ascending: false })
    .limit(1);

  const row = (rows ?? [])[0] as
    | {
        id: string;
        phone: string;
        code_hash: string;
        expires_at: string;
        attempts: number;
        verified_at: string | null;
      }
    | undefined;

  if (!row) return { ok: false, error: "Solicite um novo código." };
  if (isExpired(row.expires_at)) {
    return { ok: false, error: "Código expirou. Solicite um novo." };
  }
  if (row.attempts >= OTP_MAX_ATTEMPTS) {
    return { ok: false, error: "Muitas tentativas. Solicite um novo código." };
  }

  if (!codeMatches(parsed.data.code, row.code_hash)) {
    await admin
      .from("phone_verifications")
      .update({ attempts: row.attempts + 1 })
      .eq("id", row.id);
    return { ok: false, error: "Código incorreto." };
  }

  const now = new Date().toISOString();
  await admin
    .from("phone_verifications")
    .update({ verified_at: now })
    .eq("id", row.id);
  await admin
    .from("profiles")
    .update({ phone: row.phone, phone_verified_at: now })
    .eq("id", me.id);

  revalidatePath("/completar-perfil");
  return { ok: true };
}
