/* =====================================================
   REGISTRATION PAGE
   ===================================================== */

const registerForm =
    document.getElementById(
        "registerForm"
    );

const registerButton =
    document.getElementById(
        "registerButton"
    );

const registerError =
    document.getElementById(
        "registerError"
    );


AuthManager.redirectIfAuthenticated();


/* =====================================================
   REGISTRATION
   ===================================================== */

registerForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        registerError.hidden = true;


        const name =
            document
                .getElementById(
                    "registerName"
                )
                .value
                .trim();


        const email =
            document
                .getElementById(
                    "registerEmail"
                )
                .value
                .trim();


        const password =
            document
                .getElementById(
                    "registerPassword"
                )
                .value;


        const confirmPassword =
            document
                .getElementById(
                    "confirmPassword"
                )
                .value;


        if (
            password !== confirmPassword
        ) {

            registerError.textContent =
                "Passwords do not match.";

            registerError.hidden =
                false;

            return;

        }


        if (password.length < 8) {

            registerError.textContent =
                "Password must be at least 8 characters.";

            registerError.hidden =
                false;

            return;

        }


        registerButton.disabled =
            true;


        registerButton.innerHTML =
            "<span>Creating account...</span>";


        try {

            await apiRequest(
                "/auth/register",
                {

                    method: "POST",

                    body:
                        JSON.stringify({

                            name,

                            email,

                            password

                        })

                }
            );


            window.location.href =
                "login.html";


        } catch (error) {

            registerError.textContent =
                error.message;

            registerError.hidden =
                false;


            registerButton.disabled =
                false;


            registerButton.innerHTML =
                "<span>Create Account</span>";

        }

    }
);
