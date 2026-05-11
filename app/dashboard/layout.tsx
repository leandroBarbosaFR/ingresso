import { redirect } from "next/navigation";

import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { requireUser } from "@/lib/data/user";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const me = await requireUser();
  if (me.profile.role === "client_user") {
    redirect("/minha-conta");
  }

  return (
    <div className="flex min-h-screen w-full">
      <DashboardSidebar role={me.profile.role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader email={me.email} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
