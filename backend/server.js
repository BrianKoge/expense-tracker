/* =====================================================
   EXPENSE TRACKER
   BACKEND SERVER
   ===================================================== */

const express = require("express");
const cors = require("cors"); 
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

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


const apiLimiter =
    rateLimit({

        windowMs:
            15 * 60 * 1000,

        max: 100,

        standardHeaders: true,

        legacyHeaders: false,

        message: {

            success: false,

            message:
                "Too many requests. Please try again later."

        }

    });



    const authLimiter =
    rateLimit({

        windowMs:
            15 * 60 * 1000,

        max: 10,

        standardHeaders: true,

        legacyHeaders: false,

        message: {

            success: false,

            message:
                "Too many authentication attempts. Please try again later."

        }

    });
/* =====================================================
   APPLICATION
   ===================================================== */

const app = express();

const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET must be configured before starting the API.");
}


/* =====================================================
   MIDDLEWARE
   ===================================================== */

app.use(
    helmet()
);

app.use(
    cors({
        origin: process.env.FRONTEND_URL
    })
);

app.use(
    express.json({
        limit: "10kb"
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "10kb"
    })
);

app.use(
    "/api",
    apiLimiter
);



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
    authLimiter,
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

app.use((err, req, res, next) => {
    console.error("Server error:", err);

    const statusCode = Number.isInteger(err.statusCode)
        ? err.statusCode
        : 500;

    res.status(statusCode).json({
        success: false,
        message: statusCode >= 500
            ? "Unable to complete your request. Please try again later."
            : err.message
    });
});


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
