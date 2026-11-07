import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import "./globals.css";
import "./styles.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: {
    default: "SMP Muhammadiyah 1 Jati Agung — Beranda & PPDB 2026/2027",
    template: "%s — SMP Muhammadiyah 1 Jati Agung",
  },
  description:
    "Sekolah Swasta Islam di Jati Agung, Lampung Selatan. Penerimaan Siswa Baru (PPDB) 2026/2027 telah dibuka.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id">
      <body className={jakarta.className}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
