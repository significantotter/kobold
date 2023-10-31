import { z } from 'zod';

export const zTimestamp = z.string().datetime().default(new Date().toISOString());

export const zNullableInteger = z.number().int().nullable().default(null);

/**
 * A record of a set of enum literals to a known, shared type
 */
export const zRecordOf = <T extends Record<string, string>, ZodValueType extends z.ZodTypeAny>(
	obj: T,
	zodValueType: ZodValueType
) => {
	type KeyType = T[keyof T];
	const keys = Object.values(obj);
	return z.object(
		keys.reduce(
			(agg, k) => ({
				...agg,
				[k]: zodValueType,
			}),
			{} as Record<KeyType, ZodValueType>
		)
	);
};
