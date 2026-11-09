"use client";

import { signIn, signOut } from "next-auth/react";
import { useState } from "react";

export function GoogleLoginButton() {
  const [loading, setLoading] = useState(false);
  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => {
        setLoading(true);
        signIn("google", { redirectTo: "/dashboard" });
      }}
      className="mt-6 w-full rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 active:scale-[0.98] disabled:opacity-60"
    >
      {loading ? "Mengalihkan ke Google…" : "Login dengan Google"}
    </button>
  );
}

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ redirectTo: "/login" })}
      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-100"
    >
      Logout
    </button>
  );
}
