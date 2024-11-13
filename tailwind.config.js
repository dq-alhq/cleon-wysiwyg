/** @type {import('tailwindcss').Config} */
import { withTV } from 'tailwind-variants/transformer'
import ta from 'tailwindcss-animate'
import trac from 'tailwindcss-react-aria-components'

const config = withTV({
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './components/**/*.{ts,tsx,js,jsx}'],
    darkMode: 'class',
    theme: {
        container: {
            center: true,
            padding: {
                DEFAULT: '1rem',
                sm: '2rem',
            },
            screens: {
                '2xl': '1400px',
            },
        },
        extend: {
            colors: {
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
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
                success: {
                    DEFAULT: 'hsl(var(--success))',
                    foreground: 'hsl(var(--success-foreground))',
                },
                info: {
                    DEFAULT: 'hsl(var(--info))',
                    foreground: 'hsl(var(--info-foreground))',
                },
                warning: {
                    DEFAULT: 'hsl(var(--warning))',
                    foreground: 'hsl(var(--warning-foreground))',
                },
                dark: {
                    DEFAULT: 'hsl(var(--dark))',
                    foreground: 'hsl(var(--dark-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                chart: {
                    primary: 'hsl(var(--primary-chart))',
                    secondary: 'hsl(var(--secondary-chart))',
                    tertiary: 'hsl(var(--tertiary-chart))',
                    highlight: 'hsl(var(--highlight-chart))',
                    accent: 'hsl(var(--accent-chart))',
                },
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
        },
    },
    plugins: [ta, trac],
})

export default config
