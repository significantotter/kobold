import { Counter } from '@kobold/db';
import { KoboldError } from '../../../utils/KoboldError.js';

export class CounterHelpers {
	public static detailCounter(counter: Counter) {
		const counterTextLines = [];
		if (counter.description) counterTextLines.push(`${counter.description}`);
		return counterTextLines.join('\n');
	}
}
