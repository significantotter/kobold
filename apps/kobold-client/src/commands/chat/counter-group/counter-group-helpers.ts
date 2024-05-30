import { CounterGroup } from '@kobold/db';
import { KoboldError } from '../../../utils/KoboldError.js';

export class CounterGroupHelpers {
	public static detailCounterGroup(counterGroup: CounterGroup) {
		const counterGroupTextLines = [];
		if (counterGroup.description) counterGroupTextLines.push(`${counterGroup.description}`);
		return counterGroupTextLines.join('\n');
	}
}
