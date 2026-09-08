let transactions = [];

// Variabel untuk tracking transaksi yang sedang diedit
let editingTransactionId = null;

// Fungsi untuk menghasilkan ID unik secara otomatis
function generateUniqueId() {
  return +new Date();
}


/**
 * ========================================================
 * Kriteria 1: Memanipulasi DOM untuk Form dan Daftar Transaksi
 * ========================================================
 */
// Ambil elemen kontainer incomeList dan expenseList dari DOM
const incomeListContainer = document.getElementById('incomeList');
const expenseListContainer = document.getElementById('expenseList');

// Ambil elemen form dan input
const transactionForm = document.getElementById('transactionForm');
const titleInput = document.getElementById('transactionFormTitleInput');
const amountInput = document.getElementById('transactionFormAmountInput');
const dateInput = document.getElementById('transactionFormDateInput');
const typeSelect = document.getElementById('transactionFormTypeSelect');
const submitButton = transactionForm.querySelector('button[type="submit"]');

// Ambil elemen dasbor
const balanceAmountEl = document.querySelector('.tracker-summary__balance-amount');
const incomeAmountEl = document.querySelector('.tracker-summary__stat-amount--income');
const expenseAmountEl = document.querySelector('.tracker-summary__stat-amount--expense');

// Ambil elemen pencarian
const searchForm = document.getElementById('searchTransactionForm');
const searchInput = document.getElementById('searchTransactionFormTitleInput');

/**
 * Fungsi untuk menampilkan mode edit (membuat button Cancel)
 */
function enterEditMode() {
  // Buat button Cancel jika belum ada
  if (!document.getElementById('transactionFormCancelButton')) {
    const cancelButton = document.createElement('button');
    cancelButton.id = 'transactionFormCancelButton';
    cancelButton.type = 'button';
    cancelButton.textContent = 'Batal';
    cancelButton.className = 'tracker-form__cancel';
    cancelButton.style.cssText = `
      background: #E4E4E7;
      color: var(--text-dark);
      border: none;
      padding: 0.85rem 1.5rem;
      height: 44px;
      border-radius: 12px;
      font-family: inherit;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      transition: transform 0.1s, opacity 0.2s;
    `;
    cancelButton.addEventListener('click', cancelEdit);
    cancelButton.addEventListener('mouseover', function() {
      this.style.opacity = '0.85';
    });
    cancelButton.addEventListener('mouseout', function() {
      this.style.opacity = '1';
    });
    submitButton.parentNode.insertBefore(cancelButton, submitButton.nextSibling);
  }
}

/**
 * Fungsi untuk keluar dari mode edit (menghapus button Cancel)
 */
function exitEditMode() {
  const cancelButton = document.getElementById('transactionFormCancelButton');
  if (cancelButton) {
    cancelButton.remove();
  }
  submitButton.textContent = 'Simpan';
  editingTransactionId = null;
}

/**
 * Fungsi untuk membatalkan edit
 */
function cancelEdit() {
  transactionForm.reset();
  exitEditMode();
}

function renderTransactions(transactionsToRender = transactions) {
  // Kosongkan kontainer
  incomeListContainer.innerHTML = '';
  expenseListContainer.innerHTML = '';

  // Jika tidak ada transaksi, tampilkan pesan kosong
  if (transactionsToRender.length === 0) {
    const emptyMessageIncome = document.createElement('p');
    emptyMessageIncome.className = 'tracker-transaction-list__empty';
    emptyMessageIncome.textContent = 'Tidak ada transaksi pemasukan';
    incomeListContainer.appendChild(emptyMessageIncome);

    const emptyMessageExpense = document.createElement('p');
    emptyMessageExpense.className = 'tracker-transaction-list__empty';
    emptyMessageExpense.textContent = 'Tidak ada transaksi pengeluaran';
    expenseListContainer.appendChild(emptyMessageExpense);
    return;
  }

  // Render setiap transaksi
  transactionsToRender.forEach(transaction => {
    const transactionCard = createTransactionCard(transaction);
    
    if (transaction.type === 'income') {
      incomeListContainer.appendChild(transactionCard);
    } else {
      expenseListContainer.appendChild(transactionCard);
    }
  });
}

/**
 * Fungsi untuk membuat elemen kartu transaksi
 */
function createTransactionCard(transaction) {
  const container = document.createElement('div');
  container.setAttribute('data-testid', 'transactionItem');
  container.className = 'tracker-transaction-card';

  // Buat elemen untuk icon/symbol (+ atau -)
  const iconSpan = document.createElement('span');
  iconSpan.className = 'tracker-transaction-card__icon';
  iconSpan.textContent = transaction.type === 'income' ? '+' : '−';
  iconSpan.style.color = transaction.type === 'income' ? '#10b981' : '#ef4444';

  // Buat wrapper untuk info transaksi
  const infoWrapper = document.createElement('div');
  infoWrapper.className = 'tracker-transaction-card__info';

  const title = document.createElement('h3');
  title.setAttribute('data-testid', 'transactionItemTitle');
  title.textContent = transaction.title;
  title.className = 'tracker-transaction-card__title';

  const date = document.createElement('p');
  date.setAttribute('data-testid', 'transactionItemDate');
  date.textContent = transaction.date;
  date.className = 'tracker-transaction-card__date';

  infoWrapper.appendChild(title);
  infoWrapper.appendChild(date);

  // Buat wrapper untuk amount
  const amountWrapper = document.createElement('div');
  amountWrapper.className = 'tracker-transaction-card__amount-wrapper';

  const amount = document.createElement('p');
  amount.setAttribute('data-testid', 'transactionItemAmount');
  amount.textContent = `Rp ${transaction.amount.toLocaleString('id-ID')}`;
  amount.className = 'tracker-transaction-card__amount';
  amount.style.color = transaction.type === 'income' ? '#10b981' : '#ef4444';
  amount.style.fontWeight = 'bold';

  const typeElement = document.createElement('p');
  typeElement.setAttribute('data-testid', 'transactionItemType');
  const typeLabel = transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran';
  typeElement.textContent = `Tipe: ${typeLabel}`;
  typeElement.className = 'tracker-transaction-card__type';
  typeElement.style.display = 'none';

  amountWrapper.appendChild(amount);
  amountWrapper.appendChild(typeElement);

  // Buat wrapper untuk actions
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'tracker-transaction-card__actions';

  const toggleTypeButton = document.createElement('button');
  toggleTypeButton.setAttribute('data-testid', 'transactionItemEditTypeButton');
  toggleTypeButton.textContent = 'Ubah Tipe';
  toggleTypeButton.className = 'tracker-transaction-card__button tracker-transaction-card__button--toggle';
  toggleTypeButton.addEventListener('click', () => toggleTransactionType(transaction.id));

  const editButton = document.createElement('button');
  editButton.setAttribute('data-testid', 'transactionItemEditButton');
  editButton.textContent = 'Edit';
  editButton.className = 'tracker-transaction-card__button tracker-transaction-card__button--edit';
  editButton.addEventListener('click', () => editTransaction(transaction.id));

  const deleteButton = document.createElement('button');
  deleteButton.setAttribute('data-testid', 'transactionItemDeleteButton');
  deleteButton.textContent = 'Hapus';
  deleteButton.className = 'tracker-transaction-card__button tracker-transaction-card__button--delete';
  deleteButton.addEventListener('click', () => deleteTransaction(transaction.id));

  actionsDiv.appendChild(toggleTypeButton);
  actionsDiv.appendChild(editButton);
  actionsDiv.appendChild(deleteButton);

  container.appendChild(iconSpan);
  container.appendChild(infoWrapper);
  container.appendChild(amountWrapper);
  container.appendChild(actionsDiv);

  return container;
}

/**
 * Fungsi untuk update panel dasbor
 * Hitung total pemasukan, total pengeluaran, dan saldo (pemasukan - pengeluaran)
 */
function updateDashboard() {
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach(transaction => {
    if (transaction.type === 'income') {
      totalIncome += transaction.amount;
    } else {
      totalExpense += transaction.amount;
    }
  });

  const balance = totalIncome - totalExpense;

  balanceAmountEl.textContent = `Rp ${balance.toLocaleString('id-ID')}`;
  incomeAmountEl.textContent = `Rp ${totalIncome.toLocaleString('id-ID')}`;
  expenseAmountEl.textContent = `Rp ${totalExpense.toLocaleString('id-ID')}`;
}

/**
 * Event listener 'submit' pada form untuk menambah transaksi baru
 */
transactionForm.addEventListener('submit', function(e) {
  e.preventDefault();

  // Ambil nilai input
  const title = titleInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const date = dateInput.value;
  const type = typeSelect.value;

  // Validasi input
  if (!title) {
    alert('Keterangan tidak boleh kosong!');
    return;
  }

  if (amount < 1) {
    alert('Nominal harus lebih dari 0!');
    return;
  }

  // Jika sedang edit, update transaksi yang ada
  if (editingTransactionId !== null) {
    const transactionIndex = transactions.findIndex(t => t.id === editingTransactionId);
    if (transactionIndex !== -1) {
      transactions[transactionIndex] = {
        id: editingTransactionId,
        title,
        amount,
        date,
        type
      };
      exitEditMode();
    }
  } else {
    // Tambahkan transaksi baru
    const newTransaction = {
      id: generateUniqueId(),
      title,
      amount,
      date,
      type
    };
    transactions.push(newTransaction);
  }

  // Reset form
  transactionForm.reset();

  // Dispatch custom event
  document.dispatchEvent(new Event('transaction:updated'));
});


/**
 * ========================================================
 * Kriteria 2: Mengelola Penyimpanan Data (Web Storage API)
 * ========================================================
 */

/**
 * Fungsi untuk menyimpan data transaksi ke localStorage
 */
function saveToLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

/**
 * Fungsi untuk memuat data transaksi dari localStorage
 */
function loadFromLocalStorage() {
  const savedTransactions = localStorage.getItem('transactions');
  if (savedTransactions) {
    transactions = JSON.parse(savedTransactions);
  }
}

/**
 * Fungsi untuk menghapus transaksi
 */
function deleteTransaction(transactionId) {
  const confirmation = confirm('Apakah Anda yakin ingin menghapus transaksi ini?');
  if (confirmation) {
    transactions = transactions.filter(t => t.id !== transactionId);
    document.dispatchEvent(new Event('transaction:updated'));
  }
}

/**
 * Fungsi untuk edit transaksi (memuat data ke form)
 */
function editTransaction(transactionId) {
  const transaction = transactions.find(t => t.id === transactionId);
  if (transaction) {
    titleInput.value = transaction.title;
    amountInput.value = transaction.amount;
    dateInput.value = transaction.date;
    typeSelect.value = transaction.type;
    editingTransactionId = transactionId;
    submitButton.textContent = 'Perbarui';
    enterEditMode();
    titleInput.focus();
  }
}

/**
 * Event listener untuk custom event 'transaction:updated'
 * Memanggil fungsi render dan update dasbor setiap kali data berubah
 */
document.addEventListener('transaction:updated', function() {
  saveToLocalStorage();
  renderTransactions();
  updateDashboard();
  searchInput.value = '';
});


/**
 * ========================================================
 * Kriteria 3: Fitur Interaktif (Pindah Kategori dan Pencarian)
 * ========================================================
 */

/**
 * Fungsi untuk mengubah tipe transaksi (income ↔ expense)
 */
function toggleTransactionType(transactionId) {
  const transaction = transactions.find(t => t.id === transactionId);
  if (transaction) {
    transaction.type = transaction.type === 'income' ? 'expense' : 'income';
    document.dispatchEvent(new Event('transaction:updated'));
  }
}

/**
 * Event listener 'input' pada kolom pencarian
 * Filter array transaksi berdasarkan kecocokan kata kunci dengan judul transaksi
 */
searchInput.addEventListener('input', function() {
  const keyword = this.value.trim().toLowerCase();

  if (keyword === '') {
    // Jika pencarian kosong, tampilkan semua transaksi
    renderTransactions(transactions);
  } else {
    // Filter transaksi berdasarkan kata kunci
    const filteredTransactions = transactions.filter(transaction =>
      transaction.title.toLowerCase().includes(keyword)
    );
    renderTransactions(filteredTransactions);
  }
});

/**
 * Event listener 'submit' pada form pencarian
 */
searchForm.addEventListener('submit', function(e) {
  e.preventDefault();
  // Tidak perlu action khusus karena fitur input sudah menangani filtering
});

/**
 * ========================================================
 * Inisialisasi Aplikasi
 * ========================================================
 */
// Muat data dari localStorage saat halaman dibuka
loadFromLocalStorage();

// Render transaksi dan update dasbor saat pertama kali halaman dimuat
renderTransactions();
updateDashboard();