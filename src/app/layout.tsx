import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SMP Muhammadiyah 1 Jati Agung",
  description: "Website profil dan PPDB SMP Muhammadiyah 1 Jati Agung",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
