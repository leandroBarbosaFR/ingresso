import { OrganizerForm } from "@/components/dashboard/organizer-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireOrganizer } from "@/lib/data/organizer";

export default async function ConfigPage() {
  const { organizer, user } = await requireOrganizer();
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground">
          Dados da empresa usados em ingressos, e-mails e NFS-e.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Conta</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Organização</CardTitle>
          <CardDescription>
            Esses dados aparecem na página pública dos seus eventos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrganizerForm organizer={organizer} />
        </CardContent>
      </Card>
    </div>
  );
}
