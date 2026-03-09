/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#0a0a0c', // Super dark, almost black
                surface: '#121216', // slightly lighter for cards
                surfaceHover: '#1a1a1f',
                primary: '#6366f1', // Indigo
                primaryHover: '#4f46e5',
                secondary: '#10b981', // Emerald
                danger: '#ef4444', // Red
                accent: '#f59e0b', // Amber
                textBase: '#f3f4f6', // Gray 100
                textMuted: '#9ca3af', // Gray 400
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'slide-up': 'slideUp 0.4s ease-out forwards',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            }
        },
    },
    plugins: [],
}
