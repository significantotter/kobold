import type { SheetDamageTerm } from './types';

export function signed(value: number) {
	return value >= 0 ? `+${value}` : String(value);
}

export function formatNullableSigned(value: number | null) {
	return value === null ? '-' : signed(value);
}

export function toTitleLabel(value: string) {
	return value
		.replace(/([a-z])([A-Z])/g, '$1 $2')
		.replace(/[._-]+/g, ' ')
		.trim()
		.replace(/\b\w/g, letter => letter.toUpperCase());
}

export function formatSheetDamage(damage: SheetDamageTerm[]) {
	return damage
		.map(term => {
			const pieces = [
				term.dice,
				term.type,
				term.persistent ? 'persistent' : null,
				term.tags.length > 0 ? `(${term.tags.join(', ')})` : null,
			].filter(Boolean);
			return pieces.join(' ');
		})
		.filter(Boolean)
		.join(', ');
}
