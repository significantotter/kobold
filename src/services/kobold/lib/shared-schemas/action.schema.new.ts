import { JSONSchema7 } from 'json-schema';

export const Action: JSONSchema7 = {
	title: 'action',
	type: 'object',
	description: 'An custom sheet action',
	properties: {
		name: { type: 'string' },
		description: { type: 'string' },
		type: { type: 'string' },
		actionCost: { type: ['string', 'null'] },
		baseLevel: { type: ['number', 'null'] },
		autoHeighten: { type: ['boolean'] },
		tags: { type: 'array', items: { type: 'string' } },
		rolls: {
			type: 'array',
			items: {
				oneOf: [
					{
						type: 'object',
						properties: {
							name: { type: 'string' },
							type: {
								type: 'string',
								enum: ['attack', 'skill-challenge'],
							},
							targetDC: { type: ['string', 'null'] },
							roll: { type: ['string', 'null'] },
							allowRollModifiers: { type: 'boolean' },
						},
						required: ['name', 'type', 'roll', 'allowRollModifiers'],
					},
					{
						type: 'object',
						properties: {
							name: { type: 'string' },
							type: { type: 'string', enum: ['damage'] },
							damageType: { type: ['string', 'null'] },
							healInsteadOfDamage: { type: ['boolean', 'null'] },
							roll: { type: ['string', 'null'] },
							allowRollModifiers: { type: 'boolean' },
						},
						required: ['name', 'type', 'roll', 'allowRollModifiers'],
					},
					{
						type: 'object',
						properties: {
							name: { type: 'string' },
							type: { type: 'string', enum: ['advanced-damage'] },
							damageType: { type: ['string', 'null'] },
							healInsteadOfDamage: { type: ['boolean', 'null'] },
							criticalSuccessRoll: { type: ['string', 'null'] },
							criticalFailureRoll: { type: ['string', 'null'] },
							successRoll: { type: ['string', 'null'] },
							failureRoll: { type: ['string', 'null'] },
							allowRollModifiers: { type: 'boolean' },
						},
						required: ['name', 'type', 'allowRollModifiers'],
					},
					{
						type: 'object',
						properties: {
							name: { type: 'string' },
							type: { type: 'string', enum: ['save'] },
							saveRollType: { type: ['string', 'null'] },
							saveTargetDC: { type: ['string', 'null'] },
							allowRollModifiers: { type: 'boolean' },
						},
						required: ['name', 'type', 'allowRollModifiers'],
					},
					{
						type: 'object',
						properties: {
							name: { type: 'string' },
							type: { type: 'string', enum: ['text'] },
							defaultText: { type: ['string', 'null'] },
							criticalSuccessText: { type: ['string', 'null'] },
							criticalFailureText: { type: ['string', 'null'] },
							successText: { type: ['string', 'null'] },
							failureText: { type: ['string', 'null'] },
							allowRollModifiers: { type: 'boolean' },
							extraTags: {
								type: 'array',
								items: { type: 'string' },
							},
						},
						required: ['name', 'type', 'allowRollModifiers', 'extraTags'],
					},
				],
			},
		},
	},
	required: [
		'name',
		'description',
		'type',
		'actionCost',
		'baseLevel',
		'autoHeighten',
		'tags',
		'rolls',
	],
};