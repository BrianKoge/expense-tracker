const db = require(
    "../config/database"
);


/* =====================================================
   GET ALL TRANSACTIONS
   ===================================================== */

const getAllTransactions = async () => {

    const [rows] = await db.query(`

        SELECT

            t.id,

            t.title,

            t.amount,

            t.type,

            t.transaction_date,

            t.description,

            t.category_id,

            c.name AS category,

            c.icon AS category_icon,

            t.created_at,

            t.updated_at

        FROM transactions t

        LEFT JOIN categories c
            ON t.category_id = c.id

        ORDER BY
            t.transaction_date DESC,
            t.created_at DESC

    `);


    return rows;

};


/* =====================================================
   CREATE TRANSACTION
   ===================================================== */

const createTransaction = async (
    transactionData
) => {

    const {

        title,

        amount,

        category_id,

        type,

        transaction_date,

        description

    } = transactionData;


    const [result] = await db.execute(`

        INSERT INTO transactions (

            title,

            amount,

            category_id,

            type,

            transaction_date,

            description

        )

        VALUES (?, ?, ?, ?, ?, ?)

    `, [

        title,

        amount,

        category_id || null,

        type,

        transaction_date,

        description || null

    ]);


    return {

        id: result.insertId,

        ...transactionData

    };

};


/* =====================================================
   GET TRANSACTION BY ID
   ===================================================== */

const getTransactionById = async (
    transactionId
) => {

    const [rows] = await db.execute(`

        SELECT

            t.id,

            t.title,

            t.amount,

            t.type,

            t.transaction_date,

            t.description,

            t.category_id,

            c.name AS category,

            c.icon AS category_icon

        FROM transactions t

        LEFT JOIN categories c
            ON t.category_id = c.id

        WHERE t.id = ?

        LIMIT 1

    `, [transactionId]);


    return rows[0] || null;

};


/* =====================================================
   UPDATE TRANSACTION
   ===================================================== */

const updateTransaction = async (
    transactionId,
    transactionData
) => {

    const {

        title,

        amount,

        category_id,

        type,

        transaction_date,

        description

    } = transactionData;


    const [result] = await db.execute(`

        UPDATE transactions

        SET

            title = ?,

            amount = ?,

            category_id = ?,

            type = ?,

            transaction_date = ?,

            description = ?

        WHERE id = ?

    `, [

        title,

        amount,

        category_id || null,

        type,

        transaction_date,

        description || null,

        transactionId

    ]);


    if (
        result.affectedRows === 0
    ) {

        return null;

    }


    return getTransactionById(
        transactionId
    );

};


/* =====================================================
   DELETE TRANSACTION
   ===================================================== */

const deleteTransaction = async (
    transactionId
) => {

    const [result] = await db.execute(`

        DELETE FROM transactions

        WHERE id = ?

    `, [transactionId]);


    return result.affectedRows > 0;

};


module.exports = {

    getAllTransactions,

    createTransaction,

    getTransactionById,

    updateTransaction,

    deleteTransaction

};