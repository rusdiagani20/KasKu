# KasKu — Digital Finance Tracker (Next.js + TypeScript + Tailwind CSS)

Aplikasi pencatatan arus kas pribadi dan bisnis yang instan, ringan, responsif, dan mengutamakan privasi dengan penyimpanan lokal (*localStorage*).

## Teknologi yang Digunakan
- **Next.js 14 (App Router)**
- **TypeScript**
- **Tailwind CSS**
- **SweetAlert2** untuk notifikasi toast dan dialog konfirmasi
- **Plus Jakarta Sans** & **Material Symbols Outlined**

## Struktur Halaman & Fitur
- `/` — **Landing Page**: Pengenalan KasKu, hero overview kas, mockup interaktif, layanan utama, keunggulan fitur, dan tombol CTA.
- `/workspace` — **Workspace Dasbor Finansial**:
  - Kartu Ringkasan Real-time: Saldo Saat Ini (dengan indikator status surplus/defisit/netral), Total Uang Masuk, Total Uang Keluar.
  - Formulir Tambah & Edit Transaksi dengan toggle klasifikasi (Pemasukan / Pengeluaran), nominal Rupiah, keterangan, kategori dinamis, dan tanggal.
  - Riwayat Transaksi lengkap dengan pencarian real-time, filter tab (Semua / Pemasukan / Pengeluaran), mode edit di tempat, dan hapus dengan animasi dan konfirmasi.
  - Panel daftar arus pemasukan dan pengeluaran terpisah.
  - Fitur Reset Data Demo.
  - Persistensi data tersimpan aman di browser (*localStorage*).

## Menjalankan Proyek

### 1. Mode Development
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

### 2. Build Production
```bash
npm run build
npm start
```
