import { Counter, CounterStyleEnum } from '@kobold/db';

export class CounterUtils {
	public static resetCounter(counter: Counter): void {
		if (counter.style === CounterStyleEnum.dots || counter.style === CounterStyleEnum.default) {
			if (counter.recoverTo === -1) {
				counter.current = counter.max ?? 0;
			} else if (counter.recoverTo === -2) {
				counter.current = Math.floor((counter.max ?? 0) / 2);
			} else {
				counter.current = counter.recoverTo ?? counter.current;
			}
		} else {
			counter.active = counter.prepared.map(() => true);
		}
	}
}
