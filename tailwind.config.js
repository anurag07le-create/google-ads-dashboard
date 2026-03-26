/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Inter"', 'sans-serif'],
                display: ['"Inter"', 'sans-serif'],
                space: ['"Space Grotesk"', 'sans-serif'],
            },
            colors: {
                pucho: {
                    dark: '#0f172a',      // Slate 900
                    purple: '#6366f1',    // Indigo 500 (more professional than violet)
                    blue: '#3b82f6',      // Blue 500
                    accent: '#8b5cf6',    // Violet 500
                    bg: '#f8fafc',        // Slate 50
                    card: '#ffffff',
                    border: '#f1f5f9',    // Slate 100
                    text: '#475569',      // Slate 600
                }
            },
            boxShadow: {
                'premium': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 10px -2px rgba(0, 0, 0, 0.02)',
                'glow': '0 0 15px rgba(99, 102, 241, 0.1)',
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
            },
            borderRadius: {
                '2xl': '18px',
                '3xl': '24px',
                '4xl': '32px',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.4s ease-out',
                'float': 'float 3s ease-in-out infinite',
                'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
                'pulse-dot': 'pulseDot 1.5s ease-in-out infinite',
                'count-up': 'countUp 0.6s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                pulseGlow: {
                    '0%, 100%': { boxShadow: '0 0 0 0 rgba(99, 102, 241, 0.3)' },
                    '50%': { boxShadow: '0 0 20px 6px rgba(99, 102, 241, 0.1)' },
                },
                pulseDot: {
                    '0%, 100%': { opacity: '1', transform: 'scale(1)' },
                    '50%': { opacity: '0.4', transform: 'scale(1.8)' },
                },
                countUp: {
                    '0%': { opacity: '0', transform: 'translateY(8px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            }
        },
    },
    plugins: [],
}
