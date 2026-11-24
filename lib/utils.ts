import { Transaction } from './types';

export const INCOME_CATEGORIES = [
  'Gaji Bulanan',
  'Omzet Usaha',
  'Proyek / Freelance',
  'Investasi',
  'Lainnya',
];

export const EXPENSE_CATEGORIES = [
  'Operasional Usaha',
  'Konsumsi & Makanan',
  'Transportasi',
  'Tagihan & Utilitas',
  'Peralatan / Aset',
  'Lainnya',
];

export const DEFAULT_TRANSACTIONS: Transaction[] = [
  { id: 'trx-1', title: 'Pembayaran Termin 1 Klien Desain', amount: 5500000, type: 'income', category: 'Proyek / Freelance', date: '2026-11-15' },
  { id: 'trx-2', title: 'Gaji Bulanan Pekerjaan Tetap', amount: 8500000, type: 'income', category: 'Gaji Bulanan', date: '2026-11-12' },
  { id: 'trx-3', title: 'Biaya Sewa Co-Working Space', amount: 1200000, type: 'expense', category: 'Operasional Usaha', date: '2026-11-14' },
  { id: 'trx-4', title: 'Langganan Software Cloud & Server', amount: 450000, type: 'expense', category: 'Tagihan & Utilitas', date: '2026-11-16' }
];

export const STORAGE_KEY = 'kasku_transactions_rebuild_v1';

export function formatRupiah(number: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(number);
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}
