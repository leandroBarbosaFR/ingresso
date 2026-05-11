import { Users } from "lucide-react";

import { RoleSelect } from "@/components/admin/role-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dateShort } from "@/lib/format";
import { listAllUsers } from "@/lib/data/admin";
import { requireRole, type UserRole } from "@/lib/data/user";

export default async function AdminUsersPage() {
  const me = await requireRole(["super_admin"]);
  const users = await listAllUsers();

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Usuários</h1>
        <p className="text-sm text-muted-foreground">
          {users.length} {users.length === 1 ? "usuário" : "usuários"} ·
          gerencie papéis aqui.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Todos os usuários</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {users.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <Users className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Nenhum usuário ainda.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {users.map((u) => {
                const isSelf = u.id === me.id;
                return (
                  <div
                    key={u.id}
                    className="grid items-center gap-4 px-4 py-3 sm:grid-cols-[2fr_2fr_auto_auto]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {u.name ?? u.email ?? "—"}
                        {isSelf ? (
                          <span className="ml-2 text-xs text-muted-foreground">
                            (você)
                          </span>
                        ) : null}
                      </p>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {u.email ?? "—"}
                    </p>
                    <RoleSelect
                      userId={u.id}
                      currentRole={u.role as UserRole}
                      disabled={isSelf}
                    />
                    <span className="text-xs text-muted-foreground">
                      {dateShort(u.created_at)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
