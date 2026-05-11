"use client";

import { useRef, useTransition } from "react";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { setUserRole } from "@/lib/actions/admin";
import type { UserRole } from "@/lib/data/user";

export function RoleSelect({
  userId,
  currentRole,
  disabled,
}: {
  userId: string;
  currentRole: UserRole;
  disabled?: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form ref={formRef} action={setUserRole} className="flex">
      <input type="hidden" name="user_id" value={userId} />
      <Select
        name="role"
        defaultValue={currentRole}
        disabled={disabled || pending}
        onValueChange={(next) => {
          if (!next || next === currentRole) return;
          const fd = new FormData();
          fd.set("user_id", userId);
          fd.set("role", String(next));
          startTransition(() => {
            setUserRole(fd)
              .then(() => toast.success("Papel atualizado."))
              .catch((err: unknown) =>
                toast.error(err instanceof Error ? err.message : "Falhou.")
              );
          });
        }}
      >
        <SelectTrigger size="sm" className="h-8 min-w-[150px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="super_admin">Super admin</SelectItem>
          <SelectItem value="event_maker">Organizador</SelectItem>
          <SelectItem value="client_user">Comprador</SelectItem>
        </SelectContent>
      </Select>
    </form>
  );
}
