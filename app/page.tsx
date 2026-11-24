"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const workspaceHref = isAuthenticated ? "/workspace" : "/login?callbackUrl=/workspace";
  useEffect(() => {
    const revealItems = document.querySelectorAll(".reveal-item");
    if (revealItems.length === 0) return;

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("revealed");
              obs.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.15,
          rootMargin: "0px 0px -40px 0px",
        }
      );

      revealItems.forEach((el) => observer.observe(el));
      return () => observer.disconnect();
    } else {
      revealItems.forEach((el) => el.classList.add("revealed"));
    }
  }, []);

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-light-surface/85 backdrop-blur-md border-b border-border-subtle transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-light-primary text-light-on-primary flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[24px]">account_balance_wallet</span>
            </div>
            <div className="flex items-baseline">
              <span className="font-headline text-headline-sm font-extrabold tracking-tight text-light-on-surface">KasKu</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#hero" className="relative font-label text-sm text-light-on-surface-variant font-semibold hover:text-brand-primary after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-full after:bg-brand-primary after:scale-x-0 after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-100 transition-colors">Beranda</a>
            <a href="#fitur" className="relative font-label text-sm text-light-on-surface-variant font-semibold hover:text-brand-primary after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-full after:bg-brand-primary after:scale-x-0 after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-100 transition-colors">Fitur Layanan</a>
            <a href="#keunggulan" className="relative font-label text-sm text-light-on-surface-variant font-semibold hover:text-brand-primary after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-full after:bg-brand-primary after:scale-x-0 after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-100 transition-colors">Keunggulan</a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="font-label text-label-sm text-light-on-surface-variant hidden sm:inline">
                  {session?.user?.name ? `Hai, ${session.user.name}` : "Terhubung"}
                </span>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-light-on-surface-variant hover:text-semantic-expense hover:bg-light-expense-container font-label text-label-sm font-medium transition-colors"
                  title="Keluar dari Akun"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border-subtle text-light-on-surface hover:bg-light-surface-variant font-label text-label-md font-semibold transition-colors"
              >
                <span className="material-symbols-outlined !text-[18px]">login</span>
                <span>Masuk</span>
              </Link>
            )}

            <Link href={workspaceHref} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-light-primary text-light-on-primary font-label text-label-md shadow-sm hover:brightness-110 active:scale-[0.98] transition-all">
              <span>Mulai Mencatat</span>
              <span className="material-symbols-outlined !text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section id="hero" className="relative overflow-hidden pt-12 pb-20 md:pt-15 md:pb-28 border-b border-border-subtle bg-gradient-to-b from-light-surface via-light-background to-light-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

              <div className="lg:col-span-7 flex flex-col items-start text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-light-surface border border-border-subtle shadow-sm mb-6">
                  <span className="w-2 h-2 rounded-full bg-brand-primary animate-ping"></span>
                  <span className="font-label text-label-sm text-light-on-surface-variant font-semibold">Untuk Pekerja &amp; Wirausaha Modern</span>
                </div>

                <h1 className="font-headline text-display-lg-mobile md:text-display-lg text-light-on-surface font-extrabold tracking-tight mb-6 leading-tight">
                  Kelola Arus Kas Bisnis &amp; Pribadi dalam <span className="text-brand-primary underline decoration-border-subtle decoration-4 underline-offset-8">Satu Genggaman.</span>
                </h1>

                <p className="font-body text-body-lg text-light-on-surface-variant mb-8 max-w-2xl leading-relaxed">
                  Catat pemasukan dan pengeluaran harian secara instan, rapi, dan terukur. Tanpa rumit, langsung siap digunakan untuk memantau kesehatan finansial Anda kapan pun dibutuhkan.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                  <Link href={workspaceHref} className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-light-primary text-light-on-primary font-label text-title-md font-semibold shadow-lg shadow-brand-primary/20 hover:shadow-xl hover:shadow-brand-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all text-center">
                    <span>Mulai Catat Keuangan Sekarang</span>
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </Link>
                  <a href="#fitur" className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-light-surface border border-border-subtle text-light-on-surface font-label text-title-md font-semibold hover:bg-light-surface-variant transition-colors text-center">
                    <span>Pelajari Fitur</span>
                    <span className="material-symbols-outlined text-[18px]">south</span>
                  </a>
                </div>

                <div className="mt-10 pt-8 border-t border-border-subtle grid grid-cols-3 gap-6 w-full max-w-lg">
                  <div>
                    <p className="font-headline text-headline-sm font-bold text-light-on-surface">100%</p>
                    <p className="font-label text-label-sm text-light-on-surface-variant">Lokal &amp; Pribadi</p>
                  </div>
                  <div>
                    <p className="font-headline text-headline-sm font-bold text-light-on-surface">Privasi</p>
                    <p className="font-label text-label-sm text-light-on-surface-variant">Terjamin Aman</p>
                  </div>
                  <div>
                    <p className="font-headline text-headline-sm font-bold text-light-on-surface">Real-time</p>
                    <p className="font-label text-label-sm text-light-on-surface-variant">Kalkulasi Otomatis</p>
                  </div>
                </div>
              </div>

              {/* Mockup */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="w-full max-w-md animate-float">
                  <div className="bg-light-surface rounded-2xl border border-border-subtle shadow-xl p-6 relative overflow-hidden backdrop-blur-sm">

                    <div className="flex items-center justify-between pb-4 border-b border-border-subtle mb-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-light-surface-variant flex items-center justify-center text-brand-primary">
                          <span className="material-symbols-outlined text-[18px]">query_stats</span>
                        </div>
                        <div>
                          <p className="font-title text-title-md font-bold text-light-on-surface leading-tight">Overview  KasKu</p>
                          <p className="font-label text-label-sm text-light-on-surface-variant">Update Otomatis</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-light-income-container text-semantic-income font-label text-label-sm font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-semantic-income"></span>
                        Surplus
                      </span>
                    </div>

                    <div className="bg-light-surface-variant/70 rounded-xl p-5 mb-5 border border-border-subtle/80">
                      <p className="font-label text-label-sm text-light-on-surface-variant font-medium mb-1">Total Saldo Bersih Saat Ini</p>
                      <p className="font-headline text-headline-lg-mobile text-light-on-surface font-extrabold tabular-nums tracking-tight">Rp 12.850.000</p>
                      <div className="mt-3 flex items-center gap-2 text-label-sm text-semantic-income font-semibold">
                        <span className="material-symbols-outlined text-[18px]">trending_up</span>
                        <span>Pertumbuhan kas +18.4% bulan ini</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <div className="p-3.5 rounded-xl border border-border-subtle bg-light-surface">
                        <span className="font-label text-label-sm text-light-on-surface-variant block mb-1">Uang Masuk (+)</span>
                        <span className="font-title text-title-md font-bold text-semantic-income tabular-nums">Rp 18.500.000</span>
                      </div>
                      <div className="p-3.5 rounded-xl border border-border-subtle bg-light-surface">
                        <span className="font-label text-label-sm text-light-on-surface-variant block mb-1">Uang Keluar (-)</span>
                        <span className="font-title text-title-md font-bold text-semantic-expense tabular-nums">Rp 5.650.000</span>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <p className="font-label text-label-sm text-light-on-surface-variant font-semibold">Transaksi Terbaru</p>

                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-light-surface-variant/40 border border-border-subtle/50 text-label-md">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-semantic-income"></span>
                          <span className="font-medium text-light-on-surface">Invoice Proyek Desain UI</span>
                        </div>
                        <span className="font-bold text-semantic-income tabular-nums">+Rp 7.500.000</span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-light-surface-variant/40 border border-border-subtle/50 text-label-md">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-semantic-expense"></span>
                          <span className="font-medium text-light-on-surface">Biaya Sewa &amp; Server</span>
                        </div>
                        <span className="font-bold text-semantic-expense tabular-nums">-Rp 650.000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Layanan Utama */}
        <section id="fitur" className="py-24 bg-light-surface border-b border-border-subtle">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="text-center max-w-3xl mx-auto mb-16 reveal-item">
              <span className="font-label text-label-sm text-brand-primary font-bold tracking-widest uppercase mb-3 inline-block">Layanan Utama</span>
              <h2 className="font-headline text-headline-lg text-light-on-surface font-extrabold tracking-tight mb-4">
                Fokus pada Hal yang Paling Penting bagi Finansial Anda
              </h2>
              <p className="font-body text-body-lg text-light-on-surface-variant">
                Pencatatan kas yang ringkas memudahkan Anda mengambil keputusan bisnis secara akurat tanpa terbebani kerumitan aplikasi akuntansi konvensional.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              <div className="reveal-item p-8 rounded-2xl bg-light-background border border-border-subtle hover:border-brand-primary transition-all duration-300 hover:shadow-md group">
                <div className="w-14 h-14 rounded-2xl bg-light-income-container text-semantic-income flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[30px]">trending_up</span>
                </div>
                <h3 className="font-headline text-headline-md text-light-on-surface font-bold mb-3">Pencatatan Pemasukan Terstruktur</h3>
                <p className="font-body text-body-md text-light-on-surface-variant leading-relaxed mb-6">
                  Pantau setiap sumber pendapatan mulai dari gaji bulanan, pembayaran klien freelance, hingga omzet penjualan usaha harian secara real-time. Ketahui persis dari mana arus dana masuk Anda berasal.
                </p>
                <ul className="space-y-2.5 font-label text-label-md text-light-on-surface">
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-semantic-income text-[18px]">check_circle</span><span>Kategorisasi pendapatan usaha &amp; gaji terpisah</span></li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-semantic-income text-[18px]">check_circle</span><span>Format nominal otomatis dalam pecahan Rupiah</span></li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-semantic-income text-[18px]">check_circle</span><span>Agregasi pemasukan langsung pada kartu ringkasan</span></li>
                </ul>
              </div>

              <div className="reveal-item p-8 rounded-2xl bg-light-background border border-border-subtle hover:border-brand-primary transition-all duration-300 hover:shadow-md group">
                <div className="w-14 h-14 rounded-2xl bg-light-expense-container text-semantic-expense flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[30px]">trending_down</span>
                </div>
                <h3 className="font-headline text-headline-md text-light-on-surface font-bold mb-3">Kontrol Pengeluaran Operasional &amp; Pribadi</h3>
                <p className="font-body text-body-md text-light-on-surface-variant leading-relaxed mb-6">
                  Catat setiap biaya operasional usaha maupun pengeluaran rutin harian agar arus kas tetap terkendali dan terhindar dari kebocoran anggaran yang tidak disadari.
                </p>
                <ul className="space-y-2.5 font-label text-label-md text-light-on-surface">
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-semantic-expense text-[18px]">check_circle</span><span>Monitoring beban operasional, tagihan, &amp; konsumsi</span></li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-semantic-expense text-[18px]">check_circle</span><span>Deteksi dini pengeluaran yang melebihi batas saldo</span></li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-semantic-expense text-[18px]">check_circle</span><span>Pencarian dan peninjauan riwayat pengeluaran cepat</span></li>
                </ul>
              </div>

            </div>
          </div>
        </section>

        {/* Keunggulan */}
        <section id="keunggulan" className="py-20 bg-light-background border-b border-border-subtle">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="text-center max-w-2xl mx-auto mb-16 reveal-item">
              <h2 className="font-headline text-headline-lg text-light-on-surface font-extrabold tracking-tight mb-4">Mengapa Memilih KasKu?</h2>
              <p className="font-body text-body-lg text-light-on-surface-variant">Didesain ulang dengan standar performa modern untuk kecepatan dan kenyamanan penggunaan sehari-hari.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="reveal-item bg-light-surface p-6 rounded-xl border border-border-subtle shadow-sm">
                <div className="w-12 h-12 rounded-lg bg-light-surface-variant text-brand-primary flex items-center justify-center mb-4"><span className="material-symbols-outlined text-[24px]">speed</span></div>
                <h3 className="font-title text-title-lg font-bold text-light-on-surface mb-2">Instan &amp; Ringan</h3>
                <p className="font-body text-body-md text-light-on-surface-variant">Tanpa perlu instalasi aplikasi berat atau login yang memakan waktu. Buka di browser dan langsung catat transaksi Anda dalam hitungan detik.</p>
              </div>
              <div className="reveal-item bg-light-surface p-6 rounded-xl border border-border-subtle shadow-sm">
                <div className="w-12 h-12 rounded-lg bg-light-surface-variant text-brand-primary flex items-center justify-center mb-4"><span className="material-symbols-outlined text-[24px]">lock</span></div>
                <h3 className="font-title text-title-lg font-bold text-light-on-surface mb-2">Privasi Terjaga</h3>
                <p className="font-body text-body-md text-light-on-surface-variant">Semua data finansial tersimpan aman di penyimpanan lokal (localStorage) browser perangkat Anda sendiri tanpa dikirim ke server pihak ketiga.</p>
              </div>
              <div className="reveal-item bg-light-surface p-6 rounded-xl border border-border-subtle shadow-sm">
                <div className="w-12 h-12 rounded-lg bg-light-surface-variant text-brand-primary flex items-center justify-center mb-4"><span className="material-symbols-outlined text-[24px]">devices</span></div>
                <h3 className="font-title text-title-lg font-bold text-light-on-surface mb-2">Responsif di Semua Layar</h3>
                <p className="font-body text-body-md text-light-on-surface-variant">Tata letak yang secara otomatis beradaptasi mulus dari layar smartphone, tablet, hingga layar monitor desktop Anda.</p>
              </div>
            </div>

            <div className="mt-16 reveal-item bg-light-primary rounded-2xl p-8 md:p-12 text-center text-light-on-primary shadow-xl">
              <h3 className="font-headline text-headline-lg font-extrabold mb-3">Siap Merapikan Catatan Keuangan Anda?</h3>
              <p className="font-body text-body-lg text-white/90 max-w-2xl mx-auto mb-8">Beralih ke pencatatan digital yang rapi dan terukur sekarang juga bersama KasKu.</p>
              <Link href={workspaceHref} className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-light-surface text-brand-primary font-label text-title-md font-bold shadow-md hover:bg-light-surface-variant transition-colors">
                <span>Buka Workspace KasKu</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </Link>
            </div>

          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-light-surface border-t border-border-subtle py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-headline text-title-md font-extrabold text-light-on-surface">KasKu</span>
            <span className="text-light-outline">|</span>
            <p className="font-label text-label-sm text-light-on-surface-variant">© 2026 KasKu — Digital Finance Tracker</p>
          </div>
          <div className="flex items-center gap-6">
            <a href="#hero" className="font-label text-label-sm text-light-on-surface-variant hover:text-brand-primary transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
              <span>Kembali ke Atas</span>
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
