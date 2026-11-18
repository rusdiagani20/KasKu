/* ==========================================================
   KasKu — main.js
   Dipakai bersama oleh index.html (landing) dan workspace.html.
   Setiap fitur hanya berjalan jika elemennya ada di halaman.
   ========================================================== */

/* ---------- SweetAlert2 Helper ---------- */
const Toast = (typeof Swal !== 'undefined')
  ? Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2600,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    })
  : null;

function showSuccess(title, text) {
  if (Toast) {
    Toast.fire({ icon: 'success', title, text });
  } else {
    alert(`${title}${text ? '\n' + text : ''}`);
  }
}

function showError(title, text) {
  if (Toast) {
    Toast.fire({ icon: 'error', title, text });
  } else {
    alert(`ERROR: ${title}${text ? '\n' + text : ''}`);
  }
}

function showConfirm(title, text, confirmText = 'Ya, lanjutkan') {
  if (typeof Swal === 'undefined') {
    return Promise.resolve(window.confirm(`${title}\n\n${text || ''}`));
  }
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Batal',
    confirmButtonColor: '#c0392b',
    cancelButtonColor: '#6b7280',
    reverseButtons: true
  }).then(res => res.isConfirmed);
}

/* ---------- Landing Page: Scroll Reveal ---------- */
function initScrollReveal() {
  const revealItems = document.querySelectorAll('.reveal-item');
  if (revealItems.length === 0) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    });

    revealItems.forEach(el => observer.observe(el));
  } else {
    revealItems.forEach(el => el.classList.add('revealed'));
  }
}

/* ---------- Workspace: Pencatatan Keuangan ---------- */
function initWorkspace() {
  if (!document.getElementById('transactionForm')) return;

  const INCOME_CATEGORIES = ['Gaji Bulanan', 'Omzet Usaha', 'Proyek / Freelance', 'Investasi', 'Lainnya'];
  const EXPENSE_CATEGORIES = ['Operasional Usaha', 'Konsumsi & Makanan', 'Transportasi', 'Tagihan & Utilitas', 'Peralatan / Aset', 'Lainnya'];

  const DEFAULT_TRANSACTIONS = [
    { id: 'trx-1', title: 'Pembayaran Termin 1 Klien Desain', amount: 5500000, type: 'income', category: 'Proyek / Freelance', date: '2026-11-15' },
    { id: 'trx-2', title: 'Gaji Bulanan Pekerjaan Tetap', amount: 8500000, type: 'income', category: 'Gaji Bulanan', date: '2026-11-12' },
    { id: 'trx-3', title: 'Biaya Sewa Co-Working Space', amount: 1200000, type: 'expense', category: 'Operasional Usaha', date: '2026-11-14' },
    { id: 'trx-4', title: 'Langganan Software Cloud & Server', amount: 450000, type: 'expense', category: 'Tagihan & Utilitas', date: '2026-11-16' }
  ];

  const STORAGE_KEY = 'kasku_transactions_rebuild_v1';

  function loadTransactions() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Gagal membaca localStorage, menggunakan state runtime:', e);
    }
    return [...DEFAULT_TRANSACTIONS];
  }

  function saveTransactions(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('Gagal menyimpan ke localStorage:', e);
      return false;
    }
  }

  let transactions = loadTransactions();
  let currentFilter = 'all';
  let currentSearchQuery = '';
  let editingId = null;

  // Elements
  const form = document.getElementById('transactionForm');
  const titleInput = document.getElementById('transactionFormTitleInput');
  const amountInput = document.getElementById('transactionFormAmountInput');
  const dateInput = document.getElementById('transactionFormDateInput');
  const typeSelect = document.getElementById('transactionFormTypeSelect');
  const categorySelect = document.getElementById('transactionCategorySelect');
  const btnTypeIncome = document.getElementById('btnTypeIncome');
  const btnTypeExpense = document.getElementById('btnTypeExpense');

  const searchForm = document.getElementById('searchTransactionForm');
  const searchInput = document.getElementById('searchTransactionFormTitleInput');

  const filterAllBtn = document.getElementById('filterAll');
  const filterIncomeBtn = document.getElementById('filterIncome');
  const filterExpenseBtn = document.getElementById('filterExpense');

  const totalBalanceElem = document.getElementById('totalBalanceAmount');
  const totalIncomeElem = document.getElementById('totalIncomeAmount');
  const totalExpenseElem = document.getElementById('totalExpenseAmount');
  const balanceIndicatorElem = document.getElementById('balanceIndicator');
  const incomeCountLabel = document.getElementById('incomeCountLabel');
  const expenseCountLabel = document.getElementById('expenseCountLabel');
  const badgeIncomeTotal = document.getElementById('badgeIncomeTotal');
  const badgeExpenseTotal = document.getElementById('badgeExpenseTotal');

  const unifiedContainer = document.getElementById('unifiedTransactionContainer');
  const incomeListContainer = document.getElementById('incomeList');
  const expenseListContainer = document.getElementById('expenseList');
  const btnReset = document.getElementById('btnResetData');

  const formHeading = document.getElementById('formHeading');
  const formSubheading = document.getElementById('formSubheading');
  const submitLabel = document.getElementById('submitButtonLabel');
  const submitIcon = document.getElementById('submitIcon');
  const btnCancelEdit = document.getElementById('btnCancelEdit');

  const today = new Date();
  const dateFormatted = today.toISOString().split('T')[0];
  if (dateInput) dateInput.value = dateFormatted;

  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateDisplayStr = today.toLocaleDateString('id-ID', dateOptions);
  const currentDateDisplay = document.getElementById('currentDateDisplay');
  if (currentDateDisplay) currentDateDisplay.textContent = dateDisplayStr;

  function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(number);
  }

  function formatDateIndo(dateStr) {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  function updateCategoryOptions(type) {
    const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    categorySelect.innerHTML = categories
      .map(cat => `<option value="${cat}">${cat}</option>`)
      .join('');
  }

  function setFormType(type) {
    typeSelect.value = type;
    if (type === 'income') {
      btnTypeIncome.className = 'flex items-center justify-center gap-2 py-2.5 rounded-lg font-label text-label-md font-bold transition-all bg-light-surface text-semantic-income shadow-sm';
      btnTypeExpense.className = 'flex items-center justify-center gap-2 py-2.5 rounded-lg font-label text-label-md font-semibold transition-all text-light-on-surface-variant hover:text-light-on-surface';
    } else {
      btnTypeExpense.className = 'flex items-center justify-center gap-2 py-2.5 rounded-lg font-label text-label-md font-bold transition-all bg-light-surface text-semantic-expense shadow-sm';
      btnTypeIncome.className = 'flex items-center justify-center gap-2 py-2.5 rounded-lg font-label text-label-md font-semibold transition-all text-light-on-surface-variant hover:text-light-on-surface';
    }
    updateCategoryOptions(type);
  }

  btnTypeIncome.addEventListener('click', () => setFormType('income'));
  btnTypeExpense.addEventListener('click', () => setFormType('expense'));
  updateCategoryOptions('income');

  function updateSummary() {
    let totalIncome = 0, totalExpense = 0, incomeCount = 0, expenseCount = 0;

    transactions.forEach(t => {
      if (t.type === 'income') { totalIncome += Number(t.amount); incomeCount++; }
      else { totalExpense += Number(t.amount); expenseCount++; }
    });

    const netBalance = totalIncome - totalExpense;

    totalBalanceElem.textContent = formatRupiah(netBalance);
    totalIncomeElem.textContent = '+ ' + formatRupiah(totalIncome);
    totalExpenseElem.textContent = '- ' + formatRupiah(totalExpense);
    badgeIncomeTotal.textContent = formatRupiah(totalIncome);
    badgeExpenseTotal.textContent = formatRupiah(totalExpense);
    incomeCountLabel.textContent = `${incomeCount} Transaksi Uang Masuk`;
    expenseCountLabel.textContent = `${expenseCount} Transaksi Uang Keluar`;

    if (netBalance > 0) {
      balanceIndicatorElem.innerHTML = `<span class="material-symbols-outlined text-semantic-income text-[16px]">trending_up</span> <span class="text-semantic-income font-medium">Surplus Arus Kas</span>`;
    } else if (netBalance < 0) {
      balanceIndicatorElem.innerHTML = `<span class="material-symbols-outlined text-semantic-expense text-[16px]">warning</span> <span class="text-semantic-expense font-medium">Defisit Anggaran</span>`;
    } else {
      balanceIndicatorElem.innerHTML = `<span class="material-symbols-outlined text-light-on-surface-variant text-[16px]">balance</span> <span class="text-light-on-surface-variant">Arus Kas Seimbang</span>`;
    }
  }

  function renderTransactions() {
    updateSummary();

    let filtered = transactions.filter(t => {
      const matchType = currentFilter === 'all' || t.type === currentFilter;
      const query = currentSearchQuery.toLowerCase().trim();
      const matchQuery = !query ||
        t.title.toLowerCase().includes(query) ||
        (t.category && t.category.toLowerCase().includes(query));
      return matchType && matchQuery;
    });

    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (filtered.length === 0) {
      unifiedContainer.innerHTML = `
        <div class="bg-light-surface rounded-2xl border border-dashed border-border-subtle p-12 text-center">
          <div class="w-14 h-14 rounded-full bg-light-surface-variant text-light-on-surface-variant flex items-center justify-center mx-auto mb-4">
            <span class="material-symbols-outlined text-[28px]">search_off</span>
          </div>
          <h4 class="font-headline text-title-md font-bold text-light-on-surface mb-1">Belum Ada Catatan Transaksi</h4>
          <p class="font-body text-body-md text-light-on-surface-variant max-w-sm mx-auto">
            ${currentSearchQuery ? 'Tidak ada transaksi yang cocok dengan kata kunci pencarian Anda.' : 'Mulai catat pemasukan atau pengeluaran pertama Anda melalui form di sebelah kiri.'}
          </p>
        </div>
      `;
    } else {
      unifiedContainer.innerHTML = filtered.map(t => {
        const isIncome = t.type === 'income';
        const badgeBg = isIncome ? 'bg-light-income-container text-semantic-income' : 'bg-light-expense-container text-semantic-expense';
        const iconName = isIncome ? 'arrow_downward' : 'arrow_upward';
        const amountColor = isIncome ? 'text-semantic-income' : 'text-semantic-expense';
        const prefix = isIncome ? '+ ' : '- ';

        return `
          <div id="item-${t.id}" class="bg-light-surface rounded-xl border ${editingId === t.id ? 'border-brand-primary ring-2 ring-brand-primary/20' : 'border-border-subtle'} p-3.5 sm:p-4 lg:p-5 shadow-sm flex flex-col gap-3 hover:border-light-outline transition-all animate-item-in group">
            <div class="flex items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div class="flex items-start sm:items-center gap-3 sm:gap-3.5 min-w-0">
                <div class="w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-xl ${badgeBg} flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                  <span class="material-symbols-outlined text-[18px] sm:text-[20px] lg:text-[22px]">${iconName}</span>
                </div>
                <div class="min-w-0">
                  <p class="font-headline text-sm sm:text-base lg:text-lg font-bold text-light-on-surface truncate leading-snug">
                    ${escapeHtml(t.title)}
                  </p>
                  <div class="flex items-center gap-1.5 sm:gap-2 mt-1 flex-wrap">
                    <span class="px-2 py-0.5 rounded-md bg-light-surface-variant text-light-on-surface-variant font-label text-[11px] sm:text-xs font-semibold">
                      ${escapeHtml(t.category || (isIncome ? 'Pemasukan' : 'Pengeluaran'))}
                    </span>
                    <span class="text-light-outline text-xs">•</span>
                    <span class="font-label text-[11px] sm:text-xs lg:text-sm text-light-on-surface-variant">
                      ${formatDateIndo(t.date)}
                    </span>
                  </div>
                </div>
              </div>
              <div class="shrink-0 text-right">
                <span class="font-headline text-sm sm:text-base lg:text-xl font-bold ${amountColor} tabular-nums whitespace-nowrap">
                  ${prefix}${formatRupiah(t.amount)}
                </span>
              </div>
            </div>
            <div class="flex items-center justify-end gap-2 pt-2.5 border-t border-border-subtle/70">
              <button type="button" onclick="window.kaskuEditTransaction('${t.id}')"
                class="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium text-light-on-surface-variant hover:text-brand-primary hover:bg-light-surface-variant transition-all"
                title="Edit Transaksi" aria-label="Edit Transaksi ${escapeHtml(t.title)}">
                <span class="material-symbols-outlined text-[16px] sm:text-[18px]">edit</span>
                <span>Edit</span>
              </button>
              <button type="button" onclick="window.kaskuDeleteTransaction('${t.id}')"
                class="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium text-light-on-surface-variant hover:text-semantic-expense hover:bg-light-expense-container transition-all"
                title="Hapus Transaksi" aria-label="Hapus Transaksi ${escapeHtml(t.title)}">
                <span class="material-symbols-outlined text-[16px] sm:text-[18px]">delete</span>
                <span>Hapus</span>
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    const incomeItems = transactions.filter(t => t.type === 'income');
    const expenseItems = transactions.filter(t => t.type === 'expense');

    if (incomeItems.length === 0) {
      incomeListContainer.innerHTML = '<p class="tracker-transaction-list__empty font-body text-body-sm text-light-on-surface-variant text-center py-4">Tidak ada transaksi pemasukan</p>';
    } else {
      incomeListContainer.innerHTML = incomeItems.map(t => `
        <div class="flex items-center justify-between p-2 rounded-lg bg-light-surface-variant/50 border border-border-subtle/60 text-label-sm">
          <span class="font-medium text-light-on-surface truncate max-w-[140px]">${escapeHtml(t.title)}</span>
          <span class="font-bold text-semantic-income tabular-nums">+${formatRupiah(t.amount)}</span>
        </div>
      `).join('');
    }

    if (expenseItems.length === 0) {
      expenseListContainer.innerHTML = '<p class="tracker-transaction-list__empty font-body text-body-sm text-light-on-surface-variant text-center py-4">Tidak ada transaksi pengeluaran</p>';
    } else {
      expenseListContainer.innerHTML = expenseItems.map(t => `
        <div class="flex items-center justify-between p-2 rounded-lg bg-light-surface-variant/50 border border-border-subtle/60 text-label-sm">
          <span class="font-medium text-light-on-surface truncate max-w-[140px]">${escapeHtml(t.title)}</span>
          <span class="font-bold text-semantic-expense tabular-nums">-${formatRupiah(t.amount)}</span>
        </div>
      `).join('');
    }
  }

  function escapeHtml(text) {
    if (!text) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, m => map[m]);
  }

  function enterEditMode(id) {
    const trx = transactions.find(t => t.id === id);
    if (!trx) return;

    editingId = id;
    setFormType(trx.type);

    if (trx.category && ![...categorySelect.options].some(o => o.value === trx.category)) {
      categorySelect.insertAdjacentHTML('beforeend',
        `<option value="${escapeHtml(trx.category)}">${escapeHtml(trx.category)}</option>`);
    }
    categorySelect.value = trx.category || categorySelect.options[0].value;
    titleInput.value = trx.title;
    amountInput.value = trx.amount;
    dateInput.value = trx.date;

    formHeading.textContent = 'Edit Transaksi';
    formSubheading.textContent = 'Ubah data lalu simpan perubahan';
    submitLabel.textContent = 'Simpan Perubahan';
    submitIcon.textContent = 'save';
    btnCancelEdit.classList.remove('hidden');
    btnCancelEdit.classList.add('flex');

    renderTransactions();
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    titleInput.focus();
  }

  function exitEditMode() {
    editingId = null;
    titleInput.value = '';
    amountInput.value = '';
    dateInput.value = dateFormatted;

    formHeading.textContent = 'Tambah Transaksi Baru';
    formSubheading.textContent = 'Catat pemasukan atau pengeluaran harian';
    submitLabel.textContent = 'Simpan Transaksi';
    submitIcon.textContent = 'check';
    btnCancelEdit.classList.add('hidden');
    btnCancelEdit.classList.remove('flex');
  }

  window.kaskuEditTransaction = enterEditMode;

  btnCancelEdit.addEventListener('click', () => {
    exitEditMode();
    renderTransactions();
  });

  // Submit Form
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = titleInput.value.trim();
    const amount = Number(amountInput.value);
    const type = typeSelect.value;
    const category = categorySelect.value;
    const date = dateInput.value || dateFormatted;

    // Validasi input
    if (!title) {
      showError('Keterangan kosong', 'Silakan isi keterangan transaksi terlebih dahulu.');
      titleInput.focus();
      return;
    }
    if (!amount || amount <= 0) {
      showError('Nominal tidak valid', 'Nominal transaksi harus lebih besar dari 0.');
      amountInput.focus();
      return;
    }

    // Mode edit
    if (editingId) {
      const idx = transactions.findIndex(t => t.id === editingId);
      if (idx === -1) {
        showError('Transaksi tidak ditemukan', 'Data transaksi yang akan diedit tidak tersedia.');
        exitEditMode();
        renderTransactions();
        return;
      }
      transactions[idx] = { ...transactions[idx], title, amount, type, category, date };
      const saved = saveTransactions(transactions);
      exitEditMode();
      renderTransactions();

      if (saved) {
        showSuccess('Perubahan disimpan!', `Transaksi "${title}" berhasil diperbarui.`);
      } else {
        showError('Gagal menyimpan', 'Perubahan tidak dapat disimpan ke penyimpanan lokal.');
      }
      return;
    }

    // Mode tambah
    const newTrx = {
      id: 'trx-' + Date.now(),
      title, amount, type, category, date
    };

    transactions.unshift(newTrx);
    const saved = saveTransactions(transactions);

    titleInput.value = '';
    amountInput.value = '';
    titleInput.focus();
    renderTransactions();

    if (saved) {
      showSuccess('Transaksi ditambahkan!', `"${title}" senilai ${formatRupiah(amount)} berhasil dicatat.`);
    } else {
      showError('Gagal menyimpan', 'Transaksi tidak dapat disimpan ke penyimpanan lokal.');
    }
  });

  // Hapus Transaksi (dengan konfirmasi SweetAlert2)
  window.kaskuDeleteTransaction = async function(id) {
    const trx = transactions.find(t => t.id === id);
    if (!trx) {
      showError('Transaksi tidak ditemukan', 'Data yang ingin dihapus sudah tidak ada.');
      return;
    }

    const confirmed = await showConfirm(
      'Hapus transaksi?',
      `Transaksi "${trx.title}" sebesar ${formatRupiah(trx.amount)} akan dihapus permanen.`,
      'Ya, hapus'
    );
    if (!confirmed) return;

    try {
      if (editingId === id) exitEditMode();
      const itemElem = document.getElementById('item-' + id);

      const doDelete = () => {
        const before = transactions.length;
        transactions = transactions.filter(t => t.id !== id);
        if (transactions.length === before) {
          showError('Gagal menghapus', 'Transaksi tidak ditemukan dalam daftar.');
          return;
        }
        const saved = saveTransactions(transactions);
        renderTransactions();
        if (saved) {
          showSuccess('Transaksi dihapus!', `"${trx.title}" telah dihapus dari riwayat.`);
        } else {
          showError('Gagal menyimpan', 'Penghapusan tidak dapat disimpan ke penyimpanan lokal.');
        }
      };

      if (itemElem) {
        itemElem.classList.add('fade-out');
        setTimeout(doDelete, 180);
      } else {
        doDelete();
      }
    } catch (err) {
      console.error(err);
      showError('Terjadi kesalahan', 'Transaksi gagal dihapus. Silakan coba lagi.');
    }
  };

  // Pencarian
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    currentSearchQuery = searchInput.value;
    renderTransactions();
  });

  searchInput.addEventListener('input', () => {
    currentSearchQuery = searchInput.value;
    renderTransactions();
  });

  // Filter
  function updateFilterUI(activeBtn) {
    [filterAllBtn, filterIncomeBtn, filterExpenseBtn].forEach(b => {
      b.className = 'px-3 py-1.5 rounded-lg font-label text-label-sm font-medium text-light-on-surface-variant hover:text-light-on-surface transition-all';
    });
    activeBtn.className = 'px-3 py-1.5 rounded-lg font-label text-label-sm font-bold bg-light-surface text-light-on-surface shadow-xs transition-all';
  }

  filterAllBtn.addEventListener('click', () => { currentFilter = 'all'; updateFilterUI(filterAllBtn); renderTransactions(); });
  filterIncomeBtn.addEventListener('click', () => { currentFilter = 'income'; updateFilterUI(filterIncomeBtn); renderTransactions(); });
  filterExpenseBtn.addEventListener('click', () => { currentFilter = 'expense'; updateFilterUI(filterExpenseBtn); renderTransactions(); });

  // Reset Data Demo (konfirmasi SweetAlert2)
  if (btnReset) {
    btnReset.addEventListener('click', async () => {
      const confirmed = await showConfirm(
        'Reset data demo?',
        'Semua transaksi Anda akan diganti dengan data contoh awal. Tindakan ini tidak bisa dibatalkan.',
        'Ya, reset'
      );
      if (!confirmed) return;

      try {
        exitEditMode();
        transactions = [...DEFAULT_TRANSACTIONS];
        const saved = saveTransactions(transactions);
        renderTransactions();
        if (saved) {
          showSuccess('Data direset!', 'Data transaksi telah dikembalikan ke contoh awal.');
        } else {
          showError('Gagal menyimpan', 'Data demo gagal disimpan ke penyimpanan lokal.');
        }
      } catch (err) {
        console.error(err);
        showError('Terjadi kesalahan', 'Gagal mereset data. Silakan coba lagi.');
      }
    });
  }

  renderTransactions();
}

/* ---------- Inisialisasi ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initWorkspace();
});