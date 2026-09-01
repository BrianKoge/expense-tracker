const transactionService =
    require(
        "../services/transactionService"
    );


/* =====================================================
   GET ALL TRANSACTIONS
   ===================================================== */

const getTransactions = async (
    req,
    res,
    next
) => {

    try {

        const transactions =
            await transactionService
                .getAllTransactions();


        res.status(200).json({

            success: true,

            data: transactions

        });

    } catch (error) {

        next(error);

    }

};


/* =====================================================
   CREATE TRANSACTION
   ===================================================== */

const createTransaction = async (
    req,
    res,
    next
) => {

    try {

        const transaction =
            await transactionService
                .createTransaction(
                    req.body
                );


        res.status(201).json({

            success: true,

            message:
                "Transaction created successfully.",

            data: transaction

        });

    } catch (error) {

        next(error);

    }

};


/* =====================================================
   GET TRANSACTION
   ===================================================== */

const getTransactionById = async (
    req,
    res,
    next
) => {

    try {

        const transaction =
            await transactionService
                .getTransactionById(
                    req.params.id
                );


        if (!transaction) {

            return res.status(404).json({

                success: false,

                message:
                    "Transaction not found."

            });

        }


        res.status(200).json({

            success: true,

            data: transaction

        });

    } catch (error) {

        next(error);

    }

};


/* =====================================================
   UPDATE TRANSACTION
   ===================================================== */

const updateTransaction = async (
    req,
    res,
    next
) => {

    try {

        const transaction =
            await transactionService
                .updateTransaction(
                    req.params.id,
                    req.body
                );


        if (!transaction) {

            return res.status(404).json({

                success: false,

                message:
                    "Transaction not found."

            });

        }


        res.status(200).json({

            success: true,

            message:
                "Transaction updated successfully.",

            data: transaction

        });

    } catch (error) {

        next(error);

    }

};


/* =====================================================
   DELETE TRANSACTION
   ===================================================== */

const deleteTransaction = async (
    req,
    res,
    next
) => {

    try {

        const deleted =
            await transactionService
                .deleteTransaction(
                    req.params.id
                );


        if (!deleted) {

            return res.status(404).json({

                success: false,

                message:
                    "Transaction not found."

            });

        }


        res.status(200).json({

            success: true,

            message:
                "Transaction deleted successfully."

        });

    } catch (error) {

        next(error);

    }

};


module.exports = {

    getTransactions,

    createTransaction,

    getTransactionById,

    updateTransaction,

    deleteTransaction

};