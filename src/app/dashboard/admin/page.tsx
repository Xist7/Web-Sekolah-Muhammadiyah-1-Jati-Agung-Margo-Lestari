import { envAdmins } from "@/auth";
import { requireAdminPage } from "@/lib/admin/guard";
import { db } from "@/lib/db";
import { AddAdminForm, AdminRow } from "./admin-forms";

export const dynamic = "force-dynamic";

export default async function KelolaAdminPage() {
  const me = await requireAdminPage();
  const admins = await db.admin.findMany({ orderBy: { email: "asc" } });

  return (
    <main className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Kelola Admin</h1>
        <p className="text-sm text-slate-500">
          Hanya email berstatus <b>Aktif</b> di daftar ini yang bisa login ke panel admin lewat Google.
        </p>
      </div>

      <AddAdminForm />

      <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-100">
        <h2 className="border-b border-slate-100 px-5 py-4 font-semibold text-slate-700">
          Daftar Admin <span className="text-sm font-normal text-slate-400">({admins.length})</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Login Terakhir</th>
                <th className="px-5 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {admins.map((a) => (
                <AdminRow
                  key={a.id}
                  admin={{ id: a.id, email: a.email, name: a.name, isActive: a.isActive, lastLogin: a.lastLoginAt?.toLocaleString("id-ID") ?? "Belum pernah" }}
                  isMe={a.email === me.email}
                />
              ))}
              {admins.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-400">Belum ada admin di database.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {envAdmins.length > 0 && (
        <p className="text-xs text-slate-400">
          Admin cadangan dari env <code>ADMIN_EMAILS</code> (tidak bisa diubah dari sini): {envAdmins.join(", ")}
        </p>
      )}
    </main>
  );
}
