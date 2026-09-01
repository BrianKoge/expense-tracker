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
            !name ||
            !email ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Name, email and password are required."

            });

        }


        if (password.length < 8) {

            return res.status(400).json({

                success: false,

                message:
                    "Password must be at least 8 characters long."

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
            !email ||
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

            message:
                error.message || "Internal server error."

        });

    }

};


module.exports = {

    register,

    login

};