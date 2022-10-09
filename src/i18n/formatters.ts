import type { FormattersInitializer } from 'typesafe-i18n';
import type { Locales, Formatters } from './i18n-types';
import { refs, embedLinks } from './en/common.js';
import Config from './../config/config.json';

export const initFormatters: FormattersInitializer<Locales, Formatters> = (locale: Locales) => {
	const formatters: Formatters = {
		refs(value: string): string {
			const keys = value.split('.');
			try {
				let result = { refs, embedLinks };
				for (let i = 0; i < keys.length; i++) {
					result = result[keys[i]];
				}
				return result.toString();
			} catch (err) {
				console.warn(err);
				return '';
			}
		},
		config(value: string): string {
			const keys = value.split('.');
			console.log('parsing', keys);
			try {
				let result = Config;
				for (let i = 0; i < keys.length; i++) {
					result = result[keys[i]];
					console.log(keys[i], result);
				}
				return result.toString();
			} catch (err) {
				console.warn(err);
				return '';
			}
		},
	};

	return formatters;
};
