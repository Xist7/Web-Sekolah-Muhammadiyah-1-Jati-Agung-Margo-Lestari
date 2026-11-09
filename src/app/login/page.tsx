import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { GoogleLoginButton } from "@/components/auth/buttons";

export const metadata: Metadata = { title: "Login Admin" };

const errorMessages: Record<string, string> = {
  AccessDenied: "Email ini tidak terdaftar sebagai admin.",
  Configuration: "Konfigurasi login bermasalah. Hubungi pengelola sistem.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const [session, { error }] = await Promise.all([auth(), searchParams]);
  if (session?.user) redirect("/dashboard");

  const errorCode = typeof error === "string" ? error : undefined;

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg ring-1 ring-slate-100">
        <p className="text-xs font-semibold tracking-widest text-emerald-700 uppercase">Panel Admin</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-800">Masuk ke Dashboard</h1>
        <p className="mt-2 text-sm text-slate-500">
          Gunakan akun Google yang sudah terdaftar sebagai admin sekolah.
        </p>

        {errorCode && (
          <p role="alert" className="mt-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessages[errorCode] ?? `Login gagal (${errorCode}). Silakan coba lagi.`}
          </p>
        )}

        <GoogleLoginButton />
      </div>
    </main>
  );
}
