/** @type {import('tailwindcss').Config} */
export default {
    // Force rebuild
    darkMode: 'class',
    content: [
        "./index.html",
        "./App.tsx",
        "./index.tsx",
        "./types.ts",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./store/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
