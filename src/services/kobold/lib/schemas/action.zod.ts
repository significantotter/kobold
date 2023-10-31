import { z } from 'zod';
import { zNullableInteger } from '../../schemas/lib/helpers.zod.js';
import { zRoll } from './roll.zod.js';
import { ActionCostEnum, ActionTypeEnum } from '../../schemas/lib/enums.js';

export type Action = z.infer<typeof zAction>;
export const zAction = z
	.strictObject({
		name: z.string(),
		description: z.string().nullable().default(null),
		type: z.nativeEnum(ActionTypeEnum),
		actionCost: z.nativeEnum(ActionCostEnum),
		baseLevel: zNullableInteger,
		autoHeighten: z.boolean().default(false),
		tags: z.array(z.string()).default([]),
		rolls: z.array(zRoll).default([]),
	})
	.describe('A custom sheet action');
