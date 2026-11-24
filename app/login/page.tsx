"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/workspace";
  const { data: session, status } = useSession();

  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Jika sudah terotentikasi, otomatis redirect ke callbackUrl
  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  const handleOAuthLogin = async (provider: string, providerName: string) => {
    try {
      setLoadingProvider(provider);
      setSuccessBanner(`Menghubungkan ke ${providerName}...`);
      await signIn(provider, { callbackUrl });
    } catch (err) {
      console.error(err);
      setLoadingProvider(null);
      setSuccessBanner(null);
    }
  };

  const handleDemoLogin = async () => {
    try {
      setLoadingProvider("demo");
      setSuccessBanner("Menyiapkan sesi Akun Google Demo...");
      const res = await signIn("demo-google", {
        redirect: false,
        name: "Sobat KasKu",
        callbackUrl,
      });
      if (res?.ok) {
        setSuccessBanner("Autentikasi Google Berhasil! Mengalihkan ke Workspace...");
        setTimeout(() => {
          router.replace(callbackUrl);
        }, 600);
      } else {
        setLoadingProvider(null);
        setSuccessBanner(null);
      }
    } catch (err) {
      console.error(err);
      setLoadingProvider(null);
      setSuccessBanner(null);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Sisi Kiri: Karakter & Informasi Autentikasi */}
      <section
        aria-label="Ilustrasi Keamanan Autentikasi"
        className="bg-light-surface-variant border-b lg:border-b-0 lg:border-r border-border-subtle flex flex-col justify-between p-6 sm:p-10 lg:p-12"
      >
        {/* Brand Header */}
        <header className="flex items-center justify-between gap-4 ">
          <Link
            href="/"
            className="inline-flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-brand-primary rounded-lg"
          >
            <div className="w-10 h-10 rounded-lg bg-light-primary text-light-on-primary flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
                account_balance_wallet
              </span>
            </div>
            <span className="font-title text-title-lg font-bold text-light-on-surface tracking-tight">
              KasKu
            </span>
          </Link>

          <span
            role="status"
            aria-label="Status Keamanan Aktif"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-light-surface border border-border-subtle font-label text-label-sm text-light-on-surface-variant"
          >
            <span className="w-2 h-2 rounded-full bg-semantic-income"></span>
            <span>OAuth Aman</span>
          </span>
        </header>

        {/* Ilustrasi Karakter Autentikasi */}
        <div className="my-8 lg:my-auto hidden md:flex flex-col items-center text-center max-w-lg mx-auto animate-item-in">
          <div className="w-full rounded-xl overflow-hidden border border-border-subtle bg-light-surface shadow-sm mb-8">
            <img
              src="/login.jpg"
              alt="Ilustrasi pengguna sedang melakukan verifikasi autentikasi aman"
              className="w-full h-auto object-cover block"
            />
          </div>

          <h2 className="font-headline text-headline-md text-light-on-surface font-bold text-balance mb-3">
            Akses Cepat &amp; Aman dalam Satu Ketukan
          </h2>
          <p className="font-body text-body-md text-light-on-surface-variant text-pretty max-w-md">
            Verifikasi identitas Anda secara instan melalui akun Google tanpa perlu mengingat kata sandi tambahan.
          </p>
        </div>

        {/* Footer Trust Info */}
        <footer className="hidden md:flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4 border-t border-border-subtle">
          <div className="flex items-center gap-2 text-light-on-surface-variant">
            <span className="material-symbols-outlined text-[20px] text-semantic-income" aria-hidden="true">
              verified_user
            </span>
            <span className="font-label text-label-md">Proteksi OAuth 2.0</span>
          </div>
          <div className="flex items-center gap-2 text-light-on-surface-variant">
            <span className="material-symbols-outlined text-[20px] text-brand-primary" aria-hidden="true">
              bolt
            </span>
            <span className="font-label text-label-md">Sinkronisasi Arus Kas Instan</span>
          </div>
        </footer>
      </section>

      {/* Sisi Kanan: Form Login OAuth Khusus Google & GitHub */}
      <main className="flex flex-col justify-center items-center p-6 sm:p-10 lg:p-16 bg-light-background">
        <div className="w-full max-w-md animate-item-in">
          {/* Link Kembali */}
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-light-on-surface-variant hover:text-brand-primary transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary rounded-md py-1"
            >
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                arrow_back
              </span>
              <span className="font-label text-label-lg">Kembali ke Beranda</span>
            </Link>
          </div>

          {/* Card Elevated */}
          <article className="bg-light-surface rounded-xl border border-border-subtle p-8 sm:p-10 shadow-sm">
            <header className="mb-8">
              <div className="w-12 h-12 rounded-xl bg-light-surface-variant border border-border-subtle flex items-center justify-center mb-6 text-brand-primary">
                <span className="material-symbols-outlined text-[26px]" aria-hidden="true">
                  passkey
                </span>
              </div>
              <h1 className="font-headline text-headline-lg-mobile sm:text-headline-md text-light-on-surface font-bold text-balance mb-2">
                Masuk ke KasKu
              </h1>
              <p className="font-body text-body-md text-light-on-surface-variant text-pretty">
                Gunakan akun Google atau GitHub Anda untuk masuk dan mulai mengelola arus kas keuangan secara instan.
              </p>
            </header>

            {/* Tombol Login OAuth */}
            <div className="flex flex-col gap-3.5">
              {/* Tombol Google */}
              <button
                type="button"
                id="google-signin-btn"
                disabled={loadingProvider !== null}
                onClick={() => handleOAuthLogin("google", "Google")}
                className="w-full inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-lg bg-light-surface border border-light-outline text-light-on-surface font-label text-label-lg shadow-sm hover:border-brand-primary hover:bg-light-surface-variant active:scale-[0.99] transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 disabled:opacity-75 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                  />
                </svg>
                <span>
                  {loadingProvider === "google" ? "Menghubungkan ke Google..." : "Masuk dengan Google"}
                </span>
              </button>

              {/* Tombol GitHub */}
              <button
                type="button"
                id="github-signin-btn"
                disabled={loadingProvider !== null}
                onClick={() => handleOAuthLogin("github", "GitHub")}
                className="w-full inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-lg bg-[#24292F] text-white font-label text-label-lg shadow-sm hover:bg-[#1b1f23] active:scale-[0.99] transition-all focus:outline-none focus:ring-2 focus:ring-slate-800 focus:ring-offset-2 disabled:opacity-75 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
                </svg>
                <span>
                  {loadingProvider === "github" ? "Menghubungkan ke GitHub..." : "Masuk dengan GitHub"}
                </span>
              </button>

              {/* Tombol Demo Cepat (Sangat praktis untuk demonstrasi/testing instan) */}
              <div className="pt-2">
                <button
                  type="button"
                  id="demo-signin-btn"
                  disabled={loadingProvider !== null}
                  onClick={handleDemoLogin}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-border-subtle bg-light-surface-variant/70 text-light-on-surface-variant hover:text-brand-primary hover:border-brand-primary text-label-md font-semibold transition-all active:scale-[0.99] disabled:opacity-75"
                  title="Masuk langsung menggunakan akun simulasi tanpa perlu setup OAuth credentials"
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>
                    {loadingProvider === "demo"
                      ? "Menyiapkan sesi demo..."
                      : "Masuk Cepat (Akun Demo)"}
                  </span>
                </button>
              </div>

              {/* Status Umpan Balik Autentikasi */}
              {successBanner && (
                <div
                  id="auth-status-banner"
                  className="rounded-lg bg-light-income-container border border-border-subtle p-4 flex items-start gap-3 mt-2 animate-item-in"
                  role="status"
                  aria-live="polite"
                >
                  <span
                    className="material-symbols-outlined text-[20px] text-light-on-income-container shrink-0 mt-0.5"
                    aria-hidden="true"
                  >
                    check_circle
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-label text-label-md font-bold text-light-on-income-container">
                      Proses Autentikasi
                    </span>
                    <span className="font-body text-body-sm text-light-on-income-container">
                      {successBanner}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Catatan Keamanan Ringkas */}
            <div className="mt-8 pt-6 border-t border-border-subtle flex flex-col gap-3">
              <div className="flex items-start gap-2.5 text-light-on-surface-variant">
                <span className="material-symbols-outlined text-[20px] text-brand-primary shrink-0 mt-0.5" aria-hidden="true">
                  lock
                </span>
                <p className="font-label text-label-md text-light-on-surface-variant leading-relaxed text-balance">
                  KasKu hanya mengakses nama dan alamat email akun Anda untuk sinkronisasi profil. Data keuangan Anda tersimpan lokal di perangkat dan tetap privat.
                </p>
              </div>
            </div>
          </article>

          {/* Legal & Footer */}
          <p className="font-label text-label-sm text-light-on-surface-variant text-center mt-6">
            Dengan melanjutkan, Anda menyetujui Ketentuan Layanan dan Kebijakan Privasi KasKu.
          </p>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-light-background">
          <div className="flex items-center gap-3 text-light-on-surface-variant font-label text-label-lg">
            <span className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></span>
            <span>Memuat halaman autentikasi...</span>
          </div>
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
