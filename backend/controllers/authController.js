const authService =
    require("../services/authService");


/* =====================================================
   REGISTER
   ===================================================== */

const register = async (
    req,
    res,
    next
) => {

    try {

        const {
            name,
            email,
            password
        } = req.body;


        /* ---------------------------------------------
           VALIDATION
           --------------------------------------------- */

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            !name.trim() ||
            !email.trim() ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Name, email and password are required."

            });

        }


        if (
            password.length < 8
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Password must be at least 8 characters long."

            });

        }

        
        if (password.length > 128) {

        return res.status(400).json({

            success: false,

            message:
                "Password must not exceed 128 characters."

        });

            }

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailPattern.test(email.trim())) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please provide a valid email address."

                });

            }



        const user =
            await authService.registerUser(
                name,
                email,
                password
            );


        res.status(201).json({

            success: true,

            message:
                "Account created successfully.",

            data: user

        });

    } catch (error) {

        next(error);

    }

};


/* =====================================================
   LOGIN
   ===================================================== */

const login = async (
    req,
    res,
    next
) => {

    try {

        const {
            email,
            password
        } = req.body;


        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and password are required."

            });

        }


        const result =
            await authService.loginUser(
                email,
                password
            );


        res.status(200).json({

            success: true,

            message:
                "Login successful.",

            data: result

        });

    } catch (error) {

        const statusCode = error.statusCode || 500;

        res.status(statusCode).json({

            success: false,

            message: statusCode >= 500
                ? "Unable to sign in. Please try again later."
                : error.message

        });

    }

};

/* =====================================================
   CURRENT AUTHENTICATED USER
   ===================================================== */

const getCurrentUser = async (req, res, next) => {
    try {
        const user = await authService.getUserById(req.user.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token."
            });
        }

        res.status(200).json({
            success: true,
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

/* =====================================================
   CHANGE PASSWORD
   ===================================================== */

const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (
            typeof currentPassword !== "string" ||
            typeof newPassword !== "string" ||
            !currentPassword ||
            newPassword.length < 8 ||
            newPassword.length > 128
        ) {
            return res.status(400).json({
                success: false,
                message: "Use a new password between 8 and 128 characters."
            });
        }

        await authService.changePassword(
            req.user.id,
            currentPassword,
            newPassword
        );

        res.status(200).json({
            success: true,
            message: "Password changed successfully."
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {

    register,

    login,

    getCurrentUser,

    changePassword

};
