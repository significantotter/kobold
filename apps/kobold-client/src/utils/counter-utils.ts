import { Counter, CounterStyleEnum } from '@kobold/db';

export class CounterUtils {
	public static resetCounter(counter: Counter): void {
		if (counter.style === CounterStyleEnum.dots || counter.style === CounterStyleEnum.default) {
			counter.current = counter.recoverTo === -1 ? counter.max ?? 0 : counter.recoverTo;
		} else {
			counter.active = [];
			for (let i = 0; i < (counter.max ?? 0); i++) {
				counter.active.push(true);
			}
		}
	}
}
