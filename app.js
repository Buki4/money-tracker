// State Management
let state = {
    transactions: [], // { id, tab, type, amount, category, person, note, date }
    debts: [] // { id, tab, type (owed_to_me/i_owe), amount, person, note, date }
};

// Categories based on tab
const categories = {
    drums: [
        { id: 'lessons', label: 'Уроки' },
        { id: 'rehearsal', label: 'Репетиции' },
        { id: 'concerts', label: 'Концерты' },
        { id: 'gear', label: 'Оборудование/Стафф' },
        { id: 'distrokid', label: 'Дистрибуция (Distrokid)' },
        { id: 'merch', label: 'Мерч' },
        { id: 'ads', label: 'Реклама' },
        { id: 'other', label: 'Другое' }
    ],
    vocals: [
        { id: 'lessons', label: 'Уроки' },
        { id: 'rehearsal', label: 'Репетиции' },
        { id: 'concerts', label: 'Концерты' },
        { id: 'other', label: 'Другое' }
    ]
};

// Current active context
let currentTab = 'drums'; // 'drums' or 'vocals'
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// DOM Elements
const views = document.querySelectorAll('.view');
const navItems = document.querySelectorAll('.nav-item');
const tabBtns = document.querySelectorAll('.tab-btn');
const totalBalanceEl = document.getElementById('totalBalance');
const overallBalanceEl = document.getElementById('overallBalance');
const totalIncomeEl = document.getElementById('totalIncome');
const totalExpenseEl = document.getElementById('totalExpense');
const transactionsListEl = document.getElementById('transactionsList');
const debtsOwedToMeEl = document.getElementById('debtsOwedToMe');
const debtsIOweEl = document.getElementById('debtsIOwe');

// Month Elements
const currentMonthLabel = document.getElementById('currentMonthLabel');
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');

// Modal Elements
const addModal = document.getElementById('addModal');
const openAddModalBtn = document.getElementById('openAddModalBtn');
const closeAddModalBtn = document.getElementById('closeAddModalBtn');
const addForm = document.getElementById('addForm');
const categoryGroup = document.getElementById('categoryGroup');
const categoryInput = document.getElementById('categoryInput');
const debtTypeGroup = document.getElementById('debtTypeGroup');
const typeRadios = document.querySelectorAll('input[name="type"]');

const settingsModal = document.getElementById('settingsModal');
const openSettingsBtn = document.getElementById('openSettingsBtn');
const closeSettingsModalBtn = document.getElementById('closeSettingsModalBtn');
const syncDataTextarea = document.getElementById('syncDataTextarea');
const copyDataBtn = document.getElementById('copyDataBtn');
const importDataBtn = document.getElementById('importDataBtn');
const updateAppBtn = document.getElementById('updateAppBtn');
const exportCsvBtn = document.getElementById('exportCsvBtn');
const openFeedbackBtn = document.getElementById('openFeedbackBtn');
const feedbackModal = document.getElementById('feedbackModal');
const closeFeedbackBtn = document.getElementById('closeFeedbackBtn');
const sendFeedbackBtn = document.getElementById('sendFeedbackBtn');
const feedbackTextarea = document.getElementById('feedbackTextarea');
const changelogModal = document.getElementById('changelogModal');
const changelogText = document.getElementById('changelogText');
const closeChangelogBtn = document.getElementById('closeChangelogBtn');
const searchInput = document.getElementById('searchInput');
const totalOwedToMe = document.getElementById('totalOwedToMe');
const totalIOwe = document.getElementById('totalIOwe');
const updatePromptModal = document.getElementById('updatePromptModal');
const cancelUpdateBtn = document.getElementById('cancelUpdateBtn');
const confirmUpdateBtn = document.getElementById('confirmUpdateBtn');
let pendingUpdateData = null;
let editingTxId = null;

// Toast Element
const toastEl = document.getElementById('toast');

// Initialization
function init() {
    loadData();
    setupEventListeners();
    updateMonthLabel();
    render();
    
    checkChangelog();
    checkForUpdates();

    // Register Service Worker for Offline Support
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(reg => console.log('Service Worker registered', reg))
                .catch(err => console.error('Service Worker registration failed', err));
        });
    }
}

function checkChangelog() {
    const pendingChangelog = localStorage.getItem('pendingChangelog');
    if (pendingChangelog) {
        changelogText.textContent = pendingChangelog;
        changelogModal.classList.add('active');
        localStorage.removeItem('pendingChangelog');
    }
    
    if (!localStorage.getItem('appVersion')) {
        localStorage.setItem('appVersion', '0.0');
    }
}

async function checkForUpdates() {
    try {
        const res = await fetch('./version.json?t=' + Date.now());
        if (!res.ok) return;
        const data = await res.json();
        
        const currentVersion = localStorage.getItem('appVersion') || '0.0';
        
        if (parseFloat(data.version) > parseFloat(currentVersion)) {
            pendingUpdateData = data;
            const span = document.getElementById('newVersionSpan');
            if (span) span.textContent = data.version;
            if (updatePromptModal) updatePromptModal.classList.add('active');
        }
    } catch(e) {
        console.error('Update check failed', e);
    }
}

const SEED_TRANSACTIONS = [
    // 2025 Drums
    { tab: 'drums', type: 'expense', amount: 5838, category: 'other', note: 'Расходы 2025', date: '2025-12-01T12:00:00Z' },
    { tab: 'drums', type: 'income', amount: 26, category: 'concerts', note: '37-21', date: '2025-12-01T12:00:00Z' },
    { tab: 'drums', type: 'income', amount: 550, category: 'lessons', date: '2025-12-01T12:00:00Z' },
    { tab: 'drums', type: 'income', amount: 280, category: 'gear', note: 'Продажа оборудования', date: '2025-12-01T12:00:00Z' },
    // 2025 Vocals
    { tab: 'vocals', type: 'expense', amount: 90, category: 'other', date: '2025-12-01T12:00:00Z' },
    { tab: 'vocals', type: 'expense', amount: 155, category: 'other', date: '2025-12-01T12:00:00Z' },
    { tab: 'vocals', type: 'expense', amount: 42, category: 'other', date: '2025-12-01T12:00:00Z' },
    // 2026 Jan-Feb
    { tab: 'drums', type: 'expense', amount: 25, category: 'distrokid', date: '2026-02-15T12:00:00Z' },
    { tab: 'drums', type: 'expense', amount: 70, category: 'rehearsal', date: '2026-02-15T12:00:00Z' },
    { tab: 'drums', type: 'income', amount: 500, category: 'lessons', date: '2026-02-15T12:00:00Z' },
    // 2026 March
    { tab: 'drums', type: 'income', amount: 730, category: 'lessons', date: '2026-03-15T12:00:00Z' },
    { tab: 'drums', type: 'expense', amount: 41, category: 'gear', date: '2026-03-15T12:00:00Z' },
    { tab: 'drums', type: 'expense', amount: 295, category: 'gear', date: '2026-03-15T12:00:00Z' },
    { tab: 'drums', type: 'expense', amount: 155, category: 'gear', date: '2026-03-15T12:00:00Z' },
    { tab: 'drums', type: 'expense', amount: 42, category: 'gear', date: '2026-03-15T12:00:00Z' },
    { tab: 'drums', type: 'expense', amount: 20, category: 'other', note: 'Мастер класс', date: '2026-03-15T12:00:00Z' },
    // 2026 April
    { tab: 'drums', type: 'income', amount: 800, category: 'lessons', date: '2026-04-15T12:00:00Z' },
    { tab: 'drums', type: 'expense', amount: 72.5, category: 'rehearsal', date: '2026-04-15T12:00:00Z' },
    { tab: 'drums', type: 'expense', amount: 90, category: 'concerts', note: 'GFEST', date: '2026-04-15T12:00:00Z' },
    { tab: 'drums', type: 'expense', amount: 10, category: 'distrokid', date: '2026-04-15T12:00:00Z' },
    { tab: 'drums', type: 'income', amount: 10, category: 'other', person: 'Ира', note: 'Бонус', date: '2026-04-15T12:00:00Z' },
    { tab: 'drums', type: 'expense', amount: 34, category: 'merch', date: '2026-04-15T12:00:00Z' },
    { tab: 'drums', type: 'expense', amount: 20, category: 'other', note: 'Temu', date: '2026-04-15T12:00:00Z' },
    { tab: 'drums', type: 'expense', amount: 30, category: 'ads', note: 'Реклама', date: '2026-04-15T12:00:00Z' },
    // 2026 May
    { tab: 'drums', type: 'expense', amount: 37.5, category: 'rehearsal', date: '2026-05-15T12:00:00Z' },
    { tab: 'drums', type: 'income', amount: 900, category: 'lessons', date: '2026-05-15T12:00:00Z' }
].map((t, i) => ({ ...t, id: 'seed-' + i }));

const SEED_DEBTS = [];

function loadData() {
    const saved = localStorage.getItem('tempoTrackerData');
    if (saved) {
        state = JSON.parse(saved);
    }
    
    // Inject missing seed data to ensure it always loads
    let modified = false;
    
    // One-time cleanup for June 2026
    if (!localStorage.getItem('june_cleaned_2026')) {
        state.transactions = state.transactions.filter(tx => {
            const d = new Date(tx.date);
            return !(d.getMonth() === 5 && d.getFullYear() === 2026); // 5 is June
        });
        state.debts = state.debts.filter(d => {
            const dDate = new Date(d.date);
            return !(dDate.getMonth() === 5 && dDate.getFullYear() === 2026);
        });
        localStorage.setItem('june_cleaned_2026', 'true');
        modified = true;
    }

    SEED_TRANSACTIONS.forEach(seedTx => {
        if (!state.transactions.find(tx => tx.id === seedTx.id)) {
            state.transactions.push(seedTx);
            modified = true;
        }
    });
    
    SEED_DEBTS.forEach(seedDebt => {
        if (!state.debts.find(d => d.id === seedDebt.id)) {
            state.debts.push(seedDebt);
            modified = true;
        }
    });

    if (modified) {
        saveData();
    }
}

function saveData() {
    localStorage.setItem('tempoTrackerData', JSON.stringify(state));
}

function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    if (navigator.vibrate) navigator.vibrate(50);
    setTimeout(() => toastEl.classList.remove('show'), 2500);
}

// Render Functions
function render() {
    renderDashboard();
    renderDebts();
}

function renderDashboard() {
    // 1. Calculate overall balance for the current tab
    let overallIncome = 0;
    let overallExpense = 0;
    
    state.transactions.forEach(tx => {
        if (tx.tab === currentTab) {
            if (tx.type === 'income') overallIncome += tx.amount;
            if (tx.type === 'expense') overallExpense += tx.amount;
        }
    });
    
    const overallBalance = overallIncome - overallExpense;
    overallBalanceEl.textContent = `${overallBalance.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} €`;
    overallBalanceEl.style.color = overallBalance >= 0 ? 'var(--income)' : 'var(--expense)';

    // 2. Filter transactions by tab, month and search query
    const searchQuery = searchInput ? searchInput.value.toLowerCase() : '';
    const filteredTx = state.transactions.filter(tx => {
        const d = new Date(tx.date);
        const matchMonth = tx.tab === currentTab && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        const matchSearch = (tx.note && tx.note.toLowerCase().includes(searchQuery)) || 
                            (tx.person && tx.person.toLowerCase().includes(searchQuery));
        return matchMonth && matchSearch;
    });

    let income = 0;
    let expense = 0;

    filteredTx.forEach(tx => {
        if (tx.type === 'income') income += tx.amount;
        if (tx.type === 'expense') expense += tx.amount;
    });

    const balance = income - expense;

    totalBalanceEl.textContent = `${balance.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} €`;
    totalIncomeEl.textContent = `${income.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} €`;
    totalExpenseEl.textContent = `${expense.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} €`;

    // Render list
    transactionsListEl.innerHTML = '';
    if (filteredTx.length === 0) {
        transactionsListEl.innerHTML = '<div class="empty-state">Нет операций в этом месяце</div>';
    } else {
        // Sort by date desc
        filteredTx.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        let currentDateGroup = null;
        
        filteredTx.forEach(tx => {
            const txDateObj = new Date(tx.date);
            const dateStr = txDateObj.toLocaleDateString('ru-RU');
            
            // Check for Today/Yesterday
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            
            let dateLabel = dateStr;
            if (dateStr === today.toLocaleDateString('ru-RU')) dateLabel = 'Сегодня';
            else if (dateStr === yesterday.toLocaleDateString('ru-RU')) dateLabel = 'Вчера';
            
            if (dateLabel !== currentDateGroup) {
                const header = document.createElement('div');
                header.className = 'date-header';
                header.textContent = dateLabel;
                transactionsListEl.appendChild(header);
                currentDateGroup = dateLabel;
            }

            const catLabel = categories[tx.tab].find(c => c.id === tx.category)?.label || tx.category;
            const sign = tx.type === 'income' ? '+' : '-';
            const cls = tx.type === 'income' ? 'income' : 'expense';
            const personStr = tx.person ? ` • ${tx.person}` : '';
            
            const el = document.createElement('div');
            el.className = 'transaction-item';
            el.id = `tx-${tx.id}`;
            el.innerHTML = `
                <div class="tx-info" onclick="editTransaction('${tx.id}')" style="cursor: pointer;">
                    <div class="tx-category">${catLabel} <span style="font-size: 10px; opacity: 0.5; margin-left: 4px;">✏️</span></div>
                    <div class="tx-person">${personStr.replace(' • ', '')}</div>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div class="tx-amount ${cls}" onclick="editTransaction('${tx.id}')" style="cursor: pointer;">${sign}${tx.amount.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} €</div>
                    <button class="delete-btn" onclick="deleteTransaction('${tx.id}')">✕</button>
                </div>
            `;
            transactionsListEl.appendChild(el);
        });
    }
}

function renderDebts() {
    const debtsListEl = document.getElementById('debtsList');
    if (!debtsListEl) return;
    debtsListEl.innerHTML = '';
    
    const filteredDebts = state.debts.filter(d => d.tab === currentTab);
    
    let owedSum = 0;
    let iOweSum = 0;

    if (filteredDebts.length === 0) {
        debtsListEl.innerHTML = '<div class="empty-state">Нет долгов</div>';
    } else {
        filteredDebts.forEach(debt => {
            if (debt.type === 'owed_to_me') owedSum += debt.amount;
            else iOweSum += debt.amount;
            
            const isOwedToMe = debt.type === 'owed_to_me';
            const cls = isOwedToMe ? 'owed' : 'i-owe';
            const sign = isOwedToMe ? '+' : '-';
            const label = isOwedToMe ? 'Мне должны' : 'Я должен';

            const el = document.createElement('div');
            el.className = 'debt-item';
            el.id = `debt-${debt.id}`;
            el.innerHTML = `
                <div style="flex:1;">
                    <div class="person">${debt.person || 'Неизвестно'}</div>
                    <div style="font-size: 11px; color: var(--text-muted);">${label}</div>
                    ${debt.note ? `<div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">${debt.note}</div>` : ''}
                </div>
                <div style="display: flex; align-items: flex-end; flex-direction: column; gap: 8px;">
                    <div class="amount ${cls}">${sign}${debt.amount.toLocaleString('ru-RU')} €</div>
                    <div style="display: flex; gap: 8px;">
                        <button class="pay-btn" onclick="payDebt('${debt.id}')">Вернули</button>
                        <button class="pay-btn" style="color: var(--expense); border-color: rgba(239, 68, 68, 0.3);" onclick="deleteDebt('${debt.id}')">Удалить</button>
                    </div>
                </div>
            `;
            debtsListEl.appendChild(el);
        });
    }
    
    if(totalOwedToMe) totalOwedToMe.textContent = owedSum.toLocaleString('ru-RU') + ' €';
    if(totalIOwe) totalIOwe.textContent = iOweSum.toLocaleString('ru-RU') + ' €';
}

window.editTransaction = function(id) {
    if (navigator.vibrate) navigator.vibrate(30);
    const tx = state.transactions.find(t => t.id === id);
    if (!tx) return;
    
    editingTxId = id;
    addModal.classList.add('active');
    updateCategoryOptions();
    
    const typeInput = document.querySelector(`input[name="type"][value="${tx.type}"]`);
    if (typeInput) typeInput.checked = true;
    toggleFormFields(tx.type);
    
    document.getElementById('amountInput').value = tx.amount;
    if (tx.type !== 'debt') {
        categoryInput.value = tx.category;
    }
    document.getElementById('personInput').value = tx.person || '';
    document.getElementById('noteInput').value = tx.note || '';
    
    const btn = addForm.querySelector('button[type="submit"]');
    if(btn) btn.textContent = 'Сохранить изменения';
};

window.deleteTransaction = function(id) {
    if(confirm('Удалить эту запись?')) {
        const el = document.getElementById(`tx-${id}`);
        if(el) {
            el.classList.add('item-exiting');
            setTimeout(() => {
                state.transactions = state.transactions.filter(tx => tx.id !== id);
                saveData();
                render();
            }, 300);
        } else {
            state.transactions = state.transactions.filter(tx => tx.id !== id);
            saveData();
            render();
        }
    }
};

window.deleteDebt = function(id) {
    if(confirm('Удалить этот долг?')) {
        const el = document.getElementById(`debt-${id}`);
        if(el) {
            el.classList.add('item-exiting');
            setTimeout(() => {
                state.debts = state.debts.filter(d => d.id !== id);
                saveData();
                render();
                showToast('Долг удален');
            }, 300);
        } else {
            state.debts = state.debts.filter(d => d.id !== id);
            saveData();
            render();
            showToast('Долг удален');
        }
    }
};

window.payDebt = function(id) {
    const debtIndex = state.debts.findIndex(d => d.id === id);
    if (debtIndex === -1) return;
    
    const debt = state.debts[debtIndex];
    
    // Create transaction to offset
    const txType = debt.type === 'owed_to_me' ? 'income' : 'expense';
    state.transactions.push({
        id: Date.now().toString(),
        tab: debt.tab,
        type: txType,
        amount: debt.amount,
        category: 'other',
        person: debt.person,
        note: 'Погашение долга',
        date: new Date().toISOString()
    });

    // Remove debt
    state.debts.splice(debtIndex, 1);
    
    saveData();
    render();
    showToast('Долг погашен!');
};

// Event Listeners
function setupEventListeners() {
    if (searchInput) {
        searchInput.addEventListener('input', render);
    }
    
    // Swipe gestures
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].clientX;
        touchStartY = e.changedTouches[0].clientY;
    }, {passive: true});

    document.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].clientX;
        touchEndY = e.changedTouches[0].clientY;
        handleSwipe();
    }, {passive: true});

    function handleSwipe() {
        if (addModal.classList.contains('active') || settingsModal.classList.contains('active')) return;
        
        const diffX = touchStartX - touchEndX;
        const diffY = touchStartY - touchEndY;
        
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
            if (diffX > 0 && currentTab === 'drums') {
                // Swiped left, go to vocals
                const vocalsTab = document.querySelector('.tab-btn[data-main-tab="vocals"]');
                if(vocalsTab) vocalsTab.click();
            } else if (diffX < 0 && currentTab === 'vocals') {
                // Swiped right, go to drums
                const drumsTab = document.querySelector('.tab-btn[data-main-tab="drums"]');
                if(drumsTab) drumsTab.click();
            }
        }
    }

    // Month Switcher
    prevMonthBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        updateMonthLabel();
        render();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        updateMonthLabel();
        render();
    });

    // Bottom Nav
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            
            const viewId = item.getAttribute('data-view');
            views.forEach(v => v.classList.remove('active'));
            document.getElementById(viewId).classList.add('active');
        });
    });

    // Tab Switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if(navigator.vibrate) navigator.vibrate(20);
            tabBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentTab = e.target.dataset.mainTab;
            render();
            updateCategoryOptions();
        });
    });

    // Modal
    openAddModalBtn.addEventListener('click', () => {
        if (navigator.vibrate) navigator.vibrate(50);
        addModal.classList.add('active');
        updateCategoryOptions();
        
        // Load last used type and category
        const lastType = localStorage.getItem('lastAddType') || 'income';
        const lastCategory = localStorage.getItem('lastAddCategory');
        
        const typeInput = document.querySelector(`input[name="type"][value="${lastType}"]`);
        if (typeInput) typeInput.checked = true;
        toggleFormFields(lastType);
        
        if (lastCategory && lastType !== 'debt') {
            categoryInput.value = lastCategory;
        }

        setTimeout(() => document.getElementById('amountInput').focus(), 100);
    });

    closeAddModalBtn.addEventListener('click', () => {
        addModal.classList.remove('active');
        addForm.reset();
        toggleFormFields('income');
        editingTxId = null;
        const btn = addForm.querySelector('button[type="submit"]');
        if(btn) btn.textContent = 'Добавить';
    });

    // Settings Modal
    openSettingsBtn.addEventListener('click', () => {
        syncDataTextarea.value = JSON.stringify(state);
        settingsModal.classList.add('active');
    });

    closeSettingsModalBtn.addEventListener('click', () => {
        settingsModal.classList.remove('active');
    });

    copyDataBtn.addEventListener('click', () => {
        syncDataTextarea.select();
        document.execCommand('copy');
        copyDataBtn.textContent = 'Скопировано!';
        setTimeout(() => copyDataBtn.textContent = 'Скопировать', 2000);
    });

    importDataBtn.addEventListener('click', () => {
        try {
            const parsed = JSON.parse(syncDataTextarea.value);
            if (parsed && parsed.transactions && parsed.debts) {
                state = parsed;
                saveData();
                render();
                settingsModal.classList.remove('active');
                showToast('Данные загружены!');
            } else {
                showToast('Неверный формат');
            }
        } catch (e) {
            showToast('Ошибка чтения');
        }
    });

    updateAppBtn.addEventListener('click', () => {
        if (navigator.vibrate) navigator.vibrate(50);
        showToast('Обновление...');
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function(registrations) {
                for(let registration of registrations) {
                    registration.unregister();
                }
            });
        }
        caches.keys().then(keys => {
            return Promise.all(keys.map(key => caches.delete(key)));
        }).then(() => {
            setTimeout(() => window.location.reload(true), 500);
        });
    });

    exportCsvBtn.addEventListener('click', () => {
        if (navigator.vibrate) navigator.vibrate(30);
        let csvContent = "data:text/csv;charset=utf-8,ID,Tab,Type,Amount,Category,Person,Note,Date\n";
        state.transactions.forEach(tx => {
            let row = [tx.id, tx.tab, tx.type, tx.amount, tx.category, tx.person || '', tx.note || '', tx.date].join(",");
            csvContent += row + "\r\n";
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "tempo_finance_history.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('CSV скачан!');
    });

    openFeedbackBtn.addEventListener('click', () => {
        if (navigator.vibrate) navigator.vibrate(30);
        feedbackModal.classList.add('active');
        settingsModal.classList.remove('active');
        setTimeout(() => feedbackTextarea.focus(), 100);
    });

    closeFeedbackBtn.addEventListener('click', () => {
        feedbackModal.classList.remove('active');
        feedbackTextarea.value = '';
    });
    
    closeChangelogBtn.addEventListener('click', () => {
        changelogModal.classList.remove('active');
    });

    sendFeedbackBtn.addEventListener('click', async () => {
        const text = feedbackTextarea.value.trim();
        if (!text) return;
        
        if (navigator.vibrate) navigator.vibrate(30);
        sendFeedbackBtn.textContent = 'Отправка...';
        sendFeedbackBtn.style.opacity = '0.5';

        const token = '8913559777:AAFdTyeWU91lq-kfGVVakTF66r50tfHGOpQ';
        const chatId = '660179360';
        const msg = encodeURIComponent(`🚨 Фидбек из Tempo Tracker:\n\n${text}`);

        try {
            await fetch(`https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${msg}`);
            showToast('Отправлено! Спасибо!');
            feedbackModal.classList.remove('active');
            feedbackTextarea.value = '';
        } catch (e) {
            showToast('Ошибка отправки =(');
        } finally {
            sendFeedbackBtn.textContent = 'Отправить';
            sendFeedbackBtn.style.opacity = '1';
        }
    });

    cancelUpdateBtn.addEventListener('click', () => {
        updatePromptModal.classList.remove('active');
    });

    confirmUpdateBtn.addEventListener('click', async () => {
        confirmUpdateBtn.textContent = 'Обновление...';
        confirmUpdateBtn.style.opacity = '0.5';
        
        localStorage.setItem('appVersion', pendingUpdateData.version);
        localStorage.setItem('pendingChangelog', pendingUpdateData.changelog);
        
        if ('serviceWorker' in navigator) {
            const regs = await navigator.serviceWorker.getRegistrations();
            for (let reg of regs) {
                await reg.unregister();
            }
        }
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
        
        window.location.reload(true);
    });

    // Modal Radio Buttons Logic
    typeRadios.forEach(r => {
        r.addEventListener('change', (e) => {
            if (navigator.vibrate) navigator.vibrate(30);
            toggleFormFields(e.target.value);
        });
    });

    // Form Submit
    addForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (navigator.vibrate) navigator.vibrate(50);
        
        const type = document.querySelector('input[name="type"]:checked').value;
        const amount = parseFloat(document.getElementById('amountInput').value);
        const person = document.getElementById('personInput').value.trim();
        const note = document.getElementById('noteInput').value.trim();
        
        // Save memory
        localStorage.setItem('lastAddType', type);
        if (type !== 'debt') {
            localStorage.setItem('lastAddCategory', document.getElementById('categoryInput').value);
        }
        
        // Always save with today's date in current month for simplicity, 
        // or we could save to the currently selected month. Let's save to currently selected month/year.
        const dateObj = new Date();
        dateObj.setFullYear(currentYear);
        dateObj.setMonth(currentMonth);

        if (editingTxId) {
            const txIndex = state.transactions.findIndex(t => t.id === editingTxId);
            if (txIndex !== -1) {
                state.transactions[txIndex] = {
                    ...state.transactions[txIndex],
                    tab: currentTab,
                    type,
                    amount,
                    person,
                    note,
                    category: type === 'debt' ? 'other' : categoryInput.value
                };
            }
            editingTxId = null;
            const btn = addForm.querySelector('button[type="submit"]');
            if(btn) btn.textContent = 'Добавить';
            showToast('Изменения сохранены');
        } else {
            if (type === 'debt') {
                const debtType = document.getElementById('debtTypeInput').value;
                state.debts.push({
                    id: Date.now().toString(),
                    tab: currentTab,
                    type: debtType,
                    amount,
                    person,
                    note,
                    date: dateObj.toISOString()
                });
            } else {
                const category = document.getElementById('categoryInput').value;
                state.transactions.push({
                    id: Date.now().toString(),
                    tab: currentTab,
                    type,
                    amount,
                    category,
                    person,
                    note,
                    date: dateObj.toISOString()
                });
            }
            showToast('Успешно добавлено');
        }

        saveData();
        render();
        
        addModal.classList.remove('active');
        addForm.reset();
        toggleFormFields('income');
    });
}

function updateCategoryOptions() {
    categoryInput.innerHTML = '';
    categories[currentTab].forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = cat.label;
        categoryInput.appendChild(opt);
    });
}

function toggleFormFields(type) {
    if (type === 'debt') {
        categoryGroup.style.display = 'none';
        debtTypeGroup.style.display = 'block';
    } else {
        categoryGroup.style.display = 'block';
        debtTypeGroup.style.display = 'none';
    }
}

function updateMonthLabel() {
    const months = ['Янв', 'Фев', 'Март', 'Апр', 'Май', 'Июнь', 'Июль', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    currentMonthLabel.textContent = `${months[currentMonth]} ${currentYear}`;
}

// Start
init();
