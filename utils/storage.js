const StorageManager = {

    get(key, fallback = null) {

        try {

            const stored =
                localStorage.getItem(key);


            if (stored === null) {
                return fallback;
            }


            return JSON.parse(stored);

        } catch (error) {

            console.error(
                `Storage read error for "${key}":`,
                error
            );

            return fallback;

        }

    },


    set(key, value) {

        try {

            localStorage.setItem(
                key,
                JSON.stringify(value)
            );

            return true;

        } catch (error) {

            console.error(
                `Storage write error for "${key}":`,
                error
            );

            return false;

        }

    },


    remove(key) {

        try {

            localStorage.removeItem(key);

            return true;

        } catch (error) {

            console.error(
                `Storage remove error for "${key}":`,
                error
            );

            return false;

        }

    },


    clear() {

        try {

            localStorage.clear();

            return true;

        } catch (error) {

            console.error(
                "Storage clear error:",
                error
            );

            return false;

        }

    }

};