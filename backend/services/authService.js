const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = require("../config/database");


/* =====================================================
   REGISTER USER
   ===================================================== */

const registerUser = async (
    name,
    email,
    password
) => {

    const normalizedEmail =
        email.trim().toLowerCase();


    /* -------------------------------------------------
       CHECK WHETHER EMAIL ALREADY EXISTS
       ------------------------------------------------- */

    const [existingUsers] =
        await db.execute(
            `
            SELECT id
            FROM users
            WHERE email = ?
            LIMIT 1
            `,
            [normalizedEmail]
        );


    if (existingUsers.length > 0) {

        const error =
            new Error(
                "An account with this email already exists."
            );

        error.statusCode = 409;

        throw error;

    }


    /* -------------------------------------------------
       HASH PASSWORD
       ------------------------------------------------- */

    const passwordHash =
        await bcrypt.hash(
            password,
            12
        );


    /* -------------------------------------------------
       CREATE USER
       ------------------------------------------------- */

    const [result] =
        await db.execute(
            `
            INSERT INTO users (
                name,
                email,
                password_hash
            )
            VALUES (?, ?, ?)
            `,
            [
                name.trim(),
                normalizedEmail,
                passwordHash
            ]
        );


    return {

        id: result.insertId,

        name: name.trim(),

        email: normalizedEmail

    };

};


/* =====================================================
   LOGIN USER
   ===================================================== */

const loginUser = async (
    email,
    password
) => {

    const normalizedEmail =
        email.trim().toLowerCase();


    /* -------------------------------------------------
       FIND USER
       ------------------------------------------------- */

    const [users] =
        await db.execute(
            `
            SELECT
                id,
                name,
                email,
                password_hash
            FROM users
            WHERE email = ?
            LIMIT 1
            `,
            [normalizedEmail]
        );


    if (users.length === 0) {

        const error =
            new Error(
                "Invalid email or password."
            );

        error.statusCode = 401;

        throw error;

    }


    const user = users[0];


    /* -------------------------------------------------
       VERIFY PASSWORD
       ------------------------------------------------- */

    const passwordMatches =
        await bcrypt.compare(
            password,
            user.password_hash
        );


    if (!passwordMatches) {

        const error =
            new Error(
                "Invalid email or password."
            );

        error.statusCode = 401;

        throw error;

    }


    /* -------------------------------------------------
       CREATE JWT
       ------------------------------------------------- */

    const token =
        jwt.sign(

            {
                userId: user.id,

                email: user.email

            },

            process.env.JWT_SECRET,

            {
                expiresIn:
                    process.env.JWT_EXPIRES_IN || "1d"
            }

        );


    return {

        token,

        user: {

            id: user.id,

            name: user.name,

            email: user.email

        }

    };

};


/* =====================================================
   CURRENT USER (SAFE PUBLIC FIELDS ONLY)
   ===================================================== */

const getUserById = async (userId) => {

    const [users] = await db.execute(
        "SELECT id, name, email FROM users WHERE id = ? LIMIT 1",
        [userId]
    );

    return users[0] || null;

};

/* =====================================================
   PASSWORD CHANGE
   ===================================================== */

const changePassword = async (userId, currentPassword, newPassword) => {

    const [users] = await db.execute(
        "SELECT password_hash FROM users WHERE id = ? LIMIT 1",
        [userId]
    );

    const user = users[0];
    const matches = user && await bcrypt.compare(currentPassword, user.password_hash);

    if (!matches) {
        const error = new Error("Your current password is incorrect.");
        error.statusCode = 400;
        throw error;
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await db.execute(
        "UPDATE users SET password_hash = ? WHERE id = ?",
        [passwordHash, userId]
    );
};


module.exports = {

    registerUser,

    loginUser,

    getUserById,

    changePassword

};
