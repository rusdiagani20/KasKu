import type { Metadata } from "next";
import Providers from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "KasKu — Kelola Arus Kas Bisnis & Pribadi",
  description: "Kelola Arus Kas Bisnis & Pribadi dalam Satu Genggaman. Catat pemasukan dan pengeluaran harian secara instan, rapi, dan terukur.",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block"
          rel="stylesheet"
        />
      </head>
      <body className="bg-light-background text-light-on-background min-h-screen font-body antialiased flex flex-col selection:bg-brand-primary selection:text-light-on-primary">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
