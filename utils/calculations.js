const FinanceCalculator = {

    getTotalIncome(transactions) {

        return transactions
            .filter(
                transaction =>
                    transaction.type === "income"
            )
            .reduce(
                (total, transaction) =>
                    total + Number(transaction.amount),
                0
            );

    },


    getTotalExpenses(transactions) {

        return transactions
            .filter(
                transaction =>
                    transaction.type === "expense"
            )
            .reduce(
                (total, transaction) =>
                    total + Number(transaction.amount),
                0
            );

    },


    getBalance(transactions) {

        const income =
            this.getTotalIncome(
                transactions
            );


        const expenses =
            this.getTotalExpenses(
                transactions
            );


        return income - expenses;

    },


    getCategoryExpenses(
        transactions,
        category
    ) {

        return transactions
            .filter(
                transaction =>
                    transaction.type === "expense" &&
                    transaction.category === category
            )
            .reduce(
                (total, transaction) =>
                    total + Number(transaction.amount),
                0
            );

    },


    getBudgetPercentage(
        spent,
        limit
    ) {

        if (!limit || limit <= 0) {
            return 0;
        }


        return Math.min(
            (spent / limit) * 100,
            100
        );

    }

};