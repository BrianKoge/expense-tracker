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
    transactionRoutes
);


/* =====================================================
   HEALTH CHECK
   ===================================================== */

app.get(
    "/api/health",
    (req, res) => {

        res.status(200).json({

            success: true,

            message:
                "Expense Tracker API is running.",

            timestamp:
                new Date().toISOString()

        });

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
   START SERVER
   ===================================================== */

app.listen(
    PORT,
    () => {

        console.log(
            `Expense Tracker API running on http://localhost:${PORT}`
        );

    }
);