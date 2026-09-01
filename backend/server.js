/* =====================================================
   EXPENSE TRACKER
   BACKEND SERVER
   ===================================================== */

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const transactionRoutes = require(
    "./routes/transactionRoutes"
);

const authRoutes =require("./routes/authRoutes");

const {authenticateToken} = require(
    "./middleware/authMiddleware"
);

const db = require(
    "./config/database"
);


/* =====================================================
   APPLICATION
   ===================================================== */

const app = express();

const PORT = process.env.PORT || 5000;


/* =====================================================
   MIDDLEWARE
   ===================================================== */

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));


/* =====================================================
   API ROUTES
   ===================================================== */

app.use(
    "/api/transactions",
    authenticateToken,
    transactionRoutes
);


app.use(
    "/api/auth",
    authRoutes
);


/* =====================================================
   HEALTH CHECK
   ===================================================== */

app.get(
    "/api/health",
    async (req, res) => {

        try {

            await db.query(
                "SELECT 1"
            );


            res.status(200).json({

                success: true,

                api: "online",

                database: "connected",

                message:
                    "Expense Tracker API is healthy."

            });

        } catch (error) {

            console.error(
                "Health check failed:",
                error.message
            );


            res.status(503).json({

                success: false,

                api: "online",

                database: "disconnected",

                message:
                    "Database connection unavailable."

            });

        }

    }
);


/* =====================================================
   ROOT ROUTE
   ===================================================== */

app.get(
    "/",
    (req, res) => {

        res.status(200).json({

            success: true,

            message:
                "Welcome to the Expense Tracker API."

        });

    }
);


/* =====================================================
   404 HANDLER
   ===================================================== */

app.use(
    (req, res) => {

        res.status(404).json({

            success: false,

            message:
                "API endpoint not found."

        });

    }
);


/* =====================================================
   ERROR HANDLER
   ===================================================== */

app.use(
    (err, req, res, next) => {

        console.error(
            "Server Error:",
            err
        );

        res.status(500).json({

            success: false,

            message:
                "Internal server error."

        });

    }
);


/* =====================================================
   DATABASE CONNECTION TEST
   ===================================================== */

async function testDatabaseConnection() {

    try {

        const connection =
            await db.getConnection();

        console.log(
            "MySQL database connected successfully."
        );

        connection.release();

    } catch (error) {

        console.error(
            "MySQL database connection failed:",
            error.message
        );

    }

}



/* =====================================================
   START SERVER
   ===================================================== */

testDatabaseConnection();


app.listen(
    PORT,
    () => {

        console.log(
            `Expense Tracker API running on http://localhost:${PORT}`
        );

    }
);