const CurrencyManager = {

    getCurrency() {

        return StorageManager.get(
            "expenseTrackerCurrency",
            "KES"
        );

    },


    format(amount) {

        const currency =
            this.getCurrency();


        return new Intl.NumberFormat(
            "en-KE",
            {
                style: "currency",
                currency: currency,
                maximumFractionDigits: 0
            }
        ).format(amount);

    }

};