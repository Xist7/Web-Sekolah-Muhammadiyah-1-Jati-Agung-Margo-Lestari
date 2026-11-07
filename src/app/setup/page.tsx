import { auth, signIn, signOut } from "@/auth";
import { db } from "@/lib/db";

// Halaman sementara untuk cek setup (DB + OAuth). Nanti diganti oleh tim FE/UI-UX.
export const dynamic = "force-dynamic";

async function checkDb() {
  try {
    const [profile, teachers] = await Promise.all([
      db.schoolProfile.findUnique({ where: { id: 1 } }),
      db.teacher.count(),
    ]);
    return { ok: true, info: `profil: ${profile?.name ?? "(belum di-seed)"}, guru: ${teachers}` };
  } catch (e) {
    return { ok: false, info: (e as Error).message };
  }
}

function Status({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${ok ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-700"}`}>
      <span className={`h-2 w-2 rounded-full ${ok ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
      {children}
    </span>
  );
}

export default async function SetupPage({ searchParams }: PageProps<"/setup">) {
  const [session, dbStatus, { error }] = await Promise.all([auth(), checkDb(), searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-900 via-emerald-700 to-teal-500 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white/95 shadow-2xl backdrop-blur">
        <header className="bg-emerald-800 px-6 py-5 text-white">
          <p className="text-xs tracking-widest text-emerald-200 uppercase">Setup check</p>
          <h1 className="text-lg font-bold">SMP Muhammadiyah 1 Jati Agung</h1>
          <p className="text-xs text-emerald-200">Desa Margo Lestari · Lampung Selatan</p>
        </header>

        <div className="divide-y divide-slate-100">
          <section className="space-y-2 px-6 py-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-700">🗄️ Database</h2>
              <Status ok={dbStatus.ok}>{dbStatus.ok ? "terhubung" : "gagal"}</Status>
            </div>
            <p className="font-mono text-xs break-words text-slate-500">{dbStatus.info}</p>
          </section>

          <section className="space-y-3 px-6 py-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-700">🔐 Google OAuth</h2>
              <Status ok={!!session?.user}>{session?.user ? "login" : "belum login"}</Status>
            </div>
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                Login ditolak ({error}) — email belum ada di ADMIN_EMAILS?
              </p>
            )}
            {session?.user ? (
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm text-slate-600">{session.user.email}</p>
                <form action={async () => { "use server"; await signOut(); }}>
                  <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100">Logout</button>
                </form>
              </div>
            ) : (
              <form action={async () => { "use server"; await signIn("google"); }}>
                <button className="w-full rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 active:scale-[0.98]">
                  Login dengan Google
                </button>
              </form>
            )}
          </section>
        </div>

        <footer className="bg-slate-50 px-6 py-3 text-center text-[11px] text-slate-400">
          Kelompok 3 · Kapita Selekta Informatika ITERA 2026
        </footer>
      </div>
    </main>
  );
}
