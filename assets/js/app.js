/* =====================================================
   EXPENSE TRACKER
   APPLICATION SHELL
   ===================================================== */

/* =====================================================
   APPLICATION STATE
   ===================================================== */

const AppState = {

    transactions: [],

    categories: [],

    budgets: [],

    settings: {},

    editingTransactionId: null,

    initialized: false

};

/* =====================================================
   TRANSACTION FILTER STATE
   ===================================================== */

const TransactionFilters = {
    search: "",
    type: "all",
    category: "all",
    date: "all",
    sort: "newest"
};

const AnalyticsState = {
    period: "month"
};

/* =====================================================
   DASHBOARD CALCULATIONS
   ===================================================== */

const DashboardCalculator = {

    getIncome(transactions) {
        return transactions
            .filter(transaction => transaction.type === "income")
            .reduce((total, transaction) => total + Number(transaction.amount || 0), 0);
    },

    getExpenses(transactions) {
        return transactions
            .filter(transaction => transaction.type === "expense")
            .reduce((total, transaction) => total + Number(transaction.amount || 0), 0);
    },

    getBalance(transactions) {
        return this.getIncome(transactions) - this.getExpenses(transactions);
    },

    getSavings(transactions) {
        return this.getBalance(transactions);
    },

    getSavingsRate(transactions) {
        const income = this.getIncome(transactions);

        return income > 0
            ? (this.getSavings(transactions) / income) * 100
            : 0;
    }

};

/* =====================================================
   TOAST NOTIFICATIONS AND FORM FEEDBACK
   ===================================================== */

const ToastManager = {

    show(message, type = "info", title = null, duration = 3500) {

        const container = document.getElementById("toastContainer");

        if (!container) {
            return;
        }

        const titles = {
            success: "Success",
            error: "Something went wrong",
            warning: "Attention",
            info: "Information"
        };
        const icons = {
            success: "circle-check",
            error: "circle-x",
            warning: "triangle-alert",
            info: "info"
        };
        const toast = document.createElement("div");
        let closed = false;

        toast.className = `toast toast-${type}`;
        toast.setAttribute("role", type === "error" ? "alert" : "status");
        toast.innerHTML = `
            <div class="toast-icon"><i data-lucide="${icons[type] || icons.info}"></i></div>
            <div class="toast-content">
                <strong class="toast-title">${escapeHTML(title || titles[type] || titles.info)}</strong>
                <p class="toast-message">${escapeHTML(message)}</p>
            </div>
            <button type="button" class="toast-close" aria-label="Close notification">
                <i data-lucide="x"></i>
            </button>
        `;

        const closeToast = () => {
            if (closed) return;
            closed = true;
            toast.classList.add("removing");
            setTimeout(() => toast.remove(), 200);
        };

        toast.querySelector(".toast-close").addEventListener("click", closeToast);
        container.appendChild(toast);
        initializeIcons();
        setTimeout(closeToast, duration);

    }

};

const LoadingManager = {

    show(element) {
        if (!element) return;
        element.setAttribute("aria-busy", "true");
        element.dataset.originalContent = element.innerHTML;
        element.innerHTML = '<div class="loading-state"><i data-lucide="loader-circle" class="loading-spinner"></i><span>Loading...</span></div>';
        initializeIcons();
    },

    hide(element) {
        if (!element) return;
        element.setAttribute("aria-busy", "false");
        if (element.dataset.originalContent) {
            element.innerHTML = element.dataset.originalContent;
        }
    }

};

function clearFormErrors(form) {

    form?.querySelectorAll(".form-error").forEach(error => error.remove());
    form?.querySelectorAll(".has-error").forEach(group => group.classList.remove("has-error"));
    form?.querySelectorAll("[aria-invalid='true']").forEach(field => field.removeAttribute("aria-invalid"));

}

function showFormError(field, message) {

    const group = field?.closest(".form-group");

    if (!field || !group) return;

    group.classList.add("has-error");
    field.setAttribute("aria-invalid", "true");
    const error = document.createElement("p");
    error.className = "form-error";
    error.textContent = message;
    error.setAttribute("role", "alert");
    group.appendChild(error);

}

/* =====================================================
   TRANSACTION VALIDATION
   ===================================================== */

function validateTransactionData(transactionData) {

    const errors = [];
    const title = String(transactionData.title || "").trim();
    const amount = Number(transactionData.amount);

    if (!title) errors.push({ field: "transactionTitle", message: "Transaction title is required." });
    if (title.length > 100) errors.push({ field: "transactionTitle", message: "Transaction title must be 100 characters or less." });
    if (!Number.isFinite(amount) || amount <= 0) errors.push({ field: "transactionAmount", message: "Amount must be greater than zero." });
    if (amount > 999999999) errors.push({ field: "transactionAmount", message: "Amount is too large." });
    if (!transactionData.category) errors.push({ field: "transactionCategory", message: "Please select a category." });
    if (!transactionData.type) errors.push({ field: "transactionType", message: "Please select a transaction type." });
    if (!transactionData.date) errors.push({ field: "transactionDate", message: "Please select a date." });

    return { valid: errors.length === 0, errors };

}

/* =====================================================
   TRANSACTION STATE MANAGEMENT
   ===================================================== */

function generateTransactionId() {

    return Date.now() +
        Math.floor(Math.random() * 1000);

}


function createTransaction(transactionData) {

    const transaction = {

        id: generateTransactionId(),

        title: transactionData.title,

        amount: Number(
            transactionData.amount
        ),

        type: transactionData.type,

        category: transactionData.category,

        date: transactionData.date,

        description:
            transactionData.description || ""

    };


    AppState.transactions.unshift(
        transaction
    );


    saveAppState();


    return transaction;

}


function updateTransaction(
    transactionId,
    transactionData
) {

    const index =
        AppState.transactions.findIndex(
            transaction =>
                transaction.id === transactionId
        );


    if (index === -1) {

        console.error(
            "Transaction not found:",
            transactionId
        );

        return false;

    }


    AppState.transactions[index] = {

        ...AppState.transactions[index],

        title: transactionData.title,

        amount: Number(
            transactionData.amount
        ),

        type: transactionData.type,

        category: transactionData.category,

        date: transactionData.date,

        description:
            transactionData.description || ""

    };


    saveAppState();


    refreshTransactionUI();


    return true;

}

function deleteTransaction(
    transactionId
) {

    const transaction = AppState.transactions.find(item => item.id === transactionId);

    if (!transaction) {
        ToastManager.show("Transaction could not be found.", "error");
        return false;
    }

    const confirmed =
        window.confirm(
            `Delete "${transaction.title}"? This action cannot be undone.`
        );


    if (!confirmed) {
        return false;
    }


    const originalLength =
        AppState.transactions.length;


    AppState.transactions =
        AppState.transactions.filter(
            transaction =>
                transaction.id !== transactionId
        );


    if (
        AppState.transactions.length ===
        originalLength
    ) {

        ToastManager.show("Transaction could not be deleted.", "error");
        return false;

    }


    saveAppState();
    refreshTransactionUI();

    ToastManager.show("Transaction deleted successfully.", "success");


    return true;

}



/* =====================================================
   TRANSACTION FORM
   ===================================================== */

function setupTransactionForm() {

    const form =
        document.getElementById(
            "transactionForm"
        );


    if (!form) {

        console.warn(
            "Transaction form not found."
        );

        return;

    }


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            const submitButton = form.querySelector('[type="submit"]');

            if (submitButton?.disabled) {
                return;
            }

            clearFormErrors(form);


            const title =
                document.getElementById(
                    "transactionTitle"
                )?.value.trim();


            const amount =
                Number(
                    document.getElementById(
                        "transactionAmount"
                    )?.value
                );


            const category =
                document.getElementById(
                    "transactionCategory"
                )?.value;


            const date =
                document.getElementById(
                    "transactionDate"
                )?.value;


            const description =
                document.getElementById(
                    "transactionDescription"
                )?.value.trim();


            const type =
                document.getElementById(
                    "transactionType"
                )?.value;


            const transactionData = { title, amount, category, date, description, type };
            const validation = validateTransactionData(transactionData);

            if (!validation.valid) {
                const firstError = validation.errors[0];
                const field = document.getElementById(firstError.field);
                showFormError(field, firstError.message);
                ToastManager.show(firstError.message, "error");
                field?.focus();
                return;
            }

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.dataset.originalText = submitButton.innerHTML;
                submitButton.innerHTML = '<i data-lucide="loader-circle"></i> Saving...';
                initializeIcons();
            }

            try {


            if (
                AppState.editingTransactionId !==
                null
            ) {

                updateTransaction(
                    AppState.editingTransactionId,
                    {
                        title,
                        amount,
                        category,
                        date,
                        description,
                        type
                    }
                );


                AppState.editingTransactionId =
                    null;

                ToastManager.show("Transaction updated successfully.", "success");

            } else {

                createTransaction({

                    title,
                    amount,
                    category,
                    date,
                    description,
                    type

                });

                ToastManager.show("Transaction added successfully.", "success");

            }


            form.reset();


            closeTransactionModal();


            refreshTransactionUI();

            } catch (error) {

                console.error("Transaction save failed:", error);
                ToastManager.show("We couldn't save the transaction. Please try again.", "error");

            } finally {

                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = submitButton.dataset.originalText || "Save Transaction";
                    initializeIcons();
                }

            }

        }
    );

}

/* =====================================================
   REFRESH TRANSACTION UI
   ===================================================== */

function refreshTransactionUI() {

    if (typeof populateTransactionFilterCategories === "function") {
        populateTransactionFilterCategories();
    }

    if (
        typeof renderTransactions ===
        "function"
    ) {

        renderTransactions(getFilteredTransactions());

    }


    if (
        typeof renderCategories ===
        "function"
    ) {

        renderCategories();

    }

    if (typeof renderBudgets === "function") {
        renderBudgets();
    }

    if (typeof updateDashboard === "function") {
        updateDashboard();
    }

    if (typeof renderFinancialInsights === "function") {
        renderFinancialInsights();
    }

    updateTransactionSummary();
    updateAnalytics();


    if (
        typeof createSpendingChart ===
        "function"
    ) {

        createSpendingChart();

    }


    if (
        typeof createCategoryChart ===
        "function"
    ) {

        createCategoryChart();

    }


}

/* =====================================================
   ICON INITIALIZATION
   ===================================================== */

function initializeIcons() {

    if (typeof lucide !== "undefined") {

        lucide.createIcons();

    }

}


/* =====================================================
   THEME MANAGER
   ===================================================== */

const ThemeManager = {

    getTheme() {

        return (
            localStorage.getItem(
                "expenseTrackerTheme"
            ) || "light"
        );

    },


    setTheme(theme) {

        document.documentElement.setAttribute(
            "data-theme",
            theme
        );

        localStorage.setItem(
            "expenseTrackerTheme",
            theme
        );

    },


    toggle() {

        const currentTheme =
            this.getTheme();

        const newTheme =
            currentTheme === "light"
                ? "dark"
                : "light";

        this.setTheme(newTheme);

        updateThemeIcon();

    },


    initialize() {

        this.setTheme(
            this.getTheme()
        );

    }

};


/* =====================================================
   THEME ICON
   ===================================================== */

function updateThemeIcon() {

    const button =
        document.getElementById(
            "themeToggle"
        );

    if (!button) return;


    const theme =
        ThemeManager.getTheme();


    button.innerHTML =
        theme === "light"
            ? '<i data-lucide="moon"></i>'
            : '<i data-lucide="sun"></i>';


    initializeIcons();

}

/* =====================================================
   INITIALIZE APPLICATION STATE
   ===================================================== */

function initializeAppState() {

    AppState.transactions =
        StorageManager.get(
            "expenseTrackerTransactions",
            defaultTransactions
        );


    AppState.categories =
        StorageManager.get(
            "expenseTrackerCategories",
            defaultCategories
        );


    AppState.budgets =
        StorageManager.get(
            "expenseTrackerBudgets",
            defaultBudgets
        );

    // Legacy budget totals are discarded: transactions are the spending source of truth.
    AppState.budgets.forEach(budget => {
        delete budget.spent;
    });


    AppState.settings =
        StorageManager.get(
            "expenseTrackerSettings",
            defaultSettings
        );


    AppState.initialized = true;

}

/* =====================================================
   SAVE APPLICATION STATE
   ===================================================== */

function saveAppState() {

    StorageManager.set(
        "expenseTrackerTransactions",
        AppState.transactions
    );


    StorageManager.set(
        "expenseTrackerCategories",
        AppState.categories
    );


    StorageManager.set(
        "expenseTrackerBudgets",
        AppState.budgets
    );


    StorageManager.set(
        "expenseTrackerSettings",
        AppState.settings
    );

}



/* =====================================================
   PAGE NAVIGATION
   ===================================================== */

function setupNavigation() {

    const navigationItems =
        document.querySelectorAll(
            "[data-page]"
        );


    navigationItems.forEach(item => {

        item.addEventListener(
            "click",
            event => {

                event.preventDefault();


                const page =
                    item.dataset.page;


                setActivePage(page);

            }
        );

    });


    // Setup "View all" button in dashboard
    const viewAllButton =
        document.getElementById(
            "viewAllTransactions"
        );


    if (viewAllButton) {

        viewAllButton.addEventListener(
            "click",
            () => {

                setActivePage("transactions");

            }
        );

    }

}


/* =====================================================
   SET ACTIVE PAGE
   ===================================================== */

function setActivePage(page) {

    const navigationItems = document.querySelectorAll("[data-page]");

    navigationItems.forEach(item => {
        item.classList.toggle("active", item.dataset.page === page);
    });

    const pages = document.querySelectorAll(".app-page");

    pages.forEach(currentPage => {
        currentPage.classList.toggle("active", currentPage.id === `${page}Page`);
    });

    const pageName = document.getElementById("currentPageName");

    const pageNames = {
        dashboard: "Dashboard",
        transactions: "Transactions",
        analytics: "Analytics",
        categories: "Categories",
        settings: "Settings"
    };

    if (pageName) {
        pageName.textContent = pageNames[page] || "Dashboard";
    }

    if (page === "transactions") {
        renderTransactions();
    }

    if (page === "analytics") {
        updateAnalytics();
    }

    if (page === "categories") {
        renderCategories();
    }

    initializeIcons();

    console.log(`Navigated to: ${page}`);

}

/* =====================================================
   MOBILE MENU
   ===================================================== */

function setupMobileMenu() {

    const menuButton =
        document.getElementById(
            "mobileMenuButton"
        );


    if (!menuButton) return;

    const sidebar = document.querySelector(".sidebar");
    const overlay = document.getElementById("sidebarOverlay");

    function closeMobileMenu() {
        sidebar?.classList.remove("mobile-open");
        overlay?.classList.remove("active");
        overlay?.setAttribute("aria-hidden", "true");
        menuButton.setAttribute("aria-expanded", "false");
    }


    menuButton.addEventListener(
        "click",
        () => {

            if (sidebar) {

                const isOpen = sidebar.classList.toggle("mobile-open");
                overlay?.classList.toggle("active", isOpen);
                overlay?.setAttribute("aria-hidden", String(!isOpen));
                menuButton.setAttribute("aria-expanded", String(isOpen));

            }


            console.log(
                "Mobile menu clicked"
            );

        }
    );

    overlay?.addEventListener("click", closeMobileMenu);

    document.querySelectorAll(".sidebar .navigation-item").forEach(item => {
        item.addEventListener("click", closeMobileMenu);
    });

}

/* =====================================================
   TOPBAR CONTROLS AND QUICK ACTIONS
   ===================================================== */

function setupInteractiveControls() {

    const panels = document.querySelectorAll(".topbar-panel, .context-menu");
    const triggers = document.querySelectorAll("[aria-controls], #sidebarUserMenuButton");
    const searchButton = document.getElementById("globalSearchButton");
    const searchPanel = document.getElementById("globalSearchPanel");
    const searchInput = document.getElementById("globalSearchInput");
    const searchResults = document.getElementById("globalSearchResults");
    const notificationsButton = document.getElementById("notificationsButton");
    const notificationsPanel = document.getElementById("notificationsPanel");
    const notificationsList = document.getElementById("notificationsList");
    const notificationDot = notificationsButton?.querySelector(".notification-dot");
    const profileButton = document.getElementById("profileMenuButton");
    const sidebarProfileButton = document.getElementById("sidebarUserMenuButton");
    const profileMenu = document.getElementById("profileMenu");
    const categoryOptionsButton = document.getElementById("categoryOptionsButton");
    const categoryOptionsMenu = document.getElementById("categoryOptionsMenu");

    function closePanels() {
        panels.forEach(panel => { panel.hidden = true; });
        triggers.forEach(trigger => trigger.setAttribute("aria-expanded", "false"));
    }

    function togglePanel(panel, trigger) {
        const shouldOpen = panel.hidden;
        closePanels();
        panel.hidden = !shouldOpen;
        trigger?.setAttribute("aria-expanded", String(shouldOpen));
        if (shouldOpen) initializeIcons();
    }

    function renderSearchResults(query = "") {
        if (!searchResults) return;

        const term = query.trim().toLowerCase();
        const matches = term
            ? AppState.transactions.filter(transaction =>
                [transaction.title, transaction.category, transaction.description]
                    .some(value => String(value || "").toLowerCase().includes(term))
            ).slice(0, 6)
            : AppState.transactions.slice(0, 5);

        searchResults.innerHTML = matches.length
            ? matches.map(transaction => `
                <button type="button" class="panel-result" data-search-transaction="${transaction.id}">
                    <span><strong>${escapeHTML(transaction.title)}</strong><small>${escapeHTML(transaction.category)} · ${escapeHTML(transaction.date)}</small></span>
                    <strong class="${transaction.type === "income" ? "transaction-income" : "transaction-expense"}">${CurrencyManager.format(transaction.amount)}</strong>
                </button>
            `).join("")
            : '<p class="panel-empty">No matching transactions.</p>';
    }

    function renderNotifications() {
        if (!notificationsList) return;

        const alerts = AppState.budgets
            .map(budget => ({ budget, percentage: getBudgetUsagePercentage(budget) }))
            .filter(item => item.percentage >= 80)
            .map(item => ({
                icon: "triangle-alert",
                title: `${item.budget.category} budget is ${Math.round(item.percentage)}% used`,
                message: "Review this category before you reach its limit."
            }));

        if (!alerts.length) {
            alerts.push({
                icon: "circle-check",
                title: "You are up to date",
                message: "There are no budget alerts right now."
            });
        }

        notificationsList.innerHTML = alerts.map(alert => `
            <div class="notification-item">
                <i data-lucide="${alert.icon}"></i>
                <span><strong>${escapeHTML(alert.title)}</strong><small>${escapeHTML(alert.message)}</small></span>
            </div>
        `).join("");
    }

    searchButton?.addEventListener("click", () => {
        togglePanel(searchPanel, searchButton);
        renderSearchResults(searchInput?.value || "");
        if (!searchPanel.hidden) setTimeout(() => searchInput?.focus(), 0);
    });

    searchInput?.addEventListener("input", () => renderSearchResults(searchInput.value));

    searchResults?.addEventListener("click", event => {
        const result = event.target.closest("[data-search-transaction]");
        if (!result) return;

        const transaction = AppState.transactions.find(item => item.id === Number(result.dataset.searchTransaction));
        if (!transaction) return;

        Object.assign(TransactionFilters, {
            search: transaction.title,
            type: "all",
            category: "all",
            date: "all",
            sort: "newest"
        });
        const transactionSearch = document.getElementById("transactionSearch");
        if (transactionSearch) transactionSearch.value = transaction.title;
        const filterValues = {
            transactionTypeFilter: "all",
            transactionCategoryFilter: "all",
            transactionDateFilter: "all",
            transactionSortFilter: "newest"
        };
        Object.entries(filterValues).forEach(([id, value]) => {
            const field = document.getElementById(id);
            if (field) field.value = value;
        });
        setActivePage("transactions");
        renderTransactions(getFilteredTransactions());
        closePanels();
    });

    notificationsButton?.addEventListener("click", () => {
        renderNotifications();
        togglePanel(notificationsPanel, notificationsButton);
    });

    document.getElementById("markNotificationsRead")?.addEventListener("click", () => {
        notificationDot?.setAttribute("hidden", "");
        if (notificationsList) notificationsList.innerHTML = '<p class="panel-empty">You are all caught up.</p>';
    });

    [profileButton, sidebarProfileButton].forEach(button => {
        button?.addEventListener("click", () => togglePanel(profileMenu, button));
    });

    profileMenu?.addEventListener("click", event => {
        const action = event.target.closest("[data-profile-action]")?.dataset.profileAction;
        if (!action) return;

        if (action === "settings") setActivePage("settings");
        if (action === "theme") ThemeManager.toggle();
        if (action === "help") ToastManager.show("Tip: use the search button to quickly find transactions.", "info", "Quick help");
        closePanels();
    });

    categoryOptionsButton?.addEventListener("click", () => togglePanel(categoryOptionsMenu, categoryOptionsButton));

    categoryOptionsMenu?.addEventListener("click", event => {
        const action = event.target.closest("[data-category-action]")?.dataset.categoryAction;
        if (action === "manage") setActivePage("categories");
        if (action === "refresh") {
            updateDashboard();
            createCategoryChart();
            ToastManager.show("Category breakdown refreshed.", "success");
        }
        closePanels();
    });

    document.addEventListener("click", event => {
        if (!event.target.closest(".topbar-panel, .context-menu, [aria-controls], #sidebarUserMenuButton")) {
            closePanels();
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") closePanels();
    });

}


/* =====================================================
   THEME TOGGLE BUTTON
   ===================================================== */

function setupThemeToggle() {

    const themeButton =
        document.getElementById(
            "themeToggle"
        );


    if (!themeButton) return;


    themeButton.addEventListener(
        "click",
        () => {

            ThemeManager.toggle();

        }
    );

}

/* =====================================================
   SPENDING CHART
   ===================================================== */

function getExpenseCategoryBreakdown(transactions) {
    return Object.entries(transactions
        .filter(transaction => transaction.type === "expense")
        .reduce((totals, transaction) => {
            const category = transaction.category || "Uncategorized";
            totals[category] = (totals[category] || 0) + Number(transaction.amount || 0);
            return totals;
        }, {}))
        .map(([name, amount]) => ({ name, amount }))
        .sort((first, second) => second.amount - first.amount);
}

function getDashboardSpendingTrend() {
    const labels = [];
    const data = [];
    const now = new Date();
    const selectedPeriod = document.getElementById("spendingPeriod")?.value || "Last 6 months";
    const monthCount = selectedPeriod === "This year" ? now.getMonth() + 1 : selectedPeriod === "Last 12 months" ? 12 : 6;

    for (let offset = monthCount - 1; offset >= 0; offset -= 1) {
        const month = new Date(now.getFullYear(), now.getMonth() - offset, 1);
        const total = AppState.transactions
            .filter(transaction => {
                const date = new Date(`${transaction.date}T00:00:00`);
                return transaction.type === "expense" && !Number.isNaN(date.getTime()) &&
                    date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth();
            })
            .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

        labels.push(new Intl.DateTimeFormat("en", { month: "short" }).format(month));
        data.push(total);
    }

    return { labels, data };
}

function setupDashboardChartControls() {
    document.getElementById("spendingPeriod")?.addEventListener("change", createSpendingChart);
}

function createSpendingChart() {

    const canvas =
        document.getElementById(
            "spendingChart"
        );


    if (!canvas || typeof Chart === "undefined") {
        return;
    }

    const existingChart = Chart.getChart(canvas);

    if (existingChart) {
        existingChart.destroy();
    }


    const trend = getDashboardSpendingTrend();

    new Chart(canvas, {

        type: "line",

        data: {

            labels: trend.labels,

            datasets: [

                {

                    label: "Expenses",

                    data: trend.data,

                    borderColor:
                        "#7c3aed",

                    backgroundColor:
                        "rgba(124, 58, 237, 0.08)",

                    borderWidth: 2,

                    fill: true,

                    tension: 0.4,

                    pointRadius: 3,

                    pointHoverRadius: 6

                }

            ]

        },


        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {
                    display: false
                }

            },


            scales: {

                y: {

                    beginAtZero: true,

                    border: {
                        display: false
                    },

                    grid: {
                        color:
                            "rgba(148, 163, 184, 0.15)"
                    },

                    ticks: {

                        color:
                            "#9a97a1",

                        font: {
                            size: 9
                        },

                        callback: function(value) {

                            return "KES " +
                                (value / 1000) +
                                "K";

                        }

                    }

                },


                x: {

                    border: {
                        display: false
                    },

                    grid: {
                        display: false
                    },

                    ticks: {

                        color:
                            "#9a97a1",

                        font: {
                            size: 9
                        }

                    }

                }

            }

        }

    });

}

/* =====================================================
   CATEGORY CHART
   ===================================================== */

function createCategoryChart() {

    const canvas =
        document.getElementById(
            "categoryChart"
        );


    if (!canvas || typeof Chart === "undefined") {
        return;
    }

    const existingChart = Chart.getChart(canvas);

    if (existingChart) {
        existingChart.destroy();
    }


    const categories = getExpenseCategoryBreakdown(getCurrentMonthTransactions());
    const colors = ["#f97316", "#7c3aed", "#ec4899", "#3b82f6", "#94a3b8", "#14b8a6", "#eab308"];

    new Chart(canvas, {

        type: "doughnut",

        data: {

            labels: categories.map(category => category.name),

            datasets: [

                {

                    data: categories.map(category => category.amount),

                    backgroundColor: categories.map((category, index) => colors[index % colors.length]),

                    borderWidth: 0,

                    hoverOffset: 5

                }

            ]

        },


        options: {

            responsive: true,

            maintainAspectRatio: false,

            cutout: "72%",

            plugins: {

                legend: {
                    display: false
                }

            }

        }

    });

}

/* =====================================================
   TRANSACTION MODAL
   ===================================================== */

function openTransactionModal() {

    const modal = document.getElementById("transactionModal");

    if (!modal) {
        return;
    }

    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
}

/* =====================================================
   CATEGORY AND BUDGET STATE MANAGEMENT
   ===================================================== */

function generateCategoryId() {

    return Date.now() + Math.floor(Math.random() * 1000);

}

function createCategory(categoryData) {

    const category = {
        id: generateCategoryId(),
        name: categoryData.name.trim(),
        description: categoryData.description || "Custom category",
        icon: categoryData.icon || "tag",
        type: categoryData.type || "expense",
        color: categoryData.color || "purple"
    };

    AppState.categories.push(category);
    saveAppState();
    renderCategories();
    populateBudgetCategories();
    renderBudgets();

    return category;

}

function updateCategory(categoryId, categoryData) {

    const category = AppState.categories.find(item => item.id === categoryId);

    if (!category) {
        return false;
    }

    const previousName = category.name;
    const nextName = categoryData.name.trim();

    Object.assign(category, {
        name: nextName,
        description: categoryData.description || "Custom category",
        icon: categoryData.icon || "tag"
    });

    if (previousName !== nextName) {
        AppState.transactions.forEach(transaction => {
            if (transaction.category === previousName) {
                transaction.category = nextName;
            }
        });

        AppState.budgets.forEach(budget => {
            if (budget.category === previousName) {
                budget.category = nextName;
            }
        });
    }

    saveAppState();
    renderCategories();
    populateBudgetCategories();
    renderBudgets();
    refreshTransactionUI();

    return true;

}

function getCategorySpending(categoryName) {

    return AppState.transactions
        .filter(transaction =>
            transaction.type === "expense" &&
            transaction.category === categoryName
        )
        .reduce((total, transaction) => total + Number(transaction.amount || 0), 0);

}

function getCategoryTransactionCount(categoryName) {

    return AppState.transactions.filter(transaction =>
        transaction.type === "expense" &&
        transaction.category === categoryName
    ).length;

}

function generateBudgetId() {

    return Date.now() + Math.floor(Math.random() * 1000);

}

function createBudget(category, limit) {

    const normalizedLimit = Number(limit);
    const existingBudget = AppState.budgets.find(budget => budget.category === category);

    if (existingBudget) {
        existingBudget.limit = normalizedLimit;
        delete existingBudget.spent;
    } else {
        AppState.budgets.push({
            id: generateBudgetId(),
            category,
            limit: normalizedLimit
        });
    }

    saveAppState();
    renderBudgets();

}

function getBudgetSpent(categoryName) {

    return getCategorySpending(categoryName);

}

function getBudgetRemaining(budget) {

    return Number(budget.limit || 0) - getBudgetSpent(budget.category);

}

function getBudgetUsagePercentage(budget) {

    const limit = Number(budget.limit || 0);

    if (limit <= 0) {
        return 0;
    }

    return (getBudgetSpent(budget.category) / limit) * 100;

}

/* =====================================================
   DASHBOARD DATA
   ===================================================== */

function getCurrentMonthTransactions() {

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return AppState.transactions.filter(transaction => {
        const date = new Date(`${transaction.date}T00:00:00`);

        return !Number.isNaN(date.getTime()) &&
            date.getFullYear() === currentYear &&
            date.getMonth() === currentMonth;
    });

}

function getCurrentMonthSummary() {

    const transactions = getCurrentMonthTransactions();
    const income = DashboardCalculator.getIncome(transactions);
    const expenses = DashboardCalculator.getExpenses(transactions);
    const balance = income - expenses;

    return {
        transactions,
        income,
        expenses,
        balance,
        savingsRate: income > 0 ? (balance / income) * 100 : 0
    };

}

function getTopSpendingCategory() {

    const totals = AppState.transactions
        .filter(transaction => transaction.type === "expense")
        .reduce((categoryTotals, transaction) => {
            const category = transaction.category || "Uncategorized";
            categoryTotals[category] = (categoryTotals[category] || 0) + Number(transaction.amount || 0);
            return categoryTotals;
        }, {});

    const topCategory = Object.entries(totals)
        .sort((first, second) => second[1] - first[1])[0];

    return topCategory
        ? { category: topCategory[0], amount: topCategory[1] }
        : null;

}

function getLargestTransaction() {

    return AppState.transactions.reduce((largest, transaction) =>
        !largest || Number(transaction.amount || 0) > Number(largest.amount || 0)
            ? transaction
            : largest,
    null);

}

function getBudgetSummary() {

    const totalBudget = AppState.budgets.reduce(
        (total, budget) => total + Number(budget.limit || 0),
        0
    );
    const totalSpent = AppState.budgets.reduce(
        (total, budget) => total + getBudgetSpent(budget.category),
        0
    );

    return {
        totalBudget,
        totalSpent,
        remaining: totalBudget - totalSpent,
        utilization: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
    };

}

function getDashboardData() {

    const month = getCurrentMonthSummary();

    return {
        balance: month.balance,
        income: month.income,
        expenses: month.expenses,
        savings: month.balance,
        savingsRate: month.savingsRate,
        monthlyTransactions: month.transactions.length,
        totalTransactions: AppState.transactions.length,
        topCategory: getTopSpendingCategory(),
        largestTransaction: getLargestTransaction(),
        budget: getBudgetSummary()
    };

}

/* =====================================================
   DASHBOARD UI AND INSIGHTS
   ===================================================== */

function updateDashboard() {

    const data = getDashboardData();
    const values = {
        dashboardBalance: data.balance,
        dashboardIncome: data.income,
        dashboardExpenses: data.expenses,
        dashboardSavings: data.savings,
        dashboardCategoryTotal: data.expenses
    };

    Object.entries(values).forEach(([id, value]) => {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = CurrencyManager.format(value);
        }
    });

    const savingsRate = document.getElementById("dashboardSavingsRate");
    if (savingsRate) {
        savingsRate.textContent = `${Math.round(data.savingsRate)}% savings rate`;
    }

    const topCategory = document.getElementById("topSpendingCategory");
    const topCategoryAmount = document.getElementById("topSpendingAmount");

    if (topCategory) {
        topCategory.textContent = data.topCategory ? data.topCategory.category : "No data";
    }

    if (topCategoryAmount) {
        topCategoryAmount.textContent = CurrencyManager.format(
            data.topCategory ? data.topCategory.amount : 0
        );
    }

    renderDashboardCategoryList();
    renderDashboardRecentTransactions();

}

function updateTransactionSummary() {
    const income = DashboardCalculator.getIncome(AppState.transactions);
    const expenses = DashboardCalculator.getExpenses(AppState.transactions);
    const values = {
        transactionsTotalIncome: income,
        transactionsTotalExpenses: expenses,
        transactionsNetBalance: income - expenses
    };

    Object.entries(values).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = CurrencyManager.format(value);
    });
}

function renderDashboardCategoryList() {

    const container = document.getElementById("dashboardCategoryList");

    if (!container) {
        return;
    }

    const categoryTotals = getCurrentMonthTransactions()
        .filter(transaction => transaction.type === "expense")
        .reduce((totals, transaction) => {
            const category = transaction.category || "Uncategorized";
            totals[category] = (totals[category] || 0) + Number(transaction.amount || 0);
            return totals;
        }, {});
    const categories = Object.entries(categoryTotals)
        .map(([name, amount]) => ({ name, amount }))
        .sort((first, second) => second.amount - first.amount);

    container.innerHTML = categories.length
        ? categories.map(category => `
            <div class="category-item">
                <div class="category-name"><span>${escapeHTML(category.name)}</span></div>
                <strong>${CurrencyManager.format(category.amount)}</strong>
            </div>
        `).join("")
        : '<p class="empty-state">No expense data this month.</p>';

}

function renderDashboardRecentTransactions() {

    const container = document.getElementById("dashboardRecentTransactions");

    if (!container) {
        return;
    }

    const transactions = [...AppState.transactions]
        .sort((first, second) => new Date(`${second.date}T00:00:00`) - new Date(`${first.date}T00:00:00`))
        .slice(0, 5);

    container.innerHTML = transactions.length
        ? transactions.map(transaction => {
            const income = transaction.type === "income";
            const formattedDate = new Intl.DateTimeFormat("en-GB", {
                day: "numeric", month: "short", year: "numeric"
            }).format(new Date(`${transaction.date}T00:00:00`));

            return `
                <div class="transaction-item">
                    <div class="transaction-main">
                        <div class="transaction-icon ${getTransactionIconClass(transaction.category)}">
                            <i data-lucide="${getIconForCategory(transaction.category)}"></i>
                        </div>
                        <div class="transaction-information">
                            <strong>${escapeHTML(transaction.title)}</strong>
                            <span>${escapeHTML(transaction.category)} · ${formattedDate}</span>
                        </div>
                    </div>
                    <strong class="${income ? "transaction-income" : "transaction-expense"}">
                        ${income ? "+" : "-"} ${CurrencyManager.format(transaction.amount)}
                    </strong>
                </div>
            `;
        }).join("")
        : '<div class="empty-state"><i data-lucide="receipt"></i><p>No transactions recorded yet.</p></div>';

    initializeIcons();

}

function generateFinancialInsights() {

    const data = getDashboardData();
    const insights = [];

    if (data.income === 0) {
        insights.push({ type: "info", icon: "info", title: "No income recorded", message: "Add your income to get a clearer picture of your finances." });
    }

    if (data.expenses > data.income && data.income > 0) {
        insights.push({ type: "warning", icon: "triangle-alert", title: "Spending exceeds income", message: "Your expenses are currently higher than your income." });
    }

    if (data.savingsRate >= 20) {
        insights.push({ type: "success", icon: "trending-up", title: "Great savings rate", message: `You are currently saving approximately ${Math.round(data.savingsRate)}% of your income.` });
    } else if (data.savingsRate > 0) {
        insights.push({ type: "info", icon: "piggy-bank", title: "Room to increase savings", message: "Consider reviewing your largest spending categories." });
    }

    if (data.budget.utilization >= 80) {
        insights.push({ type: "warning", icon: "wallet-cards", title: "Budgets are getting high", message: `You have used approximately ${Math.round(data.budget.utilization)}% of your total budget.` });
    }

    if (data.topCategory) {
        insights.push({ type: "info", icon: "chart-pie", title: `${data.topCategory.category} is your largest category`, message: `You have spent ${CurrencyManager.format(data.topCategory.amount)} in this category.` });
    }

    return insights;

}

function renderFinancialInsights() {

    const container = document.getElementById("financialInsights");

    if (!container) {
        return;
    }

    const insights = generateFinancialInsights();
    container.innerHTML = insights.length
        ? insights.map(insight => `
            <div class="financial-insight ${escapeHTML(insight.type)}">
                <div class="insight-icon"><i data-lucide="${escapeHTML(insight.icon)}"></i></div>
                <div class="insight-content"><strong>${escapeHTML(insight.title)}</strong><p>${escapeHTML(insight.message)}</p></div>
            </div>
        `).join("")
        : '<div class="empty-state"><i data-lucide="lightbulb"></i><p>Keep adding transactions to receive financial insights.</p></div>';

    initializeIcons();

}

function closeTransactionModal() {

    const modal = document.getElementById("transactionModal");

    if (!modal) {
        return;
    }

    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
}

function setupTransactionModal() {

    const modal =
        document.getElementById(
            "transactionModal"
        );

    const openButtons =
        document.querySelectorAll(
            "#addTransactionButton, #transactionsAddButton, #emptyAddTransactionButton, .mobile-add-button"
        );

    const closeButton =
        document.getElementById(
            "closeTransactionModal"
        );

    const cancelButton =
        document.getElementById(
            "cancelTransaction"
        );

    if (
        !modal ||
        !openButtons ||
        openButtons.length === 0 ||
        !closeButton ||
        !cancelButton
    ) {
        console.warn("Transaction modal elements not found");
        return;
    }


    /* -----------------------------------------
       OPEN MODAL
       ----------------------------------------- */

    /* -----------------------------------------
       OPEN BUTTONS
       ----------------------------------------- */

    openButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {
                AppState.editingTransactionId = null;
                document.getElementById("transactionForm")?.reset();
                document.getElementById("transactionType").value = "expense";
                typeButtons.forEach(item => item.classList.toggle("active", item.dataset.type === "expense"));
                setDefaultTransactionDate();
                openTransactionModal();

                setTimeout(() => {
                    document.getElementById("transactionTitle")?.focus();
                }, 200);
            }
        );

    });

    /* -----------------------------------------
       CLOSE BUTTON
       ----------------------------------------- */

    closeButton.addEventListener(
        "click",
        closeTransactionModal
    );


    /* -----------------------------------------
       CANCEL BUTTON
       ----------------------------------------- */

    cancelButton.addEventListener(
        "click",
        closeTransactionModal
    );


    /* -----------------------------------------
       CLICK OUTSIDE MODAL
       ----------------------------------------- */

    modal.addEventListener(
        "click",
        event => {

            if (
                event.target === modal
            ) {

                closeTransactionModal();

            }

        }
    );


    /* -----------------------------------------
       ESCAPE KEY
       ----------------------------------------- */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                modal.classList.contains("active")
            ) {

                closeTransactionModal();

            }

        }
    );


    /* -----------------------------------------
       TRANSACTION TYPE
       ----------------------------------------- */

    const typeButtons =
        document.querySelectorAll(
            ".transaction-type"
        );

    const typeInput =
        document.getElementById(
            "transactionType"
        );


    typeButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                typeButtons.forEach(
                    item => {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                typeInput.value =
                    button.dataset.type;

            }
        );

    });


}

/* =====================================================
   GET ICON FOR CATEGORY
   ===================================================== */

function getIconForCategory(category) {
    const icons = {
        food: "utensils",
        transport: "car-front",
        shopping: "shopping-bag",
        entertainment: "gamepad-2",
        bills: "zap",
        health: "heart",
        education: "book-open",
        other: "receipt"
    };
    
    return icons[category] || "receipt";
}

/* =====================================================
   DEFAULT TRANSACTION DATE
   ===================================================== */

function setDefaultTransactionDate() {

    const dateInput =
        document.getElementById(
            "transactionDate"
        );


    if (!dateInput) return;


    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(
            today.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            today.getDate()
        ).padStart(
            2,
            "0"
        );


    dateInput.value =
        `${year}-${month}-${day}`;

}

/* =====================================================
   CATEGORY LABELS
   ===================================================== */

const categoryLabels = {

    food: "Food",

    transport: "Transport",

    shopping: "Shopping",

    entertainment: "Entertainment",

    bills: "Bills & Utilities",

    health: "Health",

    education: "Education",

    other: "Other"

};

/* =====================================================
   RENDER TRANSACTIONS
   ===================================================== */

function renderTransactionCards(
    transactionList = AppState.transactions
) {

    const container =
        document.getElementById(
            "transactionsList"
        );


    if (!container) {
        return;
    }


    if (!transactionList.length) {

        container.innerHTML = `
            <div class="empty-state">

                <i data-lucide="receipt"></i>

                <h3>
                    No transactions yet
                </h3>

                <p>
                    Add your first transaction
                    to start tracking your finances.
                </p>

            </div>
        `;

        initializeIcons();

        return;

    }


    container.innerHTML =
        transactionList.map(
            transaction => {

                const isIncome =
                    transaction.type ===
                    "income";


                return `
                    <div
                        class="transaction-item"
                        data-id="${transaction.id}"
                    >

                        <div class="transaction-icon">

                            <i data-lucide="${
                                isIncome
                                    ? "arrow-down-left"
                                    : "arrow-up-right"
                            }"></i>

                        </div>


                        <div class="transaction-details">

                            <strong>
                                ${escapeHTML(
                                    transaction.title
                                )}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    transaction.category
                                )}
                                ·
                                ${transaction.date}
                            </span>

                        </div>


                        <div
                            class="transaction-amount ${
                                isIncome
                                    ? "income"
                                    : "expense"
                            }"
                        >

                            ${
                                isIncome
                                    ? "+"
                                    : "-"
                            }

                            ${CurrencyManager.format(
                                transaction.amount
                            )}

                        </div>


                        <div class="transaction-actions">

                            <button
                                class="icon-button edit-transaction"
                                data-id="${transaction.id}"
                                title="Edit transaction"
                            >

                                <i data-lucide="pencil"></i>

                            </button>


                            <button
                                class="icon-button delete-transaction"
                                data-id="${transaction.id}"
                                title="Delete transaction"
                            >

                                <i data-lucide="trash-2"></i>

                            </button>

                        </div>

                    </div>
                `;

            }
        ).join("");


    initializeIcons();

    setupTransactionRowActions();

}

function renderTransactions(transactionList = getFilteredTransactions()) {

    const tableBody = document.getElementById("transactionsTableBody");
    const emptyState = document.getElementById("transactionsEmpty");
    const resultCount = document.getElementById("transactionResultCount");

    if (!tableBody || !emptyState || !resultCount) {
        return;
    }

    tableBody.innerHTML = "";

    if (!transactionList.length) {
        const heading = emptyState.querySelector("h3");
        const message = emptyState.querySelector("p");
        const addButton = emptyState.querySelector("#emptyAddTransactionButton");
        const hasTransactions = AppState.transactions.length > 0;

        if (heading) heading.textContent = hasTransactions ? "No transactions found" : "No transactions yet";
        if (message) message.textContent = hasTransactions
            ? "Try changing your search or filters."
            : "Start tracking your finances by adding your first transaction.";
        if (addButton) addButton.hidden = hasTransactions;
        emptyState.classList.add("visible");
        resultCount.textContent = "0 transactions found";
        return;
    }

    emptyState.classList.remove("visible");
    emptyState.querySelector("#emptyAddTransactionButton")?.setAttribute("hidden", "");

    transactionList.forEach(transaction => {
        const row = document.createElement("tr");
        const isIncome = transaction.type === "income";
        const categoryLabel = categoryLabels[transaction.category] || transaction.category;
        const formattedDate = new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }).format(new Date(`${transaction.date}T00:00:00`));

        row.innerHTML = `
            <td><div class="table-transaction"><div class="table-transaction-icon ${getTransactionIconClass(transaction.category)}"><i data-lucide="${getIconForCategory(transaction.category)}"></i></div><div class="table-transaction-information"><strong>${escapeHTML(transaction.title)}</strong><span>Transaction #${transaction.id}</span></div></div></td>
            <td><span class="category-badge">${escapeHTML(categoryLabel)}</span></td>
            <td>${formattedDate}</td>
            <td><span class="type-badge ${isIncome ? "type-income" : "type-expense"}"><i data-lucide="${isIncome ? "arrow-down-left" : "arrow-up-right"}"></i>${isIncome ? "Income" : "Expense"}</span></td>
            <td class="amount-value ${isIncome ? "amount-income" : "amount-expense"}">${isIncome ? "+" : "-"} ${CurrencyManager.format(transaction.amount)}</td>
            <td><div class="table-actions"><button type="button" class="table-action-button" title="Edit transaction" aria-label="Edit transaction" data-edit-id="${transaction.id}"><i data-lucide="pencil"></i></button><button type="button" class="table-action-button delete" title="Delete transaction" aria-label="Delete transaction" data-delete-id="${transaction.id}"><i data-lucide="trash-2"></i></button></div></td>`;

        tableBody.appendChild(row);
    });

    resultCount.textContent = `${transactionList.length} transactions found`;

    tableBody.querySelectorAll("[data-edit-id]").forEach(button => {
        button.addEventListener("click", () => {
            openEditTransaction(Number(button.dataset.editId));
        });
    });

    tableBody.querySelectorAll("[data-delete-id]").forEach(button => {
        button.addEventListener("click", () => {
            deleteTransaction(Number(button.dataset.deleteId));
        });
    });

    initializeIcons();
}

function escapeHTML(value) {

    const div =
        document.createElement("div");


    div.textContent =
        String(value ?? "");


    return div.innerHTML;

}

function setupTransactionRowActions() {

    const editButtons =
        document.querySelectorAll(
            ".edit-transaction"
        );


    const deleteButtons =
        document.querySelectorAll(
            ".delete-transaction"
        );


    editButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        Number(
                            button.dataset.id
                        );


                    openEditTransaction(
                        id
                    );

                }
            );

        }
    );


    deleteButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        Number(
                            button.dataset.id
                        );


                    deleteTransaction(id);

                }
            );

        }
    );

}

function openEditTransaction(
    transactionId
) {

    const transaction =
        AppState.transactions.find(
            item =>
                item.id === transactionId
        );


    if (!transaction) {

        console.error(
            "Transaction not found."
        );

        return;

    }

    AppState.editingTransactionId =
        transactionId;

    document.getElementById(
        "transactionTitle"
    ).value =
        transaction.title;


    document.getElementById(
        "transactionAmount"
    ).value =
        transaction.amount;


    document.getElementById(
        "transactionCategory"
    ).value =
        transaction.category;


    document.getElementById(
        "transactionDate"
    ).value =
        transaction.date;


    document.getElementById(
        "transactionDescription"
    ).value =
        transaction.description || "";


    document.getElementById(
        "transactionType"
    ).value =
        transaction.type;

    document.querySelectorAll(".transaction-type").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.type === transaction.type
        );
    });


    openTransactionModal();

}

function getTransactionIconClass(category) {

    const classes = {

        food: "food-icon",

        transport: "transport-icon",

        shopping: "shopping-icon",

        entertainment: "entertainment-icon",

        bills: "expense-icon",

        health: "expense-icon",

        education: "income-icon",

        other: "income-icon"

    };


    return classes[category] || "income-icon";

}

/* =====================================================
   TRANSACTION FILTERS
   ===================================================== */

function getFilteredTransactions() {

    // Start with a copy so filtering and sorting never mutate AppState.transactions.
    let filtered = [...AppState.transactions];
    const search = TransactionFilters.search.trim().toLowerCase();

    // Apply the filters in the same order as the UI specification.
    if (search) {
        filtered = filtered.filter(transaction =>
            String(transaction.title || "").toLowerCase().includes(search)
        );
    }

    if (TransactionFilters.type !== "all") {
        filtered = filtered.filter(transaction =>
            transaction.type === TransactionFilters.type
        );
    }

    if (TransactionFilters.category !== "all") {
        filtered = filtered.filter(transaction =>
            transaction.category === TransactionFilters.category
        );
    }

    if (TransactionFilters.date !== "all") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dayInMilliseconds = 24 * 60 * 60 * 1000;
        const days = TransactionFilters.date === "today" ? 0 :
            TransactionFilters.date === "week" ? 7 : 30;

        filtered = filtered.filter(transaction => {
            const transactionDate = new Date(`${transaction.date}T00:00:00`);
            transactionDate.setHours(0, 0, 0, 0);
            const difference = today - transactionDate;

            return !Number.isNaN(transactionDate.getTime()) &&
                difference >= 0 && difference <= days * dayInMilliseconds;
        });
    }

    // Sort only the copied, filtered array.
    filtered.sort((first, second) => {
        if (TransactionFilters.sort === "oldest") {
            return new Date(`${first.date}T00:00:00`) - new Date(`${second.date}T00:00:00`);
        }

        if (TransactionFilters.sort === "highest") {
            return Number(second.amount) - Number(first.amount);
        }

        if (TransactionFilters.sort === "lowest") {
            return Number(first.amount) - Number(second.amount);
        }

        return new Date(`${second.date}T00:00:00`) - new Date(`${first.date}T00:00:00`);
    });

    return filtered;

}

function populateTransactionFilterCategories() {

    const categoryFilter = document.getElementById("transactionCategoryFilter");

    if (!categoryFilter) {
        return;
    }

    const categories = [...new Set(
        AppState.transactions
            .map(transaction => transaction.category)
            .filter(Boolean)
    )].sort((first, second) => first.localeCompare(second));

    categoryFilter.innerHTML = '<option value="all">All Categories</option>' +
        categories.map(category =>
            `<option value="${escapeHTML(category)}">${escapeHTML(category)}</option>`
        ).join("");

    categoryFilter.value = categories.includes(TransactionFilters.category)
        ? TransactionFilters.category
        : "all";

    if (categoryFilter.value === "all") {
        TransactionFilters.category = "all";
    }

}

function setupTransactionFilters() {

    const searchInput =
        document.getElementById(
            "transactionSearch"
        );

    const typeFilter =
        document.getElementById(
            "transactionTypeFilter"
        );

    const categoryFilter =
        document.getElementById(
            "transactionCategoryFilter"
        );

    const dateFilter = document.getElementById("transactionDateFilter");

    const sortFilter = document.getElementById("transactionSortFilter");

    const resetButton =
        document.getElementById(
            "clearTransactionFilters"
        );


    if (
        !searchInput ||
        !typeFilter ||
        !categoryFilter ||
        !dateFilter ||
        !sortFilter ||
        !resetButton
    ) {
        return;
    }

    populateTransactionFilterCategories();

    function applyFilters() {
        TransactionFilters.search = searchInput.value;
        TransactionFilters.type = typeFilter.value;
        TransactionFilters.category = categoryFilter.value;
        TransactionFilters.date = dateFilter.value;
        TransactionFilters.sort = sortFilter.value;
        renderTransactions(getFilteredTransactions());
    }


    searchInput.addEventListener(
        "input",
        applyFilters
    );


    typeFilter.addEventListener(
        "change",
        applyFilters
    );


    categoryFilter.addEventListener(
        "change",
        applyFilters
    );

    dateFilter.addEventListener("change", applyFilters);

    sortFilter.addEventListener("change", applyFilters);


    resetButton.addEventListener(
        "click",
        () => {

            searchInput.value = "";

            typeFilter.value = "all";

            categoryFilter.value = "all";

            dateFilter.value = "all";

            sortFilter.value = "newest";

            Object.assign(TransactionFilters, {
                search: "",
                type: "all",
                category: "all",
                date: "all",
                sort: "newest"
            });

            renderTransactions(getFilteredTransactions());

        }
    );

}

/* =====================================================
   ANALYTICS TREND CHART
   ===================================================== */

function createAnalyticsTrendChart() {

    const canvas =
        document.getElementById(
            "analyticsTrendChart"
        );


    if (!canvas) {
        return;
    }


    const existingChart =
        Chart.getChart(canvas);


    if (existingChart) {
        existingChart.destroy();
    }


    new Chart(canvas, {

        type: "line",

        data: {

            labels: [
                "1 Aug",
                "5 Aug",
                "10 Aug",
                "15 Aug",
                "20 Aug",
                "25 Aug",
                "30 Aug"
            ],

            datasets: [

                {
                    label: "Expenses",

                    data: [
                        1200,
                        3400,
                        5200,
                        7800,
                        10500,
                        18200,
                        25235
                    ],

                    borderWidth: 2,

                    tension: 0.4,

                    fill: false,

                    pointRadius: 3,

                    pointHoverRadius: 5
                },


                {
                    label: "Income",

                    data: [
                        100000,
                        100000,
                        100000,
                        100000,
                        100000,
                        100000,
                        100000
                    ],

                    borderWidth: 2,

                    borderDash: [
                        5,
                        5
                    ],

                    tension: 0.4,

                    fill: false,

                    pointRadius: 2

                }

            ]

        },


        options: {

            responsive: true,

            maintainAspectRatio: false,

            interaction: {

                intersect: false,

                mode: "index"

            },


            plugins: {

                legend: {
                    display: false
                }

            },


            scales: {

                y: {

                    beginAtZero: true,

                    grid: {
                        color:
                            "rgba(128,128,128,0.08)"
                    },

                    ticks: {

                        callback: value =>
                            "KES " +
                            value.toLocaleString()

                    }

                },


                x: {

                    grid: {
                        display: false
                    }

                }

            }

        }

    });

}

/* =====================================================
   ANALYTICS CATEGORY LIST
   ===================================================== */

function renderAnalyticsCategoryList() {

    const container =
        document.getElementById(
            "analyticsCategoryList"
        );


    if (!container) {
        return;
    }


    const categories = [

        {
            name: "Food",
            amount: 8450
        },

        {
            name: "Transport",
            amount: 5200
        },

        {
            name: "Shopping",
            amount: 4200
        },

        {
            name: "Entertainment",
            amount: 3185
        },

        {
            name: "Bills",
            amount: 4200
        }

    ];


    container.innerHTML = "";


    categories.forEach(
        (category, index) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "analytics-category-row";


            row.innerHTML = `

                <span
                    class="analytics-category-name"
                >

                    <span
                        class="analytics-category-color"
                    ></span>

                    ${category.name}

                </span>


                <span
                    class="analytics-category-amount"
                >

                    KES ${category.amount.toLocaleString()}

                </span>

            `;


            container.appendChild(row);

        }
    );

}

/* =====================================================
   ANALYTICS CATEGORY CHART
   ===================================================== */

function createAnalyticsCategoryChart() {

    const canvas = document.getElementById(
        "analyticsCategoryChart"
    );

    if (!canvas) {
        return;
    }

    const existingChart = Chart.getChart(canvas);

    if (existingChart) {
        existingChart.destroy();
    }

    new Chart(canvas, {

        type: "doughnut",

        data: {

            labels: [
                "Food",
                "Transport",
                "Shopping",
                "Entertainment",
                "Bills"
            ],

            datasets: [{

                data: [
                    8450,
                    5200,
                    4200,
                    3185,
                    4200
                ],

                backgroundColor: [
                    "#f97316",
                    "#7c3aed",
                    "#ec4899",
                    "#3b82f6",
                    "#f59e0b"
                ],

                borderWidth: 2,
                borderColor: "var(--surface)",

                hoverOffset: 5

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            cutout: "70%",

            plugins: {

                legend: {
                    display: false
                }

            },

            layout: {
                padding: 10
            }

        }

    });

}

/* =====================================================
   RENDER CATEGORIES
   ===================================================== */

function getAnalyticsTransactions() {
    const now = new Date();
    return AppState.transactions.filter(transaction => {
        const date = new Date(`${transaction.date}T00:00:00`);
        if (Number.isNaN(date.getTime())) return false;
        return AnalyticsState.period === "year"
            ? date.getFullYear() === now.getFullYear()
            : date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
    });
}

function getAnalyticsTrend(transactions) {
    const now = new Date();
    const days = AnalyticsState.period === "year"
        ? 12
        : new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const labels = [];
    const expenses = [];
    const income = [];

    for (let index = 1; index <= days; index += 1) {
        const date = AnalyticsState.period === "year"
            ? new Date(now.getFullYear(), index - 1, 1)
            : new Date(now.getFullYear(), now.getMonth(), index);
        const matching = transactions.filter(transaction => {
            const transactionDate = new Date(`${transaction.date}T00:00:00`);
            return AnalyticsState.period === "year"
                ? transactionDate.getMonth() === date.getMonth()
                : transactionDate.getDate() <= date.getDate();
        });
        labels.push(AnalyticsState.period === "year"
            ? new Intl.DateTimeFormat("en", { month: "short" }).format(date)
            : String(index));
        expenses.push(DashboardCalculator.getExpenses(matching));
        income.push(DashboardCalculator.getIncome(matching));
    }

    return { labels, expenses, income };
}

function updateAnalyticsSummary() {
    const transactions = getAnalyticsTransactions();
    const income = DashboardCalculator.getIncome(transactions);
    const expenses = DashboardCalculator.getExpenses(transactions);
    const savings = income - expenses;
    const days = AnalyticsState.period === "year"
        ? 365
        : Math.max(1, new Date().getDate());
    const values = {
        analyticsIncome: income,
        analyticsExpenses: expenses,
        analyticsSavings: savings,
        analyticsDailyAverage: expenses / days
    };

    Object.entries(values).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = CurrencyManager.format(value);
    });

    const description = document.getElementById("analyticsSavingsDescription");
    if (description) description.textContent = `${income > 0 ? Math.round((savings / income) * 100) : 0}% of your income`;
}

function createAnalyticsTrendChart() {
    const canvas = document.getElementById("analyticsTrendChart");
    if (!canvas || typeof Chart === "undefined") return;
    Chart.getChart(canvas)?.destroy();
    const trend = getAnalyticsTrend(getAnalyticsTransactions());

    new Chart(canvas, {
        type: "line",
        data: {
            labels: trend.labels,
            datasets: [
                { label: "Expenses", data: trend.expenses, borderColor: "#ef4444", borderWidth: 2, tension: 0.4, fill: false, pointRadius: 2 },
                { label: "Income", data: trend.income, borderColor: "#22c55e", borderWidth: 2, borderDash: [5, 5], tension: 0.4, fill: false, pointRadius: 2 }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, interaction: { intersect: false, mode: "index" }, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { callback: value => CurrencyManager.format(value) } }, x: { grid: { display: false } } } }
    });
}

function renderAnalyticsCategoryList() {
    const container = document.getElementById("analyticsCategoryList");
    if (!container) return;
    const categories = getExpenseCategoryBreakdown(getAnalyticsTransactions());
    const colors = ["#f97316", "#7c3aed", "#ec4899", "#3b82f6", "#f59e0b", "#14b8a6"];
    container.innerHTML = categories.length
        ? categories.map((category, index) => `<div class="analytics-category-row"><span class="analytics-category-name"><span class="analytics-category-color" style="background-color:${colors[index % colors.length]}"></span>${escapeHTML(category.name)}</span><span class="analytics-category-amount">${CurrencyManager.format(category.amount)}</span></div>`).join("")
        : '<p class="empty-state">No expense data for this period.</p>';
}

function createAnalyticsCategoryChart() {
    const canvas = document.getElementById("analyticsCategoryChart");
    if (!canvas || typeof Chart === "undefined") return;
    Chart.getChart(canvas)?.destroy();
    const categories = getExpenseCategoryBreakdown(getAnalyticsTransactions());
    const colors = ["#f97316", "#7c3aed", "#ec4899", "#3b82f6", "#f59e0b", "#14b8a6"];
    new Chart(canvas, { type: "doughnut", data: { labels: categories.map(category => category.name), datasets: [{ data: categories.map(category => category.amount), backgroundColor: categories.map((category, index) => colors[index % colors.length]), borderWidth: 2, borderColor: "var(--surface)", hoverOffset: 5 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: "70%", plugins: { legend: { display: false } }, layout: { padding: 10 } } });
}

function renderAnalyticsInsights() {
    const container = document.getElementById("analyticsInsights");
    if (!container) return;
    const transactions = getAnalyticsTransactions();
    const income = DashboardCalculator.getIncome(transactions);
    const expenses = DashboardCalculator.getExpenses(transactions);
    const topCategory = getExpenseCategoryBreakdown(transactions)[0];
    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
    const insights = [
        { icon: "chart-pie", title: "Biggest category", value: topCategory?.name || "No expenses yet", text: topCategory ? `${CurrencyManager.format(topCategory.amount)} spent in this period.` : "Add an expense to see your largest category." },
        { icon: "target", title: "Savings rate", value: `${Math.round(savingsRate)}%`, text: income ? (savingsRate >= 0 ? "Your income currently covers your expenses." : "Your expenses are higher than your income.") : "Add income to calculate your savings rate." },
        { icon: expenses > income && income > 0 ? "triangle-alert" : "shield-check", title: "Financial health", value: expenses > income && income > 0 ? "Review spending" : "Looking good", text: expenses > income && income > 0 ? "Consider reducing expenses or adding income." : "Your spending is within your recorded income." }
    ];
    container.innerHTML = insights.map(insight => `<div class="insight-item"><div class="insight-icon"><i data-lucide="${insight.icon}"></i></div><div><span class="insight-title">${escapeHTML(insight.title)}</span><strong>${escapeHTML(insight.value)}</strong><p>${escapeHTML(insight.text)}</p></div></div>`).join("");
    initializeIcons();
}

function updateAnalytics() {
    updateAnalyticsSummary();
    createAnalyticsTrendChart();
    createAnalyticsCategoryChart();
    renderAnalyticsCategoryList();
    renderAnalyticsInsights();
}

function setupAnalyticsControls() {
    document.querySelectorAll(".period-button").forEach(button => {
        button.addEventListener("click", () => {
            AnalyticsState.period = button.dataset.period === "year" ? "year" : "month";
            document.querySelectorAll(".period-button").forEach(item => {
                item.classList.toggle("active", item === button);
            });
            updateAnalytics();
        });
    });
}

function renderCategories(data = AppState.categories) {

    const grid = document.getElementById("categoriesList");
    const emptyState = document.getElementById("categoriesEmpty");
    const categoryCount = document.getElementById("categoryCount");

    if (!grid || !emptyState) {
        return;
    }

    grid.innerHTML = "";

    if (categoryCount) {
        categoryCount.textContent = data.length;
    }

    if (data.length === 0) {
        emptyState.classList.add("visible");
        return;
    }

    emptyState.classList.remove("visible");

    const highestSpending = Math.max(
        ...AppState.categories.map(category => getCategorySpending(category.name))
    );

    data.forEach(category => {

        const card = document.createElement("article");
        card.className = "category-card";

        const spent = getCategorySpending(category.name);
        const transactionCount = getCategoryTransactionCount(category.name);
        const percentage = highestSpending > 0
            ? Math.round((spent / highestSpending) * 100)
            : 0;

        card.innerHTML = `

            <div class="category-card-header">

                <div class="category-card-icon">
                    <i data-lucide="${category.icon}"></i>
                </div>

                <div class="category-actions">

                    <button
                        type="button"
                        class="category-action-button"
                        title="Edit category"
                        data-edit-category="${category.id}"
                    >
                        <i data-lucide="pencil"></i>
                    </button>

                    <button
                        type="button"
                        class="category-action-button delete"
                        title="Delete category"
                        data-delete-category="${category.id}"
                    >
                        <i data-lucide="trash-2"></i>
                    </button>

                </div>

            </div>

            <h3>${escapeHTML(category.name)}</h3>

            <p class="category-card-description">
                ${escapeHTML(category.description)}
            </p>

            <div class="category-card-stats">

                <span>
                    ${transactionCount}
                    transaction${transactionCount === 1 ? "" : "s"}
                </span>

                <strong>
                    KES ${spent.toLocaleString()}
                </strong>

            </div>

            <div class="category-progress" aria-label="${percentage}% of highest spending category">

                <div class="category-progress-bar" style="width: ${percentage}%"></div>

            </div>

        `;

        grid.appendChild(card);

    });

    initializeIcons();

}

/* =====================================================
   BUDGET RENDERING AND FORM
   ===================================================== */

function renderBudgets() {

    const container = document.getElementById("budgetsList");

    if (!container) {
        return;
    }

    if (!AppState.budgets.length) {
        container.innerHTML = '<p class="categories-empty visible">No budgets created yet.</p>';
        return;
    }

    container.innerHTML = AppState.budgets.map(budget => {
        const spent = getBudgetSpent(budget.category);
        const remaining = getBudgetRemaining(budget);
        const percentage = getBudgetUsagePercentage(budget);
        const progress = Math.min(percentage, 100);

        return `
            <article class="category-card budget-card">
                <h3>${escapeHTML(budget.category)}</h3>
                <div class="category-card-stats">
                    <span>KES ${spent.toLocaleString()} spent (${Math.round(percentage)}%)</span>
                    <strong>KES ${remaining.toLocaleString()} remaining</strong>
                </div>
                <div class="category-progress" aria-label="${Math.round(percentage)}% of budget used">
                    <div class="category-progress-bar" style="width: ${progress}%"></div>
                </div>
            </article>
        `;
    }).join("");

    initializeIcons();

}

function populateBudgetCategories() {

    const select = document.getElementById("budgetCategory");

    if (!select) {
        return;
    }

    const selectedValue = select.value;
    const expenseCategories = AppState.categories.filter(category => category.type === "expense");

    select.innerHTML = '<option value="">Select a category</option>' + expenseCategories.map(category =>
        `<option value="${escapeHTML(category.name)}">${escapeHTML(category.name)}</option>`
    ).join("");

    if (expenseCategories.some(category => category.name === selectedValue)) {
        select.value = selectedValue;
    }

}

function setupBudgetForm() {

    const form = document.getElementById("budgetForm");

    if (!form) {
        return;
    }

    form.addEventListener("submit", event => {
        event.preventDefault();

        clearFormErrors(form);

        const category = document.getElementById("budgetCategory").value;
        const limit = Number(document.getElementById("budgetLimit").value);

        if (!category || limit <= 0) {
            const field = !category
                ? document.getElementById("budgetCategory")
                : document.getElementById("budgetLimit");
            const message = "Choose an expense category and enter a budget limit greater than zero.";
            showFormError(field, message);
            ToastManager.show(message, "error");
            return;
        }

        createBudget(category, limit);
        form.reset();
        populateBudgetCategories();
        ToastManager.show("Budget saved successfully.", "success");
    });

}


/* =====================================================
   CATEGORY SEARCH
   ===================================================== */

function setupCategorySearch() {

    const searchInput = document.getElementById("categorySearch");

    if (!searchInput) {
        return;
    }

    searchInput.addEventListener("input", () => {

        const search = searchInput.value.trim().toLowerCase();

        const filtered = AppState.categories.filter(category =>
            category.name.toLowerCase().includes(search) ||
            category.description.toLowerCase().includes(search)
        );

        renderCategories(filtered);

    });

}


/* =====================================================
   CATEGORY MODAL
   ===================================================== */

function setupCategoryModal() {

    const modal = document.getElementById("categoryModal");
    const addButton = document.getElementById("addCategoryButton");
    const emptyAddButton = document.getElementById("emptyAddCategoryButton");
    const closeButton = document.getElementById("closeCategoryModal");
    const cancelButton = document.getElementById("cancelCategoryButton");
    const form = document.getElementById("categoryForm");

    if (!modal || !form) {
        return;
    }

    function openCategoryModal() {

        modal.classList.add("active");
        modal.setAttribute("aria-hidden", "false");

        // Reset form
        form.reset();
        form.dataset.editId = "";

        // Reset icon selection
        document.querySelectorAll(".category-icon-option").forEach(button => {
            button.classList.remove("active");
        });
        document.querySelector('.category-icon-option[data-icon="tag"]')?.classList.add("active");

        // Update modal title
        document.getElementById("categoryModalTitle").textContent = "Add Category";

        setTimeout(() => {
            document.getElementById("categoryName")?.focus();
        }, 100);

    }

    function closeCategoryModal() {

        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");
        form.reset();
        form.dataset.editId = "";

        document.querySelectorAll(".category-icon-option").forEach(button => {
            button.classList.remove("active");
        });

        document.querySelector('.category-icon-option[data-icon="tag"]')?.classList.add("active");

    }

    addButton?.addEventListener("click", openCategoryModal);
    emptyAddButton?.addEventListener("click", openCategoryModal);
    closeButton?.addEventListener("click", closeCategoryModal);
    cancelButton?.addEventListener("click", closeCategoryModal);

    modal.addEventListener("click", event => {
        if (event.target === modal) {
            closeCategoryModal();
        }
    });

    // Icon picker
    document.querySelectorAll(".category-icon-option").forEach(button => {

        button.addEventListener("click", () => {

            document.querySelectorAll(".category-icon-option").forEach(item => {
                item.classList.remove("active");
            });

            button.classList.add("active");

        });

    });

    // Form submission
    form.addEventListener("submit", event => {

        event.preventDefault();

        clearFormErrors(form);

        const name = document.getElementById("categoryName").value.trim();
        const description = document.getElementById("categoryDescription").value.trim();
        const selectedIcon = document.querySelector(".category-icon-option.active")?.dataset.icon || "tag";
        const editId = form.dataset.editId;

        if (!name) {
            const field = document.getElementById("categoryName");
            const message = "Please enter a category name.";
            showFormError(field, message);
            ToastManager.show(message, "error");
            field?.focus();
            return;
        }

        if (editId) {
            // Edit existing category
            updateCategory(Number(editId), {
                name,
                description,
                icon: selectedIcon
            });
            ToastManager.show("Category updated successfully.", "success");
        } else {
            createCategory({ name, description, icon: selectedIcon });
            ToastManager.show("Category created successfully.", "success");
        }

        closeCategoryModal();

    });

}


/* =====================================================
   CATEGORY ACTIONS
   ===================================================== */

function setupCategoryActions() {

    const grid = document.getElementById("categoriesList");

    if (!grid) {
        return;
    }

    grid.addEventListener("click", event => {

        const editButton = event.target.closest("[data-edit-category]");
        const deleteButton = event.target.closest("[data-delete-category]");

        if (editButton) {

            const id = Number(editButton.dataset.editCategory);
            const category = AppState.categories.find(item => item.id === id);

            if (!category) {
                return;
            }

            // Populate form
            document.getElementById("categoryName").value = category.name;
            document.getElementById("categoryDescription").value = category.description;

            document.querySelectorAll(".category-icon-option").forEach(button => {
                button.classList.toggle("active", button.dataset.icon === category.icon);
            });

            // Update modal title
            document.getElementById("categoryModalTitle").textContent = "Edit Category";

            // Open modal
            const modal = document.getElementById("categoryModal");
            modal.classList.add("active");
            modal.setAttribute("aria-hidden", "false");

            // Store edit ID
            document.getElementById("categoryForm").dataset.editId = id;

        }

        if (deleteButton) {

            const id = Number(deleteButton.dataset.deleteCategory);
            const categoryIndex = AppState.categories.findIndex(item => item.id === id);

            if (categoryIndex === -1) {
                return;
            }

            const category = AppState.categories[categoryIndex];

            const confirmed = window.confirm("Delete this category?");
            if (!confirmed) {
                return;
            }

            AppState.categories.splice(categoryIndex, 1);
            AppState.budgets = AppState.budgets.filter(budget => budget.category !== category.name);
            saveAppState();
            renderCategories();
            populateBudgetCategories();
            renderBudgets();

        }

    });

}

/* =====================================================
   SETTINGS NAVIGATION
   ===================================================== */

function setupSettingsNavigation() {

    const navItems = document.querySelectorAll(".settings-nav-item");
    const sections = document.querySelectorAll(".settings-section");

    if (!navItems.length) {
        return;
    }

    navItems.forEach(item => {

        item.addEventListener("click", () => {

            const section = item.dataset.settingsSection;

            navItems.forEach(nav => nav.classList.remove("active"));
            sections.forEach(sectionElement => sectionElement.classList.remove("active"));

            item.classList.add("active");

            document.getElementById(`settings-${section}`)?.classList.add("active");

        });

    });

}


/* =====================================================
   SETTINGS APPEARANCE
   ===================================================== */

function setupSettingsAppearance() {

    const darkMode = document.getElementById("settingsDarkMode");
    const compactLayout = document.getElementById("compactLayout");

    if (darkMode) {

        // Check if dark mode is currently active
        const isDark = document.documentElement.getAttribute("data-theme") === "dark";
        darkMode.checked = isDark;

        darkMode.addEventListener("change", () => {

            const enabled = darkMode.checked;

            // Use the existing ThemeManager to toggle
            if (typeof ThemeManager !== "undefined") {
                if (enabled) {
                    ThemeManager.setTheme("dark");
                } else {
                    ThemeManager.setTheme("light");
                }
                updateThemeIcon();
            }

            localStorage.setItem("expenseTrackerDarkMode", enabled);

        });

    }

    if (compactLayout) {

        compactLayout.checked = localStorage.getItem("expenseTrackerCompactLayout") === "true";

        // Apply compact layout on load
        if (compactLayout.checked) {
            document.body.classList.add("compact-layout");
        }

        compactLayout.addEventListener("change", () => {

            const enabled = compactLayout.checked;

            document.body.classList.toggle("compact-layout", enabled);

            localStorage.setItem("expenseTrackerCompactLayout", enabled);

        });

    }

}


/* =====================================================
   SETTINGS SAVE FEEDBACK
   ===================================================== */

function showSaveStatus(elementId, message = "Saved successfully") {

    const element = document.getElementById(elementId);

    if (!element) {
        return;
    }

    element.textContent = message;
    element.classList.add("show");

    setTimeout(() => {
        element.classList.remove("show");
    }, 2500);

}


/* =====================================================
   SETTINGS SAVING
   ===================================================== */

function setupSettingsSaving() {

    const profileButton = document.getElementById("saveProfileButton");
    const preferencesButton = document.getElementById("savePreferencesButton");

    profileButton?.addEventListener("click", () => {

        const name = document.getElementById("settingsName").value.trim();
        const email = document.getElementById("settingsEmail").value.trim();

        if (!name || !email) {
            showSaveStatus("profileSaveStatus", "Please complete all fields");
            return;
        }

        localStorage.setItem("expenseTrackerName", name);
        localStorage.setItem("expenseTrackerEmail", email);

        // Update avatar
        const avatar = document.getElementById("settingsAvatar");
        if (avatar && name) {
            const initials = name.split(" ").map(word => word[0]).join("").toUpperCase().slice(0, 2);
            avatar.textContent = initials || "U";
        }

        showSaveStatus("profileSaveStatus");

    });

    preferencesButton?.addEventListener("click", () => {

        localStorage.setItem("expenseTrackerCurrency", document.getElementById("currencySelect").value);
        localStorage.setItem("expenseTrackerDateFormat", document.getElementById("dateFormat").value);
        localStorage.setItem("expenseTrackerStartWeek", document.getElementById("startOfWeek").value);
        localStorage.setItem("expenseTrackerDecimals", document.getElementById("decimalPlaces").value);

        showSaveStatus("preferencesSaveStatus");

    });

}


/* =====================================================
   LOAD SETTINGS
   ===================================================== */

function loadSettings() {

    const name = localStorage.getItem("expenseTrackerName");
    const email = localStorage.getItem("expenseTrackerEmail");
    const currency = localStorage.getItem("expenseTrackerCurrency");
    const dateFormat = localStorage.getItem("expenseTrackerDateFormat");
    const startWeek = localStorage.getItem("expenseTrackerStartWeek");
    const decimals = localStorage.getItem("expenseTrackerDecimals");

    // Load name
    if (name) {
        const input = document.getElementById("settingsName");
        if (input) {
            input.value = name;
        }

        // Update avatar
        const avatar = document.getElementById("settingsAvatar");
        if (avatar && name) {
            const initials = name.split(" ").map(word => word[0]).join("").toUpperCase().slice(0, 2);
            avatar.textContent = initials || "U";
        }
    }

    // Load email
    if (email) {
        const input = document.getElementById("settingsEmail");
        if (input) {
            input.value = email;
        }
    }

    // Load currency
    if (currency) {
        const select = document.getElementById("currencySelect");
        if (select) {
            select.value = currency;
        }
    }

    // Load date format
    if (dateFormat) {
        const select = document.getElementById("dateFormat");
        if (select) {
            select.value = dateFormat;
        }
    }

    // Load start of week
    if (startWeek) {
        const select = document.getElementById("startOfWeek");
        if (select) {
            select.value = startWeek;
        }
    }

    // Load decimal places
    if (decimals) {
        const select = document.getElementById("decimalPlaces");
        if (select) {
            select.value = decimals;
        }
    }

    // Load compact layout
    const compact = localStorage.getItem("expenseTrackerCompactLayout") === "true";
    document.body.classList.toggle("compact-layout", compact);

    const compactInput = document.getElementById("compactLayout");
    if (compactInput) {
        compactInput.checked = compact;
    }

    // Load dark mode state
    const darkModeInput = document.getElementById("settingsDarkMode");
    if (darkModeInput) {
        const isDark = document.documentElement.getAttribute("data-theme") === "dark";
        darkModeInput.checked = isDark;
    }

}


/* =====================================================
   SECURITY ACTIONS
   ===================================================== */

function setupSecurityActions() {

    const logoutButton = document.getElementById("logoutButton");
    const deleteTransactionsButton = document.getElementById("deleteTransactionsButton");
    const deleteAccountButton = document.getElementById("deleteAccountButton");

    logoutButton?.addEventListener("click", () => {

        const confirmed = window.confirm("Are you sure you want to sign out?");

        if (!confirmed) {
            return;
        }

        /*
         * Backend authentication
         * will be connected here later.
         */

        alert("You have been signed out.");

    });

    deleteTransactionsButton?.addEventListener("click", () => {

        const confirmed = window.confirm(
            "This will permanently delete all transactions. Continue?"
        );

        if (!confirmed) {
            return;
        }

        alert("Demo mode: transaction deletion will be connected to the database later.");

    });

    deleteAccountButton?.addEventListener("click", () => {

        const confirmed = window.confirm(
            "This action cannot be undone. Delete your account?"
        );

        if (!confirmed) {
            return;
        }

        alert("Demo mode: account deletion will be connected to the backend later.");

    });

}


/* =====================================================
   CHANGE PASSWORD
   ===================================================== */

function setupChangePassword() {

    const changePasswordButton = document.getElementById("changePasswordButton");

    changePasswordButton?.addEventListener("click", () => {

        const currentPassword = prompt("Enter your current password:");
        if (currentPassword === null) return;

        if (!currentPassword) {
            alert("Please enter your current password.");
            return;
        }

        const newPassword = prompt("Enter your new password:");
        if (newPassword === null) return;

        if (newPassword.length < 6) {
            alert("New password must be at least 6 characters long.");
            return;
        }

        const confirmPassword = prompt("Confirm your new password:");
        if (confirmPassword === null) return;

        if (newPassword !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        alert("Demo mode: password change will be connected to the backend later.");

    });

}


/* =====================================================
   APPLICATION INITIALIZATION
   ===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeAppState();

        ThemeManager.initialize();

        setupNavigation();

        setupInteractiveControls();

        setupMobileMenu();

        setupThemeToggle();

        setupTransactionModal();

        setupTransactionForm();

        setupTransactionFilters();

        setupAnalyticsControls();

        setupDashboardChartControls();

        setupCategorySearch();

        setupCategoryModal();

        setupCategoryActions();

        populateBudgetCategories();

        setupBudgetForm();

        setupSettingsNavigation();

        setupSettingsAppearance();

        setupSettingsSaving();

        setupSecurityActions();

        loadSettings();

        updateThemeIcon();

        initializeIcons();

        createSpendingChart();

        createCategoryChart();

        renderTransactions();

        renderCategories();

        renderBudgets();

        updateDashboard();

        updateTransactionSummary();

        updateAnalytics();

        renderFinancialInsights();

        console.log(
            "Expense Tracker application initialized."
        );

    }
);
