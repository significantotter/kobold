// @ts-expect-error ignore type checking issue for the plugin
import tailwindcssPrimeui from 'tailwindcss-primeui';
import tailwindcssTypography from '@tailwindcss/typography';

export default {
	darkMode: 'class',
	content: ['./index.html', './client/**/*.{vue,js,ts,jsx,tsx}', './presets/**/*.{js,vue,ts}'],
	plugins: [tailwindcssPrimeui, tailwindcssTypography],
};
