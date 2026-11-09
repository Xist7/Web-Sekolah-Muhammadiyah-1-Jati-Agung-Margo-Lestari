import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LogoutButton } from "@/components/auth/buttons";

export const metadata: Metadata = { title: "Dashboard Admin" };

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-[70vh] bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 pt-8">
        <div>
          <p className="text-xs font-semibold tracking-widest text-emerald-700 uppercase">Panel Admin</p>
          <p className="text-sm text-slate-500">
            Masuk sebagai <span className="font-medium text-slate-700">{session.user.email}</span>
          </p>
        </div>
        <LogoutButton />
      </div>
      {children}
    </div>
  );
}
