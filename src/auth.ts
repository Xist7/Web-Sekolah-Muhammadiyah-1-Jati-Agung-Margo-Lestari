import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// Hanya email yang terdaftar di ADMIN_EMAILS (pisahkan dengan koma) yang boleh masuk
const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const isAdminEmail = (email?: string | null) =>
  !!email && adminEmails.includes(email.toLowerCase());

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: { error: "/" },
  callbacks: {
    signIn: ({ user }) => isAdminEmail(user.email),
  },
});

