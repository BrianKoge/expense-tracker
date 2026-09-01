/* =====================================================
   TRANSACTION CONTROLLER
   ===================================================== */


const getTransactions = (
    req,
    res
) => {

    res.status(200).json({

        success: true,

        message:
            "Transaction endpoint is working.",

        data: []

    });

};


const createTransaction = (
    req,
    res
) => {

    res.status(201).json({

        success: true,

        message:
            "Create transaction endpoint is working.",

        data: req.body

    });

};


const getTransactionById = (
    req,
    res
) => {

    res.status(200).json({

        success: true,

        message:
            "Get transaction endpoint is working.",

        id: req.params.id

    });

};


const updateTransaction = (
    req,
    res
) => {

    res.status(200).json({

        success: true,

        message:
            "Update transaction endpoint is working.",

        id: req.params.id,

        data: req.body

    });

};


const deleteTransaction = (
    req,
    res
) => {

    res.status(200).json({

        success: true,

        message:
            "Delete transaction endpoint is working.",

        id: req.params.id

    });

};


module.exports = {

    getTransactions,

    createTransaction,

    getTransactionById,

    updateTransaction,

    deleteTransaction

};