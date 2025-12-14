let transactions = [];
let chart = null;
let selectedIndex = null;

function showPage(id) {
  document.querySelectorAll('.page').forEach(p =>
    p.classList.remove('active')
  );
  document.getElementById(id)?.classList.add('active');

  if (id === 'history') renderHistory();
  if (id === 'main') updateSummary();
}

/* ======================
   FLATPICKR INIT
====================== */
document.addEventListener('DOMContentLoaded', () => {
  flatpickr("#filterDate", {
    mode: "range",
    dateFormat: "Y-m-d"
  });
});


function saveTransaction() {
  const t = {
    amount: Number(amount.value),
    type: type.value,
    date: date.value,
    category: category.value
  };

  if (!t.amount || !t.date) return;

  if (selectedIndex !== null) {
    transactions[selectedIndex] = t;
  } else {
    transactions.push(t);
  }

  clearForm();
  showPage('history');
}

function deleteTransaction() {
  if (selectedIndex !== null) {
    transactions.splice(selectedIndex, 1);
    clearForm();
    showPage('history');
  }
}

function clearForm() {
  amount.value = '';
  date.value = '';
  selectedIndex = null;
}

function renderHistory() {
  const search = searchInput.value.toLowerCase();
  const range = filterDate.value;
  const cat = filterCategory.value;

  let start = null, end = null;
  if (range.includes(" to ")) {
    [start, end] = range.split(" to ");
  }

  historyList.innerHTML = '';

  transactions
    .filter(t => {
      const matchSearch =
        search === '' || t.category.toLowerCase().includes(search);

      const matchCategory =
        cat === 'All' || t.category === cat;

      const matchDate =
        !start ||
        (t.date >= start && t.date <= end);

      return matchSearch && matchCategory && matchDate;
    })
    .forEach((t, i) => {
      const div = document.createElement('div');
      div.className = 'history-item';
      div.textContent = `${t.category} - Rp ${t.amount} (${t.date})`;
      div.onclick = () => loadTransaction(i);
      historyList.appendChild(div);
    });
}

function loadTransaction(index) {
  const t = transactions[index];
  selectedIndex = index;

  amount.value = t.amount;
  type.value = t.type;
  date.value = t.date;
  category.value = t.category;

  showPage('add');
}

function updateSummary() {
  let income = 0, expense = 0;

  transactions.forEach(t => {
    if (t.type === 'income') income += t.amount;
    else expense += t.amount;
  });

  const incomeEl = document.getElementById('income');
  const expenseEl = document.getElementById('expense');
  const balanceEl = document.getElementById('balance');

  if (!incomeEl) return; // page belum dirender

  incomeEl.textContent = 'Rp ' + income;
  expenseEl.textContent = 'Rp ' + expense;
  balanceEl.textContent = 'Rp ' + (income - expense);

  updateChart();
}


function updateChart() {
  const ctx = document.getElementById('chart');

  const map = {};
  transactions.forEach(t => {
    if (!map[t.date]) map[t.date] = { income: 0, expense: 0 };
    map[t.date][t.type] += t.amount;
  });

  const labels = Object.keys(map).sort();
  const incomeData = labels.map(d => map[d].income);
  const expenseData = labels.map(d => map[d].expense);

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Pemasukan',
          data: incomeData,
          borderColor: '#22c55e',
          tension: 0.3
        },
        {
          label: 'Pengeluaran',
          data: expenseData,
          borderColor: '#ef4444',
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } }
    }
  });
}


document.addEventListener('input', e => {
  if (['searchInput', 'filterDate', 'filterCategory'].includes(e.target.id)) {
    renderHistory();
  }
});
