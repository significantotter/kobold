import { CounterGroup } from '@kobold/db';
import { CounterHelpers } from '../counter/counter-helpers.js';

export class CounterGroupHelpers {
	public static detailCounterGroup(counterGroup: CounterGroup) {
		const counterGroupTextLines = [];
		if (counterGroup.description) counterGroupTextLines.push(`${counterGroup.description}`);
		counterGroupTextLines.push(
			...counterGroup.counters.flatMap(counter => [
				`**${counter.name}** ${CounterHelpers.detailCounter(counter)}`,
			])
		);
		return counterGroupTextLines.join('\n');
	}
}
