const express = require("express");

const router =
    express.Router();


const {
    register,
    login,
    getCurrentUser,
    changePassword
} = require(
    "../controllers/authController"
);

const { authenticateToken } = require("../middleware/authMiddleware");


/* =====================================================
   AUTH ROUTES
   ===================================================== */

router.post(
    "/register",
    register
);


router.post(
    "/login",
    login
);

router.get("/me", authenticateToken, getCurrentUser);

router.put("/password", authenticateToken, changePassword);


module.exports = router;
