import { AdminSidebar } from "@/components/admin/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { requireRole } from "@/lib/data/user";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const me = await requireRole(["super_admin"]);
  return (
    <div className="flex min-h-screen w-full">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader email={me.email} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
