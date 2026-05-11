import { CheckInForm } from "@/components/dashboard/check-in-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireOrganizer } from "@/lib/data/organizer";

export default async function CheckInPage() {
  await requireOrganizer();
  return (
    <div className="mx-auto w-full max-w-xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Check-in</h1>
        <p className="text-sm text-muted-foreground">
          Valide ingressos pelo código do QR.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Validar ingresso</CardTitle>
          <CardDescription>
            Cole o código do QR (UUID) impresso ou enviado por e-mail. A leitura
            por câmera será adicionada em breve.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CheckInForm />
        </CardContent>
      </Card>
    </div>
  );
}
