/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			// Brand colors - Teal, Rose, Amber
  			positive: '#14b8a6',  // Teal-500
  			negative: '#f43f5e',  // Rose-500
  			neutral: '#f59e0b',   // Amber-500
  			brand: {
  				teal: {
  					50: '#f0fdfa',
  					100: '#ccfbf1',
  					200: '#99f6e4',
  					300: '#5eead4',
  					400: '#2dd4bf',
  					500: '#14b8a6',
  					600: '#0d9488',
  					700: '#0f766e',
  				},
  				rose: {
  					50: '#fff1f2',
  					100: '#ffe4e6',
  					200: '#fecdd3',
  					300: '#fda4af',
  					400: '#fb7185',
  					500: '#f43f5e',
  					600: '#e11d48',
  					700: '#be123c',
  				},
  				amber: {
  					50: '#fffbeb',
  					100: '#fef3c7',
  					200: '#fde68a',
  					300: '#fcd34d',
  					400: '#fbbf24',
  					500: '#f59e0b',
  					600: '#d97706',
  					700: '#b45309',
  				},
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'Geist',
  				'system-ui',
  				'sans-serif'
  			],
  			mono: [
  				'Geist Mono',
  				'monospace'
  			]
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		padding: {
  			'safe': 'env(safe-area-inset-bottom)'
  		},
  		keyframes: {
  			'glow-teal': {
  				'0%, 100%': {
  					opacity: '0.2',
  					transform: 'scale(1) translate(0, 0)',
  				},
  				'50%': {
  					opacity: '0.35',
  					transform: 'scale(1.1) translate(10px, -10px)',
  				},
  			},
  			'glow-rose': {
  				'0%, 100%': {
  					opacity: '0.2',
  					transform: 'scale(1) translate(0, 0)',
  				},
  				'50%': {
  					opacity: '0.3',
  					transform: 'scale(1.15) translate(-10px, 10px)',
  				},
  			},
  			'pulse-slow': {
  				'0%, 100%': {
  					opacity: '0.3',
  					transform: 'translate(-50%, -50%) scale(1)',
  				},
  				'50%': {
  					opacity: '0.5',
  					transform: 'translate(-50%, -50%) scale(1.05)',
  				},
  			},
  			'float': {
  				'0%, 100%': {
  					transform: 'translateY(0)',
  				},
  				'50%': {
  					transform: 'translateY(-20px)',
  				},
  			},
  			'gradient': {
  				'0%, 100%': {
  					'background-position': '0% 50%',
  				},
  				'50%': {
  					'background-position': '100% 50%',
  				},
  			},
  		},
  		animation: {
  			'glow-teal': 'glow-teal 8s ease-in-out infinite',
  			'glow-rose': 'glow-rose 10s ease-in-out infinite',
  			'pulse-slow': 'pulse-slow 12s ease-in-out infinite',
  			'float': 'float 6s ease-in-out infinite',
  			'gradient': 'gradient 15s ease infinite',
  		},
  	}
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
  ],
}
