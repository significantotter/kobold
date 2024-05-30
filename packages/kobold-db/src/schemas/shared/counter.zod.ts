import { z } from 'zod';
import { zNullableInteger } from '../lib/helpers.zod.js';

export type PreparedCounter = z.infer<typeof zPreparedCounter>;
export const zPreparedCounter = z.strictObject({
	style: z.enum(['prepared']),
	name: z.string(),
	prepared: z.array(z.string()),
	active: z.array(z.boolean()),
	max: zNullableInteger,
	recoverable: z.boolean().default(false),
});

export type NumericCounter = z.infer<typeof zNumericCounter>;
export const zNumericCounter = z.strictObject({
	style: z.enum(['default', 'dots']),
	name: z.string(),
	current: z.number().int(),
	max: zNullableInteger,
	recoverable: z.boolean().default(false),
});

export type Counter = z.infer<typeof zCounter>;
export const zCounter = z.discriminatedUnion('style', [zPreparedCounter, zNumericCounter]);

export type CounterGroup = z.infer<typeof zCounterGroup>;
export const zCounterGroup = z.strictObject({
	name: z.string(),
	description: z.string().nullable().default(null),
	counters: z.array(zCounter),
});
