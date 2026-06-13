// State Management
let state = {
    transactions: [], // { id, tab, type, amount, category, person, note, date }
    debts: [], // { id, tab, type (owed_to_me/i_owe), amount, person, note, date }
    tabNames: { drums: 'Барабаны', vocals: 'Вокал' }
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
let currentView = 'dashboard';
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// DOM Elements
const views = document.querySelectorAll('.view');
const navHome = document.querySelector('.nav-item[data-view="dashboardView"]');
const navDebts = document.querySelector('.nav-item[data-view="debtsView"]');
const dashboardView = document.getElementById('dashboardView');
const debtsView = document.getElementById('debtsView');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabDrums = document.querySelector('.tab-btn[data-main-tab="drums"]');
const tabVocals = document.querySelector('.tab-btn[data-main-tab="vocals"]');
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

// Lesson Calculator Elements
const amountGroup = document.getElementById('amountGroup');
const lessonSpecialGroup = document.getElementById('lessonSpecialGroup');
const lessonTypeRadios = document.querySelectorAll('input[name="lessonType"]');
const lessonRentalFields = document.getElementById('lessonRentalFields');
const rentalGrossInput = document.getElementById('rentalGrossInput');
const rentalCostInput = document.getElementById('rentalCostInput');
const lessonNetResult = document.getElementById('lessonNetResult');
const debtTypeGroup = document.getElementById('debtTypeGroup');
const typeRadios = document.querySelectorAll('input[name="type"]');

const settingsModal = document.getElementById('settingsModal');
const openSettingsBtn = document.getElementById('openSettingsBtn');
const closeSettingsModalBtn = document.getElementById('closeSettingsModalBtn');
const importDataBtn = document.getElementById('importDataBtn');
const updateAppBtn = document.getElementById('updateAppBtn');
const exportCsvBtn = document.getElementById('exportCsvBtn');
const exportJsonBtn = document.getElementById('exportJsonBtn');
const importJsonBtn = document.getElementById('importJsonBtn');
const importJsonInput = document.getElementById('importJsonInput');
const openFeedbackBtn = document.getElementById('openFeedbackBtn');
const feedbackModal = document.getElementById('feedbackModal');
const closeFeedbackBtn = document.getElementById('closeFeedbackBtn');
const sendFeedbackBtn = document.getElementById('sendFeedbackBtn');
const feedbackTextarea = document.getElementById('feedbackTextarea');
const feedbackImageInput = document.getElementById('feedbackImageInput');
const attachImageBtn = document.getElementById('attachImageBtn');
const feedbackImagePreview = document.getElementById('feedbackImagePreview');
const changelogModal = document.getElementById('changelogModal');
const changelogText = document.getElementById('changelogText');
const closeChangelogBtn = document.getElementById('closeChangelogBtn');
const searchInput = document.getElementById('searchInput');
const totalOwedToMe = document.getElementById('totalOwedToMe');
const totalIOwe = document.getElementById('totalIOwe');
const updatePromptModal = document.getElementById('updatePromptModal');
const cancelUpdateBtn = document.getElementById('cancelUpdateBtn');
const confirmUpdateBtn = document.getElementById('confirmUpdateBtn');
const tabNameInput1 = document.getElementById('tabNameInput1');
const tabNameInput2 = document.getElementById('tabNameInput2');
const saveTabNamesBtn = document.getElementById('saveTabNamesBtn');
const wipeDataBtn = document.getElementById('wipeDataBtn');
const tabNameDrums = document.getElementById('tabNameDrums');
const tabNameVocals = document.getElementById('tabNameVocals');
const currentVersionSettings = document.getElementById('currentVersionSettings');
const changelogVersionSpan = document.getElementById('changelogVersionSpan');
let pendingUpdateData = null;
let editingTxId = null;

// Toast Element
const toastEl = document.getElementById('toast');

// History API Modals Logic (Android Back Button Support)
let openModals = [];

function openModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.add('active');
    openModals.push(modalEl);
    history.pushState({ modalId: modalEl.id }, '');
}

function closeModal(modalEl) {
    if (!modalEl) return;
    if (openModals.includes(modalEl)) {
        history.back(); // This will trigger popstate, which closes it
    } else {
        modalEl.classList.remove('active'); // Fallback
    }
}

window.addEventListener('popstate', (e) => {
    if (openModals.length > 0) {
        const modalToClose = openModals.pop();
        modalToClose.classList.remove('active');
        
        // Cleanups specific to modals
        if (modalToClose.id === 'addModal') {
            if(typeof addForm !== 'undefined') addForm.reset();
            if(typeof toggleFormFields === 'function') toggleFormFields('income');
            editingTxId = null;
            if(typeof addForm !== 'undefined') {
                const btn = addForm.querySelector('button[type="submit"]');
                if(btn) btn.textContent = 'Добавить';
            }
        }
        if (modalToClose.id === 'feedbackModal') {
            if(typeof feedbackTextarea !== 'undefined') feedbackTextarea.value = '';
            if(typeof feedbackImageInput !== 'undefined') feedbackImageInput.value = '';
            if(typeof feedbackImagePreview !== 'undefined') {
                feedbackImagePreview.src = '';
                feedbackImagePreview.style.display = 'none';
            }
            if(typeof attachImageBtn !== 'undefined') attachImageBtn.style.display = 'block';
        }
    }
});

// Initialization
function init() {
    loadData();
    setupEventListeners();
    updateMonthLabel();
    render();
    
    checkChangelog();
    checkForUpdates();
    
    if(currentVersionSettings) {
        currentVersionSettings.textContent = localStorage.getItem('appVersion') || '0.0';
    }

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
        if(changelogVersionSpan) changelogVersionSpan.textContent = localStorage.getItem('appVersion') || '0.0';
        changelogText.textContent = pendingChangelog;
        openModal(changelogModal);
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
        
        if(currentVersionSettings && data.version) {
            currentVersionSettings.textContent = data.version;
        }

        if (data.version !== currentVersion) {
            pendingUpdateData = data;
            const span = document.getElementById('newVersionSpan');
            if (span) span.textContent = data.version;
            if (updatePromptModal) openModal(updatePromptModal);
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
        try {
            const parsed = JSON.parse(saved);
            state.transactions = parsed.transactions || [];
            state.debts = parsed.debts || [];
            state.tabNames = parsed.tabNames || { drums: 'Барабаны', vocals: 'Вокал' };
        } catch(e) { console.error(e); }
    }
    
    // Inject missing seed data to ensure it always loads
    let modified = false;

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

let prevStats = { overallBalance: 0, balance: 0, income: 0, expense: 0 };

function animateValue(obj, start, end, duration, formatFn) {
    if (start === end) {
        if(obj) obj.innerHTML = formatFn(end);
        return;
    }
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 4); // easeOutQuart
        const current = start + (end - start) * ease;
        if(obj) obj.innerHTML = formatFn(current);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            if(obj) obj.innerHTML = formatFn(end);
        }
    };
    window.requestAnimationFrame(step);
}

function animateViewChange(direction) {
    const container = currentView === 'dashboard' ? document.getElementById('dashboardView') : document.getElementById('debtsView');
    if(!container) return;
    container.classList.remove('view-sliding-left', 'view-sliding-right');
    void container.offsetWidth; // trigger reflow
    container.classList.add(direction === 'left' ? 'view-sliding-left' : 'view-sliding-right');
    setTimeout(() => {
        container.classList.remove('view-sliding-left', 'view-sliding-right');
    }, 300);
}

// Render Functions
function render() {
    if(tabNameDrums) tabNameDrums.textContent = state.tabNames.drums || 'Барабаны';
    if(tabNameVocals) tabNameVocals.textContent = state.tabNames.vocals || 'Вокал';
    
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
    
    // 2. Filter transactions by tab, month and search query
    const searchQuery = searchInput ? searchInput.value.toLowerCase() : '';
    const filteredTx = state.transactions.filter(tx => {
        const d = new Date(tx.date);
        const matchMonth = tx.tab === currentTab && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        const matchSearch = searchQuery === '' || 
                            (tx.note && tx.note.toLowerCase().includes(searchQuery)) || 
                            (tx.person && tx.person.toLowerCase().includes(searchQuery)) ||
                            (tx.category && tx.category.toLowerCase().includes(searchQuery));
        return matchMonth && matchSearch;
    });

    let income = 0;
    let expense = 0;

    filteredTx.forEach(tx => {
        if (tx.type === 'income') income += tx.amount;
        if (tx.type === 'expense') expense += tx.amount;
    });

    const balance = income - expense;
    
    const formatTotal = (val) => `${val.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} €`;
    
    if (overallBalanceEl) {
        overallBalanceEl.textContent = `${overallBalance > 0 ? '+' : ''}${formatTotal(overallBalance)}`;
        overallBalanceEl.style.color = overallBalance >= 0 ? 'var(--income)' : 'var(--expense)';
    }
    animateValue(totalBalanceEl, prevStats.balance, balance, 600, formatTotal);
    animateValue(totalIncomeEl, prevStats.income, income, 600, formatTotal);
    animateValue(totalExpenseEl, prevStats.expense, expense, 600, formatTotal);

    prevStats.overallBalance = overallBalance;
    prevStats.balance = balance;
    prevStats.income = income;
    prevStats.expense = expense;

    // Render list
    transactionsListEl.innerHTML = '';
    if (filteredTx.length === 0) {
        transactionsListEl.innerHTML = '<div class="empty-state">Нет операций в этом месяце</div>';
    } else {
        // Sort by date desc
        filteredTx.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        let currentDateGroup = null;
        let renderIndex = 0;
        
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
                header.className = 'date-header stagger-item';
                header.style.animationDelay = `${renderIndex * 0.05}s`;
                header.textContent = dateLabel;
                transactionsListEl.appendChild(header);
                currentDateGroup = dateLabel;
                renderIndex++;
            }

            const catLabel = categories[tx.tab].find(c => c.id === tx.category)?.label || tx.category;
            const sign = tx.type === 'income' ? '+' : '-';
            const cls = tx.type === 'income' ? 'income' : 'expense';
            const personStr = tx.person ? ` • ${tx.person}` : '';
            
            const el = document.createElement('div');
            el.className = 'transaction-item stagger-item';
            el.style.animationDelay = `${renderIndex * 0.05}s`;
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
            renderIndex++;
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
        let renderIndex = 0;
        filteredDebts.forEach(debt => {
            if (debt.type === 'owed_to_me') owedSum += debt.amount;
            else iOweSum += debt.amount;
            
            const el = document.createElement('div');
            el.className = 'debt-item stagger-item';
            el.style.animationDelay = `${renderIndex * 0.05}s`;
            el.id = `debt-${debt.id}`;
            
            const isOwed = debt.type === 'owed_to_me';
            const label = isOwed ? 'Мне должны' : 'Я должен';
            
            el.innerHTML = `
                <div style="flex:1;">
                    <div class="person" style="font-weight: 500;">${debt.person || 'Неизвестно'}</div>
                    <div style="font-size: 11px; color: var(--text-muted);">${label}</div>
                    ${debt.note ? `<div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">${debt.note}</div>` : ''}
                </div>
                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
                    <div class="amount ${isOwed ? 'owed' : 'owe'}" style="font-weight: 600; font-size: 16px; color: ${isOwed ? 'var(--income)' : 'var(--expense)'}">
                        ${isOwed ? '+' : '-'}${debt.amount.toLocaleString('ru-RU')} €
                    </div>
                    <div style="display: flex; gap: 6px;">
                        <button class="pay-btn" onclick="payDebt('${debt.id}')">Вернули</button>
                        <button class="pay-btn" style="color: var(--expense); border-color: rgba(239, 68, 68, 0.3);" onclick="deleteDebt('${debt.id}')">Удалить</button>
                    </div>
                </div>
            `;
            debtsListEl.appendChild(el);
            renderIndex++;
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
    openModal(addModal);
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
    
    if (window.confetti) {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#10b981', '#3b82f6', '#8b5cf6']
        });
    }
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
    navHome.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentView === 'dashboard') return;
        currentView = 'dashboard';
        navHome.classList.add('active');
        navDebts.classList.remove('active');
        debtsView.style.display = 'none';
        dashboardView.style.display = 'block';
        animateViewChange('right');
        render();
    });

    navDebts.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentView === 'debts') return;
        currentView = 'debts';
        navDebts.classList.add('active');
        navHome.classList.remove('active');
        dashboardView.style.display = 'none';
        debtsView.style.display = 'block';
        animateViewChange('left');
        render();
    });

    // Tab Switching
    tabDrums.addEventListener('click', () => {
        if (currentTab === 'drums') return;
        currentTab = 'drums';
        tabDrums.classList.add('active');
        tabVocals.classList.remove('active');
        animateViewChange('right');
        render();
    });

    tabVocals.addEventListener('click', () => {
        if (currentTab === 'vocals') return;
        currentTab = 'vocals';
        tabVocals.classList.add('active');
        tabDrums.classList.remove('active');
        animateViewChange('left');
        render();
    });

    // Modal
    openAddModalBtn.addEventListener('click', () => {
        if (navigator.vibrate) navigator.vibrate(50);
        openModal(addModal);
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
        closeModal(addModal);
        addForm.reset();
        toggleFormFields('income');
        editingTxId = null;
        const btn = addForm.querySelector('button[type="submit"]');
        if(btn) btn.textContent = 'Добавить';
    });

    // Settings Modal
    openSettingsBtn.addEventListener('click', () => {
        tabNameInput1.value = state.tabNames.drums || '';
        tabNameInput2.value = state.tabNames.vocals || '';
        openModal(settingsModal);
    });

    closeSettingsModalBtn.addEventListener('click', () => {
        closeModal(settingsModal);
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

    if(exportJsonBtn) {
        exportJsonBtn.addEventListener('click', () => {
            if (navigator.vibrate) navigator.vibrate(30);
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
            const link = document.createElement("a");
            link.setAttribute("href", dataStr);
            link.setAttribute("download", "tempo_finance_backup.json");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast('Бэкап сохранен!');
        });
    }

    if(importJsonBtn && importJsonInput) {
        importJsonBtn.addEventListener('click', () => {
            importJsonInput.click();
        });

        importJsonInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if(!file) return;
            const reader = new FileReader();
            reader.onload = function(evt) {
                try {
                    const parsed = JSON.parse(evt.target.result);
                    if(parsed && typeof parsed === 'object') {
                        state.transactions = parsed.transactions || [];
                        state.debts = parsed.debts || [];
                        state.tabNames = parsed.tabNames || { drums: 'Барабаны', vocals: 'Вокал' };
                        saveData();
                        render();
                        closeModal(settingsModal);
                        showToast('Данные восстановлены!');
                    }
                } catch(err) {
                    alert('Ошибка чтения файла бэкапа!');
                }
            };
            reader.readAsText(file);
        });
    }

    saveTabNamesBtn.addEventListener('click', () => {
        if(navigator.vibrate) navigator.vibrate(30);
        if(!state.tabNames) state.tabNames = {};
        state.tabNames.drums = tabNameInput1.value.trim() || 'Барабаны';
        state.tabNames.vocals = tabNameInput2.value.trim() || 'Вокал';
        saveData();
        render();
        showToast('Названия сохранены');
    });

    wipeDataBtn.addEventListener('click', () => {
        if(confirm('⚠️ ВНИМАНИЕ! Это удалит абсолютно всю историю НА ЭТОМ УСТРОЙСТВЕ без возможности восстановления!\n\nВы уверены?')) {
            state.transactions = [];
            state.debts = [];
            saveData();
            render();
            closeModal(settingsModal);
            showToast('Все данные удалены');
        }
    });

    openFeedbackBtn.addEventListener('click', () => {
        if (navigator.vibrate) navigator.vibrate(30);
        openModal(feedbackModal);
        closeModal(settingsModal);
        setTimeout(() => feedbackTextarea.focus(), 100);
    });

    closeFeedbackBtn.addEventListener('click', () => {
        closeModal(feedbackModal);
        feedbackTextarea.value = '';
        feedbackImageInput.value = '';
        feedbackImagePreview.src = '';
        feedbackImagePreview.style.display = 'none';
        attachImageBtn.style.display = 'block';
    });
    
    closeChangelogBtn.addEventListener('click', () => {
        closeModal(changelogModal);
    });

    attachImageBtn.addEventListener('click', () => {
        feedbackImageInput.click();
    });

    feedbackImageInput.addEventListener('change', () => {
        const file = feedbackImageInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                feedbackImagePreview.src = e.target.result;
                feedbackImagePreview.style.display = 'block';
                attachImageBtn.style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    });

    sendFeedbackBtn.addEventListener('click', async () => {
        const text = feedbackTextarea.value.trim();
        const file = feedbackImageInput.files[0];
        if (!text && !file) return;
        
        if (navigator.vibrate) navigator.vibrate(30);
        sendFeedbackBtn.textContent = 'Отправка...';
        sendFeedbackBtn.style.opacity = '0.5';

        const token = '8913559777:AAFdTyeWU91lq-kfGVVakTF66r50tfHGOpQ';
        const chatId = '660179360';
        const caption = `🚨 Фидбек из Tempo Tracker:\n\n${text}`;

        try {
            if (file) {
                const formData = new FormData();
                formData.append('chat_id', chatId);
                formData.append('caption', caption);
                formData.append('photo', file);
                
                await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
                    method: 'POST',
                    body: formData
                });
            } else {
                const msg = encodeURIComponent(caption);
                await fetch(`https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${msg}`);
            }
            showToast('Отправлено! Спасибо!');
            closeModal(feedbackModal);
            feedbackTextarea.value = '';
            feedbackImageInput.value = '';
            feedbackImagePreview.src = '';
            feedbackImagePreview.style.display = 'none';
            attachImageBtn.style.display = 'block';
        } catch (e) {
            showToast('Ошибка отправки =(');
        } finally {
            sendFeedbackBtn.textContent = 'Отправить';
            sendFeedbackBtn.style.opacity = '1';
        }
    });

    cancelUpdateBtn.addEventListener('click', () => {
        closeModal(updatePromptModal);
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
        
        window.location.href = window.location.pathname + '?v=' + Date.now();
    });
    // Pull to Refresh
    let ptrStartY = 0;
    let ptrCurrentY = 0;
    const body = document.body;
    let ptrIndicator = document.getElementById('ptrIndicator');
    if (!ptrIndicator) {
        ptrIndicator = document.createElement('div');
        ptrIndicator.id = 'ptrIndicator';
        ptrIndicator.innerHTML = '↻ Обновление...';
        body.insertBefore(ptrIndicator, body.firstChild);
    }
    
    document.addEventListener('touchstart', (e) => {
        if (window.scrollY === 0) {
            ptrStartY = e.touches[0].clientY;
        }
    }, {passive: true});

    document.addEventListener('touchmove', (e) => {
        if (window.scrollY === 0 && ptrStartY > 0) {
            ptrCurrentY = e.touches[0].clientY;
            let dy = ptrCurrentY - ptrStartY;
            if (dy > 0 && dy < 100) {
                ptrIndicator.style.transform = `translateY(${dy}px)`;
                ptrIndicator.style.opacity = dy / 100;
            }
        }
    }, {passive: true});

    document.addEventListener('touchend', () => {
        if (ptrCurrentY - ptrStartY > 60) {
            if (navigator.vibrate) navigator.vibrate(50);
            ptrIndicator.innerHTML = 'Загрузка...';
            setTimeout(() => {
                window.location.reload(true);
            }, 500);
        } else {
            ptrIndicator.style.transform = `translateY(0px)`;
            ptrIndicator.style.opacity = 0;
        }
        ptrStartY = 0;
        ptrCurrentY = 0;
    });


    // Modal Radio Buttons Logic
    typeRadios.forEach(r => {
        r.addEventListener('change', (e) => {
            if (navigator.vibrate) navigator.vibrate(30);
            toggleFormFields(e.target.value);
        });
    });

    // Format amount input with spaces
    const amountInput = document.getElementById('amountInput');
    if (amountInput) {
        amountInput.addEventListener('input', (e) => {
            let val = e.target.value.replace(/[^\d]/g, '');
            if (val) {
                e.target.value = parseInt(val, 10).toLocaleString('ru-RU');
            } else {
                e.target.value = '';
            }
        });
    }

    // Lesson Calculator Logic
    categoryInput.addEventListener('change', toggleLessonFields);
    
    lessonTypeRadios.forEach(r => {
        r.addEventListener('change', (e) => {
            if (navigator.vibrate) navigator.vibrate(30);
            toggleLessonFields();
        });
    });

    function calculateNet() {
        const gross = parseInt(rentalGrossInput.value.replace(/\s/g, '')) || 0;
        const cost = parseInt(rentalCostInput.value.replace(/\s/g, '')) || 0;
        lessonNetResult.textContent = `Прибыль: ${gross - cost} €`;
    }

    [rentalGrossInput, rentalCostInput].forEach(inp => {
        if (inp) {
            inp.addEventListener('input', (e) => {
                let val = e.target.value.replace(/[^\d]/g, '');
                if (val) {
                    e.target.value = parseInt(val, 10).toLocaleString('ru-RU');
                } else {
                    e.target.value = '';
                }
                calculateNet();
            });
        }
    });

    // Form Submit
    addForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (navigator.vibrate) navigator.vibrate(50);
        
        const type = document.querySelector('input[name="type"]:checked').value;
        const category = type === 'debt' ? 'other' : categoryInput.value;
        const person = document.getElementById('personInput').value.trim();
        const note = document.getElementById('noteInput').value.trim();
        const dateObj = new Date();
        dateObj.setFullYear(currentYear);
        dateObj.setMonth(currentMonth);

        // Check if Lesson Rental
        const lessonType = document.querySelector('input[name="lessonType"]:checked')?.value;
        const isRental = type === 'income' && category === 'lessons' && lessonType === 'rental';

        let transactionsToAdd = [];

        if (isRental) {
            const gross = parseInt(rentalGrossInput.value.replace(/\s/g, '')) || 0;
            const cost = parseInt(rentalCostInput.value.replace(/\s/g, '')) || 0;
            
            if (gross > 0) {
                transactionsToAdd.push({
                    type: 'income',
                    amount: gross,
                    category: 'lessons',
                    person,
                    note
                });
            }
            if (cost > 0) {
                transactionsToAdd.push({
                    type: 'expense',
                    amount: cost,
                    category: 'rehearsal',
                    person,
                    note: note ? note + ' (Аренда за урок)' : 'Аренда за урок'
                });
            }
        } else {
            const rawAmount = document.getElementById('amountInput').value.replace(/\s/g, '').replace(/&nbsp;/g, '').replace(/\u00A0/g, '');
            const amount = parseFloat(rawAmount) || 0;
            transactionsToAdd.push({ type, amount, category, person, note });
        }
        
        // Save memory
        localStorage.setItem('lastAddType', type);
        if (type !== 'debt') {
            localStorage.setItem('lastAddCategory', category);
        }

        if (editingTxId) {
            // Edit only the first one if it's a rental? Actually, don't allow converting to rental during edit.
            // Just edit the existing transaction with the first item in transactionsToAdd.
            const txIndex = state.transactions.findIndex(t => t.id === editingTxId);
            if (txIndex !== -1 && transactionsToAdd.length > 0) {
                const txData = transactionsToAdd[0];
                state.transactions[txIndex] = {
                    ...state.transactions[txIndex],
                    tab: currentTab,
                    type: txData.type,
                    amount: txData.amount,
                    person: txData.person,
                    note: txData.note,
                    category: txData.category
                };
            }
            editingTxId = null;
            const btn = addForm.querySelector('button[type="submit"]');
            if(btn) btn.textContent = 'Добавить';
            showToast('Изменения сохранены');
        } else {
            transactionsToAdd.forEach((txData, index) => {
                if (txData.type === 'debt') {
                    const debtType = document.getElementById('debtTypeInput').value;
                    state.debts.push({
                        id: (Date.now() + index).toString(),
                        tab: currentTab,
                        type: debtType,
                        amount: txData.amount,
                        person: txData.person,
                        note: txData.note,
                        date: dateObj.toISOString()
                    });
                } else {
                    state.transactions.push({
                        id: (Date.now() + index).toString(),
                        tab: currentTab,
                        type: txData.type,
                        amount: txData.amount,
                        category: txData.category,
                        person: txData.person,
                        note: txData.note,
                        date: dateObj.toISOString()
                    });
                }
            });
            showToast('Успешно добавлено');
        }

        saveData();
        render();
        
        closeModal(addModal);
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
    toggleLessonFields();
}

function toggleLessonFields() {
    const type = document.querySelector('input[name="type"]:checked').value;
    const cat = categoryInput.value;
    
    if (type === 'income' && cat === 'lessons') {
        lessonSpecialGroup.style.display = 'block';
        const lessonType = document.querySelector('input[name="lessonType"]:checked').value;
        if (lessonType === 'rental') {
            lessonRentalFields.style.display = 'block';
            amountGroup.style.display = 'none';
            document.getElementById('amountInput').required = false;
        } else {
            lessonRentalFields.style.display = 'none';
            amountGroup.style.display = 'block';
            document.getElementById('amountInput').required = true;
            
            if (lessonType === 'school') {
                const amountInput = document.getElementById('amountInput');
                if (!amountInput.value) {
                    amountInput.value = '25';
                    // Optional: trigger input event to format
                    amountInput.dispatchEvent(new Event('input'));
                }
            }
        }
    } else {
        lessonSpecialGroup.style.display = 'none';
        amountGroup.style.display = 'block';
        document.getElementById('amountInput').required = true;
    }
}

function updateMonthLabel() {
    const months = ['Янв', 'Фев', 'Март', 'Апр', 'Май', 'Июнь', 'Июль', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    currentMonthLabel.textContent = `${months[currentMonth]} ${currentYear}`;
}

// Initial setup
init();

// Voice Input Logic
const voiceInputBtn = document.getElementById('voiceInputBtn');

function convertWordsToNumbers(text) {
    const numDict = {
        'ноль': 0, 'один': 1, 'одна': 1, 'два': 2, 'две': 2, 'три': 3, 'четыре': 4, 'пять': 5,
        'шесть': 6, 'семь': 7, 'восемь': 8, 'девять': 9, 'десять': 10,
        'одиннадцать': 11, 'двенадцать': 12, 'тринадцать': 13, 'четырнадцать': 14,
        'пятнадцать': 15, 'шестнадцать': 16, 'семнадцать': 17, 'восемнадцать': 18,
        'девятнадцать': 19, 'двадцать': 20, 'тридцать': 30, 'сорок': 40,
        'пятьдесят': 50, 'шестьдесят': 60, 'семьдесят': 70, 'восемьдесят': 80,
        'девяносто': 90, 'сто': 100, 'двести': 200, 'триста': 300, 'четыреста': 400,
        'пятьсот': 500, 'шестьсот': 600, 'семьсот': 700, 'восемьсот': 800, 'девятьсот': 900,
        'тысяча': 1000, 'тысячи': 1000, 'тысяч': 1000
    };
    
    // Very basic replacement. E.g. "сто пятьдесят" -> "100 50" -> later regex will grab first numbers, 
    // which is not ideal, but for simple phrases like "пятьдесят" it will yield "50".
    // For full parsing, we'd need complex logic. Let's just try to replace exact word matches if they stand alone.
    let words = text.split(' ');
    for (let i = 0; i < words.length; i++) {
        let w = words[i].replace(/[^а-яё]/g, '');
        if (numDict[w] !== undefined) {
            words[i] = numDict[w];
        }
    }
    return words.join(' ');
}

if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    if (voiceInputBtn) {
        voiceInputBtn.addEventListener('click', () => {
            voiceInputBtn.classList.add('listening');
            if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
            try {
                recognition.start();
                showToast('Говорите...');
            } catch (e) {
                // Ignore if already started
                showToast('Говорите...');
            }
        });
    }

    recognition.addEventListener('result', (e) => {
        if (voiceInputBtn) voiceInputBtn.classList.remove('listening');
        if (navigator.vibrate) navigator.vibrate(50);
        
        try {
            const rawTranscript = e.results[0][0].transcript.toLowerCase();
            const transcript = convertWordsToNumbers(rawTranscript);
            parseVoiceCommand(transcript);
        } catch (err) {
            showToast('JS Ошибка: ' + err.message);
        }
    });

    recognition.addEventListener('error', (e) => {
        if (voiceInputBtn) voiceInputBtn.classList.remove('listening');
        showToast('Ошибка микрофона: ' + e.error);
    });
    
    recognition.addEventListener('end', () => {
        if (voiceInputBtn) voiceInputBtn.classList.remove('listening');
    });
} else {
    if (voiceInputBtn) voiceInputBtn.style.display = 'none';
}

function parseVoiceCommand(text) {
    let type = 'expense'; // default
    let category = 'other';
    let amount = '';
    let rentalCost = '';
    let person = '';
    let note = text;
    let lessonType = 'normal';

    // 1. Extract ALL Amounts
    const numbersMatch = text.match(/\d+/g);
    if (numbersMatch && numbersMatch.length > 0) {
        // If we converted "сто пятьдесят" -> "100", "50"
        // Let's do a quick hack: if adjacent numbers, maybe sum them?
        // Actually, just take the first digit block. For simple use cases, people say "50" and the API writes "50".
        amount = numbersMatch[0];
        note = note.replace(amountMatch[0], '').trim();
        
        if (numbersMatch.length > 1) {
            rentalCost = numbersMatch[1];
            note = note.replace(numbersMatch[1], '').trim();
        }
    }

    // 2. Extract Type
    const incomeKeywords = ['урок', 'доход', 'заработал', 'дали', 'получил', 'пришло', 'плюс', 'вернул', 'перевел'];
    const debtKeywords = ['долг', 'занял', 'одолжил'];
    
    if (incomeKeywords.some(kw => text.includes(kw))) {
        type = 'income';
    } else if (debtKeywords.some(kw => text.includes(kw))) {
        type = 'debt';
    }

    // 3. Extract Category
    if (text.includes('урок') || text.includes('заняти') || text.includes('ученик')) {
        category = 'lessons';
        type = 'income';
        
        // Detect Lesson Sub-Type
        if (text.includes('школ')) {
            lessonType = 'school';
            amount = amount || '25'; // auto-fill if not mentioned
        } else if (text.includes('аренд') || text.includes('баз')) {
            lessonType = 'rental';
        }
    } else if (text.includes('база') || text.includes('реп') || text.includes('аренд')) {
        category = 'rehearsal';
        type = 'expense';
    } else if (text.includes('концерт') || text.includes('выступлен') || text.includes('гиг')) {
        category = 'concerts';
    } else if (text.includes('стафф') || text.includes('оборудовани') || text.includes('палочки') || text.includes('пластик') || text.includes('струны')) {
        category = 'gear';
        type = 'expense';
    } else if (text.includes('реклам') || text.includes('таргет')) {
        category = 'ads';
        type = 'expense';
    } else if (text.includes('дистро') || text.includes('релиз') || text.includes('дистрибуц')) {
        category = 'distrokid';
        type = 'expense';
    } else if (text.includes('мерч') || text.includes('футболк')) {
        category = 'merch';
        type = 'expense';
    }

    // Open Modal and Fill
    openModal(addModal);
    
    // Set Type
    const typeRadio = document.querySelector(`input[name="type"][value="${type}"]`);
    if (typeRadio) {
        typeRadio.checked = true;
        toggleFormFields(type);
    }
    
    // Set Category
    if (type !== 'debt') {
        categoryInput.value = category;
        toggleLessonFields(); // Make sure lessonSpecialGroup is shown if needed
    }
    
    // If it's a lesson, set the sub-type radio
    if (category === 'lessons') {
        const lessonRadio = document.querySelector(`input[name="lessonType"][value="${lessonType}"]`);
        if (lessonRadio) {
            lessonRadio.checked = true;
            toggleLessonFields(); // toggle inputs based on lessonType
        }
    }
    
    // Set Amounts
    if (lessonType === 'rental') {
        if (amount) {
            const rGross = document.getElementById('rentalGrossInput');
            rGross.value = amount;
            rGross.dispatchEvent(new Event('input'));
        }
        if (rentalCost) {
            const rCost = document.getElementById('rentalCostInput');
            rCost.value = rentalCost;
            rCost.dispatchEvent(new Event('input'));
        }
    } else {
        if (amount) {
            const amountInput = document.getElementById('amountInput');
            amountInput.value = amount;
            amountInput.dispatchEvent(new Event('input')); // format
        }
    }
    
    // Cleanup note
    let cleanNote = note;
    const stopWords = ['урок', 'доход', 'заработал', 'получил', 'купил', 'потратил', 'отдал', 'база', 'репа', 'минус', 'оплата', 'евро', 'рублей', 'бакс', 'за', 'на', 'мне'];
    stopWords.forEach(w => {
        cleanNote = cleanNote.replace(new RegExp(`\\b${w}\\b`, 'gi'), '');
    });
    cleanNote = cleanNote.replace(/\s+/g, ' ').trim();
    // Capitalize first letter
    if (cleanNote) {
        cleanNote = cleanNote.charAt(0).toUpperCase() + cleanNote.slice(1);
    }
    
    if (category === 'lessons') {
        document.getElementById('personInput').value = cleanNote;
        document.getElementById('noteInput').value = '';
    } else {
        document.getElementById('personInput').value = '';
        document.getElementById('noteInput').value = cleanNote;
    }
    
    showToast('Распознано: ' + text);
}
