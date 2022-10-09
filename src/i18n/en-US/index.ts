import type { Translation } from '../i18n-types';
import en from '../en'; // import translations from 'en' locale

const en_US: Translation = {
	...(en as Translation), // use destructuring to copy all translations from your 'en' locale
};

export default en_US;
