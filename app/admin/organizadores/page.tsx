import { Building2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dateShort } from "@/lib/format";
import { listAllOrganizers } from "@/lib/data/admin";

export default async function AdminOrganizersPage() {
  const organizers = await listAllOrganizers();

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Organizadores
        </h1>
        <p className="text-sm text-muted-foreground">
          {organizers.length} {organizers.length === 1 ? "conta" : "contas"} na
          plataforma.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Todas as contas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {organizers.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <Building2 className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Nenhum organizador ainda.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {organizers.map((o) => (
                <div
                  key={o.id}
                  className="grid items-center gap-4 px-4 py-3 sm:grid-cols-[2fr_2fr_1fr_auto]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{o.name}</p>
                    {o.legal_name ? (
                      <p className="truncate text-xs text-muted-foreground">
                        {o.legal_name}
                      </p>
                    ) : null}
                  </div>
                  <div className="min-w-0 text-xs text-muted-foreground">
                    <p className="truncate">{o.email ?? "—"}</p>
                    {o.cnpj ? <p className="truncate">{o.cnpj}</p> : null}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {o.tax_regime ?? "Regime não informado"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    desde {dateShort(o.created_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
