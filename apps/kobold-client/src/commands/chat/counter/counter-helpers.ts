import { Counter, CounterStyleEnum } from '@kobold/db';

export class CounterHelpers {
	public static detailCounter(counter: Counter) {
		const counterTextLines = [];
		if (counter.description) counterTextLines.push(`*${counter.description}*`);
		if (counter.text) counterTextLines.push(`${counter.text}`);
		if (counter.style === CounterStyleEnum.default) {
			counterTextLines.push(`${counter.current}${counter.max ? `/${counter.max}` : ''}`);
		} else if (counter.style === CounterStyleEnum.dots) {
			counterTextLines.push(
				`${'◉'.repeat(counter.current)}${'〇'.repeat((counter.max ?? 20) - counter.current)}`
			);
		} else {
			// prepared
			counterTextLines.push(
				counter.prepared
					.map((value, index) => {
						const active = counter.active[index] ? ' ✓' : ' ✗';
						return `${value ?? 'empty'} ${active}`;
					})
					.join(', ')
			);
		}
		return counterTextLines.join('\n');
	}
}
