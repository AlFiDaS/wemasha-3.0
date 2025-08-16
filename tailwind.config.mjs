/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			screens: {
				'xs': '475px',
			},
			animation: {
				'fade-in': 'fadeIn 0.5s ease-in-out',
				'slide-up': 'slideUp 0.3s ease-out',
				'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
			},
			keyframes: {
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				slideUp: {
					'0%': { transform: 'translateY(10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				}
			}
		},
	},
	plugins: [],
	// Optimización de purging
	safelist: [
		'bg-pink-500',
		'text-pink-500',
		'border-pink-500',
		'from-pink-500',
		'to-pink-600',
		'hover:from-pink-600',
		'hover:to-pink-700',
		'data-[active=true]:bg-gradient-to-r',
		'data-[active=true]:from-pink-500',
		'data-[active=true]:to-pink-600',
		'data-[active=true]:border-pink-500',
		'data-[active=true]:text-white'
	]
}
