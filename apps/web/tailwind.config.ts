// @ts-expect-error ignore type checking issue for the plugin
import tailwindcssPrimeui from 'tailwindcss-primeui';
import tailwindcssTypography from '@tailwindcss/typography';

export default {
	content: [
		'./presets/**/*.{js,vue,ts}',
		// other paths
	],
	plugins: [tailwindcssPrimeui, tailwindcssTypography],
};
