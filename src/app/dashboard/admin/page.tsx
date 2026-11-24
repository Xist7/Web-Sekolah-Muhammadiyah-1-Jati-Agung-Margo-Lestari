import { envAdmins } from "@/auth";
import { requireAdminPage } from "@/lib/admin/guard";
import { isSuperadmin, superadminEmail } from "@/lib/admin/roles";
import { db } from "@/lib/db";
import { AddAdminForm, AdminRow } from "./admin-forms";

export const dynamic = "force-dynamic";

export default async function KelolaAdminPage() {
  const me = await requireAdminPage();
  const rows = (await db.admin.findMany({ orderBy: { email: "asc" } })).map((a) => ({
    id: a.id,
    email: a.email,
    name: a.name,
    isActive: a.isActive,
    isSuper: false,
    lastLogin: a.lastLoginAt?.toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }) ?? "Belum pernah",
  }));
  // Superadmin selalu di baris pertama & selalu aktif, walau belum pernah login (belum ada di tabel)
  const sup = rows.find((a) => isSuperadmin(a.email));
  const admins = [
    ...(superadminEmail ? [{ id: "superadmin", name: "", lastLogin: "Belum pernah", ...sup, email: superadminEmail, isActive: true, isSuper: true }] : []),
    ...rows.filter((a) => a !== sup),
  ];
  const cadangan = envAdmins.filter((e) => !isSuperadmin(e));

  return (
    <main className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Kelola Admin</h1>
        <p className="text-sm text-slate-500">
          Hanya email berstatus <b>Aktif</b> di daftar ini yang bisa login ke panel admin lewat Google. <b>Superadmin</b> cuma satu dan tidak bisa
          diubah, dinonaktifkan, atau dihapus oleh siapa pun.
        </p>
      </div>

      {!superadminEmail && (
        <p className="rounded-xl bg-amber-50 px-5 py-4 text-sm text-amber-800 ring-1 ring-amber-200">
          ⚠ Superadmin belum ditentukan. Isi env <code>SUPERADMIN_EMAIL</code> dengan satu email Google (di <code>.env</code> dan di Vercel), lalu jalankan ulang / deploy ulang.
        </p>
      )}

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
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Login Terakhir</th>
                <th className="px-5 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {admins.map((a) => (
                <AdminRow key={a.id} admin={a} isMe={a.email === me.email} />
              ))}
              {admins.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">Belum ada admin di database.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {cadangan.length > 0 && (
        <p className="text-xs text-slate-400">
          Admin cadangan dari env <code>ADMIN_EMAILS</code> (tidak bisa diubah dari sini): {cadangan.join(", ")}
        </p>
      )}
    </main>
  );
}
