/* =====================================================
   TRANSACTION SERVICE
   ===================================================== */

const getAllTransactions = async () => {

    return [];

};


const createTransaction = async (
    transactionData
) => {

    return transactionData;

};


const getTransactionById = async (
    transactionId
) => {

    return {

        id: transactionId

    };

};


const updateTransaction = async (
    transactionId,
    transactionData
) => {

    return {

        id: transactionId,

        ...transactionData

    };

};


const deleteTransaction = async (
    transactionId
) => {

    return {

        id: transactionId

    };

};


module.exports = {

    getAllTransactions,

    createTransaction,

    getTransactionById,

    updateTransaction,

    deleteTransaction

};