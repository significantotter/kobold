import { z } from 'zod';
import { zNullableInteger } from '../lib/helpers.zod.js';

export enum CounterStyleEnum {
	prepared = 'prepared',
	default = 'default',
	dots = 'dots',
}

export type PreparedCounter = z.infer<typeof zPreparedCounter>;
export const zPreparedCounter = z.strictObject({
	style: z.enum([CounterStyleEnum.prepared]),
	name: z.string(),
	description: z.string().nullable().default(null),
	prepared: z.array(z.string().or(z.null())),
	active: z.array(z.boolean()),
	max: zNullableInteger,
	recoverable: z.boolean().default(false),
	text: z.string().default(''),
});

export type NumericCounter = z.infer<typeof zNumericCounter>;
export const zNumericCounter = z.strictObject({
	style: z.enum([CounterStyleEnum.default]),
	name: z.string(),
	description: z.string().nullable().default(null),
	current: z.number().int(),
	max: zNullableInteger,
	recoverTo: z.number().int().default(0),
	recoverable: z.boolean().default(false),
	text: z.string().default(''),
});

export type DotsCounter = z.infer<typeof zDotsCounter>;
export const zDotsCounter = z.strictObject({
	style: z.enum([CounterStyleEnum.dots]),
	name: z.string(),
	description: z.string().nullable().default(null),
	current: z.number().int().min(0),
	max: z.number().int().max(20),
	recoverTo: z.number().int().default(0),
	recoverable: z.boolean().default(false),
	text: z.string().default(''),
});

export type Counter = z.infer<typeof zCounter>;
export const zCounter = z.discriminatedUnion('style', [
	zPreparedCounter,
	zNumericCounter,
	zDotsCounter,
]);

export type CounterGroup = z.infer<typeof zCounterGroup>;
export const zCounterGroup = z.strictObject({
	name: z.string(),
	description: z.string().nullable().default(null),
	counters: z.array(zCounter),
});
