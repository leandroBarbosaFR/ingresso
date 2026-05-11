import { redirect } from "next/navigation";

import { CompleteProfile } from "@/components/auth/complete-profile";
import { safeNext } from "@/lib/auth/safe-redirect";
import { isProfileComplete, requireUser } from "@/lib/data/user";

export const metadata = {
  title: "Completar perfil — Ingressos",
};

export default async function CompleteProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const me = await requireUser();
  const sp = await searchParams;
  const next = safeNext(sp.next, "/");

  if (isProfileComplete(me.profile)) {
    redirect(next);
  }

  // Decide which step to open with based on what's already saved.
  const initialStep = me.profile.full_name && me.profile.document_number
    ? me.profile.phone && !me.profile.phone_verified_at
      ? "code"
      : "phone"
    : "identity";

  return <CompleteProfile initialStep={initialStep} next={next} />;
}
