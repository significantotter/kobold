import { commonTerms } from '@kobold/documentation';
export function applyTermsWithTooltips(text: string) {
	return text.split(/({[^}]+})/).map(part => {
		if (part.startsWith('{') && part.endsWith('}')) {
			const unwrappedTerm = part.slice(1, -1);
			const [term, value] = unwrappedTerm.split(':');
			return {
				// if we don't have a replaced value, make it obviously
				// a replaced value with the {term} syntax
				value: value ?? part,
				tooltip: commonTerms[term as keyof typeof commonTerms] ?? undefined,
			};
		} else {
			return { value: part };
		}
	});
}
export function applyTerms(text: string) {
	return applyTermsWithTooltips(text)
		.map(({ value }) => value)
		.join('');
}
