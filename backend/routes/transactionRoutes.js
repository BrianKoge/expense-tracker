const express = require("express");

const router =
    express.Router();


const {

    getTransactions,

    createTransaction,

    getTransactionById,

    updateTransaction,

    deleteTransaction

} = require(
    "../controllers/transactionController"
);


/* =====================================================
   TRANSACTION ROUTES
   ===================================================== */

router.get(
    "/",
    getTransactions
);


router.post(
    "/",
    createTransaction
);


router.get(
    "/:id",
    getTransactionById
);


router.put(
    "/:id",
    updateTransaction
);


router.delete(
    "/:id",
    deleteTransaction
);


module.exports = router;