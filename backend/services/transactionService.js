const db = require(
    "../config/database"
);


/* =====================================================
   GET ALL TRANSACTIONS
   ===================================================== */

const getAllTransactions = async (
    userId
) => {

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

        WHERE t.user_id = ?

        ORDER BY
            t.transaction_date DESC,
            t.created_at DESC

    `, [userId]);


    return rows;

};

/* =====================================================
   CREATE TRANSACTION
   ===================================================== */

const createTransaction = async (
    transactionData,
    userId
) => {

    const {

        title,
        amount,
        category_id,
        type,
        transaction_date,
        description

    } = transactionData;


    const [result] =
        await db.execute(`

            INSERT INTO transactions (

                user_id,
                title,
                amount,
                category_id,
                type,
                transaction_date,
                description

            )

            VALUES (?, ?, ?, ?, ?, ?, ?)

        `, [

            userId,
            title,
            amount,
            category_id || null,
            type,
            transaction_date,
            description || null

        ]);


    return {

        id: result.insertId,

        user_id: userId,

        title,

        amount,

        category_id:
            category_id || null,

        type,

        transaction_date,

        description:
            description || null

    };

};


/* =====================================================
   GET TRANSACTION BY ID
   ===================================================== */

const getTransactionById = async (
    transactionId,
    userId
) => {

    const [rows] =
        await db.execute(`

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

            WHERE
                t.id = ?
                AND t.user_id = ?

            LIMIT 1

        `, [
            transactionId,
            userId
        ]);


    return rows[0] || null;

};


/* =====================================================
   UPDATE TRANSACTION
   ===================================================== */

const updateTransaction = async (
    transactionId,
    transactionData,
    userId
) => {

    const {

        title,

        amount,

        category_id,

        type,

        transaction_date,

        description

    } = transactionData;


        const [result] =
            await db.execute(`

                UPDATE transactions

                SET

                    title = ?,
                    amount = ?,
                    category_id = ?,
                    type = ?,
                    transaction_date = ?,
                    description = ?

                WHERE
                    id = ?
                    AND user_id = ?

            `, [

                title,
                amount,
                category_id || null,
                type,
                transaction_date,
                description || null,
                transactionId,
                userId

            ]);


    if (
        result.affectedRows === 0
    ) {

        return null;

    }


    return getTransactionById(transactionId, userId);

};


/* =====================================================
   DELETE TRANSACTION
   ===================================================== */

const deleteTransaction = async (
    transactionId,
    userId
) => {

    const [result] =
    await db.execute(`

        DELETE FROM transactions

        WHERE
            id = ?
            AND user_id = ?

    `, [
        transactionId,
        userId
    ]);


    return result.affectedRows > 0;

};


module.exports = {

    getAllTransactions,

    createTransaction,

    getTransactionById,

    updateTransaction,

    deleteTransaction

};
