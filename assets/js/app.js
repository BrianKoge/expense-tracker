/* =====================================================
   EXPENSE TRACKER
   APPLICATION SHELL
   ===================================================== */


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
        createAnalyticsTrendChart();
        createAnalyticsCategoryChart();
        renderAnalyticsCategoryList();
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


    menuButton.addEventListener(
        "click",
        () => {

            const sidebar =
                document.querySelector(
                    ".sidebar"
                );


            if (sidebar) {

                sidebar.classList.toggle(
                    "mobile-open"
                );

            }


            console.log(
                "Mobile menu clicked"
            );

        }
    );

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

function createSpendingChart() {

    const canvas =
        document.getElementById(
            "spendingChart"
        );


    if (!canvas || typeof Chart === "undefined") {
        return;
    }


    new Chart(canvas, {

        type: "line",

        data: {

            labels: [
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug"
            ],

            datasets: [

                {

                    label: "Expenses",

                    data: [
                        18500,
                        22100,
                        19800,
                        24500,
                        21700,
                        25235
                    ],

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


    new Chart(canvas, {

        type: "doughnut",

        data: {

            labels: [
                "Food",
                "Transport",
                "Shopping",
                "Entertainment",
                "Other"
            ],

            datasets: [

                {

                    data: [
                        6584,
                        4250,
                        5100,
                        2100,
                        7201
                    ],

                    backgroundColor: [
                        "#f97316",
                        "#7c3aed",
                        "#ec4899",
                        "#3b82f6",
                        "#94a3b8"
                    ],

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

function setupTransactionModal() {

    const modal =
        document.getElementById(
            "transactionModal"
        );

    const openButtons =
        document.querySelectorAll(
            "#addTransactionButton, #transactionsAddButton, .mobile-add-button"
        );

    const closeButton =
        document.getElementById(
            "closeTransactionModal"
        );

    const cancelButton =
        document.getElementById(
            "cancelTransaction"
        );

    const form =
        document.getElementById(
            "transactionForm"
        );


    if (
        !modal ||
        !openButtons ||
        openButtons.length === 0 ||
        !closeButton ||
        !cancelButton ||
        !form
    ) {
        console.warn("Transaction modal elements not found");
        return;
    }


    /* -----------------------------------------
       OPEN MODAL
       ----------------------------------------- */

    function openModal() {

        modal.classList.add("active");

        modal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "modal-open"
        );


        setDefaultTransactionDate();


        setTimeout(() => {

            document
                .getElementById(
                    "transactionAmount"
                )
                ?.focus();

        }, 200);

    }


    /* -----------------------------------------
       CLOSE MODAL
       ----------------------------------------- */

    function closeModal() {

        modal.classList.remove("active");

        modal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "modal-open"
        );

    }


    /* -----------------------------------------
       OPEN BUTTONS
       ----------------------------------------- */

    openButtons.forEach(button => {

        button.addEventListener(
            "click",
            openModal
        );

    });

    /* -----------------------------------------
       CLOSE BUTTON
       ----------------------------------------- */

    closeButton.addEventListener(
        "click",
        closeModal
    );


    /* -----------------------------------------
       CANCEL BUTTON
       ----------------------------------------- */

    cancelButton.addEventListener(
        "click",
        closeModal
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

                closeModal();

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

                closeModal();

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


    /* -----------------------------------------
       FORM SUBMISSION
       ----------------------------------------- */

    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const formData =
                new FormData(form);


            const transaction = {

                type:
                    formData.get(
                        "transactionType"
                    ),

                amount:
                    Number(
                        formData.get(
                            "amount"
                        )
                    ),

                category:
                    formData.get(
                        "category"
                    ),

                description:
                    formData.get(
                        "description"
                    ),

                date:
                    formData.get(
                        "date"
                    )

            };


            console.log(
                "New transaction:",
                transaction
            );


            if (
                !transaction.amount ||
                transaction.amount <= 0
            ) {

                alert(
                    "Please enter a valid amount."
                );

                return;

            }


            if (!transaction.category) {
                alert("Please select a category.");
                return;
            }


            if (!transaction.date) {
                alert("Please select a date.");
                return;
            }


            // Add the new transaction to the transactions array
            const newTransaction = {
                id: transactions.length + 1,
                title: transaction.description || "Untitled transaction",
                category: transaction.category,
                date: transaction.date,
                type: transaction.type,
                amount: transaction.amount,
                icon: getIconForCategory(transaction.category)
            };
            
            transactions.push(newTransaction);
            
            // Re-render transactions table
            renderTransactions();
            
            // Show success message
            alert(
                "Transaction saved successfully!"
            );


            form.reset();


            typeInput.value =
                "expense";


            typeButtons.forEach(
                button => {

                    button.classList.toggle(
                        "active",
                        button.dataset.type ===
                            "expense"
                    );

                }
            );


            closeModal();

        }
    );

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
   TRANSACTION DATA
   ===================================================== */

const transactions = [

    {
        id: 1,
        title: "Lunch with friends",
        category: "food",
        date: "2026-08-14",
        type: "expense",
        amount: 450,
        icon: "utensils"
    },

    {
        id: 2,
        title: "Uber to campus",
        category: "transport",
        date: "2026-08-13",
        type: "expense",
        amount: 750,
        icon: "car-front"
    },

    {
        id: 3,
        title: "New shoes",
        category: "shopping",
        date: "2026-08-12",
        type: "expense",
        amount: 3500,
        icon: "shopping-bag"
    },

    {
        id: 4,
        title: "Monthly salary",
        category: "other",
        date: "2026-08-01",
        type: "income",
        amount: 85000,
        icon: "briefcase-business"
    },

    {
        id: 5,
        title: "Gaming",
        category: "entertainment",
        date: "2026-07-30",
        type: "expense",
        amount: 1200,
        icon: "gamepad-2"
    },

    {
        id: 6,
        title: "Electricity bill",
        category: "bills",
        date: "2026-07-28",
        type: "expense",
        amount: 3200,
        icon: "zap"
    },

    {
        id: 7,
        title: "Groceries",
        category: "food",
        date: "2026-07-25",
        type: "expense",
        amount: 4250,
        icon: "shopping-cart"
    },

    {
        id: 8,
        title: "Freelance project",
        category: "other",
        date: "2026-07-22",
        type: "income",
        amount: 15000,
        icon: "laptop"
    }

];

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

function renderTransactions(data = transactions) {

    const tableBody =
        document.getElementById(
            "transactionsTableBody"
        );

    const emptyState =
        document.getElementById(
            "transactionsEmpty"
        );

    const resultCount =
        document.getElementById(
            "transactionResultCount"
        );


    if (
        !tableBody ||
        !emptyState ||
        !resultCount
    ) {
        return;
    }


    tableBody.innerHTML = "";


    if (data.length === 0) {

        emptyState.classList.add(
            "visible"
        );

        resultCount.textContent =
            "Showing 0 transactions";

        return;

    }


    emptyState.classList.remove(
        "visible"
    );


    data.forEach(transaction => {

        const row =
            document.createElement("tr");


        const formattedAmount =
            new Intl.NumberFormat(
                "en-KE",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            ).format(
                transaction.amount
            );


        const formattedDate =
            new Intl.DateTimeFormat(
                "en-GB",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            ).format(
                new Date(
                    transaction.date +
                    "T00:00:00"
                )
            );


        const amountPrefix =
            transaction.type === "income"
                ? "+"
                : "-";


        const typeLabel =
            transaction.type === "income"
                ? "Income"
                : "Expense";


        row.innerHTML = `

            <td>

                <div class="table-transaction">

                    <div
                        class="table-transaction-icon
                        ${getTransactionIconClass(
                            transaction.category
                        )}"
                    >

                        <i
                            data-lucide="${transaction.icon}"
                        ></i>

                    </div>


                    <div
                        class="table-transaction-information"
                    >

                        <strong>
                            ${escapeHTML(
                                transaction.title
                            )}
                        </strong>

                        <span>
                            Transaction #${transaction.id}
                        </span>

                    </div>

                </div>

            </td>


            <td>

                <span class="category-badge">

                    ${
                        categoryLabels[
                            transaction.category
                        ] ||
                        transaction.category
                    }

                </span>

            </td>


            <td>
                ${formattedDate}
            </td>


            <td>

                <span
                    class="type-badge
                    ${
                        transaction.type ===
                        "income"
                            ? "type-income"
                            : "type-expense"
                    }"
                >

                    <i
                        data-lucide="${
                            transaction.type ===
                            "income"
                                ? "arrow-down-left"
                                : "arrow-up-right"
                        }"
                    ></i>

                    ${typeLabel}

                </span>

            </td>


            <td
                class="amount-value
                ${
                    transaction.type === "income"
                        ? "amount-income"
                        : "amount-expense"
                }"
            >

                ${amountPrefix}
                KES ${formattedAmount}

            </td>


            <td>

                <div class="table-actions">

                    <button
                        class="table-action-button"
                        title="Edit transaction"
                        data-edit-id="${transaction.id}"
                    >

                        <i data-lucide="pencil"></i>

                    </button>


                    <button
                        class="table-action-button delete"
                        title="Delete transaction"
                        data-delete-id="${transaction.id}"
                    >

                        <i data-lucide="trash-2"></i>

                    </button>

                </div>

            </td>

        `;


        tableBody.appendChild(row);

    });


    resultCount.textContent =
        `Showing ${data.length} transaction${
            data.length === 1 ? "" : "s"
        }`;


    // Add event listeners for edit and delete buttons
    const editButtons = tableBody.querySelectorAll('[data-edit-id]');
    const deleteButtons = tableBody.querySelectorAll('[data-delete-id]');
    
    editButtons.forEach(button => {
        button.addEventListener('click', () => {
            const id = Number(button.dataset.editId);
            editTransaction(id);
        });
    });
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const id = Number(button.dataset.deleteId);
            deleteTransaction(id);
        });
    });


    initializeIcons();

}

/* =====================================================
   EDIT TRANSACTION
   ===================================================== */

function editTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    
    if (!transaction) return;
    
    console.log("Edit transaction:", transaction);
    
    // Open modal with transaction data
    const modal = document.getElementById("transactionModal");
    const form = document.getElementById("transactionForm");
    
    if (!modal || !form) return;
    
    // Populate form with transaction data
    document.getElementById("transactionType").value = transaction.type;
    document.getElementById("transactionAmount").value = transaction.amount;
    document.getElementById("transactionCategory").value = transaction.category;
    document.getElementById("transactionDescription").value = transaction.title;
    document.getElementById("transactionDate").value = transaction.date;
    
    // Update type selector buttons
    document.querySelectorAll(".transaction-type").forEach(button => {
        button.classList.toggle("active", button.dataset.type === transaction.type);
    });
    
    // Open modal
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    
    // Store transaction ID for updating
    form.dataset.editId = id;
}

/* =====================================================
   DELETE TRANSACTION
   ===================================================== */

function deleteTransaction(id) {
    const index = transactions.findIndex(t => t.id === id);
    
    if (index === -1) return;
    
    if (confirm("Are you sure you want to delete this transaction?")) {
        transactions.splice(index, 1);
        renderTransactions();
        console.log("Transaction deleted:", id);
    }
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

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;

}

/* =====================================================
   TRANSACTION FILTERS
   ===================================================== */

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

    const resetButton =
        document.getElementById(
            "clearTransactionFilters"
        );


    if (
        !searchInput ||
        !typeFilter ||
        !categoryFilter ||
        !resetButton
    ) {
        return;
    }


    function applyFilters() {

        const search =
            searchInput.value
                .trim()
                .toLowerCase();


        const type =
            typeFilter.value;


        const category =
            categoryFilter.value;


        const filtered =
            transactions.filter(
                transaction => {

                    const matchesSearch =
                        transaction.title
                            .toLowerCase()
                            .includes(search);


                    const matchesType =
                        type === "all" ||
                        transaction.type === type;


                    const matchesCategory =
                        category === "all" ||
                        transaction.category === category;


                    return (
                        matchesSearch &&
                        matchesType &&
                        matchesCategory
                    );

                }
            );


        renderTransactions(filtered);

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


    resetButton.addEventListener(
        "click",
        () => {

            searchInput.value = "";

            typeFilter.value = "all";

            categoryFilter.value = "all";

            renderTransactions();

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
   CATEGORY DATA
   ===================================================== */

const categories = [

    {
        id: 1,
        name: "Food",
        description: "Meals, groceries and dining",
        icon: "utensils",
        spent: 8450,
        transactions: 12
    },

    {
        id: 2,
        name: "Transport",
        description: "Matatu, fuel and ride-hailing",
        icon: "car-front",
        spent: 5200,
        transactions: 8
    },

    {
        id: 3,
        name: "Shopping",
        description: "Clothes, electronics and personal items",
        icon: "shopping-bag",
        spent: 4200,
        transactions: 5
    },

    {
        id: 4,
        name: "Entertainment",
        description: "Games, movies and leisure",
        icon: "gamepad-2",
        spent: 3185,
        transactions: 6
    },

    {
        id: 5,
        name: "Bills & Utilities",
        description: "Electricity, internet and subscriptions",
        icon: "receipt-text",
        spent: 4200,
        transactions: 4
    },

    {
        id: 6,
        name: "Health",
        description: "Medical, pharmacy and wellness",
        icon: "heart-pulse",
        spent: 1800,
        transactions: 2
    },

    {
        id: 7,
        name: "Education",
        description: "Books, courses and school expenses",
        icon: "book-open",
        spent: 2500,
        transactions: 3
    },

    {
        id: 8,
        name: "Other",
        description: "Miscellaneous expenses",
        icon: "tag",
        spent: 1700,
        transactions: 3
    }

];


/* =====================================================
   RENDER CATEGORIES
   ===================================================== */

function renderCategories(data = categories) {

    const grid = document.getElementById("categoriesGrid");
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
        ...categories.map(category => category.spent)
    );

    data.forEach(category => {

        const card = document.createElement("article");
        card.className = "category-card";

        const percentage = highestSpending > 0
            ? Math.round((category.spent / highestSpending) * 100)
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
                    ${category.transactions}
                    transaction${category.transactions === 1 ? "" : "s"}
                </span>

                <strong>
                    KES ${category.spent.toLocaleString()}
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
   CATEGORY SEARCH
   ===================================================== */

function setupCategorySearch() {

    const searchInput = document.getElementById("categorySearch");

    if (!searchInput) {
        return;
    }

    searchInput.addEventListener("input", () => {

        const search = searchInput.value.trim().toLowerCase();

        const filtered = categories.filter(category =>
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

        const name = document.getElementById("categoryName").value.trim();
        const description = document.getElementById("categoryDescription").value.trim();
        const selectedIcon = document.querySelector(".category-icon-option.active")?.dataset.icon || "tag";
        const editId = form.dataset.editId;

        if (!name) {
            alert("Please enter a category name.");
            return;
        }

        if (editId) {
            // Edit existing category
            const category = categories.find(c => c.id === Number(editId));
            if (category) {
                category.name = name;
                category.description = description || "Custom category";
                category.icon = selectedIcon;
            }
        } else {
            // Add new category
            const newCategory = {
                id: Date.now(),
                name: name,
                description: description || "Custom category",
                icon: selectedIcon,
                spent: 0,
                transactions: 0
            };

            categories.push(newCategory);
        }

        renderCategories();
        closeCategoryModal();

    });

}


/* =====================================================
   CATEGORY ACTIONS
   ===================================================== */

function setupCategoryActions() {

    const grid = document.getElementById("categoriesGrid");

    if (!grid) {
        return;
    }

    grid.addEventListener("click", event => {

        const editButton = event.target.closest("[data-edit-category]");
        const deleteButton = event.target.closest("[data-delete-category]");

        if (editButton) {

            const id = Number(editButton.dataset.editCategory);
            const category = categories.find(item => item.id === id);

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
            const categoryIndex = categories.findIndex(item => item.id === id);

            if (categoryIndex === -1) {
                return;
            }

            const confirmed = window.confirm("Delete this category?");
            if (!confirmed) {
                return;
            }

            categories.splice(categoryIndex, 1);
            renderCategories();

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

        ThemeManager.initialize();

        setupNavigation();

        setupMobileMenu();

        setupThemeToggle();

        setupTransactionModal();

        setupTransactionFilters();

        setupCategorySearch();

        setupCategoryModal();

        setupCategoryActions();

        setupSettingsNavigation();

        setupSettingsAppearance();

        setupSettingsSaving();

        setupSecurityActions();

        setupChangePassword();

        loadSettings();

        updateThemeIcon();

        initializeIcons();

        createSpendingChart();

        createCategoryChart();

        renderTransactions();

        renderCategories();

        console.log(
            "Expense Tracker application initialized."
        );

    }
);