import { z } from 'zod';
import { zNullableInteger } from '../lib/helpers.zod.js';
import { zRoll } from './roll.zod.js';

export enum ActionCostEnum {
	oneAction = 'oneAction',
	twoActions = 'twoActions',
	threeActions = 'threeActions',
	freeAction = 'freeAction',
	variableActions = 'variableActions',
	reaction = 'reaction',
	none = 'none',
}

export enum ActionTypeEnum {
	attack = 'attack',
	spell = 'spell',
	other = 'other',
}

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
