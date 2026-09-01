/* =====================================================
   AUTHENTICATION MANAGER
   ===================================================== */

const API_BASE_URL =
    "http://localhost:5000/api";


/* =====================================================
   AUTH STORAGE KEYS
   ===================================================== */

const AUTH_TOKEN_KEY =
    "expense_tracker_token";

const AUTH_USER_KEY =
    "expense_tracker_user";

/* =====================================================
   AUTH MANAGER
   ===================================================== */

const AuthManager = {

    /* -------------------------------------------------
       GET TOKEN
       ------------------------------------------------- */

    getToken() {

        return localStorage.getItem(
            AUTH_TOKEN_KEY
        );

    },


    /* -------------------------------------------------
       GET USER
       ------------------------------------------------- */

    getUser() {

        const user =
            localStorage.getItem(
                AUTH_USER_KEY
            );


        if (!user) {

            return null;

        }


        try {

            return JSON.parse(user);

        } catch (error) {

            console.error(
                "Unable to read stored user:",
                error
            );

            return null;

        }

    },


    /* -------------------------------------------------
       CHECK AUTHENTICATION
       ------------------------------------------------- */

    isAuthenticated() {

        return Boolean(
            this.getToken() &&
            this.getUser()
        );

    },


    /* -------------------------------------------------
       STORE LOGIN DATA
       ------------------------------------------------- */

    saveAuth(
        token,
        user
    ) {

        localStorage.setItem(
            AUTH_TOKEN_KEY,
            token
        );


        localStorage.setItem(
            AUTH_USER_KEY,
            JSON.stringify(user)
        );

    },


    /* -------------------------------------------------
       LOGOUT
       ------------------------------------------------- */

    logout() {

        localStorage.removeItem(
            AUTH_TOKEN_KEY
        );

        localStorage.removeItem(
            AUTH_USER_KEY
        );


        window.location.replace(
            "login.html"
        );

    },

    async requireAuthentication() {

        if (!this.isAuthenticated()) {

            this.logout();

            return false;

        }

        try {

            const response = await apiRequest(
                "/auth/me",
                { handleUnauthorized: false }
            );

            this.saveAuth(this.getToken(), response.data.user);

            return true;

        } catch (error) {

            this.logout();

            return false;

        }

    },

    redirectIfAuthenticated() {

        if (!this.isAuthenticated()) {

            return false;

        }

        window.location.replace("index.html");

        return true;

    },

    populateUserDetails() {

        const user = this.getUser();

        if (!user) return;

        const name = user.name || user.email;
        const initials = name.split(" ").filter(Boolean).slice(0, 2)
            .map(part => part[0]).join("").toUpperCase();

        document.querySelectorAll(
            ".user-information strong, .topbar-profile strong"
        ).forEach(element => {
            element.textContent = name;
        });

        document.querySelectorAll(".user-avatar").forEach(element => {
            element.textContent = initials;
        });

        const settingsName = document.getElementById("settingsName");
        const settingsEmail = document.getElementById("settingsEmail");
        const settingsAvatar = document.getElementById("settingsAvatar");

        if (settingsName) settingsName.value = name;
        if (settingsEmail) settingsEmail.value = user.email;
        if (settingsAvatar) settingsAvatar.textContent = initials;

    }

};


/* =====================================================
   API REQUEST HELPER
   ===================================================== */

async function apiRequest(
    endpoint,
    options = {}
) {

    const token =
        AuthManager.getToken();


    const headers = {

        "Content-Type":
            "application/json",

        ...options.headers

    };


    if (token) {

        headers.Authorization =
            `Bearer ${token}`;

    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}${endpoint}`,
                {
                    ...options,
                    headers
                }
            );


        const data =
            await response.json().catch(() => ({}));


        if (
            response.status === 401 &&
            options.handleUnauthorized !== false
        ) {

            AuthManager.logout();

            throw new Error(
                "Your session has expired. Please sign in again."
            );

        }


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to complete your request. Please try again."
            );

        }


        return data;

    } catch (error) {

        console.error(
            "API request failed:",
            error
        );

        throw error;

    }

}

