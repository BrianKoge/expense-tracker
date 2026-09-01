/* =====================================================
   LOGIN PAGE
   ===================================================== */

const loginForm =
    document.getElementById(
        "loginForm"
    );

const loginButton =
    document.getElementById(
        "loginButton"
    );

const loginError =
    document.getElementById(
        "loginError"
    );


AuthManager.redirectIfAuthenticated();


/* =====================================================
   LOGIN FORM
   ===================================================== */

loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        loginError.hidden = true;


        const email =
            document
                .getElementById(
                    "loginEmail"
                )
                .value
                .trim();


        const password =
            document
                .getElementById(
                    "loginPassword"
                )
                .value;


        loginButton.disabled = true;


        loginButton.innerHTML =
            "<span>Signing in...</span>";


        try {

            const response =
                await apiRequest(
                    "/auth/login",
                    {

                        method: "POST",

                        handleUnauthorized: false,

                        body:
                            JSON.stringify({

                                email,

                                password

                            })

                    }
                );


            if (!response) {

                return;

            }


            const {
                token,
                user
            } = response.data;


            AuthManager.saveAuth(
                token,
                user
            );


            window.location.href =
                "index.html";


        } catch (error) {

            loginError.textContent =
                error.message;

            loginError.hidden = false;


            loginButton.disabled =
                false;


            loginButton.innerHTML =
                "<span>Sign In</span>";

        }

    }
);
