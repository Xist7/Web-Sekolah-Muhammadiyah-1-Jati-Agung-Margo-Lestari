import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCurrentAdmin } from "@/lib/admin/guard";
import { AdminShell } from "./sidebar";

export const metadata: Metadata = { title: "Panel Admin" };

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  // Sudah login tapi akses admin dicabut / dinonaktifkan
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/login?error=Revoked");

  return (
    <AdminShell email={admin.email} name={admin.name ?? ""}>
      {children}
    </AdminShell>
  );
}
