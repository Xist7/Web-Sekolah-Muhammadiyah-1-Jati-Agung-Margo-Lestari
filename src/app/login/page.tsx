import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { auth } from "@/auth";
import { GoogleLoginButton, LogoutButton } from "@/components/auth/buttons";
import { getCurrentAdmin } from "@/lib/admin/guard";

export const metadata: Metadata = { title: "Login Admin" };

const errorMessages: Record<string, string> = {
  AccessDenied: "Email ini tidak terdaftar sebagai admin, atau email Google belum terverifikasi.",
  Revoked: "Akses admin untuk akun ini sudah dicabut / dinonaktifkan. Silakan logout.",
  Configuration: "Konfigurasi login bermasalah. Hubungi pengelola sistem.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const [session, { error }] = await Promise.all([auth(), searchParams]);
  // Hanya admin aktif yang diteruskan ke dashboard (hindari loop kalau akses sudah dicabut)
  if (session?.user && (await getCurrentAdmin())) redirect("/dashboard");

  const errorCode = typeof error === "string" ? error : undefined;

  return (
    <main className="lg">
      <div className="lg-shell">
        {/* Panel kiri: foto sekolah (disembunyikan di HP) */}
        <aside className="lg-side" style={{ backgroundImage: "url('/hero.jpg')" }}>
          <div className="lg-side-overlay" />
          <div className="lg-side-content">
            <div className="lg-side-brand">
              <Image src="/logoSkula.png" alt="" width={44} height={44} />
              <b>SMP Muhammadiyah 1 Jati Agung</b>
            </div>
            <div>
              <p className="lg-side-eyebrow">Panel Admin</p>
              <h2>Kelola konten sekolah dari satu tempat</h2>
              <p className="lg-side-desc">
                Perbarui berita, data guru, informasi PPDB, dan pantau pendaftar tanpa menyentuh kode.
              </p>
            </div>
            <p className="lg-side-visi">
              “Terbentuknya generasi Qurani yang berakhlak mulia, berkemajuan, dan unggul dalam ilmu pengetahuan serta teknologi”
            </p>
          </div>
        </aside>

        {/* Panel kanan: kartu login */}
        <section className="lg-panel">
          <div className="lg-card">
            <div className="lg-card-logo">
              <Image src="/logoSkula.png" alt="Logo SMP Muhammadiyah 1 Jati Agung" width={56} height={56} priority />
            </div>
            <p className="lg-eyebrow">Panel Admin</p>
            <span className="lg-line" aria-hidden="true" />
            <h1>Masuk ke Dashboard</h1>
            <p className="lg-desc">Gunakan akun Google yang sudah terdaftar sebagai admin sekolah.</p>

            {errorCode && (
              <p role="alert" className="lg-alert">
                {errorMessages[errorCode] ?? `Login gagal (${errorCode}). Silakan coba lagi.`}
              </p>
            )}

            {session?.user ? (
              <div className="lg-session">
                <p>{session.user.email}</p>
                <LogoutButton />
              </div>
            ) : (
              <div className="lg-action">
                <GoogleLoginButton />
              </div>
            )}

            <p className="lg-note">
              <ShieldCheck size={16} aria-hidden="true" />
              Hanya email yang terdaftar sebagai admin yang dapat masuk.
            </p>

            <Link className="lg-back" href="/">
              <ArrowLeft size={16} aria-hidden="true" />
              Kembali ke beranda
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}