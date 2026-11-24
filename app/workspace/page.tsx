"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Transaction, TransactionType } from "@/lib/types";
import {
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  DEFAULT_TRANSACTIONS,
  STORAGE_KEY,
  formatRupiah,
  formatDateIndo,
} from "@/lib/utils";
import { showSuccess, showError, showConfirm } from "@/lib/alerts";

export default function WorkspacePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Proteksi Rute: jika belum login, alihkan ke halaman login
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?callbackUrl=/workspace");
    }
  }, [status, router]);

  // Form State
  const [formType, setFormType] = useState<TransactionType>("income");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<string>(INCOME_CATEGORIES[0]);
  const [date, setDate] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter & Search State
  const [currentFilter, setCurrentFilter] = useState<"all" | "income" | "expense">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");

  // Refs for scrolling and focus
  const formRef = useRef<HTMLFormElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Initialize Date and Load Data
  useEffect(() => {
    const today = new Date();
    const formatted = today.toISOString().split("T")[0];
    setDate(formatted);

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTransactions(parsed);
          setIsLoaded(true);
          return;
        }
      }
    } catch (e) {
      console.warn("Gagal membaca localStorage, menggunakan data default:", e);
    }
    setTransactions(DEFAULT_TRANSACTIONS);
    setIsLoaded(true);
  }, []);

  const saveToStorage = (data: Transaction[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn("Gagal menyimpan ke localStorage:", e);
      return false;
    }
  };

  const handleTypeChange = (newType: TransactionType) => {
    setFormType(newType);
    const availableCategories = newType === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    if (!availableCategories.includes(category)) {
      setCategory(availableCategories[0]);
    }
  };

  // Date formatted display string for header
  const [dateDisplayStr, setDateDisplayStr] = useState("");
  useEffect(() => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    setDateDisplayStr(today.toLocaleDateString("id-ID", options));
  }, []);

  // Summary Metrics
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const netBalance = totalIncome - totalExpense;
  const incomeCount = transactions.filter((t) => t.type === "income").length;
  const expenseCount = transactions.filter((t) => t.type === "expense").length;

  // Filtered & Sorted Transactions
  const filteredTransactions = transactions.filter((t) => {
    const matchType = currentFilter === "all" || t.type === currentFilter;
    const q = appliedSearchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      t.title.toLowerCase().includes(q) ||
      (t.category && t.category.toLowerCase().includes(q));
    return matchType && matchQuery;
  });

  filteredTransactions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const incomeItems = transactions.filter((t) => t.type === "income");
  const expenseItems = transactions.filter((t) => t.type === "expense");

  // Edit Handlers
  const enterEditMode = (id: string) => {
    const trx = transactions.find((t) => t.id === id);
    if (!trx) return;

    setEditingId(id);
    setFormType(trx.type);
    setCategory(trx.category || (trx.type === "income" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]));
    setTitle(trx.title);
    setAmount(String(trx.amount));
    setDate(trx.date);

    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    titleInputRef.current?.focus();
  };

  const exitEditMode = () => {
    setEditingId(null);
    setTitle("");
    setAmount("");
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
    setFormType("income");
    setCategory(INCOME_CATEGORIES[0]);
  };

  // Submit Handler
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const numAmount = Number(amount);
    const today = new Date().toISOString().split("T")[0];
    const finalDate = date || today;

    if (!trimmedTitle) {
      showError("Keterangan kosong", "Silakan isi keterangan transaksi terlebih dahulu.");
      titleInputRef.current?.focus();
      return;
    }

    if (!numAmount || numAmount <= 0) {
      showError("Nominal tidak valid", "Nominal transaksi harus lebih besar dari 0.");
      return;
    }

    if (editingId) {
      const idx = transactions.findIndex((t) => t.id === editingId);
      if (idx === -1) {
        showError("Transaksi tidak ditemukan", "Data transaksi yang akan diedit tidak tersedia.");
        exitEditMode();
        return;
      }

      const updated = [...transactions];
      updated[idx] = {
        ...updated[idx],
        title: trimmedTitle,
        amount: numAmount,
        type: formType,
        category,
        date: finalDate,
      };

      setTransactions(updated);
      const saved = saveToStorage(updated);
      exitEditMode();

      if (saved) {
        showSuccess("Perubahan disimpan!", `Transaksi "${trimmedTitle}" berhasil diperbarui.`);
      } else {
        showError("Gagal menyimpan", "Perubahan tidak dapat disimpan ke penyimpanan lokal.");
      }
      return;
    }

    // New Transaction
    const newTrx: Transaction = {
      id: "trx-" + Date.now(),
      title: trimmedTitle,
      amount: numAmount,
      type: formType,
      category,
      date: finalDate,
    };

    const updated = [newTrx, ...transactions];
    setTransactions(updated);
    const saved = saveToStorage(updated);

    setTitle("");
    setAmount("");
    titleInputRef.current?.focus();

    if (saved) {
      showSuccess(
        "Transaksi ditambahkan!",
        `"${trimmedTitle}" senilai ${formatRupiah(numAmount)} berhasil dicatat.`
      );
    } else {
      showError("Gagal menyimpan", "Transaksi tidak dapat disimpan ke penyimpanan lokal.");
    }
  };

  // Delete Handler
  const handleDelete = async (id: string) => {
    const trx = transactions.find((t) => t.id === id);
    if (!trx) {
      showError("Transaksi tidak ditemukan", "Data yang ingin dihapus sudah tidak ada.");
      return;
    }

    const confirmed = await showConfirm(
      "Hapus transaksi?",
      `Transaksi "${trx.title}" sebesar ${formatRupiah(trx.amount)} akan dihapus permanen.`,
      "Ya, hapus"
    );
    if (!confirmed) return;

    if (editingId === id) exitEditMode();
    setDeletingId(id);

    setTimeout(() => {
      const updated = transactions.filter((t) => t.id !== id);
      setTransactions(updated);
      setDeletingId(null);
      const saved = saveToStorage(updated);
      if (saved) {
        showSuccess("Transaksi dihapus!", `"${trx.title}" telah dihapus dari riwayat.`);
      } else {
        showError("Gagal menyimpan", "Penghapusan tidak dapat disimpan ke penyimpanan lokal.");
      }
    }, 180);
  };

  // Search Submit
  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    setAppliedSearchQuery(searchQuery);
  };

  // Reset Handler
  const handleReset = async () => {
    const confirmed = await showConfirm(
      "Reset data demo?",
      "Semua transaksi Anda akan diganti dengan data contoh awal. Tindakan ini tidak bisa dibatalkan.",
      "Ya, reset"
    );
    if (!confirmed) return;

    exitEditMode();
    setTransactions([...DEFAULT_TRANSACTIONS]);
    const saved = saveToStorage([...DEFAULT_TRANSACTIONS]);
    if (saved) {
      showSuccess("Data direset!", "Data transaksi telah dikembalikan ke contoh awal.");
    } else {
      showError("Gagal menyimpan", "Data demo gagal disimpan ke penyimpanan lokal.");
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-background">
        <div className="flex items-center gap-3 text-light-on-surface-variant font-label text-label-lg">
          <span className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></span>
          <span>Memeriksa status autentikasi...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Top Bar Workspace */}
      <header className="sticky top-0 z-40 bg-light-surface/90 backdrop-blur-md border-b border-border-subtle shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-subtle text-light-on-surface hover:bg-light-surface-variant font-label text-label-sm font-semibold transition-colors"
              title="Kembali ke Beranda"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span className="hidden sm:inline">Beranda</span>
            </Link>

            <div className="h-6 w-px bg-border-subtle hidden sm:block"></div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-light-primary text-light-on-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
              </div>
              <span className="font-headline text-title-lg font-extrabold text-light-on-surface">KasKu</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p id="currentDateDisplay" className="font-label text-label-sm text-light-on-surface font-semibold">
                {dateDisplayStr}
              </p>
              <p className="font-label text-sm text-light-on-surface-variant">
                Halo, <strong>{session?.user?.name || "Sobat KasKu"}</strong>
              </p>
            </div>
            <div
              className="w-9 h-9 rounded-full bg-light-surface-variant border border-border-subtle flex items-center justify-center text-light-on-surface font-bold text-label-md"
              title={`${session?.user?.name}`}
            >
              👤
            </div>
            <button
              id="btnResetData"
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-light-on-surface-variant hover:text-semantic-expense hover:bg-light-expense-container text-label-sm font-medium transition-colors"
              title="Reset Data Demo"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              <span className="hidden lg:inline">Reset</span>
            </button>

            <button
              id="btnLogout"
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-light-on-surface-variant hover:text-semantic-expense hover:bg-light-expense-container text-label-sm font-medium transition-colors"
              title="Keluar / Logout"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Konten Utama Dasbor Pencatatan */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* 1. Summary Cards */}
        <section aria-labelledby="summary-heading">
          <h2 id="summary-heading" className="sr-only">
            Ringkasan Keuangan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Saldo Saat Ini */}
            <div className="bg-light-surface rounded-2xl border border-border-subtle p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group">
              <div className="flex items-center justify-between mb-3">
                <span className="font-label text-label-sm text-light-on-surface-variant font-semibold uppercase tracking-wider">
                  Saldo Saat Ini
                </span>
                <div className="w-9 h-9 rounded-xl bg-light-surface-variant text-brand-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">wallet</span>
                </div>
              </div>
              <div>
                <p
                  id="totalBalanceAmount"
                  className="font-headline text-headline-lg-mobile md:text-headline-md text-light-on-surface font-extrabold tabular-nums tracking-tight"
                >
                  {isLoaded ? formatRupiah(netBalance) : "Rp 0"}
                </p>
                <p id="balanceIndicator" className="font-label text-label-sm text-light-on-surface-variant mt-1.5 flex items-center gap-1">
                  {netBalance > 0 ? (
                    <>
                      <span className="material-symbols-outlined text-semantic-income text-[16px]">trending_up</span>{" "}
                      <span className="text-semantic-income font-medium">Surplus Arus Kas</span>
                    </>
                  ) : netBalance < 0 ? (
                    <>
                      <span className="material-symbols-outlined text-semantic-expense text-[16px]">warning</span>{" "}
                      <span className="text-semantic-expense font-medium">Defisit Anggaran</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-light-on-surface-variant text-[16px]">balance</span>{" "}
                      <span className="text-light-on-surface-variant">Arus Kas Seimbang</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Total Pemasukan */}
            <div className="bg-light-surface rounded-2xl border border-border-subtle p-6 shadow-sm flex flex-col justify-between group">
              <div className="flex items-center justify-between mb-3">
                <span className="font-label text-label-sm text-light-on-surface-variant font-semibold uppercase tracking-wider">
                  Total Pemasukan
                </span>
                <div className="w-9 h-9 rounded-xl bg-light-income-container text-semantic-income flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">arrow_downward</span>
                </div>
              </div>
              <div>
                <p
                  id="totalIncomeAmount"
                  className="font-headline text-headline-lg-mobile md:text-headline-md text-semantic-income font-extrabold tabular-nums tracking-tight"
                >
                  {isLoaded ? `+ ${formatRupiah(totalIncome)}` : "Rp 0"}
                </p>
                <p className="font-label text-label-sm text-light-on-surface-variant mt-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-semantic-income text-[16px]">check_circle</span>
                  <span id="incomeCountLabel">{incomeCount} Transaksi Uang Masuk</span>
                </p>
              </div>
            </div>

            {/* Total Pengeluaran */}
            <div className="bg-light-surface rounded-2xl border border-border-subtle p-6 shadow-sm flex flex-col justify-between group">
              <div className="flex items-center justify-between mb-3">
                <span className="font-label text-label-sm text-light-on-surface-variant font-semibold uppercase tracking-wider">
                  Total Pengeluaran
                </span>
                <div className="w-9 h-9 rounded-xl bg-light-expense-container text-semantic-expense flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">arrow_upward</span>
                </div>
              </div>
              <div>
                <p
                  id="totalExpenseAmount"
                  className="font-headline text-headline-lg-mobile md:text-headline-md text-semantic-expense font-extrabold tabular-nums tracking-tight"
                >
                  {isLoaded ? `- ${formatRupiah(totalExpense)}` : "Rp 0"}
                </p>
                <p className="font-label text-label-sm text-light-on-surface-variant mt-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-semantic-expense text-[16px]">info</span>
                  <span id="expenseCountLabel">{expenseCount} Transaksi Uang Keluar</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Workspace Utama */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Panel Kiri: Form Tambah/Edit Transaksi */}
          <section className="lg:col-span-5 bg-light-surface rounded-2xl border border-border-subtle shadow-sm p-6 lg:sticky lg:top-24">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border-subtle">
              <div>
                <h2 id="formHeading" className="font-headline text-title-lg font-bold text-light-on-surface">
                  {editingId ? "Edit Transaksi" : "Tambah Transaksi Baru"}
                </h2>
                <p id="formSubheading" className="font-label text-label-sm text-light-on-surface-variant">
                  {editingId ? "Ubah data lalu simpan perubahan" : "Catat pemasukan atau pengeluaran harian"}
                </p>
              </div>
              <span className="p-2 rounded-lg bg-light-surface-variant text-brand-primary">
                <span className="material-symbols-outlined text-[20px]">edit_note</span>
              </span>
            </div>

            <form
              ref={formRef}
              id="transactionForm"
              data-testid="transactionForm"
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <label className="block font-label text-label-sm font-semibold text-light-on-surface mb-2">
                  Klasifikasi Transaksi
                </label>
                <div className="grid grid-cols-2 gap-2 p-1.5 rounded-xl bg-light-surface-variant border border-border-subtle">
                  <button
                    type="button"
                    id="btnTypeIncome"
                    onClick={() => handleTypeChange("income")}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-label text-label-md transition-all ${
                      formType === "income"
                        ? "font-bold bg-light-surface text-semantic-income shadow-sm"
                        : "font-semibold text-light-on-surface-variant hover:text-light-on-surface"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    <span>Uang Masuk (+)</span>
                  </button>
                  <button
                    type="button"
                    id="btnTypeExpense"
                    onClick={() => handleTypeChange("expense")}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-label text-label-md transition-all ${
                      formType === "expense"
                        ? "font-bold bg-light-surface text-semantic-expense shadow-sm"
                        : "font-semibold text-light-on-surface-variant hover:text-light-on-surface"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">remove_circle</span>
                    <span>Uang Keluar (-)</span>
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="transactionFormAmountInput"
                  className="block font-label text-label-sm font-semibold text-light-on-surface mb-1.5"
                >
                  Nominal (Rp) <span className="text-semantic-expense">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 font-headline text-title-md font-bold text-light-on-surface-variant">
                    Rp
                  </span>
                  <input
                    type="number"
                    id="transactionFormAmountInput"
                    data-testid="transactionFormAmountInput"
                    min="1"
                    placeholder="50000"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-border-subtle bg-light-surface font-headline text-headline-sm font-bold text-light-on-surface placeholder:text-light-outline focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 focus:outline-none tabular-nums transition-colors"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="transactionFormTitleInput"
                  className="block font-label text-label-sm font-semibold text-light-on-surface mb-1.5"
                >
                  Keterangan Transaksi <span className="text-semantic-expense">*</span>
                </label>
                <input
                  type="text"
                  id="transactionFormTitleInput"
                  data-testid="transactionFormTitleInput"
                  ref={titleInputRef}
                  placeholder="Misal: Makan siang, Gaji, Pembayaran invoice..."
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-subtle bg-light-surface font-body text-body-md text-light-on-surface placeholder:text-light-outline focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="transactionCategorySelect"
                    className="block font-label text-label-sm font-semibold text-light-on-surface mb-1.5"
                  >
                    Kategori
                  </label>
                  <select
                    id="transactionCategorySelect"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-light-surface font-body text-body-md text-light-on-surface focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 focus:outline-none transition-colors"
                  >
                    {(formType === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    {/* Support custom category if editing transaction with an existing non-standard category */}
                    {category &&
                      !(formType === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).includes(category) && (
                        <option value={category}>{category}</option>
                      )}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="transactionFormDateInput"
                    className="block font-label text-label-sm font-semibold text-light-on-surface mb-1.5"
                  >
                    Tanggal
                  </label>
                  <input
                    type="date"
                    id="transactionFormDateInput"
                    data-testid="transactionFormDateInput"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-light-surface font-body text-body-md text-light-on-surface focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                id="transactionFormSubmitButton"
                data-testid="transactionFormSubmitButton"
                className="w-full mt-2 py-3.5 px-6 rounded-xl bg-light-primary text-light-on-primary font-label text-title-md font-bold shadow-md hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <span id="submitIcon" className="material-symbols-outlined text-[20px]">
                  {editingId ? "save" : "check"}
                </span>
                <span id="submitButtonLabel">
                  {editingId ? "Simpan Perubahan" : "Simpan Transaksi"}
                </span>
              </button>

              {/* Tombol Batal Edit */}
              {editingId && (
                <button
                  type="button"
                  id="btnCancelEdit"
                  onClick={exitEditMode}
                  className="w-full py-3 px-6 rounded-xl bg-light-surface border border-border-subtle text-light-on-surface font-label text-label-lg font-semibold hover:bg-light-surface-variant transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                  <span>Batal Edit</span>
                </button>
              )}
            </form>
          </section>

          {/* Panel Kanan: Riwayat Transaksi */}
          <section className="lg:col-span-7 space-y-6" aria-labelledby="history-heading">
            <div className="bg-light-surface rounded-2xl border border-border-subtle shadow-sm p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <div>
                  <h2 id="history-heading" className="font-headline text-title-lg font-bold text-light-on-surface">
                    Riwayat Transaksi
                  </h2>
                  <p className="font-label text-label-sm text-light-on-surface-variant">
                    Daftar mutasi uang masuk dan uang keluar
                  </p>
                </div>

                <div className="inline-flex p-1 rounded-xl bg-light-surface-variant border border-border-subtle self-start sm:self-auto">
                  <button
                    type="button"
                    id="filterAll"
                    onClick={() => setCurrentFilter("all")}
                    className={`px-3 py-1.5 rounded-lg font-label text-label-sm transition-all ${
                      currentFilter === "all"
                        ? "font-bold bg-light-surface text-light-on-surface shadow-xs"
                        : "font-medium text-light-on-surface-variant hover:text-light-on-surface"
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    type="button"
                    id="filterIncome"
                    onClick={() => setCurrentFilter("income")}
                    className={`px-3 py-1.5 rounded-lg font-label text-label-sm transition-all ${
                      currentFilter === "income"
                        ? "font-bold bg-light-surface text-light-on-surface shadow-xs"
                        : "font-medium text-light-on-surface-variant hover:text-semantic-income"
                    }`}
                  >
                    Pemasukan
                  </button>
                  <button
                    type="button"
                    id="filterExpense"
                    onClick={() => setCurrentFilter("expense")}
                    className={`px-3 py-1.5 rounded-lg font-label text-label-sm transition-all ${
                      currentFilter === "expense"
                        ? "font-bold bg-light-surface text-light-on-surface shadow-xs"
                        : "font-medium text-light-on-surface-variant hover:text-semantic-expense"
                    }`}
                  >
                    Pengeluaran
                  </button>
                </div>
              </div>

              <form
                id="searchTransactionForm"
                data-testid="searchTransactionForm"
                role="search"
                onSubmit={handleSearchSubmit}
                className="flex gap-2"
              >
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-light-on-surface-variant pointer-events-none">
                    <span className="material-symbols-outlined text-[20px]">search</span>
                  </span>
                  <input
                    type="search"
                    id="searchTransactionFormTitleInput"
                    data-testid="searchTransactionFormTitleInput"
                    placeholder="Cari transaksi berdasarkan judul atau kategori..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setAppliedSearchQuery(e.target.value);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-subtle bg-light-background font-body text-body-md text-light-on-surface placeholder:text-light-outline focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  id="searchTransactionFormSubmitButton"
                  data-testid="searchTransactionFormSubmitButton"
                  className="px-5 py-2.5 rounded-xl bg-light-surface border border-border-subtle font-label text-label-md font-semibold text-light-on-surface hover:bg-light-surface-variant transition-colors"
                >
                  Cari
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div id="unifiedTransactionContainer" className="space-y-3">
                {filteredTransactions.length === 0 ? (
                  <div className="bg-light-surface rounded-2xl border border-dashed border-border-subtle p-12 text-center">
                    <div className="w-14 h-14 rounded-full bg-light-surface-variant text-light-on-surface-variant flex items-center justify-center mx-auto mb-4">
                      <span className="material-symbols-outlined text-[28px]">search_off</span>
                    </div>
                    <h4 className="font-headline text-title-md font-bold text-light-on-surface mb-1">
                      Belum Ada Catatan Transaksi
                    </h4>
                    <p className="font-body text-body-md text-light-on-surface-variant max-w-sm mx-auto">
                      {appliedSearchQuery
                        ? "Tidak ada transaksi yang cocok dengan kata kunci pencarian Anda."
                        : "Mulai catat pemasukan atau pengeluaran pertama Anda melalui form di sebelah kiri."}
                    </p>
                  </div>
                ) : (
                  filteredTransactions.map((t) => {
                    const isIncome = t.type === "income";
                    const badgeBg = isIncome
                      ? "bg-light-income-container text-semantic-income"
                      : "bg-light-expense-container text-semantic-expense";
                    const iconName = isIncome ? "arrow_downward" : "arrow_upward";
                    const amountColor = isIncome ? "text-semantic-income" : "text-semantic-expense";
                    const prefix = isIncome ? "+ " : "- ";

                    return (
                      <div
                        key={t.id}
                        id={`item-${t.id}`}
                        className={`bg-light-surface rounded-xl border ${
                          editingId === t.id
                            ? "border-brand-primary ring-2 ring-brand-primary/20"
                            : "border-border-subtle"
                        } p-3.5 sm:p-4 lg:p-5 shadow-sm flex flex-col gap-3 hover:border-light-outline transition-all animate-item-in group ${
                          deletingId === t.id ? "fade-out" : ""
                        }`}
                      >
                        <div className="flex items-start sm:items-center justify-between gap-3 sm:gap-4">
                          <div className="flex items-start sm:items-center gap-3 sm:gap-3.5 min-w-0">
                            <div
                              className={`w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-xl ${badgeBg} flex items-center justify-center shrink-0 mt-0.5 sm:mt-0`}
                            >
                              <span className="material-symbols-outlined text-[18px] sm:text-[20px] lg:text-[22px]">
                                {iconName}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-headline text-sm sm:text-base lg:text-lg font-bold text-light-on-surface truncate leading-snug">
                                {t.title}
                              </p>
                              <div className="flex items-center gap-1.5 sm:gap-2 mt-1 flex-wrap">
                                <span className="px-2 py-0.5 rounded-md bg-light-surface-variant text-light-on-surface-variant font-label text-[11px] sm:text-xs font-semibold">
                                  {t.category || (isIncome ? "Pemasukan" : "Pengeluaran")}
                                </span>
                                <span className="text-light-outline text-xs">•</span>
                                <span className="font-label text-[11px] sm:text-xs lg:text-sm text-light-on-surface-variant">
                                  {formatDateIndo(t.date)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <span
                              className={`font-headline text-sm sm:text-base lg:text-xl font-bold ${amountColor} tabular-nums whitespace-nowrap`}
                            >
                              {prefix}
                              {formatRupiah(t.amount)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-border-subtle/70">
                          <button
                            type="button"
                            onClick={() => enterEditMode(t.id)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium text-light-on-surface-variant hover:text-brand-primary hover:bg-light-surface-variant transition-all"
                            title="Edit Transaksi"
                            aria-label={`Edit Transaksi ${t.title}`}
                          >
                            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">edit</span>
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(t.id)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium text-light-on-surface-variant hover:text-semantic-expense hover:bg-light-expense-container transition-all"
                            title="Hapus Transaksi"
                            aria-label={`Hapus Transaksi ${t.title}`}
                          >
                            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">delete</span>
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border-subtle">
                {/* Arus Pemasukan */}
                <div className="bg-light-surface rounded-xl border border-border-subtle p-4">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-border-subtle">
                    <h3 className="font-label text-label-md font-bold text-semantic-income flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
                      Arus Pemasukan
                    </h3>
                    <span
                      id="badgeIncomeTotal"
                      className="font-label text-label-sm font-bold text-semantic-income tabular-nums"
                    >
                      {formatRupiah(totalIncome)}
                    </span>
                  </div>
                  <div id="incomeList" data-testid="incomeList" className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {incomeItems.length === 0 ? (
                      <p className="tracker-transaction-list__empty font-body text-body-sm text-light-on-surface-variant text-center py-4">
                        Tidak ada transaksi pemasukan
                      </p>
                    ) : (
                      incomeItems.map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-light-surface-variant/50 border border-border-subtle/60 text-label-sm"
                        >
                          <span className="font-medium text-light-on-surface truncate max-w-[140px]">
                            {t.title}
                          </span>
                          <span className="font-bold text-semantic-income tabular-nums">
                            +{formatRupiah(t.amount)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Arus Pengeluaran */}
                <div className="bg-light-surface rounded-xl border border-border-subtle p-4">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-border-subtle">
                    <h3 className="font-label text-label-md font-bold text-semantic-expense flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                      Arus Pengeluaran
                    </h3>
                    <span
                      id="badgeExpenseTotal"
                      className="font-label text-label-sm font-bold text-semantic-expense tabular-nums"
                    >
                      {formatRupiah(totalExpense)}
                    </span>
                  </div>
                  <div id="expenseList" data-testid="expenseList" className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {expenseItems.length === 0 ? (
                      <p className="tracker-transaction-list__empty font-body text-body-sm text-light-on-surface-variant text-center py-4">
                        Tidak ada transaksi pengeluaran
                      </p>
                    ) : (
                      expenseItems.map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-light-surface-variant/50 border border-border-subtle/60 text-label-sm"
                        >
                          <span className="font-medium text-light-on-surface truncate max-w-[140px]">
                            {t.title}
                          </span>
                          <span className="font-bold text-semantic-expense tabular-nums">
                            -{formatRupiah(t.amount)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-light-surface border-t border-border-subtle py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-headline text-title-md font-extrabold text-light-on-surface">KasKu</span>
            <span className="text-light-outline">|</span>
            <p className="font-label text-label-sm text-light-on-surface-variant">
              © 2026 KasKu — Digital Finance Tracker
            </p>
          </div>

          <div className="flex items-center gap-4 text-label-sm text-light-on-surface-variant">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-semantic-income"></span>
              Penyimpanan Lokal Aktif
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
