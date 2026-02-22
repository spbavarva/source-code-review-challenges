/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                'ledger-ink': '#1f2937',
                'ledger-sea': '#0f766e',
                'ledger-sand': '#f59e0b',
            },
        },
    },
    plugins: [],
}
