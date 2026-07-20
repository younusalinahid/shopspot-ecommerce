module.exports = {
    darkMode: "class",
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Plus Jakarta Sans", "sans-serif"],
                heading: ["Cormorant Garamond", "serif"],
            },

            colors: {
                dark: {
                    bg: "#1a202c",
                    surface: "#2d3748",
                    text: "#e2e8f0",
                },
            },
        },
    },
    plugins: [],
};