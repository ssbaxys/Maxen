/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: 'hsl(var(--background))',
                surface: 'hsl(var(--surface))',
                surfaceHover: 'hsl(var(--surface-hover))',
                border: 'hsl(var(--border))',
                ring: 'hsl(var(--ring))',
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    hover: 'hsl(var(--primary-hover))',
                    foreground: 'hsl(var(--primary-foreground))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                },
                danger: {
                    DEFAULT: 'hsl(var(--danger))',
                    foreground: 'hsl(var(--danger-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },

                // Old colors mapped to variables or kept for backward compatibility slightly
                textBase: 'hsl(var(--foreground))',
                textMuted: 'hsl(var(--muted-foreground))',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'slide-up': 'slideUp 0.4s ease-out forwards',
                'scale-in': 'scaleIn 0.2s ease-out',
                'fade-in-up': 'fadeInUp 0.4s ease-out forwards',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            },
            boxShadow: {
                'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
                'glass-lg': '0 8px 32px 0 rgba(0, 0, 0, 0.36)',
                glow: '0 0 20px rgba(99, 102, 241, 0.4)',
                'glow-sm': '0 0 10px rgba(99, 102, 241, 0.2)',
            }
        },
    },
    plugins: [],
}
