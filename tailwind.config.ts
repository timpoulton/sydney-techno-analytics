import type { Config } from 'tailwindcss';

const config: Config = {
    darkMode: ['class'],
    content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			'sf': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'system-ui', 'sans-serif'],
  			'inter': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			// Apple System Colors
  			'system-blue': '#0A84FF',
  			'system-green': '#30D158',
  			'system-red': '#FF453A',
  			'system-purple': '#BF5AF2',
  			'system-yellow': '#FFD60A',
  			'system-gray': {
  				900: '#000000',
  				800: '#1C1C1E',
  				700: '#2C2C2E',
  				600: '#3A3A3C',
  				500: '#48484A',
  				400: '#636366',
  				300: '#8E8E93',
  				200: '#C7C7CC',
  				100: '#E5E5EA',
  			},
  		},
  		animation: {
  			'fade-in': 'fade-in 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  			'slide-up': 'slide-up 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  			'scale-in': 'scale-in 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  			'pulse-subtle': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  		},
  		keyframes: {
  			'fade-in': {
  				'from': { opacity: '0' },
  				'to': { opacity: '1' }
  			},
  			'slide-up': {
  				'from': { transform: 'translateY(10px)', opacity: '0' },
  				'to': { transform: 'translateY(0)', opacity: '1' }
  			},
  			'scale-in': {
  				'from': { transform: 'scale(0.95)', opacity: '0' },
  				'to': { transform: 'scale(1)', opacity: '1' }
  			},
  			'pulse': {
  				'0%, 100%': { opacity: '1' },
  				'50%': { opacity: '0.5' }
  			}
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;