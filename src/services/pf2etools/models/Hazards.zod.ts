import { z } from 'zod';
import { zSpeedSchema, zTypedNumberSchema } from '../helpers.zod.js';
import { zAbilityEntrySchema, zAttackEntrySchema, zEntrySchema } from '../entries.zod.js';

type TargetValueRecord = z.infer<typeof zTargetValueRecordSchema>;
const zTargetValueRecordSchema = z.record(
	z.string(),
	z.union([z.number(), z.string(), z.record(z.string(), z.string().or(z.number()))])
);
// .object({
// 	notes: z.object({ 'Eye ': z.string() }),
// 	'Eye ': z.number(),
// })
// .catchall(z.string().or(z.number()));

const test2: TargetValueRecord = {
	'Eye ': 20,
	notes: {
		'Eye ': '',
	},
};
export type Hazard = z.infer<typeof zHazardSchema>;
export const zHazardSchema = z
	.object({
		name: z.string(),
		alias: z.string().array().optional(),
		add_hash: z.string().optional(),
		source: z.string(),
		page: z.number(),
		level: z.number(),
		traits: z.array(z.string()),
		stealth: z
			.object({
				bonus: z.number().optional(),
				dc: z.number().optional(),
				minProf: z.string().optional(),
				notes: z.string().optional(),
			})
			.optional(),
		perception: z
			.object({
				bonus: z.number().optional(),
				dc: z.number().optional(),
				minProf: z.string().optional(),
				notes: z.string().optional(),
			})
			.optional(),
		abilities: zAbilityEntrySchema.array().optional(),
		description: z.array(z.string()).optional(),
		disable: z.object({ entries: z.array(z.string()) }),
		defenses: z
			.object({
				ac: z.object({ std: z.number() }).catchall(z.number()).optional(),
				savingThrows: z
					.object({
						fort: z
							.object({
								std: z.number().optional(),
								default: z.number().optional(),
								abilities: z.array(z.string()).optional(),
							})
							.optional(),
						ref: z
							.object({ std: z.number().optional(), default: z.number().optional() })
							.optional(),
						will: z
							.object({ std: z.number().optional(), default: z.number().optional() })
							.optional(),
						abilities: z.array(z.string()).optional(),
					})
					.optional(),
				fort: z
					.object({ std: z.number().optional(), default: z.number().optional() })
					.optional(),
				ref: z
					.object({ std: z.number().optional(), default: z.number().optional() })
					.optional(),
				will: z
					.object({ std: z.number().optional(), default: z.number().optional() })
					.optional(),
				hardness: zTargetValueRecordSchema.optional(),
				hp: zTargetValueRecordSchema.optional(),
				bt: zTargetValueRecordSchema.optional(),
				immunities: z.array(z.string()).optional(),
				weaknesses: z
					.object({
						name: z.string(),
						amount: z.number().optional(),
						note: z.string().optional(),
					})
					.array()
					.optional(),
				resistances: z
					.object({
						name: z.string(),
						amount: z.number().optional(),
						note: z.string().optional(),
					})
					.array()
					.optional(),
			})
			.optional(),
		attacks: zAttackEntrySchema.array().optional(),

		actions: z.array(zEntrySchema).optional(),
		speed: zSpeedSchema.optional(),
		routine: z.array(zEntrySchema).optional(),
		reset: z.array(z.string()).optional(),
	})
	.strict();

const test: Hazard[] = [
	{
		name: "Scholar's Bane",
		source: 'GW1',
		page: 53,
		level: 4,
		traits: ['complex', 'illusion', 'magical', 'trap'],
		stealth: {
			bonus: 14,
			minProf: 'trained',
			notes: "to notice magical sensors {@condition hidden} within four of the carvings' eyes",
		},
		description: [
			"Illusion magic overwhelms the minds of particularly intelligent creatures, forcing them to relive every intellectual failure and shame they've ever suffered.",
		],
		disable: {
			entries: [
				"DC 22 {@skill Thievery} (trained) to carve out one eye sensor, DC 22 {@skill Arcana} or {@skill Occultism} (trained) to blank out one's mind (disables trap for self only), or dispel magic (2nd level; counteract DC 20) to counteract one eye sensor",
			],
		},
		defenses: {
			ac: {
				std: 20,
			},
			savingThrows: {
				fort: {
					std: 12,
				},
				ref: {
					std: 8,
				},
			},
			hardness: {
				'Eye ': 6,
			},
			hp: {
				'Eye ': 20,
				notes: {
					'Eye ': '',
				},
			},
		},
		actions: [
			{
				name: 'Reveal Failurs',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature with an Intelligence score of 10 or greater enters the room',
				entries: [
					"The trap fills the triggering creature's mind with shameful memories. The creature must succeed at a DC 22 Will save or take {@damage 2d8+2} mental damage. The trap then rolls initiative.",
				],
			},
		],
		routine: [
			'(4 actions) The trap uses each action to target a creature in the room with an Intelligence score of 10 or greater. A target must succeed at a DC 22 Will save or take {@damage 2d8+2} mental damage. On a critical failure, the creature takes a \u201310-foot status penalty to Speed for 1 minute as they stagger under the weight of their failures. The trap loses 1 action for each eye sensor disabled or destroyed.',
		],
		reset: [
			"The trap can function for 10 rounds, which don't need to be consecutive, before it must recharge for 24 hours.",
		],
	},
	{
		name: 'Reservoir Trap',
		source: 'GW1',
		page: 0,
		level: 2,
		traits: ['complex', 'mechanical', 'trap'],
		stealth: {
			bonus: 11,
			dc: 19,
			minProf: 'expert',
			notes: 'to notice the water tank bulging under the immense pressure',
		},
		description: [
			'Pipes extending from a pressurized water tank spray flesh-cutting jets of water at unwary passersby.',
		],
		disable: {
			entries: [
				'DC 18 {@skill Thievery} (trained) to safely puncture a pipe, or DC 16 {@skill Lore||Engineering Lore} (trained) to find and turn a pressure release valve; any combination of three punctured pipes or turned valves disables the trap',
			],
		},
		defenses: {
			ac: {
				std: 18,
			},
			savingThrows: {
				fort: {
					std: 11,
				},
				ref: {
					std: 3,
				},
			},
			hardness: {
				'Tank ': 7,
				'Pipe ': 7,
			},
			hp: {
				'Tank ': 50,
				'Pipe ': 30,
			},
			bt: {
				'Tank ': 25,
				'Pipe ': 15,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				name: 'Water Jets',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature steps on a floor space in this room',
				entries: [
					'Seals on the water pipes burst, issuing forth high-pressure water jets in random directions. The hazard makes a water jet {@action Strike} against the triggering creature. The hazard rolls initiative.',
				],
			},
			{
				name: 'Violent Deluge',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'The water tank is {@condition broken} or destroyed',
				entries: [
					'A torrent of water bursts from the shattered tank, dealing {@damage 3d8} bludgeoning damage to each creature within 15 feet (basic DC 22 Reflex save). The trap is then disabled.',
				],
			},
		],
		routine: [
			"(3 actions) For each pipe destroyed or disabled, the trap loses 1 action. On each of the trap's actions, the trap targets a random creature in the room with a water jet {@action Strike}.",
		],
		attacks: [
			{
				range: 'Ranged',
				traits: ['water'],
				name: 'water jet',
				attack: 11,
				damage: '{@damage 2d8} piercing',
				noMAP: true,
			},
		],
		reset: [
			'The trap deactivates after 5 rounds. It cannot be reactivated until the reservoir is refilled, which takes an average of 5 days.',
		],
	},
	{
		name: 'Cordon Alarm',
		source: 'GW1',
		page: 0,
		level: 2,
		traits: ['abjuration', 'magical', 'trap'],
		stealth: {
			dc: 18,
			minProf: 'trained',
		},
		description: [
			'A hempen rope tied between trees emanates an {@condition invisible}, cylindrical barrier that sounds an alarm when crossed.',
		],
		disable: {
			entries: [
				"DC 18 {@skill Thievery} (trained) to move the rope without setting off the alarm, or dispel magic (1st level; counteract DC 16) to disable the rope's magic",
			],
		},
		actions: [
			{
				name: 'Alarm',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['abjuration', 'primal'],
				trigger:
					'An object or creature of at least 1 Bulk crosses an {@condition invisible} vertical barrier extending 30 feet above and below the rope',
				entries: [
					'The rope squawks like an angry squirrel from the point where the barrier was breached. This alarm is as loud as a human scream and lasts for 1 minute.',
					'If an item or creature is still breaching the barrier at the end of this duration, the alarm immediately triggers again.',
				],
			},
		],
		reset: [
			'The alarm resets immediately. Multiple breaches can cause the alarm to sound in multiple places at the same time, though the alarm can still be triggered only once per round.',
		],
	},
	{
		name: 'Shadowshift Field',
		source: 'GW1',
		page: 0,
		level: 1,
		traits: ['complex', 'conjuration', 'magical'],
		stealth: {
			bonus: 7,
			minProf: 'trained',
			notes: 'to notice the air and plants wavering and shifting',
		},
		description: [
			"Cross-planar seepage from the Oaksteward rebels' ritual causes shadowy warping effects to strain and damage living creatures in the forest clearing.",
		],
		disable: {
			entries: [
				"DC 17 {@skill Arcana} (trained) to will the Material Plane's hold on the area back into firmness and disable the effect for 1 hour, or dispel magic (1st level; counteract DC 15) to end the effect permanently",
			],
		},
		actions: [
			{
				name: 'Shadowshift',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['conjuration', 'primal'],
				trigger: 'A character enters the affected area',
				entries: [
					'The hazard rolls initiative as the field of planar warping surges, filling the forest clearing.',
				],
			},
		],
		routine: [
			'(1 action) Each creature in the clearing must attempt a DC 17 Fortitude save as the planar warping threatens to create microscopic tears inside their body.',
			'Fey, plant creatures, and druids are unaffected.',
			{
				type: 'successDegree',
				entries: {
					'Critical Success': [
						'The creature is unaffected and immune for 24 hours. The land is healed {@dice 1d6} points by the primal magic.',
					],
					Success: ['The creature is unaffected and immune to the effect for 24 hours.'],
					Failure: ['The creature takes {@damage 1d6+3} force damage.'],
					'Critical Failure': ['The creature takes {@damage 2d6+6} force damage.'],
				},
			},
		],
		reset: [
			'This effect continues for 1 day, after which it ends and cannot be triggered again without another ritual.',
		],
	},
	{
		name: 'Exploding Stove',
		source: 'GW1',
		page: 0,
		level: 3,
		traits: ['mechanical', 'trap'],
		stealth: {
			dc: 22,
			minProf: 'expert',
		},
		description: [
			'The stove has been rigged to explode when pressure sensors under the floor are depressed.',
		],
		disable: {
			entries: [
				'DC 20 {@skill Thievery} (trained) to disable the pressure sensors, or DC 20 {@skill Survival} (trained) to safely extinguish the stove fires',
			],
		},
		defenses: {
			ac: {
				std: 19,
			},
			savingThrows: {
				fort: {
					std: 10,
				},
				ref: {
					std: 5,
				},
			},
			hardness: {
				std: 10,
			},
			hp: {
				std: 42,
			},
			bt: {
				std: 21,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				name: 'Explode',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature steps on the floor within 5 feet of the stove',
				entries: [
					'The stove explodes, dealing {@damage 2d10+13} fire damage to each creature within 10 feet (basic DC 20 Reflex save).',
				],
			},
		],
	},
	{
		name: 'Violet Mister',
		source: 'GW1',
		page: 0,
		level: 2,
		traits: ['mechanical', 'trap'],
		stealth: {
			dc: 20,
			minProf: 'trained',
			notes: "to notice the trap's trigger-thread attached to the door",
		},
		description: [
			"Opening the door pulls a thread, which causes a plant mister to spray a cloud of poison into the triggering creature's face.",
		],
		disable: {
			entries: ['DC 18 {@skill Thievery} to safely cut the thread'],
		},
		defenses: {
			ac: {
				std: 16,
			},
			savingThrows: {
				fort: {
					std: 10,
				},
				ref: {
					std: 10,
				},
			},
			hardness: {
				std: 7,
			},
			hp: {
				std: 25,
				notes: {
					std: '',
				},
			},
		},
		actions: [
			{
				name: 'Poisoned Welcome',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature attempts to open the door',
				entries: [
					'Every creature within 10 feet of the door is exposed to violet venom poison.',
					{
						type: 'affliction',
						name: 'Violet Venom',
						traits: ['contact', 'poison'],
						DC: 17,
						savingThrow: 'Fortitude',
						onset: '1 minute',
						maxDuration: '6 rounds',
						stages: [
							{
								stage: 1,
								entry: '{@damage 1d6} poison plus {@condition enfeebled||enfeebled 1}',
								duration: '1 round',
							},
							{
								stage: 2,
								entry: '{@damage 1d6} poison plus {@condition drained||drained 1}',
								duration: '1 round',
							},
							{
								stage: 3,
								entry: '{@damage 2d6} poison plus {@condition enfeebled||enfeebled 1}',
								duration: '1 round',
							},
						],
					},
				],
			},
		],
	},
	{
		name: 'Falling Bridge',
		source: 'GW1',
		page: 0,
		level: 3,
		traits: ['mechanical', 'trap'],
		stealth: {
			dc: 23,
			minProf: 'trained',
		},
		description: [
			"The frayed ropes on both sides of this bridge snap when enough weight is put on the bridge's center.",
		],
		disable: {
			entries: [
				'DC 20 {@skill Survival} (trained) to reinforce and secure the ropes on one side of the bridge',
			],
		},
		defenses: {
			ac: {
				std: 10,
			},
			savingThrows: {
				fort: {
					std: 1,
				},
				ref: {
					std: 1,
				},
			},
			hp: {
				'Rope ': 6,
			},
			bt: {
				'Rope ': 3,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				name: 'Collapse',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger:
					'A Medium or larger creature steps onto the middle of the bridge (any of the squares marked "T" on the map)',
				entries: [
					'The ropes on both sides of the bridge snap simultaneously, causing the bridge to collapse. Any creature on the bridge falls to the forest floor 50 feet below and takes 25 bludgeoning damage. A creature within 10 feet of one end of the bridge can attempt a DC 18 Reflex saving throw to Grab a Ledge along the side of either A8 or A13.',
					'If one side of the bridge has been disabled by resecuring the ropes, a character on any section of the bridge can attempt a DC 18 Reflex save to hang onto the bridge as one side of it falls. The dangling bridge thereafter functions as a ladder connecting either area',
				],
			},
			{
				name: 'A8 or A13',
				activity: {
					unit: 'varies',
					entry: 'whichever was secured',
				},
				components: ['to the forest floor.'],
				entries: [],
			},
		],
	},
	{
		name: 'Corpse Disposal',
		source: 'GW1',
		page: 0,
		level: 2,
		traits: ['mechanical', 'trap'],
		stealth: {
			dc: 21,
			notes: '(or 0 if the trapdoor is disabled or {@condition broken})',
		},
		description: [
			'A wooden trapdoor conceals a spike-filled pit 10 feet square and 20 feet deep. The DC to {@action Climb} out of the pit is 10.',
		],
		disable: {
			entries: ['DC 18 {@skill Thievery} (trained) to jam the trapdoor open'],
		},
		defenses: {
			ac: {
				std: 18,
			},
			savingThrows: {
				fort: {
					std: 7,
				},
				ref: {
					std: 7,
				},
			},
			hardness: {
				'Trapdoor ': 9,
			},
			hp: {
				'Trapdoor ': 30,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				name: 'Dispose',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature steps onto the trapdoor (marked "T" on the map)',
				entries: [
					"The triggering creature falls into the pit. The creature can use the {@action Grab an Edge} reaction to avoid falling. Failing that, the creature falls 20 feet (taking 10 bludgeoning damage from the fall) and takes {@damage 3d6} piercing damage from the metal spikes jutting up from the pit's floor. A creature who takes damage from the spikes is exposed to tetanus.",
					{
						type: 'affliction',
						name: 'Tetanus',
						traits: ['disease'],
						DC: 14,
						savingThrow: 'Fortitude',
						onset: '10 days',
						stages: [
							{
								stage: 1,
								entry: '{@condition clumsy||clumsy 1}',
								duration: '1 week',
							},
							{
								stage: 2,
								entry: "{@condition clumsy||clumsy 2} and can't speak",
								duration: '1 day',
							},
							{
								stage: 3,
								entry: '{@condition paralyzed} with spasms',
								duration: '1 day',
							},
							{
								stage: 4,
								entry: 'death',
							},
						],
					},
				],
			},
		],
	},
	{
		name: 'Shadow Guards',
		source: 'GW1',
		page: 0,
		level: 2,
		traits: ['complex', 'evocation', 'magical', 'shadow', 'trap'],
		stealth: {
			bonus: 11,
			minProf: 'trained',
			notes: 'to notice the runes {@condition concealed} among the drawings',
		},
		description: [
			'Shadowy caricatures of elves peel themselves from the floor and attack everyone in the room.',
		],
		disable: {
			entries: [
				'DC 16 {@skill Acrobatics} to move through the room without touching any of the runes, followed by DC 18',
			],
		},
		defenses: {
			ac: {
				std: 18,
			},
			savingThrows: {
				fort: {
					std: 11,
				},
				ref: {
					std: 11,
				},
			},
			hardness: {
				std: 8,
			},
			hp: {
				std: 32,
				notes: {
					std: '',
				},
			},
		},
		actions: [
			{
				name: 'Thievery',
				traits: ['trained'],
				entries: [
					'to carve them out of the wood without triggering them; or dispel magic (1st level; counteract DC 16) to counteract the runes',
				],
			},
			{
				name: 'Shadow Rush',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature enters the room',
				entries: [
					'After waiting 1 round, the trap animates its shadowy stick figures and makes a painted spear {@action Strike} against each creature in the room. The trap rolls initiative.',
				],
			},
		],
		routine: [
			'(1 action) The drawings stab at each character in the room with spears drawn from sharp lines.',
		],
		attacks: [
			{
				range: 'Melee',
				name: 'painted spear',
				attack: 11,
				damage: '{@damage 1d10+4} piercing',
			},
		],
		reset: [
			'The trap deactivates and resets after 1 minute. The drawings cannot pursue characters out of the room.',
		],
	},
	{
		name: 'Mindhammer Mushrooms',
		source: 'GW1',
		page: 0,
		level: 3,
		traits: ['environmental', 'fungus'],
		stealth: {
			dc: 20,
			minProf: 'trained',
			notes: 'to notice small animal skeletons among the mushrooms',
		},
		description: [
			'The mushrooms emit powerful psychic blasts that overwhelm potential predators with exhausting psychedelic visions.',
		],
		disable: {
			entries: [
				'DC 20 {@skill Survival} (trained) to navigate a safe path without triggering the mushrooms',
			],
		},
		defenses: {
			ac: {
				std: 16,
			},
			savingThrows: {
				fort: {
					std: 10,
				},
				ref: {
					std: 8,
				},
			},
			hp: {
				std: 20,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
			weaknesses: [
				{
					name: 'fire',
					amount: 10,
				},
			],
		},
		actions: [
			{
				name: 'Psychic Blast',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature walks through the mushrooms',
				entries: [
					'The mushrooms release a loud hum of psychic energy. The triggering creature takes {@damage 2d8+8} mental damage (DC 23 basic Will save). On a critical failure, the creature is {@condition fatigued}.',
				],
			},
		],
		reset: ['The mushrooms must rest for 24 hours before they can emit another Psychic Blast.'],
	},
	{
		name: 'Sacred Geyser',
		source: 'GW1',
		page: 0,
		level: 3,
		traits: ['environmental', 'fire', 'water'],
		stealth: {
			dc: 19,
			minProf: 'trained',
		},
		description: [
			'A geyser of boiling water erupts at any character who attempts to take water from the oasis.',
		],
		disable: {
			entries: [
				'DC 21 {@skill Thievery} (trained) to concoct a mechanism for indirectly harvesting the water from a safe distance',
			],
		},
		actions: [
			{
				name: 'Boiling Geyser',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger:
					'A creature dips a vessel or otherwise attempts to remove water from the oasis',
				entries: [
					'A jet of magical boiling water targets the triggering creature and affects all creatures within 5 feet of the target. Creatures caught in the burst take {@damage 2d10+13} fire damage (basic DC 23 Reflex save).',
				],
			},
		],
		reset: [
			'The geyser resets automatically and adapts to previous circumvention, requiring a new check to disable it each time.',
		],
	},
	{
		name: 'Poisonous Atmosphere',
		source: 'GW1',
		page: 0,
		level: 1,
		traits: ['complex', 'environmental', 'magical', 'mental', 'poison'],
		stealth: {
			bonus: 5,
			minProf: 'expert',
			notes: 'to identify the source of sudden nausea',
		},
		description: [
			"Aucturn's poisonous, magical atmosphere has strange effects on the planet's creatures.",
		],
		disable: {
			entries: [
				'DC 20 {@skill Survival} (trained) or {@skill Occultism} (trained) to breathe pockets of safe air trapped in bags and clothing',
			],
		},
		actions: [
			{
				name: 'Poisonous Atmosphere',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['illusion', 'mental', 'occult'],
				trigger: 'A non-native creature breathes the atmosphere',
				entries: [
					'The triggering creature must attempt a DC 17 Fortitude save. The hazard then rolls initiative.',
					{
						type: 'successDegree',
						entries: {
							'Critical Success': [
								'The creature is invigorated by the atmosphere and is {@condition quickened} for 1 round.',
							],
							Success: ['The creature is unaffected.'],
							Failure: ['The creature is {@condition clumsy||clumsy 1}.'],
							'Critical Failure': [
								'The creature is {@condition confused} for 1 round.',
							],
						},
					},
				],
			},
		],
		routine: [
			'(1 action; illusion, mental, occult) The atmosphere continues to affect all creatures in the area, requiring a new Fortitude save each round against its Poisonous Atmosphere (above). A creature holding its breath gains a +2 circumstance bonus to the save.',
		],
	},
	{
		name: 'Rushing Wind',
		source: 'GW1',
		page: 0,
		level: 2,
		traits: ['complex', 'environmental'],
		stealth: {
			bonus: 7,
			minProf: 'trained',
			notes: 'to detect the change in pressure',
		},
		description: ['A raging wind sucks creatures in the area toward the aiudara.'],
		disable: {
			entries: [
				"DC 20 {@skill Thievery} (trained) or {@skill Arcana} (trained) to recognize what's happening and craft a patch to block air from escaping through the portal",
			],
		},
		actions: [
			{
				name: 'Gale',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'The aiudara appears here on Eox',
				entries: [
					'A jet of wind pulls creatures caught between the worlds toward the archway. The hazard rolls initiative.',
				],
			},
		],
		routine: [
			'(1 action) The hazard uses its action to suck each creature (except the cairn wight) toward the aiudara. Each affected creature must attempt a DC 18 Fortitude save.',
			{
				type: 'successDegree',
				entries: {
					Success: ['The creature is unaffected.'],
					Failure: [
						"The creature is pulled 5 feet toward the aiudara and is {@condition stunned||stunned 1}. If the creature is already adjacent to the aiudara, it doesn't move but is {@condition stunned||stunned 2}.",
					],
					'Critical Failure': [
						"The creature is pulled 10 feet toward the aiudara, falls {@condition prone}, and is {@condition stunned||stunned 1}. If the creature is already adjacent to the aiudara, it doesn't move but falls {@condition prone} and is {@condition stunned||stunned 2}.",
					],
				},
			},
		],
	},
	{
		name: 'Formian Sting Trench',
		source: 'GW1',
		page: 0,
		level: 4,
		traits: ['mechanical', 'trap'],
		stealth: {
			dc: 25,
			minProf: 'trained',
		},
		description: [
			'A thin layer of canvas conceals this 10-foot-square pit, the walls of which are studded with dagger-sized formian stingers. Creatures that fall into the trap risk being gouged by the poisonous barbs.',
		],
		disable: {
			entries: ['DC 22 {@skill Thievery} (trained)'],
		},
		defenses: {
			ac: {
				std: 18,
			},
			savingThrows: {
				fort: {
					std: 8,
				},
				ref: {
					std: 8,
				},
			},
			hp: {
				'Canvas ': 30,
			},
			bt: {
				'Canvas ': 15,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				name: 'Entrench',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['attack'],
				trigger: 'A creature walks onto the canvas',
				entries: [
					'The creature falls into the {@condition concealed} trench and takes falling damage (typically 10 bludgeoning damage). The creature is also gouged by three poisoned stingers as they fall. The creature can use the {@action Grab an Edge} reaction to avoid falling.',
				],
			},
			{
				type: 'affliction',
				name: 'Formian Trench Poison',
				traits: ['poison'],
				DC: 21,
				savingThrow: 'Fortitude',
				maxDuration: '6 rounds',
				stages: [
					{
						stage: 1,
						entry: '{@damage 1d6} poison damage',
						duration: '1 round',
					},
					{
						stage: 2,
						entry: '{@damage 1d6} poison damage and {@condition clumsy||clumsy 1}',
						duration: '1 round',
					},
					{
						stage: 3,
						entry: '{@damage 1d6} poison damage, {@condition clumsy||clumsy 1}, and {@condition enfeebled||enfeebled 1}',
						duration: '1 round',
					},
					{
						stage: 4,
						entry: '{@damage 2d6} poison damage, {@condition clumsy||clumsy 1}, and {@condition enfeebled||enfeebled 1}',
						duration: '1 round',
					},
				],
			},
		],
		attacks: [
			{
				range: 'Melee',
				name: 'stinger',
				attack: 17,
				damage: '{@dice 1d8+3} plus formian trench poison',
			},
		],
		reset: [
			'Creatures can still fall into the trap, but the canvas must be reset manually for the trap to become {@condition hidden} again.',
		],
	},
	{
		name: 'Haunted Aiudara',
		source: 'GW1',
		page: 0,
		level: 6,
		traits: ['complex', 'haunt'],
		stealth: {
			bonus: 15,
			minProf: 'expert',
		},
		description: [
			'The spiritual imprints of long-dead explorers haunt this aiudara, manifesting as a trio of astral wraiths who guard the gateway jealously.',
		],
		disable: {
			entries: [
				"DC 25 {@skill Religion} (trained) to exorcise one of the wraiths or DC 25 {@skill Occultism} (expert) to erase one of the wraith's astral sigils; three successful checks are required to disable the haunt",
			],
		},
		actions: [
			{
				name: 'Forceful Screech',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['divine', 'necromancy'],
				trigger: 'A creature comes within 30 feet of the aiudara',
				entries: [
					'Three aiudara wraiths screech in unison and manifest to protect the arch. Each creature within 30 feet must attempt a DC 27 Will save. The haunt rolls initiative.',
					{
						type: 'successDegree',
						entries: {
							Success: ['The creature is unaffected.'],
							Failure: ['The creature takes {@damage 2d8+9} force damage.'],
							'Critical Failure': [
								'The creature takes {@damage 4d8+9} force damage and is {@condition fatigued}.',
							],
						},
					},
				],
			},
		],
		routine: [
			'(3 actions; conjuration, divine, teleportation) With spectral claws, the aiudara wraiths hurl trespassers through time and space. Each of the three wraiths has 1 action which it can use to make a forceful hand {@action Strike} against a creature within 60 feet. The haunt loses 1 action for each successful check to disable the haunt.',
			'When the haunt rolls a critical hit to {@action Strike} a creature, the creature is instantly shunted to an empty space within 30 feet. The haunt chooses which space the creature is transported to.',
		],
		attacks: [
			{
				range: 'Melee',
				traits: ['magical'],
				name: 'forceful hand',
				attack: 17,
				damage: '{@damage 2d8+9} force',
				noMAP: true,
			},
		],
		reset: [
			'The aiudara wraiths disperse after 1 minute, but the haunt resets after 24 hours.',
		],
	},
	{
		name: 'Blooming Jijioa',
		source: 'GW1',
		page: 0,
		level: 5,
		traits: ['environmental'],
		stealth: {
			dc: 26,
			minProf: 'expert',
		},
		description: [
			'An {@condition invisible} solar flare causes this patch of unassuming ground cover to suddenly bloom into a radioactive field.',
		],
		disable: {
			entries: [
				'DC 22 {@skill Survival} (trained) to remove a 5-foot square of jijioa, or 5 points of fire damage to destroy an affected area',
			],
		},
		defenses: {
			ac: {
				std: 25,
			},
			savingThrows: {
				fort: {
					std: 17,
				},
				ref: {
					std: 9,
				},
			},
			hp: {
				std: 52,
			},
			bt: {
				std: 26,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
			weaknesses: [
				{
					name: 'fire',
					amount: 10,
				},
			],
		},
		actions: [
			{
				name: 'Solar Bloom',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'The jijioa patch is exposed to a solar flare',
				entries: [
					'The countless jijioa flowers suddenly bloom, magnifying the ambient heat of the sun a hundredfold.',
					'Creatures in the jijioa patch take {@damage 4d6} fire damage (DC 22 basic Fortitude save). Creatures that end their turn in the patch continue to take damage in this way as long as the jijioa is in bloom.',
				],
			},
		],
		reset: ['An hour after blooming, a jijioa patch goes dormant for 1 week.'],
	},
	{
		name: 'Soporific Lecture',
		source: 'GW3',
		page: 13,
		level: 8,
		traits: ['uncommon', 'mechanical', 'trap'],
		stealth: {
			dc: 28,
			minProf: 'expert',
		},
		description: [
			'Several {@condition hidden} nozzles spray colorless sleeping gas into the seating area.',
		],
		disable: {
			entries: [
				'DC 28 {@skill Thievery} (expert) to crimp shut the primary feeding tube for the gas, or DC 31 {@skill Perception} (expert) to discover the {@condition hidden} bypass switch next to the door to area A3 that shuts the trap off',
			],
		},
		actions: [
			{
				name: 'Gas Spray',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['incapacitation', 'mental', 'poison', 'sleep'],
				trigger:
					'Pressure is applied to any of the steps in the middle of the seating area, or applied to the manual trigger on the stage. This manual trigger can activate the trap even if its {@condition hidden} bypass switch is engaged',
				entries: [
					'Sleeping gas is silently sprayed into the seating area. All creatures in the area must roll a DC 26 Will save to resist its effects.',
					'The gas persists in the area for 3 rounds before becoming inert. Any creature who ends their turn in this area during these 3 rounds must attempt a new DC 26 Will save.',
					{
						type: 'successDegree',
						entries: {
							'Critical Success': [
								'The creature is unaffected and realizes that the area has been gassed.',
							],
							Success: ["The creature is unaffected but doesn't notice the gas."],
							Failure: [
								"The creature feels a bit drowsy and lethargic, and becomes {@condition fatigued} for 1 minute. If the creature is already {@condition fatigued}, it instead falls {@condition unconscious}. If it's still {@condition unconscious} after 1 minute, it wakes up automatically.",
							],
							'Critical Failure': [
								"The creature falls {@condition unconscious}. If it's still {@condition unconscious} after 1 hour, it wakes up automatically.",
							],
						},
					},
				],
			},
		],
	},
	{
		name: "Etward's Nightmare",
		source: 'GW3',
		page: 19,
		level: 9,
		traits: ['unique', 'complex', 'haunt'],
		stealth: {
			bonus: 30,
			minProf: 'master',
		},
		description: [
			'The incense burners begin to smoke, filling the air with strangely nostalgic scents.',
		],
		disable: {
			entries: [
				'DC 26 {@skill Occultism} (expert) to enter a state akin to lucid dreaming so as to unweave the nightmare from within, or DC 30 {@skill Intimidation} (master) to stand resolute against the nightmares and turn the fear back upon itself',
			],
		},
		actions: [
			{
				name: 'Light Incense Burners',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['enchantment', 'incapacitation', 'mental', 'occult', 'sleep'],
				trigger:
					'A creature lies down on the bed, or a living creature spends more than 3 rounds inside this room',
				entries: [
					'Incense swiftly fills the room (even if the incense burners have been removed or were destroyed). All creatures in area A12 must attempt a DC 32 Fortitude save. The haunt then rolls initiative.',
					{
						type: 'successDegree',
						entries: {
							'Critical Success': ['The creature is unaffected.'],
							Success: [
								"The creature is {@condition sickened||sickened 1} by the incense's scent.",
							],
							Failure: [
								"The creature falls {@condition unconscious}. If it's still {@condition unconscious} after 1 minute, it wakes up automatically.",
							],
							'Critical Failure': [
								"As failure, but if it's still {@condition unconscious} after 1 hour, it wakes up automatically.",
							],
						},
					},
				],
			},
			{
				name: 'DC 28',
				entries: [
					"Fortitude saving throw. If at the end of the round there are no {@condition unconscious} creatures in the room, Etward's nightmare ends and the trap deactivates.",
					{
						type: 'successDegree',
						entries: {
							'Critical Success': ['The creature is unaffected and wakes up.'],
							Success: [
								'The creature remains {@condition unconscious} and takes {@damage 1d10} cold damage and {@damage 1d10} mental damage. This damage does not wake the creature, and those who are awake can see the {@condition unconscious} creature thrash as if in the throes of a nightmare while their body rimes over with layers of frost. The creature can fight against the bitter cold and monstrous shapes by attempting a DC 28 Will save as a three-action activity on its turn\u2014on a success, the creature wakes up.',
							],
							Failure: [
								'As success, but {@damage 1d10+6} cold and {@damage 1d10+6} mental damage, and with a DC 32 Will save to wake up.',
							],
							'Critical Failure': [
								'The creature remains {@condition unconscious} and takes {@damage 2d10+12} cold damage and {@damage 2d10+12} mental damage.',
							],
						},
					},
				],
			},
		],
		routine: [
			"(2 actions; cold, enchantment, mental, occult) The haunt uses its first action to light incense burners again, forcing any creature that isn't already {@condition unconscious} to save against that effect once more. Its second action is to cause any {@condition unconscious} creatures in the room to experience horrific, vivid dreams about being lost in the arctic during a blizzard, while enormous furred figures\u2014saumen kar\u2014lunge at them through the snow to attack repeatedly. Each {@condition unconscious} creature must attempt a",
		],
		reset: ['The hazard resets when Etward dreams in this room.'],
	},
	{
		name: 'Dream-Poisoned Door',
		source: 'GW3',
		page: 54,
		level: 12,
		traits: ['magical', 'trap'],
		stealth: {
			dc: 35,
			minProf: 'master',
		},
		description: [
			"Eerie shapes manifest within the doorway as it's opened, conjuring a group of four animate dreams into being.",
		],
		disable: {
			entries: [
				"DC 30 {@skill Occultism} (expert) to concentrate on the eldritch energies and diffuse them through meditation, DC 35 {@skill Thievery} (master) to scratch warding runes along the door's hinges and block dreams from manifesting, or dispel magic (6th level; counteract DC 30) to counteract the trap",
			],
		},
		actions: [
			{
				name: 'Manifest Dream Guardians',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['conjuration', 'occult'],
				trigger: 'The door is opened',
				entries: [
					'A group of four animate dreams manifest in the area just beyond the door. These four animate dreams each appear as vaguely whale-shaped but human-sized masses of tendrils. They swim through he air and attack the intruders at once, fighting to the death and pursuing any who flee the temple.',
				],
			},
		],
	},
	{
		name: 'Pouncing Tiger Haunt',
		source: 'QFF1',
		page: 42,
		level: 2,
		traits: ['haunt'],
		stealth: {
			dc: 21,
			minProf: 'trained',
		},
		description: [
			'A cave painting of a great cat roars to life and leaps off the wall to attack.',
		],
		disable: {
			entries: [
				'DC 18 {@skill Nature} (trained) or {@skill Religion} (trained) to quell the spirit',
			],
		},
		defenses: {
			ac: {
				std: 18,
			},
			savingThrows: {
				fort: {
					std: 11,
				},
				ref: {
					std: 5,
				},
			},
			hardness: {
				std: 8,
			},
			hp: {
				std: 30,
			},
			bt: {
				std: 15,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
			weaknesses: [
				{
					name: 'acid',
					amount: 5,
				},
			],
		},
		actions: [
			{
				name: 'Tiger Slash',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A living creature approaches within 5 feet of the cave painting',
				entries: [
					'The haunt deals {@damage 4d8} slashing damage with semisolid claws (DC 18 basic Will save). On a failed save, the target is also {@condition frightened||frightened 1} and {@condition fleeing} for 1 round (or {@condition frightened||frightened 2} and {@condition fleeing} for 1 minute on a critical failure).',
				],
			},
		],
		reset: ["If the cave painting isn't destroyed, the haunt resets after 1 day"],
	},
	{
		name: 'Hail of Razor Stones',
		source: 'QFF1',
		page: 46,
		level: 2,
		traits: ['mechanical', 'trap'],
		stealth: {
			dc: 21,
			minProf: 'trained',
		},
		description: [
			'When a {@condition concealed} cord is tripped, several sharp stones fall onto the square containing the cord.',
		],
		disable: {
			entries: ['DC 18 {@skill Thievery} (trained) to safely cut the trip cord'],
		},
		defenses: {
			ac: {
				std: 16,
			},
			savingThrows: {
				fort: {
					std: 9,
				},
				ref: {
					std: 5,
				},
			},
			hardness: {
				std: 8,
			},
			hp: {
				std: 32,
			},
			bt: {
				std: 16,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				name: 'Deadfall',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature walks into the square containing the trip cord',
				entries: [
					'Falling rocks deal {@damage 4d8} slashing damage (DC 19 basic Reflex save) to any creature in the square, possibly pinning them to the ground.',
					'On a failed save, the creature falls {@condition prone}; on a critical failure, the creature is {@condition immobilized} (DC 17 to {@action Escape}). An adjacent creature can attempt a DC 19 {@skill Athletics} check to shove the rocks aside to free an {@condition immobilized} creature.',
				],
			},
		],
	},
	{
		name: "Death's Slumber Ward",
		source: 'QFF1',
		page: 57,
		level: 5,
		traits: ['complex', 'magical', 'trap'],
		stealth: {
			bonus: 16,
			minProf: 'expert',
		},
		description: [
			'A whirlwind of four ephemeral, magical threads dispels the undead and shrouds the living in an endless slumber.',
		],
		disable: {
			entries: [
				"DC 23 {@skill Religion} (expert) or DC 21 {@skill Performance} (trained) to dissipate one of the four threads. Characters who failed or critically failed a {@skill Performance} check to participate in Grandfather Eiwa's funeral in Chapter 1 have been able to reflect on the experience; these characters gain a +2 circumstance bonus to their {@skill Performance} checks to disable this trap. The trap is destroyed when all four threads are dissipated.",
			],
		},
		actions: [
			{
				name: 'Breath of Pharasma',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['divine', 'necromancy'],
				trigger: 'A living or undead creature opens the trunk',
				entries: [
					'The ephemeral winds rise, sapping energy. All living and undead creatures within 60 feet must succeed at a DC 22 Will save or become {@condition slowed||slowed 1} ({@condition slowed||slowed 2} on a critical failure). The trap then rolls initiative.',
				],
			},
		],
		routine: [
			'(4 actions) Each thread of energy passes through a random living or undead creature within 60 feet, dealing {@dice 4d6} damage (DC 22 basic Will save) to the creature.',
			'A thread deals negative damage to living creatures and positive damage to undead creatures. Each thread passes through a different random creature, if possible.',
			"Each dissipated thread reduces the trap's number of actions by 1.",
		],
		reset: [
			'The haunt deactivates 1 minute after no living or undead creatures are within 100 feet, then resets.',
		],
	},
	{
		name: 'Acid Strongbox Trap',
		source: 'QFF1',
		page: 60,
		level: 4,
		traits: ['acid', 'evocation', 'magical', 'trap'],
		stealth: {
			dc: 22,
			minProf: 'trained',
		},
		description: [
			'An {@condition invisible} magic field around the strongbox releases a spray of acid when disturbed.',
		],
		disable: {
			entries: [
				'DC 22 {@skill Thievery} (expert) to harmlessly bleed away the magical field or dispel magic (2nd level; counteract DC 20) to dispel it.',
			],
		},
		actions: [
			{
				name: 'Acidic Spray',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['acid', 'arcane', 'evocation'],
				trigger: 'A creature touches the strongbox directly or with a held tool',
				entries: [
					'The trap deals {@damage 4d8+10} acid damage in a 15-foot cone in the direction of the triggering creature (DC 21 basic Reflex save).',
				],
			},
		],
	},
	{
		name: 'Falling Stalactites',
		source: 'QFF2',
		page: 6,
		level: 3,
		traits: ['environmental'],
		stealth: {
			dc: 23,
			minProf: 'trained',
		},
		description: ['Unstable stalactites fall from the ceiling.'],
		disable: {
			entries: [
				'DC 20 {@skill Survival} (trained) to remove a stalactite without triggering a fall',
			],
		},
		defenses: {
			ac: {
				std: 16,
			},
			savingThrows: {
				fort: {
					std: 12,
				},
				ref: {
					std: 12,
				},
			},
			hardness: {
				std: 12,
			},
			hp: {
				std: 42,
			},
			bt: {
				std: 21,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				name: 'Fall',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['attack'],
				trigger: 'A stalactite is damaged or touched',
				entries: [
					'The stalactite falls, making an attack against each creature underneath.',
				],
			},
		],
		attacks: [
			{
				range: 'Melee',
				name: 'stalactite',
				attack: 16,
				damage: '{@damage 2d10+13} bludgeoning',
			},
		],
	},
	{
		name: 'Cave-In',
		source: 'QFF2',
		page: 6,
		level: 4,
		traits: ['environmental'],
		stealth: {
			dc: 22,
			minProf: 'trained',
		},
		description: ['The tunnel collapses, filling the passage with stone.'],
		disable: {
			entries: [
				'DC 25 {@skill Survival} (trained) to prop up the tunnel ceiling without triggering a collapse',
			],
		},
		defenses: {
			ac: {
				std: 21,
			},
			savingThrows: {
				fort: {
					std: 14,
				},
				ref: {
					std: 14,
				},
			},
			hardness: {
				std: 13,
			},
			hp: {
				std: 46,
			},
			bt: {
				std: 23,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				name: 'Collapse',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature moves into the unstable tunnel',
				entries: [
					'The tunnel collapses in a cave-in that deals {@damage 4d8+10} bludgeoning damage to the triggering creature and all creatures in area A2 (DC 21 basic Reflex save). On a failed save, the triggering creature is {@condition immobilized} ({@action Escape} DC 21). This collapse fully blocks the tunnel (area A2), making it impassable.',
				],
			},
		],
	},
	{
		name: 'Oil Explosion',
		source: 'QFF2',
		page: 7,
		level: 4,
		traits: ['environmental', 'fire'],
		stealth: {
			dc: 22,
			minProf: 'trained',
		},
		description: [
			'The flammable oil catches flame and explodes, burning up in a ball of fire.',
		],
		disable: {
			entries: [
				'DC 25 {@skill Survival} (trained) or DC 23 {@skill Crafting} to neutralize the oil without setting it alight',
			],
		},
		defenses: {
			ac: {
				std: 21,
			},
			savingThrows: {
				fort: {
					std: 14,
				},
				ref: {
					std: 14,
				},
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				name: 'Explode',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'An open flame is brought into area A4',
				entries: [
					'The oil on the walls explodes, dealing {@damage 4d8+10} fire damage to all creatures and objects in areas A4 and A3 (DC 21 basic Reflex save).',
				],
			},
		],
	},
	{
		name: 'Rockfall Ceiling',
		source: 'QFF2',
		page: 11,
		level: 5,
		traits: ['mechanical', 'trap'],
		stealth: {
			dc: 20,
			minProf: 'trained',
		},
		description: [
			"A load of rocks, held up by a rope pulley, is dropped on the cavern's lower level.",
		],
		disable: {
			entries: ['DC 25 {@skill Thievery} (trained) to pin the pulley in place'],
		},
		defenses: {
			ac: {
				std: 22,
			},
			savingThrows: {
				fort: {
					std: 15,
				},
				ref: {
					std: 15,
				},
			},
			hardness: {
				std: 12,
			},
			hp: {
				std: 50,
			},
			bt: {
				std: 25,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				name: 'Drop Rocks',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature holding the rope pulley pulls it',
				entries: [
					'The net releases, dropping rocks on all creatures and objects in the lower half of area A15, dealing {@damage 4d8+14} bludgeoning damage (DC 26 basic Reflex save). The area then becomes difficult terrain.',
				],
			},
		],
	},
	{
		name: 'Abyss-Warped Trees',
		source: 'QFF2',
		page: 13,
		level: 4,
		traits: ['unique', 'complex', 'environmental'],
		stealth: {
			dc: 12,
			minProf: 'trained',
			notes: 'to determine the trees can move',
		},
		description: [
			'A forest of fiendish trees swing their branches and shift their roots to bludgeon and trip creatures in the tainted grove (area A21).',
		],
		disable: {
			entries: [
				"DC 22 {@skill Survival} (trained) to find a location the trees can't reach or DC 24 {@skill Religion} to recite a prayer that temporarily casts out the fiendish energy inside a single tree in the grove, disabling it for 1 minute. A disabled or destroyed tree creates a 5-foot-square area in the grove that's safe from this hazard.",
			],
		},
		defenses: {
			ac: {
				std: 18,
			},
			savingThrows: {
				fort: {
					std: 14,
				},
				ref: {
					std: 14,
				},
			},
			hardness: {
				std: 10,
			},
			hp: {
				std: 40,
				notes: {
					std: 'per tree',
				},
			},
			bt: {
				std: 20,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
			weaknesses: [
				{
					name: 'fire',
					amount: 5,
				},
			],
		},
		actions: [
			{
				name: 'Shift Roots',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature ends its movement in the grove',
				entries: [
					'The trees throughout the tainted grove shift their roots wildly, making the area difficult terrain, then the Abyss-warped trees roll initiative.',
				],
			},
			{
				name: 'Tighten Grip',
				activity: {
					number: 1,
					unit: 'free',
				},
				trigger:
					'The Abyss-warped trees critically hit a creature with a branch {@action Strike}',
				entries: [
					'The Abyss‑warped trees loop their branches around the triggering creature, grabbing it ({@action Escape} DC 21).',
				],
			},
		],
		routine: [
			'(4 actions) The Abyss-warped trees use their first action each round to lash their roots; each creature in the tainted grove must succeed at a DC 21 Reflex save or fall {@condition prone}. The Abyss-warped trees use their second, third, and fourth actions to make branch Strikes against up to three different creatures in the tainted grove.',
		],
		reset: [
			'The Abyss-warped trees cease moving 1 minute after no living creatures are in the tainted grove.',
			'They reset immediately. A disabled tree reanimates after 1 minute. A destroyed tree regrows after 1 month.',
		],
		attacks: [
			{
				range: 'Melee',
				name: 'branch',
				attack: 14,
				damage: '{@damage 2d8+5} bludgeoning',
			},
		],
	},
	{
		name: 'Punishing Altar',
		source: 'QFF2',
		page: 15,
		level: 4,
		traits: ['unique', 'magical', 'necromancy', 'negative', 'trap'],
		stealth: {
			dc: 25,
			minProf: 'trained',
			notes: 'to notice the bowl is the center point for a magical trap',
		},
		description: [
			'The bowl releases a wave of negative energy when a living creature approaches without displaying a religious symbol of Venexus.',
		],
		disable: {
			entries: [
				'DC 22 {@skill Thievery} (expert) to remove the bowl without triggering the magic, or dispel magic (2nd level, counteract DC 20) to counteract the runes',
			],
		},
		defenses: {
			ac: {
				std: 21,
			},
			savingThrows: {
				fort: {
					std: 14,
				},
				ref: {
					std: 14,
				},
			},
			hardness: {
				std: 12,
			},
			hp: {
				std: 46,
			},
			bt: {
				std: 23,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				name: 'Necromantic Wave',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger:
					'A living creature approaches within 10 feet of the bowl without displaying a religious symbol of Venexus',
				entries: [
					'The bowl releases a wave of necromantic energy, dealing {@damage 4d8+10} negative damage (DC 21 basic Reflex save) to the triggering creature and all creatures in the area not displaying a religious symbol of Venexus. On a critical failure, a creature becomes {@condition drained||drained 1}.',
				],
			},
		],
	},
	{
		name: 'Final Flight',
		source: 'QFF2',
		page: 26,
		level: 5,
		traits: ['unique', 'haunt'],
		stealth: {
			dc: 26,
			minProf: 'expert',
		},
		description: [
			'A creature experiences the death of a priest carried off by griffons and fed to their chicks.',
		],
		disable: {
			entries: [
				'DC 22 {@skill Diplomacy} (trained) to soothe the restless spirits, or DC 24 {@skill Religion} (trained) to recite a prayer honoring the deceased; two successful checks are required to disable the haunt',
			],
		},
		actions: [
			{
				name: 'Final Flight',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['illusion', 'mental', 'occult'],
				trigger: 'A creature enters the gathering circle',
				entries: [
					"The triggering creature experiences the last moments of the priest who once tended the Lea of Honored Souls. Griffons swoop down from the sky and snatch the priest up in their claws, dealing {@damage 1d8+7} slashing damage. They're carried southwest across the valley to a mountain peak and dropped into a nest of young griffons. As the chicks devour the priest, the character takes {@damage 1d8+7} piercing damage and {@damage 2d8} mental damage. The affected creature must then attempt a DC 22 Will save.",
					{
						type: 'successDegree',
						entries: {
							'Critical Success': ['The creature is unaffected.'],
							Success: [
								'The creature takes half damage from all damage dealt by the haunt.',
							],
							Failure: ['The creature takes full damage.'],
							'Critical Failure': [
								"The creature takes full damage and can't shake off the vision; they take {@damage 1d8} {@condition persistent damage||persistent bleed damage} and are {@condition frightened||frightened 1}\u2014believing they're being eaten alive\u2014as long as the bleed damage persists.",
							],
						},
					},
				],
			},
		],
		reset: [
			'The haunt deactivates 1 minute after all living creatures leave the Lea of Honored Souls. Ten minutes after deactivating, the haunt resets.',
		],
	},
	{
		name: 'Footsteps of Legends',
		source: 'QFF2',
		page: 31,
		level: 5,
		traits: ['unique', 'haunt'],
		stealth: {
			dc: 23,
			minProf: 'expert',
		},
		description: [
			'The characters witness Burning Mammoths walking this mountain pass in ages long past.',
		],
		disable: {
			entries: [
				'DC 26 {@skill Diplomacy} (trained) to convince the spirits to remain dormant, or DC 26 {@skill Religion} (trained) to ritually silence the spirits',
			],
		},
		actions: [
			{
				name: 'Ancestral Journey',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger:
					'A good-aligned spiritual descendant of the Burning Mammoth following enters the mountain pass',
				entries: [
					'Burning Mammoths from long ago appear alongside the party, walking the mountain pass as one united following. They walk in the footsteps of ancestors, heroes, and legends. Each creature that witnesses the vision gains a +1 status bonus to Will saving throws and all skill checks for 24 hours.',
				],
			},
		],
		reset: ['1 hour'],
	},
	{
		name: 'Forest Fire',
		source: 'QFF2',
		page: 35,
		level: 4,
		traits: ['complex', 'environmental', 'fire'],
		stealth: {
			bonus: -10,
		},
		description: [
			'A 10-foot-by-10-foot bonfire spreads to the surrounding forest on each of its turns.',
		],
		disable: {
			entries: [
				"A successful DC 22 {@skill Athletics}, {@skill Nature}, or {@skill Survival} check from an adjacent square is sufficient to smother one 5-foot-square of fire; each attempt is an {@action Interact} action. Dousing the flames automatically extinguishes one or more sections of fire, with no check. Water typically clears a 5-foot square if the amount is small (such as from a spell like create water or hydraulic push). Larger amounts of water, such as a full bucket, typically douse a 10-foot-by-10-foot area (or 4 squares in some other shape). Throwing a bucket of water on flames requires an {@action Interact} action. A waterskin doesn't contain enough water to put out even 1 square of fire.",
				'Cold can also put out fire, but only if the cold can affect an area; cold is less effective than water, so a frost vial puts out only 1 square of fire, and a ray of frost is ineffective.',
			],
		},
		actions: [
			{
				name: 'Stoke Flames',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A brimorak urges the fire to spread out of control',
				entries: ['The bonfire becomes a forest fire and rolls initiative.'],
			},
		],
		routine: [
			'On its turn, the fire spreads into a number of additional squares equal to half the number of squares the fire currently occupies (minimum 1 square). You determine the squares the fire spreads into. Any creature that ends its turn next to the flames takes {@damage 2d8+5} fire damage, or {@damage 4d8+10} fire damage if it ended its turn within the flames (DC 25 basic Reflex save in either case). A creature can take damage from the forest fire only once per round.',
		],
	},
	{
		name: 'Soul Draining Cage',
		source: 'QFF2',
		page: 38,
		level: 6,
		traits: ['magical', 'necromancy', 'negative', 'trap'],
		stealth: {
			dc: 25,
			minProf: 'expert',
			notes: 'or {@spell detect magic}',
		},
		description: [
			'Necromantic runes inscribed on the cage bars and lock drain the vitality of living creatures who interact with the cage.',
		],
		disable: {
			entries: [
				"{@skill Thievery} DC 25 (expert) to drain the runes' power harmlessly or dispel magic (3rd level; counteract DC 22) to counteract the rune",
			],
		},
		actions: [
			{
				name: 'Soul Drain',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['arcane', 'necromancy', 'negative'],
				trigger: 'A creature touches the cage bars, door, or lock directly or with a tool',
				entries: [
					'The trap deals {@damage 4d8+18} negative damage to the triggering creature, creatures inside the cage, and all creatures adjacent to the cage (DC 27 basic Fortitude save). On a failed save, a creature is also {@condition drained||drained 1}.',
				],
			},
		],
	},
	{
		name: 'Methane Flue',
		source: 'QFF3',
		page: 33,
		level: 8,
		traits: ['environmental'],
		stealth: {
			dc: 28,
			minProf: 'expert',
			notes: 'to hear hissing gas',
		},
		description: [
			'{@condition Invisible} but highly flammable natural gas has built up beneath the ground, where geological pressure can ignite it.',
		],
		disable: {
			entries: [
				'{@skill Survival} DC 28 to dig around the vent in a way that diffuses the fumes',
			],
		},
		actions: [
			{
				name: 'Flame Spurt',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature moves within 5 feet of the flue',
				entries: [
					'A fiery geyser of flaming gas explodes from the ground. Creatures within 5 feet of the flue take {@damage 4d10} fire damage (DC 30 basic Reflex save); creatures that fail the save also take {@damage 4d10} {@condition persistent damage||persistent fire damage}.',
				],
			},
		],
	},
	{
		name: 'Tar Pit',
		source: 'QFF3',
		page: 34,
		level: 9,
		traits: ['complex', 'environmental'],
		stealth: {
			dc: 30,
			minProf: 'expert',
		},
		description: [
			'A 15-foot-wide patch of tar covered with dirt and leaves attempts to capture creatures that step onto it.',
		],
		disable: {
			entries: [
				'{@skill Survival} DC 25 (expert) to disturb the surface and reveal the tar pit',
			],
		},
		actions: [
			{
				name: 'Capture',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A Huge or smaller creature walks onto the tar pit',
				entries: [
					"The triggering creature sinks into the tar pit up to its waist. The tar pit rolls initiative if it hasn't already.",
				],
			},
		],
		routine: [
			"(1 action) On its initiative, the tar pit pulls down each creature within it, thick tar adhering to the creature's body. A creature that was submerged up to its waist becomes submerged up to its neck, and a creature that was submerged up to its neck is pulled under and must hold its breath to avoid suffocation.",
			"A creature in the tar pit can attempt a DC 33 {@skill Athletics} check to {@action Climb} to either raise itself by one step (if it's submerged to its neck or full submerged) or to move 5 feet if it's submerged only up to its waist. On a critical failure, the creature is pulled down one step. Other creatures can {@action Aid} the creature, typically by using a rope or similar aid or by attempting to pull the creature out with their own DC 33 {@skill Athletics} check, with the same results as if the creature attempted the check. In addition to the usual results, a character adjacent to the tar pit who critically fails while Aiding moves into the tar pit. A creature that Climbs out of the tar pit escapes the hazard and lands {@condition prone} in an adjacent space.",
		],
		reset: [
			"Though the hazard still captures anyone who touches it, the surface doesn't become {@condition hidden} again until it settles, which takes 24 hours.",
		],
	},
	{
		name: 'Shattering Rune',
		source: 'QFF3',
		page: 37,
		level: 9,
		traits: ['evocation', 'magical', 'sonic', 'trap'],
		stealth: {
			dc: 33,
			minProf: 'master',
		},
		description: [
			'A magical rune is inscribed on the tarry earth at the entrance to the hut, buried beneath snow, with an {@condition invisible} sensor that detects creatures within a 10-foot-radius sphere.',
		],
		disable: {
			entries: [
				'{@skill Thievery} DC 30 (master) to erase the rune without triggering the sensor or dispel magic (5th level; counteract DC 28) to dispel the rune',
			],
		},
		actions: [
			{
				name: 'Shattering Shockwave',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['arcane', 'evocation', 'sonic'],
				trigger: 'A Small or larger creature comes within 10 feet of the rune',
				entries: [
					'The rune unleashes a deafening peal of thunder that deals {@damage 10d8} sonic damage in a 20-foot burst (DC 30 basic Reflex save).',
				],
			},
		],
	},
	{
		name: 'Spectral Archers',
		source: 'QFF3',
		page: 49,
		level: 8,
		traits: ['complex', 'haunt'],
		stealth: {
			bonus: 28,
			minProf: 'expert',
		},
		description: [
			'Ghostly soldiers wielding crossbows manifest within the towers that flank the gatehouse and rain bolts down upon intruders.',
		],
		disable: {
			entries: [
				'DC 31 {@skill Intimidation} (expert) to cow the archers into {@condition fleeing} or DC 28 {@skill Religion} (expert) to temporarily banish the spirits',
			],
		},
		actions: [
			{
				name: 'Rain of Bolts',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature attacks the graveknights in area G1 or enters the castle',
				entries: [
					'The haunt makes a spectral bolt {@action Strike} against the triggering creature, then rolls initiative.',
				],
			},
			{
				name: 'Continuous Barrage',
				activity: {
					number: 1,
					unit: 'free',
				},
				trigger: 'A creature in front of the gate finishes an action',
				entries: [
					'The haunt makes a spectral bolt {@action Strike} against the triggering creature.',
				],
			},
		],
		routine: [
			"(1 action) The hazard fires one bolt at every creature in a 30-foot-by-30-foot area in front of the gate as 1 action. Because the spectral archers fire bolts continuously, the haunt can also use the Continuous Barrage free action (below) to fire bolts at each creature during that creature's turn.",
		],
		reset: [
			'The haunt vanishes permanently if the graveknights are destroyed. Otherwise, it returns after 1 hour.',
		],
		attacks: [
			{
				range: 'Ranged',
				name: 'spectral bolt',
				attack: 20,
				damage: '{@damage 2d10+11} negative',
				noMAP: true,
			},
		],
	},
	{
		name: 'Hall of Fiery Doom',
		source: 'QFF3',
		page: 50,
		level: 10,
		traits: ['complex', 'haunt'],
		stealth: {
			bonus: 32,
			minProf: 'master',
		},
		description: [
			'While the roof is on fire and collapsing timbers crush those within the hall, demons fly down from the sky to pluck victims from the flames.',
		],
		disable: {
			entries: [
				"two DC 32 {@skill Athletics} or {@skill Diplomacy} checks to douse the flames; {@skill Athletics} to do the work yourself or {@skill Diplomacy} to muster the ghostly soldiers. This reduces the hazard's actions by 1 and prevents it from using",
			],
		},
		actions: [
			{
				name: 'Burning Timbers.',
				entries: [
					"Banish the demons with up to two DC 35 {@skill Arcana}, {@skill Occultism}, or {@skill Religion} checks; each success reduces the hazard's actions by 1, and two successes prevent it from using Demonic Abduction. When the hazard loses all 3 actions, Burning Timbers, and Demonic Abduction, it's disabled.",
				],
			},
			{
				name: 'Burst of Fire',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature enters the hall or ends its turn in the hall',
				entries: [
					'The hall bursts into flame, dealing {@damage 4d6} fire damage to each creature in the hall. The haunt then rolls initiative.',
				],
			},
			{
				name: 'Burning Timbers',
				activity: {
					number: 1,
					unit: 'action',
				},
				entries: [
					'Creatures within the 30-foot by 90-foot area of the hall take {@damage 4d6+12} fire damage (DC 29 basic Reflex save).',
				],
			},
			{
				name: 'Demonic Abduction',
				activity: {
					number: 1,
					unit: 'action',
				},
				entries: [
					'Spectral demons lift a single creature 50 feet into the air and drop it. The haunt makes a {@action Strike} against the creature with a +23 attack bonus. On a success, the creature is lifted into the air and dropped, taking 25 bludgeoning damage, though it might negate some or all this damage using a spell, such as feather fall.',
					"On a critical hit, the creature also takes {@damage 2d12+13} slashing damage as the demons' claws tear through its flesh.",
				],
			},
		],
		routine: [
			'(3 actions) The haunt spends 1 action to fill the hall with burning timbers falling from above, and 2 actions to pluck up random victims and drop them to their deaths.',
		],
		reset: ['The hall falls quiet for 24 hours, after which it can trigger again.'],
	},
	{
		name: 'Collapsing Structure',
		source: 'LOMM',
		page: 40,
		level: 15,
		traits: ['rare', 'complex', 'environmental', 'kaiju'],
		stealth: {
			bonus: 20,
			minProf: 'master',
			notes: 'to notice cracks forming in the walls of the structure as Ebeshra approaches',
		},
		description: ['Ebeshra brushes against a structure, possibly causing it to collapse.'],
		disable: {
			entries: [
				"DC 43 {@skill Athletics} (master), {@skill Crafting} (master), or {@skill lore||Engineering Lore} (master) to brace the structure to reduce the risk of collapse until the end of the creature's next turn. The DC of the flat check for this round (see Routine) is increased by 4 on a success, or by 8 on a critical success. Increasing the flat check DC to 21 or higher stabilizes the structure, ending this hazard.",
			],
		},
		actions: [
			{
				name: 'Shake Apart',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'Ebeshra applies any amount of force to the structure',
				entries: [
					'The building trembles. The floors of the building and the streets within 30 feet of the building become {@quickref difficult terrain||3|terrain}; creatures on this difficult terrain take a \u20132 circumstance penalty to attack rolls, AC, and skill checks. The hazard rolls initiative.',
				],
			},
		],
		routine: [
			'(1 action) The GM rolls a DC 9 flat check to determine if the building partially collapses, increasing the DC as listed above. On a successful check, dust and debris fall within the building and 30 feet around it, providing {@condition concealed||concealment} and dealing {@damage 6d6} bludgeoning damage to {@dice 1d4} randomly chosen targets (DC 35 basic Reflex save; on a critical failure, the creature is knocked {@condition prone}). On a critical success, the effect is the same, but the debris deals {@damage 12d6} bludgeoning damageto {@dice 2d4} randomly chosen targets instead (DC 35 basic Reflex save; on a critical failure, the creature is {@condition restrained} by rubble until freed [{@action Force Open} DC 38, {@action Escape} DC 35]).',
		],
		reset: [
			"The building becomes susceptible to Shake Apart again {@dice 1d6} rounds after it's stabilized.",
		],
	},
	{
		name: 'Crystal Pin',
		source: 'LOMM',
		page: 40,
		level: 20,
		traits: ['rare', 'abjuration', 'divine', 'environmental', 'kaiju'],
		stealth: {
			dc: 10,
		},
		description: ['Ebeshra fires a crystal at a creature to pin them onto the Material Plane.'],
		disable: {
			entries: [
				"DC 48 {@skill Occultism} (legendary) or {@skill Religion} (legendary) to earn Ebeshra's favor and allow safe travel or DC 51 {@skill Deception} (master) to momentarily divert Ebeshra's attention",
			],
		},
		actions: [
			{
				name: 'Fire Pin',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger:
					'A creature Ebeshra can see begins to use a {@trait teleportation} effect or an effect that would move any number of targets to a different plane;',
				entries: [
					'Ebeshra hurls a crystal at the triggering creature. The triggering creature and all creatures within 50 feet of the creature take {@damage 16d8} piercing damage (DC 45 basic Reflex save) and additional effects based on the result of their save.',
					{
						type: 'successDegree',
						entries: {
							'Critical Success': ['The creature is unaffected.'],
							Success: [
								"The effect is counteracted, and the creature can't use {@trait teleportation} effects or planar travel effects for 1 minute.",
							],
							Failure: ['As success, but for 1 day instead of 1 minute.'],
							'Critical Failure': [
								'As success, but for 1 week instead of 1 minute. Additionally, the creature becomes pinned under the crystal and must succeed at 3 total DC 45 checks to {@action Escape} from under the crystal.',
							],
						},
					},
				],
			},
		],
		reset: ['Ebeshra waits {@dice 1d4} rounds to break off another crystal.'],
	},
	{
		name: 'Planar Tear',
		source: 'LOMM',
		page: 40,
		level: 22,
		traits: [
			'rare',
			'complex',
			'conjuration',
			'divine',
			'environmental',
			'kaiju',
			'teleportation',
		],
		stealth: {
			bonus: 32,
			minProf: 'master',
			notes: 'to notice Ebeshra twisting its shape in preparation of creating a planar rift',
		},
		description: [
			"Ebeshra opens a massive rift in the Material Plane that pulls nearby creatures into another plane entirely. The rift is typically to a random plane in the multiverse, though Ebeshra can have the rift pull creatures into a plane of Ebeshra's choosing. Additionally, Ebeshra can choose any number of creatures to be immune to the effects of the planar rift, usually due to the kaiju recognizing the innocence of the creatures.",
		],
		disable: {
			entries: [
				"DC 47 {@skill Lore} (master) related to the specific plane beyond the rift to disrupt the planar frequency and close the rift, DC 52 {@skill Arcana} (legendary) or {@skill Occultism} (legendary) to undo the magical manifestation of the rift, DC 55 {@skill Performance} (legendary) to play a tone that counteracts the rift's harmonic frequency, or DC 55 {@skill Diplomacy} (legendary) or {@skill Religion} (legendary) to plead with Ebeshra to close the rift",
			],
		},
		actions: [
			{
				name: 'Tear Reality',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger:
					'Ebeshra recognizes a nearby threat as needing an indisputable resolution, or a deity tasks Ebeshra with creating a planar rift',
				entries: [
					'Ebeshra twists its body, aligning its segmented sections into a fine blade, and cuts the fabric of the Material Plane. It creates an enormous rift in a point in the sky within 1 mile. The rift is 100 feet long and 50 feet wide. The hazard rolls initiative.',
				],
			},
		],
		routine: [
			"(1 action) The rift pulls creatures within 500 feet toward it. The rift can pull any creature, regardless of its size. Creatures in the area must attempt a DC 45 Fortitude or Reflex save (the creature's choice) to resist the effects of this pull or attempt to grab something to avoid getting pulled.",
			{
				type: 'successDegree',
				entries: {
					'Critical Success': [
						"The creature resists the pull and doesn't move towards the rift.",
					],
					Success: ['The creature is moved 25 feet toward the rift.'],
					Failure: ['The creature is moved 50 feet toward the rift.'],
					'Critical Failure': [
						'The creature is moved 100 feet toward the rift. The harsh pull causes the creature to take {@damage 10d6} bludgeoning damage.',
					],
				},
			},
			"If a creature is directly beneath the rift when the rift pulls it, the creature instead attempts a DC 50 Fortitude or Reflex save (the creature's choice) to avoid being pulled into the rift. On a failure, the creature is pulled up into the rift and thrown to a random point on the plane on the other side.",
		],
		reset: [
			'Ebeshra vanishes 1 minute after opening the rift, which closes the rift. Ebeshra must wait 1 week before it can open another planar rift.',
		],
	},
	{
		name: 'Quaking Slither',
		source: 'LOMM',
		page: 41,
		level: 14,
		traits: ['rare', 'complex', 'environmental', 'kaiju'],
		stealth: {
			dc: 10,
		},
		description: [
			'Ebeshra slithers across the ground, causing the earth to tremble as though from a powerful earthquake.',
		],
		disable: {
			entries: [
				'three DC 38 {@skill Athletics} (trained), {@skill Crafting} (trained), or {@skill lore||Engineering Lore} (trained) checks to brace a small structure or surface to cancel the effects of the quake in that area, or a single DC 41 {@skill Diplomacy} (master) check to entreat Ebeshra to stand down',
			],
		},
		actions: [
			{
				name: 'Quake',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'Ebeshra moves at least 60 feet on land',
				entries: [
					"The ground shakes in a 120-foot emanation from Ebeshra's space. This creates a variety of effects depending on the surrounding environment.",
					'In an area without significant underground space, the ground becomes {@quickref greater difficult terrain||3|terrain}, and creatures on it are {@condition flat-footed} and {@condition clumsy||clumsy 2} for 1 round.',
					'In areas with existing underground spaces (like sewers, sinkholes, or catacombs), fissures open up in the ground. Creatures in the area tumble into the resulting 80-foot-deep hole unless they succeed at a DC 40 Reflex save.',
					"In bays, on beaches, and in other relatively substantial but shallow bodies of water, the tremors create dangerous waves. Creatures in the water or within 60 feet of the waterline are struck by waves that deal {@damage 10d8} bludgeoning damage (DC 35 basic Reflex save). On a critical failure, a creature is instantly swept 60 feet out to sea and 60 feet under the water's surface.",
				],
			},
		],
		reset: ["Ebeshra doesn't rush again this way for {@dice 1d4} rounds."],
	},
	{
		name: 'Storm Discharge',
		source: 'LOMM',
		page: 41,
		level: 18,
		traits: ['rare', 'divine', 'electricity', 'environmental', 'evocation', 'kaiju'],
		stealth: {
			dc: 10,
		},
		description: [
			'Ebeshra aligns its crystalline form to produce a blast of lightning that charges the surrounding area with electrical energy.',
		],
		disable: {
			entries: [
				"DC 45 {@skill Nature} (master) to balance the electrical charges in the area or DC 48 {@skill Deception} (expert) to momentarily divert Ebeshra's attention",
			],
		},
		actions: [
			{
				name: 'Lightning Blast',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger:
					'A creature takes a {@quickref hostile action||2|hostile actions} against Ebeshra, produces a visible area effect, or flies within 120 feet of Ebeshra;',
				entries: [
					'Ebeshra unleashes a 240-foot line of electricity toward the triggering creature. Creatures in the line take {@damage 16d8} electricity damage (DC 42 basic Reflex save). The electricity creates a static field in all squares that the line passed through and all adjacent squares. For 1 round, any creatures that enter a space in the static field take {@damage 4d8} electricity damage (DC 38 basic Reflex save).',
				],
			},
		],
		reset: ['Ebeshra waits 1d4 rounds before another blast.'],
	},
	{
		name: 'Cracked Earth',
		source: 'LOIL',
		page: 231,
		level: 3,
		traits: ['environmental'],
		stealth: {
			dc: 22,
			minProf: 'trained',
		},
		description: [
			'This 20-foot-by-20-foot patch of ground is cobwebbed with cracks and fissures that crumble when a creature steps on it.',
		],
		disable: {
			entries: [
				'DC 16 {@skill Survival} (untrained) to collapse safely; DC 20 {@skill Crafting} (trained) to shore it up enough to pass over without collapsing it',
			],
		},
		actions: [
			{
				name: 'Long Fall',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature steps onto the cracked earth',
				entries: [
					'The creature fractures the thin crust of earth and falls through. That creature can use the {@action Grab an Edge} reaction to avoid falling, as long as it is adjacent to an edge. Otherwise it takes falling damage (typically 25 bludgeoning damage for a 50-foot drop). Some of these rifts eventually lead to the Darklands.',
				],
			},
		],
	},
	{
		name: 'Mana Whorl',
		source: 'LOIL',
		page: 231,
		level: 7,
		traits: ['complex', 'environmental', 'magical'],
		stealth: {
			bonus: 14,
			minProf: 'trained',
			notes: 'to identify as dangerous quicksand; +20 (expert) to recognize its magical properties',
		},
		description: [
			'This 15-foot-wide patch of destabilized sand attempts to submerge creatures who wield magic. A desert tree with dense bright green foliage, pale pink blooms, and at least one carnivorous red-chested magpie is always nearby.',
		],
		disable: {
			entries: [
				'DC 26 {@skill Arcana} (expert) to feed magic into the whorl and temporarily stabilize it for a few minutes; feed the whorl a number of spellcasters and magic items with a combined 10 levels (for instance, a 4th-level cleric with two 3rd-level magic items) to stabilize it for 1 week; or feed the whorl a number of spellcasters and magic items with a combined 20 levels to stabilize it permanently.',
				'Spellcasters and magic items fed to the whorl are devoured whole.',
			],
		},
		actions: [
			{
				name: 'Submerge',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger:
					'A creature who can cast spells, or who is wielding a magic item, walks into the mana whorl',
				entries: [
					"The triggering creature sinks into the whorl to its waist. The whorl rolls initiative if it hasn't already",
				],
			},
		],
		routine: [
			'(1 action) On its initiative, the whorl pulls down any creature within it that can cast spells or that is wielding a magic item. A creature submerged to the waist becomes submerged to the neck, and a creature submerged to the neck is pulled under and must hold its breath to avoid suffocation (Core Rulebook 478). If a creature has no spells or magic items, the mana whorl is merely difficult terrain.',
			'A creature caught in a mana whorl can attempt a DC 23 {@skill Athletics} check to {@action Swim} to either raise itself by one step if submerged to the neck or worse, or to move 5 feet if submerged only to the waist. On a critical failure, the creature is pulled down by one step. A creature that Swims out of the whorl escapes the hazard and is {@condition prone} in a space adjacent to the whorl. Other creatures can {@action Aid} the creature, typically by using a rope or similar aid, or attempt to pull the creature out with their own DC 23 {@skill Athletics} check, with the same results as if the creature attempted the check. If a creature has only magic items and no ability to cast spells, dropping all the items releases that creature, and it can move through the mana whorl as normal difficult terrain.',
		],
		reset: [
			'The hazard continues to suck in anyone with magic until it is satiated (see Disable above). Magpies leave any satiated whorls.',
		],
	},
	{
		name: 'Spell Pitchers',
		source: 'LOIL',
		page: 232,
		level: 1,
		traits: ['environmental'],
		stealth: {
			dc: 20,
			minProf: 'trained',
			notes: 'to recognize the plant among others',
		},
		description: [
			'A large pitcher plant occupying a 5-foot space sits seemingly dormant with its dull petals open.',
		],
		disable: {
			entries: [
				"DC 15 {@skill Arcana} (trained) to safely trigger the plant's reflexes, causing it to close and become dormant for one day, or DC 17 {@skill Nature} (trained) to carefully coax the pitcher into quiescence",
			],
		},
		defenses: {
			ac: {
				std: 16,
			},
			savingThrows: {
				fort: {
					std: 11,
				},
				ref: {
					std: 5,
				},
			},
			hp: {
				std: 40,
			},
			bt: {
				std: 20,
			},
			immunities: ['mental'],
			weaknesses: [
				{
					name: 'slashing',
					amount: 10,
				},
			],
		},
		actions: [
			{
				name: 'Devour Magic',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger:
					"A spell's direct line of effect passes within a 5-foot-radius of the plant",
				entries: [
					'The pitcher attempts to counteract the spell (counteract level 1, counteract modifier +10). On a success, the pitcher immediately consumes the spell as it passes over the plant.',
				],
			},
		],
		reset: [
			'Once the pitcher has eaten a spell, its petals turn dark pink and green before it closes. It goes dormant for one day per spell level of the spell consumed. Once the pitcher finishes digesting, it opens again and slowly wilts. A second pitcher branches into an adjacent square when the first pitcher opens again.',
		],
	},
	{
		name: 'Spirit Window',
		source: 'DA',
		page: 124,
		level: 20,
		traits: ['haunt'],
		stealth: {
			dc: 51,
		},
		description: ['Spirits trapped inside a haunted window harm those who touch the window.'],
		disable: {
			entries: [
				'DC 48 {@skill Occultism} (legendary) to free the spirits from the mirror, or DC 48 {@skill Religion} (legendary) to banish the spirits',
			],
		},
		defenses: {
			ac: {
				std: 45,
			},
			savingThrows: {
				fort: {
					std: 36,
				},
				ref: {
					std: 30,
				},
			},
			hardness: {
				Window: 35,
			},
			hp: {
				Window: 132,
			},
			bt: {
				Window: 66,
			},
			immunities: ['object immunities'],
		},
		actions: [
			{
				name: 'Siphon Soul',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['evil', 'necromancy', 'negative', 'occult'],
				trigger: 'A creature touches the window',
				entries: [
					'The triggering creature takes {@damage 8d10+44} negative damage (DC 42 basic Will save) as the window attempts to steal their soul. If this damage would kill the target, its soul is trapped inside the window with the effects of bind soul.',
				],
			},
		],
		reset: ['1 round'],
	},
	{
		name: 'Clone Mirrors',
		source: 'DA',
		page: 124,
		level: 6,
		traits: ['complex', 'magical', 'trap'],
		stealth: {
			dc: 21,
		},
		description: [
			'Two opposing mirrors spawn illusory duplicates of creatures in the hall in an unending tide.',
		],
		disable: {
			entries: [
				'DC 28 {@skill Thievery} (expert) to reposition each mirror, or dispel magic (3rd level; counteract DC 25) to counteract each mirror',
			],
		},
		defenses: {
			ac: {
				std: 21,
			},
			savingThrows: {
				fort: {
					std: 11,
				},
				ref: {
					std: 17,
				},
			},
			hardness: {
				notes: {
					std: 'per mirror',
				},
				std: 13,
			},
			hp: {
				std: 54,
				'Reflection ': 30,
			},
			bt: {
				std: 27,
			},
			immunities: ['object immunities'],
		},
		actions: [
			{
				name: 'Spawn Reflection',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['illusion'],
				trigger: 'A creature is reflected in the mirror',
				entries: [
					'The mirror creates a reflection of the triggering creature, which Steps out of the mirror and into the hall. The trap then rolls initiative.',
				],
			},
			{
				name: 'Reflection AC',
				entries: ['24'],
			},
			{
				name: 'Reflection Routine',
				traits: ['2 actions'],
				entries: [
					"Each reflection has 2 actions which it uses to {@action Step}, {@action Stride}, or {@action Strike} (in any combination). Reflections can act on the same turn they're created.",
				],
			},
			{
				name: 'Reflection Speed',
				entries: ['50 feet'],
			},
		],
		routine: [
			'(2 actions) This trap loses 1 action for each mirror disabled. Each mirror uses 1 action to Spawn a Reflection of a creature reflected in the mirror. The hazard can have a maximum of four reflections spawned at once.',
		],
		reset: ['1 day'],
		attacks: [
			{
				range: 'Melee',
				activity: {
					number: 1,
					unit: 'action',
				},
				traits: ['versatile <P>', 'versatile S'],
				name: 'reflected weapon',
				attack: 17,
				damage: '{@damage 2d6+8} bludgeoning',
			},
		],
	},
	{
		name: 'Constricting Hall',
		source: 'DA',
		page: 124,
		level: 8,
		traits: ['complex', 'magical', 'trap'],
		stealth: {
			dc: 31,
		},
		description: [
			"A hall's four walls become fluid and elastic when a creature reaches the hall's midpoint.",
		],
		disable: {
			entries: [
				'DC 28 {@skill Thievery} (trained) to stabilize each wall, or dispel magic (4th level; counteract DC 26) to counteract each wall',
			],
		},
		actions: [
			{
				name: 'Lose Form',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['occult', 'transmutation'],
				trigger: "A creature reaches the hall's midpoint",
				entries: [
					"The hall's walls lose their rigidity, becoming fluid and elastic. The hall becomes {@quickref difficult terrain||3|terrain}, and each creature in the hall is knocked {@condition prone} unless they succeed at a DC 26 Reflex save. The trap then rolls initiative.",
				],
			},
		],
		routine: [
			"(4 actions) This trap loses 1 action each round for each wall that has been disabled. Each wall uses 1 action to slam back and forth rapidly, pummeling one creature in the hall with a wall {@action Strike}. On a hit, the target is additionally knocked {@condition prone}. The walls distribute the attacks as evenly as possible among creatures in the hall, and the {@action Strike||Strikes} don't apply the trap's multiple attack penalty.",
		],
		reset: ['1 hour'],
		attacks: [
			{
				range: 'Melee',
				activity: {
					number: 1,
					unit: 'action',
				},
				name: 'wall',
				attack: 20,
				damage: '{@damage 2d10+11} bludgeoning',
			},
		],
	},
	{
		name: 'Exhaling Portal',
		source: 'DA',
		page: 125,
		level: 9,
		traits: ['complex', 'magical', 'trap'],
		stealth: {
			dc: 33,
		},
		description: [
			'Magic runes carved into a doorframe connect a door to the Plane of Air when opened, blowing creatures down the connecting hall.',
		],
		disable: {
			entries: [
				"DC 30 {@skill Thievery} (expert) twice to scratch out the runes, or dispel magic (5th level; counteract DC 30) to counteract the planar runes; DC 32 {@skill Athletics} to shut the door if it's open (using {@skill Athletics} only stops the trap, it doesn't fully disable it)",
			],
		},
		actions: [
			{
				name: 'Gust',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['air', 'conjuration'],
				trigger: 'A creature opens the door',
				entries: [
					'The hall is buffeted by powerful winds for as long as the door remains open. A creature must succeed at a DC 32 {@skill Athletics} check to move toward the door. A creature who fails at this check is pushed back 5 feet and falls {@condition prone}.',
					'Additionally, the triggering creature is blasted by a powerful gust of wind and must attempt a DC 32 Fortitude save. The trap then rolls initiative.',
					{
						type: 'successDegree',
						entries: {
							'Critical Success': ['The creature is unaffected.'],
							Success: ['The creature is pushed back 5 feet.'],
							Failure: ['The creature is pushed back 10 feet.'],
							'Critical Failure': [
								'The creature is pushed back 10 feet and knocked {@condition prone}.',
							],
						},
					},
				],
			},
		],
		routine: [
			'(1 action) The trap uses 1 action to blow powerful winds down the hall. Each creature in the hall must attempt a DC 32 Fortitude save with the same results as Gust. If this forced movement would cause a creature to collide with a solid object or fall downstairs or out a window, that creature takes an additional {@damage 2d10+11} bludgeoning damage (or 20 damage due to a fall).',
		],
		reset: ['Automatic after the door is shut'],
	},
	{
		name: 'Bounding Hounds',
		source: 'DA',
		page: 125,
		level: 13,
		traits: ['complex', 'haunt'],
		stealth: {
			dc: 37,
		},
		description: ['Three phantom hounds chase down intruders, damaging any they pass through.'],
		disable: {
			entries: [
				'DC 36 {@skill Nature} (expert) to calm each hound, or DC 38 (master) to banish each hound',
			],
		},
		defenses: {
			ac: {
				std: 34,
			},
			savingThrows: {
				fort: {
					std: 20,
				},
				ref: {
					std: 26,
				},
				will: {
					std: 20,
				},
			},
			hp: {
				std: 60,
				notes: {
					std: 'per hound; Resistance all damage 10 (except force, {@item ghost touch}, or positive; double resistance to non-magical)',
				},
			},
		},
		actions: [
			{
				name: 'Bay',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['evocation', 'sonic'],
				trigger: 'A creature enters the area',
				entries: [
					'The hounds manifest and bay loudly, dealing {@damage 3d10+16} sonic damage to all creatures within 30 feet of the hounds (DC 33 basic Fortitude save). On a failed check, a creature is additionally {@condition frightened||frightened 2}. The trap then rolls initiative.',
				],
			},
		],
		routine: [
			'(9 actions) The trap loses 3 actions each round for each hound disabled. Each hound uses three actions to {@action Stride} 40 feet after creatures in the room, passing through corporeal creatures during this movement if possible. Each creature the hound moves through during its movement takes {@damage 2d8+7} negative damage (DC 37 Reflex negates). A creature can only be damaged by each hound once each round, no matter how many times the hound moves through their space.',
		],
		reset: ['1 hour'],
	},
	{
		name: 'Shrouded Assailant',
		source: 'DA',
		page: 125,
		level: 17,
		traits: ['complex', 'haunt'],
		stealth: {
			dc: 43,
		},
		description: [
			'A spirit steps out of a covered mirror, pulling off and becoming shrouded in the cloth, which reveals the mirror. The shrouded figure attacks the living until the cloth is yanked off, which banishes the formless spirit.',
		],
		disable: {
			entries: [
				'DC 43 {@skill Thievery} (master) to steal the cloth before the spirit manifests, or DC 47 {@skill Athletics} to pull the cloth off the spirit after it manifests',
			],
		},
		defenses: {
			ac: {
				std: 40,
			},
			savingThrows: {
				fort: {
					std: 26,
				},
				ref: {
					std: 32,
				},
				will: {
					std: 35,
				},
			},
			hp: {
				Spirit: 230,
				notes: {
					Spirit: 'Resistance all damage 20 (except force, {@item ghost touch}, or positive; double resistance to non-magical)',
				},
			},
		},
		actions: [
			{
				name: 'Don Shroud',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['occult'],
				trigger: 'A creature enters the area',
				entries: [
					'The spirit steps out of the mirror, wearing the cloth as a shroud and revealing the mirror. The triggering creature is {@condition frightened||frightened 3} unless they succeed at a DC 38 Will save. The haunt then rolls initiative.',
				],
			},
		],
		routine: [
			"(3 actions) The spirit uses 3 actions to {@action Step}, fly 60 feet, or {@action Strike}, in any order. On a successful {@action Strike} the spirit's target is {@condition frightened||frightened 1}, and on a critical success, the target is {@condition frightened||frightened 2}.",
		],
		reset: ['The haunt can be reset if the mirror is covered in a cloth or shroud.'],
		attacks: [
			{
				range: 'Melee',
				activity: {
					number: 1,
					unit: 'action',
				},
				name: 'shrouded touch',
				attack: 33,
				damage: '{@damage 3d12+19} force',
			},
		],
	},
	{
		name: 'Call of the Void',
		source: 'DA',
		page: 214,
		level: 12,
		traits: ['unique', 'complex', 'environmental', 'magical'],
		stealth: {
			dc: 25,
			minProf: 'expert',
			notes: 'to notice a slight tugging feeling',
		},
		description: [
			'A supernatural compulsion to leap into the unknown exerts itself on anyone who approaches the ledge.',
		],
		disable: {
			entries: [
				"DC 34 {@skill Occultism} or DC 36 {@skill Arcana} to expel the magical compulsion from the current island and from any of the red ropes directly attached to it, darkening the rope in color. The Echo also automatically disables the hazard from any island he's standing on, and any of the red ropes directly attached to it, when he Reconstitutes from Thought on that island.",
			],
		},
		actions: [
			{
				name: 'Leap into the Unknown',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['enchantment', 'mental'],
				trigger:
					'A creature enters a square adjacent to the ledge of an island or steps onto one of the red ropes',
				entries: [
					'The call of the void tugs at the mind of intruders, compelling them to leap off the ledge. The creature must succeed at a DC 34 Will save or',
				],
			},
			{
				name: 'DC 32',
				entries: [
					'{@skill Acrobatics} check to {@action Balance} or else drop off the ledge. If the creature falls off, it drops 100 feet, loops through the closed space of the mindscape, and lands in the square it fell from, taking falling damage as normal (usually 50 bludgeoning damage). The call of the void then rolls initiative.',
				],
			},
		],
		routine: [
			'(1 action) The call targets all creatures adjacent to a ledge or on one of the red ropes and tugs at their minds. A creature who has already fallen this round is immune.',
		],
		reset: [
			"The call of the void persists as long as the Echo exists, though it doesn't activate until the Echo has rolled initiative.",
			'The hazard resets each day.',
		],
	},
	{
		name: 'Mirror Door',
		source: 'DA',
		page: 122,
		level: -1,
		traits: ['magical', 'trap', 'visual'],
		stealth: {
			dc: 15,
		},
		description: [
			"The reflection of a wall shows a phantom door where none exists. This door can only be manipulated while viewed through the mirror's reflection.",
		],
		disable: {
			entries: ['DC 18 {@skill Thievery} to open the door while viewing the reflection'],
		},
		actions: [
			{
				name: 'Appear',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['arcane', 'illusion'],
				trigger: "A creature views the wall through a mirror's reflection",
				entries: [
					"A door appears in the mirror's reflection of the wall. The triggering creature can open and manipulate this door only as long as they view it through the mirror and only by succeeding at a DC 18 {@skill Thievery} check to disable the trap.",
				],
			},
		],
		reset: ['automatic'],
	},
	{
		name: 'Shuffling Hall',
		source: 'DA',
		page: 122,
		level: -1,
		traits: ['mechanical', 'trap'],
		stealth: {
			dc: 15,
		},
		description: [
			'Four pressure plates along this mirrored hall rotate vertically when stepped on, sending a creature on the pressure plate tipping into an adjacent featureless room while simultaneously replacing the pressure plate and walls in the hall. Each pressure plate dumps creatures into a different room.',
		],
		disable: {
			entries: ['DC 12 {@skill Thievery} to deactivate one pressure plate'],
		},
		defenses: {
			ac: {
				std: 18,
			},
			savingThrows: {
				fort: {
					std: 2,
				},
				ref: {
					std: 5,
				},
			},
			hardness: {
				std: 4,
			},
			hp: {
				std: 12,
			},
			bt: {
				std: 6,
			},
			immunities: ['object immunities'],
		},
		actions: [
			{
				name: 'Flip',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature steps on a pressure plate',
				entries: [
					'The floor and adjoining wall rotate up and over on a central axle, tipping the triggering creature into an adjacent featureless room and simultaneously replacing the pressure plate and wall with another set on the same axle. The triggering creature is pushed into an adjoining room, takes {@damage 1d8} bludgeoning damage, and lands {@condition prone}. A creature who succeeds at a DC 19 Reflex save takes no damage and rolls out of the way of the trap, returning to the space they were in before stepping on the pressure plate.',
				],
			},
		],
		reset: ['automatic'],
	},
	{
		name: 'Confounding Portal',
		source: 'DA',
		page: 122,
		level: 0,
		traits: ['illusion', 'magical', 'mental', 'trap'],
		stealth: {
			dc: 16,
		},
		description: [
			"Tiny runes carved around a doorframe or on a hall's walls surreptitiously confound creatures into circling the room or hallway they attempted to exit or pass through.",
		],
		disable: {
			entries: [
				'DC 17 {@skill Thievery} to scratch out the runes, or DC 16 {@skill Arcana} to destroy the runes',
			],
		},
		actions: [
			{
				name: 'Confounding Misdirection',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['arcane', 'illusion', 'mental'],
				trigger: 'A creature passes through the rune-carved doorway or hallway',
				entries: [
					"The creature is {@condition confused} by the illusions and directed back into the room they attempted to exit through another doorway or back to the hallway's beginning. This feels no different to the triggering creature than walking through the doorway or hallway, and onlookers are similarly befuddled. A creature who succeeds at a DC 19 Will save resists this illusion and exits the room or proceeds down the hall without being misdirected.",
				],
			},
		],
		reset: ['automatic'],
	},
	{
		name: 'Disorienting Illusions',
		source: 'DA',
		page: 122,
		level: 1,
		traits: ['illusion', 'magical', 'trap', 'visual'],
		stealth: {
			dc: 20,
		},
		description: [
			'Illusions cloaking this chamber cause it to appear distorted and constantly shifting, with the room and all its contents appearing tilted, irregular, and in motion.',
		],
		disable: {
			entries: [
				"DC 17 {@skill Crafting} (trained) to calculate the room's dimensions despite the illusions, or dispel magic (1st level; counteract DC 17) to counteract the illusions",
			],
		},
		actions: [
			{
				name: 'Disorient',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['arcane', 'illusion', 'mental', 'visual'],
				trigger: 'A creature enters the room',
				entries: [
					"Illusions cause the appearance of the room and the objects inside it to constantly warp, shift, bend, and distort for 1 minute. Each creature in the room while it's distorting must attempt a DC 17 {@skill Perception} check.",
					{
						type: 'successDegree',
						entries: {
							'Critical Success': [
								'The creature disbelieves the illusions and is unaffected.',
							],
							Success: [
								'The creature disbelieves the illusions but still sees them. It treats the room as {@quickref difficult terrain||3|terrain}.',
							],
							Failure: [
								"The creature is fooled by the illusions. It treats the room as {@quickref difficult terrain||3|terrain} and becomes {@condition sickened||sickened 1}. As long as it remains in the room, it can't reduce its {@condition sickened} value below 1.",
							],
							'Critical Failure': [
								'As failure, but each time the creature attempts a move action, it must succeed at a DC {@flatDC 5} flat check or they lose the action, and on a critical failure, it also falls {@condition prone}.',
							],
						},
					},
				],
			},
		],
		reset: ['1 minute'],
	},
	{
		name: 'Reflected Desires',
		source: 'DA',
		page: 123,
		level: 1,
		traits: ['enchantment', 'magical', 'mental', 'trap', 'visual'],
		stealth: {
			dc: 17,
			notes: '(0 to notice the mirror)',
		},
		description: ["This mirror reflects the viewer's deepest desires."],
		disable: {
			entries: [
				'DC 18 {@skill Thievery} (trained) to shroud the mirror without looking at it, or DC 17 {@skill Occultism} (trained) to erect mental barriers',
			],
		},
		defenses: {
			ac: {
				std: 13,
			},
			savingThrows: {
				fort: {
					std: 10,
				},
				ref: {
					std: 4,
				},
			},
			hardness: {
				std: 6,
			},
			hp: {
				std: 24,
			},
			bt: {
				std: 12,
			},
			immunities: ['object immunities'],
		},
		actions: [
			{
				name: 'Tempt',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['enchantment', 'mental', 'occult', 'visual'],
				trigger: 'A creature looks into the mirror',
				entries: [
					"The triggering creature sees themselves enjoying their deepest desires in the mirror's reflection, becoming {@condition fascinated} (Will DC 20 negates). This fascination ends automatically when the mirror is {@condition broken} or covered up.",
				],
			},
		],
		reset: ['automatic'],
	},
	{
		name: 'Shrinking Hall',
		source: 'DA',
		page: 123,
		level: 2,
		traits: ['mechanical', 'trap'],
		stealth: {
			dc: 18,
		},
		description: [
			"This hallway is designed to shrink as creatures traverse it, making access to the door at the hall's end impossible.",
		],
		disable: {
			entries: ['DC 21 {@skill Thievery} (trained) to jam the scales built into the floor'],
		},
		actions: [
			{
				name: 'Shrink',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: "100 pounds of weight or more is placed on the hallway's floor",
				entries: [
					"The hall's last 40 feet of walls angle inward, causing the hall to shrink and contract down, reaching 6 inches in height and width at the hall's far end and completely blocking access to the hall's exit door for anything but a Tiny creature Squeezing.",
				],
			},
		],
		reset: [
			"After 10 minutes without weight being placed on this hall's floor, this trap resets, returning the hall to its original size.",
		],
	},
	{
		name: 'False Floor',
		source: 'DA',
		page: 123,
		level: 3,
		traits: ['illusion', 'magical', 'trap'],
		stealth: {
			dc: 23,
			notes: '(trained; or 0 if the illusory floor is dispelled)',
		},
		description: [
			'The floor in this chamber is an illusion, which conceals a 40-foot drop to the true floor below. Additionally, the area beneath the floor is magically silenced\u2014no sound is audible within nor does sound leave this space.',
		],
		disable: {
			entries: [
				'Succeeding on a {@skill Perception} check against the {@skill Stealth} DC of 21 (including the check to find the trap) disbelieves the illusory floor, or dispel magic (2nd level; counteract DC 18) to dispel the illusory floor; dispel magic (2nd level; counteract DC 20) to dispel the magical silence',
			],
		},
		actions: [
			{
				name: 'Drop',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature walks onto the illusory floor',
				entries: [
					'The triggering creature falls through the illusory floor and takes falling damage (typically 20 bludgeoning damage). That creature can use the {@action Grab an Edge} reaction to avoid falling. The DC to {@action Climb} the walls or {@action Grab an Edge} is 20.',
				],
			},
		],
		reset: ['automatic'],
	},
	{
		name: 'Entrapping Chair',
		source: 'DA',
		page: 123,
		level: 5,
		traits: ['mechanical', 'trap'],
		stealth: {
			dc: 26,
			notes: '(0 to notice the chair)',
		},
		description: [
			"A chair on {@condition concealed} tracks surges forward, knocking a creature into the chair's seat and trapping them in place with clamping armrests.",
		],
		disable: {
			entries: ['DC 23 {@skill Thievery} (expert) to disrupt the tracks'],
		},
		defenses: {
			ac: {
				std: 22,
			},
			savingThrows: {
				fort: {
					std: 15,
				},
				ref: {
					std: 9,
				},
			},
			hardness: {
				std: 14,
			},
			hp: {
				std: 54,
			},
			bt: {
				std: 27,
			},
			immunities: ['object immunities'],
		},
		actions: [
			{
				name: 'Take a Seat!',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature steps on the track',
				entries: [
					"The chair rockets forward along the track and slams into the triggering creature, dealing {@damage 3d8+15} bludgeoning damage. A creature who succeeds at a DC 22 Reflex save takes no damage and moves out of the chair's path into a random adjacent square not containing the track.",
					"A creature who fails this saving throw is knocked into the chair's seat and immediately captured by the armrests, becoming {@condition grabbed} ({@condition restrained} on a critical failure; {@action Escape} DC 26).",
				],
			},
		],
		reset: ['The trap resets automatically over 2 rounds if the chair is unoccupied.'],
	},
	{
		name: 'False Step Floor',
		source: 'DA',
		page: 123,
		level: 6,
		traits: ['conjuration', 'magical', 'teleportation', 'trap'],
		stealth: {
			dc: 25,
		},
		description: [
			'Each time a creature enters the room, it slips through the floor, tumbles through an interdimensional void, and falls back into the room through the ceiling, landing on the floor.',
		],
		disable: {
			entries: [
				'DC 28 {@skill Thievery} (trained) to disrupt the magical energy, or DC 27 {@skill Arcana} or {@skill Occultism} (trained) to realign the magical energy',
			],
		},
		actions: [
			{
				name: 'False Step',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['arcane', 'conjuration', 'teleportation'],
				trigger: 'A creature enters the room and steps onto the floor',
				entries: [
					'The creature slips through the floor; it tumbles through an interdimensional void before falling back into the room through the ceiling and landing on the floor. The triggering creature takes 40 bludgeoning damage from the fall. That creature can try to {@action Grab an Edge} (DC 24) to avoid falling.',
				],
			},
		],
		reset: ['automatic'],
	},
	{
		name: 'Distortion Mirror',
		source: 'DA',
		page: 123,
		level: 14,
		traits: ['magical', 'transmutation', 'trap'],
		stealth: {
			dc: 38,
			notes: '0 to notice the mirror',
		},
		description: [
			"Fun-house mirrors distort a viewer's reflection, painfully reshaping their body to match what appears in the reflected images.",
		],
		disable: {
			entries: [
				"DC 38 {@skill Thievery} (master) to deface the mirror's pane, or dispel magic (7th level; counteract DC 36) to dispel the mirror or counteract the transformation",
			],
		},
		defenses: {
			ac: {
				std: 33,
			},
			savingThrows: {
				fort: {
					std: 28,
				},
				ref: {
					std: 22,
				},
			},
			hardness: {
				std: 24,
			},
			hp: {
				std: 90,
			},
			bt: {
				std: 45,
			},
			immunities: ['object immunities'],
		},
		actions: [
			{
				name: 'Painful Transformation',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['attack'],
				trigger: 'A creature is reflected in the mirror',
				entries: [
					"The triggering creature's body is painfully squished, stretched, and distorted to match their reflection. The creature takes {@damage 6d10+30} force damage and must attempt a DC 39 Fortitude save.",
					{
						type: 'successDegree',
						entries: {
							'Critical Success': ['The target is unaffected.'],
							Success: [
								'The target takes half damage and is {@condition clumsy||clumsy 1} and {@condition enfeebled||enfeebled 1} for 1 round.',
							],
							Failure: [
								'The target takes full damage and is {@condition clumsy||clumsy 2} and {@condition enfeebled||enfeebled 2} for 4 rounds.',
							],
							'Critical Failure': [
								'The target takes double damage and is {@condition clumsy||clumsy 2} and {@condition enfeebled||enfeebled 2} for 1 minute. As long as the creature is {@condition clumsy} or {@condition enfeebled}, it additionally takes a \u201310-foot status penalty to its Speeds.',
								"When the effects of this trap end, the triggering creature's transformation ends, and its body reverts to its natural form.",
							],
						},
					},
				],
			},
		],
		reset: ['1 day'],
	},
	{
		name: 'Sigil of Deepest Fears',
		source: 'DA',
		page: 124,
		level: 17,
		traits: ['magical', 'trap'],
		stealth: {
			dc: 43,
			minProf: 'master',
		},
		description: ['An arcane sigil forces creatures to confront their greatest fear.'],
		disable: {
			entries: [
				"DC 43 {@skill Thievery} (master) to drain the sigil's power harmlessly, or dispel magic (9th level; counteract DC 42) to counteract the sigil",
			],
		},
		actions: [
			{
				name: 'Face Your Fear',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['arcane', 'death', 'emotion', 'fear', 'illusion', 'mental'],
				trigger: 'A creature moves within 10 feet of the sigil',
				entries: [
					'All creatures within 120 feet of the sigil are affected by a {@spell weird} spell (DC 40 Will save).',
				],
			},
		],
		reset: ['1 day'],
	},
	{
		name: 'Lonely Machine Spirit',
		source: 'OoA1',
		page: 24,
		level: 3,
		traits: ['complex', 'haunt'],
		stealth: {
			bonus: 13,
			minProf: 'trained',
		},
		description: [
			'Ghostly smoke rising from an alchemical engine belches forth; the screeching sound of grinding gears echoes from the engine as it shutters to life.',
		],
		disable: {
			entries: [
				'DC 22 {@skill Religion} (trained) or DC 20 {@skill Lore||Engineering Lore} (trained) to eject the animating spirit from its mechanical shell. Creatures gain a +2 circumstance bonus on their check if they use the airship\'s name, Harpy\'s Kiss, as part of their skill check, or a +4 circumstance bonus if they utter the name "Phera Wyndslow. " The haunt remains active until its spirit is ejected, the haunt is destroyed, or there are no living creatures within 30 feet.',
			],
		},
		defenses: {
			ac: {
				std: 20,
			},
			savingThrows: {
				fort: {
					std: 14,
				},
				ref: {
					std: 8,
				},
			},
			hardness: {
				std: 11,
			},
			hp: {
				std: 44,
			},
			bt: {
				std: 22,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
			weaknesses: [
				{
					name: 'electricity',
					amount: 5,
				},
				{
					name: 'orichalcum',
					amount: 5,
				},
				{
					name: 'positive',
					amount: 5,
				},
			],
		},
		actions: [
			{
				name: 'Painful Whistle',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['sonic'],
				trigger:
					'A living creature approaches within 10 feet of the engine (marked with a "T" on the map)',
				entries: [
					"A loud whistle blows and all creatures within 30 feet take {@damage 2d6} sonic damage and become {@condition stunned||stunned 1} (DC 20 basic Fortitude save; creatures aren't {@condition stunned} on a success). The lonely machine spirit then rolls initiative.",
				],
			},
			{
				name: 'Belch',
				entries: [
					"Smoke{@as 2} (air, fire) The airship's engine issues forth a cloud of alchemical smoke in a 30-foot cone. Creatures within the cone must attempt a DC 20 Fortitude save.",
					{
						type: 'successDegree',
						entries: {
							'Critical Success': ['The creature is unaffected.'],
							Success: [
								'The creature takes {@damage 1d6} poison damage and is {@condition sickened||sickened 1}.',
							],
							Failure: [
								'The creature takes {@damage 2d6} poison damage and is {@condition sickened||sickened 2}.',
							],
							'Critical Failure': [
								'The creature takes {@damage 3d6} poison damage and is {@condition sickened||sickened 2}.',
							],
						},
					},
				],
			},
		],
		routine: [
			'(2 actions) The lonely machine spirit Belches Smoke or makes two red hot gear Strikes against two creatures within 30 feet.',
		],
		reset: ['The haunt deactivates and resets after 1 hour.'],
		attacks: [
			{
				range: 'Ranged',
				activity: {
					number: 1,
					unit: 'action',
				},
				traits: ['fire', 'range <10 feet>'],
				name: 'red hot gear',
				attack: 12,
				damage: '{@damage 1d6} bludgeoning and {@damage 1d6} fire',
			},
		],
	},
	{
		name: 'Precarious Thunderstone Trap',
		source: 'OoA1',
		page: 33,
		level: 1,
		traits: ['mechanical', 'trap'],
		stealth: {
			dc: 15,
			minProf: 'trained',
		},
		description: [
			'A tripwire fastened to the gate snaps when the gate is opened, releasing a moderate thunderstone to the ground.',
		],
		disable: {
			entries: [
				'DC 15 {@skill Thievery} (trained) to remove the thunderstone or DC 18 Reflex save to catch the falling thunderstone',
			],
		},
		defenses: {
			ac: {
				std: 12,
			},
			savingThrows: {
				fort: {
					std: 7,
				},
				ref: {
					std: 3,
				},
			},
			hardness: {
				'Wire ': 3,
			},
			hp: {
				'Wire ': 10,
			},
			bt: {
				'Wire ': 5,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				name: 'Thunderstone',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['sonic'],
				trigger: 'The front gate is opened',
				entries: [
					'A moderate thunderstone falls on the flagstones and activates, dealing 2 sonic {@trait splash} damage to each creature within 10 feet of the gate. Creatures in the area must succeed at a DC 17 Fortitude saving throw or be {@condition deafened} for 1 round. Adjacent creatures can attempt to catch the falling thunderstone (see Disable, above).',
				],
			},
		],
	},
	{
		name: 'Stink-Sap Trap',
		source: 'OoA1',
		page: 33,
		level: 3,
		traits: ['mechanical', 'trap'],
		stealth: {
			dc: 18,
			minProf: 'trained',
		},
		description: [
			'A nozzle attached to a pressure sensor under the flagstone path sprays thick wads of smelly sap.',
		],
		disable: {
			entries: ['DC 15 {@skill Thievery} (trained) to clog the nozzle or DC 14'],
		},
		defenses: {
			ac: {
				std: 13,
			},
			savingThrows: {
				fort: {
					std: 8,
				},
				ref: {
					std: 5,
				},
			},
			hardness: {
				'Nozzle ': 10,
			},
			hp: {
				'Nozzle ': 30,
			},
			bt: {
				'Nozzle ': 15,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				name: 'Athletics',
				traits: ['trained'],
				entries: [
					"to redirect the stream away from the path; the {@skill Athletics} check can be made at a distance with a thrown object, but a critical failure triggers the trap's",
				],
			},
			{
				name: 'Sudden Spray.',
				entries: [],
			},
			{
				name: 'Sudden Spray',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger:
					'A creature or object weighing at least 50 pounds is placed on one of the flagstones north of the gate (marked "T" on the map on page 32)',
				entries: [
					'Pressurized sap sprays from the nozzle, coating everything in a 15-foot cone. Creatures in the area that fail a DC 20 Reflex save become affected by stink sap.',
				],
			},
			{
				name: 'Stink Sap',
				traits: ['aura', 'olfactory'],
				entries: [
					'5 feet. Creatures and their equipment coated in the sap smell horrible. Creatures in the aura must attempt a DC 16 Fortitude save. On a failure, the creature is {@condition sickened||sickened 1}, and on a critical failure, the creature is also {@condition stunned||stunned 1}. While within the aura, the creature takes a \u20132 circumstance penalty to saves to recover from the {@condition sickened} condition. A creature that succeeds at its save is immune to stink sap for 1 minute.',
					"Creatures don't save against this effect in exploration mode and don't become temporarily immune, but creatures with stink sap on them must roll against their own aura when they roll initiative in encounter mode.",
					'The sap dissipates after 10 hours; spending 10 minutes scrubbing the sap off with soap and water reduces the duration by 1 hour.',
				],
			},
		],
		reset: [
			'1 minute. The trap resets automatically twice before the supply of stink sap is exhausted.',
		],
	},
	{
		name: 'Purple Dye Trap',
		source: 'OoA1',
		page: 34,
		level: 3,
		traits: ['mechanical', 'trap'],
		stealth: {
			dc: 20,
			minProf: 'trained',
		},
		description: [
			'A spring-loaded glass jar containing purple dye and a thunderstone pops from the ground and explodes when a pressure sensor is triggered.',
		],
		disable: {
			entries: [
				'DC 17 {@skill Thievery} (trained) to remove the jar and thunderstone carefully or DC 20 {@skill Athletics} to reinforce the flagstone pressure sensor with an improvised wedge',
			],
		},
		defenses: {
			ac: {
				std: 15,
			},
			savingThrows: {
				fort: {
					std: 10,
				},
				ref: {
					std: 4,
				},
			},
			hardness: {
				'Flagstone ': 7,
			},
			hp: {
				'Flagstone ': 44,
			},
			bt: {
				'Flagstone ': 22,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				name: 'Exploding Jar',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger:
					'A creature or object weighing at least 50 pounds is placed on one of the flagstones running north to south on the west side of the yard (marked "T" on the map on page 32)',
				entries: [
					'A glass jar containing purple dye and a thunderstone pop from the ground between the flagstones. The sudden movement causes the thunderstone to clink against the jar and explode. All creatures in a 10-foot radius take 2 sonic damage and must succeed at a DC 17 Fortitude save or be {@condition deafened} for 1 round. In addition, each creature in that area is splattered with purple dye and showered with glass, taking {@damage 1d4+2} piercing damage (DC 20 basic Reflex save). Creatures splattered with purple dye take a \u20131 circumstance penalty to Charisma-based skill checks. Fully {@condition dying} the affected hair or clothing removes this penalty. Dyed skin fades after a week but can be covered up with a successful DC 12 Disguise check and the appropriate cosmetics.',
				],
			},
		],
	},
	{
		name: 'Wooden Bullets Trap',
		source: 'OoA1',
		page: 34,
		level: 3,
		traits: ['complex', 'mechanical', 'trap'],
		stealth: {
			bonus: 10,
			minProf: 'trained',
		},
		description: [
			'A hopper full of wooden sling bullets is attached to several launching devices, which spew the bullets at high velocity through various holes in the boards covering the window. A distinctive "click" and whirring sound indicate the trap has been sprung.',
		],
		disable: {
			entries: [
				'DC 17 {@skill Thievery} (trained) to reinforce the porch pressure sensor or DC 15 {@skill Crafting} (trained) to cover the holes launching the bullets',
			],
		},
		defenses: {
			savingThrows: {
				fort: {
					std: 15,
				},
				ref: {
					std: 5,
				},
			},
			hardness: {
				'Wall ': 10,
			},
			hp: {
				'Wall ': 50,
			},
			bt: {
				'Wall ': 25,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
			weaknesses: [
				{
					name: 'fire',
					amount: 5,
				},
			],
		},
		actions: [
			{
				name: 'Wall AC',
				entries: ['10'],
			},
			{
				name: 'Auto-Sling',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger:
					'A creature or object weighing at least 50 pounds is placed on the porch (marked "T" on the map on page 32)',
				entries: [
					'A stream of wooden sling bullets flies from a launcher. The trap Strikes the two nearest creatures and then rolls initiative.',
				],
			},
		],
		routine: [
			'(2 actions) The wooden bullets trap Strikes the two nearest creatures. It ignores {@condition prone} creatures as the bullets fly overhead.',
		],
		reset: [
			'The trap stops after 10 rounds or when the weight on the porch is removed, whichever comes first. The trap can operate for a total of 10 rounds before its ammunition is exhausted.',
		],
		attacks: [
			{
				range: 'Ranged',
				activity: {
					number: 1,
					unit: 'action',
				},
				traits: ['nonlethal', 'range <10 feet>'],
				name: 'wooden bullet',
				attack: 12,
				damage: '{@damage 1d6+6} bludgeoning',
			},
		],
	},
	{
		name: 'Volatile Reagents',
		source: 'OoA1',
		page: 37,
		level: 2,
		traits: ['alchemical', 'complex', 'environmental'],
		stealth: {
			bonus: 5,
			minProf: 'trained',
		},
		description: [
			'Potion bottles, alembics, and potent ingredients violently explode when jostled and accidentally combined.',
		],
		disable: {
			entries: [
				'three DC 20 {@skill Acrobatics} or {@skill Crafting} checks to sort and separate the bottles of volatile ingredients into groups',
			],
		},
		defenses: {
			ac: {
				std: 18,
			},
			savingThrows: {
				fort: {
					std: 10,
				},
				ref: {
					std: 8,
				},
			},
			hp: {
				std: 10,
			},
			bt: {
				std: 5,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				name: 'Explosive Catalyst',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: "Slick drinks Gattlebee's growth serum (page 36)",
				entries: [
					'The giant lizard bumps into lab tables and workbenches, causing dangerous ingredients to intermix and detonate. The hazard rolls initiative.',
				],
			},
		],
		routine: [
			"(1 action) A random 10-foot square in Gattlebee's laboratory explodes, dealing {@dice 2d6} damage to creatures and objects in the area (DC 18 basic Reflex save). The damage type is randomly determined each round: acid, cold, electricity, fire, slashing, or sonic.",
		],
		reset: [
			'The lab contains enough ingredients for this hazard to last 1 minute before all materials are expended.',
			'Alternatively, the hazard resets once Slick shrinks to regular size (see below).',
		],
	},
	{
		name: 'Repeater Crossbow Trap',
		source: 'OoA1',
		page: 60,
		level: 5,
		traits: ['complex', 'mechanical', 'trap'],
		stealth: {
			bonus: 13,
			minProf: 'trained',
		},
		description: [
			'A pressure plate in the hallway floor releases a latch, causing a ceiling panel to drop down. A +1 striking heavy crossbow contained in a steel box sprays bolts at any creatures in the hallway.',
		],
		disable: {
			entries: [
				'DC 20 {@skill Thievery} (Expert) or {@skill Crafting} (Trained) to disengage the reloading mechanism; the trap can also be disabled by the switch in area F2',
			],
		},
		defenses: {
			ac: {
				std: 22,
			},
			savingThrows: {
				fort: {
					std: 15,
				},
				ref: {
					std: 9,
				},
			},
			hardness: {
				std: 12,
			},
			hp: {
				std: 50,
			},
			bt: {
				std: 25,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				name: 'Auto-Bolter',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger:
					'An object or creature weighing at least 25 pounds steps on the pressure plate at the south end of the hallway',
				entries: [
					'A +1 striking heavy crossbow encased in a steel box drops from the ceiling and fires.',
					'The repeater crossbow trap Strikes a random creature in the hallway. The trap then rolls initiative.',
				],
			},
		],
		routine: [
			'(3 actions) The repeater crossbow trap reloads (2 actions) then Strikes a random creature in the hallway.',
		],
		reset: ['The trap runs out of ammo after it fires 5 bolts; it must be manually reloaded.'],
		attacks: [
			{
				range: 'Ranged',
				activity: {
					number: 1,
					unit: 'action',
				},
				traits: ['magical', 'range <120 feet>', 'reload <2>'],
				name: 'heavy crossbow',
				attack: 16,
				damage: '{@damage 2d10+4} piercing',
			},
		],
	},
	{
		name: 'Subduing Gas Chamber',
		source: 'OoA1',
		page: 62,
		level: 5,
		traits: ['complex', 'mechanical', 'trap'],
		stealth: {
			bonus: 10,
			minProf: 'expert',
		},
		description: [
			'A mechanical sensor in the desk drawer releases a counterweight in the wall, which slams the door shut and opens the sleeping gas tank under the bed, allowing gas to fill the air-tight room with a hissing sound.',
		],
		disable: {
			entries: [
				'DC 26 {@skill Thievery} (Trained) to disconnect the wire to the counterweight, preventing it from falling, or DC 20',
			],
		},
		defenses: {
			ac: {
				std: 10,
			},
			savingThrows: {
				fort: {
					std: 15,
				},
				ref: {
					std: 9,
				},
			},
			hardness: {
				std: 10,
			},
			hp: {
				std: 40,
			},
			bt: {
				std: 20,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				name: 'Crafting',
				traits: ['Alchemical Crafting'],
				entries: ['to create a counteragent to the sleeping gas'],
			},
			{
				name: 'Slam Door',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger:
					'A creature opens the desk drawer without holding the release button under the desk',
				entries: [
					'The wooden door to the room slams shut and locks, and the trap rolls initiative.',
				],
			},
			{
				type: 'affliction',
				name: 'Sleeping Gas',
				traits: ['inhaled', 'poison'],
				DC: 22,
				savingThrow: 'Fortitude',
				maxDuration: '4 hours',
				stages: [
					{
						stage: 1,
						entry: '{@condition slowed||slowed 1}',
						duration: '1 round',
					},
					{
						stage: 2,
						entry: '{@condition unconscious} with no {@skill Perception} check to wake up',
						duration: '1 round',
					},
					{
						stage: 3,
						entry: '{@condition unconscious} with no {@skill Perception} check to wake up',
						duration: '1 hour',
					},
				],
			},
		],
		routine: [
			'(1 action) Each round on its initiative count, the trap pumps more sleeping gas into the room. Any breathing creature in the room is exposed to the toxin.',
			"If a creature acts before the trap on the first round, it has the option of holding its breath to postpone breathing in the poison\u2014holding one's breath after the trap's first action has no effect, since the air in the creature's lungs is already tainted. The trap functions for 1 minute before all the gas is expended, after which it rapidly decays over the next minute. Opening the door to an adjacent room cuts the remaining time it takes for the gas to decay in half but exposes creatures in that room as well.",
		],
		reset: ['The gas must be manually reloaded.'],
	},
	{
		name: 'Lyzerium Bottles',
		source: 'OoA1',
		page: 64,
		level: 1,
		traits: ['mechanical', 'trap'],
		stealth: {
			dc: 16,
		},
		description: [
			'Five tiny glass bottles, each full of volatile green liquid, are discretely positioned around the room.',
			'Each bottle explodes when its glass is {@condition broken}.',
		],
		disable: {
			entries: [
				'{@action Interact} action to pick up one of the five bottles (see Lyzerium sidebar on page 63)',
			],
		},
		defenses: {
			ac: {
				std: 13,
			},
			savingThrows: {
				fort: {
					std: 4,
				},
				ref: {
					std: 6,
				},
			},
			hardness: {
				'Bottle ': 1,
			},
			hp: {
				'Bottle ': 4,
			},
			bt: {
				'Bottle ': 2,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				name: 'Explode',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature steps on the bottle or the bottle becomes {@condition broken}',
				entries: [
					'The bottle explodes, dealing {@damage 2d8} fire damage plus 2 {@condition persistent damage||persistent fire damage} and 2 fire {@trait splash} damage to each creature sharing its square (DC 18 basic Reflex save).',
				],
			},
		],
	},
	{
		name: 'Iron Dart Launcher',
		source: 'OoA2',
		page: 12,
		level: 4,
		traits: ['uncommon', 'mechanical', 'trap'],
		stealth: {
			dc: 25,
			minProf: 'expert',
		},
		description: [
			'A half-dozen iron darts fire from spring-loaded launchers {@condition concealed} in the desk opposite the front door.',
		],
		disable: {
			entries: [
				"DC 22 {@skill Thievery} (trained) to disable the trigger, or DC 18 {@skill Acrobatics} to squeeze through the partially opened door (this doesn't disable the trap but prevents it from triggering)",
			],
		},
		defenses: {
			ac: {
				std: 22,
			},
			savingThrows: {
				fort: {
					std: 14,
				},
				ref: {
					std: 8,
				},
			},
			hardness: {
				std: 10,
			},
			hp: {
				std: 50,
			},
			bt: {
				std: 25,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				name: 'Dart',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'The front door is fully opened, Forced Open, or {@condition broken}',
				entries: [
					'A hail of iron darts launches along a 20-foot line from the desk through the doorway, dealing {@damage 4d8+10} piercing damage to each creature in the area of effect (DC 24 basic Reflex save).',
				],
			},
		],
		reset: [
			'The trap resets as soon as the door is closed. It has enough darts to trigger three times, after which, it must be reloaded with 20 darts before it can reset again.',
		],
	},
	{
		name: 'Second Kiss Engine',
		source: 'OoA2',
		page: 28,
		level: 6,
		traits: ['uncommon', 'mechanical', 'trap'],
		description: ['Exposed clockwork gears spin at high speeds.'],
		disable: {
			entries: [
				"DC 28 {@skill Thievery} (expert) to disable the engine, or DC 26 {@skill Lore||Engineering Lore} to disengage the drive shaft. Either method disables the trap but also shuts down the engine, disabling the Second Kiss's propulsion.",
			],
		},
		defenses: {
			ac: {
				std: 27,
			},
			savingThrows: {
				fort: {
					std: 15,
				},
				ref: {
					std: 18,
				},
			},
			hardness: {
				std: 10,
			},
			hp: {
				std: 50,
			},
			bt: {
				std: 25,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				name: 'Spinning Gears',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature {@action stride||Strides} in the engine nacelle',
				entries: [
					"The creature's clothing or limbs get caught in the spinning gears and axles of the engine. The creature must attempt a DC 24 Reflex save.",
					{
						type: 'successDegree',
						entries: {
							'Critical Success': ['The creature is unaffected.'],
							Success: ['The creature takes {@damage 2d8+9} bludgeoning damage.'],
							Failure: ['The creature takes {@damage 4d8+18} bludgeoning damage.'],
							'Critical Failure': [
								"The creature's clothing is pulled into the clockworks. The creature takes {@damage 4d8+18} bludgeoning damage and is {@condition restrained}. Until the creature Escapes (DC 24), it takes {@damage 2d8+9} bludgeoning damage each round as it's pulled into the spinning rotors. A creature wearing clothing can automatically {@action Escape} by doffing its caught clothing; this destroys the doffed clothing.",
							],
						},
					},
				],
			},
		],
	},
	{
		name: 'Explosive Steam Trap',
		source: 'OoA2',
		page: 55,
		level: 7,
		traits: ['complex', 'mechanical', 'trap'],
		stealth: {
			dc: 20,
			minProf: 'trained',
			notes: 'to find the desk switch; DC 28 (expert) to find the trapdoor and charge',
		},
		description: [
			'A black-powder charge fastened to a trapdoor (marked with a "T" on the map) blows a hole in a steam tunnel, filling the room with superheated steam.',
		],
		disable: {
			entries: ['DC 18 {@skill Thievery} (trained) to disarm the desk switch;'],
		},
		defenses: {
			ac: {
				std: 25,
			},
			savingThrows: {
				fort: {
					std: 18,
				},
				ref: {
					std: 15,
				},
			},
			hardness: {
				'Trapdoor ': 8,
			},
			hp: {
				'Trapdoor ': 50,
			},
			bt: {
				'Trapdoor ': 25,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				name: 'DC',
				entries: ['28 (expert) to disarm the trapdoor charge'],
			},
			{
				name: 'Explosive Charge',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'The desk switch is pressed or the trapdoor is opened',
				entries: [
					'The charge on the door explodes. All creatures within 10 feet take {@damage 2d10+6} fire damage, {@damage 1d10+3} piercing damage, and {@damage 1d6} {@condition persistent damage||persistent bleed damage} (DC 22 basic Reflex save). The room is filled with steam, making all creatures within the room {@condition concealed}. The trap then rolls initiative.',
				],
			},
		],
		routine: [
			'(1 action) The trapdoor emits a jet of superheated steam. Each creature in the room must attempt a DC 28 Fortitude save.',
			{
				type: 'successDegree',
				entries: {
					'Critical Success': ['The creature is unaffected.'],
					Success: ['The creature takes {@damage 1d10+3} fire damage.'],
					Failure: [
						'The creature takes {@damage 2d10+6} fire damage and is {@condition blinded} for 1 round.',
					],
					'Critical Failure': [
						'The creature takes {@damage 2d10+6} fire damage, is {@condition fatigued}, and is {@condition blinded} for 1 round.',
					],
				},
			},
		],
	},
	{
		name: 'False Door Trap',
		source: 'OoA2',
		page: 59,
		level: 6,
		traits: ['mechanical', 'trap'],
		stealth: {
			dc: 28,
			minProf: 'expert',
			notes: 'to see the brick wall behind the edges of the door',
		},
		description: [
			'A black-powder charge detonates as soon as the doorknob is turned, shattering the door into splinters.',
		],
		disable: {
			entries: ['DC 27 {@skill Thievery} (expert) to disable the doorknob trigger'],
		},
		defenses: {
			ac: {
				std: 24,
			},
			savingThrows: {
				fort: {
					std: 17,
				},
				ref: {
					std: 11,
				},
			},
			hardness: {
				std: 8,
			},
			hp: {
				std: 50,
			},
			bt: {
				std: 25,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				name: 'Explosive Charge',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'The doorknob is turned',
				entries: [
					'The charge behind the door explodes, dealing {@damage 2d8+9} fire damage and {@damage 2d8+9} piercing damage to all creatures in a 10-foot cone blasting outward from the door (DC 27 basic Reflex save). The sound of the explosion can be heard up to 50 feet away',
				],
			},
		],
	},
	{
		name: 'Color Spray Trap',
		source: 'OoA2',
		page: 60,
		level: 4,
		traits: ['auditory', 'illusion', 'incapacitation', 'magical', 'trap', 'visual'],
		stealth: {
			dc: 22,
			minProf: 'trained',
			notes: 'to notice the glyph on the doorjamb',
		},
		description: [
			'A loud pop sounds when this door is opened, followed immediately by a blast of colorful lights that washes over whoever opened the door.',
		],
		disable: {
			entries: [
				'DC 25 {@skill Thievery} (trained) to disable the glyph, or dispel magic (1st level; counteract DC 22) to counteract the glyph',
			],
		},
		defenses: {
			ac: {
				std: 22,
			},
			savingThrows: {
				fort: {
					std: 12,
				},
				ref: {
					std: 10,
				},
			},
			hardness: {
				'Door ': 8,
			},
			hp: {
				'Door ': 50,
			},
			bt: {
				'Door ': 25,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				name: 'Color Spray',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'The door is opened',
				entries: ['The trap casts color spray on the triggering creature (DC 21).'],
			},
		],
	},
	{
		name: 'Gremlin Horde',
		source: 'OoA3',
		page: 19,
		level: 6,
		traits: ['complex', 'magical'],
		stealth: {
			bonus: 18,
			minProf: 'expert',
		},
		description: [
			'Three gangs of gremlins hide within the spiral centurion, cackling with glee and hurling blasts of hex magic. The hazard occupies the same space as the spiral centurion, moving with it.',
		],
		disable: {
			entries: [
				'DC 25 {@skill Arcana}, {@skill Occultism}, or {@skill Religion} (trained) to devise counter-hex symbols that frighten and scatter a gremlin gang, or DC 28 {@skill Acrobatics} or {@skill Stealth} (expert) to capture and scatter a gremlin gang',
			],
		},
		defenses: {
			ac: {
				std: 27,
			},
			savingThrows: {
				fort: {
					std: 11,
				},
				ref: {
					std: 17,
				},
			},
			hardness: {
				notes: {
					std: '(while inside the centurion)',
				},
				std: 15,
			},
			hp: {
				std: 22,
				notes: {
					std: 'per gremlin gang',
				},
			},
		},
		actions: [
			{
				name: 'Hexed Calamity',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature comes within 30 feet of the gremlin horde',
				entries: [
					'Every firearm within 30 feet misfires (Guns & Gears 152). If a creature is holding the firearm, they can attempt a DC 27 Will save, negating this effect on a success. The hazard rolls initiative.',
				],
			},
		],
		routine: [
			"(3 actions; misfortune) The gremlin horde hurls one tinkering curse with each action, targeting an item within 60 feet wielded or worn by a creature. The creature must attempt a DC 27 Will save. The gremlin horde loses 1 action for each gremlin gang that's scattered.",
			{
				type: 'successDegree',
				entries: {
					'Critical Success': [
						'The hex bounces back to affect the gremlin horde. For 1 round, all creatures gain a +1 status bonus to checks to disable this hazard.',
					],
					Success: ['The item is unaffected.'],
					Failure: [
						"The item becomes unreliable for 1 round. If a creature attempts to Activate the item or {@action Interact} with it, it must succeed at a DC {@flatDC 5} flat check or the action is wasted. If the item doesn't have an active use (such a mundane cloak), the creature wearing the item must instead immediately succeed at a DC {@flatDC 5} flat check or become tangled with the item and fall {@condition prone}.",
					],
					'Critical Failure': [
						'As failure, but the creature wielding or wearing the item also becomes {@condition clumsy||clumsy 2}.',
					],
				},
			},
		],
		reset: [
			'If not captured or killed, the scattered gremlin gangs regroup after {@dice 1d4} hours.',
		],
	},
	{
		name: 'Falling Portcullis Trap',
		source: 'OoA2',
		page: 62,
		level: 7,
		traits: ['mechanical', 'trap'],
		stealth: {
			dc: 22,
			minProf: 'expert',
			notes: 'to spot the sockets in the floor where the portcullis drops; DC 28 (expert) to spot the floor trigger',
		},
		description: [
			'An iron portcullis drops from the ceiling when a pressure plate is triggered.',
		],
		disable: {
			entries: [
				'DC 27 {@skill Thievery} (expert) to disable the floor trigger, or DC 27 {@skill Athletics} or {@skill Lore||Engineering Lore} to jam the portcullis in the ceiling',
			],
		},
		defenses: {
			ac: {
				std: 25,
			},
			savingThrows: {
				fort: {
					std: 15,
				},
				ref: {
					std: 18,
				},
			},
			hardness: {
				std: 18,
			},
			hp: {
				std: 72,
			},
			bt: {
				std: 36,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				name: 'Slam Shut',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'The pressure plate is depressed',
				entries: [
					'The portcullis falls, closing off the hallway.',
					"Any creature under the portcullis when it drops takes {@damage 4d10+18} piercing damage and is {@condition immobilized}. A creature that succeeds at a DC 26 Reflex save takes no damage and rolls away in a random direction; on a critical success, they can choose the direction. (For the rules on freeing an {@condition immobilized} creature, see the sidebar on page 515 of the Core Rulebook.) If the trap was triggered by a creature moving north with a Speed of at least 10 feet, they're considered to be under the portcullis when it triggers. Creatures moving south when triggering the portcullis aren't considered to be under the portcullis when it triggers.",
				],
			},
		],
	},
	{
		name: 'Thalassophobic Pool',
		source: 'DA',
		page: 212,
		level: 12,
		traits: ['complex', 'magical', 'trap'],
		stealth: {
			dc: 25,
			minProf: 'trained',
		},
		description: [
			'The pool sucks in creatures that fall into it, making them sink into its endless depths.',
		],
		disable: {
			entries: [
				'DC 32 (master) {@skill Diplomacy} or {@skill Deception} to quell the fear and calm the pool or DC 35 {@skill Intimidation} to give the pool something worse to fear; three successes required.',
			],
		},
		actions: [
			{
				name: 'Downpour',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature falls into the pool',
				entries: [
					"More water pours forth from the chalice. Creatures in the pool become {@condition clumsy||clumsy 1}, and they can't decrease their {@condition clumsy} condition so long as they remain in the pool. The trap then rolls initiative.",
				],
			},
		],
		routine: [
			"(3 actions) Water from the chalice increases the depth of the water by 10 feet for each action. Each time this happens, creatures in the pool are pushed 10 feet down and take {@damage 1d6} bludgeoning damage. As the pool has no bottom, creatures in it can fall down indefinitely; they must {@action Swim} up to avoid drowning, but the water is especially choppy, so the {@skill Athletics} DC is 25. The pool never overflows. Each successful check to Disable reduces the pool's actions by 1, and once the pool is completely Disabled, the water becomes still and the {@skill Athletics} DC to {@action Swim} becomes 10.",
		],
		reset: ['The trap resets once there are no moving creatures in it.'],
	},
	{
		name: 'Acidic Needle Launcher',
		source: 'AoA5',
		page: 54,
		level: 16,
		traits: ['complex', 'mechanical', 'trap'],
		stealth: {
			dc: 38,
			minProf: 'master',
		},
		description: [
			'A ceiling-mounted launcher rains resinous needles onto intruders, after which the needles melt into acid.',
		],
		disable: {
			entries: [
				'{@skill Thievery} (DC 36) to disable some firing mechanisms, making three adjacent squares in the trapped area safe to enter.',
			],
		},
		defenses: {
			ac: {
				std: 39,
			},
			savingThrows: {
				fort: {
					std: 30,
				},
				ref: {
					std: 22,
				},
			},
			hardness: {
				std: 26,
			},
			hp: {
				std: 104,
			},
			bt: {
				std: 52,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['attack'],
				trigger: 'A creature moves into the area indicated on the map',
				entries: [
					'The trap shoots an acidic needle at a random target in the area indicated on the map, then rolls initiative.',
				],
				name: 'Needle Rain',
			},
		],
		routine: [
			'(3 actions) The acidic needle launcher fires a needle at a random target in the area indicated on the map.',
		],
		attacks: [
			{
				range: 'Ranged',
				name: 'acidic needle',
				attack: 35,
				damage: '{@damage 2d6} piercing plus {@damage 8d6} acid',
				types: ['acid', 'piercing'],
			},
		],
	},
	{
		name: 'Acidic Poison Cloud Trap',
		source: 'AoE3',
		page: 46,
		level: 13,
		traits: ['alchemical', 'complex', 'mechanical', 'trap'],
		stealth: {
			bonus: 30,
			minProf: 'master',
		},
		description: [
			"Five nozzles {@condition hidden} across the apartment's ceiling spew thick clouds of acidic poison from a reinforced tank behind the wall.",
		],
		disable: {
			entries: [
				'DC 35 {@skill Thievery} (expert) to block one of the nozzles or DC 40 {@skill Thievery} (master) to shut off the tank. The trap deactivates after 5 rounds, once the tank is empty.',
			],
		},
		defenses: {
			ac: {
				std: 34,
			},
			savingThrows: {
				fort: {
					std: 28,
				},
				ref: {
					std: 20,
				},
			},
			hardness: {
				Nozzle: 15,
				Tank: 20,
			},
			hp: {
				Nozzle: 40,
				Tank: 100,
				notes: {
					Tank: 'to damage the tank enough to stop it from spewing gas',
					Nozzle: 'to destroy a nozzle',
				},
			},
			bt: {
				Nozzle: 20,
				Tank: 50,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'Twelve seconds have passed since the door to the apartment was opened',
				entries: ['The trap rolls initiative.'],
				name: 'Spew Cloud',
			},
		],
		routine: [
			"(1 action) When it's triggered, the trap has five active nozzles, but at the end of its turn each round, one random nozzle deactivates. On the trap's turn, the active nozzles emit a cloud of acidic poison gas that expands to fill the apartment. The cloud deals {@damage 1d6} acid damage and {@damage 1d6} poison damage per active nozzle to each creature and object in the room (DC 33 basic Fortitude save). Unattended objects automatically fail saves to avoid the damage.",
		],
	},
	{
		name: 'Agitated Carnivorous Plants',
		source: 'SoT2',
		page: 36,
		level: 5,
		traits: ['uncommon', 'environmental'],
		stealth: {
			dc: 20,
			minProf: 'trained',
		},
		description: [
			'Many carnivorous plants that were once kept satiated now hunger for any meat they can get, even lashing out onto the path to get it.',
		],
		disable: {
			entries: [
				'DC 25 {@skill Survival} (trained) to distract or trick the plants or DC 22 {@skill Nature} (expert) to calm the plants.',
			],
		},
		defenses: {
			ac: {
				std: 20,
			},
			savingThrows: {
				fort: {
					std: 17,
				},
				ref: {
					std: 9,
				},
			},
			hp: {
				std: 60,
			},
			bt: {
				std: 30,
			},
			immunities: ['mental'],
			weaknesses: [
				{
					amount: 10,
					name: 'acid',
				},
				{
					amount: 10,
					name: 'fire',
				},
				{
					amount: 10,
					name: 'slashing',
				},
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: "A creature moves within reach of the carnivorous plants' vines",
				entries: [
					'The vines wrap around the triggering creature. The creature must succeed at a DC 22 Reflex save or be {@condition grabbed} until it Escapes (DC 22). Whether or not the creature is {@condition grabbed}, the plants make a gnawing plants {@action Strike} against the creature.',
				],
				name: 'Trapping Vines',
			},
		],
		attacks: [
			{
				range: 'Melee',
				name: 'gnawing plants',
				attack: 17,
				damage: '{@dice 8d4+12} piercing',
				types: ['piercing'],
				noMAP: true,
			},
		],
	},
	{
		name: 'Air Rift',
		source: 'FRP2',
		page: 17,
		level: 14,
		traits: ['unique', 'air', 'complex', 'environmental', 'magical'],
		stealth: {
			bonus: 22,
			minProf: 'master',
			notes: 'to notice the sudden breeze in the theater.',
		},
		description: [
			'A portal to the Plane of Air rips open onstage, causing roaring winds to tear through the opera house.',
		],
		disable: {
			entries: [
				'DC 38 {@skill Arcana} (master) to sew the magical threads of the rift shut, DC 40 {@skill Nature} or {@skill Survival} (legendary) to open enough windows and doors to reduce its intensity, or dispel magic (7th level; counteract DC 34) to counteract the air rift.',
			],
		},
		defenses: {
			ac: {
				std: 35,
				'vs. reactions and ranged weapon attacks': 40,
			},
			hp: {
				std: 220,
			},
			weaknesses: [
				{
					name: 'earth vulnerability',
				},
			],
			savingThrows: {
				fort: {
					std: 30,
				},
			},
		},
		actions: [
			{
				name: 'Earth Vulnerability',
				entries: [
					'The Elemental Plane of Air is opposed by the Plane of Earth. Any spell or {@trait magical} effect with the {@trait earth} trait that targets a creature or area within 50 feet of the rift deals 10 damage to the rift per spell levels (or per 2 levels for magic items, feats, and so forth). For example, a 3rd-level {@spell earthbind} spell cast on a creature near the air rift deals 30 points of damage to the rift.',
				],
			},
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature comes within 50 feet of the rift',
				entries: [
					'The air rift creates a shroud of subjective gravity around the creature for 1 minute. The creature can use a free action, which has the {@trait concentrate} trait, to choose any direction they wish for gravity to pull them. This allows a creature to {@action Stride} along any surface or {@action Fly} in a straight line by choosing a direction into midair. For unattended objects and mindless creatures, this is microgravity: they float in place unless pushed off a surface.',
				],
				name: 'Weightlessness',
			},
		],
		routine: [
			'(1 action) Winds blow through the area in a random direction, causing creatures and objects within 50 feet of the air rift to float up, down, north, south, east, or west (roll a d6 to determine which direction). Creatures and objects in the area must attempt a DC 37 Fortitude save. If a creature is pushed into a solid object or another creature by this effect, both take {@damage 3d8+15} bludgeoning damage on impact.',
			{
				type: 'successDegree',
				entries: {
					'Critical Success': 'The creature is unaffected.',
					Success:
						'The creature is pushed 10 feet, but takes only half damage from impact.',
					Failure:
						'The creature is pushed 20 feet, falls {@condition prone}, and takes full damage from impact.',
					'Critical Failure':
						'The creature is pushed 40 feet, falls {@condition prone}, and takes double damage from impact.',
				},
			},
		],
	},
	{
		name: "Angazhan's Rake Trap",
		source: 'Sli',
		page: 29,
		level: 7,
		traits: ['uncommon', 'mechanical', 'trap'],
		stealth: {
			dc: 27,
			minProf: 'expert',
		},
		description: [
			'Six metal talons {@condition concealed} in the walls swing out and rake across the room.',
		],
		disable: {
			entries: ['{@skill Thievery} DC 25 (expert) to disable each talon.'],
		},
		defenses: {
			ac: {
				std: 25,
			},
			savingThrows: {
				fort: {
					std: 18,
				},
				ref: {
					std: 10,
				},
			},
			hardness: {
				std: 15,
			},
			hp: {
				std: 60,
			},
			bt: {
				std: 30,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['attack'],
				trigger: 'one of the pressure plates is depressed',
				entries: [
					'Six talons swing out from the walls, each striking a different random creature in the room. No creature can be struck by more than one talon until every creature in the room has been attacked by at least one talon.',
				],
				name: 'Raking Strike',
			},
		],
		reset: ['The trap resets after 1 minute.'],
		attacks: [
			{
				range: 'Melee',
				name: 'talon',
				attack: 22,
				traits: ['deadly <d10>'],
				damage: '{@damage 1d10+2}',
				types: ['piercing'],
				noMAP: true,
			},
		],
	},
	{
		name: 'Angry Vegetation',
		source: 'EC6',
		page: 41,
		level: 20,
		traits: ['unique', 'complex', 'environmental'],
		stealth: {
			dc: 42,
			minProf: 'master',
			notes: 'to notice massive buds beneath the other foliage before they open.',
		},
		description: [
			'Five large flowers in the weed-choked field unfurl, each dusting pollen onto vines that animate into wemmuths.',
		],
		disable: {
			entries: [
				'DC 48 {@skill Nature} (master) or DC 48 {@skill Performance} (legendary) to calm a flower, closing it.',
			],
		},
		defenses: {
			ac: {
				std: 37,
			},
			savingThrows: {
				fort: {
					std: 33,
				},
				ref: {
					std: 30,
				},
			},
			hp: {
				std: 120,
				notes: {
					std: 'per flower',
				},
			},
			immunities: ['mental'],
			weaknesses: [
				{
					amount: 20,
					name: 'fire',
				},
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A non-plant creature enters the garden',
				entries: [
					"The blooms open, spawning a single {@creature wemmuth} that acts on the hazard's initiative, and the hazard rolls for initiative.",
				],
				name: 'Bloom',
			},
		],
		routine: [
			'{@as 2} If there are fewer wemmuths than open flowers, the flowers create more wemmuths (so there as many wemmuths as open flowers) as their first action.',
			'For their second action, the flowers produce a mindaddling pollen. Each non-plant creature within 30 feet of a flower must succeed at a DC 41 Fortitude save or become {@condition slowed|CRB|slowed 1} for 1 round (or {@condition confused} for 1 round, on a critical failure). The pollen is an emotion, mental, and olfactory effect.',
		],
		reset: [
			'Wemmuths collapse into ordinary vines and the trap resets if the area is left alone for 1 minute.',
		],
	},
	{
		name: 'Arcane Feedback Trap',
		source: 'AoE4',
		page: 47,
		level: 13,
		traits: ['arcane', 'magical', 'trap'],
		stealth: {
			dc: 35,
			minProf: 'expert',
		},
		description: ['A spike of stone bursts from the south wall and quickly retracts.'],
		disable: {
			entries: [
				'DC 33 {@skill Arcana} (master) to quell the rippling stone or dispel magic (7th level, counteract DC 31) to dispel the magical feedback.',
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['arcane', 'earth', 'evocation'],
				trigger: 'A creature in area E1 casts an arcane spell or uses an arcane ability',
				entries: [
					'The trap makes a stone spike attack against the triggering creature. For the next 1 minute thereafter, the ripples are stronger, giving the trap a +2 circumstance bonus on stone spike {@action Strike||Strikes} during this time.',
				],
				name: 'Stone Spike',
			},
		],
		attacks: [
			{
				range: 'Melee',
				name: 'stone spike',
				attack: 31,
				damage: '{@damage 6d12+24} piercing',
				types: ['piercing'],
				noMAP: true,
			},
		],
	},
	{
		name: 'Armageddon Orb',
		source: 'CRB',
		page: 526,
		level: 23,
		traits: ['rare', 'magical', 'trap'],
		stealth: {
			dc: 10,
			notes: 'or {@spell detect magic}.',
		},
		description: [
			"A roiling red orb, forged from a drop of the god Rovagug's blood, rains fire from the sky when a specified condition is met.",
		],
		disable: {
			entries: [
				"{@skill Thievery} DC 48 (legendary) to imbue thieves' tools with aspects representing Asmodeus and Sarenrae and use them to drain away the orb's power over 10 minutes; the character attempting this check takes 5 fire damage each round until the orb is depleted.",
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['death', 'divine', 'evocation', 'fire'],
				trigger:
					"A special condition set by the trap's creator occurs; this is typically the event of their death.",
				entries: [
					'Fire rains from the sky in a 100-mile radius, dealing {@damage 10d6} fire damage to creatures and objects in the area. Each creature or object can attempt a DC 46 basic Reflex save. Any creature reduced to 0 Hit Points by this damage dies instantly. This is not enough damage to completely burn away a forest or level an entire mountain or city, but it typically kills most creatures in the area.',
				],
				name: 'Burn It All',
			},
		],
	},
	{
		name: 'Ash Web',
		source: 'AoA4',
		page: 12,
		level: 10,
		traits: ['environmental', 'fungus'],
		stealth: {
			dc: 31,
			minProf: 'expert',
		},
		description: [
			'This dangerous sooty black mold readily releases its toxic spores when disturbed. The entire swath of fungus in area {@b B2} is a single organism. There are nine 10-foot-square patches to remove, but the whole organism dies once it takes enough damage.',
		],
		disable: {
			entries: [
				'{@skill Survival} DC 27 (expert) to remove a 10-foot-square patch of ash web without triggering the spores',
			],
		},
		defenses: {
			ac: {
				std: 28,
			},
			savingThrows: {
				fort: {
					std: 22,
				},
				ref: {
					std: 14,
				},
			},
			hp: {
				std: 100,
			},
			immunities: [
				'acid',
				'critical hits',
				'electricity',
				'fire',
				'object immunities',
				'precision damage',
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger:
					"A creature moves into the ash web's space or damages the web with any type of damage other than cold damage.",
				requirements: 'The ash web is not in direct sunlight.',
				entries: [
					'The triggering creature and all creatures within 10 feet of that creature are exposed to ash web spores.',
				],
				name: 'Spore Explosion',
			},
			{
				type: 'affliction',
				name: 'Ash Web Spores',
				traits: ['inhaled', 'poison'],
				note: "The {@condition enfeebled} condition from ash web remains even after the poison's duration ends. The condition's value reduces by 1 per hour. Gugs are immune to this poison; instead, they have vivid and strange dreams when they sleep after ingesting ash web.",
				DC: 29,
				savingThrow: 'Fortitude',
				maxDuration: '6 rounds',
				stages: [
					{
						stage: 1,
						entry: '{@damage 2d6} poison damage and {@condition enfeebled|CRB|enfeebled 1}',
						duration: '1 round',
					},
					{
						stage: 2,
						entry: '{@damage 4d6} poison damage and {@condition enfeebled|CRB|enfeebled 2}',
						duration: '1 round',
					},
					{
						stage: 3,
						entry: '{@damage 6d6} poison and {@condition enfeebled|CRB|enfeebled 3}',
						duration: '1 round',
					},
				],
			},
		],
		reset: ['This large patch of ash web resets automatically at the start of the round.'],
	},
	{
		name: 'Axiomatic Polymorph Trap',
		source: 'EC6',
		page: 49,
		level: 20,
		traits: ['magical', 'trap'],
		stealth: {
			dc: 47,
			minProf: 'master',
		},
		description: ['A Utopian glyph transforms trespassers into aeons.'],
		disable: {
			entries: [
				"DC 48 {@skill Thievery} (master) to drain the glyph's power harmlessly, or dispel magic (9th level; counteract DC 42) to counteract the glyph.",
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['divine', 'transmutation'],
				trigger:
					'A creature moves within 10 feet of the entryway to the Hall of Wonders (area {@b N4}) without speaking the passphrase ("The History and Future of Humanity") in Utopian.',
				entries: [
					'Each creature within 20 feet of the door is targeted by baleful polymorph (DC 42 Will save), except the effect transforms creatures into the form of an {@creature arbiter||arbiter aeon} rather than that of an animal.',
				],
				name: 'Axiomatic Polymorph',
			},
		],
		reset: ['1 hour.'],
	},
	{
		name: "Banshee's Symphony",
		source: 'CRB',
		page: 529,
		level: 18,
		traits: ['complex', 'magical', 'trap'],
		stealth: {
			bonus: 30,
			minProf: 'legendary',
		},
		description: [
			'A magically contagious {@spell wail of the banshee} spell is trapped in the larynx of an {@condition invisible}, mummified elf.',
		],
		disable: {
			entries: [
				'{@skill Thievery} DC 42 (master) to pierce the {@condition invisible} larynx so precisely that the magic releases in a trickle before the trap activates, {@skill Thievery} DC 44 (legendary) three times to deconstruct the larynx while the trap is active in such a way that it tears the spell apart, or spell DC 38 (9th level) to counteract the wail of the banshee before the trap activates.',
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger:
					'Three or more living creatures remain within 100 feet of the trap for 6 seconds or longer.',
				entries: [
					'The trap releases an arcane wail of the banshee (DC 40) with a 100-foot-radius emanation instead of 40 feet, targeting all living creatures in the area, and rolls initiative.',
				],
				name: 'Scream',
			},
		],
		routine: [
			"(1 action) The trap uses its action to force one random creature that failed its save against wail of the banshee last turn to emit a wail of the banshee with the same statistics as the initial one. The creature wails even if it is dead or unable to speak, no matter how far away from the trap it is. Unlike a casting of the spell, the {@condition drained} condition from this trap's {@spell wail of the banshee} spells increases the targets' {@condition drained} condition values. A creature that critically succeeds at any of its saves can still be affected by the trap on future rounds, but can't be forced to wail by the trap.",
		],
		reset: [
			'The trap ends when the trap is unable to make a creature scream (usually because no creature failed its save on the previous turn or because all creatures have critically succeeded in the past). It then resets over 24 hours, as a new scream builds up in the mummified larynx.',
		],
	},
	{
		name: "Barzillai's Hounds",
		source: 'AoA3',
		page: 27,
		level: 6,
		traits: ['rare', 'complex', 'haunt'],
		stealth: {
			bonus: 17,
		},
		description: [
			'Hell hounds {@condition invisible} to all but their lone target burn their chosen victim.',
		],
		disable: {
			entries: ['{@skill Religion} DC 24 (expert) to perform an exorcism (with 2 actions)'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['conjuration', 'occult'],
				trigger:
					"A creature that doesn't openly wear the symbol of {@deity Asmodeus} comes within 60 feet of the haunt's initial location.",
				entries: [
					"The hounds appear before the chosen target and begin to chase that creature, howling wildly. The haunt rolls initiative. Others cannot see or hear this baying and must {@action Seek} to determine the hounds' location.",
				],
				name: 'Begin the Hunt',
			},
		],
		speed: {
			walk: 60,
		},
		routine: [
			'(2 actions) The haunt uses its first action to {@action Stride}, then its second action for a jaws {@action Strike} against its designated target if it is in reach. If the target is not in reach, the haunt resets.',
			{
				type: 'ability',
				name: 'Speed',
				entries: ['60 feet'],
			},
			{
				type: 'attack',
				range: 'Melee',
				name: 'jaws',
				attack: 20,
				traits: ['magical'],
				damage: '{@damage 1d10+11} piercing plus {@damage 1d10} fire',
				types: ['fire', 'piercing'],
			},
		],
		reset: [
			"If their designated target dies or the hounds can't reach it in a turn, the hounds vanish into noxious smoke, but they manifest again elsewhere in the city after the next sunset.",
		],
	},
	{
		name: 'Befuddling Gas Trap',
		source: 'AV3',
		page: 52,
		level: 11,
		traits: ['complex', 'mechanical', 'trap'],
		stealth: {
			bonus: 21,
			minProf: 'expert',
			notes: 'or DC 31 (expert) to notice the {@condition hidden} override mechanism on the north wall.',
		},
		description: [
			'Seven nozzles {@condition hidden} within holes in the 15-foot-high ceiling release a poison gas.',
		],
		disable: {
			entries: [
				'DC 33 {@skill Thievery} (master) to disable the {@condition hidden} mechanism on the north wall, immediately sucking the gas from the room, or DC 29 {@skill Thievery} (expert) to adequately plug one of the seven nozzles. When all seven nozzles are plugged or destroyed, the trap is deactivated.',
			],
		},
		defenses: {
			ac: {
				std: 31,
			},
			savingThrows: {
				fort: {
					std: 24,
				},
				ref: {
					std: 18,
				},
			},
			hardness: {
				Nozzle: 20,
			},
			hp: {
				Nozzle: 32,
			},
			bt: {
				Nozzle: 16,
			},
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['inhaled', 'mental', 'poison'],
				trigger: 'Both secret doors are closed and at least one creature is in the room',
				entries: [
					'Gas fills the chamber. Creatures within the chamber must succeed on a DC 30 Fortitude save or become {@condition stupefied|CRB|stupefied 1} ({@condition stupefied|CRB|stupefied 2} on a critical failure). The trap then rolls initiative.',
				],
				name: 'Gas Release',
			},
		],
		routine: [
			'(1 action) The gas intensifies. Each creature in the room must make a DC 30 Fortitude save.',
			{
				type: 'successDegree',
				entries: {
					'Critical Success': [
						'The creature is unaffected and becomes temporarily immune to the gas for 1 hour, though if the creature has already been {@condition stupefied} by the trap, that condition remains for its normal duration.',
					],
					Success: ['The creature is unaffected.'],
					Failure: [
						'The creature becomes {@condition stupefied|CRB|stupefied 1} for 24 hours.',
						'If the target is already {@condition stupefied}, the condition value increases by 1 (to a maximum of {@condition stupefied|CRB|stupefied 4}) and the target takes {@damage 8d6} mental damage.',
					],
					'Critical Failure': [
						'As failure, except the target takes double the mental damage.',
					],
				},
			},
		],
		reset: [
			'After an hour, the trap deactivates; the gas disperses slowly, and the doors can be opened again. After 24 hours, the gas builds up and the trap can be triggered again.',
		],
	},
	{
		name: 'Black Powder Bomb',
		source: 'AoA2',
		page: 40,
		level: 6,
		traits: ['uncommon', 'mechanical', 'trap'],
		stealth: {
			dc: 15,
			notes: "(The three powder kegs aren't particularly well {@condition hidden}, but they are out of sight to casual observation.)",
		},
		description: [
			'Three bulky kegs of black powder placed at key locations in the temple are triggered to explode in unison, causing the entire structure to collapse into rubble and slide partially down the cliff face.',
		],
		disable: {
			entries: [
				"No special skills are required to disable this manually activated trap. As an {@action Interact} action, a PC can sweep aside some black powder to interrupt the fuse line, but this doesn't prevent Gerhard from activating a keg via blunderbuss. A keg that is removed from its position (either by being thrown over the cliff or merely carried away) retains its explosive potential, but as long as one of the three kegs are removed they no longer have the precise placement required to trigger a collapse\u2014an explosion at this point merely inflicts fire damage in the appropriate areas but does not particularly damage the temple structure itself.",
				"A keg's contents can be dispersed by scattering the gunpowder to the wind (most efficiently by pouring it over the cliff side) as a 2-action activity, or rendered permanently inert by pouring a gallon of water into the powder, inhibiting its explosive qualities. The kegs themselves can be destroyed with damage (note that the AC listed below for each keg takes into account the fact that Gerhard has wedged the kegs into nooks in the temple's stone flooring and walls), but note that any fire damage (including incidental fire damage from area effects like a fireball or Gerhard's blunderbuss) causes them to explode. At your option, other actions may be similarly effective at disabling this hazard.",
			],
		},
		defenses: {
			ac: {
				std: 26,
			},
			savingThrows: {
				fort: {
					std: 17,
				},
				ref: {
					std: 8,
				},
			},
			hardness: {
				'Hidden Keg': 5,
			},
			hp: {
				'Hidden Keg': 20,
			},
			bt: {
				'Hidden Keg': 10,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
			weaknesses: [
				{
					name: 'fire automatically penetrates hardness',
				},
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['fire'],
				trigger:
					'One of the three kegs takes any fire damage, including damage caused by a line of black powder burning up to a keg.',
				entries: [
					"The keg explodes, causing {@damage 5d6} fire damage (DC 24 basic Reflex) in a 20-foot emanation; this can cause an instantaneous chain reaction if either of the other kegs are in this area (note that as positioned, all three kegs are in range to trigger a chain reaction). Fire damage in overlapping areas isn't cumulative, but if all three kegs are in their initial positions when the explosion occurs, the temple itself collapses, causing {@damage 8d6} bludgeoning damage to all creatures in the temple (DC 24 basic Reflex).",
				],
				name: 'Destructive Explosion',
			},
		],
	},
	{
		name: "Blackfingers's Prayer",
		source: 'AoE6',
		page: 49,
		level: 19,
		traits: ['magical', 'trap'],
		stealth: {
			dc: 40,
			minProf: 'legendary',
		},
		description: [
			"The trapdoor's metal is infused with a deadly toxin that seeps out when the trap is triggered.",
		],
		disable: {
			entries: [
				"DC 50 {@skill Thievery} (legendary) to gum up the trapdoor's porous metal surface, DC 45 {@skill Crafting} (master) to render the toxin inert, or dispel magic (9th level; counteract DC 45) to counteract the trap's magic.",
			],
		},
		defenses: {
			ac: {
				std: 40,
			},
			savingThrows: {
				fort: {
					std: 38,
				},
				ref: {
					std: 30,
				},
			},
			hardness: {
				std: 30,
			},
			hp: {
				std: 150,
			},
			bt: {
				std: 75,
			},
			immunities: ['object immunities'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['curse', 'divine', 'necromancy'],
				trigger: 'A creature opens the door without first whispering the name Blackfingers',
				entries: [
					'The metal trapdoor emits toxic vapors. Each creature within 30 feet must save against a potent strain of blackfinger blight.',
				],
				name: "Blackfingers's Prayer",
			},
			{
				type: 'affliction',
				name: 'Blackfinger Blight',
				traits: ['inhaled', 'poison', 'virulent'],
				note: "Each round, at the beginning of their turn, a creature affected by blackfinger blight must succeed at a DC {@flatDC 5} flat check or drop one random item they're holding",
				DC: 40,
				savingThrow: 'Fortitude',
				onset: '1 round',
				maxDuration: '6 rounds',
				stages: [
					{
						stage: 1,
						entry: '{@damage 6d6} poison damage',
						duration: '1 round',
					},
					{
						stage: 2,
						entry: '{@damage 8d6} poison damage',
						duration: '1 round',
					},
					{
						stage: 3,
						entry: '{@damage 10d6} poison damage and {@condition confused}',
						duration: '1 round',
					},
				],
			},
		],
	},
	{
		name: 'Blast Tumbler',
		source: 'AV3',
		page: 45,
		level: 10,
		traits: ['magical', 'mechanical', 'trap'],
		stealth: {
			dc: 32,
			minProf: 'master',
		},
		description: [
			"A hard-to-reach rune is placed on the lock's tumbler. It emits a blast of force when the door is jostled.",
		],
		disable: {
			entries: [
				"DC 32 {@skill Thievery} (master) to disarm the rune, or dispel magic (5th level; counteract DC 28) to counteract the rune's magic.",
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['evocation', 'force', 'occult'],
				trigger:
					'A non-undead creature opens the door or critically fails an attempt to disarm or dispel the rune',
				entries: [
					'A 30-foot cone of force issues forth from the lock. Creatures within the cone must succeed a DC 29 basic Fortitude saving throw or take {@damage 8d12} force damage. Those who fail the save are pushed 10 feet, and those who critically fail are pushed 20 feet and are {@condition stunned|CRB|stunned 2}.',
				],
				name: 'Force Blast',
			},
		],
		reset: ['The rune resets 1 minute after it triggers.'],
	},
	{
		name: 'Blood Of Belcorra',
		source: 'AV1',
		page: 13,
		level: 3,
		traits: ['complex', 'haunt'],
		stealth: {
			bonus: 23,
			minProf: 'expert',
		},
		description: [
			'A bloody image of Belcorra arises, emits a soul-draining light, then inhales blood from living creatures in the room.',
		],
		disable: {
			entries: [
				"DC 22 {@skill Thievery} (trained) to wipe away enough of the bloodstain to disrupt the haunt's necromantic energies, or DC 20 {@skill Religion} (trained) to exorcise the haunt.",
			],
		},
		defenses: {
			ac: {
				std: 19,
			},
			savingThrows: {
				fort: {
					std: 6,
				},
				ref: {
					std: 9,
				},
			},
			hp: {
				std: 50,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
			weaknesses: [
				{
					amount: 5,
					name: 'positive',
				},
			],
			resistances: [
				{
					amount: 5,
					name: 'physical',
					note: 'except {@item ghost touch}',
				},
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['light', 'necromancy'],
				trigger: 'A living creature ends its turn in area A11 at night',
				entries: [
					"A ghastly image of Belcorra, seemingly composed of fresh blood, rises from the bloodstain on the floor and rotates in place like a lighthouse. Beams of cold blue light shine from Belcorra's eyes and open mouth, causing blisters and decay to spread across flesh. Living creatures within a 30-foot burst from the center of area A11 must attempt a DC 20 Fortitude save. The haunt then rolls initiative.",
					{
						type: 'successDegree',
						entries: {
							'Critical Success': 'The creature is unaffected.',
							Success: 'The creature takes {@damage 1d8} negative damage.',
							Failure:
								'The creature takes {@damage 1d8+6} negative damage and is {@condition dazzled} for 1 round.',
							'Critical Failure':
								'The creature takes {@damage 2d8+6} negative damage and is {@condition blinded} for 1 round then {@condition dazzled} for 1 round.',
						},
					},
				],
				name: 'Gauntlight Beam',
			},
		],
		routine: [
			'(1 action) The bloody image opens its mouth and appears to inhale, drawing blood from the body of one creature in its line of sight within 90 feet from the center of area A11. The creature targeted must attempt a DC 20 Fortitude save.',
			{
				type: 'successDegree',
				entries: {
					'Critical Success': ['The creature is unaffected.'],
					Success: ['The creature takes {@damage 1d10} bleed damage.'],
					Failure: ['The creature takes {@damage 1d10+6} bleed damage.'],
					'Critical Failure': [
						"The creature takes {@damage 2d10+6} bleed damage and is {@condition enfeebled|CRB|enfeebled 2} as long as it's bleeding.",
					],
				},
			},
		],
		reset: [
			'If the haunt is disabled or destroyed through damage, the bloody phantom of Belcorra sprays upward in a spiral, dousing the trap door leading to area A25 before draining upward through the keyhole, which reduces the {@skill Thievery} DC to {@action Pick a Lock||Pick the Lock} to 20. At the next sunrise, the blood drains back down to this room and the haunt resets. The haunt is destroyed permanently once Lasda Venkervale is rescued from area D9.',
		],
	},
	{
		name: 'Bloodthirsty Urge',
		source: 'CRB',
		page: 524,
		level: 10,
		traits: ['haunt'],
		stealth: {
			dc: 31,
			minProf: 'trained',
		},
		description: [
			'An object haunted by the echoes of a vicious mind attempts to kill someone who comes near.',
		],
		disable: {
			entries: [
				'{@skill Religion} DC 29 (master) to exorcise the spirit or {@skill Diplomacy} DC 31 (expert) to talk it down.',
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['death', 'emotion', 'fear', 'illusion', 'mental', 'occult'],
				trigger: 'A creature moves within 10 feet of the haunted object.',
				entries: [
					'The haunt takes control of the triggering creature, forcing it to attack itself. The creature must attempt a DC 29 Will save.',
					{
						type: 'successDegree',
						entries: {
							'Critical Success': 'The target is unaffected.',
							Success:
								'The target makes a {@action Strike} against itself and automatically hits; the target also becomes {@condition frightened 1}.',
							Failure:
								'The target makes a {@action Strike} against itself and automatically scores a critical hit; the target also becomes {@condition frightened 2}.',
							'Critical Failure':
								'The target attempts a Fortitude save. If the target succeeds, it is subject to the effects of a failure instead. If the target fails, it is reduced to 0 Hit Points and dies.',
						},
					},
				],
				name: 'Quietus',
			},
		],
	},
	{
		name: 'Boiling Fountains',
		source: 'AoE1',
		page: 24,
		level: 2,
		traits: ['mechanical', 'trap'],
		stealth: {
			dc: 18,
			minProf: 'trained',
			notes: 'to spot the pressure plates.',
		},
		description: [
			'Four pressure plates beneath the floorboards activate dragon-headed fountains on either side of the room, which spray boiling water across the area between them.',
		],
		disable: {
			entries: [
				"DC 21 {@skill Thievery} (trained) to disable each pressure plate, DC 16 to jam each fountain, or DC 18 to deflect a fountain's spray.",
			],
		},
		defenses: {
			ac: {
				std: 15,
			},
			savingThrows: {
				fort: {
					std: 8,
				},
				ref: {
					std: 5,
				},
			},
			hardness: {
				Fountain: 8,
			},
			hp: {
				Fountain: 30,
			},
			bt: {
				Fountain: 15,
			},
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['fire', 'water'],
				trigger:
					'Weight is placed on one of the squares marked with "T" on the map, triggering a pressure plate',
				entries: [
					'The fountains spray boiling water across their own squares and the 10-footby- 20-foot area between them (marked with dotted lines), dealing {@damage 4d6+4} fire damage to any creatures in the area (DC 22 basic Reflex save).',
				],
				name: 'Scalding Spray',
			},
		],
		reset: ['Once a pressure plate has been activated, it must be reset manually.'],
	},
	{
		name: 'Boiling Tub Trap',
		source: 'AoE3',
		page: 56,
		level: 13,
		traits: ['mechanical', 'trap'],
		stealth: {
			dc: 37,
			minProf: 'master',
		},
		description: [
			"A snapped trip wire causes an alchemical bomb to detonate and blow up part of the tin tub, spilling boiling water all over the trap's victim.",
		],
		disable: {
			entries: [
				'DC 32 {@skill Thievery} (master) to safely remove the trip wire from the bomb.',
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'The trip wire is pulled or severed',
				entries: [
					'An acid flask detonates, spraying acid at nearby creatures and causing the tub of boiling water to burst in the same direction. All creatures in a 5-foot cone east of the triggered boiling tub trap take {@damage 3d6} {@condition persistent damage||persistent acid damage}, 3 acid {@trait splash} damage, and {@damage 8d6+20} fire damage (DC 31 basic Reflex save).',
				],
				name: 'Overflowing Boiling Water',
			},
		],
	},
	{
		name: 'Bottomless Pit',
		source: 'CRB',
		page: 524,
		level: 9,
		traits: ['magical', 'mechanical', 'trap'],
		stealth: {
			dc: 30,
			notes: '(or 0 if the trapdoor is disabled or {@condition broken}) or {@spell detect magic}.',
		},
		description: ['An iron trapdoor covers an infinitely deep 10-foot-square pit.'],
		disable: {
			entries: ['{@skill Thievery} DC 28 (trained) to remove the trapdoor.'],
		},
		defenses: {
			ac: {
				std: 28,
			},
			savingThrows: {
				fort: {
					std: 12,
				},
				ref: {
					std: 12,
				},
			},
			hardness: {
				Trapdoor: 9,
			},
			hp: {
				Trapdoor: 36,
			},
			bt: {
				Trapdoor: 18,
			},
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature walks onto the trapdoor.',
				entries: [
					'The triggering creature falls in and continues to fall, potentially forever. That creature can try to {@action Grab an Edge} to avoid {@quickref falling||3|falling}. The DC to {@action Climb} the walls or {@action Grab an Edge} is 26. The pit contains many handholds, so the falling creature can try to {@action Grab an Edge} again every 6 seconds. If the creature succeeds, it can start to {@action Climb} out from that point (though it might be a very long climb, depending on how far the creature fell). Since the creature falls endlessly, it can rest and even prepare spells while falling, though items dropped while falling are usually lost forever.',
				],
				name: 'Infinite Pitfall',
			},
		],
		reset: [
			'The trap still causes creatures to fall forever if they fall in, but the trapdoor must be reset manually for the trap to become {@condition hidden} again.',
		],
	},
	{
		name: 'Boulder Deadfall Trap',
		source: 'SoT2',
		page: 40,
		level: 7,
		traits: ['uncommon', 'mechanical', 'trap'],
		stealth: {
			dc: 25,
			minProf: 'trained',
			notes: 'DC 0 to spot the balanced boulders.',
		},
		description: [
			'A weight-sensitive plate buried underneath sand pulls a boulder over a cliff ledge, causing it to fall on targets within the entrance.',
		],
		disable: {
			entries: [
				'DC 27 {@skill Crafting} (expert) or DC 25 {@skill Thievery} (expert) to find and disconnect the plate from the tipping mechanism.',
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger:
					'A creature enters the area without taking care to avoid the {@condition hidden} trigger plate',
				entries: [
					'Creatures within 10 feet of the cave entrance take {@dice 4d10+18} damage (DC 25 basic Reflex save).',
				],
				name: 'Deadfall',
			},
		],
		reset: ['ting the boulders in the trap is a labor-intensive project that takes 2 hours.'],
	},
	{
		name: 'Broken Rebus Attack',
		source: 'FRP1',
		page: 15,
		level: 12,
		traits: ['unique', 'complex', 'haunt', 'magical'],
		stealth: {
			bonus: 20,
			minProf: 'trained',
		},
		description: [
			'Ghostly attackers knock the tables about, send dishes flying, and pull {@condition fleeing} creatures into the room.',
		],
		disable: {
			entries: [
				'DC 34 {@skill Religion} (expert) to say an Iroran prayer and put the haunt temporarily to rest, DC 38 {@skill Occultism} (master) to create a ward against future hauntings.',
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'One round passes since a creature entered the refectory',
				entries: [
					"A {@condition Broken} Rebus monk grabs the creature and yanks them toward the room's center. The triggering creature must attempt a DC 36 Fortitude save. The haunt can use this reaction any number of times per round, but only once per creature that tries to leave the room. The haunt then rolls initiative, if it hasn't already.",
					{
						type: 'successDegree',
						entries: {
							'Critical Success': 'The creature is unaffected.',
							Success: 'The creature is pulled 10 feet into the room.',
							Failure: 'The creature is pulled 15 feet into the room.',
							'Critical Failure':
								'The creature is pulled 15 feet into the room, knocked {@condition prone}, and takes {@damage 2d6} bludgeoning damage.',
						},
					},
				],
				name: 'Ghostly Pull',
			},
		],
		routine: [
			'(1 action) The haunt sends a flurry of objects hurtling across the room. All creatures in the room are battered by the ghostly objects, taking {@damage 3d10+14} force damage (DC 32 basic Reflex save).',
		],
		reset: [
			'The haunt deactivates after 1 minute. It re-forms at the same times every day, 7 a.m. and 7 p.m., which is when the monks had their morning and evening meals.',
			"If at least two people cook a meal in the kitchen, share a meal in the refectory, and utter a prayer to {@deity Irori} before the meal, the haunt becomes permanently disabled and doesn't re-form.",
		],
	},
	{
		name: 'Burning Chandelier Trap',
		source: 'AoE4',
		page: 38,
		level: 15,
		traits: ['complex', 'magical', 'mechanical', 'trap'],
		stealth: {
			bonus: 26,
			minProf: 'master',
			notes: "or DC 38 (master) to spot the trap's control panel.",
		},
		description: ['Four large flaming chandeliers swing wildly around the room.'],
		disable: {
			entries: [
				"DC 36 {@skill Thievery} (master) to disable a chandelier or dispel magic (8th level; counteract DC 33) to permanently drain the magic from a chandelier. Any amount of cold damage that overcomes a chandelier's cold resistance extinguishes its flames and removes its {@condition persistent damage||persistent fire damage} and flame dart attack. DC 41 {@skill Thievery} (legendary) to disable the entire trap from the {@condition hidden} control panel in the southeast corner of the room.",
			],
		},
		defenses: {
			ac: {
				std: 36,
			},
			savingThrows: {
				fort: {
					std: 27,
				},
				ref: {
					std: 22,
				},
			},
			hardness: {
				Chandelier: 30,
				Panel: 18,
			},
			hp: {
				Chandelier: 120,
				Panel: 88,
			},
			bt: {
				Chandelier: 60,
				Panel: 44,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
			resistances: [
				{
					amount: 15,
					name: 'cold',
				},
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['occult', 'transmutation'],
				trigger: 'A creature touches the cage door, the closet door, or any wooden stand',
				entries: [
					"Both double doors leading out of the room shut and lock; while the trap is active, the key doesn't work to open these doors (although their locks can be picked normally). The chandeliers drop several feet on elongated chains, allowing them to swing around the room. The closest chandelier to the triggering creature makes a swinging chandelier {@action Strike} against it. The trap then rolls initiative.",
				],
				name: 'Extending Chandeliers',
			},
		],
		routine: [
			"(4 actions) For every chandelier disabled, the trap's actions are reduced by 1. For each of the trap's actions, a different chandelier attacks a random creature in the room. A chandelier uses its swinging chandelier attack if it can, but it can't make melee attacks against creatures in the cage, the closet, or the gap between the two double doors leading into the vault. Against a creature it can't reach with a melee attack, it uses a flame dart attack instead. The trap doesn't take multiple attack penalties.",
			{
				type: 'attack',
				range: 'Melee',
				name: 'swinging chandelier',
				attack: 35,
				damage: '{@damage 3d12+25} bludgeoning and {@damage 4d6} {@condition persistent damage||persistent fire}',
				types: ['bludgeoning', 'persistent'],
				noMAP: true,
			},
			{
				type: 'attack',
				range: 'Ranged',
				name: 'flame dart',
				attack: 32,
				traits: ['range <40 feet>'],
				damage: '{@damage 4d8+20} fire and {@damage 4d6} {@condition persistent damage||persistent fire}',
				types: ['fire', 'persistent'],
				noMAP: true,
			},
		],
		reset: [
			'The trap deactivates and resets 1 minute after there are no living creatures remaining in the room.',
		],
	},
	{
		name: 'Buzzing Latch Rune',
		source: 'EC4',
		page: 21,
		level: 13,
		traits: ['electricity', 'magical', 'sonic', 'trap'],
		stealth: {
			dc: 32,
			minProf: 'master',
		},
		description: [
			'An {@condition invisible} rune on the door begins emitting a very loud buzzing sound, potentially paralyzing an intruder.',
		],
		disable: {
			entries: [
				'DC 34 {@skill Thievery} (master) to disrupt the rune without triggering it or dispel magic (6th level; counteract DC 31) to magically counteract the rune.',
			],
		},
		defenses: {
			ac: {
				std: 33,
			},
			savingThrows: {
				fort: {
					std: 25,
				},
				ref: {
					std: 19,
				},
			},
			hardness: {
				std: 21,
			},
			hp: {
				std: 84,
			},
			bt: {
				std: 42,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['electricity', 'evocation', 'primal', 'sonic'],
				trigger: 'A creature attempts to open the door without using the key',
				entries: [
					'The trap makes a loud buzz and deals {@damage 5d10} electricity damage and {@damage 5d10} sonic damage to the triggering creature (DC 32 basic Reflex save; this save applies to both the electricity damage and the sonic damage). Further, the creature must attempt a DC 32 Fortitude save.',
					{
						type: 'successDegree',
						entries: {
							'Critical Success': 'No effect.',
							Success: 'The target is {@condition paralyzed} for 1 round.',
							Failure:
								'The target is {@condition paralyzed} for {@dice 1d4} rounds. At the end of each of its turns, it can attempt a new DC 32 Fortitude save to reduce the remaining duration by 1 round, or end it entirely on a critical success.',
							'Critical Failure':
								'The target is {@condition paralyzed} for 1 minute. At the end of each of its turns, it can attempt a new Fortitude save to reduce the remaining duration by 1 round, or end it entirely on a critical success.',
						},
					},
				],
				name: 'Jolting Buzz',
			},
		],
		reset: ['The trap resets after 1 hour.'],
	},
	{
		name: 'Canopy Drop',
		source: 'AoE1',
		page: 52,
		level: 4,
		traits: ['mechanical', 'trap'],
		stealth: {
			dc: 25,
			minProf: 'expert',
		},
		description: [
			'A trapdoor, connected to floor sensors, opens in the section of floor marked on the map, while the surrounding floor suddenly tilts to a 45-degree angle and the fountains in the wall begin spraying at high pressure, making the tile slippery and pushing creatures toward the open chute.',
		],
		disable: {
			entries: [
				'DC 23 {@skill Thievery} (expert) to jam the mechanisms and keep the trapdoor from opening, or to locate the bypass switch {@condition hidden} under a stair riser just outside the room.',
			],
		},
		defenses: {
			ac: {
				std: 20,
			},
			savingThrows: {
				fort: {
					std: 13,
				},
				ref: {
					std: 8,
				},
			},
			hardness: {
				Trapdoor: 10,
			},
			hp: {
				Trapdoor: 40,
			},
			bt: {
				Trapdoor: 20,
			},
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'Two or more creatures stand on the trapped spaces',
				entries: [
					'One round after the trap is triggered, all creatures in the room fall 40 feet down the shaft to area E36, taking 20 bludgeoning damage from the fall plus {@damage 2d6} piercing damage as they land in the spiked pit. The creatures can {@action Grab an Edge} to snag the hammock or one of the hanging storage containers to avoid falling. The DC to {@action Climb} the walls or {@action Grab an Edge} is 20.',
				],
				name: 'Flush',
			},
		],
	},
	{
		name: 'Catacomb Cave-in',
		source: 'EC1',
		page: 37,
		level: 4,
		traits: ['environmental', 'trap'],
		stealth: {
			dc: 23,
			minProf: 'trained',
		},
		description: [
			'The ceiling is unstable, and any Medium or larger creature that approaches within 5 feet of the collapsed tunnel triggers a cave-in.',
		],
		disable: {
			entries: [
				'{@skill Thievery} DC 21 (trained) to prop up the ceiling in key locations prior to the cave-in.',
			],
		},
		defenses: {
			ac: {
				std: 21,
			},
			savingThrows: {
				fort: {
					std: 12,
				},
				ref: {
					std: 8,
				},
			},
			hardness: {
				std: 11,
			},
			hp: {
				std: 44,
			},
			bt: {
				std: 22,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
			weaknesses: [
				{
					amount: 10,
					name: 'sonic',
				},
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger:
					'A Medium or larger creature approaches within 5 feet of the collapsed tunnel',
				entries: [
					'Massive stones in the ceiling fall, dealing {@damage 4d6} bludgeoning damage to the triggering creature and all creatures within 10 feet (DC 18 basic Reflex save). Creatures that fail the saving throw are also buried and begin to suffocate. A buried creature can attempt a DC 20 {@skill Athletics} check every round, breaking free on a success. Other characters who are not buried can {@action Aid} on this check.',
				],
				name: 'Falling Stones',
			},
		],
	},
	{
		name: 'Caustic Dart Trap',
		source: 'EC3',
		page: 29,
		level: 11,
		traits: ['complex', 'mechanical', 'trap'],
		stealth: {
			bonus: 20,
			minProf: 'expert',
			notes: 'or DC 30 (expert) to notice the three launching mechanisms built into the wall.',
		},
		description: [
			'Three launching mechanisms built into the mudbrick walls expel darts containing acidic chemicals.',
			'All three launching mechanisms must be disabled or destroyed to deactivate the trap.',
		],
		disable: {
			entries: [
				'DC 32 {@skill Thievery} (master) to sufficiently jam the tubes to make the trap unable to attack creatures in a single 5-foot square in the room, or DC 34 {@skill Crafting} (master) to alter one of the three launching mechanisms.',
			],
		},
		defenses: {
			ac: {
				std: 31,
			},
			savingThrows: {
				fort: {
					std: 24,
				},
				ref: {
					std: 15,
				},
			},
			hardness: {
				std: 20,
			},
			hp: {
				std: 80,
				notes: {
					std: 'per launching mechanism',
				},
			},
			bt: {
				std: 40,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['attack'],
				trigger: 'A creature reaches the midpoint of the hall',
				entries: [
					'The trap makes an acid dart against three different random creatures in the hall. The trap then rolls initiative.',
				],
				name: 'Dart Barrage',
			},
		],
		routine: [
			'{@as 3} The trap uses each action for a caustic dart {@action Strike}. The trap loses 1 action for each launching mechanism that is {@condition broken} or destroyed.',
			{
				type: 'attack',
				range: 'Ranged',
				name: 'caustic dart',
				attack: 28,
				damage: '{@damage 2d4+5} piercing and {@damage 4d4+8} acid',
				types: ['acid', 'piercing'],
				noMAP: true,
			},
		],
		reset: ['The trap deactivates and resets 1 minute after no creatures are in area C7.'],
	},
	{
		name: 'Caustic Vapor',
		source: 'AoA5',
		page: 57,
		level: 17,
		traits: ['mechanical', 'trap'],
		stealth: {
			dc: 40,
			minProf: 'master',
		},
		description: ['The door slams shut, and poison gas fills the room.'],
		disable: {
			entries: [
				'{@skill Occultism} DC 36 (master) or {@skill Religion} DC 36 (master) to exorcise the spirits',
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['conjuration', 'occult'],
				trigger:
					'A living creature other than an ooze spends at least 3 rounds in the room',
				entries: [
					'The trap activates and fills the area with caustic nightmare vapor, exposing all creatures within.',
				],
				name: 'Breath Snatcher',
			},
			{
				type: 'affliction',
				name: 'Caustic Nightmare Vapor',
				traits: ['acid', 'poison'],
				note: 'Oozes are immune to this poison',
				DC: 38,
				savingThrow: 'Fortitude',
				onset: '1 round',
				maxDuration: '6 rounds',
				stages: [
					{
						stage: 1,
						entry: '{@damage 4d6} acid damage and {@condition confused}',
						duration: '1 round',
					},
					{
						stage: 2,
						entry: '{@damage 6d6} acid damage, {@condition confused}, and {@condition flat-footed}',
						duration: '1 round',
					},
					{
						stage: 3,
						entry: '{@damage 8d6} acid damage, {@condition confused}, {@condition flat-footed}, and {@condition stupefied|CRB|stupefied 2}',
						duration: '1 round',
					},
				],
			},
		],
		reset: ['The trap resets after 1 day.'],
	},
	{
		name: 'Centipede Carcasses Trap',
		source: 'SoT1',
		page: 50,
		level: 5,
		traits: ['complex', 'mechanical', 'trap'],
		stealth: {
			bonus: 11,
			minProf: 'trained',
		},
		description: [
			'Three giant centipede carcasses have wire springs that pull out and fling their sharpened legs around the room.',
		],
		disable: {
			entries: [
				"DC 23 {@skill Nature} (trained) to bend the centipede carapace so the wire can't pull out any more legs, or DC 21 {@skill Thievery} (expert) to cut the springy wires. After all three carcasses are disabled (regardless of the check used), the trap is deactivated. The trap automatically deactivates after 10 rounds.",
			],
		},
		defenses: {
			ac: {
				std: 22,
			},
			savingThrows: {
				fort: {
					std: 15,
				},
				ref: {
					std: 9,
				},
			},
			hardness: {
				Carcass: 12,
			},
			hp: {
				Carcass: 20,
			},
			bt: {
				Carcass: 10,
			},
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A carcass is touched or jostled',
				entries: [
					'Each creature within 30 feet of any centipede carcass takes {@damage 4d4} piercing damage (DC 22 basic Reflex save), and the area becomes {@quickref difficult terrain||3|terrain} due to the many sharpened legs on the ground. Each creature that {@action Stride||Strides} more than 10 feet through the area must succeed at a DC 20 {@skill Acrobatics} check or take {@damage 1d4} piercing damage. The trap then rolls initiative.',
				],
				name: 'Volley of Legs',
			},
		],
		routine: [
			"(1 action) Each creature within 30 feet of a centipede carcass that hasn't been disabled takes {@damage 6d4} piercing damage (DC 22 basic Reflex save).",
		],
	},
	{
		name: 'Clockwork Arms',
		source: 'AoE5',
		page: 56,
		level: 15,
		traits: ['complex', 'mechanical', 'trap'],
		stealth: {
			bonus: 30,
			minProf: 'expert',
		},
		description: [
			'Four claw-tipped clockwork arms suspended from the ceiling pick up and deposit creatures into a nearby hatch.',
		],
		disable: {
			entries: [
				'DC 43 {@skill Thievery} (master) to jam and deactivate one of the arms or DC 46 {@skill Athletics} (legendary) to tear an arm off the machine.',
			],
		},
		defenses: {
			ac: {
				std: 37,
			},
			savingThrows: {
				fort: {
					std: 23,
				},
				ref: {
					std: 26,
				},
			},
			hardness: {
				Arm: 15,
			},
			hp: {
				Arm: 50,
				notes: {
					Arm: 'to destroy one arm',
				},
			},
			bt: {
				Arm: 25,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'The Rumormonger or the',
				entries: ['Inkmaster enters the room; The trap rolls initiative.'],
				name: 'Arm Activation',
			},
		],
		routine: [
			'(4 actions) The trap loses 1 action per arm destroyed or disabled. On its turn, the trap makes claw {@action Strike||Strikes} against creatures other than the Rumormonger or the.',
			{
				entries: [
					'If an arm already has a creature {@condition grabbed}, the trap spends 2 actions to use its Open Hatch ability.',
				],
				type: 'ability',
				name: 'Inkmaster.',
			},
			{
				type: 'attack',
				range: 'Melee',
				name: 'claw',
				attack: 28,
				traits: ['reach <20 feet>'],
				effects: ['Grab'],
				damage: '{@damage 3d10+15} slashing plus Grab',
				types: ['slashing'],
				noMAP: true,
			},
			{
				activity: {
					number: 2,
					unit: 'action',
				},
				entries: [
					'The metal hatch opens and the arms deposit a {@condition grabbed} Medium or smaller creature into the hole. The creature becomes caught in the gears (see Caught in Gears on page 54) for 1 round before emerging in area K5.',
				],
				type: 'ability',
				name: 'Open Hatch',
			},
		],
		reset: ['Rewinding the gears for {@dice 1d4} minutes resets the trap.'],
	},
	{
		name: 'Clockwork Poison Bomb',
		source: 'AoE3',
		page: 58,
		level: 11,
		traits: ['alchemical', 'complex', 'mechanical', 'trap'],
		stealth: {
			notes: "The bomb uses Oggvurm's initiative roll as its {@skill Stealth} roll.",
		},
		description: [
			'A clockwork bomb releases gouts of poisonous smoke. The smoke issues forth from a single nozzle attached to two tanks of pressurized poison.',
		],
		disable: {
			entries: [
				'three DC 31 {@skill Thievery} (expert) checks to a Device to disable the latches that lock the nozzle in place, then one DC 35 {@skill Thievery} (master) check to a Device to turn off the nozzle; DCs decrease by 2 if Oggvurm is {@condition immobilized}, {@condition paralyzed}, {@condition unconscious}, or dead.',
			],
		},
		defenses: {
			ac: {
				std: 32,
			},
			savingThrows: {
				fort: {
					std: 24,
				},
				ref: {
					std: 26,
				},
			},
			hardness: {
				Nozzle: 5,
				Tank: 15,
			},
			hp: {
				Nozzle: 20,
				Tank: 80,
				notes: {
					Nozzle: 'to ruin the nozzle (making it impossible to disable, in which case the only way to disarm the bomb is to destroy both its tanks)',
					Tank: 'to destroy one of the tanks (both tanks must be destroyed to disarm the bomb)',
				},
			},
			bt: {
				Nozzle: 10,
				Tank: 40,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['alchemical', 'poison'],
				trigger: 'The bomb is Activated, which requires 3 actions',
				entries: [
					'The bomb releases a smoky cloud of blackfinger blight in a 20-foot radius. Creatures within the smoke are {@condition concealed} from other creatures. Any creature that starts its turn in the smoke must roll a saving throw to avoid being afflicted by blackfinger blight poison (see page 78). The cloud remains for 1 minute or until dispersed by strong winds.',
				],
				name: 'Poisonous Cloud',
			},
		],
		routine: [
			'(1 action) On its turn, the bomb spews forth a smoky gout of airborne blackfinger blight poison. The cloud fills a 20-foot radius, or a 10-foot radius if only one tank remains intact. If the bomb is already in the center of a blackfinger blight cloud, the radius of that cloud increases by 20 feet (or 10 feet, if only one tank remains intact) instead.',
		],
		reset: [
			'The trap issues smoke for 3 minutes before its tanks run dry. The tanks must be replaced before the bomb can be reactivated.',
		],
	},
	{
		name: 'Collapsing Porch',
		source: 'TiO',
		page: 14,
		level: 1,
		traits: ['mechanical', 'trap'],
		stealth: {
			dc: 19,
			notes: '{@skill Perception} check (or 0 after the hazard is triggered)',
		},
		description: [
			'A section of splintery and rotten floorboards drop a creature 6 feet onto uneven rocks and piercing shards of wood.',
		],
		disable: {
			entries: [
				'DC 15 {@skill Crafting} (trained) to replace or cover the weak sections of flooring, or DC 15 {@skill Survival} (trained) to crumble the rotten floorboards from a safe distance',
			],
		},
		defenses: {
			ac: {
				std: 10,
			},
			savingThrows: {
				fort: {
					std: 1,
				},
				ref: {
					std: 1,
				},
			},
			hardness: {
				Floorboard: 3,
			},
			hp: {
				Floorboard: 12,
			},
			bt: {
				Floorboard: 6,
			},
			immunities: ['critical hits', 'sneak attack'],
		},
		actions: [
			{
				name: 'Collapse',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				entries: [
					'If a creature walks on the area marked on the map, it falls through the weakened floorboards onto uneven rocks and sharp shards of wood, taking {@damage 1d4} piercing damage and {@damage 1d6} bludgeoning damage. The creature can use the {@action Grab an Edge} reaction to avoid the fall and the damage.',
				],
				generic: {
					tag: 'ability',
				},
			},
		],
		reset: [
			'Once this section of the porch has collapsed, creatures can still fall through the hole until the porch is {@action Repair||Repaired}.',
		],
	},
	{
		name: 'Collapsing Structure',
		source: 'FRP2',
		page: 88,
		level: 15,
		traits: ['complex', 'environmental'],
		stealth: {
			bonus: 20,
			minProf: 'master',
			notes: 'to notice cracks forming in the walls of the structure as Mogaru approaches.',
		},
		description: [
			"Mogaru brushes against a structure, severely compromising the building's stability and possibly causing it to collapse.",
		],
		disable: {
			entries: [
				"DC 43 {@skill Athletics} (master), {@skill Crafting} (master), or Engineering Lore (master) to brace the structure to reduce the risk of collapse until the end of the creature's next turn. The DC of the flat check for this round (see Routine) is increased by 4 on a success, or by 8 on a critical success. Increasing the flat check DC to 21 or higher stabilizes the structure, ending this hazard.",
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'Mogaru applies any amount of force to the structure',
				entries: [
					'The building trembles. The floors of the building and the streets within 30 feet of the building become {@quickref difficult terrain||3|terrain}; creatures on this {@quickref difficult terrain||3|terrain} take a \u20132 circumstance penalty to attack rolls, AC, and skill checks. The hazard rolls initiative.',
				],
				name: 'Shake Apart',
			},
		],
		routine: [
			'(1 action) The GM rolls a DC {@flatDC 9} flat check to determine if the building collapses, increasing the DC as listed above. On a successful check, dust and debris fall within the building and 30 feet around it, providing concealment and dealing {@damage 6d6} bludgeoning damage to {@dice 1d4} randomly chosen targets (DC 35 basic Reflex save; on a critically failed save, the creature is knocked {@condition prone}). On a critical success, the effect is the same, but the debris deals {@damage 12d6} bludgeoning damage to {@dice 2d4} randomly chosen targets instead (DC 35 basic Reflex save; on a critically failed Reflex save, the creature is {@condition restrained} by rubble until freed [{@action Force Open} DC 38, {@action Escape} DC 35]).',
		],
		reset: [
			'The building becomes susceptible to Shake Apart again {@dice 1d6} rounds after it is stabilized.',
		],
	},
	{
		name: 'Convergence Lattice',
		source: 'EC6',
		page: 15,
		level: 20,
		traits: ['unique', 'complex', 'magical', 'trap'],
		stealth: {
			bonus: 34,
			minProf: 'master',
			notes: 'to realize the lattice is a complex clockwork before it begins to move; noticing the lattice itself is DC 0.',
		},
		description: [
			"A complex clockwork of bright metal and delicately carved gemstones, the lattice's interlocking gears begin to whir as golden runes glow across its surface.",
		],
		disable: {
			entries: [
				"DC 40 {@skill Thievery} (master) or DC 35 {@skill Religion} (master) four times to obliterate each of the four key runes. A DC 45 {@skill Thievery} (legendary) check (or breaking the lattice) stops the clockwork's movement and prevents it from resetting, but doesn't stop its current activation.",
			],
		},
		defenses: {
			ac: {
				std: 45,
			},
			savingThrows: {
				fort: {
					std: 33,
				},
				ref: {
					std: 28,
				},
			},
			hardness: {
				std: 30,
			},
			hp: {
				std: 460,
			},
			bt: {
				std: 230,
			},
			immunities: ['object immunities (except mental effects)'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger:
					'A creature that is not {@condition controlled} by the convergence lattice sees it',
				entries: ["The lattice's clockworks begin to move and it rolls for initiative."],
				name: 'Begin Convergence',
			},
		],
		routine: [
			'(3 actions) The convergence lattice uses its first action to call for aid. Each convergent creature within 100 feet of the lattice {@action Stride||Strides} toward the lattice as a reaction.',
			"Creatures thus called continue to move toward the lattice on their turn each round until they are adjacent to it, at which point they defend it with their lives. The lattice uses its second action to deal {@damage 16d6} mental damage (DC 42 basic Will save) to a non-convergent creature within 100 feet. This damage is nonlethal; a creature knocked out by this damage doesn't gain the {@condition dying} condition and is automatically {@condition controlled} by the convergence lattice when they awaken. The lattice uses its third action to make the same attack against a second non-convergent creature within 100 feet; if there isn't such a second creature, it doesn't take its third action.",
		],
		reset: [
			'The convergence lattice deactivates and resets after there are no uncontrolled targets within line of sight for 1 minute.',
		],
	},
	{
		name: 'Crushing Gate Trap',
		source: 'EC5',
		page: 14,
		level: 16,
		traits: ['trap'],
		stealth: {
			dc: 42,
			minProf: 'master',
			notes: 'to spot the triggering rod beneath the black sand.',
		},
		description: [
			'A {@condition hidden} stone rod causes two immense stone doors to fall forward from their gate, crushing anything beneath them. The doors also fall forward if touched.',
		],
		disable: {
			entries: [
				'{@skill Thievery} DC 42 (expert) to secure the doors in place without triggering the trap.',
			],
		},
		defenses: {
			ac: {
				std: 40,
			},
			savingThrows: {
				fort: {
					std: 32,
				},
				ref: {
					std: 25,
				},
			},
			hardness: {
				std: 26,
			},
			hp: {
				std: 104,
			},
			bt: {
				std: 52,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['attack'],
				trigger: 'The stone rod is moved or either door is touched',
				entries: [
					"The two falling doors deal {@damage 6d12+35} bludgeoning damage (DC 37 basic Reflex save) to all creatures within 15 feet of the gate. On a failure, a creature is also pinned beneath the door and {@condition immobilized} until the door is moved (DC 34 {@skill Athletics}) or destroyed; each door has the same AC, Fortitude save, Hardness, and Hit Points as the trap itself. On a critical failure, the creature is trapped in such a way that it can't attempt to free itself. Moving or destroying one door doesn't help free anyone trapped by the other door.",
				],
				name: 'Gate Collapse',
			},
		],
	},
	{
		name: 'Daemonic Fog',
		source: 'AV3',
		page: 38,
		level: 10,
		traits: ['environmental', 'magical'],
		stealth: {
			dc: 30,
			minProf: 'expert',
		},
		description: [
			'The fog solidifies into tiny, gnawing creatures that devour everyone within before fading back into mist.',
		],
		disable: {
			entries: [
				'DC 28 {@skill Survival} (expert) to disrupt the fog before the hazard triggers or dispel magic (5th level; counteract DC 26) to counteract the magic.',
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['divine', 'evocation'],
				trigger: "A creature crosses the cavern's midpoint (the dotted line on the map)",
				entries: [
					'The hazard deals {@damage 9d6} piercing damage (DC 32 basic Reflex save) to the triggering creature and all other non-fiend creatures within 20 feet. A creature that critically fails the saving throw is {@condition confused} for {@dice 1d4} rounds.',
				],
				name: 'Gnawing Fog',
			},
		],
		reset: [
			'The hazard resets over the course of an hour as the daemonic stain reenergizes the fog.',
		],
	},
	{
		name: "Dahak's Shell",
		source: 'AoA2',
		page: 55,
		level: 12,
		traits: ['unique', 'magical', 'trap'],
		stealth: {
			bonus: 0,
			notes: 'or {@spell detect magic}',
		},
		description: [
			'A ring of eight {@hazard dragon pillar|AoA2} replicas mark the border of a dome of magical prismatic energy that entirely contains the Fortress of Sorrow.',
		],
		disable: {
			entries: [
				"Each {@hazard dragon pillar|AoA2} that is destroyed removes the corresponding color's effect from {@deity Dahak|LOGM}'s shell; as long as even one color remains active, the pillars marking the shell's border cannot be damaged themselves, but a successful DC 32 {@skill Thievery} (master) check or a successful {@spell dispel magic} (6th level; counteract DC 30) against one of the eight pillars can cause a randomly determined active color in the shell defense (below) to become deactivated for {@dice 1d4} rounds.",
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['abjuration', 'divine', 'light'],
				trigger:
					'a creature attempts and fails to disable one of the shell colors via {@skill Thievery} or {@spell dispel magic}',
				entries: [
					"{@deity Dahak|LOGM}'s shell {@action Strike||Strikes} the triggering creature with a random eye beam. Roll {@dice 1d8} to determine the color (1\u2013red, 2\u2013orange, 3\u2013yellow, 4\u2013green, 5\u2013blue, 6\u2013indigo, 7\u2013violet, 8\u2013black).",
				],
				name: 'Prismatic Beam',
			},
			{
				traits: ['abjuration', 'divine', 'light'],
				entries: [
					'When a creature physically passes through the shell, the creature is affected simultaneously by all colors of energy currently active in the shell; apply these effects in the following order: red, orange, yellow, green, blue, indigo, violet, black. These effects are the same as that of the eye beams described in {@hazard dragon pillar|AoA2}, but with a save DC of 32. Each effect requires its own save.',
				],
				name: 'Shell Defense',
			},
		],
		attacks: [
			{
				range: 'Ranged',
				name: 'eye beam',
				attack: 20,
				traits: ['range <120 feet>'],
				effects: [
					"The target suffers an effect corresponding to the eye beam's color, as described in {@hazard dragon pillar|AoA2}, but with a save DC of 32. On a critical hit, the target's save result is one degree worse.",
				],
			},
		],
	},
	{
		name: "Dahak's Skull",
		source: 'AoA2',
		page: 61,
		level: 6,
		traits: ['unique', 'complex', 'fire', 'magical', 'trap'],
		perception: {
			bonus: 16,
			notes: '{@ability darkvision}, {@spell see invisibility}',
		},
		stealth: {
			bonus: 0,
			notes: "but DC 24 to notice that the fiery lights within the skull's eye sockets seem to be looking around the room.",
		},
		description: [
			"A pair of magical gems inside the dragon skull's eye sockets act as magical sensors with a 30-foot radius.",
		],
		disable: {
			entries: [
				"{@skill Thievery} DC 27 (expert) two times to pry the gems embedded deep in the skull's eye sockets without triggering the sensor, or {@spell dispel magic} (4th level, counteract DC 22) twice to dispel both eyes.",
			],
		},
		defenses: {
			ac: {
				std: 24,
			},
			savingThrows: {
				fort: {
					std: 17,
				},
				ref: {
					std: 8,
				},
			},
			hardness: {
				std: 14,
			},
			hp: {
				std: 56,
			},
			bt: {
				std: 28,
			},
			immunities: ['critical hits', 'fire', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['divine', 'evocation', 'fire'],
				trigger:
					'A living creature that is not a member of the Cinderclaws enters area {@b C9}',
				entries: [
					"One of the dragon skull's eye sockets shoots an eye beam at the triggering creature, then the hazard rolls initiative.",
				],
				name: "Dahak's Glance",
			},
		],
		routine: [
			"(2 actions) On its initiative, {@deity Dahak|LOGM}'s skull fires up to two eye beams; it must target a different creature with each attack. The eye beams can't target creatures directly below the skull.",
			{
				type: 'attack',
				range: 'Ranged',
				name: 'eye beam',
				attack: 20,
				traits: ['divine', 'evocation', 'fire', 'range <150 feet>'],
				damage: '{@damage 8d6} fire',
				types: ['fire'],
			},
		],
	},
	{
		name: "Damurdiel's Vengeance",
		source: 'AoA6',
		page: 18,
		level: 19,
		traits: ['complex', 'haunt'],
		stealth: {
			bonus: 37,
			minProf: 'legendary',
			notes: 'or DC 47 to notice the dagger left in the pool start to move on its own',
		},
		description: [
			'An elven woman wearing a robe stands in the water. She beckons anyone who enters the room to join her in the pool.',
		],
		disable: {
			entries: [
				"{@skill Deception} 45 (legendary) to pretend to be Erveniss and ask for forgiveness, {@skill Diplomacy} 45 (legendary) to convince Damurdiel to stand down (elves who are masters in {@skill Diplomacy} can attempt the check as if they were legendary instead), or {@skill Religion} 40 (legendary) to call upon {@deity Calistria} to calm Damurdiel's spirit.",
			],
		},
		defenses: {
			ac: {
				std: 43,
			},
			savingThrows: {
				fort: {
					std: 26,
				},
				ref: {
					std: 26,
				},
				will: {
					std: 35,
				},
			},
			hp: {
				std: 128,
				notes: {
					std: 'dagger',
				},
			},
			bt: {
				std: 64,
			},
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['attack'],
				trigger: "A creature approaches within 5 feet of the pool's edge",
				entries: [
					'The ghostly elf causes a dagger to rise out of the waters and then fling toward the triggering creature. If the attack is a hit, it is a critical hit instead. The haunt then rolls initiative.',
				],
				name: 'Surprise Strike',
			},
		],
		routine: [
			'(3 actions) The haunt attempts to {@action Strike} with the dagger.',
			{
				type: 'attack',
				range: 'Ranged',
				traits: ['agile', 'thrown <10 feet>', 'versatile <S>'],
				name: 'dagger',
				attack: 40,
				damage: '{@damage 4d4+10} piercing plus 20 negative',
				types: ['negative', 'piercing'],
			},
		],
		reset: [
			"Damurdiel's spirit subsides once she is destroyed or if she manages to reduce a creature to 0 Hit Points. She returns after 1 minute.",
		],
	},
	{
		name: 'Darkside Mirror',
		source: 'CRB',
		page: 528,
		level: 14,
		traits: ['complex', 'magical', 'mechanical', 'trap'],
		stealth: {
			bonus: 24,
			minProf: 'master',
			notes: "to notice it isn't a regular mirror.",
		},
		description: [
			'A magic mirror replaces characters with evil mirror duplicates from another dimension.',
		],
		disable: {
			entries: [
				'{@skill Thievery} DC 34 (legendary) to retrieve a creature from the other dimension within 10 minutes of the switch (possible only if their mirror duplicate is dead), {@skill Thievery} DC 39 (master) to permanently disable the mirror once all mirror duplicates are dead, or dispel magic (7th level; counteract DC 32) to counteract the mirror for 1 minute and prevent additional replacements during that time.',
			],
		},
		defenses: {
			ac: {
				std: 34,
			},
			savingThrows: {
				fort: {
					std: 25,
				},
				ref: {
					std: 20,
				},
			},
			hardness: {
				std: 1,
			},
			hp: {
				std: 4,
				notes: {
					std: " the mirror can't be damaged while any mirror duplicate is alive",
				},
			},
			bt: {
				std: 2,
			},
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['arcane', 'conjuration', 'teleportation'],
				trigger: 'A non-evil creature is reflected in the mirror.',
				entries: [
					'The mirror absorbs the creature into the mirror, replacing it with an evil mirror duplicate (DC 34 Reflex to avoid being absorbed into the mirror), and rolls initiative.',
				],
				name: 'Reflection of Evil',
			},
		],
		routine: [
			'(1 action) The mirror absorbs another reflected creature into the mirror and replaces it with a mirror duplicate. Mirror duplicates attack on their own initiative, using the same statistics as the original creature, but with an evil alignment (changing only abilities that shift with the alignment change). A mirror duplicate can spend 3 actions in contact with the mirror to return to its original dimension and release the creature it duplicated, but most mirror duplicates prefer not to.',
		],
		reset: [
			"The mirror is always ready to absorb creatures into the other dimension. Ten minutes after a creature is sucked into the mirror, if an ally doesn't rescue the creature with {@skill Thievery}, it reaches the other dimension, where it might be captured or killed. In the mirror dimension, it counts as a mirror duplicate, so the denizens of the other dimension can't destroy the mirror on their side while the absorbed creature is there.",
			"These dimensions are alternate realities, not planes, so even rituals like plane shift can't reach them.",
		],
	},
	{
		name: 'Dart Barrage',
		source: 'AoE1',
		page: 24,
		level: 3,
		traits: ['complex', 'mechanical', 'trap'],
		stealth: {
			bonus: 11,
			minProf: 'trained',
			notes: 'or DC 23 (trained) to notice scratches around the musical pipes and a slight give to the seal.',
		},
		description: [
			"Four dart-loaded pipes {@condition hidden} in the diagonal walls are connected to a pressure plate under the brass seal in the room's center.",
		],
		disable: {
			entries: [
				'{@skill Thievery} DC 22 (trained) to disable the pressure plate, or four {@skill Thievery} DC 18 (trained) checks to plug the dart launchers.',
			],
		},
		defenses: {
			ac: {
				std: 22,
			},
			savingThrows: {
				fort: {
					std: 13,
				},
				ref: {
					std: 7,
				},
			},
			hardness: {
				std: 10,
			},
			hp: {
				std: 60,
				notes: {
					std: 'to destroy the seal and disable the trap',
				},
			},
			bt: {
				std: 30,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'More than two Small or larger creatures step on the brass seal.',
				entries: [
					'The trap makes up to four dart {@action Strike||Strikes} against creatures standing on the seal, then rolls initiative.',
				],
				name: 'Dart Volley',
			},
		],
		routine: [
			"(4 actions) The trap loses 1 action for each disabled launcher. On each of the trap's actions, it fires one dart at a creature in the center of the room.",
			{
				type: 'attack',
				range: 'Ranged',
				name: 'dart',
				attack: 12,
				effects: ['no multiple attack penalty'],
				damage: '{@damage 3d6} piercing, no multiple attack penalty',
				types: ['piercing'],
				noMAP: true,
			},
		],
		reset: [
			'The trap runs out of darts after 4 rounds of firing and must be reset manually by dismantling the walls to reload the launchers. If at any point there are no longer more than two creatures placing weight on the floor, the trap ceases firing but remains armed, ready to resume firing its remaining darts once triggered again.',
		],
	},
	{
		name: 'Dimensional Darkside Mirror',
		source: 'FRP3',
		page: 44,
		level: 19,
		traits: ['complex', 'magical', 'mechanical', 'trap'],
		stealth: {
			bonus: 37,
			minProf: 'master',
			notes: "to notice it isn't a regular mirror.",
		},
		description: [
			'A magic mirror replaces characters with evil mirror duplicates from another dimension.',
		],
		disable: {
			entries: [
				'{@skill Thievery} DC 40 (legendary) to retrieve a creature from the other dimension within 10 minutes of the switch (possible only if their mirror duplicate is dead), {@skill Thievery} DC 45 (master) to permanently disable the mirror once all mirror duplicates are dead, or dispel magic (8th level; counteract DC 37) to counteract the mirror for 1 minute and prevent additional replacements during that time.',
			],
		},
		defenses: {
			savingThrows: {
				fort: {
					std: 25,
				},
				ref: {
					std: 20,
				},
			},
			hardness: {
				std: 1,
			},
			hp: {
				std: 4,
				notes: {
					std: " the mirror can't be damaged while any mirror duplicate is alive",
				},
			},
			bt: {
				std: 2,
			},
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['arcane', 'conjuration', 'teleportation'],
				trigger: 'A non-evil creature is reflected in the mirror',
				entries: [
					'The mirror absorbs the creature into the mirror, replacing it with an evil mirror duplicate (DC 41 Reflex to avoid being absorbed into the mirror), and rolls initiative.',
				],
				name: 'Reflection of Evil',
			},
		],
		routine: [
			'(1 action) The mirror absorbs another reflected creature into the mirror and replaces it with a mirror duplicate. Mirror duplicates attack on their own initiative, using the same statistics as the original creature, but with an evil alignment (changing only abilities that shift with the alignment change). A mirror duplicate can spend 3 actions in contact with the mirror to return to its original dimension and release the creature it duplicated, but most mirror duplicates prefer not to.',
		],
		reset: [
			"The mirror is always ready to absorb creatures into the other dimension. Ten minutes after a creature is sucked into the mirror, if an ally doesn't rescue the creature with {@skill Thievery}, it reaches the other dimension, where it might be captured or killed. In the mirror dimension, it counts as a mirror duplicate, so the denizens of the other dimension can't destroy the mirror on their side while the absorbed creature is there. These dimensions are alternate realities, not planes, so even rituals like plane shift can't reach them.",
		],
	},
	{
		name: 'Doom Of Tomorrow',
		source: 'AV1',
		page: 31,
		level: 3,
		traits: ['magical', 'trap'],
		stealth: {
			dc: 20,
			minProf: 'expert',
		},
		description: [
			'The sounds of devastation rise from the diorama, and a beam of shimmering energy lances outward from the tiny model of Gauntlight.',
		],
		disable: {
			entries: [
				'DC 20 {@skill Thievery} (trained) to quickly deactivate the model of Gauntlight before it triggers, or DC 23 {@skill Stealth} (trained) to creep by a trap without triggering it.',
			],
		},
		defenses: {
			ac: {
				std: 21,
			},
			savingThrows: {
				fort: {
					std: 15,
				},
				ref: {
					std: 8,
				},
			},
			hardness: {
				std: 8,
			},
			hp: {
				std: 56,
			},
			bt: {
				std: 28,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature steps within 10 feet of the back of a diorama alcove',
				entries: ['The trap fires an apocalypse beam at that creature.'],
				name: 'Apocalypse Beam',
			},
		],
		reset: ['Each trap resets automatically after 1 hour.'],
		attacks: [
			{
				range: 'Ranged',
				name: 'apocalypse beam',
				attack: 16,
				effects: [
					'fire damage from the burning city [a]',
					'bludgeoning damage from the tsunami [b]',
					'sonic damage from the earthquake [c]',
					'mental damage from the monster [d]',
					'negative damage from the undead uprising [e])',
				],
				damage: '{@dice 2d10+13} damage (fire damage from the burning city [a], bludgeoning damage from the tsunami [b], sonic damage from the earthquake [c], mental damage from the monster [d], and negative damage from the undead uprising [e])',
				types: ['fire', 'bludgeoning', 'sonic', 'mental', 'negative'],
				noMAP: true,
			},
		],
	},
	{
		name: 'Dragon Pillar',
		source: 'AoA2',
		page: 28,
		alias: [
			'Black Dragon Pillar',
			'Green Dragon Pillar',
			'Indigo Dragon Pillar',
			'Yellow Dragon Pillar',
			'Orange Dragon Pillar',
			'Red Dragon Pillar',
			'Violet Dragon Pillar',
		],
		level: 6,
		traits: ['rare', 'complex', 'magical', 'trap'],
		stealth: {
			bonus: 0,
			notes: 'or {@spell detect magic}',
		},
		description: [
			"A 10-foot-tall wooden pole topped by a wooden carving of {@deity Dahak|LOGM}'s head. Each dragon pillar's head has been treated with something to give it a distinct color, as indicated in the specific encounter, but regardless of color, plumes of smoke waft up from the mouth.",
		],
		disable: {
			entries: [
				"{@skill Athletics} DC 26 (expert) to push the pillar over, or {@skill Thievery} DC 26 (expert) on the pillar to erase the magic runes that power it, or {@spell dispel magic} (4th level; counteract DC 22) to dispel the pillar's magic.",
			],
		},
		defenses: {
			ac: {
				std: 24,
			},
			savingThrows: {
				fort: {
					std: 17,
				},
				ref: {
					std: 8,
				},
			},
			hardness: {
				std: 14,
			},
			hp: {
				std: 56,
			},
			bt: {
				std: 28,
			},
			immunities: ['critical hits', 'fire', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger:
					"The dragon pillar sees a creature within 120 feet who isn't a recognized Cinderclaw or Cinderclaw ally.",
				entries: [
					'The dragon pillar makes an eye beam {@action Strike} against the triggering creature, then rolls initiative.',
				],
				name: 'Dragon Pillar Glance',
			},
		],
		routine: [
			'(1 action) On its initiative, the dragon pillar fires an eye beam at the closest target within 120 feet.',
			{
				type: 'attack',
				range: 'Ranged',
				name: 'eye beam',
				attack: 20,
				traits: ['divine', 'evocation', 'range <120 feet>'],
				effects: [
					"The target is subjected to an effect determined by the pillar's color and summarized below. On a critical hit, the target's save result is one degree worse.",
					{
						type: 'list',
						items: [
							{
								type: 'item',
								name: 'Black Eye Beam (area A5)',
								entries: [
									'({@trait incapacitation}) DC 24 Fortitude save.',
									{
										type: 'successDegree',
										entries: {
											'Critical Success': 'The target is unaffected.',
											Success:
												'The target is {@condition blinded} for 1 round.',
											Failure:
												'The target is {@condition blinded} for 1 hour.',
											'Critical Failure':
												'The target is {@condition blinded} for 24 hours.',
										},
									},
								],
							},
							{
								type: 'item',
								name: 'Blue Eye Beam (area A7)',
								entries: [
									'({@trait incapacitation}) DC 24 Fortitude save.',
									{
										type: 'successDegree',
										entries: {
											'Critical Success': 'The target is unaffected.',
											Success:
												'The target is {@condition petrified} for 1 round.',
											Failure:
												'The target is {@condition petrified} for 1 hour.',
											'Critical Failure':
												'The target is {@condition petrified} permanently.',
										},
									},
								],
							},
							{
								type: 'item',
								name: 'Green Eye Beam (area A8)',
								entries: [
									'({@trait poison}) {@damage 6d6} poison damage (DC 24 basic Reflex save).',
								],
							},
							{
								type: 'item',
								name: 'Indigo Eye Beam (area A9)',
								entries: [
									'({@trait incapacitation}) DC 24 Will save.',
									{
										type: 'successDegree',
										entries: {
											'Critical Success': 'The target is unaffected.',
											Success:
												'The target is {@condition slowed} for 1 round.',
											Failure:
												'The target is {@condition confused} for 1 hour.',
											'Critical Failure':
												'The target is controlled by the dragon pillar and remains within 60 feet of it at all times, defending the dragon pillar from all non-Cinderclaws. While a target is controlled, it is treated as a Cinderclaw ally by the dragon pillar. The dragon pillar can control up to 3 targets at a time; any targets in excess who critically fail this saving throw are instead confused for {@dice 1d4+1} rounds. A controlled creature can attempt a new Will save once every 24 hours to escape control, but doing so automatically causes the dragon pillar to attack it with a new eye beam to attempt to re-establish control. The control ends if the pillar is destroyed.',
										},
									},
								],
							},
							{
								type: 'item',
								name: 'Yellow Eye Beam (area A12)',
								entries: [
									'({@trait electricity}) {@damage 6d6} electricity damage (DC 24 basic Reflex save).',
								],
							},
							{
								type: 'item',
								name: 'Orange Eye Beam (area A15)',
								entries: [
									'({@trait acid}) {@damage 6d6} acid damage (DC 24 basic Reflex save).',
								],
							},
							{
								type: 'item',
								name: 'Red Eye Beam (area A16)',
								entries: [
									'({@trait fire}) {@damage 6d6} fire damage (DC 24 basic Reflex save).',
								],
							},
							{
								type: 'item',
								name: 'Violet Eye Beam (area A9)',
								entries: [
									'({@trait incapacitation}) DC 24 Will save.',
									{
										type: 'successDegree',
										entries: {
											'Critical Success': 'The target is unaffected.',
											Success: 'The target is {@condition stunned 1}.',
											Failure: 'The target is {@condition stunned 3}.',
											'Critical Failure':
												'The target is {@condition stunned 7}.',
										},
									},
								],
							},
						],
					},
				],
				types: ['electricity', 'fire', 'poison', 'acid'],
			},
		],
		reset: [
			'The dragon pillar deactivates and resets as soon as it perceives no appropriate targets in range.',
		],
		perception: {
			bonus: 16,
			notes: '{@ability darkvision} 60 feet',
		},
		abilities: [
			{
				entries: [
					'A dragon pillar can see through its empty eye sockets, and it can recognize Cinderclaws and their allies. A character disguised as a Cinderclaw can trick a dragon pillar into perceiving it as a Cinderclaw ally by using {@skill Deception} to {@action Impersonate}. A dragon pillar always uses {@skill Perception} for initiative.',
				],
				type: 'ability',
				name: 'Recognize Ally',
			},
		],
	},
	{
		name: 'Dragonstorm',
		source: 'AoA6',
		page: 7,
		level: 18,
		traits: ['rare', 'environmental', 'magical'],
		stealth: {
			bonus: 40,
			minProf: 'legendary',
		},
		description: [
			"A massive storm stirs in the skies above Breachill and Citadel Altaerein. As specific events begin during the three waves of the manifestation's retribution, the dragonstorm wreaks localized havoc.",
		],
		disable: {
			entries: [
				"The dragonstorm can't be disabled\u2014only endured. It ends only once the attack on Breachill and Citadel Altaerein is over.",
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['air'],
				trigger: 'A new wave begins',
				entries: [
					"Roll {@dice 1d10} to determine which effect manifests from the following possibilities. The placement of these effects is guided by {@deity Dahak|LOGM}'s will, and they should manifest in the most detrimental locations possible to the PCs.",
					{
						type: 'ability',
						name: '1\u20132: Acid Rain',
						traits: ['acid'],
						entries: [
							'A torrent of acid drenches creatures in a 20-foot burst. Creatures in the area take {@damage 6d10} acid damage (DC 42 basic Reflex save). Creatures that critically fail also take 5 {@condition persistent damage||persistent acid damage}.',
						],
					},
					{
						type: 'ability',
						name: '3\u20134: Freezing Wind',
						traits: ['cold'],
						entries: [
							'A barrage of freezing wind and hail assaults all creatures in a 20-foot burst. Creatures in the area take {@damage 3d10} cold damage and {@damage 3d10} bludgeoning damage (DC 42 basic Reflex save) Creatures that critically fail are {@condition slowed|CRB|slowed 1} for 1 round.',
						],
					},
					{
						type: 'ability',
						name: '5\u20136: Bolts of Lightning',
						traits: ['electricity'],
						entries: [
							'Several bolts of lightning strike all creatures in a 20-foot burst. Creatures in the area take {@damage 6d10} electricity damage (DC 42 basic Reflex save). Creatures that critically fail their saves become {@condition blinded} and {@condition deafened} for 1 round.',
						],
					},
					{
						type: 'ability',
						name: '7\u20138: Flaming Vortex',
						traits: ['fire'],
						entries: [
							'Gouts of flame fall on all creatures in a 20-foot burst. Creatures in the area take {@damage 6d10} fire damage (DC 42 basic Reflex save). Creatures that critically fail their saves also take 5 {@condition persistent damage||persistent fire damage}.',
						],
					},
					{
						type: 'ability',
						name: '9\u201310: Poison Miasma',
						traits: ['poison'],
						entries: [
							'Poisonous mist rolls forth, covering a 20-foot burst for 1 round. Creatures within the mist become {@condition concealed}, and creatures outside it become {@condition concealed} to creatures within it. Creatures within the mist take {@damage 6d10} poison damage (DC 42 basic Fortitude save). Creatures that critically fail their saves become {@condition enfeebled|CRB|enfeebled 2}.',
						],
					},
				],
				name: 'Localized Dragonstorm',
			},
		],
	},
	{
		name: 'Dream Pollen Pods',
		source: 'EC1',
		page: 12,
		level: 3,
		traits: ['complex', 'environmental', 'trap'],
		stealth: {
			bonus: 12,
			minProf: 'trained',
		},
		description: [
			'Four magical plants inside the wagon release hallucinogenic pollen when disturbed.',
		],
		disable: {
			entries: [
				'{@skill Thievery} DC 18 (trained) to carefully remove a pollen pod or {@skill Nature} DC 18 (trained) to prevent a pod from bursting.',
			],
		},
		defenses: {
			ac: {
				std: 18,
			},
			savingThrows: {
				fort: {
					std: 9,
				},
				ref: {
					std: 3,
				},
			},
			hardness: {
				std: 1,
			},
			hp: {
				std: 32,
			},
			bt: {
				std: 16,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'The wagon door is opened or the pods are disturbed',
				entries: [
					'A pod makes a pollen spray {@action Strike} against an adjacent creature or the creature that opened the door, the door falls off the wagon, and the trap rolls initiative.',
				],
				name: 'Pollen Burst',
			},
		],
		routine: [
			"(4 actions) The trap loses 1 action each turn for each removed or disabled pollen pod. The trap doesn't take a multiple attack penalty.",
			{
				type: 'attack',
				range: 'Ranged',
				name: 'pollen spray',
				attack: 12,
				traits: ['range <20 feet>'],
				effects: ['hallucinogenic pollen'],
				damage: '{@damage 1d8} poison and hallucinogenic pollen',
				types: ['poison'],
				noMAP: true,
			},
			{
				entries: [
					"A creature hit by the trap's pollen spray must succeed at a DC 20 Will save or it is {@condition confused} for 1 round and takes a \u20132 status penalty to {@skill Perception} checks and saves against {@trait mental} effects for {@dice 1d4} hours.",
					'On a critical failure, the penalty is instead \u20134.',
				],
				type: 'ability',
				name: 'Hallucinogenic Pollen',
			},
		],
		reset: [
			"The trap resets after 1 hour, when the pods have regrown additional pollen. If all the pods are removed or disabled, the trap doesn't reset.",
		],
	},
	{
		name: 'Drowning Pit',
		source: 'CRB',
		page: 526,
		level: 3,
		traits: ['complex', 'mechanical', 'trap'],
		stealth: {
			bonus: 10,
			minProf: 'trained',
			notes: 'DC 22 (expert) to notice the water spouts once the pit opens.',
		},
		description: [
			"A trapdoor covers a 10-foot-square pit that's 30 feet deep and has 5 feet of water at the bottom. Four water spouts in the walls connect to {@condition hidden} water tanks. Each water spout extends out of a different wall, 6 inches from the top of the pit.",
		],
		disable: {
			entries: ['{@skill Thievery} DC 18 (trained) to seal each water spout,'],
		},
		actions: [
			{
				entries: [
					'22 (trained) to open the trapdoor, or {@skill Athletics} DC 22 to {@action Force Open} the trapdoor AC 19; Fort +8, Ref +5 Trapdoor Hardness 15, Trapdoor HP 60 (BT 30); Spout Hardness 8, Spout HP 32 (BT 16); Immunities critical hits, object immunities, precision damage.',
				],
				name: 'Thievery DC',
			},
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature walks onto the trapdoor.',
				entries: [
					'The triggering creature falls in and takes damage from the fall, reduced by 5 feet for falling into the water (typically 12 bludgeoning damage). A creature can {@action Grab an Edge} to avoid {@quickref falling||3|falling}. The trapdoor then slams shut, and the hazard rolls initiative.',
				],
				name: 'Pitfall',
			},
		],
		routine: [
			"(4 actions) The trap loses 1 action each turn for each disabled water spout. On each of the trap's actions, a spout pours water, increasing the depth of the water by 5 feet.",
			'Once the pit is full of water, the pit stops using actions, but creatures in the pit begin {@quickref drowning||3|drowning and suffocating}.',
		],
		reset: [
			'The trap can be reset if the door is manually reengaged and the water tanks refilled; it can be reset without draining the pit, but doing so renders it less effective.',
		],
	},
	{
		name: 'Echoes Of Betrayal',
		source: 'AoA4',
		page: 53,
		level: 16,
		traits: ['unique', 'ne', 'complex', 'haunt'],
		stealth: {
			dc: 35,
			minProf: 'master',
			notes: 'to hear the quiet murmurs of angry spirits',
		},
		description: [
			'Malevolent spirits led by a ghostly image of Ludika rise and begin a deadly brawl. These spirits attempt to overwhelm living creatures, forcing them to join the battle.',
		],
		disable: {
			entries: [
				'{@skill Religion} DC 35 (master) three times to exorcise the spirits or {@skill Diplomacy} DC 39 (expert) three times to talk them down.',
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['emotion', 'fear', 'illusion', 'mental', 'occult'],
				trigger: 'At least three creatures enter area {@b H10}.',
				entries: [
					'The haunt takes control of all creatures in the prison, affecting them with {@spell confusion} (8th level, DC 37).',
				],
				name: 'Confuse',
			},
		],
		routine: [
			'(1 action) As 1 action, the haunt causes a barrage of ghostly fists to lash from the walls, floors, and ceiling. The haunt attempts a spectral fist {@action Strike} against each creature in area {@b H10}.',
			{
				type: 'attack',
				range: 'Melee',
				name: 'spectral fist',
				attack: 35,
				traits: ['magical', 'reach <10 feet>'],
				effects: [
					"and the creature must attempt a new DC 37 Will save against confusion if it's not already {@condition confused}.",
				],
				damage: "{@damage 5d10} bludgeoning, and the creature must attempt a new DC 37 Will save against {@spell confusion} if it's not already {@condition confused}.",
				types: ['bludgeoning'],
			},
		],
		reset: [
			'After 24 hours, the haunt returns. The spirits are permanently put to rest only if a lawfully appointed judge from Saggorak (or Kovlar) comes into the prison, takes damage from the haunt, and survives the attack.',
		],
	},
	{
		name: 'Echoes Of Faith',
		source: 'EC2',
		page: 29,
		level: 6,
		traits: ['haunt'],
		stealth: {
			dc: 24,
			minProf: 'expert',
		},
		description: [
			'The restless spirits of clergy who once inhabited this now-defiled temple of Aroden remain within the sanctuary and pulpit.',
		],
		disable: {
			entries: [
				'DC 26 {@skill Occultism} (expert) to exorcise the spirits, or {@skill Deception} or DC 28 {@skill Religion} (trained) to imitate the Arodenite faith and render the haunt harmless until it resets',
			],
		},
		defenses: {
			ac: {
				std: 24,
			},
			hp: {
				std: 60,
			},
			immunities: ['critical hits', 'physical damage'],
			weaknesses: [
				{
					amount: 10,
					name: 'positive',
				},
			],
			savingThrows: {
				fort: {
					std: 13,
				},
				will: {
					std: 15,
				},
			},
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['divine', 'necromancy'],
				trigger: 'A non-Arodenite creature approaches within 5 feet of the lectern',
				entries: [
					'A spectral minister appears before the pulpit, resembling an ever-shifting amalgamation of several past priests. The spectral minister delivers fervent exhortations about faithlessness. Each creature on the dais must succeed at a DC 24 Will save or become {@condition drained|CRB|drained 2}. On a critical failure, the creature is {@condition drained|CRB|drained 4}.',
				],
				name: 'Phantom Sermon',
			},
		],
		reset: [
			'The spirits return in {@dice 1d8} hours as long as any xulgaths remain in Moonstone Hall.',
		],
	},
	{
		name: 'Electric Latch Rune',
		source: 'CRB',
		page: 523,
		level: 3,
		traits: ['electricity', 'evocation', 'magical', 'trap'],
		stealth: {
			dc: 20,
			minProf: 'trained',
		},
		description: [
			'An {@condition invisible} rune imprinted on a door latch releases a powerful electric discharge.',
		],
		disable: {
			entries: [
				'{@skill Thievery} DC 20 (expert) to scratch out the rune without allowing electricity to flow, or dispel magic (2nd level; counteract DC 18) to counteract the rune.',
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['arcane', 'electricity', 'evocation'],
				trigger: 'A creature grasps the door latch directly or with a tool.',
				entries: [
					'The trap deals {@damage 3d12} electricity damage to the triggering creature (DC 22 basic Reflex save).',
				],
				name: 'Electrocution',
			},
		],
	},
	{
		name: 'Electrified Water Ward',
		source: 'SoT2',
		page: 57,
		level: 8,
		traits: ['complex', 'magical', 'trap'],
		stealth: {
			bonus: 18,
			minProf: 'expert',
		},
		description: [
			'Passing over an {@condition invisible} rune on the floor between the north and south doors triggers a dancing burst of electricity.',
		],
		disable: {
			entries: ['DC 26 {@skill Thievery} (expert), DC 28 {@skill Arcana} (expert),'],
		},
		actions: [
			{
				entries: [
					'28 {@skill Occultism} (expert) to harmlessly bleed away the electrical energy from the rune. Once the trap has been activated, the electrical energy is stronger, so three successful checks (of any combination of the relevant skills) are necessary to deactivate it, but these checks can be attempted from anywhere in the room.',
				],
				name: 'or DC',
			},
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['arcane', 'electricity', 'evocation'],
				trigger:
					'A creature passes over the {@condition invisible} underwater rune between the north and south doors',
				entries: [
					'The trap deals {@damage 4d10} electricity damage (DC 26 basic Reflex save) to creatures touching the water, and then rolls initiative.',
				],
				name: 'Electrocution',
			},
		],
		routine: [
			'(1 action) The trap deals {@damage 4d10} electricity damage (DC 26 basic Reflex save) to all creatures in the room.',
			"A creature that fails the save is {@condition slowed|CRB|slowed 1} ({@condition slowed|CRB|slowed 2} on a critical failure). A creature that isn't touching the water treats the result of its saving throw as one degree of success better.",
		],
		reset: [
			'The pulses stop as soon as no creatures are in the hallway, and then reset after 1 hour.',
		],
	},
	{
		name: 'Endless Elven Aging',
		source: 'AoA5',
		page: 7,
		level: 17,
		traits: ['complex', 'haunt', 'magical'],
		stealth: {
			bonus: 33,
			minProf: 'master',
		},
		description: ['A haunted mural fascinates characters and swiftly drains their vitality.'],
		disable: {
			entries: [
				'{@skill Occultism} DC 38 (master) or {@skill Religion} DC 38 (master) to calm the restless energies and suppress the haunt for 1 hour; a critical success deactivates the haunt permanently.',
			],
		},
		defenses: {
			ac: {
				std: 20,
			},
			savingThrows: {
				fort: {
					std: 13,
				},
				ref: {
					std: 5,
				},
			},
			hardness: {
				'Painting ': 15,
			},
			hp: {
				'Painting ': 30,
				notes: {
					'Painting ': 'per square (6 squares must be destroyed to disable the haunt)',
				},
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				name: 'Lifelike Scintillation',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['divination', 'occult'],
				trigger: 'A living creature examines the mural or enters the room',
				entries: ['The haunt activates and rolls initiative.'],
			},
		],
		routine: [
			"(2 actions) The haunt lures creatures into area {@b A2} using Captivate. Any actions it hasn't used to Captivate are used to drain a living creature in the room with Live a Thousand Lives.",
			{
				name: 'Captivate',
				type: 'ability',
				activity: {
					number: 1,
					unit: 'action',
				},
				traits: ['charm', 'enchantment', 'incapacitation', 'mental', 'occult'],
				entries: [
					'The faintly moving images compel one creature within 30 feet of the room to move into the room. The creature attempts a DC 38 Will save.',
					{
						type: 'successDegree',
						entries: {
							Success: ['The target is unaffected.'],
							Failure: [
								'The target must spend all its actions on its next turn moving into the room, and is then {@condition paralyzed} until the end of its next turn.',
							],
							'Critical Failure': [
								'As failure, and the target is also {@condition stupefied||stupefied 2} for 1 minute.',
							],
						},
					},
				],
			},
			{
				name: 'Live a Thousand Lives',
				type: 'ability',
				activity: {
					number: 1,
					unit: 'action',
				},
				traits: ['mental', 'occult'],
				entries: [
					'The haunt causes a living creature in the room to experience a full elven life, weathering every wound, misfortune, loss, and consequence of aging centuries in a matter of seconds. The target must attempt a DC 38 Fortitude save.',
					{
						type: 'successDegree',
						entries: {
							'Critical Success': ['The target is unaffected.'],
							Success: ['The target becomes {@condition fatigued}.'],
							Failure: [
								'The target becomes {@condition drained||drained 1} (or its {@condition drained} value increases by 1, to a maximum of {@condition drained||drained 3}), and it is {@condition paralyzed} until the end of its next turn.',
							],
							'Critical Failure': [
								'As failure, but the target also becomes {@condition doomed||doomed 1} (or its {@condition doomed} value increases by 1).',
							],
						},
					},
				],
			},
		],
		reset: [
			'The haunt continues its routine until there are no targets within 30 feet of the room. It then resets over the course of 1 minute and is able to activate again.',
		],
	},
	{
		name: 'Envenomed Thorns Trap',
		source: 'EC1',
		page: 13,
		level: 2,
		traits: ['mechanical', 'trap'],
		stealth: {
			dc: 20,
			minProf: 'trained',
		},
		description: [
			'A trip wire strung 4 feet above the ground releases a branch studded with envenomed thorns.',
		],
		disable: {
			entries: ['{@skill Thievery} DC 18 (trained) to remove the trip wire.'],
		},
		defenses: {
			ac: {
				std: 18,
			},
			savingThrows: {
				fort: {
					std: 10,
				},
				ref: {
					std: 4,
				},
			},
			hardness: {
				std: 5,
			},
			hp: {
				std: 28,
			},
			bt: {
				std: 14,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['poison'],
				trigger: 'The trip wire is touched',
				entries: [
					"The trap's poisoned thorns attack the creature or object touching the trip wire.",
				],
				name: 'Thorny Branch',
			},
		],
		attacks: [
			{
				range: 'Melee',
				name: 'poisoned thorns',
				attack: 14,
				damage: '{@damage 1d6+4} piercing plus {@damage 1d8} poison',
				types: ['piercing', 'poison'],
				noMAP: true,
			},
		],
	},
	{
		name: 'Exploding Statue',
		source: 'AoE1',
		page: 26,
		level: 2,
		traits: ['mechanical', 'trap'],
		stealth: {
			dc: 18,
			minProf: 'trained',
		},
		description: [
			'A hollow statue filled with explosives is connected to a trip wire running along the adjacent door.',
		],
		disable: {
			entries: ['DC 21 {@skill Thievery} (trained) to safely cut the wire.'],
		},
		defenses: {
			ac: {
				std: 21,
			},
			savingThrows: {
				fort: {
					std: 6,
				},
				ref: {
					std: 12,
				},
			},
			hardness: {
				std: 5,
			},
			hp: {
				std: 30,
			},
			bt: {
				std: 15,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature opens the northern door without first disabling the trip wire',
				entries: [
					'The statue explodes, spraying shrapnel to the west in a 5-foot cone and dealing {@damage 1d10+7} piercing and {@damage 1d10} fire damage to all creatures in the affected area (DC 18 basic Reflex save).',
				],
				name: 'Explosion',
			},
		],
	},
	{
		name: 'Explosive Barrels',
		source: 'AoE1',
		page: 10,
		level: 2,
		traits: ['environmental', 'fire'],
		stealth: {
			dc: 15,
		},
		description: ['Wooden barrels marked with an oil-drop symbol catch fire and explode.'],
		disable: {
			entries: [
				'{@skill Survival} DC 20 to smother the flames without rupturing the barrels.',
			],
		},
		defenses: {
			ac: {
				std: 15,
			},
			savingThrows: {
				fort: {
					std: 11,
				},
				ref: {
					std: 3,
				},
			},
			hardness: {
				std: 1,
			},
			hp: {
				std: 5,
			},
			immunities: ['object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: "4 rounds pass after the agents' arrival without anyone smothering them",
				entries: [
					'The barrels explode, dealing {@damage 3d6+8} fire damage to everything within a 20-foot radius (basic DC 20 Reflex save).',
				],
				name: 'Explode',
			},
		],
	},
	{
		name: 'Explosive Furniture Trap',
		source: 'EC4',
		page: 18,
		level: 12,
		traits: ['mechanical', 'trap'],
		stealth: {
			dc: 30,
			minProf: 'expert',
		},
		description: [
			'Wiring keeping the furniture together unravels, causing the spring-loaded pieces of furniture and wire to shoot outward.',
		],
		disable: {
			entries: [
				'DC 34 {@skill Thievery} (expert) to identify and harmlessly cut the taut wiring.',
			],
		},
		defenses: {
			ac: {
				std: 33,
			},
			savingThrows: {
				fort: {
					std: 25,
				},
				ref: {
					std: 19,
				},
			},
			hardness: {
				std: 21,
			},
			hp: {
				std: 84,
			},
			bt: {
				std: 42,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger:
					'A creature moves within 5 feet of the pile of {@condition broken} furniture',
				entries: [
					'The pile of furniture and entangling wires explodes outward. The trap deals {@damage 6d10+27} slashing damage (DC 32 basic Reflex save). On a failed save, the target takes a \u201310-foot penalty to all its Speeds for 1 round (1 minute on a critical failure).',
				],
				name: 'Unsprung Wires',
			},
		],
	},
	{
		name: 'Eyeball Tank',
		source: 'AoE5',
		page: 51,
		level: 15,
		traits: ['complex', 'magical', 'trap'],
		stealth: {
			bonus: 31,
			minProf: 'master',
		},
		description: [
			'A vat of thick glass stands 10 feet high and is filled with green slime and fist-sized eyeballs.',
		],
		disable: {
			entries: [
				'DC 38 {@skill Thievery} (master) or DC 34 {@skill Crafting} (expert) to acidify the slime inside the tank, destroying the eyeballs.',
			],
		},
		defenses: {
			ac: {
				std: 33,
			},
			savingThrows: {
				fort: {
					std: 29,
				},
				ref: {
					std: 26,
				},
			},
			hardness: {
				Tank: 2,
			},
			hp: {
				Tank: 180,
			},
			bt: {
				Tank: 90,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger:
					'Three or more living creatures remain within 20 feet of the trap for 1 round',
				entries: ['The trap rolls initiative.'],
				name: 'Eye-Opener',
			},
		],
		routine: [
			'(3 actions) Each round, the vat uses all three of its actions to shoot random eye rays at any living creatures (except Ixusoth) in range.',
			{
				type: 'attack',
				range: 'Ranged',
				name: 'despair ray',
				attack: 28,
				traits: ['emotion', 'enchantment', 'mental', 'range <100 feet>'],
				effects: ['target is subjected to a {@spell crushing despair} spell (DC 33)'],
				damage: 'target is subjected to a {@spell crushing despair} spell (DC 33)',
				noMAP: true,
			},
			{
				type: 'attack',
				range: 'Ranged',
				name: 'feeblemind ray',
				attack: 28,
				traits: ['curse', 'enchantment', 'incapacitation', 'mental', 'range <100 feet>'],
				effects: ['target is subjected to a {@spell feeblemind} spell (DC 36)'],
				damage: 'target is subjected to a {@spell feeblemind} spell (DC 36)',
				noMAP: true,
			},
			{
				type: 'attack',
				range: 'Ranged',
				name: 'spirit blast ray',
				attack: 28,
				traits: ['force', 'necromancy', 'range <100 feet>'],
				effects: ['target is subjected to a {@spell spirit blast} spell (DC 36)'],
				damage: 'target is subjected to a {@spell spirit blast} spell (DC 36)',
				noMAP: true,
			},
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'The tank reaches its {@condition Broken} Threshold',
				type: 'ability',
				name: 'Spill Eyeballs',
				entries: [
					"The glass shatters, spilling eyeballs onto the floor in a 15-foot radius and casting grease (DC 33) on the affected area. The eyeball tank is permanently destroyed and can't be reset.",
				],
			},
		],
		reset: [
			'The trap can be reset by adding 100 new eyeballs to the tank and allowing them to grow in the slime for 1 week.',
		],
	},
	{
		name: 'Falling Debris',
		source: 'FoP',
		page: 18,
		level: 1,
		traits: ['mechanical', 'trap'],
		stealth: {
			dc: 17,
			minProf: 'trained',
		},
		description: [
			"A pressure-sensitive floorboard connects to a beam holding up debris in the crawlway's ceiling.",
		],
		disable: {
			entries: [
				'{@skill Thievery} DC 15 (trained) on the floorboard before the debris falls.',
			],
		},
		defenses: {
			ac: {
				std: 16,
			},
			savingThrows: {
				fort: {
					std: 8,
				},
				ref: {
					std: 2,
				},
			},
			hardness: {
				std: 5,
			},
			hp: {
				std: 20,
			},
			bt: {
				std: 10,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'Pressure is placed on the floorboard.',
				entries: [
					'The ceiling in the crawlway collapses in the square where the passage turns, and also in the two adjacent squares. Anyone in these three squares takes {@damage 3d6} bludgeoning damage and can attempt a DC 14 Reflex save to reduce the damage. For the creature in the center square, where the trap is triggered, this is a basic save. Creatures in the two adjacent squares take no damage on a success or critical success as they avoid the falling debris entirely, but take full damage on a failed save, and take double damage on a critical failure. Creatures that take damage from the debris are {@condition immobilized}, trapped under the crushing weight. Clearing out a square of debris requires a successful DC 17 {@skill Athletics} skill check, with the following effects.',
					{
						type: 'successDegree',
						entries: {
							'Critical Success': 'The square is cleared in 1 minute.',
							Success: 'The square is cleared in 5 minutes.',
							Failure: 'The square is cleared in 10 minutes.',
							'Critical Failure':
								'The ceiling above the square collapses further, dealing an additional {@dice 2d6} to the character digging out the square and any character trapped in that square. This takes 1 minute and no progress is made.',
						},
					},
				],
				name: 'Falling Debris',
			},
		],
	},
	{
		name: 'False Door Trap',
		source: 'AoE4',
		page: 23,
		level: 12,
		traits: ['magical', 'mechanical', 'trap'],
		stealth: {
			dc: 37,
			minProf: 'expert',
		},
		description: [
			'A {@condition hidden} needle delivers a magical poison to anyone trying to open the door.',
		],
		disable: {
			entries: [
				'DC 32 {@skill Thievery} (master) to jam the needle in its housing or dispel magic (6th level, counteract DC 30) to dispel the magical poison.',
			],
		},
		defenses: {
			ac: {
				std: 31,
			},
			savingThrows: {
				fort: {
					std: 23,
				},
				ref: {
					std: 17,
				},
			},
			hardness: {
				std: 25,
			},
			hp: {
				std: 100,
			},
			bt: {
				std: 50,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['necromancy', 'poison', 'primal'],
				trigger: 'A creature touches the door',
				entries: ['The creature is targeted by purple worm sting (DC 32 Fortitude save).'],
				name: 'Purple Worm Sting',
			},
		],
	},
	{
		name: 'Field Of Opposition',
		source: 'AoE6',
		page: 53,
		level: 20,
		traits: ['complex', 'illusion', 'magical', 'trap'],
		stealth: {
			bonus: 35,
		},
		description: [
			"A distortion in space spawns an aggressive, malevolent shadow duplicate of any characters who pass between Terimor's faces.",
		],
		disable: {
			entries: [
				'DC 42 {@skill Thievery} (legendary) to permanently disable the planar distortion (DC increases by 2 for each duplicate still extant), or dispel magic (10th level; counteract DC 42) to destroy the planar distortion.',
			],
		},
		defenses: {
			ac: {
				std: 45,
			},
			savingThrows: {
				fort: {
					std: 33,
				},
				ref: {
					std: 30,
				},
			},
			hardness: {
				Face: 20,
			},
			hp: {
				Face: 150,
			},
			bt: {
				Face: 75,
			},
			weaknesses: [
				{
					amount: 20,
					name: 'sonic',
				},
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['divine', 'conjuration', 'teleportation'],
				trigger: 'A creature moves between the two glass faces of Olansa Terimor',
				name: 'Spawn Mirror Duplicate',
				entries: [
					"The planar rift disgorges an evil mirror duplicate of the creature (see below), and the duplicate rolls initiative. The field of opposition can use this reaction once per round but can't spawn a duplicate of a creature that already has a mirror duplicate in existence.",
				],
			},
			{
				entries: [
					"A mirror duplicate rolls initiative with a +45 modifier. It uses the same statistics as the original creature, but with a +2 status bonus to AC, attacks, and saving throws. The duplicate is evil, and any abilities reliant on alignment change accordingly. The duplicate is also aggressive, attacking and taking other {@condition hostile} actions available to it against anyone other than mirror duplicates. It has three actions and one reaction and can use any of the original creature's abilities. Any limited-use abilities (such as spell slots) are based on what the original had when duplicated and are used up separately from the original creature's. The duplicate also has duplicates of the creature's worn and held items, but not consumables.",
					'A duplicate is destroyed when reduced to 0 HP, when the trap is disabled or destroyed, or when the duplicate leaves area E2. Its duplicated items disappear when they leave its grip, though they last long enough for ranged {@action Strike||Strikes}.',
				],
				name: 'Mirror Duplicate',
			},
		],
	},
	{
		name: 'Fiendripping Blast Trap',
		source: 'Sli',
		page: 32,
		level: 7,
		traits: ['uncommon', 'mechanical', 'trap'],
		stealth: {
			dc: 25,
			minProf: 'expert',
		},
		description: [
			'A blast of energy damages all creatures within 20 feet, with particularly severe damage to {@trait fiend||fiends}.',
		],
		disable: {
			entries: [
				'{@skill Thievery} DC 27 (expert) to identify the proper sequence of buttons in the divots, or {@spell dispel magic} (4th level; counteract DC 25) to suppress the {@trait magical} effect for 1 hour.',
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['divine', 'evocation'],
				trigger:
					'The door is touched without first pressing the correct sequence of buttons',
				entries: [
					'A blast of energy ripples outward from the door, dealing {@damage 4d10} force damage to all creatures within 20 feet and forcing them to make a DC 25 Fortitude save. {@trait fiend||Fiends} treat the result of their saving throw as one degree worse.',
					{
						type: 'successDegree',
						entries: {
							'Critical Success': 'The creature is unaffected.',
							Success: 'The creature takes half damage.',
							Failure:
								'The creature takes full damage and is {@condition sickened|CRB|sickened 1}.',
							'Critical Failure':
								"The creature takes double damage and is {@condition sickened|CRB|sickened 2}; while it is {@condition sickened}, it's also {@condition slowed|CRB|slowed 1}.",
						},
					},
				],
				name: 'Forceful Blast',
			},
		],
		reset: ['The trap resets after 1 hour.'],
	},
	{
		name: 'Fireball Rune',
		source: 'CRB',
		page: 524,
		level: 5,
		traits: ['evocation', 'fire', 'magical', 'trap'],
		stealth: {
			dc: 24,
			minProf: 'expert',
		},
		description: [
			'An {@condition invisible} rune creates an {@condition invisible}, spherical magical sensor with a 20-foot radius.',
		],
		disable: {
			entries: [
				'{@skill Thievery} DC 22 (expert) to erase the rune without triggering the sensor, or dispel magic (3rd level; counteract DC 20) to counteract the rune.',
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['arcane', 'evocation', 'fire'],
				trigger: 'A living creature enters the sensor area.',
				entries: [
					"The rune detonates a fireball centered on the triggering creature's square. This is a 3rdlevel {@spell fireball} spell that deals {@damage 6d6} fire damage (DC 22 basic Reflex save).",
				],
				name: 'Fireball',
			},
		],
	},
	{
		name: 'Floating Flamethrower',
		source: 'FRP2',
		page: 44,
		level: 16,
		traits: ['rare', 'complex', 'fire', 'magical', 'trap'],
		stealth: {
			bonus: 23,
			minProf: 'expert',
			notes: "or DC 38 (master) to notice the pattern of the orb's trajectory",
		},
		description: [
			'A floating skull of fire swoops around the arena, rotating as it weaves through the ring and releasing huge gouts of flame in random directions.',
		],
		disable: {
			entries: [
				"three DC 40 {@skill Thievery} (legendary) checks or castings of {@spell dispel magic} (7th level; counteract DC 40), one each to pull out or disable the elemental cores {@condition hidden} in the floating skull's right eye, left eye, and mouth",
			],
		},
		defenses: {
			ac: {
				std: 42,
			},
			savingThrows: {
				fort: {
					std: 30,
				},
				ref: {
					std: 33,
				},
			},
			hardness: {
				std: 25,
			},
			hp: {
				std: 100,
			},
			bt: {
				std: 50,
			},
			immunities: ['fire'],
			weaknesses: [
				{
					amount: 15,
					name: 'cold',
				},
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['evocation', 'fire'],
				trigger: 'Hao Jin signals the start of the bout',
				entries: ['The trap roars with fire and rolls initiative.'],
				name: 'Blaze',
			},
		],
		routine: [
			'(3 actions) The trap loses 1 action per turn per successful check to disable. The floating flamethrower uses its first action to release a gout of flame in a 15-foot cone that deals {@damage 4d6+4} fire damage (DC 40 basic Reflex save), its second action to fly in a U-shape in a random direction, and its third action to release another gout of flame.',
			{
				type: 'ability',
				name: 'Speed',
				entries: ['fly 50 feet'],
			},
		],
	},
	{
		name: 'Flying Guillotine',
		source: 'AoE1',
		page: 49,
		level: 5,
		traits: ['complex', 'magical', 'trap'],
		stealth: {
			bonus: 10,
			minProf: 'trained',
			notes: 'or DC 23 (expert) to spot the glyph',
		},
		description: [
			"An {@condition invisible} magical glyph on the guillotine's blade detects living creatures in the room, which causes the guillotine to fly off its hinges and attack.",
		],
		disable: {
			entries: [
				'DC 20 {@skill Thievery} (trained) to erase the glyph (which requires a successful unarmed attack roll if the blade is already active) or {@spell dispel magic} (3rd level; counteract DC 20) to counteract it. The trap has a secret bypass known only to Ralso and Pratchett: as long as the guillotine can see a creature in the room touching thumb and pinky together with an empty hand, it remains dormant.',
			],
		},
		defenses: {
			ac: {
				std: 23,
			},
			savingThrows: {
				fort: {
					std: 9,
				},
				ref: {
					std: 17,
				},
			},
			hardness: {
				Blade: 13,
			},
			hp: {
				Blade: 52,
			},
			bt: {
				Blade: 26,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['abjuration', 'arcane', 'attack'],
				trigger: 'A living creature enters the room',
				entries: [
					'One round after a creature enters the room, the door to the room slams shut and locks (two DC 20 {@skill Thievery} checks to pick), and the guillotine blade detaches from its housing and begins flying around the room as the trap rolls initiative.',
				],
				name: 'Flying Blade',
			},
		],
		routine: [
			"(1 action) The blade Flies up to 20 feet and {@action Strike||Strikes} any creatures whose squares it passes through. It cannot target the same creature more than once per round. The blade cannot be grappled and doesn't take a multiple attack penalty.",
			{
				type: 'ability',
				name: 'Speed',
				entries: ['fly 20 feet'],
			},
			{
				type: 'attack',
				range: 'Melee',
				name: 'guillotine blade',
				attack: 15,
				damage: '{@damage 2d8+7} slashing',
				types: ['slashing'],
			},
		],
		reset: [
			'After 1 minute, the trap deactivates, though the door remains locked. The trap rearms itself each day at dawn.',
		],
	},
	{
		name: 'Freezing Alarm',
		source: 'AoE6',
		page: 37,
		level: 20,
		traits: ['magical', 'trap'],
		stealth: {
			dc: 43,
			minProf: 'master',
		},
		description: [
			'Miniature snowflake-shaped glyphs on the ground cause a layer of ice to ripple over the floor of the room and sound a silent alarm.',
		],
		disable: {
			entries: [
				'DC 51 {@skill Arcana} (legendary) to draw a fiery counteracting glyph over each snowflake, or dispel magic (9th level, counteract DC 48)',
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['abjuration', 'arcane', 'cold'],
				trigger: 'A creature enters one of the three squares marked with a T on the map',
				entries: [
					'The floor of the entire 10-foot-by-15-foot antechamber freezes over, sending deadly magical frost creeping up the legs of the intruders. Any creatures standing in the room must roll a DC 45 Reflex save.',
					{
						type: 'successDegree',
						entries: {
							'Critical Success': 'The creature is unaffected.',
							Success: 'The creature takes {@damage 3d10+5} cold damage.',
							Failure:
								'The creature takes {@damage 6d10+10} cold damage and is {@condition slowed|CRB|slowed 1} for {@dice 1d4} rounds.',
							'Critical Failure':
								"The creature takes {@damage 12d10+20} cold damage and is {@condition slowed|CRB|slowed 1} for 1 minute. Additionally, the golems in area B10 become aware of the intruders. The golems activate and come to this room to attack, if they haven't been destroyed already.",
						},
					},
				],
				name: 'Freeze Floor',
			},
		],
		reset: ['1 day'],
	},
	{
		name: 'Freezing Floor Tiles',
		source: 'FRP2',
		page: 45,
		level: 16,
		traits: ['rare', 'cold', 'complex', 'magical', 'trap'],
		stealth: {
			bonus: 23,
			minProf: 'expert',
			notes: 'or DC 38 (master) to notice the four sensors.',
		},
		description: [
			'Four remote sensors at each corner of the arena cause bursts of freezing magic to erupt from random tiles on the arena and stop creatures in their tracks.',
		],
		disable: {
			entries: [
				'DC 40 {@skill Thievery} (legendary) or dispel magic (6th level; counteract DC 38) to disable one of the sensors.',
			],
		},
		defenses: {
			ac: {
				std: 36,
			},
			savingThrows: {
				fort: {
					std: 33,
				},
				ref: {
					std: 30,
				},
			},
			hardness: {
				Sensor: 20,
			},
			hp: {
				Sensor: 40,
			},
			bt: {
				Sensor: 20,
			},
			weaknesses: [
				{
					amount: 15,
					name: 'fire',
				},
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['cold'],
				trigger: 'Hao Jin signals the beginning of the match.',
				entries: ['The trap rolls initiative.'],
				name: 'Frigid Floor',
			},
		],
		routine: [
			'(4 actions) The trap loses 1 action per disabled sensor. On each action, the trap causes a random 10-foot-by-10-foot space in the arena to suddenly freeze.',
			"Each creature that begins its turn in a frozen space takes {@damage 2d6+2} cold damage (DC 40 basic Reflex save). A creature that critically fails its save also becomes {@condition slowed|CRB|slowed 1} for 1 round; if it was already {@condition slowed}, the creature instead becomes {@condition immobilized} for 1 round. Any amount of fire damage dealt to a {@condition slowed} or {@condition immobilized} creature removes the condition. Frozen tiles become unfrozen at the beginning of the trap's next turn.",
		],
	},
	{
		name: 'Frozen Moment',
		source: 'CRB',
		page: 525,
		level: 17,
		traits: ['magical', 'trap'],
		stealth: {
			dc: 40,
			minProf: 'master',
		},
		description: [
			'Warding magic attempts to trap intruders or would-be thieves in a disrupted time flow.',
		],
		disable: {
			entries: [
				"{@skill Thievery} DC 38 (legendary) to rapidly disassemble the spell's myriad components in a single blink of an eye; or dispel magic (9th level; counteract DC 36) to counteract the trap before it triggers or to counteract the effect on one creature after the trap is triggered.",
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['occult', 'transmutation'],
				trigger: 'A creature touches the warded object or area.',
				entries: [
					"The triggering creature and all creatures within 30 feet are trapped in a disrupted time flow (DC 38 Fortitude negates). The creatures' minds move so quickly that each round seems to last a century, but their bodies and magical energies move so slowly that they can't use any actions except Recall.",
				],
				name: 'Adrift in Time',
			},
			{
				entries: [
					'An affected creature must attempt a DC 36 Will saving throw against a {@spell warp mind} spell immediately and again for every minute of real time that passes while the creature is trapped in the frozen moment. This effect has an unlimited duration but can be counteracted.',
				],
				name: 'Knowledge.',
			},
		],
	},
	{
		name: 'Gas Trap',
		source: 'AoE1',
		page: 57,
		level: 5,
		traits: ['complex', 'mechanical', 'trap'],
		stealth: {
			bonus: 14,
			minProf: 'trained',
			notes: 'to smell the poison gas or hear it hissing.',
		},
		description: [
			"A spring slams and locks the room's door before four {@condition hidden} gas vents begin pumping poison gas into the chamber.",
		],
		disable: {
			entries: [
				'Four DC 20 {@skill Thievery} checks to block the gas vents, or a DC 26 {@skill Thievery} check to unlock the door and escape Door Hardness 13, Door HP 52 (BT 26); Immunities critical hits, object immunities, precision damage.',
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature opens one of the drawers',
				entries: [
					'The door to the room slams shut and locks and the trap rolls initiative. (The trap can also be triggered manually or disarmed from area E30.)',
				],
				name: 'Toxic Gas',
			},
		],
		routine: [
			"{@as 1} Each round on its initiative count, the trap pumps more toxic gas into the room. Any breathing creature in the room takes {@damage 4d6} poison damage (a successful DC 22 Fortitude save halves the damage taken). If a creature acts before the trap on the first round, it has the option of holding its breath to postpone taking damage from the trap\u2014holding one's breath after the trap's first action has no effect, since the air in the creature's lungs is already tainted. Locating and blocking one of the {@condition hidden} gas vents reduces the poison damage by {@dice 1d6}\u2014if all four are blocked, the trap is disabled, though the door remains locked. Otherwise, the trap functions for 1 minute before all the gas is expended and characters in the room cease taking damage, after which the trap ventilates the room for 1 additional minute.",
		],
		reset: [
			'The trap must be manually rearmed by unblocking the vents or replacing the poison gas tank in area E30.',
		],
	},
	{
		name: 'Ghost Crystal Cloud',
		source: 'EC2',
		page: 28,
		level: 8,
		traits: ['uncommon', 'environmental'],
		stealth: {
			dc: 28,
			minProf: 'trained',
		},
		description: [
			'The xulgath corpse splits open to release a cloud of tiny ectoplasmic crystals which, when they are inhaled, disorient and devitalize living creatures.',
		],
		disable: {
			entries: [
				'DC 26 {@skill Arcana} or Occult (expert) to render the crystal cloud inert.',
			],
		},
		defenses: {
			ac: {
				std: 27,
			},
			savingThrows: {
				fort: {
					std: 17,
				},
				ref: {
					std: 13,
				},
			},
			hp: {
				std: 70,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger:
					'A creature touches or disturbs the corpse containing the growth of crystals',
				entries: [
					'All creatures within 10 feet of the corpse are exposed to the ghost crystal cloud.',
				],
				name: 'Ectoplasmic Explosion',
			},
			{
				type: 'affliction',
				name: 'Ghost Crystal Cloud',
				traits: ['inhaled', 'poison'],
				note: 'Creatures with the {@trait ethereal} trait are immune',
				DC: 26,
				savingThrow: 'Fortitude',
				maxDuration: '6 rounds',
				stages: [
					{
						stage: 1,
						entry: '{@damage 1d10} poison damage and {@condition stupefied|CRB|stupefied 1}',
						duration: '1 round',
					},
					{
						stage: 2,
						entry: '{@damage 2d10} poison damage and {@condition stupefied|CRB|stupefied 2}',
						duration: '1 round',
					},
					{
						stage: 3,
						entry: '{@damage 3d10} poison damage and {@condition stupefied|CRB|stupefied 3}',
						duration: '1 round',
					},
				],
			},
		],
		reset: [
			'The crystals regrow into a number sufficient to form another dangerous cloud after 1 week.',
		],
	},
	{
		name: 'Gloomglow Mushrooms',
		source: 'AoA1',
		page: 57,
		level: 5,
		traits: ['environmental', 'fungus'],
		stealth: {
			dc: 26,
			minProf: 'expert',
		},
		description: [
			'A field of grass-like fungal filaments amid clusters of softly glowing, long-stalked mushrooms.',
		],
		disable: {
			entries: [
				'{@skill Survival} DC 22 (expert) to remove a 5-foot-patch without triggering the mushrooms.',
			],
		},
		defenses: {
			ac: {
				std: 21,
			},
			savingThrows: {
				fort: {
					std: 13,
				},
				ref: {
					std: 9,
				},
			},
			hp: {
				std: 52,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
			weaknesses: [
				{
					amount: 10,
					name: 'cold',
				},
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger:
					"A creature moves into the mushrooms' space or damages the mushrooms. The mushrooms can't use this reaction if the damage was cold damage.",
				entries: [
					'The triggering creature and all creatures within 10 feet are sprayed with itchy, distracting, glowing spores and must attempt a DC 22 Reflex save. On a failed save, the creatures become {@condition sickened|CRB|sickened 1} and {@condition stupefied|CRB|stupefied 1} (or {@condition sickened|CRB|sickened 2} and {@condition stupefied|CRB|stupefied 2} on a critical failure) and take a \u20134 penalty to {@skill Stealth} checks until the spores lose potency in 24 hours or are removed. This requires washing them off by bathing in water for a minute, a {@spell prestidigitation} spell, or a similar measure allowed by the GM.',
				],
				name: 'Glowing Spores',
			},
		],
	},
	{
		name: 'Greater Planar Rift',
		source: 'AoE6',
		page: 30,
		level: 21,
		traits: ['magical', 'trap'],
		stealth: {
			dc: 41,
			minProf: 'legendary',
		},
		description: [
			'A ragged planar rift drags things into its depths and hurls creatures through from its terminal end.',
		],
		disable: {
			entries: ['dispel magic (9th level; counteract DC 46) to seal the rift.'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['arcane', 'conjuration', 'teleportation'],
				trigger: 'A creature moves within 5 feet of the rift',
				entries: [
					"The creature must succeed at a DC 44 Will save or be drawn into the rift. A creature so drawn in becomes {@condition stunned|CRB|stunned 3} and immediately teleports to a different random area in Kharnas's ruins.",
				],
				name: 'Greater Planar Rift',
			},
		],
	},
	{
		name: 'Guthallath Rockslide',
		source: 'EC6',
		page: 25,
		level: 19,
		traits: ['complex', 'environmental'],
		stealth: {
			bonus: 30,
			minProf: 'master',
			notes: 'to notice the odd aging of the stones, seemingly far older and more weathered than the surrounding rocks.',
		},
		description: ['The rock walls nearby begin to crumble and collapse.'],
		disable: {
			entries: [
				'DC 48 {@skill Crafting} (legendary) to buttress the collapsing rocks in three different locations. Using large and durable materials (or applicable spells) to support the rocks reduces the check to DC 45 {@skill Crafting} (master).',
			],
		},
		defenses: {
			ac: {
				std: 42,
			},
			savingThrows: {
				fort: {
					std: 35,
				},
				ref: {
					std: 29,
				},
			},
			hp: {
				std: 150,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'The guthallath rolls initiative',
				entries: [
					'The rocks of the area begin to crumble. The hazard rolls for initiative.',
				],
				name: 'Rumbling Rocks',
			},
		],
		routine: [
			"(2 actions) On the hazard's first action, any areas of crumbling rocks from a previous round collapse, making a falling rocks {@action Strike} against each creature in the area.",
			'On its second action, the hazard crumbles rocks in a 20- foot radius around the previous collapse. A character can {@action Seek} (DC 40) to determine where the rocks will fall on the following round, but on a critical failure, they incorrectly identify where the rocks will fall.',
			{
				type: 'attack',
				range: 'Ranged',
				name: 'falling rocks',
				attack: 36,
				damage: '{@damage 4d10+20} bludgeoning',
				types: ['bludgeoning'],
				noMAP: true,
			},
			{
				activity: {
					number: 1,
					unit: 'free',
				},
				trigger: 'The hazard takes 30 or more damage',
				entries: [
					"Move the hazard's initiative to immediately follow the creature that damaged the hazard.",
				],
				type: 'ability',
				name: 'Early Collapse',
			},
		],
		reset: [
			'The guthallath can reset the hazard with a few days of work stacking the fallen rocks.',
		],
	},
	{
		name: 'Hallowed Wheel',
		source: 'EC2',
		page: 51,
		level: 10,
		traits: ['rare', 'complex', 'magical', 'mechanical', 'trap'],
		stealth: {
			bonus: 19,
			minProf: 'expert',
			notes: 'to detect the magical sensor; noticing the wheel has a DC of 0.',
		},
		description: [
			'An ornate wheel, divided into eight segments with a rune painted on each, is mounted on a pole and {@condition controlled} by a lever that can be triggered manually or a sensor that detects creatures within 30 feet in front of it.',
		],
		disable: {
			entries: [
				'DC 31 {@skill Thievery} (master) on the wheel to flip the switch returning it to a harmless carnival game, DC 26 {@skill Thievery} (expert) to erase each rune, or dispel magic (5th level; counteract DC 28) to counteract each rune.',
			],
		},
		defenses: {
			ac: {
				std: 30,
			},
			savingThrows: {
				fort: {
					std: 21,
				},
				ref: {
					std: 15,
				},
			},
			hardness: {
				std: 16,
			},
			hp: {
				std: 80,
			},
			bt: {
				std: 40,
			},
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: "A creature pulls the lever or enters the sensor's detection area",
				entries: ['The wheel begins to spin and rolls initiative.'],
				name: 'Wheel Spin',
			},
		],
		routine: [
			"{@as 2} On its initiative, the trap uses its first action to spin, then stops. Roll {@dice 1d8} to determine which segment is topmost when the wheel stops spinning. The wheel uses its second action to replicate the spell listed for that segment (5th level, DC 27, spell attack roll +17). This spell's target is centered on or otherwise includes the nearest creature in the spell's area. This increases the spell's range to 30 feet if necessary. Any spell cast by this trap is occult.",
			"1 black tentacles 2 blindness 3 confusion 4 death ward 5 outcast's curse 6 shadow blast (force damage in a 30-foot line) 7 sound burst 8 spider climb.",
		],
		reset: [
			'The trap deactivates and resets if 1 minute passes without any creature moving within range of its sensor.',
		],
	},
	{
		name: 'Hallucination Powder Trap',
		source: 'CRB',
		page: 524,
		level: 6,
		traits: ['mechanical', 'trap'],
		stealth: {
			dc: 24,
			minProf: 'expert',
		},
		description: [
			'A tube of hallucinogenic powder armed with a miniature explosive is connected to a doorknob or similar latch.',
		],
		disable: {
			entries: [
				'{@skill Thievery} DC 26 (expert) to disable the hammer that strikes the percussion cap.',
			],
		},
		defenses: {
			ac: {
				std: 24,
			},
			savingThrows: {
				fort: {
					std: 0,
				},
				ref: {
					std: 0,
				},
			},
			hardness: {
				default: 0,
			},
			hp: {
				std: 1,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['mental', 'poison'],
				trigger: 'The latch is opened or the tube is {@condition broken}.',
				entries: [
					'The tube explodes, spraying hallucinogenic powder in a 30-foot cone. Any creature in the cone must succeed at a DC 24 Will save or be {@condition confused} for 1 round and take a \u20132 status penalty to {@skill Perception} checks and saves against {@trait mental} effects for {@dice 1d4} hours. On a critical failure, the penalty is instead \u20134.',
				],
				name: 'Powder Burst',
			},
		],
	},
	{
		name: 'Hammer Of Forbiddance',
		source: 'CRB',
		page: 525,
		level: 11,
		traits: ['magical', 'mechanical', 'trap'],
		stealth: {
			dc: 30,
			minProf: 'expert',
		},
		description: [
			"An enormous hammer at an edifice's entrance swings down in an attempt to damage a creature entering an area, push it back, and prevent it from going any further.",
		],
		disable: {
			entries: [
				'{@skill Thievery} DC 28 (expert) once on the hammer itself and once on its joint to prevent the hammer from swinging.',
			],
		},
		defenses: {
			ac: {
				std: 32,
			},
			savingThrows: {
				fort: {
					std: 24,
				},
				ref: {
					std: 15,
				},
			},
			hardness: {
				Hammer: 22,
				Joint: 16,
			},
			hp: {
				Hammer: 88,
				Joint: 64,
			},
			bt: {
				Hammer: 44,
				Joint: 32,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['abjuration', 'attack', 'divine'],
				trigger: 'A creature attempts to enter through the entrance.',
				entries: [
					'The hammer swings down, making an attack against the triggering creature.',
				],
				name: 'Forbid Entry',
			},
		],
		reset: [
			'The trap resets over the course of the round, and is ready to swing again 1 round later.',
		],
		attacks: [
			{
				range: 'Melee',
				name: 'hammer',
				attack: 28,
				effects: ['the target automatically fails the Will save)'],
				damage: '{@damage 6d8+20} bludgeoning plus the target is knocked back 10 feet and must succeed at a DC 30 Will save or be unable to enter the edifice through any entrance for 24 hours (on a critical hit, the target automatically fails the Will save)',
				types: ['bludgeoning'],
				noMAP: true,
			},
		],
	},
	{
		name: 'Hands Of The Forgotten',
		source: 'AoE2',
		page: 37,
		level: 8,
		traits: ['haunt'],
		stealth: {
			dc: 28,
			minProf: 'trained',
		},
		description: [
			'Ethereal hands stretch out from the walls and floor, attempting to restrain nearby creatures.',
		],
		disable: {
			entries: [
				'DC 30 {@skill Religion} (master) to exorcise the spirits or DC 32 {@skill Intimidation} (expert) to scare away the hands.',
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['force', 'negative', 'occult'],
				trigger: 'A creature moves into the area marked on the map',
				entries: [
					"Misty blue hands stretch out from the hallway's stone tiles and grasp at the triggering creature, which must attempt a DC 26 Reflex save to avoid becoming hindered or harmed by the ethereal hands.",
					{
						type: 'successDegree',
						entries: {
							'Critical Success': 'The target is unaffected.',
							Success: 'The target is {@condition slowed|CRB|slowed 1} for 1 round.',
							Failure:
								'The target is {@condition slowed|CRB|slowed 2} for 1 round and takes {@damage 2d10+10} negative damage.',
							'Critical Failure':
								'The target is {@condition slowed|CRB|slowed 2} for 1 round and takes {@damage 4d10+15} negative damage.',
						},
					},
				],
				name: 'Waylay',
			},
		],
	},
	{
		name: 'Hidden Chute',
		source: 'AoE1',
		page: 48,
		level: 3,
		traits: ['mechanical', 'trap'],
		stealth: {
			dc: 23,
			minProf: 'trained',
		},
		description: ['A trapdoor in the floor conceals a stone chute.'],
		disable: {
			entries: [
				"DC 20 {@skill Thievery} (trained) to remove the trapdoor or lock it in position using a catch {@condition hidden} inside the room's doorframe.",
			],
		},
		defenses: {
			ac: {
				std: 12,
			},
			savingThrows: {
				fort: {
					std: 10,
				},
				ref: {
					std: 6,
				},
			},
			hardness: {
				Trapdoor: 5,
			},
			hp: {
				Trapdoor: 30,
			},
			bt: {
				Trapdoor: 15,
			},
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature walks onto the trapdoor',
				entries: [
					"The triggering creature falls 30 feet down the shaft to area E33, taking 15 bludgeoning damage and landing {@condition prone} in the ochre jelly's pit. The creature can {@action Grab an Edge} to avoid falling. The DC to {@action Climb} the walls or {@action Grab an Edge} is 22.",
				],
				name: 'Pitfall',
			},
		],
	},
	{
		name: 'Hidden Pit',
		source: 'CRB',
		page: 522,
		level: 0,
		traits: ['mechanical', 'trap'],
		stealth: {
			dc: 18,
			notes: '(or 0 if the trapdoor is disabled or {@condition broken})',
		},
		description: ["A wooden trapdoor covers a pit that's 10 feet square and 20 feet deep."],
		disable: {
			entries: ['{@skill Thievery} DC 12 to remove the trapdoor.'],
		},
		defenses: {
			ac: {
				std: 10,
			},
			savingThrows: {
				fort: {
					std: 1,
				},
				ref: {
					std: 1,
				},
			},
			hardness: {
				Trapdoor: 3,
			},
			hp: {
				Trapdoor: 12,
			},
			bt: {
				Trapdoor: 6,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature walks onto the trapdoor.',
				entries: [
					'The triggering creature falls in and takes falling damage (typically 10 bludgeoning damage). That creature can use the {@action Grab an Edge} reaction to avoid falling.',
				],
				name: 'Pitfall',
			},
		],
		reset: [
			'Creatures can still fall into the trap, but the trapdoor must be reset manually for the trap to become {@condition hidden} again.',
		],
	},
	{
		name: 'Host Of Spirits',
		source: 'EC5',
		page: 27,
		level: 18,
		traits: ['complex', 'haunt'],
		stealth: {
			bonus: 35,
			minProf: 'expert',
		},
		description: [
			'A host of angry spirits inhabiting the ruined house attempts to drag living creatures closer and crush them to death.',
		],
		disable: {
			entries: [
				'DC 43 {@skill Religion} (master) to exorcise the spirits or DC 45 {@skill Deception} (master) to trick the spirits into departing.',
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['attack', 'death', 'necromancy', 'occult'],
				trigger:
					'A creature that has angered the haunt begins its turn within 50 feet of the ruins of the house',
				entries: [
					'The haunt attempts a ghostly hand {@action Strike} against the target creature, and then rolls initiative.',
				],
				name: 'Embrace of Death',
			},
		],
		routine: [
			"(3 actions) For each of its actions, the trap attempts a ghostly hand {@action Strike} against a different creature within 50 feet of the ruins of the house (if there are fewer than 3 creatures, the haunt doesn't use its remaining actions).",
			{
				type: 'attack',
				range: 'Melee',
				name: 'ghostly hand',
				attack: 35,
				effects: ['ghostly grip'],
				damage: '{@damage 2d10+10} negative plus ghostly grip',
				types: ['negative'],
				noMAP: true,
			},
			{
				entries: [
					"A creature outside the house that takes damage from the host of spirits' ghostly hand {@action Strike} must succeed at a DC 42 Reflex save or be pulled directly into the house. If there is a wall in the creature's path, that section of wall is destroyed, and the creature takes an additional {@damage 3d12} bludgeoning damage. The haunt's ghostly hand {@action Strike} also deals an additional {@damage 6d6} bludgeoning damage to a target already inside the house (DC 42 basic Fortitude save).",
				],
				type: 'ability',
				name: 'Ghostly Grip',
			},
		],
		reset: [
			'The haunt ends 1 round after no creatures are within 50 feet of the house. The haunt resets after 1 day.',
		],
	},
	{
		name: 'Ice Fall Trap',
		source: 'FoP',
		page: 41,
		level: 4,
		traits: ['mechanical', 'trap'],
		stealth: {
			dc: 22,
			minProf: 'trained',
		},
		description: [
			'Compartments in the ceiling are rigged to drop a freezing alchemical liquid into the entire room if the door is opened without using the key.',
		],
		disable: {
			entries: [
				'{@skill Thievery} DC 20 (trained) on the door allows it to be opened without springing the trap.',
			],
		},
		defenses: {
			ac: {
				std: 20,
			},
			savingThrows: {
				fort: {
					std: 11,
				},
				ref: {
					std: 7,
				},
			},
			hardness: {
				std: 8,
			},
			hp: {
				std: 44,
			},
			bt: {
				std: 22,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'The door is attacked or opened without using the key.',
				entries: [
					'A freezing alchemical slurry is dumped into the room, dealing {@damage 4d6} cold damage to everyone in the area (DC 20 basic Reflex save).',
				],
				name: 'Ice Fall',
			},
		],
	},
	{
		name: 'Images Of Failure',
		source: 'AV3',
		page: 55,
		level: 12,
		traits: ['magical', 'trap'],
		stealth: {
			dc: 35,
			minProf: 'expert',
			notes: 'to realize the illusory images conceal a magical trap (noticing the images has a DC of 0)',
		},
		description: [
			'Psychically enhanced illusions flood the minds of creatures in the 40-foot-long, 15-foot-wide hallway (the white dotted box on the map) with memories of their past failures.',
		],
		disable: {
			entries: [
				'DC 32 {@skill Occultism} (master) or dispel magic (5th level; counteract DC 26) to weaken the images; three successes are required to disable the trap.',
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'free',
				},
				traits: ['curse', 'emotion', 'enchantment', 'mental'],
				trigger: "A creature ends a move action within the trap's area",
				entries: [
					'The triggering creature takes {@damage 2d10+10} mental damage (DC 32 basic Will save) as it recalls its past failures. A creature that takes damage hears a soft whisper offering, "Let me take something from you and I can stop the pain." A creature who agrees loses access to a random skill feat that isn\'t a prerequisite for another feat, and the creature doesn\'t take further damage from.',
				],
				name: 'Echoes of Defeat',
			},
			{
				entries: [
					'This effect lasts for 1 week and can be ended by effects that remove curses.',
				],
				name: 'Echoes of Defeat.',
			},
		],
		reset: [
			"The trap resets immediately and can affect the same creature multiple times on the creature's turn.",
		],
	},
	{
		name: 'Images Of Powerlessness',
		source: 'AV3',
		page: 55,
		level: 12,
		traits: ['magical', 'trap'],
		stealth: {
			dc: 35,
			minProf: 'expert',
			notes: 'to realize the illusory images conceal a magical trap (noticing the images has a DC of 0)',
		},
		description: [
			'Psychically-enhanced illusions flood the minds of creatures in the 95-foot-long, 15-foot-wide hallway (the white dotted box on the map) with visions of their failures yet to come.',
		],
		disable: {
			entries: [
				'DC 32 {@skill Occultism} (master) or dispel magic (5th level; counteract DC 26) to weaken the images; three successes are required to disable the trap.',
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'free',
				},
				traits: ['curse', 'emotion', 'enchantment', 'mental'],
				trigger: "A creature ends a move action within the trap's area",
				entries: [
					'The triggering creature takes {@damage 2d10+10} mental damage (DC 32 basic Will save) as it considers its future failures. A creature that takes damage hears a soft whisper offering, "Let me take something from you and I can stop the pain." A creature who agrees loses access to a random class feat that isn\'t a prerequisite for another feat, and the creature doesn\'t take further damage from.',
				],
				name: 'Flood of Despair',
			},
			{
				entries: [
					'This effect lasts for 1 week and can be ended by effects that remove curses. The creature also immediately detects the secret door at the end of the hall, no matter how far away from the end of the hall they are.',
				],
				name: 'Flood of Despair.',
			},
		],
		reset: [
			"The trap resets immediately and can affect the same creature multiple times on the creature's turn.",
		],
	},
	{
		name: 'Imperious Darkside Mirror',
		source: 'EC5',
		page: 54,
		level: 19,
		traits: ['complex', 'magical', 'mechanical', 'trap'],
		stealth: {
			bonus: 32,
			minProf: 'legendary',
			notes: "to notice that the mirror isn't a regular mirror.",
		},
		description: [
			'This magic mirror replaces characters with evil duplicates from another dimension.',
		],
		disable: {
			entries: [
				'DC 42 {@skill Thievery} (legendary) to retrieve a creature from the mirror within 10 minutes of the switch (possible only if their mirror duplicate is dead), DC 47 {@skill Thievery} (master) to permanently disable the mirror once all mirror duplicates are dead, or dispel magic (9th level; counteract DC 40) to counteract the mirror for 1 minute and prevent additional replacements from appearing during that time.',
			],
		},
		defenses: {
			ac: {
				std: 41,
			},
			savingThrows: {
				fort: {
					std: 32,
				},
				ref: {
					std: 27,
				},
			},
			hardness: {
				std: 1,
			},
			hp: {
				std: 4,
			},
			bt: {
				std: 2,
			},
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['arcane', 'conjuration', 'teleportation'],
				trigger: 'A non-evil creature is reflected in the mirror',
				entries: [
					'The mirror absorbs the creature into the mirror, replacing it with an evil mirror duplicate (DC 42 Reflex to avoid being absorbed into the mirror), and rolls initiative.',
				],
				name: 'Reflection of Evil',
			},
		],
		routine: [
			'(1 action) The mirror absorbs another reflected creature into the mirror (DC 42 Reflex) and replaces it with a mirror duplicate. Mirror duplicates act on their own initiative, using the same statistics as the original creature, but with an evil alignment (changing only abilities that shift with the alignment change)',
			'Mirror duplicates are legendary in {@skill Intimidation} and are permanently {@condition quickened}, but they can use this additional action only to {@action Demoralize}.',
			'A mirror duplicate can spend 3 actions in contact with the mirror to return to its original dimension and release the creature it duplicated, but most mirror duplicates prefer not to.',
		],
		reset: [
			"The mirror is always ready to absorb creatures into another dimension. 10 minutes after a creature is sucked into the mirror, if an ally doesn't rescue the creature using the {@skill Thievery} skill, the creature reaches the mirror dimension, where it could be captured or killed. In the mirror dimension, it counts as a mirror duplicate, so the denizens of the other dimension can't destroy the mirror on their side while the absorbed creature is there. These dimensions are alternate realities, not planes, so even rituals like plane shift can't reach them.",
		],
	},
	{
		name: 'Ink Drowning Vats',
		source: 'AoE5',
		page: 49,
		level: 18,
		traits: ['complex', 'mechanical', 'trap'],
		stealth: {
			bonus: 36,
			minProf: 'master',
		},
		description: [
			'Steel hatch doors automatically lock shut in each of the four vats labeled J2. Four ink spouts (one per vat) jut through a narrow aperture in the ceiling of each vat, 20 feet above.',
		],
		disable: {
			entries: [
				'DC 40 {@skill Thievery} (master) to seal an ink spout, DC 48 {@skill Thievery} (master) to unlock a steel hatch door, or DC 45 {@skill Athletics} (master) to {@action Force Open} a steel hatch door.',
			],
		},
		defenses: {
			ac: {
				std: 39,
			},
			savingThrows: {
				fort: {
					std: 30,
				},
				ref: {
					std: 27,
				},
			},
			hardness: {
				Door: 22,
			},
			hp: {
				Door: 112,
			},
			bt: {
				Door: 56,
			},
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'The switch outside the vats is pulled',
				entries: ['The trap rolls initiative.'],
				name: 'Fill Tank',
			},
		],
		routine: [
			"(4 actions) The trap loses 1 action for each disabled ink spout. On each of the trap's actions, a spout pours ink, increasing the depth of the ink in that vat by 2 feet. Creatures standing in the ink are exposed to a dose of poison ink. Once the vat is full of ink, the trap stops using actions, but creatures in the vat might start drowning.",
			{
				type: 'affliction',
				name: 'Poison Ink',
				traits: ['poison'],
				DC: 38,
				savingThrow: 'Fortitude',
				maxDuration: '10 rounds',
				stages: [
					{
						stage: 1,
						entry: '{@damage 3d6} poison damage and {@condition sickened|CRB|sickened 1}',
						duration: '1 round',
					},
					{
						stage: 2,
						entry: '{@damage 4d6} poison damage and {@condition sickened|CRB|sickened 2}',
						duration: '1 round',
					},
				],
			},
		],
		reset: ['The trap can be reset by refilling the ink storage tanks above the vats.'],
	},
	{
		name: 'Inky Tendrils',
		source: 'AoE6',
		page: 54,
		level: 20,
		traits: ['complex', 'environmental', 'magical'],
		stealth: {
			bonus: 32,
		},
		description: [
			'Six giant tentacles reach up from the ink lake, grabbing any foes in reach and dragging them underwater.',
		],
		disable: {
			entries: [
				'DC 48 {@skill Athletics} (legendary) or DC 45 {@skill Acrobatics} (master) to tie one tentacle into a knot, rendering it useless, or dispel magic (8th level; counteract DC 44) to counteract one tentacle. The death of the Daemonic Rumormonger permanently dispels all the inky tendrils.',
			],
		},
		defenses: {
			ac: {
				std: 42,
			},
			savingThrows: {
				fort: {
					std: 36,
				},
				ref: {
					std: 39,
				},
			},
			hardness: {
				Tentacle: 5,
			},
			hp: {
				Tentacle: 80,
			},
			bt: {
				Tentacle: 40,
			},
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A non-daemonic creature moves within 15 feet of the shoreline',
				entries: [
					'The hazard makes a tentacle {@action Strike} against the triggering creature and the hazard rolls initiative.',
				],
				name: 'Tendrils Come Alive',
			},
		],
		routine: [
			"(6 actions) The hazard loses 1 action for every tentacle that is disabled or destroyed. The tentacles can combine their actions to use the hazard's Inky Imitator ability. A {@condition broken} tentacle can still {@action Strike}, but it can't.",
			{
				entries: ['This hazard takes no multiple attack penalty.'],
				type: 'ability',
				name: 'Grab.',
			},
			{
				type: 'attack',
				range: 'Melee',
				name: 'tentacle',
				attack: 37,
				traits: ['reach <15 feet>'],
				effects: ['Grab'],
				damage: '{@damage 4d8+15} bludgeoning plus Grab',
				types: ['bludgeoning'],
				noMAP: true,
			},
			{
				activity: {
					number: 1,
					unit: 'action',
				},
				entries: ['{@damage 2d8+10} bludgeoning plus black ink delirium,'],
				type: 'ability',
				name: 'Constrict',
			},
		],
	},
	{
		name: 'Instant Privacy Fence',
		source: 'G&G',
		page: 81,
		level: 8,
		traits: ['rare', 'electricity', 'mechanical', 'trap'],
		stealth: {
			dc: 30,
			minProf: 'expert',
		},
		description: ['stretch of fence is electrified by a hidden Stasian coil.'],
		disable: {
			entries: [
				'{@skill Thievery} DC 28 (expert) to carefully disconnect the coil from the fence or {@skill Crafting} DC 30 (master) to jury-rig a grounding device to nullify the shock',
			],
		},
		defenses: {
			ac: {
				std: 25,
			},
			savingThrows: {
				fort: {
					std: 20,
				},
				ref: {
					std: 14,
				},
			},
			hardness: {
				std: 15,
			},
			hp: {
				std: 60,
			},
			bt: {
				std: 30,
			},
			immunities: ['object immunities'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature touches the fence directly or with a tool or weapon',
				entries: [
					'The fence deals {@damage 7d12} electricity damage to the triggering creature (DC 26 basic Reflex save).',
				],
				name: 'Shock',
			},
		],
		reset: ['The trap deactivates and resets after 1 minute.'],
	},
	{
		name: 'Iron Maiden Trap',
		source: 'AoE2',
		page: 52,
		level: 8,
		traits: ['mechanical', 'trap'],
		stealth: {
			dc: 30,
			minProf: 'expert',
		},
		description: [
			'A pressure plate {@condition hidden} on the floor before an iron maiden causes the torture device to snap shut and trap the triggering creature inside.',
		],
		disable: {
			entries: ['DC 28 {@skill Thievery} to disable the pressure plate.'],
		},
		defenses: {
			ac: {
				std: 25,
			},
			savingThrows: {
				fort: {
					std: 0,
				},
				ref: {
					std: 0,
				},
			},
		},
		actions: [
			{
				entries: [
					'6; Pressure Plate HP 24 (BT 12); Iron Maiden Hardness 12; Iron Maiden HP 46 (BT 23); Immunities critical hits, object immunities, precision damage.',
				],
				name: 'Pressure Plate Hardness',
			},
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: "A creature steps onto the trap's pressure plate (indicated on the map)",
				entries: [
					'The front of the iron maiden slams shut with incredible force and locks itself. The triggering creature takes {@damage 4d10+10} piercing damage and {@damage 2d6} {@condition persistent damage||persistent bleed damage} (DC 26 basic Reflex save; if the creature critically succeeds, they avoid the trap completely). The triggering creature is also {@condition immobilized}. The victim can end their immobilization only once a creature outside the iron maiden unlocks the device (requiring two successful DC 28 {@skill Thievery} checks.',
				],
				name: 'Slam Shut',
			},
			{
				entries: [
					"{@action Disable a Device}) or breaks the iron maiden, after which the trapped creature must succeed at a DC 25 check to {@action Escape} the trap's spike-lined interior.",
				],
				name: 'to',
			},
		],
		reset: ['The pressure plate must be reset manually.'],
	},
	{
		name: "Kharnas's Lesser Glyph",
		source: 'AoE6',
		page: 29,
		level: 17,
		traits: ['magical', 'trap'],
		stealth: {
			dc: 43,
		},
		description: [
			'A {@condition hidden} glyph suddenly lights up and dominates the mind of any creature not bearing the sigil of Kharnas the Angel-Binder.',
		],
		disable: {
			entries: [
				"DC 46 {@skill Thievery} (legendary) to destroy the glyph, DC 42 {@skill Arcana} (master) to harmlessly divert the glyph's power, or dispel magic (7th level; counteract DC 38) to counteract the glyph.",
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['arcane', 'enchantment'],
				trigger:
					"A creature who doesn't bear the sigil of Kharnas attempts to open the door",
				entries: [
					"A surge of the Radiant Spark's latent power courses through the glyph and washes over the triggering creature. If the creature is undead, it takes {@damage 10d10} positive damage. If it's living, it instead regains {@dice 10d10} Hit Points. It then must succeed at a DC 40 Will save or be affected by a 6th-level {@spell dominate} spell. The spell commands the affected creature to attack the nearest creature who doesn't bear the sigil of Kharnas.",
				],
				name: 'Dominate',
			},
		],
		reset: [
			'The glyph can affect two creatures before it deactivates for 5 minutes and automatically resets.',
		],
	},
	{
		name: 'Krooth Summoning Rune',
		source: 'EC2',
		page: 30,
		level: 8,
		traits: ['uncommon', 'complex', 'magical', 'trap'],
		stealth: {
			bonus: 14,
			minProf: 'expert',
		},
		description: [
			'The haze conceals a rune that summons a krooth in front of the door to area B10.',
		],
		disable: {
			entries: [
				'DC 24 {@skill Acrobatics} to approach without triggering the trap followed by DC 26 {@skill Thievery} (expert) to erase the rune, or dispel magic (4th level; counteract DC 24) to counteract the rune.',
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['arcane', 'conjuration', 'summon'],
				trigger:
					"A non-xulgath, non-demon creature that isn't carrying a religious symbol of {@deity Zevgavizeb|EC3} crosses from the north part of the hall to the south part of the hall",
				entries: [
					'The trap summons a krooth (Bestiary 215). The krooth rolls initiative and remains for {@dice 2d6} rounds, after which the spell ends and the krooth disappears. The krooth also disappears if someone disables the trap before the duration expires. Unlike most summoned creatures, the krooth can use 3 actions each round and can use reactions.',
				],
				name: 'Summon Monster',
			},
		],
		reset: ['The trap resets after 24 hours.'],
	},
	{
		name: 'Lava Flume Tube',
		source: 'CRB',
		page: 528,
		level: 10,
		traits: ['complex', 'mechanical', 'trap'],
		stealth: {
			bonus: 19,
			minProf: 'trained',
		},
		description: [
			'Four gated channels carved into stone allow lava to flow into a 15-foot-tall room; the floor can withdraw to allow the hardened lava to fall into a chamber beneath.',
		],
		disable: {
			entries: [
				'{@skill Thievery} DC 29 (expert) to block a channel, or {@skill Thievery} DC 31 (master) to release the floor latch and escape to the chamber below.',
			],
		},
		defenses: {
			ac: {
				std: 30,
			},
			savingThrows: {
				fort: {
					std: 20,
				},
				ref: {
					std: 16,
				},
			},
			hardness: {
				Channel: 12,
				Floor: 18,
			},
			hp: {
				Channel: 48,
				Floor: 72,
				notes: {
					Channel:
						'to destroy a channel gate (this prevents that channel from being disabled and stops the trap from resetting)',
				},
			},
			bt: {
				Channel: 24,
				Floor: 36,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature tries to leave the room.',
				entries: ['The exits seal instantly and the trap rolls initiative.'],
				name: 'Flume Activation',
			},
		],
		routine: [
			'(4 actions) The trap loses 1 action per disabled channel each turn. On each action, a different channel spews lava, dealing {@damage 4d6} fire damage to each creature within 10 feet of the channel (DC 27 basic Reflex save), and increasing the depth of the lava in the room by 1 foot (4 feet per round if all the channels are active)',
			'A creature that starts its turn in lava takes {@damage 8d6} fire damage and is {@condition immobilized} until it {@action Escape||Escapes} the hardening lava (DC 27)',
			"The creature might suffocate if covered in lava (page 478). Lava from the previous round hardens fully at the start of the trap's turn, effectively raising the floor of the room. Once the room is full of lava, the trap stops taking actions, but creatures in the room remain stuck until the floor opens and the trap resets.",
		],
		reset: [
			'The trap deactivates and resets after 1 hour by withdrawing the floor, cracking and dumping the hardened lava (and any creatures trapped inside) into the chamber. Creatures fall 40 feet, taking falling damage (typically 17 bludgeoning damage).',
		],
	},
	{
		name: 'Lesser Dragonstorm',
		source: 'AoA6',
		page: 6,
		level: 20,
		traits: ['rare', 'complex', 'environmental', 'magical'],
		stealth: {
			bonus: 38,
			minProf: 'legendary',
		},
		description: [
			"A small-scale version of a dragonstorm\u2014a churning vortex of wind infused with fire, acid, lightning, poison, and ice\u2014fills {@deity Alseta|LOGM}'s Ring.",
		],
		disable: {
			entries: [
				'{@skill Religion} DC 40 (legendary) to call out to a non-evil deity for direct intervention to disperse the lesser dragonstorm (prayers to {@deity Apsu|LOGM} allow characters who are masters in {@skill Religion} to attempt the check as if they were legendary instead), {@skill Thievery} DC 42 (legendary) to deactivate Vengegate while the manifestation is forcing it open, or a successful {@spell dispel magic} (10th level; DC 40) to counteract the lesser dragonstorm.',
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature attempts to activate Vengegate',
				entries: [
					"The chamber within {@deity Alseta|LOGM}'s Ring fills with a dragonstorm. Creatures within this area take {@dice 10d8} damage, equally split between acid, cold, electricity, fire, and poison.",
				],
				name: 'Manifest Lesser Dragonstorm',
			},
		],
		routine: [
			"(1 action) On its initiative, the lesser dragonstorm reaches out and blasts all creatures within {@deity Alseta|LOGM}'s Ring. Affected creatures take {@dice 10d8} damage (DC 46 basic Reflex save), evenly split between acid, cold, fire, electricity, and poison. Creatures that fail their save are pulled 20 feet toward the center of {@deity Alseta|LOGM}'s Ring (or are knocked {@condition prone} and pulled 30 feet on a critical failure). After 10 rounds, the lesser dragonstorm is destroyed, but a much greater dragonstorm manifests in the surrounding region\u2014see The Dragonstorm on page 7.",
		],
	},
	{
		name: 'Life Magnet',
		source: 'AoE2',
		page: 36,
		level: 7,
		traits: ['complex', 'magical', 'trap'],
		stealth: {
			bonus: 17,
			minProf: 'expert',
		},
		description: [
			'A magical magnet {@condition hidden} behind a panel in the corner of the room pulls not metal but living creatures toward it, heedless of any obstacles in the way.',
		],
		disable: {
			entries: [
				"DC 29 {@skill Thievery} (expert) to deactivate the panel, or dispel magic (4th level; counteract DC 22) to counteract the panel's magic.",
			],
		},
		defenses: {
			ac: {
				std: 28,
			},
			savingThrows: {
				fort: {
					std: 20,
				},
				ref: {
					std: 18,
				},
			},
			hardness: {
				Magnet: 14,
				Bar: 15,
			},
			hp: {
				Magnet: 50,
				Bar: 40,
			},
			bt: {
				Magnet: 25,
				Bar: 20,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger:
					'A creature touches any of the iron bars in this area or touches a creature already affected by the trap',
				entries: [
					'The magical panel {@condition hidden} in the far corner of the chamber (either the western or the eastern corner, depending on which side of the room the creature was closest to when it triggered the trap) "magnetizes" the triggering creature and violently pulls it toward the corner, automatically dealing {@damage 2d10+10} bludgeoning damage to the creature. The trap then rolls initiative if it hasn\'t already done so.',
				],
				name: 'Magnetize the Living',
			},
		],
		routine: [
			'(1 action) The trap pulls up to four creatures that have already triggered its Magnetize the Living ability toward one of the far corners of the room, possibly pressing them into the iron bars. If all the iron bars between an affected creature and the magnetic panel remain intact, the creature takes {@damage 2d10+10} bludgeoning damage with a DC 25 basic Fortitude save and is {@condition restrained} on a failure ({@action Escape} DC 23)',
			'If an iron bar has been {@condition broken}, the creature takes {@damage 1d10+5} bludgeoning damage instead, and if two consecutive bars have been {@condition broken} the creature takes no damage (but might still be {@condition restrained} on a failed save).',
		],
		reset: [
			'The trap deactivates and resets 1 minute after there are no creatures touching the iron bars.',
		],
	},
	{
		name: 'Lifeleech Crystal Patch',
		source: 'AoA4',
		page: 9,
		level: 11,
		traits: ['environmental', 'magical'],
		stealth: {
			dc: 30,
			minProf: 'expert',
			notes: 'or {@spell detect magic} to note the presence of necromantic energies suffusing the crystals.',
		},
		description: [
			'Sharp, bloodthirsty crystals make walking through this chamber treacherous.',
		],
		disable: {
			entries: [
				"{@skill Religion} DC 30 (expert) to utter prayers that quell the crystals' necromantic compulsion to drink blood",
			],
		},
		defenses: {
			ac: {
				std: 31,
			},
			savingThrows: {
				fort: {
					std: 24,
				},
				ref: {
					std: 12,
				},
			},
			hardness: {
				std: 20,
			},
			hp: {
				std: 80,
			},
			bt: {
				std: 40,
			},
			immunities: [
				'critical hits (except bludgeoning or sonic)',
				'object immunities',
				'precision damage',
			],
			weaknesses: [
				{
					amount: 10,
					name: 'sonic',
				},
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature with blood moves through a patch of lifeleech crystals.',
				entries: [
					'The crystals twist and slash, animating and cutting into the creature as it walks, dealing {@damage 5d8} slashing damage. The creature must attempt a DC 28 Reflex saving throw.',
					{
						type: 'successDegree',
						entries: {
							'Critical Success': 'The creature is unaffected.',
							Success:
								'The creature takes full damage and is {@condition drained|CRB|drained 1}.',
							Failure:
								'The creature takes double damage and is {@condition drained|CRB|drained 2}.',
							'Critical Failure':
								"As failure, plus the creature's blood causes fresh growth. A new 10-foot-square patch of lifeleech crystals grows in an adjacent space to the current patch of crystals.",
						},
					},
				],
				name: 'Slice Legs',
			},
		],
	},
	{
		name: 'Living Paints',
		source: 'AoE6',
		page: 32,
		level: 19,
		traits: ['transmutation', 'magical', 'trap'],
		stealth: {
			dc: 41,
			notes: '(Master)',
		},
		description: ['A mass of brushes use magical paint to convert creatures into art.'],
		disable: {
			entries: [
				'DC 41 {@skill Crafting} (master) to mix the paints into bland, useless colors, DC 46 {@skill Thievery} (legendary) to dismantle the animated brushes, or dispel magic (8th level; counteract DC 41) to counteract the magic within the paint.',
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['arcane', 'transmutation'],
				trigger:
					'A creature steps into the same space as the paints (the square marked with a "T" on the map on page 26)',
				entries: [
					"The brushes animate and attempt to paint all creatures within 30 feet. The creatures must succeed at a DC 41 Reflex save to avoid the brushes and splashes from paint cans or be converted into living artwork for 1 hour. A creature that becomes living artwork is immediately bound to the nearest flat surface of its size or larger within 30 feet. The creature can move only along flat surfaces such as floors and walls. This allows it to end its movement wrapped around corners when on a continuous surface. While bound to a surface, the creature can attack from its space as normal, including against other creatures bound to the same surface. If the surface it's on is destroyed (such as a portrait hit by a {@spell fireball} spell or a wall being demolished), the creature takes {@dice 10d6} damage and is shunted to the nearest flat surface. If there is no flat surface within 5 feet, the creature is destroyed.",
				],
				name: 'Capture Subject',
			},
		],
	},
	{
		name: 'Luminous Ward',
		source: 'AoA5',
		page: 58,
		level: 18,
		traits: ['magical', 'trap'],
		stealth: {
			dc: 40,
			minProf: 'master',
		},
		description: ['A burst of radiance explodes from the door.'],
		disable: {
			entries: [
				'{@skill Thievery} DC 40 (master) to disable the wards or dispel magic (9th level; counteract DC 38) to counteract the ward',
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['fire', 'light'],
				trigger: 'A creature touches the door',
				entries: [
					'All creatures within 20 feet of the door are scorched with brilliant light, taking {@damage 20d6} fire damage (DC 40 basic Reflex save). A creature that fails this save is {@condition blinded} for 1 hour (or permanently on a critical failure).',
				],
				name: 'Radiant Explosion',
			},
		],
		reset: ['The trap resets after 1 hour.'],
	},
	{
		name: 'Magic Starknives Trap',
		source: 'TiO',
		page: 28,
		level: 5,
		traits: ['complex', 'magical', 'trap'],
		stealth: {
			dc: 22,
			notes: '{@skill Perception} check to spot the magical energies reverberating in the pillars',
		},
		description: ['Starknife symbols on the six pillars glow and shoot across the room.'],
		disable: {
			entries: [
				'DC 21 {@skill Thievery} (expert) or {@spell dispel magic} on any four of the six pillars disables the entire trap (the trap is a 2nd-level spell and the DC to dispel it is 21). Destroying any four of the six pillars also disables the trap.',
			],
		},
		defenses: {
			ac: {
				std: 22,
			},
			savingThrows: {
				fort: {
					std: 15,
				},
				ref: {
					std: 9,
				},
			},
			hardness: {
				Pillar: 12,
			},
			hp: {
				Pillar: 14,
			},
			bt: {
				Pillar: 7,
			},
			immunities: ['critical hits', 'sneak attack'],
		},
		actions: [
			{
				name: 'Starknife Attack',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['arcane', 'evocation'],
				entries: [
					'If a creature passes the middle pair of pillars, both doors leading out of the room slam shut and lock; while the trap is active, the doors must be battered open with a successful DC 23 {@skill Athletics} check or sufficient damage (Hardness 12; HP 48 [BT 24]). One of the starknife carvings glows with light, detaches from the pillar, and then flies outward, making a magical starknife Ranged {@action Strike} against a random creature within range. The trap then rolls initiative with its {@skill Stealth} modifier of +12.',
				],
			},
		],
		routine: [
			'(3 actions) For each of its actions on its turn, a carving on a different pillar glows and makes a magical starknife Ranged Strike against a random creature within range. Creatures might have cover from this Strike, such as from one of the pillars in the room.',
			{
				type: 'attack',
				range: 'Ranged',
				name: 'magical starknife',
				attack: 15,
				traits: ['agile', 'deadly <1d6>', 'magical', 'range <40 feet>'],
				damage: '{@damage 1d4+3} force',
				types: ['force'],
			},
		],
		reset: [
			'The trap deactivates 1 round after it has no target creatures and resets each day at sundown.',
		],
	},
	{
		name: 'Malevolant Mannequins',
		source: 'G&G',
		page: 81,
		level: 14,
		traits: ['uncommon', 'clockwork', 'complex', 'haunt', 'mechanical'],
		stealth: {
			bonus: 27,
		},
		description: [
			'A host of violent spirits possess three clockwork mannequins, and each lashes out at any creatures that dare walk near',
		],
		disable: {
			entries: [
				"DC 37 {@skill Thievery} (master) to jam a mannequin's clockwork mechanisms or {@skill Religion} DC 35 (expert) twice to exorcise a spirit from a mannequin.",
			],
		},
		defenses: {
			ac: {
				std: 35,
			},
			savingThrows: {
				fort: {
					std: 26,
				},
				ref: {
					std: 28,
				},
			},
			hardness: {
				std: 10,
			},
			hp: {
				std: 70,
				notes: {
					std: 'per mannequin',
				},
			},
			bt: {
				std: 35,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
			weaknesses: [
				{
					amount: 20,
					name: 'electricity',
				},
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature comes within 30 feet of a mannequin',
				entries: [
					'The mannequins all lurch towards the triggering creature, {@action Stride||Striding} up to 50 feet, then roll initiative.',
				],
				name: 'Awaken',
			},
		],
		routine: [
			"(9 actions) Each of the mannequins uses three of the haunt's actions on each turn, and the haunt loses three actions each turn for every disabled or destroyed mannequin. Each mannequin uses its first action to {@action Stride} up to 50 feet and its remaining two actions to make clockwork fist {@action Strike||Strikes}. Each has its own separate multiple attack penalty.",
			{
				type: 'attack',
				range: 'Melee',
				name: 'clockwork first',
				attack: 29,
				damage: '{@damage 2d10+18} bludgeoning',
			},
		],
		reset: [
			'The haunt deactivates after it has no target creatures and resets, usually over the course of 1 round, as the mannequins move to their original positions. If a mannequin is more than 150 feet from its original position, the haunt takes longer to reset, as the mannequin moves back 150 feet each round.',
		],
	},
	{
		name: "Masks Of Aroden's Guises",
		source: 'EC2',
		page: 37,
		level: 10,
		traits: ['rare', 'complex', 'magical', 'trap'],
		stealth: {
			bonus: 20,
			minProf: 'expert',
		},
		description: ['Ten masks adorn twelve stone statues.'],
		disable: {
			entries: [
				'DC 29 {@skill Religion} (expert) or {@skill Occultism} or DC 31 Thievery (expert) to dismiss the magic on a single statue.',
				'Replacing the two missing masks (a mask made of or incorporating coins on the merchant statue and a mask made of any valuable fabric on the tailor statue) and succeeding at a DC 27 {@skill Religion} check disarms the trap.',
				'AC 30; Fort +20, Ref +16 Statue Hardness 18; Statue HP 48 (BT 24); Immunities critical hits, object immunities, precision damage.',
			],
		},
		defenses: {
			ac: {
				std: 30,
			},
			fort: {
				default: 20,
			},
			ref: {
				default: 16,
			},
			hardness: {
				std: 18,
			},
			hp: {
				std: 48,
				notes: {
					std: 'per statue',
				},
			},
			bt: {
				std: 24,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['occult'],
				trigger: 'A creature removes the mask from a statue',
				entries: [
					'The trap casts phantasmal killer (DC 27) against the creature, creating an image of the statue lunging forth. The trap then rolls initiative.',
				],
				name: 'Unmasked Statues',
			},
		],
		routine: [
			"{@as 3} An unmasked statue casts phantasmal killer (DC 27) against a target in the room for each of the trap's actions, creating an image of the statue lunging forth. It doesn't affect the same creature more than once; if there are fewer targets than it has actions, the trap doesn't use its remaining actions. Unmasking an additional statue increases the hazard's actions by 1, and replacing a mask reduces its actions by 1.",
		],
		reset: ['The trap deactivates and resets 1 minute after it has no target creatures.'],
	},
	{
		name: 'Maze Of Mirrors',
		source: 'EC2',
		page: 56,
		level: 9,
		traits: ['rare', 'complex', 'magical', 'mechanical', 'trap'],
		stealth: {
			bonus: 18,
			minProf: 'trained',
			notes: 'to detect the magical runes in the maze; noticing the maze itself has a DC of 0.',
		},
		description: [
			'{@condition Invisible} runes in the maze disorient those within it and cause its mirrored walls to shift about.',
		],
		disable: {
			entries: [
				"DC 26 {@skill Thievery} (expert) or dispel magic (5th level; counteract DC 28) to stop the mirrors' shuffling; DC 28.",
			],
		},
		actions: [
			{
				traits: ['expert'],
				entries: [
					'to dispel the minotaur AC 28; Fort +29, Ref +14 Hardness 18; HP 64 (BT 32); Immunities critical hits, object immunities, precision damage.',
				],
				name: 'Occultism or Religion',
			},
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature enters the maze',
				entries: [
					"Creatures in the maze can't escape it except by use of teleportation magic or as described in Trapped in the.",
				],
				name: 'The Maze Awakens',
			},
			{
				entries: ['The trap rolls initiative.'],
				name: 'Maze.',
			},
			{
				entries: [
					'Once each turn after it has taken a move action within the maze, each target in the maze can spend 1 action to attempt a DC 26 {@skill Perception} or {@skill Survival} check to escape it. A group traveling the maze together is treated as a single target; no more than one creature in the group can attempt this check each round, but accompanying creatures can {@action Aid} this check.',
					'The possible outcomes follow. A target attempting to leave the maze the same way it entered uses the outcome for one degree of success better than the result of its roll when attempting this check (failure to success, for example).',
					{
						type: 'successDegree',
						entries: {
							'Critical Success': 'The target escapes the maze.',
							Success:
								'The target is on the right path to the exit. If the target was already on the right path, it escapes the maze.',
							Failure: 'The target makes no progress toward escape.',
							'Critical Failure':
								'The target makes no progress toward escape, and if it was on the right path, it no longer is.',
						},
					},
				],
				name: 'Trapped in the Maze',
			},
		],
		routine: [
			'{@as 3} The trap uses its first action to magically shuffle the mirrors, rendering markings or maps of the maze ineffective. Creatures in the maze that fail a DC 26 Will save are {@condition stupefied|CRB|stupefied 1} until they leave the maze.',
			"If the target fails additional saves against this ability, the condition value increases by 1 (to a maximum of {@condition stupefied|CRB|stupefied 4}). For its second action, the trap's ghostly minotaur attacks a random creature in the maze with its spectral gore. For its third action, the trap makes another spectral gore attack against a random creature.",
			{
				type: 'attack',
				range: 'Melee',
				name: 'spectral gore',
				attack: 21,
				damage: '{@damage 2d8+8} mental',
				types: ['mental'],
				noMAP: true,
			},
		],
		reset: [
			'The trap deactivates and resets if 1 minute passes without any creature in the maze.',
		],
	},
	{
		name: 'Mental Scream Trap',
		source: 'AoA5',
		page: 56,
		level: 19,
		traits: ['magical', 'trap'],
		stealth: {
			dc: 43,
			minProf: 'master',
		},
		description: ['A psychic scream disorients creatures in the area.'],
		disable: {
			entries: [
				'{@skill Arcana} (DC 41) to suppress the magic or {@skill Thievery} (DC 41) to scratch out the ward',
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['arcane', 'enchantment', 'incapacitation', 'mental'],
				trigger: 'A creature enters the marked area',
				entries: [
					'A psychic wail affects all creatures within 10 feet of the marked area, requiring them to attempt a DC 41 Will save.',
					{
						type: 'successDegree',
						entries: {
							'Critical Success': 'The target is unaffected.',
							Success: 'The target is {@condition stunned|CRB|stunned 2}.',
							Failure:
								'The target is {@condition paralyzed} for 1 round, then {@condition stunned|CRB|stunned 2} when the paralysis ends.',
							'Critical Failure':
								'The target is {@condition paralyzed} for 4 rounds. At the end of each of its turns, it can attempt a new Will save to reduce the remaining duration by 1 round, or end it entirely on a critical success.',
						},
					},
				],
				name: 'Psychic Screech',
			},
		],
	},
	{
		name: "Mogaru's Breath",
		source: 'FRP2',
		page: 89,
		level: 21,
		traits: ['environmental', 'evocation', 'fire', 'kaiju', 'primal'],
		stealth: {
			dc: 10,
		},
		description: [
			'Mogaru exhales a blast of intense flames to eradicate any meddlesome pests in the area.',
		],
		disable: {
			entries: ['DC 50 {@skill Performance} (legendary)'],
		},
		actions: [
			{
				entries: [
					"53 {@skill Deception} (legendary) to momentarily divert Mogaru's attention.",
				],
				name: 'or DC',
			},
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger:
					'A creature takes a {@condition hostile} action against Mogaru, produces a visible area effect, or flies within 120 feet of Mogaru',
				entries: [
					'Mogaru breathes a 120-foot cone of fire toward the object of his ire. Flammable objects in the area immediately combust, and stone or metal surfaces warp into {@quickref difficult terrain||3|terrain}. Creatures in the area take {@damage 20d6} fire damage (DC 44 basic Reflex save). On a failed or critically failed save, a creature also takes {@damage 3d6} {@condition persistent damage||persistent fire damage}.',
				],
				name: 'Volcanic Breath',
			},
		],
		reset: ['Mogaru must wait {@dice 1d4} rounds before letting loose another gout of fire.'],
	},
	{
		name: 'Mukradi Summoning Runes',
		source: 'EC4',
		page: 35,
		level: 15,
		traits: ['uncommon', 'complex', 'magical', 'trap'],
		stealth: {
			bonus: 25,
			minProf: 'master',
			notes: 'to notice runes marked on the floor.',
		},
		description: [
			'Barely visible runes are etched into the stone floor in a 20-foot diameter circle.',
		],
		disable: {
			entries: [
				'DC 36 {@skill Acrobatics} to approach without triggering the trap followed by DC 34 {@skill Occultism} (expert) or DC 38 Thievery(master) to erase the rune, or dispel magic (8th level; counteract DC 34) to counteract the rune..',
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['conjuration', 'occult', 'summon'],
				trigger:
					'A creature enters the circle without uttering the passphrase, "Praise to the Water Lizard"',
				entries: [
					'The trap summons a mukradi (Bestiary 239). The mukradi rolls initiative and remains for 1 minute, after which the spell ends and the mukradi disappears. The mukradi also disappears if someone disables the trap before the duration expires. The mukradi can use 3 actions each round and can use reactions, unlike most summoned creatures.',
				],
				name: 'Summon Monster',
			},
		],
		reset: ['The trap resets at the first high tide of each day.'],
	},
	{
		name: 'Needling Stairs',
		source: 'AoE3',
		page: 19,
		level: 11,
		traits: ['complex', 'mechanical', 'trap'],
		stealth: {
			bonus: 20,
			minProf: 'expert',
		},
		description: [
			'This staircase has springs in each step, which send poisoned needles shooting up through tiny holes in the wood when stepped on. Each step, 6 in total, takes up one 5-foot square.',
		],
		disable: {
			entries: [
				'DC 33 {@skill Thievery} (master) on each stair to disable its spring, or deactivate the switch in area C8 to deactivate the whole trap. Cutting the wire on the topmost stair (DC 35 to the Device) that connects the staircase to the control switch prevents the control switch from turning the trap on or off.',
			],
		},
		defenses: {
			ac: {
				std: 28,
			},
			savingThrows: {
				fort: {
					std: 22,
				},
				ref: {
					std: 19,
				},
			},
			hardness: {
				std: 8,
			},
			hp: {
				std: 25,
				notes: {
					std: 'to break the spring under the step and make that step safe to stand on',
				},
			},
			bt: {
				std: 12,
			},
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature ends its movement on one of the stairs',
				entries: [
					'The trap makes a poisoned needle {@action Strike} against the triggering creature, then rolls initiative.',
				],
				name: 'First Step',
			},
		],
		routine: [
			"(1 action) The trap makes a separate poisoned needle {@action Strike} against each creature currently on an active step as 1 action. Because it is constantly jabbing needles up through any weight-bearing steps, the trap can also use its Bloody Feet free action (see below) to jab at a creature on one of the steps during that creature's turn.",
			{
				type: 'attack',
				range: 'Melee',
				name: 'poisoned needle',
				attack: 24,
				damage: '{@damage 2d6+8} piercing plus {@damage 1d6} {@condition persistent damage||persistent bleed} and {@damage 4d6} {@condition persistent damage||persistent poison}',
				types: ['persistent', 'piercing'],
				noMAP: true,
			},
			{
				activity: {
					number: 1,
					unit: 'free',
				},
				trigger: 'A creature moves onto an active step',
				entries: [
					'The trap makes a poisoned needle {@action Strike} against the triggering creature.',
				],
				type: 'ability',
				name: 'Bloody Feet',
			},
		],
		reset: [
			'If deactivated via the switch, the trap can be reactivated with the switch in area C8.',
		],
	},
	{
		name: 'Nightmare Terrain',
		source: 'TiO',
		page: 41,
		level: 6,
		traits: ['complex', 'magical', 'trap'],
		stealth: {
			dc: 22,
			notes: '{@skill Perception} to detect the subtle magical aura of the land',
		},
		description: [
			'What seems like an innocent stretch of land assaults trespassers with terrible illusions.',
		],
		disable: {
			entries: [
				'{@skill Arcana}, {@skill Nature}, {@skill Occultism}, or {@skill Religion} DC 22 (by a hero with expert proficiency in that skill) three times to temporarily disrupt the magic, or {@spell dispel magic} (3rd-level spell, DC 25)',
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['illusion', 'mental', 'occult'],
				entries: [
					'If a creature that can see moves 10 feet into the affected area, the hazard rolls {@skill Stealth} (+16) for its initiative.',
				],
				name: 'Step into Nightmares',
			},
		],
		routine: [
			'(1 action) Terrible visions assail the minds of all creatures who can see within the affected area. Each creature must attempt a DC 24 Will saving throw.',
			{
				type: 'successDegree',
				entries: {
					'Critical Success': 'The creature is unaffected.',
					Success: 'The creature is {@condition frightened|CRB|frightened 2}.',
					Failure:
						'The creature takes {@damage 2d8+9} mental damage and is {@condition frightened|CRB|frightened 3}.',
					'Critical Failure':
						'The creature takes {@damage 4d8+18} mental damage and is {@condition frightened|CRB|frightened 4}.',
				},
			},
		],
		reset: [
			'The terrible visions cease after all creatures have left the affected area, but the hazard is immediately ready to inflict its visions on the next creature to enter.',
		],
	},
	{
		name: 'Painful Suggestion Trap',
		source: 'AV2',
		page: 54,
		level: 8,
		traits: ['magical', 'trap'],
		stealth: {
			dc: 26,
			minProf: 'expert',
		},
		description: [
			'A {@condition hidden} rune on the floor under the filth, just past the threshold, triggers an ersatz ghost.',
		],
		disable: {
			entries: [
				'DC 28 {@skill Thievery} (expert) to remove the rune without triggering it, or dispel magic (4th level; counteract DC 26) to dispel the rune.',
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['auditory', 'enchantment', 'incapacitation', 'linguistic', 'mental'],
				trigger: 'A living creature moves over the rune',
				entries: [
					'A frightful moan echoes through the room, and a hoarse telepathic voice shouts, "Get out!" This shout deals {@damage 6d12} mental damage to creatures in the room (DC 26 basic Will save). Creatures who fail this saving throw must immediately leave the room and can\'t willingly reenter it for 1 minute (1 hour on a critical failure).',
				],
				name: 'Counterfeit Haunting',
			},
		],
		reset: ['The trap automatically resets after 1 hour.'],
	},
	{
		name: 'Paralyzing Light Trap',
		source: 'AV2',
		page: 52,
		level: 8,
		traits: ['complex', 'magical', 'trap'],
		stealth: {
			dc: 18,
			minProf: 'expert',
		},
		description: [
			'When any creature other than a devil enters the light, the magic interwoven in the light holds the creature in place and rings an alarm.',
		],
		disable: {
			entries: [
				'DC 26 {@skill Thievery} (master) to distort or diffuse the light, keeping the light cone intact but preventing the trap from triggering, or dispel magic (4th level; counteract DC 26) to dispel the light, leaving the room in darkness.',
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['enchantment', 'incapacitation', 'mental', 'occult'],
				trigger: 'A non-devil creature moves into the light',
				entries: [
					'The light expands to fill the room, and each nondevil creature within the room must attempt a DC 26 Will save. A high-pitched chime sounds in the barracks (area D15), audible in this room as well. The trap then rolls initiative.',
					{
						type: 'successDegree',
						entries: {
							'Critical Success': 'The target is unaffected.',
							Success: 'The target is {@condition stunned|CRB|stunned 2}.',
							Failure: 'The target is {@condition paralyzed} for 1 round.',
							'Critical Failure':
								'The target is {@condition stupefied|CRB|stupefied 2} for {@dice 1d4} rounds and {@condition paralyzed} for 1 round.',
						},
					},
				],
				name: 'Stasis Field',
			},
		],
		routine: [
			'(1 action) All {@condition stunned} and {@condition paralyzed} creatures in the room take {@damage 1d10} mental damage (DC 26 basic Will save). Creatures who fail also become {@condition paralyzed} for 1 round but can use a reaction to mentally fight off this stasis; creatures who do so take {@damage 5d10} mental damage but are no longer {@condition paralyzed}.',
		],
		reset: [
			'The stasis magic in the light builds up over the course of an hour, after which the trap can trigger again.',
		],
	},
	{
		name: 'Phantom Bells',
		source: 'AoA3',
		page: 28,
		level: 6,
		traits: ['rare', 'auditory', 'complex', 'haunt', 'sonic'],
		stealth: {
			bonus: 10,
		},
		description: ['The echo of diabolic bells reverberates with a bone-shaking clamor.'],
		disable: {
			entries: [
				'{@skill Religion} DC 27 (expert) to break the curse with recitations against the power of Hell (2 actions), or {@skill Performance} DC 22 (expert) to {@action Perform} an opposing composition.',
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['auditory', 'sonic'],
				trigger: 'A living creature approaches within 30 feet.',
				entries: [
					'Sounds of creaking metal fill the area as the phantom bells begin to swing and the haunt rolls initiative.',
				],
				name: 'Distant Ringing',
			},
		],
		routine: [
			'(1 action) The bells toll, dealing {@damage 4d6} sonic damage to each living creature within 30 feet (DC 24 basic Fortitude save).',
		],
		reset: ['The bells cease ringing if there are no living creatures within 30 feet.'],
	},
	{
		name: "Pharaoh's Ward",
		source: 'CRB',
		page: 524,
		level: 7,
		traits: ['magical', 'trap'],
		stealth: {
			dc: 25,
			minProf: 'expert',
		},
		description: ["A curse is imbued on an entryway's threshold."],
		disable: {
			entries: [
				'{@skill Thievery} DC 27 (master) to painstakingly remove the lintel without triggering the magic, or dispel magic (4th level; counteract DC 25) to counteract the rune.',
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['curse', 'divine', 'necromancy'],
				trigger: 'The seal on the tomb is {@condition broken} from the outside.',
				entries: [
					"Each living creature within 60 feet must succeed at a DC 23 Will save or be subjected to the pharaoh's curse. A cursed creature takes a \u20132 status penalty to Fortitude saves, and any natural or magical healing it receives is halved. The curse remains until removed by {@spell remove curse|CRB} or similar magic.",
				],
				name: 'Curse the Intruders',
			},
		],
		reset: ['The trap resets when the door is shut.'],
	},
	{
		name: 'Planar Rift',
		source: 'CRB',
		page: 525,
		level: 13,
		traits: ['magical', 'trap'],
		stealth: {
			dc: 35,
			minProf: 'trained',
		},
		description: [
			'A rift attempts to draw creatures into another plane (the GM chooses the specific plane).',
		],
		disable: {
			entries: [
				'{@skill Thievery} DC 33 (master) to assemble a rift seal using objects strongly grounded to your plane, or dispel magic (7th level; counteract DC 31) to counteract the rift.',
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['conjuration', 'occult', 'teleportation'],
				trigger: 'A creature moves within 10 feet of the rift.',
				entries: [
					'The triggering creature and all creatures within 30 feet of the rift are drawn into another plane. Each creature can attempt a DC 33 Reflex save to avoid this fate.',
				],
				name: 'Into the Great Beyond',
			},
		],
	},
	{
		name: 'Plunger Chute',
		source: 'AoE1',
		page: 58,
		level: 3,
		traits: ['mechanical', 'trap'],
		stealth: {
			dc: 22,
			minProf: 'expert',
		},
		description: [
			'A trapdoor in the floor conceals a {@condition hidden} chute, and a moving section of wall shoves victims into it.',
		],
		disable: {
			entries: [
				'DC 23 {@skill Thievery} (expert) to jam the trapdoor shut or activate a {@condition hidden} bypass switch by twisting a fitting on the gas lamp.',
			],
		},
		defenses: {
			ac: {
				std: 22,
			},
			savingThrows: {
				fort: {
					std: 14,
				},
				ref: {
					std: 8,
				},
			},
			hardness: {
				Trapdoor: 10,
			},
			hp: {
				Trapdoor: 40,
			},
			bt: {
				Trapdoor: 20,
			},
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature walks onto the trapdoor',
				entries: [
					"Anyone within 10 feet of the room's northern wall falls 40 feet down the shaft to area E33, taking 20 bludgeoning damage and landing {@condition prone} in the ochre jelly's pit. The victims can {@action Grab an Edge} to avoid falling. The DC to {@action Grab an Edge} is 20; the DC to {@action Climb} the walls is 22.",
				],
				name: 'Pitfall and Plunger',
			},
		],
	},
	{
		name: 'Poisoned Dart Gallery',
		source: 'CRB',
		page: 528,
		level: 8,
		traits: ['complex', 'mechanical', 'trap'],
		stealth: {
			bonus: 16,
			minProf: 'expert',
			notes: 'or DC 31 (master) to notice the control panel.',
		},
		description: [
			'Countless holes to launch poison darts from line a long hallway with a hidden control panel on the far end.',
		],
		disable: {
			entries: [
				'{@skill Thievery} DC 21 (expert) on the control panel deactivates the trap.',
			],
		},
		defenses: {
			ac: {
				std: 27,
			},
			savingThrows: {
				fort: {
					std: 13,
				},
				ref: {
					std: 17,
				},
			},
			hardness: {
				std: 14,
			},
			hp: {
				std: 56,
				notes: {
					std: 'to destroy the control panel and disable the trap',
				},
			},
			bt: {
				std: 28,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['attack'],
				trigger: 'A creature enters the hallway or ends its turn in the hallway.',
				entries: [
					'The trap makes a poisoned dart {@action Strike} against the triggering creature, then rolls initiative.',
				],
				name: 'Dart Volley',
			},
		],
		routine: [
			"(1 action) The trap launches one dart against every creature in the gallery as 1 action. Because it launches darts continuously, the trap can also use the Continuous Barrage free action (see below) to launch darts at each creature during that creature's turn.",
			{
				type: 'attack',
				range: 'Ranged',
				name: 'poisoned dart',
				attack: 21,
				effects: ['flesset poison'],
				damage: '{@damage 3d4} piercing plus flesset poison',
				types: ['piercing'],
				noMAP: true,
			},
			{
				activity: {
					number: 1,
					unit: 'free',
				},
				trigger: 'A creature within the active gallery finishes an action.',
				entries: [
					'The trap makes a poisoned dart {@action Strike} against the triggering creature.',
				],
				name: 'Continuous Barrage',
			},
			{
				type: 'affliction',
				name: 'Flesset Poison',
				traits: ['poison'],
				DC: 22,
				savingThrow: 'Fortitude',
				maxDuration: '6 rounds',
				stages: [
					{
						stage: 1,
						entry: '{@damage 1d6} poison damage and {@condition clumsy 1}',
						duration: '1 round',
					},
					{
						stage: 2,
						entry: '{@damage 2d6} poison damage and {@condition clumsy 2}',
						duration: '1 round',
					},
					{
						stage: 3,
						entry: '{@damage 3d6} poison damage and {@condition clumsy 3}',
						duration: '1 round',
					},
				],
			},
		],
		reset: ['The trap deactivates and resets after 1 minute.'],
	},
	{
		name: 'Poisoned Dart Statues',
		source: 'AoE4',
		page: 30,
		level: 14,
		traits: ['complex', 'mechanical', 'trap'],
		stealth: {
			bonus: 24,
			minProf: 'expert',
			notes: 'or DC 39 (master) to notice the control panel. Anyone specifically searching the name plate of Abresha Tallow-Hands locates the control panel automatically.',
		},
		description: [
			'Countless poison darts fire from holes in the statues and walls of this hall.',
		],
		disable: {
			entries: [
				'DC 34 {@skill Thievery} (master) on the control panel deactivates the trap.',
			],
		},
		defenses: {
			ac: {
				std: 34,
			},
			savingThrows: {
				fort: {
					std: 20,
				},
				ref: {
					std: 25,
				},
			},
		},
		actions: [
			{
				entries: [
					'24; Control Panel HP 96 (BT 48); Immunities critical hits, object immunities, precision damage.',
				],
				name: 'Control Panel Hardness',
			},
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger:
					'A creature makes noise in the hall, which can be avoided with a successful DC 28',
				entries: [
					'{@skill Stealth} check; The trap makes a poisoned dart {@action Strike} against the triggering creature, then rolls initiative.',
				],
				name: 'Dart Volley',
			},
		],
		routine: [
			'(1 action) The trap launches one dart against every creature in the hall as 1 action. Because it launches darts continuously, the trap can also use the.',
			{
				entries: [
					"Barrage free action (see below) to launch darts at each creature during that creature's turn. The trap doesn't take a multiple attack penalty.",
				],
				type: 'ability',
				name: 'Continuous',
			},
			{
				type: 'attack',
				range: 'Ranged',
				name: 'poisoned dart',
				attack: 28,
				effects: ['terinav root poison'],
				damage: '{@damage 4d4} piercing plus terinav root poison',
				types: ['piercing'],
				noMAP: true,
			},
			{
				activity: {
					number: 1,
					unit: 'free',
				},
				trigger:
					'A creature within the hallway finishes an action while the trap is active',
				entries: [
					'The trap makes a poisoned dart {@action Strike} against the triggering creature.',
				],
				type: 'ability',
				name: 'Continuous Barrage',
			},
			{
				traits: ['poison'],
				entries: ['Saving Throw DC 28.'],
				type: 'ability',
				name: 'Terinav Root Poison',
			},
			{
				entries: [
					'6 rounds; Stage 1 {@damage 4d6} poison damage and {@condition clumsy|CRB|clumsy 2} (1 round); Stage 2 {@damage 5d6} poison damage, {@condition clumsy|CRB|clumsy 2}, and \u20135-foot status penalty to all Speeds (1 round); Stage 3 {@damage 7d6} poison damage, {@condition clumsy|CRB|clumsy 2}, and \u201310-foot status penalty to all Speeds (1 round)',
				],
				type: 'ability',
				name: 'Fortitude; Maximum Duration',
			},
		],
		reset: ['The trap deactivates and resets after 1 minute.'],
	},
	{
		name: 'Poisoned Lock',
		source: 'CRB',
		page: 523,
		level: 1,
		traits: ['mechanical', 'trap'],
		stealth: {
			dc: 17,
			minProf: 'trained',
		},
		description: [
			'A spring-loaded, poisoned spine is {@condition hidden} near the keyhole of a lock. Disabling or breaking the trap does not disable or break the lock.',
		],
		disable: {
			entries: ['{@skill Thievery} DC 17 (trained) on the spring mechanism.'],
		},
		defenses: {
			ac: {
				std: 15,
			},
			savingThrows: {
				fort: {
					std: 8,
				},
				ref: {
					std: 4,
				},
			},
			hardness: {
				std: 6,
			},
			hp: {
				std: 24,
			},
			bt: {
				std: 12,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['attack'],
				trigger: 'A creature tries to unlock or {@action pick a lock||Pick the Lock}',
				entries: ['A spine extends to attack the triggering creature.'],
				name: 'Spring',
			},
			{
				type: 'affliction',
				name: 'Cladis Poison',
				traits: ['poison'],
				DC: 19,
				savingThrow: 'Fortitude',
				maxDuration: '4 hours',
				stages: [
					{
						stage: 1,
						entry: '{@damage 1d6} poison damage and {@condition drained 1}',
						duration: '1 hour',
					},
					{
						stage: 2,
						entry: '{@damage 2d6} poison damage and {@condition drained 2}',
						duration: '1 hour',
					},
					{
						stage: 3,
						entry: '{@damage 3d6} poison damage and {@condition drained 2}',
						duration: '1 hour',
					},
				],
			},
		],
		attacks: [
			{
				range: 'Melee',
				name: 'spine',
				attack: 13,
				effects: ['cladis poison'],
				damage: '1 piercing plus cladis poison',
				types: ['piercing'],
				noMAP: true,
			},
		],
	},
	{
		name: 'Poisoned Lock',
		source: 'FoP',
		page: 19,
		level: 1,
		traits: ['mechanical', 'trap'],
		stealth: {
			dc: 17,
			minProf: 'trained',
		},
		description: [
			'A spring-loaded, poisoned spine is {@condition hidden} near the keyhole of a lock.',
		],
		disable: {
			entries: ['{@skill Thievery} DC 17 (trained) on the spring mechanism.'],
		},
		defenses: {
			ac: {
				std: 15,
			},
			savingThrows: {
				fort: {
					std: 8,
				},
				ref: {
					std: 4,
				},
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['attack'],
				trigger: 'A creature attempts to unlock or {@action Pick a Lock||pick the lock}.',
				entries: ['A spine springs out and attacks the triggering creature.'],
				name: 'Spring Dart',
			},
			{
				type: 'affliction',
				name: 'Cladis Poison',
				traits: ['poison'],
				DC: 19,
				savingThrow: 'Fortitude',
				maxDuration: '4 hours',
				stages: [
					{
						stage: 1,
						entry: '{@damage 1d6} poison damage and {@condition drained|CRB|drained 1}',
						duration: '1 hour',
					},
					{
						stage: 2,
						entry: '{@damage 2d6} poison damage and {@condition drained|CRB|drained 2}',
						duration: '1 hour',
					},
					{
						stage: 3,
						entry: '{@damage 3d6} poison damage and {@condition drained|CRB|drained 2}',
						duration: '1 hour',
					},
				],
			},
		],
		attacks: [
			{
				range: 'Melee',
				name: 'spine',
				attack: 13,
				effects: ['cladis poison'],
				damage: '1 piercing plus cladis poison',
				types: ['piercing'],
				noMAP: true,
			},
		],
	},
	{
		name: 'Poisoned Secret Door Trap',
		source: 'EC4',
		page: 36,
		level: 14,
		traits: ['magical', 'mechanical', 'trap'],
		stealth: {
			dc: 34,
			minProf: 'master',
		},
		description: [
			'Multiple tiny needles filled with poison are embedded in this secret door, spring-loaded to pop out.',
		],
		disable: {
			entries: ['DC 34 {@skill Thievery} (expert) to break the mechanism,'],
		},
		actions: [
			{
				entries: [
					'39 {@skill Perception} (master) to identify the three stones that, when pressed, prevent the trap from triggering AC 36; Fort +28, Ref +19 Hardness 23; HP 92 (BT 46); Immunities critical hits, object immunities, precision damage.',
				],
				name: 'or DC',
			},
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['attack'],
				trigger:
					"A creature tries to open the door, whether or not it is still locked, without first depressing three specific stones on the door's surface",
				entries: ['Needles pop out of the door at the triggering creature.'],
				name: 'Spring',
			},
			{
				traits: ['poison'],
				entries: ['Saving Throw DC 34.'],
				name: 'Purple Worm Venom',
			},
			{
				entries: [
					'6 rounds; Stage 1 {@damage 5d6} poison damage and {@condition enfeebled|CRB|enfeebled 2} (1 round); Stage 2 {@damage 6d6} poison damage and {@condition enfeebled|CRB|enfeebled 2} (1 round); Stage 3 {@damage 8d6} poison and {@condition enfeebled|CRB|enfeebled 2} (1 round)',
				],
				name: 'Fortitude; Maximum Duration',
			},
		],
		reset: ['If disabled, the trap resets after 1 minute.'],
		attacks: [
			{
				range: 'Melee',
				name: 'needles',
				attack: 32,
				effects: ['purple worm venom'],
				damage: '{@damage 1d12} piercing plus purple worm venom',
				types: ['piercing'],
				noMAP: true,
			},
		],
	},
	{
		name: 'Polymorph Trap',
		source: 'CRB',
		page: 525,
		level: 12,
		traits: ['magical', 'trap'],
		stealth: {
			dc: 34,
			minProf: 'trained',
		},
		description: ['A Druidic glyph tries to transforms a trespasser into an animal.'],
		disable: {
			entries: [
				"{@skill Thievery} DC 32 (master) to drain the glyph's power harmlessly, or dispel magic (6th level; counteract DC 30) to counteract the glyph.",
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['primal', 'transmutation'],
				trigger:
					'A creature moves within 30 feet of the glyph without speaking the passphrase in Druidic.',
				entries: ['The creature is targeted by baleful polymorph (DC 32 Will save).'],
				name: 'Baleful Polymorph',
			},
		],
	},
	{
		name: 'Precarious Pile',
		source: 'LTiBA',
		page: 3,
		level: 2,
		traits: ['environmental'],
		stealth: {
			dc: 9,
		},
		description: [
			'This dangerously unsteady pile of miscellaneous goods stands 7 feet high and 10 feet wide.',
		],
		disable: {
			entries: [
				'DC 15 {@skill Thievery} to carefully excavate a path through the wall without upsetting its balance, or DC 17 {@skill Athletics} to hold up any unstable portions',
			],
		},
		defenses: {
			ac: {
				std: 16,
			},
			savingThrows: {
				fort: {
					std: 10,
				},
				ref: {
					std: 2,
				},
			},
			hardness: {
				std: 5,
			},
			hp: {
				std: 25,
			},
			bt: {
				std: 12,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger:
					'A creature attempts to climb or remove an object from the wall or the wall suffers a forceful impact',
				entries: [
					'The wall collapses, dealing {@damage 2d8} bludgeoning damage to creatures on it or within 10 feet of it. A creature that succeeds at a DC 18 Reflex save takes half damage and rolls out of the way in a random direction. On a critical success, they take no damage and can choose the direction.',
				],
				name: 'Collapse',
			},
		],
	},
	{
		name: 'Quaking Footfalls',
		source: 'FRP2',
		page: 88,
		level: 14,
		traits: ['environmental'],
		stealth: {
			dc: 10,
		},
		description: [
			"Mogaru's steady footsteps pick up speed, causing the earth around him to tremble as though from a powerful earthquake.",
		],
		disable: {
			entries: [
				'three DC 39 {@skill Athletics} (trained), {@skill Crafting} (trained), or Engineering Lore (trained) checks to brace a small structure or surface to cancel the effects of the quake in that area; DC 41 {@skill Performance} (legendary) to calm Mogaru momentarily.',
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'Mogaru moves at least 60 feet',
				entries: [
					"The ground shakes in a 120-foot emanation from Mogaru's space. This creates a variety of effects, depending on where the player characters are at the time of the quake. In most parts of the city, the ground becomes {@quickref difficult terrain||3|terrain}, and creatures on it are {@condition clumsy|CRB|clumsy 2} for 1 round. In parts of the city with existing underground spaces (like sewers, sinkholes, or catacombs), fissures open up in the ground. Creatures in the area tumble into the resulting 40-foot-deep hole unless they succeed at a DC 40 Reflex save. In bays, on beaches, and in other relatively substantial but shallow bodies of water, Mogaru's movement creates dangerous waves. Creatures in the water or within 60 feet of the waterline are struck by waves that deal {@damage 3d8} bludgeoning damage (DC 35 basic Reflex save). On a critically failed save, a creature is instantly swept 60 feet out to sea and 60 feet under the water's surface.",
				],
				name: 'Quake',
			},
		],
		reset: ["Mogaru doesn't rush this way again for {@dice 1d4} rounds."],
	},
	{
		name: 'Quarry Sluiceway',
		source: 'AoA3',
		page: 55,
		level: 9,
		traits: ['complex', 'mechanical', 'trap'],
		stealth: {
			bonus: 17,
			minProf: 'expert',
			notes: 'or {@skill Perception} DC 27 (expert) to notice the six cleverly {@condition hidden} sluice gates while they are closed',
		},
		description: [
			'Six sluice gates open to allow thousands of gallons of water to begin flooding the room. The water churns through the room and flows out through three chutes on the south end of the room.',
		],
		disable: {
			entries: [
				'{@skill Thievery} DC 28 (expert) twice to close a sluice (on a critical success, a sluice is closed immediately)',
			],
		},
		defenses: {
			hardness: {
				Sluiceway: 17,
			},
			hp: {
				Sluiceway: 38,
			},
			bt: {
				Sluiceway: 34,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature Interacts to throw either the primary lever or backup lever.',
				entries: ['The trap rolls initiative.'],
				name: 'Opened Sluices',
			},
		],
		routine: [
			"(6 actions) The trap loses 1 action per disabled or destroyed sluice. On each of its actions, the water rushing from the sluices flows through the room, creating a river of churning water that fills the room to several inches and makes the floor of the chamber into {@quickref difficult terrain||3|terrain}. The water level never rises above this level in the room, as it drains out of the chutes to the south and begins to flood the quarry pit (area {@b J2}). On the trap's second turn, the water starts filling the four slave pits in area {@b J2}. Each of the trap's actions fills the pits 4 inches (2 feet per round if all sluices are functional). If the slave pits fill to their total depth of 12 feet and the grates over the slave pits aren't open, the slaves begin to {@quickref drown||3|drowning and suffocating}, {@condition dying} if they aren't freed in 5 rounds. Once the slave pits are full, the water continues to slowly fill the central area over the course of an hour until it empties the reservoir and floods area {@b J2} to a depth of 15 feet.",
			'Other options beyond disabling or destroying the sluices could prevent the flooding of the quarry pit at your discretion.',
		],
		reset: [
			'The trap resets if all six sluices are closed. If all the water has drained when this occurs, the water takes many months to refill.',
		],
	},
	{
		name: 'Quicksand',
		source: 'CRB',
		page: 526,
		level: 3,
		traits: ['complex', 'environmental'],
		stealth: {
			bonus: 12,
			minProf: 'trained',
			notes: '(or \u201310 and no minimum proficiency if the surface is disturbed)',
		},
		description: [
			'A 15-foot-wide patch of water and sand attempts to submerge creatures that step onto it.',
		],
		disable: {
			entries: ['{@skill Survival} DC 18 (trained) to disturb the surface.'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'free',
				},
				trigger: 'A Huge or smaller creature walks onto the quicksand.',
				entries: [
					"The triggering creature sinks into the quicksand up to its waist. The quicksand rolls initiative if it hasn't already.",
				],
				name: 'Submerge',
			},
		],
		routine: [
			'(1 action) On its initiative, the quicksand pulls down each creature within it. A creature that was submerged up to its waist becomes submerged up to its neck, and a creature. that was submerged up to its neck is pulled under and has to hold its breath to avoid {@quickref suffocation||3|drowning and suffocating}.',
			"A creature in the quicksand can attempt a DC 20 {@skill Athletics} check to {@action Swim} to either raise itself by one step if it's submerged to its neck or worse, or to move 5 feet if it's submerged only up to its waist. On a critical failure, the creature is pulled down one step. A creature that Swims out of the quicksand escapes the hazard and is {@condition prone} in a space adjacent to the quicksand patch. Other creatures can {@action Aid} the creature, typically by using a rope or similar aid, or attempt to pull the creature out with their own DC 20 {@skill Athletics} check, with the same results as if the creature attempted the check.",
		],
		reset: [
			"The hazard still submerges anyone who walks in, but the surface doesn't become {@condition hidden} again until it settles over the course of 24 hours.",
		],
	},
	{
		name: 'Raving Spirit',
		source: 'EC3',
		page: 25,
		level: 11,
		traits: ['complex', 'haunt'],
		stealth: {
			bonus: 20,
			minProf: 'expert',
			notes: 'or DC 30 (master) to detect the spiritual nexus.',
		},
		description: [
			'The restless spirit of Currew raves against his tormentors when someone enters his room.',
		],
		disable: {
			entries: [
				'DC 30 {@skill Intimidation} (expert) to quiet the spirit for 1 round, or DC 32 {@skill Religion} (master) to exorcise it.',
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['death', 'emotion', 'fear', 'illusion', 'mental', 'occult'],
				trigger: 'A creature remains in area B3 for longer than 1 round',
				entries: [
					'Each creature in the sealed room is targeted by nightmare (DC 30 Will save). The haunt counts as having met the targets. It then rolls initiative.',
				],
				name: 'Raving Diatribe',
			},
		],
		routine: [
			"{@as 2} The haunts casts phantasmal killer (DC 30 Will save) on a random creature who can see Currew's bed (it can even target creatures outside of area B3, so long as the target can see the bed). Everyone affected by the phantasmal killer sees the same image: a sickly old man lies in the bed, screaming and ranting about his guilt, shame, and eventual death.",
		],
		reset: ['The haunt grows quiet and resets 1 minute after no creatures are in area B3.'],
	},
	{
		name: 'Rigged Cubby',
		source: 'AoE2',
		page: 51,
		level: 6,
		traits: ['mechanical', 'trap'],
		stealth: {
			dc: 25,
			minProf: 'expert',
		},
		description: [
			'A {@condition hidden} string connected to precariously stacked bricks causes the cubby to collapse in on itself when the string is pulled.',
		],
		disable: {
			entries: ['{@skill Thievery} DC 20 to cut the string without setting off the trap.'],
		},
		defenses: {
			ac: {
				std: 25,
			},
			savingThrows: {
				fort: {
					std: 0,
				},
				ref: {
					std: 0,
				},
			},
			hardness: {
				default: 0,
			},
			hp: {
				std: 1,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature touches the sickle in the cubby',
				entries: [
					'The heavy bricks above the cubby collapse, leaving the sickle unscathed but dealing {@damage 4d6+10} bludgeoning damage.',
				],
				name: 'Collapse',
			},
		],
	},
	{
		name: 'Rusty Grate Pit',
		source: 'AV2',
		page: 12,
		level: 6,
		traits: ['mechanical', 'trap'],
		stealth: {
			dc: 0,
		},
		description: ["The rusty grate covers a pit that's 10 feet in diameter and 40 feet deep."],
		disable: {
			entries: [
				"DC 18 {@skill Thievery} to harmlessly trigger the trap by nudging the gate or the dangling winch, or DC 24 {@skill Thievery} to stabilize the grate so it doesn't collapse.",
			],
		},
		defenses: {
			ac: {
				std: 21,
			},
			savingThrows: {
				fort: {
					std: 17,
				},
				ref: {
					std: 11,
				},
			},
			hardness: {
				std: 14,
			},
			hp: {
				std: 56,
			},
			bt: {
				std: 28,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature walks onto the grate',
				entries: [
					'The triggering creature falls in and takes falling damage (20 bludgeoning damage). That creature can use the {@action Grab an Edge} reaction to avoid falling. Whether or not the creature Grabs an Edge, the rusty winch above crashes down atop the triggering creature, dealing {@damage 3d10} bludgeoning damage and dislodging its grip (DC 24 basic Reflex save). The creature can still try to {@action Grab an Edge} again.',
				],
				name: 'Pitfall',
			},
		],
	},
	{
		name: 'Sand Whirlwind',
		source: 'FRP1',
		page: 18,
		level: 14,
		traits: ['complex', 'haunt'],
		stealth: {
			bonus: 23,
			minProf: 'trained',
		},
		description: ['Buffeting winds swirl sharp grains of sand about the room.'],
		disable: {
			entries: [
				"DC 38 {@skill Religion} (expert) to state an Iroran koan about being complete only upon recognizing one's incompleteness, or DC 41 {@skill Occultism} (master) to create a ward against future hauntings.",
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature attempts to leave the chamber',
				entries: [
					"A powerful wind pulls the creature back into the room. The triggering creature must attempt a DC 39 Fortitude save. The haunt can use this reaction any number of times per round, but only once per creature that tries to leave the room. The haunt then rolls initiative, if it hasn't already.",
					{
						type: 'successDegree',
						entries: {
							'Critical Success': 'The creature is unaffected.',
							Success: 'The creature is pulled back 10 feet into the room.',
							Failure:
								'The creature is pulled back 15 feet into the room and is {@condition blinded} for 1 round.',
							'Critical Failure':
								'The creature is pulled back 15 feet into the room and is {@condition blinded} for 1 minute.',
						},
					},
				],
				name: 'Sand Vacuum',
			},
		],
		routine: [
			"(1 action) The haunt's violent winds savagely buffet everyone in the room, dealing {@damage 6d10+30} bludgeoning damage to living creatures (DC 34 basic Reflex save). On a critically failed save, a creature is also {@condition blinded} for 1 minute.",
		],
		reset: [
			"The haunt deactivates after 1 minute and re-forms after 1 hour. The haunt is disabled and doesn't re-form if at least two creatures spend 1 minute to create an image with the sand. Creating the image requires a successful DC 30 {@skill Crafting} or {@skill Thievery} check.",
		],
	},
	{
		name: 'Scroll Shock Trap',
		source: 'Sli',
		page: 47,
		level: 9,
		traits: ['complex', 'mechanical', 'trap'],
		stealth: {
			bonus: 17,
			minProf: 'expert',
			notes: 'or DC 29 (expert) to spot the hidden control panel',
		},
		description: ['Five scroll symbols shoot electricity bolts around the room.'],
		disable: {
			entries: [
				'{@skill Thievery} DC 25 (expert) or {@spell dispel magic} (3rd level; counteract DC 24); {@skill Thievery} DC 29 (master) to disable the entire trap from the {@condition hidden} control panel beneath the central slab.',
			],
		},
		defenses: {
			ac: {
				std: 28,
			},
			savingThrows: {
				fort: {
					std: 21,
				},
				ref: {
					std: 15,
				},
			},
			hardness: {
				Symbol: 16,
				Panel: 18,
			},
			hp: {
				Symbol: 64,
				Panel: 72,
			},
			bt: {
				Symbol: 32,
				Panel: 36,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
			resistances: [
				{
					name: 'electricity',
					amount: 15,
				},
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['arcane', 'evocation'],
				trigger:
					'A creature without an Aspis Consortium badge approaches within 5 feet of a slab',
				entries: [
					'Both double doors leading out of the room shut and lock. While the trap is active, the doors must be battered open (Hardness 18; Panel HP 72 [BT 36]; {@skill Athletics} DC 29 to {@action Force Open}). The closest symbol to the triggering creature shoots an electricity bolt attack at it. The trap then rolls initiative.',
				],
				name: 'Reactive Charge',
			},
		],
		routine: [
			"(5 actions) Each disabled symbol reduces the trap's number of actions by 1. For each of its actions, a different symbol shoots an electricity bolt at a random creature in the room. The trap doesn't take multiple attack penalties.",
			{
				type: 'attack',
				range: 'Ranged',
				name: 'electricity bolt',
				attack: 21,
				traits: ['range <40 feet>'],
				damage: '{@damage 1d6+2} electricity damage and {@damage 1d6} {@condition persistent damage||persistent electricity damage}',
				types: ['electricity', 'persistent'],
			},
		],
		reset: [
			'The trap deactivates 1 round after it has no target creatures and resets after 1 minute.',
		],
	},
	{
		name: 'Scythe Blades',
		source: 'CRB',
		page: 523,
		level: 4,
		traits: ['mechanical', 'trap'],
		stealth: {
			dc: 23,
			minProf: 'trained',
		},
		description: [
			'Two blades, each {@condition hidden} in a 15-foot-long ceiling groove, are both connected to a trip wire.',
		],
		disable: {
			entries: ['{@skill Thievery} DC 21 (trained) to disable each blade.'],
		},
		defenses: {
			ac: {
				std: 21,
			},
			savingThrows: {
				fort: {
					std: 12,
				},
				ref: {
					std: 8,
				},
			},
			hardness: {
				std: 11,
			},
			hp: {
				std: 44,
			},
			bt: {
				std: 22,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['attack'],
				trigger: 'The trip wire is pulled or severed.',
				entries: [
					'Both blades swing down, each one attacking all creatures under the ceiling grooves.',
				],
				name: 'Falling Scythes',
			},
		],
		reset: ['The trap resets after 15 minutes.'],
		attacks: [
			{
				range: 'Melee',
				name: 'scythe',
				attack: 17,
				traits: ['deadly <1d12>'],
				damage: '{@damage 2d12+4} slashing',
				types: ['slashing'],
				noMAP: true,
			},
		],
	},
	{
		name: 'Second Chance',
		source: 'CRB',
		page: 525,
		level: 21,
		traits: ['magical', 'trap'],
		stealth: {
			dc: 44,
			minProf: 'legendary',
		},
		description: [
			'Powerful warding magic tied to an object or location tries to regress the ages of a creature and its allies.',
		],
		disable: {
			entries: [
				'{@skill Thievery} DC 46 (legendary) to take apart the spell one tiny piece at a time, with eyes closed, while recalling every vivid life memory in order, starting from the earliest memory.',
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['divine', 'transmutation'],
				trigger: 'A creature tries to steal the object or intrude upon the location.',
				entries: [
					'If someone uses a proxy or dupe for the theft or intrusion, the trap unerringly targets the true perpetrator or perpetrators at any distance\u2014even across planes. The triggering creature and up to five coconspirators instantly revert to infants, losing all memories, class abilities, and other skills acquired during their lives (DC 44 Fortitude negates). Reversing this effect is nearly impossible, requiring powerful magic such as wish.',
				],
				name: 'In the Beginning',
			},
		],
	},
	{
		name: 'Seismic Spears Trap',
		source: 'AoA5',
		page: 19,
		level: 19,
		traits: ['magical', 'trap'],
		stealth: {
			dc: 43,
			minProf: 'master',
		},
		description: [
			'Lines of searing lava lance through the area, causing targets to shake as if caught in an earthquake and potentially become {@condition petrified}.',
		],
		disable: {
			entries: [
				'{@skill Thievery} DC 43 (master) to disable the wards or {@spell dispel magic} (9th level; counteract DC 38) to counteract the ward.',
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['arcane', 'earth', 'fire'],
				trigger: 'A creature enters the marked area',
				entries: [
					'Fiery spears make one {@action Strike} against each living creature within 5 feet of the marked area.',
				],
				name: 'Cataclysmic Rain',
			},
			{
				entries: [
					'A creature struck by a seismic spear is {@condition clumsy|CRB|clumsy 3} for 1 round as their body shakes uncontrollably.',
					'On a critical hit, a target must succeed at a DC 39 Fortitude save or be {@condition petrified} for 1 minute, or permanently on a critical failure.',
				],
				name: 'Personal Quake',
			},
		],
		reset: ['The trap resets after 1 minute.'],
		attacks: [
			{
				range: 'Ranged',
				name: 'seismic spear',
				attack: 40,
				effects: ['personal quake'],
				damage: '{@damage 3d10+10} fire damage and {@damage 3d10+10} piercing damage plus personal quake',
				types: ['fire', 'piercing'],
				noMAP: true,
			},
		],
	},
	{
		name: 'Serpent Ward',
		source: 'SoT2',
		page: 9,
		level: 7,
		traits: ['uncommon', 'magical', 'trap'],
		stealth: {
			dc: 25,
			minProf: 'expert',
		},
		description: [
			'Illusionary snakes erupt from the trapped door, inflicting a venomous curse on intruders.',
		],
		disable: {
			entries: [
				'DC 26 {@skill Thievery} (expert) or DC 24 {@skill Occultism} (expert) to deactivate the magical trigger.',
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['curse', 'illusion', 'occult'],
				trigger: 'The trapped door is opened other than by a serpentfolk',
				entries: [
					'Hissing, illusionary snakes leap from the door. Each living creature within 30 feet is subjected to the curse of potent poison. If a living creature opened the door, that creature must roll its saving throw against the curse twice and take the worse result (this is a {@trait misfortune} effect).',
				],
				name: 'Curse the Intruders',
			},
		],
	},
	{
		name: 'Shuffling Scythe Blades',
		source: 'AV2',
		page: 21,
		level: 8,
		traits: ['complex', 'magical', 'mechanical', 'trap'],
		stealth: {
			dc: 18,
			minProf: 'expert',
		},
		description: [
			"Six long blades, {@condition hidden} in grooves in the walls and floor, zigzag through different parts of this hallway when any pressure plate in the hallway intersection is depressed; there are so many plates it's impossible to avoid them when moving through the room. The blades retreat into the floor and move through the {@condition hidden} grooves before swinging out from the wall again in a different location.",
		],
		disable: {
			entries: [
				'DC 26 {@skill Thievery} (expert) to disable each blade, or utter the magical passphrase (which only Chafkhem knows) to deactivate the trap for 10 minutes.',
			],
		},
		defenses: {
			ac: {
				std: 27,
			},
			savingThrows: {
				fort: {
					std: 19,
				},
				ref: {
					std: 13,
				},
			},
		},
		actions: [
			{
				entries: [
					'16, Scythe Blade HP 30 (BT 15); Immunities critical hits, object immunities, precision damage.',
				],
				name: 'Scythe Blade Hardness',
			},
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger:
					'A creature steps in the 15-footby- 25-foot area where the branching hallways connect',
				entries: [
					'The trap uses Scythe Shuffle; each blade makes a scythe {@action Strike} against each creature in its region, then it uses Scythe Shuffle again. The trap then rolls for initiative.',
				],
				name: 'Dicing Scythes',
			},
			{
				activity: {
					number: 1,
					unit: 'action',
				},
				entries: [
					"The blades travel erratically throughout the hallway's branches, out of sight under the floors or behind the walls. For each blade, roll {@dice 1d4} to determine the region in which it next makes scythe {@action Strike||Strikes}. A creature can {@action Seek} (DC 22) to learn clues about blades in the region they're currently occupying. On a success, the creature knows how many blades are currently in its region.",
					'1. Main intersection (the 15-foot-by-25-foot area where the hallways connect, as marked on area B20) 2. North branch (from the main intersection to the secret door to area B14) 3. Central hall (from the main intersection to the secret door to area B24) 4. South branch (from the main intersection to the wall shared with area B25)',
				],
				name: 'Scythe Shuffle',
			},
		],
		routine: [
			'(7 actions) The trap spends 1 action for each of its blades; a blade makes a scythe {@action Strike} against each creature in its region. With its final action, the trap uses.',
			{
				entries: [
					'Reduce the number of actions the trap can take by 1 for each destroyed blade.',
				],
				type: 'ability',
				name: 'Scythe Shuffle.',
			},
			{
				type: 'attack',
				range: 'Melee',
				name: 'scythe',
				attack: 20,
				traits: ['deadly <1d12>'],
				damage: '{@damage 1d12+8} slashing',
				types: ['slashing'],
				noMAP: true,
			},
		],
		reset: [
			"The trap resets when no creatures remain in area B20. Damaged or destroyed blades aren't repaired when the trap resets.",
		],
	},
	{
		name: 'Slamming Door',
		source: 'CRB',
		page: 523,
		level: 1,
		traits: ['mechanical', 'trap'],
		stealth: {
			dc: 17,
			minProf: 'trained',
		},
		description: [
			"Pressure-sensitive panels in the floor connect to a stone slab {@condition hidden} in a hallway's ceiling.",
		],
		disable: {
			entries: [
				'{@skill Thievery} DC 15 (trained) on the floor panels before the slab falls.',
			],
		},
		defenses: {
			ac: {
				std: 16,
			},
			savingThrows: {
				fort: {
					std: 10,
				},
				ref: {
					std: 2,
				},
			},
			hardness: {
				std: 5,
			},
			hp: {
				std: 20,
			},
			bt: {
				std: 10,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'Pressure is placed on any floor tile.',
				entries: [
					'The door falls, closing off the hallway. The stone slab deals {@damage 3d8} bludgeoning damage to anyone beneath or adjacent to the slab when it drops and pushes them out of its space in a random direction. A creature that succeeds at a DC 17 Reflex save takes no damage and rolls out of the way in a random direction. On a critical success, they can choose the direction. Lifting the fallen slab requires a successful DC 25 {@skill Athletics} check. Hitting the floor panels triggers the trap. The slab uses the same AC and saves as the trap, but it has Hardness 12, HP 48 (BT 24).',
				],
				name: 'Slam Shut',
			},
		],
	},
	{
		name: 'Spear Launcher',
		source: 'CRB',
		page: 523,
		level: 2,
		traits: ['mechanical', 'trap'],
		stealth: {
			dc: 20,
			minProf: 'trained',
		},
		description: [
			'A wall socket loaded with a spear connects to a floor tile in one 5-foot square.',
		],
		disable: {
			entries: ['{@skill Thievery} DC 18 (trained) on the floor tile or wall socket.'],
		},
		defenses: {
			ac: {
				std: 18,
			},
			savingThrows: {
				fort: {
					std: 11,
				},
				ref: {
					std: 3,
				},
			},
			hardness: {
				std: 8,
			},
			hp: {
				std: 32,
			},
			bt: {
				std: 16,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['attack'],
				trigger: 'Pressure is applied to the floor tile.',
				entries: [
					'The trap shoots a spear, making an attack against the creature or object on the floor tile.',
				],
				name: 'Spear',
			},
		],
		attacks: [
			{
				range: 'Ranged',
				name: 'spear',
				attack: 14,
				damage: '{@damage 2d6+6} piercing',
				types: ['piercing'],
				noMAP: true,
			},
		],
	},
	{
		name: 'Spear Launcher',
		source: 'FoP',
		page: 17,
		level: 2,
		traits: ['mechanical', 'trap'],
		stealth: {
			dc: 20,
			minProf: 'trained',
		},
		description: [
			'An old heavy crossbow is {@condition hidden} in a pile of trash, loaded with a wooden spear, and connected to the rope holding the door.',
		],
		disable: {
			entries: [
				'{@skill Thievery} DC 18 (trained) on the rope allows a PC to tie the rope off and open the door without setting off the trap.',
			],
		},
		defenses: {
			ac: {
				std: 18,
			},
			savingThrows: {
				fort: {
					std: 11,
				},
				ref: {
					std: 3,
				},
			},
			hardness: {
				std: 8,
			},
			hp: {
				std: 32,
			},
			bt: {
				std: 16,
			},
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['attack'],
				trigger: 'The rope is cut or otherwise untied from the door.',
				entries: [
					'The trap makes an attack against the creature that manipulated the rope.',
				],
				name: 'Spear',
			},
		],
		attacks: [
			{
				range: 'Ranged',
				name: 'spear',
				attack: 14,
				damage: '{@damage 2d6+6} piercing',
				types: ['piercing'],
				noMAP: true,
			},
		],
	},
	{
		name: 'Spike Launcher',
		source: 'AV1',
		page: 25,
		level: 0,
		traits: ['mechanical', 'trap'],
		stealth: {
			dc: 19,
		},
		description: ['A jagged spike of metal shoots from a {@condition hidden} launcher.'],
		disable: {
			entries: ['DC 16 {@skill Thievery} to disable one of the four launchers.'],
		},
		actions: [
			{
				entries: [
					"12 {@skill Acrobatics} to step over a trip line (this doesn't disarm the trap, but avoids triggering it) AC 16; Fort +9, Ref +3 Hardness 3; HP 16 (BT 8); Immunities critical hits, object immunities, precision damage.",
				],
				name: 'or DC',
			},
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature crosses one of the trip lines',
				entries: [
					"A spike launches along the trip line's path against the triggering creature, making a ranged {@action Strike}.",
				],
				name: 'Spike',
			},
		],
		attacks: [
			{
				range: 'Ranged',
				name: 'spike',
				attack: 11,
				traits: ['range <20 feet>'],
				damage: '{@damage 2d6+3} piercing',
				types: ['piercing'],
				noMAP: true,
			},
		],
	},
	{
		name: 'Spiked Barricade Trap',
		source: 'EC4',
		page: 45,
		level: 13,
		traits: ['mechanical', 'trap'],
		stealth: {
			dc: 32,
			minProf: 'expert',
		},
		description: ['Spring-loaded wedges of sharpened stone pop out of the wooden barricade.'],
		disable: {
			entries: [
				'DC 33 {@skill Thievery} (expert) to suppress the spring mechanism for one 5-foot segment of the barricade.',
			],
		},
		defenses: {
			ac: {
				std: 34,
			},
			savingThrows: {
				fort: {
					std: 26,
				},
				ref: {
					std: 18,
				},
			},
			hardness: {
				std: 22,
			},
			hp: {
				std: 88,
			},
			bt: {
				std: 44,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
			weaknesses: [
				{
					amount: 10,
					name: 'fire',
				},
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['attack'],
				trigger: 'A creature enters the area adjacent to a barrier',
				entries: [
					'Wedges of sharpened stone extend from the barricade in all directions and attack all creatures within 10 feet.',
				],
				name: 'Spike Jab',
			},
		],
		reset: ['The trap must be manually reset by pushing the wedges back into place.'],
		attacks: [
			{
				range: 'Melee',
				name: 'spike',
				attack: 31,
				traits: ['reach <10 feet>'],
				damage: '{@damage 6d12+24} slashing',
				types: ['slashing'],
				noMAP: true,
			},
		],
	},
	{
		name: 'Spiked Doorframe',
		source: 'AoA1',
		page: 46,
		level: 4,
		traits: ['mechanical', 'trap'],
		stealth: {
			dc: 25,
			minProf: 'trained',
		},
		description: [
			'Spikes lance out of the doorframe to skewer anyone who attempts to open the door.',
		],
		disable: {
			entries: [
				"{@skill Thievery} DC 20 (trained) to deactivate a trigger built into the door's handle",
			],
		},
		defenses: {
			ac: {
				std: 21,
			},
			savingThrows: {
				fort: {
					std: 12,
				},
				ref: {
					std: 8,
				},
			},
			hardness: {
				std: 11,
			},
			hp: {
				std: 44,
			},
			bt: {
				std: 22,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'action',
				},
				traits: ['attack'],
				trigger: 'The door is opened.',
				entries: ['The trap makes an attack against the creature that opened the door.'],
				name: 'Spikes',
			},
		],
		attacks: [
			{
				range: 'Melee',
				name: 'spikes',
				attack: 17,
				damage: '{@damage 4d6+3} piercing',
				types: ['piercing'],
			},
		],
	},
	{
		name: 'Spinning Blade Pillar',
		source: 'CRB',
		page: 527,
		level: 4,
		traits: ['complex', 'mechanical', 'trap'],
		stealth: {
			bonus: 11,
			minProf: 'trained',
			notes: 'or DC 26 (expert) to notice the control panel.',
		},
		description: [
			'A metal pole with three razor-sharp spinning blades is {@condition hidden} in the floor, connected to trigger plates in up to eight floor tiles and a {@condition hidden} control panel within 30 feet.',
		],
		disable: {
			entries: [
				'{@skill Thievery} DC 21 (trained) twice on the pillar, or {@skill Thievery} DC 19 (expert) once on the control panel deactivates the whole trap. Breaking the control panel prevents anyone from disabling the trap using the control panel and prevents the trap from deactivating automatically (see Reset below).',
			],
		},
		defenses: {
			ac: {
				std: 21,
			},
			savingThrows: {
				fort: {
					std: 10,
				},
				ref: {
					std: 12,
				},
			},
			hardness: {
				Pillar: 12,
				Panel: 5,
			},
			hp: {
				Pillar: 48,
				Panel: 20,
			},
			bt: {
				Pillar: 24,
				Panel: 10,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['attack'],
				trigger: 'A creature steps on one of the trapped floor tiles.',
				entries: [
					'The trap pops up in a grid intersection and makes a spinning blade attack against one adjacent creature (if any), then rolls initiative.',
				],
				name: 'Rising Pillar',
			},
		],
		routine: [
			"(3 actions) The trap uses its first action to make a spinning blade {@action Strike} against each adjacent creature, its second action to move straight in a random direction (roll {@dice 1d4} to determine the direction), and its third action to make a spinning blade {@action Strike} against each adjacent creature. This trap doesn't take a multiple attack penalty.",
		],
	},
	{
		name: 'Stabbing Sentinel',
		source: 'EC5',
		page: 53,
		level: 18,
		traits: ['magical', 'mechanical', 'trap'],
		stealth: {
			dc: 45,
			minProf: 'master',
		},
		description: [
			'A {@condition petrified} creature momentarily animates to attack an adjacent creature.',
		],
		disable: {
			entries: [
				'DC 40 {@skill Thievery} (master) to remove the animating magic without triggering the trap, or dispel magic (8th level; counteract DC 38) to counteract the animating magic.',
			],
		},
		defenses: {
			ac: {
				std: 41,
			},
			savingThrows: {
				fort: {
					std: 36,
				},
				ref: {
					std: 27,
				},
			},
			hardness: {
				std: 30,
			},
			hp: {
				std: 120,
			},
			bt: {
				std: 60,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['attack', 'necromancy', 'transmutation'],
				trigger: 'A living or undead creature moves within 5 feet of the stabbing sentinel',
				entries: [
					'The stabbing sentinel animates, making one {@action Strike} against the triggering creature.',
				],
				name: 'Animated Attack',
			},
			{
				entries: [
					'On a critical hit, the target is {@condition petrified} for 1 round. Additionally, if another stabbing sentinel has already been triggered, that sentinel immediately resets. If no other stabbing sentinels have been triggered, then another random statue in the room becomes infused with animating magic and becomes another stabbing sentinel hazard (to a maximum of four at a time).',
				],
				name: 'Petrification Overcharge',
			},
		],
		reset: [
			'The magical energy that animates the statue builds up again over 24 hours and the trap resets.',
		],
		attacks: [
			{
				range: 'Melee',
				name: 'blade',
				attack: 38,
				effects: ['petrification overcharge'],
				damage: '{@damage 6d12+40} piercing plus petrification overcharge',
				types: ['piercing'],
				noMAP: true,
			},
		],
	},
	{
		name: 'Stalker Summoning Rune',
		source: 'Sli',
		page: 15,
		level: 7,
		traits: ['uncommon', 'complex', 'magical', 'trap'],
		stealth: {
			bonus: 15,
			minProf: 'expert',
		},
		description: [
			'The sand conceals a rune that summons an {@condition invisible} stalker into this yard.',
		],
		disable: {
			entries: [
				'{@skill Acrobatics} DC 25 to approach without triggering the trap followed by {@skill Arcana} DC 25 (expert) or {@skill Thievery} DC 27 (expert) to erase the rune, or dispel magic (4th level; counteract DC 25) to counteract the rune.',
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['arcane', 'conjuration', 'summon'],
				trigger:
					"A creature that isn't openly bearing an Aspis Consortium badge crosses the center of the yard.",
				entries: [
					'The trap summons an {@creature invisible stalker}. The invisible stalker rolls initiative and remains for {@dice 2d6} rounds, after which the spell ends and the {@condition invisible} stalker disappears. The {@condition invisible} stalker also disappears if someone disables the trap before the duration expires. The {@condition invisible} stalker can use 3 actions each round and can use reactions, unlike most summoned creatures.',
				],
				name: 'Summon Monster',
			},
		],
		reset: ['The trap resets after 24 hours.'],
	},
	{
		name: 'Steam Vents',
		source: 'G&G',
		page: 81,
		level: 4,
		traits: ['uncommon', 'mechanical', 'steam', 'trap'],
		stealth: {
			dc: 22,
			minProf: 'trained',
		},
		description: [
			'Large pressurized pipes connected to a trip wire are rigged to release a blast of steam on trespassers.',
		],
		disable: {
			entries: [
				'{@skill Thievery} DC 22 (trained) to disconnect the trip wire or {@skill Crafting} DC 24 (expert) to carefully reduce the pressure and prevent the blast',
			],
		},
		defenses: {
			ac: {
				std: 20,
			},
			savingThrows: {
				fort: {
					std: 12,
				},
				ref: {
					std: 12,
				},
			},
			hardness: {
				std: 12,
			},
			hp: {
				std: 48,
			},
			bt: {
				std: 24,
			},
			immunities: ['object immunities'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger:
					'The trip wire is pulled or severed, typically because a creature walked through the square with the trip wire',
				entries: [
					'Steam erupts from the pipes, dealing {@damage 3d6} bludgeoning damage and {@damage 3d6} fire damage (DC 24 basic Reflex save) to all creatures within 15 feet. Creatures that critically fail their save are knocked prone.',
				],
				name: 'Steam Blast',
			},
		],
	},
	{
		name: 'Stonescale Spirits',
		source: 'AV1',
		page: 9,
		level: 2,
		traits: ['complex', 'haunt'],
		stealth: {
			bonus: 11,
			minProf: 'trained',
		},
		description: ['A half-dozen ghostly kobolds rise from the rubble in a howling vortex.'],
		disable: {
			entries: [
				'DC 18 {@skill Intimidation} (trained) to frighten the spirits with a threatening display, or DC 21 {@skill Religion} (trained) to exorcise the spirits.',
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['emotion', 'enchantment', 'fear', 'mental'],
				trigger:
					'A creature enters a square either fully or partially filled with rubble in the middle of the room',
				entries: [
					'Six ghostly kobolds surge out of the rubble with eerie yowls. Each creature in area A7 must attempt a DC 18 Will save with the following results. The haunt then rolls initiative.',
					{
						type: 'successDegree',
						entries: {
							'Critical Success':
								"The creature is unaffected, is temporarily immune to Confusing Confrontation for 24 hours, and realizes that a display of intimidating dominance might quell the ghostly kobolds' assault.",
							Success: 'The creature is {@condition frightened|CRB|frightened 1}.',
							Failure:
								'The creature is {@condition confused} for 1 round and is {@condition frightened|CRB|frightened 2}.',
							'Critical Failure':
								'The creature is {@condition confused} for 2 rounds and is {@condition frightened|CRB|frightened 3}',
						},
					},
				],
				name: 'Confusing Confrontation',
			},
		],
		routine: [
			"(1 action) The spirits swoop together toward one creature in area A7 who's {@condition frightened}, instilling feelings of betrayal and confusion. The target takes {@damage 1d10+4} mental damage (DC 18 basic Will save).",
		],
		reset: [
			"The haunt deactivates if there are no {@condition frightened} creatures in area A7 at the start of its turn. The ghostly kobolds return to the rubble pile. The haunt can't activate again for 1 hour.",
		],
	},
	{
		name: 'Suffering Xulgaths',
		source: 'EC6',
		page: 22,
		level: 16,
		traits: ['unique', 'complex', 'haunt'],
		stealth: {
			bonus: 26,
			minProf: 'expert',
			notes: 'to hear the echoed shouts of panicked xulgaths.',
		},
		description: [
			'The shadows of four xulgaths endlessly relive their deaths at the hands of the wendigos and their clutchmates.',
		],
		disable: {
			entries: [
				"DC 42 {@skill Religion} (master) or DC 42 {@skill Occultism} (master) to calm each of the four spirits. On a character's first successful check, the character also learns that xulgath funerary rites typically involve cremation, which hints that fire is a viable way to put them to rest.",
			],
		},
		defenses: {
			ac: {
				std: 39,
			},
			savingThrows: {
				fort: {
					std: 27,
				},
				ref: {
					std: 31,
				},
			},
			hp: {
				std: 24,
				notes: {
					std: 'per spirit',
				},
			},
			immunities: [
				'death effects',
				'disease',
				'paralyzed',
				'poison',
				'precision',
				'unconscious',
			],
			resistances: [
				{
					amount: 20,
					name: 'all damage',
					note: 'except fire, force, {@item ghost touch}, or positive',
				},
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger:
					'A living creature other than a wendigo gains the {@condition frightened} condition while within 100 feet of the way station',
				entries: ['The haunt rolls for initiative.'],
				name: 'Wendigo Remnants',
			},
		],
		routine: [
			"(4 actions) Each active spirit chooses a living non-wendigo creature within 120 feet and attempts to devour it, targeting different creatures if possible. Each calmed spirit reduces the hazard's actions by 1.",
			{
				type: 'attack',
				range: 'Melee',
				name: 'ghostly bite',
				attack: 32,
				traits: ['magical'],
				damage: '{@damage 3d6+5} negative',
				types: ['negative'],
				noMAP: true,
			},
		],
		reset: [
			'The haunt is deactivated and resets 1 minute after all non-wendigo creatures leave the area.',
		],
	},
	{
		name: 'Summoning Rune',
		source: 'AoE1',
		add_hash: 'Fire Elementals',
		page: 50,
		level: 5,
		traits: ['complex', 'magical', 'trap'],
		stealth: {
			bonus: 12,
			minProf: 'trained',
		},
		description: [
			'An invisible cloud of magical sensors detects living creatures in the room and summons fire elementals to slay the creatures.',
		],
		disable: {
			entries: [
				'DC 22 {@skill Acrobatics} (trained) to approach without triggering the trap, followed by DC 22 {@skill Thievery} (trained) to erase the rune or dispel magic (3rd level; counteract DC 20) to counteract the rune.',
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['arcane', 'conjuration', 'summon'],
				trigger: 'A living creature enters the room',
				entries: [
					"Two rounds after a creature enters the room, the room's door slams shut and locks (two DC 20 {@skill Thievery} checks to pick), and two {@creature cinder rat||cinder rat fire elementals} emerge from the floor. The elementals roll initiative and remain for {@dice 3d6} rounds, after which the spell ends and the creatures disappear. The elementals also disappear if someone disables the trap before the duration expires. The summoned elementals can use 3 actions each round and can use reactions, unlike most summoned creatures.",
				],
				name: 'Summon Elementals',
			},
		],
		reset: ['The trap resets each day at dawn.'],
	},
	{
		name: 'Summoning Rune',
		add_hash: 'Barbazu Devil',
		source: 'AoE1',
		page: 51,
		level: 5,
		traits: ['complex', 'magical', 'trap'],
		stealth: {
			bonus: 11,
			minProf: 'trained',
		},
		description: [
			"A summoning circle inlaid into the room's floor detects living creatures and summons a violent devil.",
		],
		disable: {
			entries: [
				"DC 18 {@skill Perception} to notice the trap's magic and avoid stepping on the floor outside the circle, followed by DC 21 {@skill Thievery} (trained) to break the circle or dispel magic (3rd level; counteract DC 23) to counteract the rune.",
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['arcane', 'conjuration', 'summon'],
				trigger:
					'A living creature steps on any part of the floor not enclosed by the summoning circle',
				entries: [
					'One round after a creature touches the triggering area, the door to the room slams shut and locks (two DC 20 {@skill Thievery} checks to pick) and a {@creature barbazu||barbazu devil} appears in the summoning circle. The devil rolls initiative and remains for {@dice 3d6} rounds, after which the spell ends and the devil disappears. The devil also disappears if someone disables the trap before the duration expires. The summoned devil can use 3 actions each round and can use reactions, unlike most summoned creatures.',
				],
				name: 'Summon Devil',
			},
		],
		reset: ['The trap resets each day at dawn.'],
	},
	{
		name: 'Summoning Rune',
		source: 'CRB',
		page: 526,
		level: 1,
		traits: ['complex', 'magical', 'trap'],
		stealth: {
			bonus: 7,
			minProf: 'trained',
		},
		description: [
			'A cloud of {@condition invisible} magical sensors in a 10-foot radius surrounds an {@condition invisible} wall or floor rune the size of the creature to be summoned.',
		],
		disable: {
			entries: [
				'{@skill Acrobatics} DC 15 to approach without triggering the trap followed by {@skill Thievery} DC 17 (trained) to erase the rune, or dispel magic (1st level; counteract DC 15) to counteract the rune.',
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['arcane', 'conjuration', 'summon'],
				trigger: 'A creature enters the cloud of magical sensors.',
				entries: [
					'This trap summons a specific level 1 creature, determined when the trap is created. The creature rolls initiative and remains for {@dice 2d6} rounds, after which the spell ends and the creature disappears. The creature also disappears if someone disables the trap before the duration expires. The summoned creature can use 3 actions each round and can use reactions, unlike most summoned creatures.',
				],
				name: 'Summon Monster',
			},
		],
		reset: ['The trap resets each day at dawn.'],
	},
	{
		name: 'Supplicant Statues',
		source: 'AoE4',
		page: 9,
		level: 14,
		traits: ['complex', 'magical', 'mechanical', 'trap'],
		stealth: {
			bonus: 30,
			minProf: 'master',
		},
		description: [
			'Six statues rapidly slide around the room on rollers, slowing down intruders and striking at them with spring-loaded sword arms.',
		],
		disable: {
			entries: [
				"DC 34 {@skill Thievery} (master) to disable a specific statue's rollers, or DC 39 {@skill Thievery} (master) on the control panel in A4 deactivates the whole trap. For each statue disabled, the trap loses 1 action from its routine and the DC for its predictive impediment ability decreases by 4. Dispel magic (7th level, counteract DC 32) doesn't harm the statues but removes the predictive impediment ability. Breaking the control panel prevents the trap from resetting.",
			],
		},
		defenses: {
			ac: {
				std: 34,
			},
			savingThrows: {
				fort: {
					std: 20,
				},
				ref: {
					std: 28,
				},
			},
			hardness: {
				Statue: 22,
			},
			hp: {
				Statue: 96,
				std: 20,
			},
			bt: {
				Statue: 48,
				std: 10,
			},
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature enters a square adjacent to a statue',
				entries: [
					'The trap makes a statue shortsword {@action Strike} against the triggering creature, activates its predictive impediment ability, and then rolls initiative.',
				],
				name: 'Animated Statues',
			},
			{
				traits: ['arcane', 'divination'],
				entries: [
					'The statues continually slide around to bump into creatures and block their passage through the room. The first time on its turn that a creature attempts to move within the room, it must succeed at a DC 36 Reflex save or treat the entire room as {@quickref difficult terrain||3|terrain} for 1 round. On a critical failure, the creature is also knocked {@condition prone}.',
				],
				name: 'Predictive Impediment',
			},
		],
		routine: [
			"(6 actions) On the trap's initiative, each functioning statue slides up to 40 feet around the room and makes a statue shortsword {@action Strike} against an adjacent creature. The trap doesn't take a multiple attack penalty, and the statues' movements don't trigger reactions.",
			{
				type: 'attack',
				range: 'Melee',
				name: 'statue shortsword',
				attack: 28,
				damage: '{@damage 2d10+10} slashing',
				types: ['slashing'],
				noMAP: true,
			},
		],
		reset: ['The trap deactivates and resets one minute after the room is empty.'],
	},
	{
		name: 'Swatting Tail',
		source: 'FRP2',
		page: 89,
		level: 18,
		traits: ['environmental', 'kaiju'],
		stealth: {
			dc: 10,
		},
		description: [
			"Mogaru's tail sweeps forth, causing an arc of devastation in a 60-foot cone.",
		],
		disable: {
			entries: [
				"DC 45 {@skill Performance} (legendary) or DC 48 {@skill Deception} (legendary) to momentarily divert Mogaru's attention.",
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger:
					'A creature takes a {@condition hostile} action against Mogaru, produces a visible area effect, or flies within 120 feet of Mogaru',
				entries: [
					'Creatures in the area must succeed at a DC 40 Reflex save or take {@damage 6d10+28} bludgeoning damage.',
					{
						type: 'successDegree',
						entries: {
							'Critical Success': 'The creature is unaffected.',
							Success:
								'The creature takes half damage and is pushed 20 feet away. If flying, it descends 20 feet.',
							Failure:
								'The creature takes full damage, is pushed 40 feet, and descends 60 feet (if flying) or is knocked {@condition prone}.',
							'Critical Failure':
								'The creature takes double damage, is pushed 60 feet away, descends 120 feet (if flying) or is knocked {@condition prone}, and is {@condition stunned|CRB|stunned 2}.',
						},
					},
				],
				name: 'Tail Swat',
			},
		],
		reset: ["Mogaru doesn't swat his tail again for {@dice 1d4} rounds."],
	},
	{
		name: 'Telekinetic Swarm Trap',
		source: 'CRB',
		page: 528,
		level: 12,
		traits: ['complex', 'magical', 'mechanical', 'trap'],
		stealth: {
			bonus: 24,
			minProf: 'expert',
		},
		description: [
			'Three innocuous decorations instilled with telekinetic magic pull objects and pieces of the room itself into spinning clouds of debris that attack all creatures in the room.',
		],
		disable: {
			entries: [
				'{@skill Thievery} DC 27 (expert) to take apart a telekinetic cloud, {@skill Thievery} DC 32 (master) to disable each telekinetic decoration, or dispel magic (6th level; counteract DC 30) to counteract each telekinetic decoration.',
			],
		},
		defenses: {
			ac: {
				std: 33,
			},
			savingThrows: {
				fort: {
					std: 24,
				},
				ref: {
					std: 19,
				},
			},
			hardness: {
				std: 22,
			},
			hp: {
				std: 88,
				notes: {
					std: 'per telekinetic cloud',
				},
			},
			bt: {
				std: 44,
			},
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['arcane', 'evocation'],
				trigger: 'A creature stays in the room for at least 6 seconds.',
				entries: [
					"Each telekinetic decoration constructs a cloud of objects in the room (three clouds total) and the trap rolls initiative. The creatures in the room when the trap is triggered become the trap's targets, regardless of whether they leave the room or other creatures later enter the room. Each decoration targets a different creature if possible. A target creature that moves at least 1 mile from the trap ceases being a target, at which point the decoration designates a new target.",
				],
				name: 'Agitate',
			},
		],
		routine: [
			"(9 actions) Each decoration uses 3 of the trap's actions each turn, and the trap loses 3 actions each turn for every decoration that is disabled. A decoration uses its first action to move its cloud of objects up to 200 feet, its second action to make the objects {@action Strike}, and its third action to add more objects to the cloud, increasing its damage by {@dice 1d12} (to a maximum of {@dice 4d12+10}). If a decoration's cloud is already at maximum damage, it does nothing with its third action.",
			"If a decoration's cloud has been destroyed, the decoration instead spends its first action to create a new cloud of objects inside the room (using the starting damage value) and then its second and third actions to have the cloud move and attack.",
			{
				type: 'attack',
				range: 'Melee',
				name: 'objects',
				attack: 24,
				damage: '{@damage 2d12+10} bludgeoning',
				types: ['bludgeoning'],
				noMAP: true,
			},
		],
		reset: [
			'The trap deactivates and resets 10 minutes after it has no target creatures (because the creatures either moved too far away or died).',
		],
	},
	{
		name: "The Laughing Fiend's Greeting",
		source: 'AoE6',
		page: 34,
		level: 20,
		traits: ['magical', 'trap'],
		stealth: {
			dc: 46,
			minProf: 'legendary',
		},
		description: [
			"Subtle but deadly magical runes link this mural to Kharnas's master. Good- or neutral-aligned creatures who examine the mural witness the castle's drawbridge silently descend, revealing an endless darkness.",
		],
		disable: {
			entries: [
				'DC 44 {@skill Thievery} (legendary) to obscure or mar the magical runes set into the mural, or dispel magic (9th level; counteract DC 42) to counteract the mural.',
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['illusion', 'occult'],
				trigger: 'A creature capable of casting divine magic examines the mural',
				entries: [
					"The mural casts weird (DC 43 Will save) on all creatures in the gallery. A snarl fills the creatures' minds.",
				],
				name: "Tegresin's Greeting",
			},
		],
		reset: ['1 week.'],
	},
	{
		name: 'The Winder',
		source: 'AoE5',
		page: 63,
		level: 19,
		traits: ['complex', 'environmental', 'mechanical'],
		stealth: {
			bonus: 31,
			minProf: 'master',
		},
		description: [
			'A large metallic arm, 20 feet long, is set into the floor. It rotates around the room to wind up nearby clockwork creatures.',
		],
		disable: {
			entries: [
				'DC 50 {@skill Thievery} (master) to deactivate the system, or DC 40 {@skill Athletics} (legendary) to jam the gears for 1 round.',
			],
		},
		defenses: {
			ac: {
				std: 43,
			},
			savingThrows: {
				fort: {
					std: 32,
				},
				ref: {
					std: 35,
				},
			},
			hardness: {
				std: 15,
			},
			hp: {
				std: 250,
			},
			bt: {
				std: 125,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger:
					'A creature other than the Rumormonger enters the room, or the Rumormonger commands the device to activate',
				entries: ['The Winder rolls initiative.'],
				name: 'Wind Up',
			},
		],
		routine: [
			"(1, 2, or 4 actions, depending on the encounter's threat level) The Winder uses each of its actions to Wind clockwork assassins in the room, starting with inactive ones.",
			{
				activity: {
					number: 1,
					unit: 'action',
				},
				entries: [
					'The Winder winds a clockwork creature in the room. If the creature is currently inactive, this activates the creature, allowing it to act normally for {@dice 1d4} rounds.',
					'If already active, this instead increases the number of rounds the clockwork creature remains active by {@dice 1d4}.',
				],
				type: 'ability',
				name: 'Wind',
			},
		],
		reset: ['The Winder resets as soon as no creatures remain in the room.'],
	},
	{
		name: "Thief's Trap",
		source: 'EC6',
		page: 36,
		level: 20,
		traits: ['magical', 'trap'],
		stealth: {
			dc: 50,
			minProf: 'master',
			notes: 'to notice that the hairline cracks on the passage walls actually form runes.',
		},
		description: [
			'Nearly imperceptible runes set off an explosion at the point a thief is most unable to receive aid.',
		],
		disable: {
			entries: [
				'DC 45 {@skill Thievery} (master) or dispel magic (10th level, counteract DC 50) to counteract the runes.',
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature crosses a rune',
				entries: [
					"The runes unleash a gout of fire roaring up the chute. Anyone in the chute and within 5 feet of its openings is dealt {@damage 8d10+44} fire damage (DC 42 basic Reflex save). Immediately thereafter, the runes emanate a 4th-level {@spell silence} effect for 1 minute, so anyone injured in the chute can't call out for help.",
				],
				name: 'Explosion',
			},
		],
		reset: ['The trap resets in 1 minute.'],
	},
	{
		name: 'Thunderstone Cascade Trap',
		source: 'EC2',
		page: 14,
		level: 7,
		traits: ['uncommon', 'mechanical', 'trap'],
		stealth: {
			dc: 25,
			minProf: 'expert',
		},
		description: [
			'A trip wire halfway up the stairs releases half a dozen spherical thunderstones that bounce down the stairs and explode.',
		],
		disable: {
			entries: ['DC 27 {@skill Thievery} (expert) to safely cut the trip wire.'],
		},
		defenses: {
			ac: {
				std: 26,
			},
			savingThrows: {
				fort: {
					std: 15,
				},
				ref: {
					std: 13,
				},
			},
			hardness: {
				default: 0,
			},
			hp: {
				std: 54,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'The trip wire is disturbed',
				entries: [
					'Several thunderstones bounce down the stairs and explode. Each creature within 10 feet of the lower half of the stairs takes {@damage 6d10} sonic damage (DC 24 basic Fortitude save). Creatures that fail this save are additionally {@condition deafened} for 1 minute; creatures that critically fail this save are instead {@condition deafened} for 1 hour.',
				],
				name: 'Thunderstone Explosion',
			},
		],
	},
	{
		name: 'Tongues Of Flame',
		source: 'TiO',
		page: 44,
		level: 5,
		traits: ['complex', 'mechanical', 'trap'],
		stealth: {
			dc: 23,
			notes: '{@skill Perception}.',
		},
		description: [
			'Nozzles {@condition hidden} in the ceiling of the four corridors leading to the intersection spray jets of flame along their lengths when the trap is triggered.',
		],
		disable: {
			entries: [
				"DC 22 {@skill Thievery} to disable a single nozzle, DC 21 {@skill Thievery} twice to unlock a door, or DC 25 {@skill Thievery} to deactivate the trap from the control panel. A hero who isn't trained in {@skill Thievery} automatically fails these checks.",
			],
		},
		defenses: {
			ac: {
				std: 25,
			},
			savingThrows: {
				fort: {
					std: 15,
				},
				ref: {
					std: 8,
				},
			},
			hardness: {
				Nozzle: 12,
				Door: 6,
			},
			hp: {
				Nozzle: 50,
				Door: 22,
				notes: {
					Nozzle: 'to destroy a single nozzle',
					Door: 'to break open a door and escape the hallway',
				},
			},
			bt: {
				Nozzle: 25,
				Door: 11,
			},
			immunities: ['critical hits', 'sneak attack'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				entries: [
					'If a creature enters the corridor intersection, the four doors exiting this intersection close and lock, and the trap rolls {@skill Stealth} (+13) for its initiative.',
				],
				name: 'Seal the Doors',
			},
		],
		routine: [
			"(4 actions) The trap loses 1 action each turn for each disabled nozzle. On each action, a different nozzle fires a jet of flame down a different corridor, dealing {@damage 3d6} fire damage to each creature in the first 10 feet of the corridor past the intersection (DC 22 basic Reflex save). A creature standing in the corridor intersection can be hit by only one flame jet per round even if they're in the area of multiple flame jets. The creature attempts only one saving throw per round, but it takes a \u20132 circumstance penalty to its saving throw.",
		],
		reset: [
			'The trap deactivates and resets after 10 minutes. After the trap is activated for the fourth time, it runs out of fuel and must be reset manually.',
		],
	},
	{
		name: 'Town Hall Fire',
		source: 'AoA1',
		page: 9,
		level: 1,
		traits: ['complex', 'environmental', 'fire'],
		stealth: {
			bonus: -10,
			notes: 'initiative modifier is +5',
		},
		description: [
			'A fire engulfs the western door and a 10-foot-by-10-foot area immediately east of it, then spreads on each of its turns.',
		],
		disable: {
			entries: [
				"Eliminating the hazard requires dousing the flames. Water typically clears a 5-foot square if the amount is small (such as that from {@spell create water} or {@spell hydraulic push}). Larger amounts of water, such as a full bucket, typically douse a 10-foot-by-10-foot area (or 4 squares in some other shape). Throwing a bucket of water on flames requires an {@action Interact} action. A waterskin doesn't contain enough water to put out even 1 square of fire. Cold can also put out fire, but only if the cold can affect an area; cold is usually less effective than water, so a {@item frost vial} typically puts out 1 square of fire, and {@spell ray of frost} is ineffective.",
				"Fountain Circle, located outside town hall, has several working water pumps. These are far enough away that it's impractical for a PC to bring water back and forth. However, a PC might instruct the more steely nerved spectators to create a bucket brigade. It takes 15 spectators (which can include those rescued by councilors as well as by PCs) to set this up, and 2 rounds for the townspeople to line up and begin pumping water from Fountain Circle. As of the 3rd round, there is a bucket of water available for the PCs to use at the chamber's southern entrance at the beginning of each PC's turn. Members of a bucket brigade are lined up outside the chamber, and don't take damage from smoke inhalation.",
				"If a PC does want to carry the water, it's 150 feet from the chamber's southern door to a pump, so it 6 actions are usually needed to reach the pumps or return. Filling a bucket requires an {@action Interact} action.",
				'Other methods might also help control the fire, as you determine. For example, the PCs might be able to find something to barricade the fire with to control its path, or use a cloak to beat out some of the fire.',
			],
		},
		routine: [
			"On its turn, the fire spreads into a number of additional squares equal to half the number of squares the fire currently occupies, with a minimum of 1 square. You determine the squares the fire spreads into\u2014typically those with the most flammable materials. Any creature that ends its turn next to the flames takes {@damage 1d6} fire damage, and any creature within the flames takes {@damage 4d6} fire damage. Both of these have a DC 17 basic Reflex save. A creature can take damage from flames only once per round. (For simplicity, track damage only for the NPCs and their allies, not for the spectators; Turn 5 and Turn 7 have instructions regarding the spectators' health)",
			'The fire has an additional effect on each of its turns after the first.',
			"{@b Turn 2} The chamber's northern door flies open and flames burst through, igniting the 10-foot-by-10-foot area in front of the door. All fires spread on subsequent turns, at the same rate listed above. Any fires that join together become one fire for this purpose.",
			'{@b Turn 4+} Creatures in the room take {@dice 1d6} damage from smoke inhalation at the ends of their turns. Anyone who uses an {@action Interact} action to tie a wet rag around their nose and mouth (or uses another creative solution) halves the damage.',
			'{@b Turn 5} Spectators still inside the room fall {@condition unconscious} from burns and smoke inhalation.',
			'{@b Turn 7} Spectators still in the room die.',
		],
	},
	{
		name: 'Trapped Lathe',
		source: 'AoA3',
		page: 6,
		level: 10,
		traits: ['complex', 'mechanical', 'trap'],
		stealth: {
			bonus: 19,
			minProf: 'expert',
			notes: "DC 29 to notice the line of cord running from the lathe's trigger toward the door to area {@b A2}.",
		},
		description: [
			"The powered lathe's springs have been critically overwound so that when jostled or triggered, the lathe unwinds violently, hurling blades, gears, and sharp shards of metal around the room.",
		],
		disable: {
			entries: [
				'{@skill Thievery} DC 31 (expert) on the lathe releases the tension on its springs without unleashing its blades and gears.',
			],
		},
		defenses: {
			ac: {
				std: 30,
			},
			savingThrows: {
				fort: {
					std: 22,
				},
				ref: {
					std: 14,
				},
			},
			hardness: {
				std: 18,
			},
			hp: {
				std: 72,
			},
			bt: {
				std: 36,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'The lathe is jostled or damaged, or its trigger is remotely pulled.',
				entries: [
					'The trap makes a sharpened fragment {@action Strike} against a random target in area {@b A1}, then rolls for initiative.',
				],
				name: 'Unleash Fragments',
			},
		],
		routine: [
			'(4 actions) The lathe attempts four sharpened fragment attacks against creatures in the room, selecting a target randomly from all available targets in area {@b A1}. The trap does not take multiple attack penalties for any of its attacks. The trap loses 1 action each turn as its springs wind down, and becomes disabled when it has 0 actions.',
			{
				type: 'attack',
				range: 'Ranged',
				name: 'sharpened fragment',
				attack: 26,
				damage: '{@damage 2d8+12} slashing plus {@damage 1d8} {@condition persistent damage||persistent bleed damage} on a critical hit',
				types: ['persistent', 'slashing'],
			},
		],
	},
	{
		name: 'Tree Of Dreadful Dreams',
		source: 'AoA3',
		page: 11,
		level: 10,
		traits: ['rare', 'complex', 'magical', 'trap'],
		stealth: {
			bonus: 22,
			minProf: 'expert',
		},
		description: [
			'The statue of the willow tree animates, its branches lashing out to try to grab anyone in area {@b B2}.',
		],
		disable: {
			entries: [
				"{@skill Athletics} or {@skill Thievery} DC 25 (trained) to force or lever open a single branch, disabling that branch and freeing any creature trapped within. {@skill Thievery} DC 29 (expert) to disrupt the tree's magical animation, shut it down, and free all trapped creatures. Placing a {@item dreamstone|AoA3} in the tree's trunk takes 2 {@action Interact} actions and causes the trap to shut down, freeing all trapped creatures. Placing the {@item dreamstone, cursed|AoA3|cursed dreamstone} from area {@b B4} in the trunk instead increases the tree's actions per turn to 4 and gives it a +2 item bonus to all saving throws and attack rolls.",
			],
		},
		defenses: {
			ac: {
				std: 30,
			},
			savingThrows: {
				fort: {
					std: 22,
				},
				ref: {
					std: 14,
				},
			},
			hardness: {
				Branch: 10,
			},
			hp: {
				Branch: 40,
				notes: {
					Branch: 'to break each branch',
				},
			},
			bt: {
				Branch: 20,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				entries: [
					'The tree of dreadful dreams can attempt up to six Attacks of Opportunity each round.',
				],
				name: 'Attack of Opportunity',
			},
		],
		routine: [
			"(3 actions) The statue uses each action to attempt a branch {@action Strike} against a random creature in the room that it hasn't {@condition grabbed}. If there are no creatures for it to attack and it has at least one creature {@condition grabbed}, it instead Constricts. The trap can have up to six creatures {@condition grabbed}.",
			{
				type: 'attack',
				range: 'Melee',
				name: 'branch',
				attack: 26,
				traits: ['reach <20 feet>'],
				effects: ['the target is {@condition grabbed} by the tree'],
				damage: '{@damage 2d10+12} bludgeoning plus the target is {@condition grabbed} by the tree',
				types: ['bludgeoning'],
				noMAP: true,
			},
			{
				activity: {
					number: 1,
					unit: 'action',
				},
				entries: ['{@damage 1d10+12} bludgeoning, DC 27.'],
				type: 'ability',
				name: 'Constrict',
			},
			{
				entries: [
					'A creature that begins its turn {@condition grabbed} by the trap experiences vivid, warped visions of true events and must succeed at a DC 31 Will save or take {@damage 4d8} mental damage. On a critical failure, the creature also becomes {@condition doomed|CRB|doomed 1}. A creature that succeeds at its save is temporarily immune for 24 hours.',
				],
				type: 'ability',
				name: 'Terrifying Visions',
			},
		],
		reset: [
			"The trap deactivates and resets if it has no creatures {@condition grabbed} and no creatures in the room to attack. If an uncursed {@item dreamstone|AoA3} is placed in its trunk, the statue doesn't reactivate.",
		],
	},
	{
		name: 'Shrieker',
		source: 'GMG',
		page: 77,
		level: -1,
		traits: ['environmental', 'fungus'],
		stealth: {
			dc: 12,
		},
		description: ['This human-sized purple mushroom emits a piercing shriek when disturbed.'],
		disable: {
			entries: [
				"DC 18 {@skill Survival} to carefully approach and cut the mushroom's air sac without triggering the shrieker",
			],
		},
		defenses: {
			ac: {
				std: 12,
			},
			savingThrows: {
				fort: {
					std: 8,
				},
				ref: {
					std: 2,
				},
			},
			hp: {
				std: 9,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				name: 'Shriek',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger:
					'A creature or light source approaches within 10 feet of the shrieker or the shrieker takes damage',
				entries: [
					'The shrieker emits a deafening screech that deals {@damage 1d6} sonic damage to creatures within 30 feet (DC 16 basic Fortitude save; creatures that critically fail this saving throw are {@condition deafened} for 1 minute).',
				],
			},
		],
		reset: ['1 minute'],
	},
	{
		name: 'Snowfall',
		source: 'GMG',
		page: 77,
		level: 0,
		traits: ['environmental'],
		stealth: {
			dc: 16,
			minProf: 'trained',
		},
		description: [
			'Loose snow and ice have built up on a high surface, such as a tree branch or a rooftop. Its grip on the surface is tenuous, and it is likely to fall if the surface moves.',
		],
		disable: {
			entries: [
				'DC 19 {@skill Survival} (trained) to safely dislodge the snow, or deal any amount of fire damage to destroy the hazard without triggering it',
			],
		},
		defenses: {
			ac: {
				std: 16,
			},
			savingThrows: {
				fort: {
					std: 10,
				},
				ref: {
					std: 8,
				},
			},
			hp: {
				std: 8,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				name: 'Snowdrop',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature moves beneath where the snowfall is resting',
				entries: [
					'Ice and snow fall on the triggering creature, dealing {@damage 2d6+3} bludgeoning damage (DC 18 basic Reflex save) and soaking their clothing. Until they change into fresh clothing or spend at least an hour in an area of normal or higher temperature, they treat cold environments as one step colder (for example, mild cold as severe cold).',
				],
			},
		],
	},
	{
		name: 'Hampering Web',
		source: 'GMG',
		page: 77,
		level: 1,
		traits: ['environmental'],
		stealth: {
			dc: 18,
			minProf: 'expert',
		},
		description: [
			'Semitransparent sheets of webbing span the entryway, ready to capture small insects or hamper larger creatures that pass through.',
		],
		disable: {
			entries: ['DC 17 {@skill Survival} (trained) to dislodge it'],
		},
		defenses: {
			ac: {
				std: 19,
			},
			savingThrows: {
				fort: {
					std: 10,
				},
				ref: {
					std: 11,
				},
			},
			hp: {
				std: 26,
			},
			bt: {
				std: 13,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				name: 'Ensnare',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: "A creature that isn't a spider walks into the web",
				entries: [
					"The web wraps around the triggering creature's body, clinging to their limbs. The triggering creature must succeed at a DC 20 Reflex save or take a \u201310-foot circumstance penalty to all their Speeds until they {@action Escape} the web (DC 20). On a critical failure, the webbing also clings to the creature's face, making them {@condition sickened||sickened 1}, and they can't attempt to reduce this condition until they {@action Escape} the web.",
				],
			},
		],
	},
	{
		name: 'Brown Mold',
		source: 'GMG',
		page: 77,
		level: 2,
		traits: ['environmental', 'fungus'],
		stealth: {
			dc: 21,
			minProf: 'trained',
		},
		description: ['This unassuming fungus leeches heat out of the air.'],
		disable: {
			entries: ['DC 18 {@skill Survival} (trained) to safely remove the mold'],
		},
		defenses: {
			ac: {
				std: 18,
			},
			savingThrows: {
				fort: {
					std: 11,
				},
				abilities: ['Ref +5'],
			},
			hp: {
				std: 30,
			},
			bt: {
				std: 15,
			},
			immunities: ['critical hits', 'fire', 'object immunities', 'precision damage'],
			weaknesses: [
				{
					name: 'cold',
					amount: 10,
				},
			],
		},
		actions: [
			{
				name: 'Emit Cold',
				traits: ['aura', 'cold'],
				entries: [
					'5 feet. Brown mold deals {@damage 2d6} cold damage to nearby creatures.',
				],
			},
			{
				name: 'Leech Warmth',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'Fire comes within 5 feet of the brown mold',
				entries: [
					'The brown mold expands into every square adjacent to its space. As it grows, it pulls more heat from its surroundings, dealing {@damage 2d6+6} cold damage (DC 18 basic Fortitude save) to creatures within 10 feet after it expands.',
				],
			},
		],
		reset: ["After expanding, the brown mold can't grow again for 1 day."],
	},
	{
		name: 'Treacherous Scree',
		source: 'GMG',
		page: 77,
		level: 3,
		traits: ['environmental'],
		stealth: {
			dc: 23,
			minProf: 'trained',
		},
		description: [
			'The footing on this sloped ground appears to be stable at first glance, but the tiny rocks that cover it are loosely packed and {@condition prone} to slipping.',
		],
		disable: {
			entries: ['DC 20 {@skill Survival} (trained) to navigate a safe path'],
		},
		actions: [
			{
				name: 'Rockslide',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature steps on the unstable ground',
				entries: [
					'Rocks tumble and slip beneath its feet. The triggering creature must attempt a DC 21 Reflex save as they tumble against the rocks, which deal {@damage 2d10+13} bludgeoning damage.',
					{
						type: 'successDegree',
						entries: {
							'Critical Success': ['The creature takes no damage.'],
							Success: [
								'The creature takes half damage and falls {@condition prone} in its space.',
							],
							Failure: [
								'The creature takes full damage, falls {@condition prone} in its space, and tumbles down to the bottom of the slope.',
							],
							'Critical Failure': ['As failure, but double damage.'],
						},
					},
				],
			},
		],
	},
	{
		name: 'Titanic Flytrap',
		source: 'GMG',
		page: 78,
		level: 4,
		traits: ['environmental'],
		stealth: {
			dc: 25,
			minProf: 'trained',
		},
		description: [
			'On the surface, a titanic flytrap appears to be a patch of the more common flytrap plant, but beneath murky waters it hides a far larger set of jaws, reaching 10 feet across and reinforced with woody branches and lined with paralytic hairs.',
		],
		disable: {
			entries: [
				"DC 22 {@skill Survival} (trained) to mislead the flytrap's sense of weight and pressure",
			],
		},
		defenses: {
			ac: {
				std: 21,
			},
			savingThrows: {
				fort: {
					std: 15,
				},
				ref: {
					std: 8,
				},
			},
			hp: {
				std: 56,
			},
			bt: {
				std: 28,
			},
			immunities: ['mental'],
			resistances: [
				{
					name: 'acid',
					amount: 20,
				},
				{
					name: 'fire',
					amount: 10,
				},
			],
		},
		actions: [
			{
				name: 'Snap Shut',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger:
					"A Small or Medium creature moves into a square that is within reach of the flytrap's {@condition hidden} jaws",
				entries: [
					"The flytrap's jaws snap shut, making a jaws {@action Strike} against the triggering creature.",
				],
			},
			{
				name: 'Devour',
				entries: [
					"The target is trapped by the flytrap's jaws, gaining the {@condition grabbed} condition until it Escapes (DC 21). Additionally, it is exposed to the titanic flytrap toxin from the hundreds of tiny hairs that line the inside of its leaves. If the flytrap's jaws {@action Strike} was a critical success, the target takes a \u20132 circumstance penalty to its saving throws against this poison. At the end of each of target's turns that it remains {@condition grabbed}, the target takes {@damage 3d6} acid damage.",
					{
						type: 'affliction',
						name: 'Titanic Flytrap Toxin',
						traits: ['contact', 'poison'],
						DC: 21,
						savingThrow: 'Fortitude',
						maxDuration: '4 rounds',
						stages: [
							{
								stage: 1,
								entry: '{@damage 2d6} poison damage and {@condition stunned||stunned 1}',
								duration: '1 round',
							},
							{
								stage: 2,
								entry: '{@damage 3d6} poison damage and {@condition stunned||stunned 2}',
								duration: '1 round',
							},
							{
								stage: 3,
								entry: '{@damage 4d6} poison damage and {@condition paralyzed}',
								duration: '1 round',
							},
						],
					},
				],
			},
		],
		attacks: [
			{
				range: 'Melee',
				name: 'jaws',
				attack: 17,
				damage: 'devour',
			},
		],
		reset: ['1 hour (or longer, after a large meal)'],
	},
	{
		name: 'Spectral Reflection',
		source: 'GMG',
		page: 78,
		level: 5,
		traits: ['haunt'],
		stealth: {
			dc: 26,
			minProf: 'expert',
		},
		description: [
			'The reflection in the mirror subtly twists and distorts, its expression taking on an unnerving sneer of malice.',
		],
		disable: {
			entries: ['DC 23 {@skill Religion} (trained) to exorcise the spirit, or DC 23'],
		},
		defenses: {
			ac: {
				std: 19,
			},
			savingThrows: {
				fort: {
					std: 15,
				},
				ref: {
					std: 10,
				},
			},
			hardness: {
				std: 13,
			},
			hp: {
				std: 50,
			},
			bt: {
				std: 25,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				name: 'Thievery',
				activity: {
					unit: 'varies',
					entry: 'trained',
				},
				components: ['to quickly cover the mirror'],
				entries: [],
			},
			{
				name: 'Spectral Impale',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger:
					'A living creature approaches within 15 feet of the mirror, and the mirror is lit with dim or brighter light',
				entries: [
					'Shadowy barbs impale the body of the reflected creature as the haunt makes a shadow barbs {@action Strike}.',
				],
			},
			{
				name: 'Sap Vitality',
				entries: [
					"A creature hit by the reflection's shadow barbs must attempt a DC 22 Fortitude save as the haunt tries to draw a portion of its vital essence into the mirror. The target is {@condition drained||drained 1} on a failed saving throw, or {@condition drained||drained 2} on a critical failure.",
				],
			},
		],
		attacks: [
			{
				range: 'Melee',
				name: 'shadow barbs',
				attack: 19,
				damage: '{@damage 4d8+9} negative plus sap vitality',
			},
		],
		reset: [
			'The haunt re-forms after 1 minute, manifesting in any mirror within its infused area (see Special below). Special Spectral reflections often infuse entire buildings, manifesting in any sufficiently large mirror. The example Hit Points and Hardness given represent a typical mirror reinforced by the haunt; at your discretion, the haunt might appear in reflective surfaces that are harder to destroy.',
			'Defeating a manifestation through damage destroys the surface, preventing the haunt from using it again. If this haunt appears in an area with many mirrors, consider giving PCs double or even triple the XP for a typical simple hazard.',
		],
	},
	{
		name: 'Ghostly Choir',
		source: 'GMG',
		page: 78,
		level: 6,
		traits: ['haunt'],
		stealth: {
			dc: 20,
			minProf: 'expert',
		},
		description: [
			'A choir of lost souls rises out of the floor, singing an eerie chant that terrifies its listeners and buffets their bodies with walls of sound.',
		],
		disable: {
			entries: [
				"DC 28 {@skill Performance} (trained) to disrupt the song's resonance with another tune or DC 28 {@skill Religion} (trained) to ritually silence the spirits",
			],
		},
		actions: [
			{
				name: 'Profane Chant',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['auditory', 'emotion', 'enchantment', 'fear', 'mental', 'occult'],
				trigger:
					'A creature moves within 10 feet of the section of floor from which the choir can arise',
				entries: [
					"The choir rises, and its song deals {@damage 4d8+18} mental damage to non-evil creatures within 30 feet of the souls' spectral forms.",
					'Affected creatures must each attempt a DC 24 Will save.',
					{
						type: 'successDegree',
						entries: {
							'Critical Success': ['The creature is unaffected.'],
							Success: [
								'The creature takes half damage and becomes {@condition frightened||frightened 1}.',
							],
							Failure: [
								'The creature takes full damage and becomes {@condition frightened||frightened 2}.',
							],
							'Critical Failure': [
								'The creature takes double damage. It also becomes {@condition frightened||frightened 3} and {@condition fleeing} for 1 round.',
							],
						},
					},
				],
			},
		],
	},
	{
		name: 'Green Slime',
		source: 'GMG',
		page: 78,
		level: 9,
		traits: ['environmental'],
		stealth: {
			dc: 30,
			minProf: 'expert',
		},
		description: [
			'A caustic green film clings to the ceiling above, watching for prey to pass beneath it.',
		],
		disable: {
			entries: [
				'DC 33 {@skill Survival} (expert) to carefully peel the slime off the ceiling without touching it',
			],
		},
		defenses: {
			ac: {
				std: 20,
			},
			savingThrows: {
				fort: {
					std: 25,
				},
				abilities: ['Ref +15'],
			},
			hp: {
				std: 200,
			},
			bt: {
				std: 100,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
			weaknesses: [
				{
					name: 'cold',
					amount: 20,
				},
				{
					name: 'fire',
					amount: 20,
				},
			],
		},
		actions: [
			{
				name: 'Dissolving Ambush',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature walks beneath the slime',
				entries: [
					'The green slime drops on top of the creature, attempting to dissolve it into a nutritious slurry. The target must attempt a DC 28 Reflex save.',
					{
						type: 'successDegree',
						entries: {
							'Critical Success': [
								'The target leaps out of the way, and it is unaffected.',
							],
							Success: [
								'A small amount of the slime splashes onto the target. The target is {@condition drained||drained 1}.',
							],
							Failure: [
								"The slime lands on its target. The target is {@condition drained||drained 1}, and this condition value increases by 1 at the end of its turn each round until the slime is removed. If the target reaches {@condition drained||drained 4}, the next time its {@condition drained} value would increase, it dies and collapses into a slurry of nutrients. A slime covering a target can no longer be removed through {@skill Survival} checks, and damage dealt to the slime is also dealt to the target (applying the target's immunities, weaknesses, and resistances rather than those of the green slime).",
							],
							'Critical Failure': [
								'The slime completely coats its target. This has the same effect as a failure, except the target is immediately {@condition drained||drained 2}, becomes {@condition drained||drained 4} after 1 round, and dies after 2 rounds.',
							],
						},
					},
				],
			},
		],
		reset: ['1 hour, as the slime feasts and then slowly creeps back up to the ceiling'],
	},
	{
		name: 'Jealous Abjurer',
		source: 'GMG',
		page: 79,
		level: 11,
		traits: ['haunt'],
		stealth: {
			dc: 33,
			minProf: 'master',
		},
		description: ['A robe-clad spirit rises out of the floor, pointing an accusing finger.'],
		disable: {
			entries: [
				"DC 36 {@skill Arcana}, {@skill Nature}, {@skill Occultism}, or {@skill Religion} (master) to convince the spirit that the target's magical knowledge is too great to be trifled with",
			],
		},
		actions: [
			{
				name: 'Rend Magic',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['abjuration', 'arcane'],
				trigger:
					'A creature that is currently affected by a beneficial spell approaches within 30 feet of the abjurer',
				entries: [
					'Envying the fame and magical prowess of others, the jealous abjurer attempts to engineer a catastrophic failure in the highest-level beneficial spell currently affecting its target. It attempts a counteract check with a +26 modifier. If the counteract check succeeds, the spell is dispelled, and the creature it had been affecting takes {@damage 4d12+30} force damage as the spell violently implodes (DC 32 basic Reflex save).',
				],
			},
		],
		reset: ['1 hour'],
	},
	{
		name: 'Plummeting Doom',
		source: 'GMG',
		page: 79,
		level: 15,
		traits: ['haunt'],
		stealth: {
			dc: 40,
			minProf: 'master',
			notes: 'to hear the echoes of a faraway object crashing into the ground',
		},
		description: [
			'Four vengeful spirits grab interlopers and toss them off the edge of a nearby 120-foot-tall cliff.',
		],
		disable: {
			entries: [
				'DC 40 {@skill Athletics} (trained) to push back so forcefully that the spirits fear being thrown off the cliff, or DC 40 {@skill Religion} (expert) to temporarily seal the spirits away',
			],
		},
		actions: [
			{
				name: 'Call of the Ground',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['divine', 'abjuration'],
				trigger: 'A creature approaches within 15 feet of the edge of the cliff',
				entries: [
					"Each spirit attempts to throw a creature within 60 feet of the cliff's edge off the cliff by attempting a check with a +26 modifier against the target's Fortitude DC. If the haunt succeeds, the target is thrown over the edge of the cliff, where it then falls 120 feet to the ground.",
					"Until the haunt is defeated, each creature within 60 feet of the cliff's edge must attempt a DC 40 Will save each time they would spend an action or reaction to {@action Arrest a Fall}, {@action Fly}, {@action Grab an Edge}, or otherwise avoid falling; if they fail the save, the action is disrupted. The haunt automatically attempts to counteract spells that would slow a fall or mitigate the effects of falling, such as feather fall, with a counteract modifier of +32.",
				],
			},
		],
		reset: ['1 hour'],
	},
	{
		name: 'Grasp of the Damned',
		source: 'GMG',
		page: 79,
		level: 17,
		traits: ['haunt'],
		stealth: {
			dc: 43,
			minProf: 'master',
		},
		description: [
			'These desperate spirits are the echoes of people who committed great atrocities in the name of an evil god.',
			'Now, they are left with only the knowledge that their souls have been damned, and the unwavering belief that they can better their fate by providing powerful sacrifices for their fiendish masters.',
		],
		disable: {
			entries: [
				'DC 46 {@skill Religion} (master) to inspire a deity to intervene and counteract the ritual',
			],
		},
		actions: [
			{
				name: 'Mark for Damnation',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['death', 'divine', 'necromancy'],
				trigger:
					"Three or more sentient living creatures of 13th level or higher enter the haunt's area",
				entries: [
					"The haunt deals {@damage 6d12+35} negative damage to each creature in the haunt's area, and each creature must attempt a DC 40 Will save.",
					{
						type: 'successDegree',
						entries: {
							'Critical Success': [
								'The creature takes no damage and is {@condition doomed||doomed 1}.',
							],
							Success: [
								'The creature takes half damage and is {@condition doomed||doomed 1}.',
							],
							Failure: [
								'The creature takes full damage, becomes {@condition doomed||doomed 2}, and is marked for damnation.',
							],
							'Critical Failure': [
								'The creature takes double damage, becomes {@condition doomed||doomed 3}, and is marked for damnation.',
								"If a creature that is marked for damnation dies within the next 24 hours, including from the haunt's damage, its soul is immediately dragged away to the plane of the evil deity that the damned spirits served, where the creature's soul is held captive by one of that deity's powerful servitors. Only wish and similarly potent effects are able to recover the lost soul directly; however, it is also possible to recover the soul by journeying to the evil plane and defeating the soul's captor.",
							],
						},
					},
				],
			},
		],
		reset: ['1 day'],
	},
	{
		name: 'Eternal Flame',
		source: 'GMG',
		page: 80,
		level: 7,
		traits: ['complex', 'haunt'],
		stealth: {
			bonus: 18,
			minProf: 'expert',
		},
		description: [
			'A raging spectral inferno arises out of thin air, strengthening all undead creatures within its area. This haunt most often arises from the charred remains of a group of three people who burned to death, whether in a terrible accident or a deliberate execution, and their unavenged souls burn with rage.',
		],
		disable: {
			entries: [
				'DC 27 {@skill Diplomacy} (expert) to temporarily calm the rage of one of the three spirits, or DC 30 {@skill Religion} (trained) to exorcise one of the spirits; three total successes are required to disable the haunt',
			],
		},
		actions: [
			{
				name: 'Searing Agony',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['divination', 'mental'],
				trigger:
					'A living creature approaches within 10 feet of the remains of a victim of the original fire',
				entries: [
					"Memories of the pain suffered by the fire's past victims assault the triggering creature's mind. The creature must attempt a DC 25 Will save, and the haunt then rolls initiative.",
					{
						type: 'successDegree',
						entries: {
							'Critical Success': ['The creature is unaffected.'],
							Success: ['The creature is {@condition sickened||sickened 1}.'],
							Failure: ['The creature is {@condition sickened||sickened 2}.'],
							'Critical Failure': [
								"The creature is {@condition sickened||sickened 3}, and it is {@condition flat-footed} for as long as it remains within the haunt's area and for 3 rounds thereafter.",
							],
						},
					},
				],
			},
		],
		routine: [
			'(1 action) Phantom flames rage across the haunted area, dealing {@damage 4d6} fire damage to each living creature within the area (DC 23 basic Will save). Undead creatures in the area are infused with flames for the following round.',
			'They gain the {@trait fire} trait and immunity to fire, and all their attacks deal an additional {@damage 1d6} fire damage. Objects in the area are unaffected.',
		],
		reset: [
			'The flames cease 1 minute after all living creatures leave the area, but after 1 hour, the anger and pain simmer up and the haunt is ready to trigger again.',
		],
	},
	{
		name: 'Confounding Betrayal',
		source: 'GMG',
		page: 80,
		level: 8,
		traits: ['complex', 'haunt'],
		stealth: {
			bonus: 21,
			minProf: 'expert',
		},
		description: [
			'Allies appear to shed their disguises and reveal themselves to be malevolent monsters.',
		],
		disable: {
			entries: [
				"DC 28 {@skill Deception} (expert) twice to confound the haunt with your own deceptions, or DC 28 {@skill Occultism} (trained) twice to create a ward against the haunt's mental influence",
			],
		},
		actions: [
			{
				name: 'Unmask',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['illusion', 'occult'],
				trigger: "Two or more creatures enter the haunt's area",
				entries: [
					'Each creature sees the forms of nearby creatures shift and change, appearing to transform into fiendish or aberrant beings with a thirst for blood. Each creature in the area must attempt a DC 30 Will save.',
					{
						type: 'successDegree',
						entries: {
							'Critical Success': [
								"The creature sees through the illusions entirely and is temporarily immune to the haunt's routine for 1 minute.",
							],
							Success: ['The creature is unaffected by the strange images.'],
							Failure: [
								"The creature believes the illusions to be true; if they become {@condition confused} by the haunt's routine, they can't attempt flat checks to end the {@condition confused} condition when they take damage.",
							],
							'Critical Failure': [
								"As failure, but the creature is left with a lingering suspicion of others and can't benefit from {@action Aid} reactions for 24 hours.",
							],
						},
					},
				],
			},
		],
		routine: [
			"(1 action; illusion, incapacitation, occult) The haunt continues to confound victims' senses and inspire them to commit violence against each other. Each creature in the haunt's area must attempt a DC 26 Will save.",
			{
				type: 'successDegree',
				entries: {
					'Critical Success': [
						'The creature is unaffected and temporarily immune for 1 minute.',
					],
					Success: ['The creature is unaffected.'],
					Failure: ['The creature is {@condition confused} for 1 round.'],
					'Critical Failure': ['The creature is {@condition confused} for 1 minute.'],
				},
			},
		],
		reset: [
			'The haunt deactivates 1 minute after all creatures leave the area but resets immediately thereafter.',
		],
	},
	{
		name: 'Perilous Flash Flood',
		source: 'GMG',
		page: 80,
		level: 10,
		traits: ['complex', 'environmental'],
		stealth: {
			bonus: 22,
			minProf: 'expert',
		},
		description: [
			'Whether made up of water rushing through the streets that sweeps up dangerous debris along the way or a less natural substance bursting free of its container, this relentless flood batters everything in its path.',
		],
		disable: {
			entries: [
				'three DC 35 {@skill Athletics}, {@skill Crafting}, or {@skill Survival} checks to move or construct barricades strong enough to create a shelter from the flood. While this creates a safe place to stand, creatures outside of the barricaded area may still be in danger depending on the nature and the source of the flood.',
			],
		},
		actions: [
			{
				name: 'Burst Free',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: "A creature or effect breaks the flood's containment",
				entries: ['The hazard rolls initiative as the flood surges forth.'],
			},
		],
		routine: [
			'(1 action) The flood advances forward 60 feet, crashing into all creatures within its area. Each creature must attempt a DC 30 Fortitude save as the floodwaters pummel them and pull them downstream. The amount and type of damage dealt are based on the nature of the flood, and certain types of floods impose additional effects. The turbulent waters mean creatures within the area of the flood must attempt a DC 20 {@skill Athletics} check to {@action Swim} in order to move, and those who do not succeed at a check to {@action Swim} each round may drown.',
			{
				type: 'successDegree',
				entries: {
					'Critical Success': ['The creature takes no damage.'],
					Success: ['The creature takes half damage.'],
					Failure: [
						'The creature takes full damage and is moved 10 feet along with the water.',
					],
					'Critical Failure': [
						'The creature takes double damage and is moved 20 feet along with the water.',
					],
				},
			},
			{
				type: 'list',
				items: [
					'Acidic Runoff This caustic flood dissolves flesh as it moves, dealing {@damage 1d12} bludgeoning damage and {@damage 1d12+8} acid damage. Additionally, it deals {@damage 2d6} {@condition persistent damage||persistent acid damage} to creatures who critically fail their Fortitude saves.',
					'Battering Waves This flood of rushing water deals {@damage 2d12+10} bludgeoning damage.',
					'Repulsive Refuse This flood has picked up tainted or disease-ridden objects like sewer runoff or rotting food.',
				],
			},
			'It deals {@damage 2d12+8} bludgeoning damage. Each creature exposed to the flood must attempt a DC 29 Fortitude save, becoming {@condition sickened||sickened 1} on a failure or {@condition sickened||sickened 2} on a critical failure. Additionally, creatures who come into contact with the flood waters are exposed to filth fever (DC 20 Fortitude, Bestiary 258).',
			{
				type: 'list',
				items: [
					'Sharp Debris The waters have picked up various objects, some of which are particularly sharp. The flood deals {@damage 1d12} bludgeoning damage and {@damage 1d12+12} piercing damage.',
					'Sticky Goo The substance is particularly sticky. It deals {@damage 2d12+6} bludgeoning damage. Additionally, each creature in the flood must attempt a DC 29 Reflex save at the beginning of their turn each round. On a failed saving throw, they take a \u201310-foot circumstance penalty to all their Speeds for 1 round. On a critical failure, they are instead {@condition immobilized} for 1 round.',
				],
			},
		],
	},
	{
		name: 'Flensing Blades',
		source: 'GMG',
		page: 81,
		level: 12,
		traits: ['complex', 'haunt'],
		stealth: {
			bonus: 25,
			minProf: 'expert',
		},
		description: [
			'A whirling tornado of spectrally propelled glass and steel slices whatever it touches to ribbons.',
		],
		disable: {
			entries: [
				'DC 35 {@skill Thievery} (master) to precisely adjust the blades so that they destroy each other, or DC 38 {@skill Religion} (expert) to weaken the haunt; four successes are required to disable it',
			],
		},
		defenses: {
			ac: {
				std: 33,
			},
			savingThrows: {
				fort: {
					std: 27,
				},
				ref: {
					std: 25,
				},
				will: {
					std: 22,
				},
			},
			hardness: {
				std: 20,
			},
			hp: {
				std: 100,
			},
			bt: {
				std: 50,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
			weaknesses: [
				{
					name: 'positive',
					amount: 15,
				},
			],
		},
		actions: [
			{
				name: 'Whirling Blades',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger:
					'Three or more creatures enter the area of the haunt; Effect sharp fragments lift up from the ground and begin to spin in rapid circles taking up one 5-foot square. The haunt rolls initiative.',
				entries: [],
			},
		],
		routine: [
			'(3 actions) The tornado of blades uses 3 actions to move, traveling up to 30 feet with each action and dealing {@damage 2d10+10} slashing damage. Each creature in its path must attempt a DC 33 Reflex save.',
			{
				type: 'successDegree',
				entries: {
					'Critical Success': ['The creature is unaffected.'],
					Success: ['The creature takes half damage.'],
					Failure: [
						'The creature takes full damage plus {@damage 1d10} {@condition persistent damage||persistent bleed damage}.',
					],
					'Critical Failure': [
						"The creature takes double damage and {@damage 1d10} {@condition persistent damage||persistent bleed damage}. It also becomes {@condition wounded||wounded 1} (or increases its {@condition wounded} value by 1, if it is already {@condition wounded}). Each successful check to disable this hazard reduces the haunt's movement by 30 feet, and the fourth success disables it completely.",
					],
				},
			},
		],
		reset: [
			'The haunt draws jagged shards back into its area over the course of an hour, after which it can trigger again.',
		],
	},
	{
		name: 'Dance of Death',
		source: 'GMG',
		page: 81,
		level: 16,
		traits: ['complex', 'haunt'],
		stealth: {
			bonus: 32,
			minProf: 'master',
		},
		description: [
			'An eerie orchestra compels all who hear it to dance until they collapse from exhaustion.',
		],
		disable: {
			entries: [
				'DC 42 {@skill Intimidation} (expert) three times to frighten dancers and spectral musicians alike away from participating in the deadly performance, DC 40 {@skill Performance} (master) twice to produce a tune discordant enough to disrupt the compulsion, or DC 42 {@skill Religion} (master) three times to banish the spirits with prayers',
			],
		},
		actions: [
			{
				name: 'Prelude',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['auditory', 'enchantment', 'incapacitation', 'occult'],
				trigger: 'A creature approaches within 30 feet of the orchestra',
				entries: [
					'The orchestra compels all creatures that can hear it to begin dancing. Each creature must attempt a',
				],
			},
			{
				name: 'DC 41',
				entries: [
					'Will save, with the following effects.',
					{
						type: 'successDegree',
						entries: {
							'Critical Success': ['The creature is unaffected.'],
							Success: [
								'The creature is {@condition flat-footed} and cannot use reactions. Additionally, it must spend 1 of its actions each round dancing. Dancing is a move action that allows the creature to {@action Stride} up to half its Speed.',
							],
							Failure: [
								'As success, except the creature must spend 2 of its actions each round dancing.',
							],
							'Critical Failure': [
								'As failure, except the creature must spend 3 of its actions each round dancing.',
							],
						},
					},
				],
			},
		],
		routine: [
			'(1 action; auditory, enchantment, incapacitation, occult) The orchestra performs a raucous tune, compelling all creatures that can hear it to spend actions dancing.',
			'Each round, creature must attempt a DC 37 Will save; the results of this save modify the number of actions that the creature must spend dancing each round. If this would cause the creature to spend more actions dancing than it can use on its turn, the creature takes {@dice 10d6} damage (or double that on a critical failure) from moving faster than its body can manage.',
			{
				type: 'successDegree',
				entries: {
					'Critical Success': [
						'The creature decreases the number of actions it must spend dancing by 1.',
					],
					Success: ['No effect.'],
					Failure: ['The creature increases the actions it must spend dancing by 1.'],
					'Critical Failure': [
						'The creature increases the actions it must spend dancing by 2.',
					],
				},
			},
		],
		reset: [
			'The eerie orchestra spends an hour retuning its phantasmal instruments, after which it is ready to begin its routine again.',
		],
	},
	{
		name: 'Vengeful Furnace',
		source: 'AV1',
		page: 46,
		level: 4,
		traits: ['complex', 'haunt'],
		stealth: {
			bonus: 15,
			minProf: 'expert',
		},
		description: [
			'The hatch atop the haunted furnace flips open and disgorges a pair of shrieking, burning ghosts.',
		],
		disable: {
			entries: [
				'DC 22 {@skill Intimidation} (trained) to cow one of the vengeful spirits or DC 25 {@skill Religion} (trained) to exorcise the spirit. The haunt remains active until both spirits are cowed or exorcised, or until the furnace is destroyed.',
			],
		},
		defenses: {
			ac: {
				std: 21,
			},
			savingThrows: {
				fort: {
					std: 15,
				},
				ref: {
					std: 8,
				},
			},
			hardness: {
				std: 13,
			},
			hp: {
				std: 60,
			},
			bt: {
				std: 30,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
			weaknesses: [
				{
					amount: 8,
					name: 'cold',
				},
				{
					amount: 5,
					name: 'positive',
				},
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['divine', 'enchantment', 'fire', 'mental'],
				trigger:
					'A living creature with an Intelligence score of 15 or higher enters the room, or any creature touches the furnace',
				entries: [
					"Burning ghosts burst from the furnace, exposing the triggering creature to the haunt's burn knowledge effect. The haunt rolls initiative.",
				],
				name: 'Ghostly Assault',
			},
			{
				traits: ['divine', 'enchantment', 'fire', 'mental'],
				entries: [
					"The target of the haunt's initial Ghostly Assault, as well as any creature later hit by a burning lash {@action Strike}, loses random memories, as if these thoughts were incinerated like pages in a burning book. The creature must attempt a DC 23 Will save.",
					{
						type: 'successDegree',
						entries: {
							'Critical Success': 'The creature is unaffected.',
							Success:
								'The creature becomes {@condition stupefied|CRB|stupefied 1} for 1 minute while they forget random memories, as if these thoughts were incinerated like pages in a burning book.',
							Failure:
								'As success, but the {@condition stupefied|CRB|stupefied 1} condition persists for 24 hours.',
							'Critical Failure':
								'As failure, but {@condition stupefied|CRB|stupefied 2}.',
						},
					},
				],
				name: 'Burn Knowledge',
			},
		],
		routine: [
			'(3 actions) The burning ghosts lash at a random {@condition stupefied} creature in the room (or any random creature, if no creatures in the room are {@condition stupefied}).',
			{
				type: 'attack',
				range: 'Ranged',
				name: 'burning lash',
				attack: 14,
				traits: ['fire', 'mental', 'range <10 feet>'],
				effects: ['burn knowledge'],
				damage: '{@damage 2d6} fire plus {@damage 2d6} mental and burn knowledge',
				types: ['fire', 'mental'],
				noMAP: true,
			},
		],
		reset: ['The haunt resets 1 hour after there are no creatures in the room.'],
	},
	{
		name: 'Viper Urn',
		source: 'TiO',
		page: 31,
		level: 1,
		traits: ['uncommon', 'mechanical', 'trap'],
		stealth: {
			dc: 15,
			notes: '{@skill Perception} check',
		},
		description: [
			'A ceramic urn containing a coiled viper tips and shatters when a tripwire is pulled.',
		],
		disable: {
			entries: [
				'DC 15 {@skill Thievery} (trained) to stabilize the urn, or DC 15 {@skill Athletics} to carefully lower the heavy urn',
			],
		},
		defenses: {
			ac: {
				std: 15,
			},
			savingThrows: {
				fort: {
					std: 8,
				},
				ref: {
					std: 5,
				},
			},
			hardness: {
				std: 6,
			},
			hp: {
				std: 4,
			},
			bt: {
				std: 2,
			},
			immunities: ['critical hits', 'sneak attack'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['attack'],
				entries: [
					'When someone pulls the trip wire, the urn smashes against a creature in the doorway, making a shattering urn {@action Strike} against that creature, then releases a {@creature Snake, Viper|bb|viper} into the square that contained the trap. The viper attacks any non-plant creature it detects.',
				],
				name: 'Topple',
			},
		],
		attacks: [
			{
				range: 'Melee',
				name: 'shattering urn',
				attack: 12,
				traits: ['deadly <1d10>'],
				damage: '{@damage 2d6+5} slashing',
				types: ['slashing'],
			},
		],
	},
	{
		name: 'Vision Of Dahak',
		source: 'AoA2',
		page: 10,
		level: 8,
		traits: ['rare', 'complex', 'fire', 'magical', 'trap'],
		stealth: {
			bonus: 16,
			minProf: 'expert',
		},
		description: [
			'Blasts of fire and smoke pour out of the tunnel walls to coalesce into the burning form of {@deity Dahak|LOGM} himself; a PC who succeeds at a DC 20 {@skill Religion} check to {@action Recall Knowledge} notes that the fiery dragon closely resembles classical depictions of the draconic god of destruction.',
		],
		disable: {
			entries: [
				"{@skill Religion} DC 26 (expert) to utter prayers to a nonevil deity to counteract {@deity Dahak|LOGM}'s presence (prayers to {@deity Apsu|LOGM} allow this check to be made if the character is merely trained in {@skill Religion}), {@skill Thievery} DC 30 (expert) to divert the hazard's energies back upon themselves, or a successful dispel magic (4th level; counteract DC 26).",
			],
		},
		defenses: {
			ac: {
				std: 27,
			},
			savingThrows: {
				fort: {
					std: 17,
				},
				ref: {
					std: 13,
				},
			},
			hp: {
				std: 130,
			},
			immunities: ['critical hits', 'fire', 'object immunities', 'precision damage'],
			weaknesses: [
				{
					amount: 10,
					name: 'cold',
				},
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature is within the way station.',
				entries: [
					'The vision of {@deity Dahak|LOGM} appears in a 15-foot space adjacent to that creature and rolls initiative.',
				],
				name: 'Manifest',
			},
		],
		routine: [
			'(2 actions) The vision of {@deity Dahak|LOGM} manifests next to the creature that is closest to the center of the way station, then uses its Breath Weapon in a direction that catches the most possible targets in its area.',
			{
				activity: {
					number: 2,
					unit: 'action',
				},
				traits: ['divine', 'evocation', 'fire'],
				entries: [
					'The vision of {@deity Dahak|LOGM} unleashes a blast of fire from its burning maw, creating a 60-foot cone that deals {@damage 6d6} fire damage to all creatures within (DC 26 basic Reflex save).',
				],
				type: 'ability',
				name: 'Breath Weapon',
			},
		],
		reset: [
			'The vision of {@deity Dahak|LOGM} deactivates and resets automatically once no creatures remain within the Huntergate way station.',
		],
	},
	{
		name: 'Vorpal Executioner',
		source: 'CRB',
		page: 525,
		level: 19,
		traits: ['mechanical', 'trap'],
		stealth: {
			dc: 43,
			minProf: 'expert',
		},
		description: [
			'A wickedly sharp saw blade descends and travels along grooves in a complex path throughout the room, attempting to decapitate everyone within.',
		],
		disable: {
			entries: [
				"{@skill Thievery} DC 41 (expert) at four different junctions to jam all the saw blade's possible paths, preventing it from traveling through the room.",
			],
		},
		defenses: {
			ac: {
				std: 43,
			},
			savingThrows: {
				fort: {
					std: 32,
				},
				ref: {
					std: 32,
				},
			},
			hardness: {
				std: 30,
			},
			hp: {
				std: 120,
				notes: {
					std: 'per junction',
				},
			},
			bt: {
				std: 60,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['attack', 'death'],
				trigger: 'A creature attempts to exit the room.',
				entries: [
					'The saw blade travels along its path, making one {@action Strike} against each creature in the room, twisting and varying its height for a maximum chance of beheading its targets.',
				],
				name: 'Total Decapitation',
			},
			{
				entries: [
					'On a critical hit, a target must succeed at a DC 39 Fortitude save or be decapitated, {@condition dying} instantly unless it can survive without a head.',
				],
				name: 'Decapitation',
			},
		],
		reset: [
			'The trap resets over the course of the round and can be triggered again 1 round later.',
		],
		attacks: [
			{
				range: 'Melee',
				name: 'saw blade',
				attack: 40,
				traits: ['deadly <d12>'],
				effects: ['decapitation'],
				damage: '{@damage 6d12+25} slashing plus decapitation',
				types: ['slashing'],
				noMAP: true,
			},
		],
	},
	{
		name: 'Wailing Crystals',
		source: 'AoA4',
		page: 9,
		level: 13,
		traits: ['complex', 'environmental', 'magical'],
		stealth: {
			bonus: 27,
			minProf: 'master',
			notes: 'or DC 37 (master) to notice what appear to be screaming ghostly faces in the crystals',
		},
		description: [
			'Three clusters of gleaming, colorful crystals are corrupted with necromantic energy that causes them to reflect negative emotions. All three must be disabled or destroyed to negate the hazard.',
		],
		disable: {
			entries: [
				'{@skill Thievery} DC 29 (master) to carefully fracture the crystals or {@skill Crafting} DC 27 (expert) to place objects to stop the resonance, both disabling one 5-foot patch of crystals.',
			],
		},
		defenses: {
			ac: {
				std: 34,
			},
			savingThrows: {
				fort: {
					std: 26,
				},
				ref: {
					std: 18,
				},
			},
			hardness: {
				std: 18,
			},
			hp: {
				std: 72,
				notes: {
					std: 'per 5-foot patch',
				},
			},
			bt: {
				std: 36,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['occult'],
				trigger: 'A living creature approaches within 20 feet of a wailing crystal.',
				entries: [
					'A despairing chorus of cries echoes off the crystals, working its way into the minds of all living creatures in Jewelgate Way Station, affecting them with {@spell crushing despair} (7th level, DC 33). The hazard rolls initiative.',
				],
				name: 'Echoing Cry',
			},
		],
		routine: [
			'(3 actions) The hazard uses each action for an Anguished Shriek. The wailing crystals lose 1 action for each 5-foot patch of crystals that is {@condition broken} or destroyed.',
			{
				traits: ['emotion', 'enchantment', 'mental', 'occult', 'sonic'],
				entries: [
					'A shrieking, distorted face composed of writhing necromantic energy lances out of the crystals to target a random living creature within 20 feet. The target takes {@damage 4d6} mental damage and {@damage 4d6} sonic damage (DC 33 basic Will save).',
				],
				type: 'ability',
				name: 'Anguished Shriek',
			},
		],
		reset: [
			'The wailing crystals deactivate and reset once no living creatures are within 20 feet.',
		],
	},
	{
		name: 'Watching Wall',
		source: 'AV1',
		page: 37,
		level: 4,
		traits: ['complex', 'haunt'],
		stealth: {
			bonus: 12,
			minProf: 'expert',
		},
		description: [
			'An overwhelming feeling of being watched wells up in the minds of those in the room, an instant before an eerie red eye opens in the western wall.',
		],
		disable: {
			entries: [
				'DC 22 {@skill Deception} (trained) to appear uninteresting to the watching eye (and thus be ignored by it) or DC 22 {@skill Religion} (trained) to ward against being seen by or affected by the eye.',
			],
		},
		routine: [
			"(1 action) The eye glances about, and those it can see (whether in area C4 or outside of it) take {@damage 4d6} mental damage (DC 21 basic Will save) as fears of being watched impart ripples of pain. A creature that takes mental damage from this effect doesn't reduce their {@condition frightened} value at the end of their next turn.",
		],
		reset: [
			'The haunt becomes inert at the end of any round in which there are no {@condition frightened} creatures it can see.',
			'It stays dormant for 1 hour, after which point it resets.',
		],
	},
	{
		name: 'Waxworks Onslaught Trap',
		source: 'AoE4',
		page: 60,
		level: 16,
		traits: ['complex', 'magical', 'trap'],
		stealth: {
			bonus: 27,
			minProf: 'master',
		},
		description: [
			'Four huge tubs containing congealed wax, enchanted to melt and envelop unwary intruders, each sit atop a cold fire.',
		],
		disable: {
			entries: [
				'{@skill Thievery} DC 43 (master) to drain the wax from a tub or {@skill Athletics} DC 45 (master) to push through the wax blocking a sealed door and escape (other creatures must push their own way through, as the wax reseals)',
			],
		},
		defenses: {
			ac: {
				std: 39,
			},
			savingThrows: {
				fort: {
					std: 30,
				},
				ref: {
					std: 25,
				},
			},
			hardness: {
				Tub: 25,
			},
			hp: {
				Tub: 104,
				std: 72,
				notes: {
					Tub: 'to destroy a tub and prevent it from making any further attacks',
					std: 'to destroy the wax on a sealed door and allow anyone to escape through the door',
				},
			},
			bt: {
				Tub: 52,
				std: 36,
			},
			immunities: [
				'critical hits',
				'fire (tubs only)',
				'object immunities',
				'precision damage',
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature comes within 5 feet of a tub',
				entries: [
					"The fires beneath the vats blaze to life, magically melting the wax in the tubs. The tubs emit gouts of wax over the room's exits, sealing them shut. The trap then rolls initiative.",
				],
				name: 'Seal Room',
			},
		],
		routine: [
			'(4 actions) The trap loses 1 action each turn per {@condition drained} or destroyed tub. On each action, a different tub spews hot wax at a random creature in the room, dealing {@damage 3d12} fire damage to the target and all adjacent creatures (DC 35 basic Reflex save). On a failure or critical failure, the creature is also encased in hot wax.',
			'A creature that starts its turn encased in wax takes {@damage 8d12} fire damage and is {@condition immobilized} until it Escapes the hardening wax (DC 35). Each turn it remains encased, the damage dealt by the hot wax decreases by {@dice 2d12} but.',
			{
				entries: [
					"{@action Escape} increases by 2 (minimum 0 damage, maximum DC 43). A creature that can't get free from the wax might suffocate (Core Rulebook 478).",
				],
				type: 'ability',
				name: 'the DC to',
			},
		],
		reset: [
			'The trap deactivates and resets after 1 hour. At that time, the wax in the tubs cools and congeals, and any wax elsewhere in the room magically goes back into the tubs.',
		],
	},
	{
		name: 'Web Lurker Deadfall',
		source: 'B1',
		page: 325,
		level: 3,
		traits: ['mechanical', 'trap'],
		stealth: {
			dc: 23,
		},
		description: [
			'A web tripwire lets loose a bundle of boulders that fall on all targets within a 10-foot square.',
		],
		disable: {
			entries: [
				'{@skill Survival} (trained) or {@skill Thievery} (expert) DC 20 to rearrange the webbing',
			],
		},
		defenses: {
			ac: {
				std: 19,
			},
			savingThrows: {
				fort: {
					std: 9,
				},
				ref: {
					std: 9,
				},
			},
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature steps into the square with the web tripwire.',
				entries: [
					"All creatures in the trap's 10-foot square take {@damage 2d6} bludgeoning damage (DC 20 basic Reflex save).",
				],
				name: 'Deadfall',
			},
		],
	},
	{
		name: 'Web Lurker Noose',
		source: 'B1',
		page: 325,
		level: 2,
		traits: ['mechanical', 'trap'],
		stealth: {
			dc: 22,
		},
		description: ['Discreet webbing at throat level snags a creature that walks into it.'],
		disable: {
			entries: [
				'{@skill Survival} (trained) or {@skill Thievery} (expert) DC 18 to rearrange the webbing',
			],
		},
		defenses: {
			ac: {
				std: 18,
			},
			savingThrows: {
				fort: {
					std: 11,
				},
				ref: {
					std: 5,
				},
			},
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['attack'],
				trigger: 'A creature steps into the square with the web tripwire.',
				entries: [
					'The web lurker noose makes a noose {@action Strike} against the triggering creature.',
				],
				name: 'Web Noose',
			},
		],
		attacks: [
			{
				range: 'Melee',
				name: 'noose',
				attack: 13,
				effects: ['deadly <d10>'],
				damage: "{@damage 3d6} bludgeoning and the target is {@condition grabbed} and pulled off the ground ({@action Escape} DC 22). The target takes {@damage 1d6} bludgeoning damage at the end of each of its turns as long as it's caught in the noose.",
				types: ['bludgeoning'],
			},
		],
	},
	{
		name: 'Web Lurker Noose',
		source: 'TiO',
		page: 17,
		level: 2,
		traits: ['mechanical', 'trap'],
		stealth: {
			dc: 22,
			notes: '{@skill Perception} check',
		},
		description: ['Discreet webbing at throat level snags a creature that walks into it.'],
		disable: {
			entries: [
				'DC 18 {@skill Survival} (trained) or {@skill Thievery} (expert) to rearrange the webbing',
			],
		},
		defenses: {
			ac: {
				std: 18,
			},
			savingThrows: {
				fort: {
					std: 11,
				},
				ref: {
					std: 5,
				},
			},
			hardness: {
				Noose: 4,
			},
			hp: {
				Noose: 16,
				notes: {
					Noose: 'to cut the web noose',
				},
			},
			bt: {
				Noose: 8,
			},
			immunities: ['critical hits', 'sneak attack'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['attack'],
				entries: [
					'If a creature steps into the square with the web trip wire, the web lurker noose makes a noose Strike against the creature.',
				],
				name: 'Web Noose',
			},
		],
		attacks: [
			{
				range: 'Melee',
				name: 'noose',
				attack: 13,
				effects: ['deadly <d10>'],
				damage: '{@damage 3d6} bludgeoning and the target gains the {@condition grabbed} condition is and pulled off the ground ({@action Escape} DC 22).',
				types: ['bludgeoning'],
			},
		],
	},
	{
		name: 'Wheel Of Misery',
		source: 'CRB',
		page: 527,
		level: 6,
		traits: ['complex', 'magical', 'mechanical', 'trap'],
		stealth: {
			bonus: 16,
			minProf: 'expert',
			notes: 'to detect the magical sensor; noticing the wheel has a DC of 0.',
		},
		description: [
			'An ornate wheel set into a wall\u2014divided into six segments with colored runes on each\u2014is {@condition controlled} by a magical sensor that detects any creature within 100 feet in front of it.',
		],
		disable: {
			entries: [
				'{@skill Thievery} DC 26 (expert) on the wheel to stop it from spinning, {@skill Thievery} DC 22 (master) to erase each rune, or dispel magic (4th level; counteract DC 22) to counteract each rune.',
			],
		},
		defenses: {
			ac: {
				std: 24,
			},
			savingThrows: {
				fort: {
					std: 15,
				},
				ref: {
					std: 13,
				},
			},
			hardness: {
				std: 14,
			},
			hp: {
				std: 56,
			},
			bt: {
				std: 28,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: "A creature enters the sensor's detection area.",
				entries: ['The wheel begins to spin and rolls initiative.'],
				name: 'Wheel Spin',
			},
		],
		routine: [
			"(2 actions) On its initiative, the trap uses its first action to spin, then stops. Roll {@dice 1d6} to determine which segment is topmost when the wheel stops spinning. The wheel uses its second action to replicate the spell listed for that segment (3rd level, DC 24, spell attack roll +14). This spell's target is centered on or otherwise includes the nearest creature in the area. This increases the spell's range to 100 feet if necessary.",
			'Any spell cast by this trap is arcane.',
		],
	},
	{
		name: "Witch-priests' Curse",
		source: 'EC5',
		page: 34,
		level: 18,
		traits: ['curse', 'magical', 'trap'],
		stealth: {
			dc: 42,
			minProf: 'expert',
		},
		description: ['Anyone who opens a secret compartment is subjected to a powerful curse.'],
		disable: {
			entries: [
				'DC 39 {@skill Thievery} (legendary) to carefully remove the bone fetish that holds the curse.',
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['curse', 'divine', 'necromancy'],
				trigger: 'A creature opens a secret compartment',
				entries: [
					"The creature must succeed at a DC 38 Will save or be subjected to the witch-priests' curse. Whenever a cursed creature takes at least 10 piercing or slashing damage from a single attack, it also takes {@damage 3d6} {@condition persistent damage||persistent bleed damage}. In addition, the cursed creature regains only half as many Hit Points as normal from all healing. The effect is permanent unless removed by magic.",
				],
				name: 'Hex of the Bloody Thief',
			},
		],
		reset: ['The trap resets if both secret compartments are shut.'],
	},
	{
		name: 'Wrath Of The Destroyer',
		source: 'AoA2',
		page: 57,
		level: 10,
		traits: ['complex', 'magical', 'trap'],
		stealth: {
			bonus: 22,
			minProf: 'expert',
			notes: 'to notice subtle vapors of magical energy seething across the doors.',
		},
		description: [
			"These heavy doors, carved with an image of {@deity Dahak|LOGM}, echo with a hatred so powerful that it can kill anyone who comes nearby, manifesting a vision of {@deity Dahak|LOGM}'s head emerging from the doors to strike at a foe.",
		],
		disable: {
			entries: [
				'{@skill Thievery} DC 29 (expert) to disrupt the divine magic, {@skill Religion} DC 29 (expert) to placate the wrathful energies, or {@spell dispel magic} (5th level; counteract DC 26).',
			],
		},
		defenses: {
			ac: {
				std: 30,
			},
			savingThrows: {
				fort: {
					std: 22,
				},
				ref: {
					std: 14,
				},
			},
			hardness: {
				'Door ': 18,
			},
			hp: {
				'Door ': 72,
			},
			bt: {
				'Door ': 36,
			},
			immunities: ['critical hits', 'fire', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger:
					'A non-worshipper of {@deity Dahak|LOGM} touches either door leading to {@b C7}',
				entries: [
					'The hazard targets the creature with Face of the Fatal Divine, then rolls initiative.',
				],
				name: 'Expunge',
			},
		],
		routine: [
			'(1 action) On its initiative, the wrath of the destroyer targets the closest target in area {@b C6} with Face of the Fatal Divine.',
			{
				activity: {
					number: 1,
					unit: 'action',
				},
				traits: ['death', 'divine', 'emotion', 'fear', 'illusion', 'mental'],
				entries: [
					'The creature beholds the face of {@deity Dahak|LOGM} as it emerges to bite with its burning jaws, targeting the creature with {@spell phantasmal killer} (5th level, Will DC 29).',
				],
				type: 'ability',
				name: 'Face of the Fatal Divine',
			},
		],
		reset: [
			'The trap deactivates and resets if 1 minute passes without any creature being in range.',
		],
	},
	{
		name: "Wronged Monk's Wrath",
		source: 'FRP1',
		page: 17,
		level: 13,
		traits: ['haunt'],
		stealth: {
			dc: 32,
			minProf: 'trained',
		},
		description: ["A monk's tormented spirit attacks intruders."],
		disable: {
			entries: [
				'DC 32 {@skill Lore||Irori Lore} (trained) to clean the room and return the prayer items to their proper arrangement, DC 37 {@skill Religion} (expert) to state an Iroran prayer of peace and put the haunt to rest, or DC 40 {@skill Occultism} (master) to create a ward against future hauntings.',
			],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature enters the prayer room',
				entries: [
					"The abbot's spirit appears and begins to channel powerful ki energy. One round later, the room fills with a powerful kinetic storm, dealing {@damage 3d10+15} electricity damage and {@damage 3d10+15} force damage to all creatures in the room. Creatures in the room must attempt a DC 37 Reflex save.",
					{
						type: 'successDegree',
						entries: {
							'Critical Success': 'The creature is unaffected.',
							Success: 'The creature takes half damage.',
							Failure:
								'The creature takes full damage and becomes {@condition deafened} for 1 round.',
							'Critical Failure':
								'The creature takes full damage, {@damage 2d8} {@condition persistent damage||persistent electricity damage}, and becomes {@condition deafened} for 1 minute.',
						},
					},
				],
				name: 'Ki Storm',
			},
		],
		reset: [
			"The haunt re-forms after 1 hour. The haunt becomes disabled and doesn't re-form if a creature lights all of the candles in the room and offers a prayer to {@deity Irori}.",
		],
	},
	{
		name: 'Yellow Mold',
		source: 'CRB',
		page: 524,
		level: 8,
		traits: ['environmental', 'fungus'],
		stealth: {
			dc: 28,
			minProf: 'trained',
		},
		description: ['Poisonous mold spores assault nearby creatures.'],
		disable: {
			entries: [
				'{@skill Survival} DC 26 (expert) to remove the mold without triggering the spores.',
			],
		},
		defenses: {
			ac: {
				std: 27,
			},
			savingThrows: {
				fort: {
					std: 17,
				},
				ref: {
					std: 13,
				},
			},
			hp: {
				std: 70,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: "A creature moves into the mold's space or damages the mold.",
				entries: [
					"The mold can't use this reaction if it's in direct sunlight or if the damage was fire damage. The triggering creature and all creatures within 10 feet are exposed to yellow mold spores.",
				],
				name: 'Spore Explosion',
			},
			{
				type: 'affliction',
				name: 'Yellow Mold Spores',
				traits: ['inhaled', 'poison'],
				note: "Any {@condition drained} condition from the spores persists after the poison's duration ends",
				DC: 26,
				savingThrow: 'Fortitude',
				maxDuration: '6 rounds',
				stages: [
					{
						stage: 1,
						entry: '{@damage 1d8} poison damage and {@condition drained 1}',
						duration: '1 round',
					},
					{
						stage: 2,
						entry: '{@damage 2d8} poison damage and {@condition drained 2}',
						duration: '1 round',
					},
					{
						stage: 3,
						entry: '{@damage 3d8} poison damage and {@condition drained 3}',
						duration: '1 round',
					},
				],
			},
		],
	},
	{
		name: 'Locking Door',
		source: 'BotD',
		page: 64,
		level: -1,
		traits: ['haunt'],
		stealth: {
			dc: 18,
			minProf: 'trained',
			notes: "to notice the door sway slightly, even though there's no breeze",
		},
		description: ['A door (or other portal) slams shut and locks.'],
		disable: {
			entries: [
				'DC 14 {@skill Athletics} to push back against the door, DC 14 {@skill Crafting} to wedge the door open, or DC 20 {@skill Thievery} (trained) to jam the lock or open the lock afterward',
			],
		},
		actions: [
			{
				name: 'Shut In',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature ends their move after passing through the doorway',
				entries: [
					'With an ethereal gust shimmering in the air, the door creaks as it swings shut and locks. The haunted door pushes anyone in its space into an adjacent space in the connecting chamber. A creature that would be pushed and succeeds at a DC 16 Reflex save selects which side of the door they end up on.',
				],
			},
		],
	},
	{
		name: 'Phantom Footsteps',
		source: 'BotD',
		page: 64,
		level: -1,
		traits: ['haunt'],
		stealth: {
			dc: 15,
		},
		description: ['Audible footsteps approach from behind, but their source is not apparent.'],
		disable: {
			entries: [
				'DC 17 {@skill Religion} (trained) to ritually ward off lesser spirits or DC 18 {@skill Occultism} to exorcise the spirit',
			],
		},
		actions: [
			{
				name: 'Stalk',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['auditory', 'emotion', 'enchantment', 'fear', 'mental', 'occult'],
				trigger: "A creature passes by the footsteps' path",
				entries: [
					'Footsteps with no visible source closely shadow the triggering creature, then stop. The triggering creature must attempt a DC 16 Will save.',
					{
						type: 'successDegree',
						entries: {
							'Critical Success': ['The creature is unaffected.'],
							Success: ['The creature is {@condition frightened||frightened 1}.'],
							Failure: ['The creature is {@condition frightened||frightened 2}.'],
							'Critical Failure': [
								'The creature is {@condition frightened||frightened 3}.',
							],
						},
					},
				],
			},
		],
		reset: ['1 hour'],
	},
	{
		name: 'Blood-Soaked Soil',
		source: 'BotD',
		page: 64,
		level: 0,
		traits: ['haunt'],
		stealth: {
			dc: 16,
			minProf: 'trained',
			notes: 'to feel breath upon your neck',
		},
		description: [
			'The blood of those who died in the area bubbles up from the earth, soaking the soil and turning it into a bloody morass.',
		],
		disable: {
			entries: [
				'DC 18 {@skill Diplomacy} or {@skill Occultism} (trained) to settle the spirits or DC 19 {@skill Religion} (trained) to bless the area',
			],
		},
		actions: [
			{
				name: 'Whisper',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['auditory', 'emotion', 'enchantment', 'fear', 'mental', 'occult'],
				trigger: "A creature enters the haunt's area",
				entries: [
					'The haunt deals {@damage 1d6+4} mental damage to creatures in the area (DC 19 basic Will save). On a failure, the creature is also {@condition frightened||frightened 1}.',
				],
			},
		],
		reset: ['1 hour'],
	},
	{
		name: 'Cold Spot',
		source: 'BotD',
		page: 64,
		level: 1,
		traits: ['haunt'],
		stealth: {
			dc: 17,
			minProf: 'trained',
		},
		description: ['The temperature suddenly drops as spectral forces gather in the area.'],
		disable: {
			entries: [
				'DC 19 {@skill Religion} (trained) to banish the cold spot with ritual prayers or DC 20 {@skill Occultism} (trained) to foil the arrival of outside forces',
			],
		},
		actions: [
			{
				name: 'Sudden Chill',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['cold', 'evocation', 'occult'],
				trigger: 'A living creature enters the area',
				entries: [
					'The temperature drops as {@condition invisible} spirits gather around the living. Living creatures within 15 feet take {@damage 2d4+5} cold damage (DC 17 basic Fortitude save). Creatures that critically fail their save are additionally {@condition clumsy||clumsy 1}.',
				],
			},
		],
		reset: ['1 hour'],
	},
	{
		name: 'Shattered Window',
		source: 'BotD',
		page: 65,
		level: 1,
		traits: ['haunt'],
		stealth: {
			dc: 17,
			minProf: 'trained',
			notes: 'to notice cracks spider-webbing across the window',
		},
		description: [
			'The anger trapped within a structure shatters a window, showering glass in adjacent spaces.',
		],
		disable: {
			entries: [
				'DC 19 {@skill Occultism} or {@skill Religion} (trained) to suppress the spiritual energy or DC 20 {@skill Diplomacy} (trained) to soothe the latent anger',
			],
		},
		actions: [
			{
				name: 'Shatter',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature moves adjacent to the window',
				entries: [
					'The window shatters, dealing {@damage 2d6+5} slashing damage to creatures within 5 feet (DC 17 basic Reflex save).',
				],
			},
		],
	},
	{
		name: 'Bloodthirsty Toy',
		source: 'BotD',
		page: 65,
		level: 2,
		traits: ['haunt'],
		stealth: {
			dc: 17,
			minProf: 'trained',
			notes: "to hear a child imitate an animal's roar",
		},
		description: ['A scruffy stuffed bear animates, biting whoever disturbs it.'],
		disable: {
			entries: [
				'DC 20 {@skill Thievery} (trained) to handle the toy without disturbing it or DC 21 {@skill Occultism} (trained) to suppress the memories suffusing the toy',
			],
		},
		reset: ['1 hour'],
		actions: [
			{
				name: 'Chomp',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature touches the toy',
				entries: [
					'The toy animates for a split second, biting the triggering creature with a ferocious jaws {@action Strike}.',
				],
			},
		],
		attacks: [
			{
				range: 'Melee',
				activity: {
					number: 1,
					unit: 'action',
				},
				name: 'jaws',
				bonus: 14,
				damage: '{@damage 2d8+8} piercing damage',
			},
		],
	},
	{
		name: 'Toppling Furniture',
		source: 'BotD',
		page: 65,
		level: 2,
		traits: ['haunt'],
		stealth: {
			dc: 18,
			minProf: 'trained',
			notes: "to hear the spirit's grunt of exertion as it works to topple the furniture",
		},
		description: ['A mischievous spirit pushes a bookshelf over onto a creature.'],
		disable: {
			entries: [
				"DC 16 {@skill Athletics} to hold the furniture upright or DC 18 {@skill Occultism} (trained) to foil the spirit's efforts to influence matter",
			],
		},
		reset: [
			'If the haunt successfully damages a creature with Topple Furniture, the spirit laughs for {@dice 1d4} rounds as the haunt resets; each subsequent time the haunt activates, it must topple a different piece of upright furniture. If the haunt fails to damage a creature, the spirit wails in frustration and resets after pouting for {@dice 1d4} hours.',
		],
		actions: [
			{
				name: 'Topple Furniture',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature moves adjacent to the furniture',
				entries: [
					'The spirit shoves the furniture over in an attempt to crush the triggering creature. The triggering creature takes {@damage 2d10+7} bludgeoning damage (DC 22 basic Reflex save). On a failure, the creature is additionally knocked {@condition prone}.',
				],
			},
		],
	},
	{
		name: 'Phantom Jailer',
		source: 'BotD',
		page: 65,
		level: 3,
		traits: ['haunt'],
		stealth: {
			dc: 20,
			minProf: 'trained',
			notes: 'to notice the manacles twitch',
		},
		description: [
			'A spirit appears and arrests the creature by clamping manacles around their wrists.',
		],
		disable: {
			entries: [
				'DC 18 {@skill Athletics} to seize the manacles from the spirit, DC 19 {@skill Intimidation} (trained) to order the spirit to stand down, or DC 20 {@skill Occultism} to exorcise the spirit',
			],
		},
		reset: ['1 day'],
		actions: [
			{
				name: 'Capture',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature touches the manacles',
				entries: [
					"The spirit attempts to lock the manacles around the triggering creature's wrists. The triggering creature must attempt a DC 23 Reflex save.",
					{
						type: 'successDegree',
						entries: {
							'Critical Success': ['The creature is unaffected.'],
							Success: [
								"The spirit loosely places manacles around the creature's wrists. Removing the manacles requires a single action.",
							],
							Failure: [
								"The spirit clamps the manacles around the creature's wrists but fails to lock them. The creature is {@condition flat-footed} and {@condition clumsy||clumsy 1} until the manacles are removed as a 3-action activity.",
							],
							'Critical Failure': [
								"The spirit clamps the manacles around the creature's wrists and locks them. The creature is {@condition flat-footed} and {@condition clumsy||clumsy 1} until the manacles are removed ({@action Escape} DC 23, simple lock).",
							],
						},
					},
				],
			},
		],
	},
	{
		name: 'Violent Shove',
		source: 'BotD',
		page: 65,
		level: 3,
		traits: ['haunt'],
		stealth: {
			dc: 23,
			minProf: 'trained',
			notes: 'to feel an ominous presence in the room',
		},
		description: ['An invisible force bats creatures aside, hurling them into a nearby wall.'],
		disable: {
			entries: [
				'DC 19 {@skill Occultism} (trained) to disperse the force or DC 20 {@skill Religion} (trained) to ward yourself from harm',
			],
		},
		reset: ['1 day'],
		actions: [
			{
				name: 'Shove',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A creature moves adjacent to the haunted wall',
				entries: [
					'A powerful force sweeps across the room, shoving all creatures in the room toward the wall. Each creature in the area must attempt a DC 20 Fortitude save.',
					{
						type: 'successDegree',
						entries: {
							'Critical Success': ['The creature is unaffected.'],
							Success: [
								'The creature is pushed 5 feet toward the wall. If the creature would collide with the wall, they take {@damage 1d10+5} bludgeoning damage.',
							],
							Failure: [
								'The creature is pushed 10 feet toward the wall. If the creature would collide with the wall, they take {@damage 2d10+10} bludgeoning damage.',
							],
							'Critical Failure': [
								'The creature is pushed 15 feet toward the wall. If the creature would collide with the wall, they take {@damage 3d10+15} bludgeoning damage and are knocked {@condition prone}.',
							],
						},
					},
				],
			},
		],
	},
	{
		name: 'Final Words',
		source: 'BotD',
		page: 65,
		level: 4,
		traits: ['haunt'],
		stealth: {
			dc: 22,
			minProf: 'trained',
			notes: 'to hear the scratch of a quill upon paper',
		},
		description: [
			"As a creature touches a hand-written letter, they witness the letter's author scribe it in the past; each pen stroke across the page carves the letter's text into the creature's flesh.",
		],
		disable: {
			entries: [
				'DC 24 {@skill Religion} (trained) to ward off the haunt or DC 25 {@skill Thievery} (trained) to dispose of the letter with extreme care before the haunt can form',
			],
		},
		reset: ['1 minute'],
		actions: [
			{
				name: 'Carve in Flesh',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['divine', 'necromancy', 'visual'],
				trigger: 'A creature reads the letter',
				entries: [
					'The haunt deals {@damage 2d8+11} slashing damage to the triggering creature as the words are carved into its flesh (DC 21 basic Will save). On a failure, the creature takes {@damage 2d8} {@condition persistent damage||persistent bleed damage}.',
				],
			},
		],
	},
	{
		name: 'Ectoplasmic Grasp',
		source: 'BotD',
		page: 66,
		level: 5,
		traits: ['haunt'],
		stealth: {
			dc: 23,
			minProf: 'trained',
			notes: 'to notice ectoplasm coalescing',
		},
		description: ['A massive ectoplasmic hand forms around a creature and squeezes it.'],
		disable: {
			entries: [
				'DC 24 {@skill Occultism} (trained) to send the ectoplasm back to the Ethereal Plane or DC 26 {@skill Acrobatics} to move through and disrupt the coalescing ectoplasm before it takes hold',
			],
		},
		reset: ['1 day'],
		actions: [
			{
				name: 'Squeeze',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: "A creature moves over the haunt's area",
				entries: [
					'The hand forms out of ectoplasm and squeezes the triggering creature, dealing {@damage 3d8+14} bludgeoning damage (DC 22 basic Fortitude save). On a failure, the creature is {@condition immobilized} ({@action Escape} DC 22).',
				],
			},
		],
	},
	{
		name: 'Weight of Guilt',
		source: 'BotD',
		page: 66,
		level: 7,
		traits: ['haunt'],
		stealth: {
			dc: 30,
			minProf: 'expert',
			notes: 'to sense an oppressive aura of sorrow',
		},
		description: [
			'Influenced by the guilt and regrets of the dead, creatures are wrapped in weighted chains that embody their own sins.',
		],
		disable: {
			entries: [
				"DC 26 {@skill Religion} (expert) to disrupt the haunt through prayer or DC 27 {@skill Deception} (expert) to openly defy your regrets and banish the haunt. Creatures who haven't committed sins or already made amends for their transgressions are immune to the effects of this haunt.",
			],
		},
		reset: ['1 day'],
		actions: [
			{
				name: 'Mental Bind',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['enchantment', 'mental', 'occult'],
				trigger: 'A creature enters the area',
				entries: [
					'Each creature within 30 feet becomes wrapped in heavy spectral chains forged from its own sins and regrets. Each must attempt a DC 25 Will save.',
					{
						type: 'successDegree',
						entries: {
							'Critical Success': ['The creature is unaffected.'],
							Success: [
								'The creature takes a \u201310-foot status penalty to its Speeds for 1 round.',
							],
							Failure: [
								'The creature is {@condition restrained} until it Escapes (DC 25).',
							],
							'Critical Failure': [
								'As failure, and the creature is overwhelmed with guilt, becoming {@condition stupefied||stupefied 2} for 1 day',
							],
						},
					},
				],
			},
		],
	},
	{
		name: 'Frenetic Musician',
		source: 'BotD',
		page: 66,
		level: 8,
		traits: ['haunt'],
		stealth: {
			dc: 28,
			minProf: 'expert',
			notes: 'to hear phantom notes',
		},
		description: [
			'A spirit musician rises out of an instrument and plays a frantic, bone-shaking melody.',
		],
		disable: {
			entries: [
				"DC 26 {@action Perform} (trained) to bring the spirit's music to a close or DC 28 {@skill Occultism} (expert) to banish the spirit",
			],
		},
		reset: ['1 hour'],
		actions: [
			{
				name: 'Musical Assault',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['auditory', 'evocation', 'occult', 'sonic'],
				trigger: 'A creature touches the instrument',
				entries: [
					"The musician's bone-shaking musical performance deals {@damage 4d10+22} sonic damage to creatures within 30 feet (DC 30 basic Will save).",
				],
			},
		],
	},
	{
		name: 'Blood Tears',
		source: 'BotD',
		page: 66,
		level: 10,
		traits: ['haunt'],
		stealth: {
			dc: 32,
			minProf: 'master',
			notes: 'to notice your vision tint red',
		},
		description: [
			'A wailing spirit appears and gouges their own eyes. As they do, blood seeps from the eyes of those who witness the act, obscuring their vision.',
		],
		disable: {
			entries: [
				"DC 30 {@skill Diplomacy} (master) to talk the spirit out of gouging its eyes or DC 32 {@skill Religion} (trained) to ease the spirit's sorrows",
			],
		},
		reset: ['1 day'],
		actions: [
			{
				name: 'Weep Blood',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['divine', 'necromancy'],
				trigger: 'A creature approaches within 15 feet',
				entries: [
					'Blood seeps from the eyes of all creatures within 30 feet, dealing {@condition persistent damage||persistent bleed damage}. Each creature in the area must attempt a DC 33 Fortitude save.',
					{
						type: 'successDegree',
						entries: {
							'Critical Success': ['The creature is unaffected.'],
							Success: [
								'The creature takes {@damage 2d8+3} {@condition persistent damage||persistent bleed damage} and is {@condition dazzled} for 1 round.',
							],
							Failure: [
								'The creature takes {@damage 4d8+6} {@condition persistent damage||persistent bleed damage} and is {@condition dazzled} for as long as the {@condition persistent damage} lasts.',
							],
							'Critical Failure': [
								'The creature takes {@damage 8d8+12} {@condition persistent damage||persistent bleed damage} and is {@condition blinded} for as long as the {@condition persistent damage} lasts.',
							],
						},
					},
				],
			},
		],
	},
	{
		name: 'Desperate Hunger',
		source: 'BotD',
		page: 67,
		level: 12,
		traits: ['haunt'],
		stealth: {
			dc: 35,
			minProf: 'master',
			notes: 'to feel an odd sense of hunger',
		},
		description: [
			'A skeletally thin spirit appears, weeping as it shoves earth and stones down its throat in an effort to stave off hunger.',
		],
		disable: {
			entries: [
				"DC 36 {@skill Deception} (master) to convince the spirit it's no longer hungry or DC 38 {@skill Occultism} (trained) to ritually feed the spirit",
			],
		},
		reset: ['1 day'],
		actions: [
			{
				name: 'Desperate Meal',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['occult', 'transmutation'],
				trigger: 'A creature approaches within 10 feet',
				entries: [
					'Creatures within 30 feet are filled with painful hunger and must succeed at a DC 32 Fortitude save or feel their stomachs fill with rocks, dirt, and worse, dealing {@damage 6d10+20} piercing damage.',
					{
						type: 'successDegree',
						entries: {
							'Critical Success': ['The creature is unaffected.'],
							Success: [
								'The creature takes half damage and is {@condition sickened||sickened 1}.',
							],
							Failure: [
								'The creature takes full damage and is {@condition sickened||sickened 2}.',
							],
							'Critical Failure': [
								"The creature takes double damage, is {@condition sickened||sickened 4}, and takes a \u201310-foot status penalty to its Speeds for as long as it's {@condition sickened}.",
							],
						},
					},
				],
			},
		],
	},
	{
		name: 'Cannibalistic Echoes',
		source: 'BotD',
		page: 67,
		level: 16,
		traits: ['haunt'],
		stealth: {
			dc: 42,
			minProf: 'master',
			notes: "to sense something unusual lurking in the area's echoes",
		},
		description: [
			'A pack of cannibalistic spirits swarm through the area, devouring living creatures',
		],
		disable: {
			entries: [
				'DC 40 {@skill Intimidation} (master) to drive the spirits off with a ferocious display or DC 42 {@skill Occultism} (expert) to exorcise the spirits',
			],
		},
		reset: ['1 day'],
		actions: [
			{
				name: 'Feast',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'A living creature approaches within 10 feet',
				entries: [
					'The spirits bite and chew, dealing {@damage 6d12+35} piercing damage to each creature within 30 feet. Affected creatures must each attempt a DC 41 Reflex save.',
					{
						type: 'successDegree',
						entries: {
							'Critical Success': ['The creature is unaffected.'],
							Success: ['The creature takes half damage.'],
							Failure: [
								'The creature takes full damage, {@damage 2d8} {@condition persistent damage||persistent bleed damage}, and is {@condition drained||drained 1}.',
							],
							'Critical Failure': [
								'The creature takes double damage, {@damage 4d8} {@condition persistent damage||persistent bleed damage}, and is {@condition drained||drained 2}.',
							],
						},
					},
				],
			},
		],
	},
	{
		name: 'Flood Of Spirits',
		source: 'BotD',
		page: 67,
		level: 18,
		traits: ['haunt'],
		stealth: {
			dc: 45,
			minProf: 'master',
			notes: 'to hear the flood of spirits coalescing',
		},
		description: ['A wave of spirits fly through the area, passing right through the living.'],
		disable: {
			entries: [
				'DC 48 {@skill Occultism} (expert) or {@skill Religion} (master) to divert the spirits',
			],
		},
		reset: ['1 day'],
		actions: [
			{
				name: 'Surge Through',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['cold', 'negative'],
				trigger: 'A creature passes through the area',
				entries: [
					"The haunt deals {@damage 3d12+20} negative damage and {@damage 3d12+20} cold damage to creatures in the area (DC 40 basic Reflex save). On a failure, a creature is {@condition stupefied||stupefied 2} for 1 minute, and on a critical failure, it's also {@condition confused} for 1 minute.",
				],
			},
		],
	},
	{
		name: 'Glimpse Grave',
		source: 'BotD',
		page: 67,
		level: 20,
		traits: ['haunt'],
		stealth: {
			dc: 48,
			minProf: 'master',
			notes: 'to notice the words on the tombstone waver',
		},
		description: [
			'A tombstone bears the name of those who look upon it, causing their hearts to seize.',
		],
		disable: {
			entries: [
				'DC 45 {@skill Religion} (legendary) to bless the tombstone or DC 50 {@skill Occultism} (trained) to ward off spirits',
			],
		},
		reset: ['1 day'],
		actions: [
			{
				name: 'Stop Heart',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['death', 'illusion', 'incapacitation', 'linguistic', 'occult', 'visual'],
				trigger: 'A creature reads or touches the tombstone',
				entries: [
					'The haunt deals {@damage 8d10+44} negative damage (DC 47 basic Will save) to all creatures within 60 feet who can see the tombstone and can read any language. On a critical failure, a creature dies.',
				],
			},
		],
	},
	{
		name: 'Entombed Spirit',
		source: 'BotD',
		page: 67,
		level: 2,
		traits: ['complex', 'haunt'],
		stealth: {
			bonus: 11,
			minProf: 'trained',
		},
		description: [
			'The wall bulges out in the shape of a howling humanoid face as it twists and forms tendrils reaching for nearby creatures. This haunt is formed when a murder victim is entombed within a wall before or after their death.',
		],
		disable: {
			entries: [
				"DC 17 {@skill Occultism} (trained) to weaken the spirit, DC 18 {@skill Athletics} (trained) to force the spirit's face back inside the wall, or DC 19 {@skill Diplomacy} (trained) to talk down the spirit; two total successes across all skills are required to disable the haunt",
			],
		},
		defenses: {
			ac: {
				std: 15,
			},
			savingThrows: {
				fort: {
					std: 11,
				},
				ref: {
					std: 5,
				},
			},
			hardness: {
				std: 9,
				notes: {
					std: '(wall)',
				},
			},
			hp: {
				std: 30,
			},
			bt: {
				std: 15,
			},
			immunities: ['object immunities'],
		},
		reset: [
			'The haunt deactivates 1 minute after all creatures leave the area and resets immediately thereafter. If disabled, the haunt resets after 1 day. The haunt is permanently destroyed if the remains of the deceased are removed from the wall.',
		],
		actions: [
			{
				name: 'Gasp',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['enchantment', 'fear', 'mental', 'occult'],
				trigger: 'A creature moves adjacent to the wall where the corpse is entombed',
				entries: [
					'The spirit gasps and wails for aid while the wall takes on the shape of its face and roils, growing tendrils. All creatures within 10 feet must succeed at a DC 18 Will save or be {@condition frightened||frightened 1} for as long as the haunt remains active. The haunt then rolls initiative',
				],
			},
		],
		routine: [
			"(3 actions) The spirit attempts to {@action Grapple} up to two creatures within 10 feet with a +14 {@skill Athletics} modifier, then squeezes each creature it has {@condition grabbed}, dealing {@damage 1d10+4} damage. The haunt doesn't apply a multiple attack penalty to the second attempt to {@action Grapple}.",
		],
	},
	{
		name: 'Sadistic Conductor',
		source: 'BotD',
		page: 67,
		level: 4,
		traits: ['complex', 'haunt'],
		stealth: {
			bonus: 12,
			minProf: 'trained',
		},
		description: [
			'A phantom conductor appears with a flourish, causing spectral instruments with razor-like strings to appear in the hands of those present. As the conductor gestures for the performance to begin, creatures are compelled to play the instruments.',
		],
		disable: {
			entries: [
				'DC 18 {@skill Performance} to perform so well the conductor releases you from your instrument, banishing it voluntarily; DC 22 Occultism or Religion (trained) to banish one instrument; or DC 25 {@skill Thievery} (trained) to sabotage one instrument; each instrument must be banished, sabotaged, or destroyed to disable the haunt',
			],
		},
		defenses: {
			hardness: {
				std: 10,
			},
			hp: {
				'per instrument': 22,
			},
			bt: {
				'per instrument': 11,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		reset: [
			'The haunt deactivates when all conjured instruments are destroyed or there has been silence for 1 minute. It resets after 1 hour.',
		],
		actions: [
			{
				name: 'Conjure Instruments',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['conjuration', 'occult'],
				trigger: 'A creature approaches within 15 feet',
				entries: [
					"The conductor conjures a hazardous spectral instrument into the hands of each sentient creature within 30 feet. Even a creature whose hands are full finds a spectral instrument superimposed over the other items it's carrying. Affected creatures must each attempt a DC 19 Will save. The haunt then rolls initiative.",
					{
						type: 'successDegree',
						entries: {
							'Critical Success': [
								"The conjuration fails and no instrument appears in the creature's hands.",
							],
							Success: [
								"A conjured instrument appears in the creature's hands, but it isn't compelled to play it.",
							],
							Failure: [
								"A conjured instrument appears in the creature's hands and it's compelled to play it (see routine below). The creature can't willingly put down the instrument while compelled to play.",
							],
							'Critical Failure': [
								'As failure, but the creature needs a critical success on its {@skill Performance} in order for the conductor to be satisfied and dismiss its instrument.',
							],
						},
					},
				],
			},
		],
		routine: [
			"(1 action; {@trait enchantment}, {@trait mental}, {@trait occult}) The conductor urges each creature within 30 feet to play the hazardous instrument it holds. Each creature that is compelled to play its instrument does so, and those who succeeded on their save can choose to do so. Playing the instrument, either from the haunt's routine or of a creature's own volition during an attempt to disable the haunt, deals {@damage 1d6+3} slashing damage (DC 21 basic Reflex save), and the creature must attempt a DC 18 {@skill Performance} check. On a success, the conductor accepts the performance and dismisses that creature's instrument, and on a critical failure, the discordant sound and conductor's jeers deal an additional {@damage 1d6+3} sonic damage.",
		],
	},
	{
		name: 'Grasping Dead',
		source: 'BotD',
		page: 68,
		level: 5,
		traits: ['complex', 'haunt'],
		stealth: {
			bonus: 12,
			minProf: 'expert',
		},
		description: [
			'Hands of the buried dead rise from the ground, grabbing and tearing at creatures in the area to drag them underground.',
		],
		disable: {
			entries: [
				"DC 22 {@skill Religion} (trained) to ritually pray for the dead or DC 24 {@skill Occultism} (trained) to exorcise the spirits' anger; two total successes are required to disable the haunt",
			],
		},
		defenses: {
			hardness: {
				std: 10,
			},
			hp: {
				'per instrument': 22,
			},
			bt: {
				'per instrument': 11,
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
		},
		actions: [
			{
				name: 'Shifting Earth',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'At least two creatures enter the area',
				entries: [
					'The earth shifts wildly as the hands of the dead spring forth from the ground. The area becomes {@quickref difficult terrain||3|terrain}. Creatures within the area are knocked {@condition prone} unless they succeed at a DC 26 Reflex save. The haunt then rolls initiative.',
				],
			},
		],
		routine: [
			"(1 action) The grasping hands batter all creatures in the area, dealing {@damage 2d6+7} bludgeoning damage (DC 26 basic Reflex save). On a critical failure, a creature is dragged partially into the earth, becoming {@condition immobilized} until it {@action Escape||Escapes} (DC 26). If already {@condition immobilized}, it's fully submerged and must hold its breath to avoid {@quickref suffocation||3|Drowning and Suffocating}.",
		],
		reset: [
			'The haunt deactivates 1 minute after all living creatures leave the area. After 1 hour, the haunt reactivates.',
		],
	},
	{
		name: 'Spirit Cyclone',
		source: 'BotD',
		page: 68,
		level: 9,
		traits: ['complex', 'haunt'],
		stealth: {
			bonus: 20,
			minProf: 'expert',
		},
		actions: [
			{
				name: 'Gather Spirits',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: 'Two or more creatures enter the area',
				entries: [
					'A spiraling column of spirits gather, becoming a whirling cyclone of souls 10 feet wide and 60 feet tall. The haunt then rolls initiative.',
				],
			},
		],
		description: [
			'DC 30 {@skill Occultism} or {@skill Religion} (trained) to weaken the haunt; three total successes in any combination are required to disable the haunt',
		],
		disable: {
			entries: [
				"DC 22 {@skill Religion} (trained) to ritually pray for the dead or DC 24 {@skill Occultism} (trained) to exorcise the spirits' anger; two total successes are required to disable the haunt",
			],
		},
		routine: [
			"(3 actions) The spirit cyclone uses 3 actions to move, traveling up to 30 feet with each action and dealing {@damage 2d10+13} negative damage to each creature in its path (DC 32 basic Reflex save). A creature needs to attempt only one save during the cyclone's movement, even if the cyclone moves over its space more than once. On a critical failure, a creature is swept up into the cyclone, becoming {@condition grabbed} ({@action Escape} DC 32). A creature {@condition grabbed} by the cyclone moves along with the cyclone and takes {@damage 1d10+6} additional negative damage at their beginning of its turn, and it must attempt a Reflex save against the cyclone on the cyclone's turn, no matter where the cyclone moves. A creature that successfully {@action Escapes} from the cyclone falls from a height of {@dice 1d12*5|1d12 × 5} feet.",
		],
		reset: ['The spirit cyclone disperses after 1 minute and resets after 1 day'],
	},
	{
		name: 'Ghost Stampede',
		source: 'BotD',
		page: 68,
		level: 15,
		traits: ['complex', 'haunt'],
		stealth: {
			bonus: 30,
			minProf: 'master',
		},
		description: [
			'Four massive skulls of aurochs, enormous wild cattle, rise into the air, each trailing its ghostly body behind it.',
		],
		disable: {
			entries: [
				'DC 36 {@skill Nature} (master) to calm one of the four aurochs or DC 40 {@skill Religion} (trained) to exorcise them',
			],
		},
		defenses: {
			ac: {
				std: 40,
			},
			savingThrows: {
				fort: {
					std: 23,
				},
				ref: {
					std: 29,
				},
			},
			hardness: {
				std: 25,
			},
			hp: {
				'per aurochs skull': 20,
			},
			immunities: ['death effects', 'disease', 'paralyzed', 'poison'],
			weaknesses: [
				{
					amount: 5,
					name: 'positive',
				},
			],
		},
		actions: [
			{
				name: 'Defend Territory',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['emotion', 'fear', 'mental', 'occult'],
				trigger: 'A creature approaches within 10 feet of an aurochs skull',
				entries: [
					'The skulls rise into the air, form ghostly bodies, and bellow in rage. Each creature within 60 feet of an aurochs skull must attempt a DC 36 Will saving throw. The haunt then rolls initiative.',
					{
						type: 'successDegree',
						entries: {
							'Critical Success': ['The creature is unaffected.'],
							Success: ['The creature is {@condition frightened||frightened 1}.'],
							Failure: [
								'The creature takes {@damage 1d12+6} mental damage and is {@condition frightened||frightened 2}.',
							],
							'Critical Failure': [
								'The creature takes {@damage 2d12+12} mental damage and is {@condition frightened||frightened 4}.',
							],
						},
					},
				],
			},
		],
		routine: [
			'(4 actions) For each aurochs skull disabled or destroyed, the haunt has 1 fewer action. On each action, a different aurochs moves up to 60 feet and attempts a horn {@action Strike} against a different living creature. A creature critically hit by a horn {@action Strike} also takes {@damage 2d6} {@condition persistent damage||persistent bleed damage} and is knocked {@condition prone}.',
			{
				type: 'attack',
				range: 'Melee',
				name: 'horn',
				bonus: 30,
				damage: '{@damage 3d12+17} piercing',
				noMAP: true,
			},
		],
		reset: [
			'The haunt deactivates 1 minute after all living creatures leave the area or after all four aurochs skulls are destroyed. After 1 hour, if at least one aurochs skull remains, the haunt reactivates.',
		],
	},
	{
		name: 'Siphoning Spirit',
		source: 'BotD',
		page: 69,
		level: 19,
		traits: ['complex', 'haunt'],
		stealth: {
			bonus: 40,
			minProf: 'trained',
		},
		description: [
			'A formless spirit drains life from the living, becoming progressively visible as its victims weaken.',
		],
		disable: {
			entries: [
				'DC 48 {@skill Occultism} or {@skill Religion} (expert) to weaken the spirit; four total successes are required to disable the haunt',
			],
		},
		actions: [
			{
				name: 'Sudden Siphon',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['divine', 'necromancy', 'negative'],
				trigger: 'A living creature passes within 15 feet of the spirit',
				entries: [
					'The {@condition invisible} spirit latches onto the life essence of the living, dealing {@damage 4d10+20} negative damage to all living creatures within 60 feet (DC 41 basic Fortitude save). The haunt then rolls initiative',
				],
			},
		],
		routine: [
			'(1 action; {@trait death}, {@trait divine}, {@trait necromancy}, {@trait negative}) The spirit inhales, siphoning the souls of the living and becoming more visible. Each creature within 60 feet takes {@damage 4d10+20} negative damage, with a DC 41 Fortitude save. If no creatures are within the area, the haunt moves up to 120 feet into the largest concentration of living creatures and then inhales.',
			{
				type: 'successDegree',
				entries: {
					'Critical Success': ['The creature is unaffected.'],
					Success: ['The creature takes half damage.'],
					Failure: [
						'The creature takes full damage and increases its {@condition drained} value by 1, to a maximum of {@condition drained||drained 4}.',
					],
					'Critical Failure': [
						'The creature takes double damage and increases its {@condition drained} value by 2, to a maximum of {@condition drained||drained 4}. If the creature was already {@condition drained||drained 4}, it dies.',
					],
				},
			},
		],
		reset: [
			"After 1 minute, the spirit is satiated, and the haunt deactivates as it returns to a resting state. Over the course of 1 hour, the spirit's siphoned life energy disperses and the haunt resets.",
		],
	},
	{
		name: 'Falling Ceiling',
		source: 'BB',
		page: 12,
		level: 1,
		traits: [],
		stealth: {
			dc: 20,
			notes: '{@skill Perception} check',
		},
		disable: {
			entries: [
				'A hero must succeed at a DC 18 {@skill Thievery} check on the triggering square or the ceiling to prevent the stone blocks from falling.',
			],
		},
		actions: [
			{
				name: 'Falling Stones',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				entries: [
					'When a creature steps on the square closest to the north door, the trap drops blocks of stone all along the hallway. It makes one ranged {@action Strike} against each creature between the two doors.',
				],
			},
		],
		attacks: [
			{
				range: 'Ranged',
				name: 'falling block',
				attack: 8,
				damage: '{@damage 1d8} bludgeoning',
				types: ['bludgeoning'],
			},
		],
	},
	{
		name: 'Central Spears',
		source: 'BB',
		page: 14,
		level: 1,
		traits: [],
		stealth: {
			dc: 20,
			notes: '{@skill Perception} check',
		},
		disable: {
			entries: [
				'A hero must succeed at a DC 18 {@skill Thievery} check on the triggering floor tiles or the wall sockets in the western wall.',
			],
		},
		actions: [
			{
				name: 'Spear Barrage',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				entries: [
					'When a creature moves into any of the squares in the outlined area, the trap shoots three spears from the western wall. It makes one ranged {@action Strike} against the westernmost creature in each row.',
				],
			},
		],
		attacks: [
			{
				range: 'Ranged',
				name: 'spear',
				attack: 10,
				damage: '{@damage 1d8+4} piercing',
				types: ['piercing'],
			},
		],
		reset: ['The central spears reset after 1 minute.'],
	},
	{
		name: 'Mermaid Fountain',
		source: 'BB',
		page: 21,
		level: 3,
		traits: [],
		stealth: {
			bonus: 10,
			notes: '; DC 20 {@skill Perception} check to notice.',
		},
		disable: {
			entries: [
				'DC 20 {@skill Thievery} on each corner mechanism (must disable all three working corners to disable the trap)',
			],
		},
		defenses: {
			ac: {
				std: 18,
			},
			savingThrows: {
				fort: {
					std: 7,
				},
				ref: {
					std: 5,
				},
			},
			hardness: {
				'Corner Mechanism': 8,
			},
			hp: {
				'Corner Mechanism': 15,
			},
		},
		routine: [
			'Each turn, the fountain uses 1 action. Roll a {@dice 1d10} and look up the result on the following list to determine which action it uses that round.',
			{
				name: '1\u20134 Single Target',
				type: 'ability',
				entries: [
					'The statue spins about and sprays water at a single random target in the room. Roll a {@dice 1d4} and count to the number you rolled, starting with the player on your left, to determine which hero gets attacked. The spray is a ranged {@action Strike} with +10 to hit. On a hit, it deals {@damage 2d6} bludgeoning damage (doubled on a critical hit as normal).',
				],
			},
			{
				name: '5\u20137 Corner Spray',
				type: 'ability',
				entries: [
					'The statue spins about, firing a spray of water at each corner of the room that still has a functioning corner mechanism. This hits any creature adjacent to the corner mechanism, dealing {@damage 2d6} bludgeoning damage. Each hero must attempt a DC 15 basic Reflex save, taking no damage on a critical success, half damage on a success, full damage on a failure, and double damage on a critical failure.',
				],
			},
			{
				name: '8\u20139 Half Room',
				type: 'ability',
				entries: [
					'The statue spins about, spraying half of the room with water. Roll any die. If the result is even, it sprays the west half; otherwise, it sprays the east half. This deals {@damage 2d6} bludgeoning damage to each creature in that half of the room, and each hero must attempt a DC 15 basic Reflex save.',
				],
			},
			{
				name: '10 Full Room',
				type: 'ability',
				entries: [
					'This works just like the half-room attack, but it targets everyone in the room.',
				],
			},
		],
	},
	{
		name: 'Hidden Pit',
		source: 'BB',
		page: 49,
		level: 0,
		traits: [],
		description: ["A wooden trapdoor covers a 10-foot square pit that's 20 feet deep."],
		stealth: {
			dc: 18,
			notes: '{@skill Perception} check (or DC 0 if the trapdoor is disabled or {@condition broken}).',
		},
		disable: {
			entries: ['DC 12 {@skill Thievery} to remove the trapdoor'],
		},
		defenses: {
			ac: {
				std: 10,
			},
			savingThrows: {
				fort: {
					std: 1,
				},
				ref: {
					std: 1,
				},
			},
			hardness: {
				Trapdoor: 3,
			},
			hp: {
				Trapdoor: 12,
			},
			bt: {
				Trapdoor: 6,
			},
			immunities: ['critical hits', 'sneak attack'],
		},
		actions: [
			{
				name: 'Pitfall',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				entries: [
					'If a creature walks onto the trapdoor, that creature falls in unless it succeeds at a DC 16 Reflex save to {@action Grab an Edge||grab hold of the edge}. The pit is 20 feet deep, dealing 10 bludgeoning damage to anyone who falls to the bottom.',
				],
			},
		],
	},
	{
		name: 'Envenomed Lock',
		source: 'BB',
		page: 49,
		level: 1,
		traits: [],
		description: [
			"A spring-loaded, poisoned spine is hidden near the keyhole of a lock. Disabling or breaking the trap doesn't disable or break the lock.",
		],
		stealth: {
			dc: 17,
			notes: '{@skill Perception} check',
		},
		disable: {
			entries: ['DC 17 {@skill Thievery} on the spring mechanism'],
		},
		defenses: {
			ac: {
				std: 15,
			},
			savingThrows: {
				fort: {
					std: 8,
				},
				ref: {
					std: 4,
				},
			},
			hardness: {
				std: 6,
			},
			hp: {
				std: 24,
			},
			bt: {
				std: 12,
			},
			immunities: ['critical hits', 'sneak attack'],
		},
		actions: [
			{
				name: 'Spring',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['attack'],
				entries: [
					'When a creature tries to unlock or {@action Pick a Lock||Pick the Lock}, a spine extends to attack that creature. The trap makes a melee attack with +13 to its attack roll. On a hit, it deals 1 piercing damage and {@damage 1d6} {@condition persistent damage||persistent poison damage} (on a critical hit, 2 piercing damage and {@damage 2d6} {@condition persistent damage||persistent poison damage}).',
				],
			},
		],
	},
	{
		name: 'Slamming Door',
		source: 'BB',
		page: 49,
		level: 1,
		traits: [],
		description: [
			"Pressure-sensitive panels in the floor connect to a stone slab hidden in a hallway's ceiling.",
		],
		stealth: {
			dc: 17,
			notes: '{@skill Perception} check',
		},
		disable: {
			entries: ['DC 15 {@skill Thievery} on the floor panels before the slab falls'],
		},
		defenses: {
			ac: {
				std: 16,
			},
			savingThrows: {
				fort: {
					std: 10,
				},
				ref: {
					std: 2,
				},
			},
			hardness: {
				std: 5,
			},
			hp: {
				std: 20,
			},
			bt: {
				std: 10,
			},
			immunities: ['critical hits', 'sneak attack'],
		},
		actions: [
			{
				name: 'Slam Shut',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['attack'],
				entries: [
					'When pressure is placed on any floor tile, the door falls, closing off the hallway. The stone slab deals {@damage 3d8} bludgeoning damage to anyone beneath or adjacent to the slab when it drops and pushes them out of its space in a random direction. A creature that succeeds at a DC 17 Reflex save takes no damage and rolls out of the way in a random direction. On a critical success, they roll out of the way and can choose which direction.',
					'Lifting the fallen slab requires a successful DC 25 {@skill Athletics} check. Hitting the floor panels triggers the trap. The slab uses the same AC and saves as the trap, but it has Hardness 12, HP 48 (BT 24).',
				],
			},
		],
	},
	{
		name: 'Spear Launcher',
		source: 'BB',
		page: 49,
		level: 2,
		traits: [],
		stealth: {
			dc: 20,
			notes: '{@skill Perception} check',
		},
		description: [
			'A wall socket loaded with a spear connects to a floor tile in one 5-foot square.',
		],
		disable: {
			entries: ['DC 18 {@skill Thievery} on the floor tile or wall socket'],
		},
		defenses: {
			ac: {
				std: 18,
			},
			savingThrows: {
				fort: {
					std: 11,
				},
				ref: {
					std: 3,
				},
			},
			hardness: {
				std: 8,
			},
			hp: {
				std: 32,
			},
			bt: {
				std: 16,
			},
			immunities: ['critical hits', 'sneak attack'],
		},
		actions: [
			{
				name: 'Spear',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['attack'],
				entries: [
					'When pressure is applied to the floor tile, the trap shoots a spear, making an attack against the creature or object on the floor tile. The trap makes a ranged attack, rolling a {@dice 1d20} and adding 14. On a hit, it deals {@damage 2d6 + 6} piercing damage (doubled on a critical hit as normal).',
				],
			},
		],
	},
	{
		name: 'Scythe Blades',
		source: 'BB',
		page: 49,
		level: 4,
		traits: [],
		stealth: {
			dc: 23,
			notes: '{@skill Perception} check',
		},
		description: [
			'Two blades, each hidden in a 15-foot-long ceiling groove, are both connected to a trip wire.',
		],
		disable: {
			entries: ['DC 21 {@skill Thievery} to disable each blade'],
		},
		defenses: {
			ac: {
				std: 21,
			},
			savingThrows: {
				fort: {
					std: 12,
				},
				ref: {
					std: 8,
				},
			},
			hardness: {
				std: 11,
			},
			hp: {
				std: 44,
			},
			bt: {
				std: 22,
			},
			immunities: ['critical hits', 'sneak attack'],
		},
		actions: [
			{
				name: 'Falling Scythes',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				traits: ['attack'],
				entries: [
					"When the trip wire is pulled or severed, both blades swing down, each one attacking all creatures under the ceiling grooves. The trap makes a melee attack with each blade with +17 to each attack roll. There's no multiple attack penalty on these attacks. On a hit, a blade deals {@damage 2d12 + 4} slashing damage. On a critical hit, the damage is doubled plus 6 extra damage.",
				],
			},
		],
	},
	{
		name: 'Grazing Deer',
		source: 'AFoF',
		page: 5,
		level: 3,
		traits: ['uncommon', 'complex', 'environmental'],
		stealth: {
			bonus: 20,
			minProf: 'expert',
		},
		description: [
			'A herd of deer exits the woods to investigate the delicious-looking leshys.',
		],
		disable: {
			entries: [
				"DC 17 {@skill Diplomacy} (with wild empathy) to befriend the deer and convince them that leshys aren't for nibbling, or DC 20 {@skill Intimidation} to scare the dear away",
			],
		},
		defenses: {
			ac: {
				std: 19,
			},
			savingThrows: {
				fort: {
					std: 12,
				},
				ref: {
					std: 14,
				},
				will: {
					std: 6,
				},
			},
			hp: {
				std: 44,
				notes: {
					std: "(if the grazing deer take this much damage, they aren't killed, but they do flee into the woods and don't return)",
				},
			},
		},
		actions: [
			{
				name: 'Approach and Taste',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger: "The PCs emerge from the forest's edge",
				entries: [
					'A deer approaches the party and attempts a nibble {@action Strike} against a randomly determined PC.',
					'The grazing deer rolls initiative.',
				],
			},
		],
		routine: [
			"(2 actions) The grazing deer takes one action to move about, and then one action to eagerly nibble at a randomly chosen PC. A character who spends three actions on their turn to {@action Stride} can avoid being nibbled by the grazing deer during the hazard's next turn. If all of the PCs do so, attempt a DC {@flatDC 5} flat check\u2014on a success, the party escapes the deer and can proceed onward to Petalbrook, but they become delayed as a result of having to flee the pack of ravenous deer.",
		],
		attacks: [
			{
				range: 'Melee',
				name: 'nibble',
				attack: 12,
				damage: '{@damage 2d4+5} bludgeoning',
			},
		],
	},
	{
		name: 'Bad Vibrations',
		source: 'AFoF',
		page: 7,
		level: 3,
		traits: ['rare', 'complex', 'magical', 'trap'],
		stealth: {
			dc: 20,
			minProf: 'expert',
		},
		description: [
			'The three larger crystals on the table begin to vibrate and emit a swiftly growing peal of sound.',
		],
		disable: {
			entries: [
				'DC 17 {@skill Thievery} (trained) or {@skill Occultism} (trained) to disrupt the magic enchanting one of the crystals, or DC 20 {@skill Performance} (trained) by a character who can cast {@spell counter performance} to use sound to redirect the noise back into the crystal, or {@spell dispel magic} (2nd level, DC 18) to counteract a crystal.',
			],
		},
		defenses: {
			ac: {
				std: 19,
			},
			savingThrows: {
				fort: {
					std: 12,
				},
				ref: {
					std: 6,
				},
			},
			hardness: {
				std: 10,
			},
			hp: {
				std: 16,
				notes: {
					std: 'each (BT 8)',
				},
			},
			immunities: ['critical hits', 'object immunities', 'precision damage'],
			weaknesses: [
				{
					name: 'sonic',
					amount: 5,
				},
			],
		},
		actions: [
			{
				name: 'Shrill Chime',
				activity: {
					number: 1,
					unit: 'reaction',
				},
				trigger:
					'A creature other than {@creature Darius|afof} or one of his homunculi approaches within 5 feet of the table or attempts to {@action Interact} with the crystals in any way other than to attempt to disable the hazard.',
				entries: [
					'The three large crystals on the table begin vibrating and humming.',
					'The hazard rolls initiative.',
				],
			},
		],
		routine: [
			"(3 actions) The hazard loses 1 action for each crystal that's disabled or destroyed. On each of the trap's actions, one of the crystals fires a blast of sound at a single Small or larger creature in the room. The target is randomly determined and takes {@damage 1d8} sonic damage (DC 20 basic Fortitude save); a target who critically fails this save is {@condition deafened} for 1 minute. At the end of the hazard's routine, attempt a DC {@flatDC 10} flat check. On a success, one of the crystals shatters and is destroyed.",
		],
	},
];
