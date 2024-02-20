import type { Activity } from '../schemas/index-types.js';

export function parseActivityRaw(activity?: Activity) {
	if (!activity) return '';
	if ('entry' in activity) {
		return '';
	}
	if (activity.customUnit) return ``;
	const unit = activity.unit ?? 'action';
	if (unit === 'reaction') {
		return 'react';
	} else if (unit === 'free') {
		return 'free';
	} else if (['action', 'actions'].includes(unit)) {
		if (activity.number === 1) {
			return '1a';
		} else if (activity.number === 2) {
			return '2a';
		} else if (activity.number === 3) {
			return '3a';
		}
	}
	return ``;
}
