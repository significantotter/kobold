import { z } from 'zod';
import { zEntrySchema } from '../entries.zod.js';
import { zDuration, zTypedNumberSchema } from '../helpers.zod.js';

export type Ritual = z.infer<typeof zRitualSchema>;
export const zRitualSchema = z
	.object({
		name: z.string(),
		source: z.string(),
		page: z.number(),
		level: z.number(),
		traits: z.array(z.string()),
		cast: zTypedNumberSchema,
		cost: z.string().optional(),
		primaryCheck: z.object({
			skills: z.array(z.string()),
			prof: z.string().optional(),
			entry: z.string().optional(),
		}),
		secondaryCheck: z
			.object({
				skills: z.array(z.string()),
				prof: z.string().optional(),
				entry: z.string().optional(),
			})
			.optional(),
		secondaryCasters: z
			.object({
				number: z.number(),
			})
			.optional(),
		targets: z.string().optional(),
		range: z
			.object({
				entry: z.string(),
				distance: z.object({
					type: z.string(),
					amount: z.number(),
				}),
			})
			.optional(),
		area: z.object({ types: z.array(z.string()), entry: z.string() }).optional(),
		entries: zEntrySchema.array(),
		duration: zDuration.optional(),
		heightened: z
			.object({
				plusX: z.record(z.union([z.number(), z.string()]), zEntrySchema.array()).optional(),
				X: z.record(z.union([z.number(), z.string()]), zEntrySchema.array()).optional(),
			})
			.optional(),
	})
	.strict();

const test: Ritual[] = [
	{
		name: 'Mosquito Blight',
		source: 'LOMM',
		page: 77,
		level: 5,
		traits: ['rare', 'conjuration', 'disease', 'necromancy'],
		cast: {
			number: 1,
			unit: 'day',
		},
		cost: 'amber and rare incense worth 750 gp',
		primaryCheck: {
			skills: ['Nature'],
			prof: 'expert',
			entry: '{@skill Nature} (expert; you must be the {@creature Mosquito Witch|LOMM})',
		},
		area: {
			types: ['Misc.'],
			entry: '1-mile-radius circle centered on you',
		},
		entries: [
			"You infest the area with tenacious, biting insects that disease and drain life from creatures in the area. Arthropods (insects, spiders, and similar invertebrates) are unaffected and instead gain a +1 status bonus to attack rolls, skill checks, saving throws, and {@skill Perception} checks while within the area. All other creatures are harassed by insects and exposed to the disease witch's hunger when they enter the area and once per day thereafter that they remain in the area. As part of casting this ritual, you create a Tiny ritual insect hive (Hardness 5, 10 HP) that must remain in the ritual's area. If the hive is removed or destroyed, the ritual's effect ends 1 hour later.",
			{
				type: 'data',
				tag: 'affliction',
				data: {
					name: "Witch's Hunger",
					type: 'Disease',
					source: 'LOMM',
					traits: ['disease'],
					entries: [
						{
							type: 'affliction',
							savingThrow: 'Fortitude',
							onset: '{@dice 1d6} hours',
							stages: [
								{
									stage: 1,
									entry: '{@condition enfeebled||enfeebled 1}',
									duration: '1 day',
								},
								{
									stage: 2,
									entry: '{@condition enfeebled||enfeebled 2}',
									duration: '1 day',
								},
								{
									stage: 3,
									entry: '{@condition enfeebled||enfeebled 2} and {@condition slowed||slowed 1}',
									duration: '1 day',
								},
								{
									stage: 4,
									entry: '{@condition unconscious}',
									duration: '1 day',
								},
								{
									stage: 5,
									entry: 'death',
								},
							],
						},
					],
				},
			},
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						'As success, and the disease is especially deadly, with Stage 3 instead causing unconsciousness and Stage 4 instead causing death.',
					Success: 'You create the ritual hive and cast the ritual.',
					Failure: 'You fail to cast the ritual.',
					'Critical Failure':
						"You fail to cast the ritual and instead cause ravenous insects to torment you, immediately exposing you to the witch's hunger disease.",
				},
			},
		],
	},
	{
		name: 'Raga of Remembrance',
		source: 'LOMM',
		page: 53,
		level: 10,
		traits: ['unique', 'necromancy'],
		cast: {
			number: 1,
			unit: 'hour',
		},
		cost: 'ceramics, incense, and pigments worth 100,000 gp',
		secondaryCasters: {
			number: 3,
		},
		primaryCheck: {
			skills: ['Occultism', 'Religion'],
			prof: 'legendary',
		},
		secondaryCheck: {
			skills: ['Diplomacy', 'Performance', 'Nature', 'Religion', 'Society'],
			entry: '{@skill Diplomacy} or {@skill Performance}; {@skill Nature}; {@skill Religion} or {@skill Society}',
		},
		targets: 'the primary caster',
		entries: [
			'You scribe occult symbols on unblighted Vudran ground, laying the ceramics within them to create a ritual space. To perform the ritual, light incense in the ceramics and sit at the center of the ritual space. You then play the {@action craft disharmonic instrument|LOMM|disharmonic instrument}, drawing on musical skill, occult harmonics, or religious tradition. This establishes an underlying drone atop which the secondary casters layer their own performances. The song calls to the millions who died defending Vudra from {@creature Kothogaz, Dance of Disharmony|LOMM|Kothogaz}, investing their power in Vanitapati, the legendary psychic.',
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						"A towering, ethereal avatar of Vanitapati manifests around you, surrounded by swirling spirits. The avatar weakens Kothogaz's spirit. While Kothogaz is within 1 mile of you, it is {@condition frightened||frightened 2} and is permanently destroyed if reduced to 0 Hit Points.",
					Success: 'As critical success, but Kothogaz is frightened 1.',
					Failure:
						"The dead come to your aid, but their presence is unnerving. As success, but Kothogaz isn't frightened, and the primary and secondary casters take a \u20131 status penalty to saving throws against emotion effects.",
					'Critical Failure':
						"Rather than the dead, Kothogaz hears the ritual's call and immediately teleports to the primary caster with its Disharmonic Door ability. Primary and secondary casters are afflicted with many-eyed blight.",
				},
			},
		],
	},
	{
		name: 'Lucky Month',
		source: 'LOTG',
		page: 90,
		level: 2,
		traits: ['uncommon', 'divination'],
		cast: {
			number: 1,
			unit: 'day',
		},
		cost: 'a favorite food or drink and a wearable token with personal or familial significance worth 10 gp total',
		secondaryCasters: {
			number: 3,
		},
		primaryCheck: {
			skills: ['Religion'],
			prof: 'trained',
		},
		secondaryCheck: {
			skills: ['Crafting', 'Performance', 'Society'],
			entry: '{@skill Crafting}, {@skill Performance}, {@skill Society}',
		},
		range: {
			entry: '30 feet',
			distance: {
				type: 'feet',
				amount: 30,
			},
		},
		targets: '1 creature and 1 object',
		entries: [
			"You imbue the provided token with luck. You choose a single creature within range during the ritual's performance to become the recipient of the token's luck. That creature has access to the token's luck as long as they're wearing the token. If the token is stolen or lost, they lose access to its luck until the token is recovered. The token loses its luck if it's destroyed or after the duration noted in the ritual's effects has elapsed.",
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						"You can call upon the token's luck. Once per week, when rolling a saving throw or skill check, you can use the token's power and roll twice, taking the higher result. This is a {@trait fortune} effect. The token keeps its luck for 1 month.",
					Success:
						"As a critical success, except you can only call upon the token's power once during the lucky month.",
					Failure: 'The ritual has no effect.',
					'Critical Failure':
						"Magical backlash creates ill luck. Once per week, the ritual's recipient must roll twice and take the worse result for their first significant saving throw or skill check of the week, as determined by the GM. This is a {@trait misfortune} effect. This ill luck remains for 1 month and applies to the recipient whether or not they're wearing the token.",
				},
			},
		],
	},
	{
		name: 'Mindscape Door',
		source: 'DA',
		page: 199,
		level: 5,
		traits: ['uncommon', 'illusion'],
		cast: {
			number: 1,
			unit: 'hour',
		},
		primaryCheck: {
			skills: ['Arcana', 'Occultism'],
			prof: 'expert',
		},
		cost: "incense and focusing diagrams worth a total value of the target's level (minimum 1) × 1 gp, for each target",
		secondaryCasters: {
			number: 3,
		},
		secondaryCheck: {
			entry: '{@skill Arcana} or {@skill Occultism}, {@skill Deception} or {@skill Diplomacy}, {@skill Perception}',
			skills: ['Arcana', 'Occultism', 'Deception', 'Diplomacy', 'Perception'],
		},
		entries: [
			"You project the targets into an immersive mindscape or cause them to exit one. You must be aware the mindscape exists, though you don't need to know specifics. The casters must be in physical contact with one another in a circle for the duration of the casting and all targets must be selected from these casters. Your bodies typically remain behind in stasis when you enter a mindscape, though some mindscapes pull you entirely into them upon entrance. If you enter a mindscape, you can leave only by using another mindscape door ritual, finding an exit within the nature of the mindscape, or when the mindscape ceases to exist. When exiting a mindscape, you typically return to your bodies or to the location where you entered the mindscape.",
			"If the mindscape's creator wants to prevent anyone from entering or exiting, the DC of the primary check is the creator's Will DC if that would be higher than the ritual's normal DC.",
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						'You transport the creatures as you intended and can leave a portal that lasts for an unlimited duration. It typically looks like an ordinary door or passage appropriate to the mindscape. Any target of the spell can enter or exit through this portal as they would an ordinary door. If you wish, you can make the door passable by anyone.',
					Success: 'You transport the creatures as you intended.',
					Failure: 'You fail to enter or exit the mindscape.',
					'Critical Failure':
						'Something goes horribly wrong. The GM decides whether mental feedback deals {@damage 9d6} mental damage to all ritual casters (DC 26 basic Will save) or {@dice 1d4} casters are unwillingly pulled into the mindscape (or ejected from it).',
				},
			},
		],
		heightened: {
			X: {
				'8': [
					'The ritual targets up to 100 willing creatures, the critical failure damage increases to {@damage 20d6}, and the critical failure save DC increases to 40.',
				],
			},
		},
	},
	{
		name: 'Construct Mindscape',
		source: 'DA',
		page: 199,
		level: 5,
		traits: ['rare', 'illusion'],
		cast: {
			number: 1,
			unit: 'day',
		},
		primaryCheck: {
			skills: ['Arcana', 'Occultism'],
			prof: 'master',
		},
		cost: 'precious clay, wood, or other modeling materials worth spell level × 20 gp',
		secondaryCasters: {
			number: 4,
		},
		secondaryCheck: {
			entry: '{@skill Arcana} or {@skill Occultism}, {@skill Crafting}',
			skills: ['Arcana', 'Occultism', 'Crafting'],
		},
		entries: [
			"You create an entirely mental environment called an immersive mindscape. It can have any appearance you and the secondary casters imagine and hold in your minds as you execute the ritual. A mindscape is typically veiled, disguising its nature as a mental construct, but you can choose to make it overt. Even a veiled mindscape has some signs it's not a real place that can be revealed through close inspection or by spending a long time there. Most mindscapes are incapable of physically harming those inside. Even though the mindscape you create is limited in dimension, it appears to have a convincing environment around it, such as a sky and clouds.",
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						'You create a mindscape approximately a half-mile in length and width, and 50 feet in height (large enough to contain a typical village). The GM might allow you to make it larger if it has little detail, such as a grassy plain. You and any secondary casters of your choice can enter it and you can leave a doorway that you and any creatures you designate can pass through.',
					Success:
						'As critical success, but the mindscape is approximately 25 feet in length, width, and height (like a modest house).',
					Failure: "You can't hold the image together and it falls apart.",
					'Critical Failure':
						'Your secret desires horribly warp the mindscape into a distorted mirror of what you intended.',
				},
			},
		],
		duration: {
			number: 1,
			unit: 'day',
		},
		heightened: {
			X: {
				'6': ['The duration is 1 week.'],
				'9': [
					'The duration is 1 year, and the area on a critical success is 1 mile in length and width.',
				],
				'10': [
					'The duration is unlimited, and the area on a critical success is 1 mile in length and width. The cost increases to 2,000 gp.',
				],
			},
		},
	},
	{
		name: 'Abyssal Pact',
		source: 'B1',
		page: 347,
		level: 1,
		traits: ['uncommon', 'conjuration'],
		cast: {
			number: 1,
			unit: 'day',
		},
		primaryCheck: {
			skills: ['Religion'],
			prof: 'expert',
			mustBe: ['demon'],
		},
		entries: [
			"You call in a favor from another demon whose level is no more than double {@i Abyssal pact's} spell level, two demons whose levels are each at least 2 less than double the spell level, or three demons whose levels are each at least 3 less than double the spell level.",
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						"You conjure the demon or demons. They are eager to pursue the task, so they don't ask for a favor.",
					Success:
						'You conjure the demon or demons. They are not eager to pursue the task, so they require a favor in return.',
					Failure: "You don't conjure any demons.",
					'Critical Failure':
						'The demon or demons are angry that you disturbed them. They appear before you, but they immediately attack you.',
				},
			},
		],
	},
	{
		name: 'Angelic Messenger',
		source: 'B1',
		page: 348,
		level: 1,
		traits: ['uncommon', 'conjuration'],
		cast: {
			number: 1,
			unit: 'day',
		},
		primaryCheck: {
			skills: ['Religion'],
			mustBe: ['angel'],
			prof: 'expert',
		},
		entries: [
			"You transport yourself to either a celestial plane or a world on the Material Plane where worshippers of your patron can be found. You must be of no higher level than double {@i angelic messenger's} spell level.",
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						"As success, but if you've never visited that plane or world before, you appear right in front of the message's intended recipient.",
					Success:
						"You arrive on the target plane or world at the last location you visited on that plane or world, or to a random location within 10d10 miles of your message's intended recipient if you've never visited that plane or world before.",
					Failure: "You don't travel.",
					'Critical Failure':
						'You accidentally travel to the wrong plane, possibly a dangerous plane.',
				},
			},
		],
	},
	{
		name: 'Anima Invocation (Modified)',
		source: 'AoA6',
		page: 75,
		level: 10,
		traits: ['rare', 'abjuration'],
		cast: {
			number: 1,
			unit: 'hour',
		},
		secondaryCasters: {
			number: 4,
		},
		primaryCheck: {
			entry: '{@skill Occultism} (legendary)',
			skills: ['Occultism'],
			prof: 'legendary',
		},
		secondaryCheck: {
			entry: '{@skill Arcana}, {@skill Religion}',
			skills: ['Arcana', 'Religion'],
		},
		range: {
			entry: '10 miles',
			distance: {
				type: 'miles',
				amount: 10,
			},
		},
		targets: 'primary and secondary casters',
		duration: {
			number: 1,
			unit: 'day',
		},
		entries: [
			"The exact effects of the unmodified {@i Anima Invocation} are not necessary for this Adventure Path\u2014what's presented here is the modified version of the ritual.",
			"When casting the modified version of the {@i Anima Invocation}, it instead draws upon the latent spiritual energies of sapient creatures within range of the spell without requiring their deaths, then uses this energy to bolster the connection between body and soul among all of the ritual's casters. This shift from an offensive effect to a defensive one results in a much less dangerous spell that helps to protect against {@deity Dahak|LOGM}.",
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						"You gain full access to your own potential for 1 day. You gain resistance 10 to all damage and a +4 status bonus to saves against effects created by evil creatures. Your {@action Strike||Strikes} gain the effects of the {@item ghost touch} rune and deal an additional {@damage 1d10} good damage. You are immune to the soul-draining effect within Alseta's Landing.",
					Success:
						"You tap into your own potential for 1 day. You gain resistance 5 to all damage and a +2 status bonus to saves against effects created by evil creatures. Your {@action Strike||Strikes} gain the effects of the {@item ghost touch} rune and deal an additional 1 good damage. You are immune to the soul-draining effect within Alseta's Landing.",
					Failure:
						"You are unable to tap into your own spiritual essence, but you still gain immunity to the souldraining effect within Alseta's Landing.",
					'Critical Failure':
						"You botch the ritual, damaging your own spiritual essence. You gain {@condition doomed|CRB|doomed 1} or increase your {@condition doomed} condition by 1 if you're already {@condition doomed}. This {@condition doomed} value decreases by 1 every week. This is a {@trait curse} effect.",
				},
			},
		],
	},
	{
		name: 'Animate Object',
		source: 'CRB',
		page: 409,
		level: 2,
		traits: ['uncommon', 'transmutation'],
		cast: {
			number: 1,
			unit: 'day',
		},
		cost: 'rare oils, see {@table Creature Creation Rituals|CRB|Table 7\u20131}',
		secondaryCasters: {
			number: 1,
		},
		primaryCheck: {
			entry: '{@skill Arcana} (expert)',
			skills: ['Arcana'],
			prof: 'expert',
		},
		secondaryCheck: {
			entry: '{@skill Crafting}',
			skills: ['Crafting'],
		},
		range: {
			entry: '10 feet',
			distance: {
				type: 'feet',
				amount: 10,
			},
		},
		targets: '1 object',
		entries: [
			'You transform the target into an animated object with a level up to that allowed by {@table Creature Creation Rituals|CRB|Table 7\u20131} and of a type corresponding to the object (so a broom would become an animated broom).',
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						"The target becomes an animated object of the appropriate type. If it's at least 4 levels lower than you, you can make it a minion. This gives it the minion trait, meaning it can use 2 actions when you command it, and commanding it is a single action that has the {@trait auditory} and {@trait concentrate} traits. You can have a maximum of four minions under your control. If it doesn't become a minion, you can give it one simple command. It pursues that goal single-mindedly, ignoring any of your subsequent commands.",
					Success:
						"As critical success, except an animated object that doesn't become your minion stays in place and attacks anyone that attacks it or tries to steal or move it, rather than following your command.",
					Failure: 'You fail to create the animated object.',
					'Critical Failure':
						'You create the animated object, but it goes berserk and attempts to destroy you.',
				},
			},
		],
	},
	{
		name: 'Arcane Weaving',
		source: 'SoT1',
		page: 79,
		level: 3,
		traits: ['uncommon', 'divination'],
		cast: {
			number: 1,
			unit: 'day',
		},
		cost: 'rare silks worth a total value of 20 gp × the spell level',
		secondaryCasters: {
			number: 1,
		},
		primaryCheck: {
			skills: ['Arcana', 'Occultism'],
			prof: 'expert',
		},
		secondaryCheck: {
			skills: ['Arcana', 'Crafting', 'Occultism'],
		},
		entries: [
			'You and the secondary casters weave together spells (and, if anadis, silk) in a complex ritual that combines magical learning with art, allowing all the participants to share spells they know with one another.',
			{
				type: 'successDegree',
				entries: {
					Success:
						"You or any secondary caster can swap any spell in your spell repertoire for a spell in the spell repertoire of any other participant. This spell can't be a higher level than the ritual's level.",
					Failure: 'None of the participants can swap spells.',
					'Critical Failure':
						"As failure, and all participants are {@condition stupefied|CRB|stupefied 1} for 24 hours and can't reduce their {@condition stupefied} condition below 1 for 24 hours.",
				},
			},
		],
	},
	{
		name: 'Asmodean Wager',
		source: 'SoM',
		page: 147,
		level: 6,
		traits: ['rare', 'divination', 'linguistic'],
		cast: {
			number: 1,
			unit: 'hour',
		},
		cost: 'parchment, ink, and an item of value from each bettor worth at least 50 gp',
		secondaryCasters: {
			number: 1,
			note: 'to 9',
		},
		primaryCheck: {
			skills: ['Occultism'],
			prof: 'expert',
		},
		secondaryCheck: {
			skills: ['Society'],
		},
		duration: {
			entry: "Until the wager's completion",
			unit: 'special',
		},
		entries: [
			'You facilitate a magically binding agreement between yourself and one or more additional secondary casters, wherein each participant (hereafter referred to as the bettors) stakes something of value on the outcome of an event that has yet to be determined. The nature of the event is up to the bettors: a test of skill, a game of chance, or even something occurring in the distant future. While named for {@deity Asmodeus} and invented by those with a diabolical bent, the ritual has no particular connection to Hell and instead relies on the occult connections between the bettors. The stakes can be either of the following:',
			{
				type: 'list',
				items: [
					"A promise or possession. The losers of the bet are placed under the effects of a 9th-level geas ritual to uphold the promise or turn over a single item they own, as stated at the time of the spell's casting. Once ownership has been transferred or the promise fulfilled, nothing prevents the bettors from trying to reclaim a former possession.",
					"The bettors' life. As soon as the outcome has been decided, the losers die instantly with no saving throw; this is a {@trait death} effect. The next time the winner would die, they instead remain alive and {@condition unconscious} at 0 Hit Points with a {@condition dying} condition 1 lower than would kill them. Until this protection has been exhausted, the loser of the bet can't be returned to life through any means, even powerful magic such as wish. A creature already in possession of an additional life as a result of winning an Asmodean wager can't enter into a new wager with a life as collateral",
				],
			},
			"If any participant knowingly and willingly makes any attempt to cheat at or avoid fulfilling the terms of the wager, the spell automatically determines them the loser and resolves accordingly. The spell doesn't function if any participant is acting against their will or being mentally {@condition controlled} or coerced by any means, or if any participant is immune to or otherwise unaffected by their wager (such as if a construct, undead, or other creature immune to {@trait death} effects tried to bet its life). At the GM's discretion, if it ever becomes permanently impossible for the bet's outcome to be determined, the spell ends without any further result.",
			{
				type: 'successDegree',
				entries: {
					Success: 'The ritual is successful.',
					Failure: 'The ritual has no effect.',
					'Critical Failure':
						'The wording of the ritual is imperfect and subverts the bet, causing all bettors to be considered losers regardless of the actual result of the wager.',
				},
			},
		],
	},
	{
		name: 'Astral Projection',
		source: 'APG',
		page: 240,
		level: 5,
		traits: ['uncommon', 'divination'],
		cast: {
			number: 1,
			unit: 'hour',
		},
		cost: "one jacinth worth a total value of the target's level (minimum 1) × 5 gp, for each target",
		secondaryCasters: {
			number: 2,
		},
		primaryCheck: {
			entry: '{@skill Arcana} or {@skill Occultism} (master)',
			skills: ['Arcana', 'Occultism'],
			prof: 'master',
		},
		secondaryCheck: {
			entry: "{@skill Arcana} or {@skill Occultism} (whichever isn't used for the primary check), {@skill Survival}",
			skills: ['Arcana', 'Occultism', 'Survival'],
		},
		range: {
			entry: 'touch',
		},
		targets: 'yourself and up to 5 willing creatures',
		duration: {
			entry: 'see text',
		},
		entries: [
			"You project the targets' spiritual essences into the {@place Astral Plane}, leaving their inanimate physical forms behind. These astral forms can be used to explore the {@place Astral Plane} indefinitely, while the targets' bodies remain safely in stasis on the plane where the ritual was cast (where they remain unconscious and can't be awoken normally). The casters must be in physical contact with one another in a circle for the duration of the casting, and all targets must be selected from these casters.",
			"A target's astral form is a duplicate of the target and everything they're carrying; anything that happens to a duplicate item happens to the original as well. For instance, if you use, spend, destroy, lose, or give away an item's duplicate, the original vanishes from your possession. For the duration of the ritual, any of the targets can spend a single action to Dismiss their astral form and immediately return to their physical body. As the primary caster, when you Dismiss your astral form, you can also Dismiss all the other targets' astral forms as part of the same action, returning all targets to their physical forms simultaneously. While in the {@place Astral Plane}, the other targets are unable to navigate without you, and if they become separated from you, they must wait for your return or Dismiss their own astral forms. When the ritual ends, the targets' astral forms vanish.",
			"A target's astral form and corresponding physical form are linked by an incorporeal silver cord, which is visible only in the {@place Astral Plane}. This nearly unbreakable cord serves as a conduit and safety line; if it is severed, the target's astral and physical forms are both immediately slain. If the ritual is interrupted by an external force, such as {@spell dispel magic} being cast on a target's physical or astral form, the target is immediately and harmlessly returned to their physical body. If a target's astral form is slain, the silver cord immediately rips them back to their physical body; the strain requires them to attempt a Fortitude save with the same DC as the ritual's primary check. On a failure, the creature dies; on a success, they become {@condition clumsy 2}, {@condition drained 2}, {@condition doomed 2}, and {@condition enfeebled 2} for 1 week; these conditions can't be removed or reduced by any means until the week has passed. A target's physical body remains in suspended animation for the duration of the ritual, but if it is destroyed, they die and their astral form also vanishes.",
			"This ritual only projects a portion of the targets' consciousnesses onto the {@place Astral Plane}. To travel physically to the {@place Astral Plane} (to reach the Outer Planes, for example) requires spells such as {@spell plane shift}.",
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						"All targets are able to navigate independently in the Astral Plane. Each target's silver cord is stronger than usual, providing them a +4 circumstance bonus to their Fortitude save to avoid dying if their astral form dies.",
					Success: 'You successfully project the targets.',
					Failure: 'You fail to project the targets.',
					'Critical Failure':
						"The process of separating the targets' spirits from their bodies is complicated, and something goes catastrophically wrong. All casters become {@condition doomed 1}, are immediately reduced to 0 Hit Points, and begin dying.",
				},
			},
		],
	},
	{
		name: 'Atone',
		source: 'CRB',
		page: 409,
		level: 4,
		traits: ['uncommon', 'abjuration'],
		cast: {
			number: 1,
			unit: 'day',
		},
		cost: "rare incense and offerings worth a total value of 20 gp × the target's level",
		secondaryCasters: {
			number: 1,
			note: "must be the ritual's target",
		},
		primaryCheck: {
			entry: '{@skill Nature} or {@skill Religion} (expert)',
			skills: ['Nature', 'Religion'],
			prof: 'expert',
		},
		secondaryCheck: {
			entry: '{@skill Nature} or {@skill Religion} (whichever is used for the primary check)',
			skills: ['Nature', 'Religion'],
		},
		range: {
			entry: '10 feet',
			distance: {
				type: 'feet',
				amount: 10,
			},
		},
		targets:
			'another creature of up to 8th level who is a worshipper of the same deity or philosophy as you',
		entries: [
			"You attempt to help a truly penitent creature atone for its misdeeds, typically actions contrary to your deity's alignment or anathema to your deity. If the creature isn't truly penitent, the outcome is always a critical failure. This ritual uses {@skill Nature} if the target is a druid, and {@skill Religion} in all other cases.",
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						"The creature receives absolution for its misdeeds, allowing it to regain standing with your deity. It returns to its previous alignment (if its alignment shifted) and regains any abilities it lost. Before the atonement is complete, the creature must perform a special quest or other task chosen by your deity, as befits its misdeeds. If completed during downtime, this task should take no less than 1 month. For 1 month, the target receives divine insight just before performing an act that would be anathema to your deity or contrary to your deity's alignment.",
					Success:
						'As critical success, but the creature gains no special insight regarding its subsequent actions.',
					Failure:
						'The creature does not receive absolution and must continue to meditate and redress its misdeeds. Any future atone rituals for the same misdeeds cost half as much and gain a +4 circumstance bonus to primary and secondary checks.',
					'Critical Failure':
						"The creature offends your deity and is permanently cast out from the faith. The creature can't rejoin your religion without a more direct intervention.",
				},
			},
		],
		heightened: {
			plusX: {
				'1': ['Increase the maximum target level by 2 and the base cost by 20 gp.'],
			},
		},
	},
	{
		name: 'Awaken Animal',
		source: 'CRB',
		page: 409,
		level: 6,
		traits: ['uncommon', 'divination', 'mental'],
		cast: {
			number: 1,
			unit: 'day',
		},
		cost: 'herbs, 1/5 the value on {@table Creature Creation Rituals|CRB|Table 7\u20131}',
		secondaryCasters: {
			number: 3,
		},
		primaryCheck: {
			entry: '{@skill Nature} (master)',
			skills: ['Nature'],
			prof: 'master',
		},
		secondaryCheck: {
			entry: '{@skill Lore} (any), {@skill Society}, {@skill Survival}',
			skills: ['Lore', 'Society', 'Survival'],
		},
		range: {
			entry: '10 feet',
			distance: {
				type: 'feet',
				amount: 10,
			},
		},
		targets:
			'1 animal of up to the level on {@table Creature Creation Rituals|CRB|Table 7\u20131}',
		entries: [
			'You grant intelligence to the target, transforming it into a beast. If it was previously an animal companion or minion, it can no longer serve as one.',
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						"The target's Intelligence, Wisdom, and Charisma modifiers each increase to +2 if they were lower, and it becomes {@condition helpful} to you for awakening it.",
					Success:
						"The target's Intelligence, Wisdom, and Charisma modifiers increase to +0 if they were worse and it becomes {@condition friendly} to you for awakening it.",
					Failure: 'You fail to awaken the target.',
					'Critical Failure':
						"You accidentally awaken the target with a pure bestial hatred toward you. The target's Intelligence, Wisdom, and Charisma modifiers increase to \u20132 if they were worse. It becomes {@condition hostile} to you, attempting to destroy you.",
				},
			},
		],
	},
	{
		name: 'Awaken Object',
		source: 'SoM',
		page: 147,
		level: 6,
		traits: ['uncommon', 'divination', 'mental'],
		cast: {
			number: 1,
			unit: 'day',
		},
		cost: 'crushed gems and spices worth 250 gp',
		secondaryCasters: {
			number: 2,
		},
		primaryCheck: {
			entry: '{@skill Arcana} (expert) or {@skill Occultism} (expert)',
			skills: ['Arcana', 'Occultism'],
			prof: 'expert',
		},
		secondaryCheck: {
			entry: "{@skill Crafting}, {@skill Arcana} or {@skill Occultism} (whichever isn't used for the primary check)",
			skills: ['Arcana', 'Crafting', 'Occultism'],
		},
		targets: '1 non-magical inanimate object',
		duration: {
			unit: 'unlimited',
		},
		entries: [
			"You imbue a single Small or smaller object with rudimentary awareness and consciousness, and it gains mental ability modifiers depending on the results of the ritual. It gains the ability to see and hear, and the ability to understand (but not speak) a single language that you know. It's {@condition indifferent} to you and all living creatures. In all other respects, it's an ordinary object of its type. An awakened object that gains the {@condition broken} condition is rendered insensate until Repaired above its {@condition Broken} Threshold.",
			"Magical objects and constructs can't be awakened, nor can most spell or magic item abilities be added to an awakened object later (the process to do so is much more complicated than a ritual and essentially creates an intelligent magic.",
		],
	},
	{
		name: 'Awaken Portal',
		source: 'AV1',
		page: 79,
		level: 3,
		traits: ['rare', 'conjuration'],
		cast: {
			number: 1,
			unit: 'hour',
		},
		secondaryCasters: {
			number: 5,
			entry: 'up to 5',
		},
		primaryCheck: {
			entry: '{@skill Arcana} or {@skill Occultism} (trained)',
			skills: ['Arcana', 'Occultism'],
			prof: 'trained',
		},
		secondaryCheck: {
			entry: '{@skill Arcana}, {@skill Occultism} (whichever is used for the primary check)',
			skills: ['Arcana', 'Occultism'],
		},
		range: {
			entry: '10 feet',
			distance: {
				type: 'feet',
				amount: 10,
			},
		},
		targets: '1 portal',
		entries: [
			"You attempt to reactivate a dormant gate, portal, or {@ritual teleportation circle|apg} by infusing it with magical energies. This ritual must be successfully performed twice, once at each location the portal connects. While the teleportation circles and portals found in the Abomination Vaults require no additional cost to awaken, other portals might require rare items or specific materials as a cost for this ritual at the GM's discretion\u2014some portals might even be so powerful that this ritual cannot awaken them at all.",
			'The DC required to successfully awaken a portal varies based on the strength and distance between its end points. For the portals found in the Abomination Vaults Adventure Path, the DC varies according to the dungeon level on which it is located. Use the {@table DCs by Level||DCs by Spell Level section of Table 10\u20135} to determine the DC for a portal, using the dungeon level in place of spell level. Thus, activating the portal on the first level of the Abomination Vaults requires a successful DC 15 check, while activating the portal on the fourth level requires a successful DC 23 check.',
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						"You awaken the portal. If its other side is awakened, the portal can be used normally and won't deactivate naturally. If its other side is not awakened, this side remains awakened for 1 year, possibly allowing you enough time to find and awaken the connecting portal.",
					Success:
						"As critical success, but if the portal's other side is not awakened, this side remains awakened for only 1d6 days before it fades and falls dormant again.",
					Failure:
						'You fail to activate the portal, and magical backlash leaves you {@condition stupefied 1} for 24 hours.',
					'Critical Failure':
						"As failure, but in addition, a hostile creature is drawn through the portal and immediately attacks anyone present. The creature drawn through the portal varies, according to the portal's nature; in the Abomination Vaults, the creature conjured depends on the dungeon level where the ritual was attempted, as listed below.",
				},
			},
			{
				type: 'list',
				style: 'list-no-bullets',
				items: [
					'{@b First Level} {@creature vampiric mist|b2}',
					'{@b Second Level} {@creature scalathrax|AV1}',
					'{@b Third Level} {@creature gibbering mouther}',
					"{@b Fourth Level} {@creature will-o'-wisp}",
					'{@b Fifth Level} {@creature soul eater|b2}',
					'{@b Sixth Level} {@creature voidglutton|AV1}',
					'{@b Seventh Level} {@creature dread wraith|b2}',
					'{@b Eighth Level} {@creature ghost mage}',
					'{@b Ninth Level} {@creature gosreg|b2}',
					'{@b Tenth Level} {@creature shining child}',
				],
			},
		],
	},
	{
		name: 'Bathe In Blood',
		source: 'SoM',
		page: 148,
		level: 8,
		traits: ['rare', 'necromancy'],
		cast: {
			number: 1,
			unit: 'day',
		},
		cost: "alchemical herbs and components worth a total of 1,000 gp × the target's level",
		secondaryCasters: {
			number: 2,
		},
		primaryCheck: {
			entry: '{@skill Occultism} (expert)',
			skills: ['Occultism'],
			prof: 'expert',
		},
		secondaryCheck: {
			entry: '{@skill Religion}, {@skill Society}',
			skills: ['Religion', 'Society'],
		},
		range: {
			distance: {
				amount: 20,
				type: 'feet',
			},
			entry: '20 feet',
		},
		targets:
			"1 living creature of a level no greater than double the bathe in blood ritual's level",
		entries: [
			'This is an old ritual, illegal in nearly every corner of Golarion, but never quite exterminated. You bathe in the freshly spilled blood of your people, whose lives and years you steal in the process.',
			'This ritual requires that you submerge yourself in a bath of alchemically treated blood, attended by silent servants.',
			"The blood must come from the same ancestry as your own, and must have been spilled within the last 6 hours; a spell such as {@spell gentle repose} can extend this time, but using such preserved blood applies a \u20134 circumstance penalty to the primary and secondary checks. If you're {@trait Medium}, you require 30 gallons of blood to immerse yourself, and a typical {@trait Medium} creature holds about 1-1/2 gallons of blood in its body. This ritual doesn't strictly require that the blood donors be killed and drained dry, but the logistical challenges of gathering enough blood without murder are beyond all but the most well-resourced casters.",
			'Each time you enact this ritual, regardless of its success or failure, you take a penalty to the primary check for all subsequent castings. This penalty starts at \u20131 and increases by \u20131 during each casting (so if you were casting this ritual on yourself for the fifth time, you would take a \u20134 penalty on your {@skill Occultism} check).',
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						"You emerge rejuvenated and revived. You become up to 40 years younger, returning to the prime of youth and life. If you're already at your desired age, your aging instead stops for the next 40 years. While remaining recognizably yourself, you also become preternaturally attractive, gaining a +1 circumstance bonus to {@action Make an Impression}.",
					Success: 'You become 20 years younger or pause your aging for 20 years.',
					Failure: 'The ritual has no effect.',
					'Critical Failure':
						'You die. Casters killed this way frequently return as undead, often as ghosts or vampires.',
				},
			},
		],
	},
	{
		name: 'Blight',
		source: 'CRB',
		page: 410,
		level: 4,
		traits: ['uncommon', 'necromancy', 'negative', 'plant'],
		cast: {
			number: 1,
			unit: 'day',
		},
		secondaryCasters: {
			number: 1,
		},
		primaryCheck: {
			entry: '{@skill Nature} (expert)',
			skills: ['Nature'],
			prof: 'expert',
		},
		secondaryCheck: {
			entry: '{@skill Survival}',
			skills: ['Survival'],
		},
		area: {
			types: ['Misc.'],
			entry: '1/2-mile-radius circle centered on you',
		},
		duration: {
			number: 1,
			unit: 'year',
		},
		entries: [
			'You twist and stunt plants in the area, causing them to wither. In addition to other dangers from failing plant life, this decreases the crop yield for farms. If you cast this ritual in an area affected by plant growth, blight attempts to counteract plant growth instead of producing its usual effect.',
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						'Completely spoil the crop yield in the area, or decrease the yield by half in an area with up to a 1-mile radius.',
					Success: 'Decease the crop yield in the area by half.',
					Failure: 'The ritual has no effect.',
					'Critical Failure':
						'The flora in the area changes in an unexpected way, determined by the GM but generally as contradictory to your true desires as possible (for instance, enriching crops when you would prefer to blight them).',
				},
			},
		],
	},
	{
		name: 'Call Spirit',
		source: 'CRB',
		page: 410,
		level: 5,
		traits: ['uncommon', 'necromancy'],
		cast: {
			number: 1,
			unit: 'hour',
		},
		cost: 'rare candles and incense worth a total value of 50 gp',
		secondaryCasters: {
			number: 1,
		},
		primaryCheck: {
			entry: '{@skill Occultism} (expert) or {@skill Religion} (expert)',
			skills: ['Occultism', 'Religion'],
			prof: 'expert',
		},
		secondaryCheck: {
			entry: "{@skill Occultism} or {@skill Religion} (whichever isn't used for the primary check)",
			skills: ['Occultism', 'Religion'],
		},
		duration: {
			entry: 'up to 10 minutes',
			number: 10,
			unit: 'minute',
		},
		entries: [
			"You tear the veil to the afterlife and call a spirit from its final resting place. You must call the spirit by name, and you must provide a connection to the spirit, such as a possession, a garment, or a piece of its corpse. A spirit unwilling to heed your call can attempt a Will save to avoid it; on a critical success, a trickster spirit {@action Impersonate||Impersonates} the spirit you meant to call. The DC of the Will save is 2 lower if you haven't met the spirit in life.",
			"Either way, the spirit appears as a wispy form of the creature you meant to call. Each minute of the duration, you can ask the spirit a question. It can answer how it pleases or even refuse to answer. If the spirit isn't in the afterlife (such as if it's an undead), all results other than critical failures use the failure effect.",
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						'The spirit is particularly cooperative, and even if it has strong reasons to deceive you, it takes a \u20132 circumstance penalty to its {@skill Deception} checks.',
					Success: 'You call the spirit.',
					Failure: 'You fail to call a spirit.',
					'Critical Failure': 'One or more evil spirits appear and attack.',
				},
			},
		],
	},
	{
		name: 'Clone',
		source: 'APG',
		page: 240,
		level: 9,
		traits: ['rare', 'necromancy'],
		cast: {
			number: 7,
			unit: 'day',
		},
		cost: "rare laboratory supplies and reagents worth the target's level (minimum 1) × 100 gp",
		secondaryCasters: {
			number: 3,
		},
		primaryCheck: {
			entry: '{@skill Crafting} (legendary)',
			skills: ['Crafting'],
			prof: 'legendary',
		},
		secondaryCheck: {
			entry: '{@skill Arcana}, {@skill Occultism}, {@skill Medicine}',
			skills: ['Arcana', 'Occultism', 'Medicine'],
		},
		targets: '1 living creature up to 20th level',
		entries: [
			"You remove 1 cubic inch of flesh from the target, who must be present throughout the ritual and can be one of the casters. You then use that flesh to grow a duplicate of the target's physical form that will house the target's soul upon death. This duplicate is physically identical to the original creature.",
			"In order to perform the ritual, you need an {@item expanded alchemist's lab} or a superior set of equipment. Once the ritual is successfully completed, the duplicate grows within the laboratory equipment for {@dice 2d4} months. While direct involvement isn't required during this period of growth, you must prevent any interference or interruption or the ritual fails. When the duplicate is complete, the original creature's soul enters it as soon as their original body dies, or immediately if the creature died during the intervening months, as long as the soul is free and willing. If {@deity Pharasma} has decided that the target's time has come or the target's soul is trapped or doesn't wish to return, the duplicate remains empty until the impediment is removed. While unoccupied, the inert duplicate must be preserved in suitable alchemical equipment to prevent it from rotting.",
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						"The cloning process is successful. When the soul occupies the completed clone, it is {@condition clumsy 1}, {@condition drained 1}, {@condition doomed 1}, and {@condition enfeebled 1} for 1 week; these conditions can't be removed or reduced by any means until the week has passed.",
					Success: 'As critical success, but each condition value is 2.',
					Failure: 'You fail to form the clone.',
					'Critical Failure':
						"The clone appears to be successful, but something went horribly wrong. Once it grows to its full size, it can't hold the target's soul and instead houses a malevolent intelligence or an invasive creature such as an {@creature invidiak|b2} demon.",
				},
			},
		],
	},
	{
		name: 'Commune',
		source: 'CRB',
		page: 410,
		level: 6,
		traits: ['uncommon', 'divination', 'prediction'],
		cast: {
			number: 1,
			unit: 'day',
		},
		cost: 'rare incense worth a total value of 150 gp',
		secondaryCasters: {
			number: 1,
		},
		primaryCheck: {
			entry: '{@skill Occultism} (master) or {@skill Religion} (master)',
			skills: ['Occultism', 'Religion'],
			prof: 'master',
		},
		secondaryCheck: {
			entry: '{@skill Occultism} or {@skill Religion} (whichever is used for the primary check)',
			skills: ['Occultism', 'Religion'],
		},
		duration: {
			entry: 'up to 10 minutes',
			number: 10,
			unit: 'minute',
		},
		entries: [
			'You call upon an unknown planar entity to answer questions; this is a servitor of your deity if you have one and use {@skill Religion}. You can ask up to seven questions that could be answered with "Yes" or "No." The entity is likely to know answers related to its purview; a servitor of Gozreh would likely know about unnatural weather patterns and a servitor of Desna would likely know someone\'s travel route. The entity answers with one word answers such as "Yes," "No," "Likely," and "Unknown," though its answers always reflect its own agenda and could be deceptive.',
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						'You contact a more powerful entity aligned strongly with your interests, possibly even your deity. The entity won\'t attempt to deceive you, though it still might not know the answers. When it\'s important to provide clarity, the entity will answer your questions with up to five words, such as "If you leave immediately" or "That was true once."',
					Success: 'You can ask your questions and receive answers.',
					Failure: 'You fail to contact a planar entity.',
					'Critical Failure':
						"You are exposed to the enormity of the cosmos and are {@condition stupefied 4} for 1 week (can't remove by any means).",
				},
			},
		],
	},
	{
		name: 'Commune With Nature',
		source: 'CRB',
		page: 410,
		level: 6,
		traits: ['uncommon', 'divination', 'prediction'],
		cast: {
			number: 1,
			unit: 'day',
		},
		cost: 'rare incense worth a total value of 60 gp',
		secondaryCasters: {
			number: 1,
		},
		primaryCheck: {
			entry: '{@skill Nature} (master)',
			skills: ['Nature'],
			prof: 'master',
		},
		secondaryCheck: {
			entry: '{@skill Nature}',
			skills: ['Nature'],
		},
		duration: {
			entry: 'up to 10 minutes',
			number: 10,
			unit: 'minute',
		},
		entries: [
			"As {@ritual commune}, except you contact the primal spirits of nature, which know about animals, beasts, fey, plants, fungi, topography, and natural resources within a 3-mile radius of the ritual's location.",
		],
	},
	{
		name: 'Community Repair',
		source: 'SoT2',
		page: 75,
		level: 4,
		traits: ['rare', 'emotion', 'transmutation'],
		cast: {
			number: 1,
			unit: 'day',
		},
		cost: 'rare powdered pigments in at least three different colors, worth a total of 50 gp',
		secondaryCasters: {
			number: 4,
			note: 'or more',
		},
		primaryCheck: {
			entry: '{@skill Performance} (expert)',
			skills: ['Performance'],
			prof: 'expert',
		},
		secondaryCheck: {
			entry: '{@skill Crafting}, {@skill Performance}, {@skill Society}',
			skills: ['Crafting', 'Performance', 'Society'],
		},
		range: {
			distance: {
				amount: 10,
				type: 'feet',
			},
			entry: '10 feet',
		},
		targets:
			'1 damaged or {@condition broken} public work no larger than 3,000 cubic feet (the size of a {@trait Huge} creature)',
		entries: [
			"You lead your community in repairing a public work, such as a bridge, well, or mural, through the power of memory and art. The primary caster serves as an emcee or leader, while each secondary caster provides a heartfelt anecdote that somehow involves the public work; for instance, recounting a story of playing at a fountain each summer. The anecdotes don't need to be firsthand accounts\u2014a community member might sing of how their grandparents fell in love crossing a bridge every day\u2014but they must be directly connected in some way. The GM can offer a +1 circumstance bonus to the secondary caster whose anecdote seems most moving.",
			'If the public work was destroyed intentionally by one of the casters, the ritual automatically critically fails.',
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						'The public work is restored to its prior construction, and it takes on further qualities, encouraged by the thoughts of the community. For the next week, while a caster is within 60 feet of the site of the ritual, they receive a +1 status bonus to Will saves against {@trait emotion} effects and a +10-foot status bonus to their Speeds.',
					Success: 'The public work is restored to its prior construction and function.',
					Failure: 'The ritual has no effect.',
					'Critical Failure':
						'The public work refuses to repair itself, and the memories of the community members are soured in response to the botched ritual. For the next week, while a caster is within 60 feet of the site of the ritual, they cannot receive any benefit from beneficial {@trait emotion} effects, and they take a \u201310-foot status penalty to their Speeds as their movement slows to a morose crawl.',
				},
			},
		],
	},
	{
		name: "Concealment's Curtain",
		source: 'SoM',
		page: 148,
		level: 4,
		traits: ['uncommon', 'curse', 'divination', 'mental'],
		cast: {
			number: 6,
			unit: 'day',
		},
		cost: "an ornate mirror worth at least 100 gp, naturally occurring round fruit the size and number of the target's eyes, and the same amount of flawless silver needles worth at least 1 gp each",
		secondaryCasters: {
			number: 3,
		},
		primaryCheck: {
			entry: '{@skill Occultism}',
			skills: ['Occultism'],
		},
		secondaryCheck: {
			entry: '{@skill Arcana}, {@skill Deception}, {@skill Stealth}',
			skills: ['Arcana', 'Deception', 'Stealth'],
		},
		range: {
			entry: 'planetary',
			distance: {
				type: 'planetary',
				amount: 1,
			},
		},
		targets: '1 living creature',
		duration: {
			number: 1,
			unit: 'week',
		},
		entries: [
			"At twilight for 5 days, you line the fruit in front of the mirror, chanting the name of the target, and envisioning its eyes in your mind. At exactly midnight on the last day, you drive the pins through the fruits, miming the action of methodically blinding the target to you and your companions. The target is immediately affected and can't visually detect any of the casters involved in the ritual\u2014provided that the ritual was successful, the target is unaware of the effects. Since the ritual affects the target's ability to see the casters, rather than make the casters {@condition invisible}, effects like true seeing are ineffective against concealment's curtain; instead, the target would need to remove the curse with effects like remove curse.",
			"To perform this ritual, you must have been within 5 feet of the target at least once, close enough to get a good look at its eyes. The target is temporarily immune to further castings of concealment's curtain for 1 year.",
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						"The target is unable to visually detect the casters for the duration, and the target's detection spells don't detect the targets.",
					Success:
						"The target is unable to visually detect the casters for the duration, but it's detection spells function normally.",
					Failure: 'The ritual has no effect.',
					'Critical Failure':
						'The ritual backfires and all casters participating in it are {@condition blinded} for the next 24 hours.',
				},
			},
		],
	},
	{
		name: 'Consecrate',
		source: 'CRB',
		page: 410,
		level: 2,
		traits: ['uncommon', 'consecration', 'evocation'],
		cast: {
			number: 3,
			unit: 'day',
		},
		cost: 'rare incense and offerings worth a total value of 20 gp × the spell level',
		secondaryCasters: {
			number: 2,
			note: 'must be worshippers of your religion',
		},
		primaryCheck: {
			entry: '{@skill Religion}',
			skills: ['Religion'],
		},
		secondaryCheck: {
			entry: '{@skill Crafting}, {@skill Performance}',
			skills: ['Crafting', 'Performance'],
		},
		range: {
			entry: '40 feet',
			distance: {
				type: 'feet',
				amount: 40,
			},
		},
		area: {
			types: ['Burst'],
			entry: '40-foot-radius burst around an immobile altar, shrine, or fixture of your deity',
		},
		duration: {
			number: 1,
			unit: 'year',
		},
		entries: [
			"You consecrate a site to your deity, chanting praises and creating a sacred space. While within the area, worshippers of your deity gain a +1 status bonus to attack rolls, skill checks, saving throws, and {@skill Perception} checks, and creatures anathema to your deity (such as undead for {@deity Pharasma} or {@deity Sarenrae}) take a \u20131 status penalty to those checks. Attacks made by worshippers of your deity within the area deal 1 damage of one of your deity's alignment types (your choice); if your deity is true neutral, you don't gain this benefit.",
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						"The consecration succeeds, and it either lasts for 10 years instead of 1 or covers an area with twice the radius. Occasionally, with your deity's favor, this might produce an even more amazing effect, such as a permanently consecrated area or the effect covering an entire cathedral.",
					Success: 'The consecration succeeds.',
					Failure: 'The consecration fails.',
					'Critical Failure':
						'The consecration fails spectacularly and angers your deity, who sends a sign of displeasure. For at least 1 year, further attempts to consecrate the site fail.',
				},
			},
		],
		heightened: {
			X: {
				'7': [
					"The consecrated area also gains the effects of the {@spell dimensional lock} spell, but the effect doesn't attempt to counteract teleportation by worshippers of your deity. The cost increases to 200 gp × the spell level.",
				],
			},
		},
	},
	{
		name: 'Control Weather',
		source: 'CRB',
		page: 411,
		level: 8,
		traits: ['uncommon', 'evocation'],
		cast: {
			number: 1,
			unit: 'day',
		},
		secondaryCasters: {
			number: 1,
		},
		primaryCheck: {
			entry: '{@skill Nature} (master)',
			skills: ['Nature'],
			prof: 'master',
		},
		secondaryCheck: {
			entry: '{@skill Survival}',
			skills: ['Survival'],
		},
		area: {
			types: ['Misc.'],
			entry: '2-mile-radius circle centered on you',
		},
		duration: {
			entry: '{@dice 4d12} hours',
			number: 12,
			unit: 'hour',
		},
		entries: [
			'You alter the weather, making it calm and normal for the season or choosing up to two effects based on the season:',
			{
				type: 'list',
				items: [
					'Spring drizzle, heat, hurricane, sleet, thunderstorm, tornado',
					'Summer drizzle, downpour, extreme heat, hail, heat',
					'Autumn cold weather, fog, mild heat, sleet',
					"Winter blizzard, mild cold, extreme cold, thaw You can't specifically control the manifestations, such as the exact path of a tornado or the targets of lightning strikes.",
				],
			},
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						'You change the weather as desired and can affect a larger area (up to a 5-mile-radius circle), or a longer duration (any number of additional d12 hours, up to {@dice 16d12}).',
					Success: 'You change the weather as desired.',
					Failure: 'You fail to change the weather as desired.',
					'Critical Failure':
						'The weather changes in an unanticipated way, determined by the GM but generally as contradictory to your true desires as possible (for instance, a terrible storm emerges when you would prefer good weather).',
				},
			},
		],
		heightened: {
			X: {
				'9': [
					"You can create unseasonable weather and contradictory weather effects, such as extreme cold and a hurricane. You can make the weather calm and normal weather for a different season or choose weather effects from any season's list.",
				],
			},
		},
	},
	{
		name: 'Create Demiplane',
		source: 'APG',
		page: 241,
		level: 8,
		traits: ['rare', 'conjuration', 'teleportation'],
		cast: {
			number: 9,
			unit: 'day',
		},
		cost: 'precious materials worth a total value of 800 gp',
		secondaryCasters: {
			number: 3,
		},
		primaryCheck: {
			entry: '{@skill Arcana}, {@skill Nature}, {@skill Occultism}, {@skill Religion} (legendary)',
			skills: ['Arcana', 'Occultism', 'Religion', 'Nature'],
			prof: 'legendary',
		},
		secondaryCheck: {
			entry: "{@skill Arcana}, {@skill Nature}, {@skill Occultism}, {@skill Religion} (whichever three aren't used for the primary check)",
			skills: ['Arcana', 'Occultism', 'Religion', 'Nature'],
		},
		targets: 'Up to seven willing creatures of 14th level or lower',
		entries: [
			'Few incantations are as renowned as the power to create worlds. To cast this ritual, you must be on the Astral Plane, the Ethereal Plane, or a plane that connects to one of the two.',
			'A demiplane created with this ritual exists on the Astral or Ethereal Plane. It can have the appearance of any mundane environment or structure, such as a glorious cathedral, a clearing in a forest, a comfortably furnished cavern, or anything else one can imagine. All demiplanes have finite, unbreachable boundaries, which might resemble stone, wood, or something more unnatural, such as a wall of mist or unceasing void.',
			"Demiplanes have environmental conditions as appropriate for the {@place Material Plane}, though the primary caster can dictate a general climate or light level, as well as whether the demiplane experiences seasons or a day-night cycle. The demiplane has no native plants or animals, but they can be introduced, and plants will grow in a demiplane's light.",
			'When you first cast {@i create demiplane}, the casters are teleported to the demiplane. The demiplane has no direct access to other worlds, so {@spell plane shift} or similar abilities are necessary to access it. As part of casting the ritual to create a new demiplane, you create a key to the demiplane which serves as a plane shift tuning fork for that demiplane. Most resemble ornate keys, but some take the forms of maps, compasses, or dowsing rods.',
			'If you have the original key to an existing demiplane and are on that demiplane, you can instead use this ritual to either expand the demiplane or add special traits or features described below.',
			{
				type: 'list',
				items: [
					'{@b Alignment} The demiplane gains one {@filter alignment|traits||categories=planar;alignment=sand} trait, such as {@trait lawful} or {@trait good}.',
					"{@b Bounteous} The demiplane has a functional ecosystem, with plants and animals appropriate to the environment. This ecosystem doesn't require any additional effort on your part to maintain.",
					'{@b Elemental} The demiplane gains the {@trait air}, {@trait earth}, {@trait fire}, or {@trait water} planar essence trait.',
					'{@b Gravity} The demiplane gains a {@filter gravity|traits||categories=planar;gravity=sand} trait of your choice.',
					'{@b Key} You create an additional key that can be used to access the demiplane with {@spell plane shift} and improve it with {@ritual create demiplane|apg}.',
					"{@b Portal} You create a permanent gateway between the demiplane and a single other location. You must spend the ritual's casting time constructing the gateway on the external side, which typically resembles an arch or doorway of some sort. The gate is always active, but it can be secured as you would any door.",
					'{@b Scope} The demiplane can be {@trait unbounded} instead of {@trait finite}, though still with the same size.',
				],
			},
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						"You create a new demiplane whose area consists of two contiguous squares, each 100 feet on a side. The ceiling is 20 feet high. If modifying an existing demiplane, you can instead either add this area to the demiplane's size or add two special traits or features.",
					Success:
						"As critical success, but the demiplane's area is a single square, 100 feet on a side and a ceiling 20 feet high. If modifying an existing demiplane, you can add one special trait or feature.",
					Failure: 'The ritual has no effect.',
					'Critical Failure':
						'Something goes horribly wrong, and all casters are teleported to an unknown but likely hostile plane.',
				},
			},
		],
		heightened: {
			X: {
				'10': [
					'The ritual creates a square area 1,000 feet on a side, with a ceiling 20 feet high (two contiguous areas of this size on a critical success). The cost of the ritual increases to 20,000 gp.',
				],
			},
		},
	},
	{
		name: 'Create Skinstitch',
		source: 'AoE2',
		page: 76,
		level: 6,
		traits: ['uncommon', 'transmutation'],
		cast: {
			number: 1,
			unit: 'day',
		},
		cost: 'rare oils worth 480 gp',
		secondaryCasters: {
			number: 1,
		},
		primaryCheck: {
			entry: '{@skill Religion} (expert)',
			skills: ['Religion'],
			prof: 'expert',
		},
		secondaryCheck: {
			entry: '{@skill Crafting}',
			skills: ['Crafting'],
		},
		range: {
			entry: 'touch',
		},
		targets: '1 frame covered in the skin of sentient humanoids',
		entries: [
			'You transform the target into a {@creature skinstitch|b3}, a hideous construct covered in the flesh of sentient humanoids.',
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						"The target becomes a {@creature skinstitch|b3}. If it's at least 4 levels lower than you, you can make it a minion which gives it the {@trait minion} trait. You can have a maximum of four minions under your control. If it doesn't become a minion, you can give it one simple command that it pursues single-mindedly. If you aren't a follower of {@deity Norgorber}, it ignores any of your subsequent commands. A follower of {@deity Norgorber} can give the skinstitch simple commands by presenting a holy symbol of the deity and commanding it with a single action that has the {@trait auditory} and {@trait concentrate} traits.",
					Success:
						"As critical success, except a {@creature skinstitch|b3} that doesn't become your minion stays in place and attacks anyone that attacks or tries to move it, rather than following your command.",
					Failure: 'You fail to create the {@creature skinstitch|b3}.',
					'Critical Failure':
						'You create the {@creature skinstitch|b3}, but it goes berserk and attempts to kill you, ignoring your commands even if you are a follower of {@deity Norgorber}.',
				},
			},
		],
	},
	{
		name: 'Create Undead',
		source: 'CRB',
		page: 411,
		level: 2,
		traits: ['uncommon', 'evil', 'necromancy'],
		cast: {
			number: 1,
			unit: 'day',
		},
		cost: 'black onyx, see {@table Creature Creation Rituals|CRB|Table 7\u20131}',
		secondaryCasters: {
			number: 1,
		},
		primaryCheck: {
			entry: '{@skill Arcana} (expert), {@skill Occultism} (expert), or {@skill Religion} (expert)',
			skills: ['Arcana', 'Occultism', 'Religion'],
			prof: 'expert',
		},
		secondaryCheck: {
			entry: '{@skill Religion}',
			skills: ['Religion'],
		},
		range: {
			entry: '10 feet',
			distance: {
				type: 'feet',
				amount: 10,
			},
		},
		targets: '1 dead creature',
		entries: [
			"You transform the target into an undead creature with a level up to that allowed in {@table Creature Creation Rituals|CRB|Table 7\u20131}. There are many versions of this ritual, each specific to a particular type of undead (one ritual for all zombies, one for skeletons, one for ghouls, and so on), and the rituals that create rare undead are also rare. Some forms of undead, such as liches, form using their own unique methods and can't be created with a version of create undead.",
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						"The target becomes an undead creature of the appropriate type. If it's at least 4 levels lower than you, you can make it a minion. This gives it the minion trait, meaning it can use 2 actions when you command it, and commanding it is a single action that has the {@trait auditory} and {@trait concentrate} traits. You can have a maximum of four minions under your control. If it's intelligent and doesn't become a minion, the undead is {@condition helpful} to you for awakening it, though it's still a horrid and evil creature. If it's unintelligent and doesn't become a minion, you can give it one simple command. It pursues that goal single-mindedly, ignoring any of your subsequent commands.",
					Success:
						"As critical success, except an intelligent undead that doesn't become your minion is only {@condition friendly} to you, and an unintelligent undead that doesn't become your minion leaves you alone unless you attack it. It marauds the local area rather than following your command.",
					Failure: 'You fail to create the undead.',
					'Critical Failure':
						'You create the undead, but its soul, tortured by your foul necromancy, is full of nothing but hatred for you. It attempts to destroy you.',
				},
			},
		],
	},
	{
		name: 'Daemonic Pact',
		source: 'B2',
		page: 311,
		level: 1,
		traits: ['uncommon', 'conjuration'],
		cast: {
			number: 1,
			unit: 'day',
		},
		primaryCheck: {
			skills: ['Religion'],
			mustBe: ['demon', 'urdefhan'],
			prof: 'expert',
		},
		entries: [
			"You call upon the powers of Abaddon to grant you the assistance of a daemon. You call upon a daemon whose level can be no more than double {@i daemonic pact's} spell level, two daemons whose levels are each at least 2 less than double the spell level, or three daemons whose levels are each at least 3 less than double the spell level.",
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						'You conjure the daemon or daemons, and they require nothing in return for their service.',
					Success:
						"You conjure the daemon or daemons, who serve you willingly, but require a sacrifice in the form of spilled blood (either another creature's or your own).",
					Failure: "You don't conjure any daemons.",
					'Critical Failure':
						"You don't conjure any daemons, and the self-sacrifice required to perform the ritual leaves you {@condition drained 1} (or {@condition drained 2} if the spell level is 5 or higher).",
				},
			},
		],
	},
	{
		name: 'Div Pact',
		source: 'B3',
		page: 311,
		level: 1,
		traits: ['uncommon', 'conjuration'],
		cast: {
			number: 1,
			unit: 'day',
		},
		primaryCheck: {
			skills: ['Religion'],
			mustBe: ['div'],
			prof: 'expert',
		},
		entries: [
			"You call upon the powers of Abaddon to grant you the assistance of a div. You call upon a div whose level can be no more than double {@i div pact's} spell level, two divs whose levels are each at least 2 less than double the spell level, or three divs whose levels are each at least 3 less than double the spell level.",
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						'You conjure the div or divs, and they require nothing in return for their service.',
					Success:
						'You conjure the div or divs. They are not eager to pursue the task, so they require a favor in return.',
					Failure: "You don't conjure any divs.",
					'Critical Failure':
						"You don't conjure any divs, and they send a spiritual backlash that denies your use of any of your innate divine spells for 24 hours. If you are under the effect of any of your innate divine spells, the durations end.",
				},
			},
		],
	},
	{
		name: 'Dread Ambience',
		source: 'SoM',
		page: 149,
		level: 5,
		traits: ['uncommon', 'consecration', 'emotion', 'enchantment', 'fear', 'mental'],
		cast: {
			number: 2,
			unit: 'day',
		},
		cost: 'candles, specialty salts, and rare herbs worth 80 gp total',
		secondaryCasters: {
			number: 1,
		},
		primaryCheck: {
			entry: '{@skill Arcana} or {@skill Occultism} (expert)',
			skills: ['Arcana', 'Occultism'],
			prof: 'expert',
		},
		secondaryCheck: {
			entry: '{@skill Deception}',
			skills: ['Deception'],
		},
		area: {
			types: ['Misc.'],
			entry: '1 square mile',
		},
		duration: {
			number: 1,
			unit: 'year',
		},
		entries: [
			"In some places, it always feels like something is observing you, as if the very land doesn't want you there. {@condition Hostile} creatures skitter about in the underbrush. Tendrils of mist try to lead you stray. Even the scent of the place is unwelcoming. Sometimes, this eerie atmosphere is a natural occurrence. Other times, it's the result of the dread ambience ritual.",
			'To create this unwelcoming, intimidating aura, you must prepare the area with salts and herbs, traveling the entire edge of the area throughout the casting.',
			'After you complete your ritual, anyone who enters the area receives a status penalty to saving throws against {@trait fear} effects within the dread ambience.',
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						'The sense of dread is particularly powerful. Every creature in an area takes a \u20132 status penalty to saving throws against {@trait fear} effects.',
					Success:
						'The dread ambience succeeds. Every creature in the area takes a \u20131 status penalty to saving throws against {@trait fear} effects.',
					Failure: 'The dread ambience fails.',
					'Critical Failure':
						'The dread ambience fails, and the casters take a \u20131 status penalty to all Will saves for the next week.',
				},
			},
		],
		heightened: {
			X: {
				'7': ['The dread ambience costs 750 gp and remains in place for 10 years.'],
				'9': [
					'The dread ambience costs 5,000 gp and remains in place for an unlimited duration.',
				],
			},
		},
	},
	{
		name: 'Elemental Sentinel',
		source: 'SoM',
		page: 150,
		level: 1,
		traits: ['uncommon', 'conjuration'],
		cast: {
			number: 1,
			unit: 'day',
		},
		cost: 'precious metals, rare incense, and herbs worth a total value of 15 gp per spell level',
		primaryCheck: {
			entry: '{@skill Arcana} (expert) or {@skill Occultism} (expert)',
			skills: ['Arcana', 'Occultism'],
			prof: 'expert',
		},
		targets: '1 object',
		duration: {
			unit: 'unlimited',
		},
		entries: [
			"You place a tiny elemental wisp within a single object, usually a mirror, statue, or other mundane-looking item, to serve as an alarm. Shattering or otherwise destroying the object frees the wisp and ends the ritual's effect even if the object is magically restored.",
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						"The elemental wisps inhabits the object and willingly serves you to the best of its ability. The wisp becomes aware of the target object's surroundings and can telepathically contact you with a range of 500 feet. It reports to you about intruders or other changes to the room in which it's located. You must tell the wisp what the criteria for the reports will be\u2014for instance, when anyone not openly wearing a certain symbol enters the room or when an item is removed. The wisp has a +5 {@skill Perception} modifier and observes the room using normal vision, normal hearing, and touch.",
					Success:
						"As critical success, but the range of the telepathy is 100 feet and the wisp's {@skill Perception} modifier is +3.",
					Failure: "You're unable to harness the spirit. The ritual fails.",
					'Critical Failure':
						"The elemental wisp is trapped in the object as with a success, but it refuses or is somehow unable to help you. The elemental might have extremely low Intelligence or simply be spiteful. Regardless, the object's reports are always misleading.",
				},
			},
		],
		heightened: {
			X: {
				'4': [
					'The range of the telepathic link increases, allowing the wisp to contact you anywhere on the same planet. Its {@skill Perception} modifier increases to +10, or +12 on a critical success.',
				],
				'6': [
					'As 4th level, except the wisp can see invisibility, and its {@skill Perception} modifier increases to +15, or +17 on a critical success.',
				],
			},
		},
	},
	{
		name: 'Empower Ley Line',
		source: 'SoM',
		page: 216,
		level: 7,
		traits: ['rare', 'evocation'],
		cast: {
			number: 1,
			unit: 'day',
		},
		cost: "magical foci worth a total value of 50 gp × the spell level × the target's level",
		secondaryCasters: {
			number: 6,
		},
		primaryCheck: {
			entry: "{@skill Arcana}, {@skill Nature}, {@skill Occultism}, or {@skill Religion}, matching the ley line's tradition (legendary)",
			skills: ['Arcana', 'Nature', 'Occultism', 'Religion'],
			prof: 'legendary',
		},
		secondaryCheck: {
			entry: '{@skill Lore||Ley Line Lore} or {@skill Occultism}',
			skills: ['Lore', 'Occultism'],
		},
		range: {
			entry: '10 feet',
			distance: {
				type: 'feet',
				amount: 10,
			},
		},
		targets: "1 ley line or ley line node up to double this ritual's level",
		entries: [
			'You draw upon surrounding magical energy to empower a ley line, enhancing both its {@trait positive} and {@trait negative} effects.',
			"The duration of an empowered ley line's benefits increases: when you successfully Tap a Ley Line that's empowered, you gain its benefits until the end of your next turn on a success (1 minute on a critical success)",
			"You take double the damage if you fail to Tap a Ley Line that's empowered and double the damage from the ley line's backlash effects (if any). If a backlash effect has a duration, that duration increases: a backlash effect that would ordinarily last until the end of your next turn now lasts for 1 minute, effects that last for 1 minute now last for 10 minutes, effects that last for 10 minutes now last for 1 hour, and effects that last for 1 hour now last for 1 day.",
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						'You empower the ley line until the next turning of the season.',
					Success: 'You empower the ley line for 1 week.',
					Failure: 'You fail to empower the ley line.',
					'Critical Failure':
						"All casters take damage and suffer the ley line's backlash as if they had critically failed to Tap the Ley Line. This damage and backlash is enhanced as if the ley line were successfully empowered, leading to increased damage and longer backlash effects.",
				},
			},
		],
	},
	{
		name: 'Establish Nexus',
		source: 'SoM',
		page: 217,
		level: 5,
		traits: ['rare', 'consecration', 'transmutation'],
		cast: {
			number: 1,
			unit: 'day',
		},
		cost: "magical foci worth 100 gp × the spell level × the node's level",
		secondaryCasters: {
			number: 2,
		},
		primaryCheck: {
			entry: '{@skill Arcana}, {@skill Nature}, {@skill Occultism}, or {@skill Religion} based on the ley line (master)',
			skills: ['Arcana', 'Nature', 'Occultism', 'Religion'],
			prof: 'master',
		},
		secondaryCheck: {
			entry: '{@skill Lore||Ley Line Lore} or {@skill Occultism}',
			skills: ['Lore', 'Occultism'],
		},
		range: {
			entry: '10 feet',
			distance: {
				type: 'feet',
				amount: 10,
			},
		},
		targets: "1 ley line node up to double establish nexus's level",
		entries: [
			"You focus the power of the node's intersecting ley lines into a powerful confluent point known as a ley line nexus.",
			'The ley line nexus grows out from the node in a 20-foot radius. The ley line nexus is more open and available for access to creatures you designate. When Tapping the Ley Lines, these creatures get a degree of success one better than they rolled.',
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						'The ley line nexus is established. The nexus is particularly powerful, allowing it to continually refresh its magical energy; thus, the nexus lasts for up to 100 years, unless the ley lines shift.',
					Success:
						'The ley line nexus is established and lasts for a year and one day, unless the ley lines shift.',
					Failure: 'You fail to establish the ley line nexus.',
					'Critical Failure':
						"All casters take damage and suffer backlash effects as if they had critically failed to Tap every Ley Line in the node simultaneously, and they can't attempt to Tap those Ley Lines for a year and one day.",
				},
			},
		],
	},
	{
		name: 'Fantastic Façade',
		source: 'APG',
		page: 240,
		level: 9,
		traits: ['rare', 'illusion'],
		cast: {
			number: 1,
			unit: 'week',
		},
		cost: 'mystical paint, elaborate veils, and powdered minerals worth 20,000 gp total',
		secondaryCasters: {
			number: 3,
		},
		primaryCheck: {
			entry: '{@skill Arcana} or {@skill Occultism} (legendary)',
			skills: ['Arcana', 'Occultism'],
			prof: 'legendary',
		},
		secondaryCheck: {
			entry: '{@skill Society} or {@skill Survival}, {@skill Deception}, {@skill Stealth}',
			skills: ['Society', 'Survival', 'Deception', 'Stealth'],
		},
		area: {
			entry: 'circle centered on you up to 1 mile in radius',
			types: ['Circle'],
		},
		targets: '1 settlement and its residents',
		duration: {
			entry: 'Unlimited',
		},
		entries: [
			"You draw a permanent series of complex illusions over the target settlement, choosing the look, sound, feel, and smell of the structures, terrain, and creatures within at the time the ritual is cast. You can alter the appearance of existing structures and creatures, and you can add illusory structures or creatures. For example, you could cause everything and everyone in the target area to appear green, create an illusory forest with a thick canopy that obscures the settlement from outside view, or make empty ruins seem inhabited and pristine. When you create the facade, you determine which illusory elements remain static (limited to basic natural movement, such as flags blowing in the breeze) and which follow a basic program (for example, a daily parade in the town square, complete with marching band). You're unable to alter the programs after you create the facade.",
			'You can disguise creatures as you please, with the same effects as a 3rd-level {@spell illusory disguise}. If a creature affected by the facade leaves the area, any illusions affecting it fade after 1 day. You decide when casting the ritual whether newcomers are disguised by the illusions, and whether the disguise appears immediately or after a set period, up to 1 week.',
			"A creature that interacts with the target settlement in a way that would suggest or reveal the illusory nature of the facade, such as by trying to paint a building affected by the facade or climbing an illusory structure, can attempt to {@quickref disbelieve the illusion|CRB|2|disbelieving illusions|0}. The illusions created by the spell are harmless, so an illusory river of lava wouldn't cause damage, nor could thorns on an illusory rose bush prick someone.",
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						'You create the facade as described, and you can alter the programs within your facade by spending 1 day to reprogram them.',
					Success: 'You create the facade as described.',
					Failure: 'Your illusions fail and the ritual has no effect.',
					'Critical Failure':
						'Your ritual produces unexpected and uncontrolled illusions different from what you had planned, such as unexpected and slowly shifting colors across the buildings, unpleasant smells, and creatures appearing as skeletons. These effects fade after 1 month.',
				},
			},
		],
		heightened: {
			X: {
				'10': ['The cost increases to 100,000 gp and the radius can be up to 5 miles.'],
			},
		},
	},
	{
		name: 'Fey Abeyance',
		source: 'SoT1',
		page: 23,
		level: 1,
		traits: ['rare', 'abjuration'],
		cast: {
			number: 1,
			unit: 'hour',
		},
		cost: 'rare oils, cold iron bells worth at least 5 gp',
		secondaryCasters: {
			number: 1,
		},
		primaryCheck: {
			entry: '{@skill Nature} (trained)',
			skills: ['Nature'],
			prof: 'trained',
		},
		secondaryCheck: {
			entry: '{@skill Crafting}, {@skill Intimidation}, {@skill Occultism}, {@skill Performance}',
			skills: ['Crafting', 'Intimidation', 'Occultism', 'Performance'],
		},
		area: {
			entry: 'An enclosed area up to 60 feet × 60 feet, up to 20 feet high',
			types: ['Misc.'],
		},
		duration: {
			number: 1,
			unit: 'week',
		},
		entries: [
			'You ward an area with cold iron bells, protecting it from the influence of the first world. Fey creatures feel uncomfortable within the area and all physical attacks against them are considered cold iron for the purposes of their Weaknesses and Resistances. Furthermore, you set up bells within 3 squares within the area (usually at entrances). When a fey creature begins its turn in a square containing bells, it takes mental damage equal to its Weakness to cold iron, if any. This damage is {@trait nonlethal}.',
			{
				type: 'successDegree',
				entries: {
					'Critical Success': 'You may designate up to 6 squares to contain bells.',
					Success: 'The ritual succeeds.',
					Failure: 'The ritual has no effect.',
					'Critical Failure':
						"The ritual has no effect and attracts the attention of a troublesome fey creature. At the GM's discretion, it might be {@condition hostile} or merely mischievous.",
				},
			},
		],
	},
	{
		name: 'Freedom',
		source: 'CRB',
		page: 411,
		level: 8,
		traits: ['uncommon', 'abjuration'],
		cast: {
			number: 1,
			unit: 'day',
		},
		cost: "valuable oils and objects associated with the target worth a total value of 100 gp × the spell level × the target's level",
		secondaryCasters: {
			number: 2,
		},
		primaryCheck: {
			entry: '{@skill Arcana} (legendary) or {@skill Occultism} (legendary)',
			skills: ['Arcana', 'Occultism'],
			prof: 'legendary',
		},
		secondaryCheck: {
			entry: '{@skill Society}',
			skills: ['Society'],
		},
		range: {
			entry: 'see text',
			distance: {
				type: 'unknown',
				amount: 1,
			},
		},
		targets: '1 creature',
		entries: [
			"You perform a ritual to free a creature imprisoned, {@condition petrified}, or otherwise put into stasis by any {@trait magical} effects from all such effects, even effects like imprisonment that don't have a duration, as long as freedom's spell level is equal to or higher than the effect's spell level. To perform the ritual, you must be within 10 feet of the target, or within 10 feet of the place where the target was imprisoned (in the case of effects that trap the creature in an unreachable prison, like the oubliette form of imprisonment). You must know the name of the creature and details of its background; if the creature is not a close associate, a failure or critical failure on a secondary {@skill Society} check reduces even a critical success on the primary check to a failure.",
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						'You free the target from all {@trait magical} effects imprisoning it, petrifying it, or putting it into stasis. It gains a +1 status bonus to saving throws to resist those same {@trait magical} effects for 1 week.',
					Success:
						'You free the target from all {@trait magical} effects imprisoning it, petrifying it, or putting it into stasis.',
					Failure: 'You fail to free the target.',
					'Critical Failure':
						'The {@trait magical} effects imprisoning the target, petrifying the target, or putting it into stasis affect you and all secondary casters.',
				},
			},
		],
	},
	{
		name: 'Garden Of Death',
		source: 'SoM',
		page: 150,
		level: 4,
		traits: ['uncommon', 'consecration', 'necromancy', 'plant', 'poison'],
		cast: {
			number: 1,
			unit: 'day',
		},
		cost: 'water infused with a dozen deadly toxins worth a total of 50 gp',
		secondaryCasters: {
			number: 2,
		},
		primaryCheck: {
			entry: '{@skill Nature} (expert)',
			skills: ['Nature'],
			prof: 'expert',
		},
		secondaryCheck: {
			entry: '{@skill Crafting}, {@skill Medicine}',
			skills: ['Crafting', 'Medicine'],
		},
		area: {
			entry: '40-foot-radius burst',
			types: ['Burst'],
		},
		duration: {
			number: 1,
			unit: 'year',
		},
		entries: [
			'Typically associated with the less friendly fey or druids, this ritual calls all the poisonous, toxic, and venomous plants and animals of an area to congregate in a certain place, creating a beautiful but extravagantly deadly garden.',
			"You and the secondary casters sprinkle the ground of the garden with water infused with various poisons and a few drops of your blood. Within the bounds of the ritual, the ecosystem attracts every possible poisonous plant or animal native to the environment, with nonpoisonous plants or animals growing only if there's no toxic counterpart. This deadly ecosystem flourishes, if at all possible (plants still need light and water, for instance), for a year and gradually disperses after this period. If this ritual is successfully cast on the grounds of an existing garden of death, it resets the duration and expands the garden's radius by 20 feet instead.",
			"The maximum level of plants or animals called by the ritual is equal to its spell level, and the called plants and animals can use the ritual's spell DC instead of their own poison DC, whichever is higher. The garden's residents don't willingly use their poison on you or the secondary casters, but you don't otherwise control or command them.",
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						'A poisonous garden forms, and you and the secondary casters gain a +2 circumstance bonus to {@skill Nature} or {@skill Crafting} checks to deal with the plants or animals, such as feeding them or harvesting poison from them.',
					Success:
						'As critical success, but without the circumstance bonus when interacting with the garden.',
					Failure: 'The ritual has no effect.',
					'Critical Failure':
						'You and the secondary casters are each bitten by the most poisonous creature found naturally in the environment.',
				},
			},
		],
	},
	{
		name: 'Geas',
		source: 'CRB',
		page: 412,
		level: 3,
		traits: ['uncommon', 'curse', 'enchantment', 'mental'],
		cast: {
			number: 1,
			unit: 'day',
		},
		secondaryCasters: {
			number: 1,
		},
		primaryCheck: {
			entry: '{@skill Arcana} (expert), {@skill Occultism} (expert), or {@skill Religion} (expert)',
			skills: ['Arcana', 'Occultism', 'Religion'],
			prof: 'expert',
		},
		secondaryCheck: {
			entry: '{@skill Society} or {@skill Lore||Legal Lore}',
		},
		range: {
			distance: {
				amount: 10,
				type: 'feet',
			},
			entry: '10 feet',
		},
		targets: "1 creature of a level no greater than double the geas ritual's level",
		duration: {
			entry: 'see text',
			unit: 'special',
		},
		entries: [
			"You enforce a magic rule on a willing target, forcing it to either perform or refrain from carrying out a certain act. A geas to perform an act is usually conditional, such as, \"Always offer hospitality to strangers seeking a place to stay.\" An unconditional geas to perform a certain act doesn't require the target to perform that act exclusively, though it must prioritize the task above all leisurely pursuits. The most common geas to refrain from carrying out an act is a specification to avoid violating a contract. In those cases, the secondary caster usually takes charge of making sure the wording of the contract is attuned correctly with the ritual's magic. Because the target is willing, geas can have a duration that lasts for as long as the target agrees to. If the target is unable to fulfill the geas, it becomes {@condition sickened 1}, and the {@condition sickened} condition increases by 1 for each consecutive day it is prevented from following the geas, to a maximum of {@condition sickened 4}. The {@condition sickened} condition ends immediately when it follows the geas again; it can't remove the {@condition sickened} condition in any other way. Only powerful magic such as a {@spell wish} spell can remove the effects of geas from a willing target.",
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						"The geas succeeds, and the target receives a +1 status bonus to skill checks that directly uphold the geas (at the GM's discretion).",
					Success: 'The geas succeeds.',
					Failure: 'The geas fails.',
					'Critical Failure':
						'The geas fails, and you are instead affected by the geas you were attempting to place on the target. You are considered an unwilling target, so the geas can be counteracted with a {@spell remove curse} spell.',
				},
			},
		],
		heightened: {
			X: {
				'5': [
					'You can use geas on an unwilling creature; it can attempt a Will save to negate the effect. If the target fails this Will save, the geas lasts up to 1 week. A {@spell remove curse} spell can counteract a geas on an unwilling creature, in addition to powerful magic such as a {@spell wish} spell. A clever unwilling creature can subvert the geas by contriving situations that prevent it from complying, but in that case it becomes {@condition sickened} (as described above).',
				],
				'7': [
					'As 5th level, but the geas lasts for up to 1 year on an unwilling creature.',
				],
				'9': [
					'As 5th level, but the geas lasts for a duration you choose (even unlimited) on an unwilling creature.',
				],
			},
		},
	},
	{
		name: "Guardian's Aegis",
		source: 'SoM',
		page: 150,
		level: 3,
		traits: ['uncommon', 'abjuration', 'divination'],
		cast: {
			number: 1,
			unit: 'day',
		},
		cost: "rare oils worth 10 gp × the primary caster's level",
		secondaryCasters: {
			number: 1,
		},
		primaryCheck: {
			entry: '{@skill Occultism} or {@skill Religion}',
			skills: ['Occultism', 'Religion'],
			prof: '',
		},
		secondaryCheck: {
			entry: '{@skill Athletics}, {@skill Diplomacy}, or {@skill Society}',
			skills: ['Athletics', 'Diplomacy', 'Society'],
		},
		duration: {
			number: 1,
			unit: 'week',
		},
		entries: [
			"The guardian's aegis is a ritual used across numerous cultures to bind a chosen guardian and ward together so that they can complete a quest of great import. When the ritual is completed, designate one of the casters as the guardian, while the other is the ward. As long as you're on the same plane of existence, both of you are always aware of each other's relative directions and state of being, including any conditions the other is affected by. As long as you're within 30 feet of each other, whenever the ward takes damage, the damage is reduced by the amount equal to half the guardian's level, and the guardian loses an equal number of Hit Points; the target still takes additional effects like poison even if guardian's aegis reduces the damage to 0.",
			{
				type: 'successDegree',
				entries: {
					'Critical Success': 'The ritual is successful, and the duration is 1 month.',
					Success: 'The ritual is successful.',
					Failure: 'The ritual has no effect.',
					'Critical Failure':
						'The ritual backfires. You and the secondary caster become magically isolated from each other for 1 week, unable to provide each other any beneficial effect.',
				},
			},
		],
	},
	{
		name: 'Heartbond',
		source: 'APG',
		page: 311,
		level: 2,
		traits: ['uncommon', 'abjuration'],
		cast: {
			number: 1,
			unit: 'hour',
		},
		cost: 'fine wine and a set of matching rings or other tokens worth 40 gp total',
		secondaryCasters: {
			number: 2,
		},
		primaryCheck: {
			entry: '{@skill Nature} or {@skill Religion} (expert)',
			skills: ['Arcana', 'Religion'],
			prof: 'expert',
		},
		secondaryCheck: {
			entry: '{@skill Diplomacy}, {@skill Society}',
			skills: ['Diplomacy', 'Society'],
		},
		range: {
			entry: '20 feet',
			distance: {
				type: 'feet',
				amount: 20,
			},
		},
		entries: [
			'You create a magical bond between two willing creatures, who are secondary casters of the ritual and must share genuine affection for one another. As part of the ritual, both members of the bond receive a ring, amulet, or similar token to symbolize their shared connection. They lose the effects of the ritual when not wearing the token, and the bond is broken if either token is destroyed.',
			'Creatures benefiting from a successful heartbond ritual can later participate in a heightened version of the ritual without requiring new checks by spending the required time and paying the difference of the two costs. A creature can be under the effects of multiple heartbond rituals at once.',
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						"Once per day, each bonded creature can use a 2-action activity, which has the {@trait concentrate} trait, to learn the present state of the other bonded creature. The creature knows the other creature's direction and distance and any conditions affecting them. Both of the participants can cast {@spell message} as a divine innate spell at will, but can only target the other participant.",
					Success:
						"As a critical success, except the bonded creatures can't cast {@spell message} as a divine innate spell.",
					Failure: 'The ritual has no effect.',
					'Critical Failure':
						'Magical backlash creates discordant energy among the participants. For 1 week, each ritual participant is {@condition clumsy 2} and {@condition stupefied 2} whenever they are within 30 feet of another ritual participant.',
				},
			},
		],
		heightened: {
			X: {
				'6': [
					'Increase the cost to a total value of 600 gp. On a success, secondary casters in the ritual permanently gain the effects of a 6th-level {@spell telepathy} spell, but only with each other.',
				],
			},
		},
	},
	{
		name: "Heroes' Feast",
		source: 'APG',
		page: 242,
		level: 5,
		traits: ['uncommon', 'conjuration'],
		cast: {
			number: 4,
			unit: 'hour',
		},
		cost: '25 gp',
		secondaryCasters: {
			number: 1,
		},
		primaryCheck: {
			entry: '{@skill Nature}, {@skill Religion}, or {@skill Occultism} (expert)',
			skills: ['Nature', 'Religion', 'Occultism'],
			prof: 'expert',
		},
		secondaryCheck: {
			entry: '{@skill Diplomacy} or {@skill Society}',
			skills: ['Diplomacy', 'Society'],
		},
		range: {
			entry: '40 feet',
			distance: {
				amount: 40,
				type: 'feet',
			},
		},
		entries: [
			"You conjure otherworldly beings to serve you and your companions a feast with restorative properties. These mysterious beings may be fey, divine, or other supernatural servitors, as appropriate for the primary check. After the first hour of the ritual, these servants appear and serve a massive feast, complete with an exquisite table and up to 10 place settings. The bounteous spread consists of all manner of dishes, including the guests' childhood comfort foods, modern delicacies, and preferred drinks. The summoned servants spend the next 3 hours waiting on you and the other guests, fetching additional food, pouring drinks, and so forth. During this time, you and the other guests must strive to be as polite and gracious as possible to avoid offending your mysterious hosts. At the feast's end, the ritual is completed and you and the secondary caster attempt your checks as normal. If the feast is interrupted at any point, the servants immediately vanish with their provisions and the ritual is disrupted.",
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						'The feast is nourishing and revitalizing. The magical food casts {@spell neutralize poison}, {@spell remove disease}, and {@spell remove fear} on each guest for each relevant affliction, using your modifier for the primary skill check as the counteract modifier. Each guest also recovers 100 Hit Points and gains 20 temporary Hit Points for the next 12 hours. Guests also gain a +2 status bonus to saves against {@trait disease}, {@trait fear}, and {@trait poison} effects for the next 12 hours.',
					Success:
						"As critical success, except guests recover only 50 Hit Points, gain only 10 temporary Hit Points, and don't gain the status bonus to saves.",
					Failure:
						'You and the other guests taste ash in your mouths and realize that the feast contained nothing of sustenance.',
					'Critical Failure':
						"The otherworldly servants were offended by your behavior or the hubris you demonstrated in summoning them and poisoned the feast. You and your guests become {@condition sickened 4} and can't reduce the condition for 12 hours.",
				},
			},
		],
	},
	{
		name: 'Ideal Mimicry',
		source: 'SoM',
		page: 151,
		level: 6,
		traits: ['uncommon', 'enchantment', 'mental'],
		cast: {
			number: 6,
			unit: 'day',
		},
		cost: "crafting materials worth at least 50 gp × the target's level; a lock of hair from the target, nail clippings from the target, or a vial of blood from the target",
		secondaryCasters: {
			number: 1,
		},
		primaryCheck: {
			entry: '{@skill Occultism} (expert)',
			skills: ['Occultism'],
			prof: 'expert',
		},
		secondaryCheck: {
			entry: '{@skill Crafting}',
			skills: ['Crafting'],
		},
		range: {
			entry: 'see text',
			type: 'unknown',
		},
		targets: '1 sentient living creature',
		duration: {
			entry: "until used 10 times or until the target's body parts are removed from the doll",
		},
		entries: [
			'You craft a doll with care and quiet meditation on the target, inserting the fingernails into the body, tying the lock of hair around the neck of the doll, or emptying the vial of blood into the stuffing and allowing it to be absorbed. You then stuff the doll and form it to mimic the shape of the target, creating clothing and accessories for the doll that are similar to commonly worn items. You must have been within 5 feet of the target at least once and gotten a good look at them to perform this ritual. You can cast the ritual and create the doll at any range from the target.',
			"Once the doll is complete, you can {@action Interact} with the doll violently once per round to cause pain to the target as long as they're within 200 feet. This pain manifests as mental damage inflicted on the target, and it depends on how many of the three body part components (hair, nails, or blood) you included in the creation of the doll. After the first time you manipulate the doll, you can continue to do so until either the target moves beyond 200 feet or until you {@action Interact} with the doll to cause pain 10 times, whichever comes first. After either of those conditions is met, the doll falls apart into stuffing and dust.",
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						'The doll becomes connected to the target. Each {@action Interact} action causes {@damage 3d6} mental damage to the target for each of the three body part components (maximum {@dice 9d6} for all three components). The connection is more powerful than normal, increasing the number of times you can {@action Interact} to cause pain from 10 to 20.',
					Success:
						'As critical success, except you can only {@action Interact} the normal 10 times.',
					Failure: 'The doll is just an ordinary doll.',
					'Critical Failure':
						'Any {@action Interact} actions you take to cause pain to target instead cause {@dice 9d6} damage to the casters. The target is alerted to the attempt nonetheless, through a feeling of the connection being subverted.',
				},
			},
		],
		heightened: {
			plusX: {
				'2': [
					'Increase the damage to the target by {@dice 1d6} per body part component, and the damage to the casters on a critical failure by {@dice 3d6}.',
				],
			},
		},
	},
	{
		name: 'Imprisonment',
		source: 'CRB',
		page: 412,
		level: 8,
		traits: ['uncommon', 'evocation'],
		cast: {
			number: 1,
			unit: 'day',
		},
		cost: "reagents to construct the magical prison worth a total value of 800 gp × the target's level",
		secondaryCasters: {
			number: 6,
		},
		primaryCheck: {
			entry: '{@skill Arcana} (legendary) or {@skill Occultism} (legendary)',
			skills: ['Arcana', 'Occultism'],
			prof: 'legendary',
		},
		secondaryCheck: {
			entry: '{@skill Crafting}, {@skill Society}',
			skills: ['Crafting', 'Society'],
		},
		range: {
			entry: '10 feet',
			distance: {
				type: 'feet',
				amount: 10,
			},
		},
		targets: '1 creature of up to 16th level',
		entries: [
			"You perform a ritual to imprison a creature in one of several forms. While some versions of this ritual offer all of the forms, others include only a single form or only a few of them. Whichever form you use, the effect can't be counteracted, though it can be ended by freedom. Some forms of imprisonment can be ended by other means. Because the ritual requires the target to remain within 10 feet at all times, it typically requires you to subdue the target first.",
			{
				type: 'list',
				items: [
					"{@bold Chains} You bind the creature with chains, rendering it unable to use any actions other than to speak. Other creatures that attempt to approach, harm the chains, or free the trapped creature in any way must succeed at a Will save or be unable to do so forever. The chains have Hardness equal to 5 × the imprisonment ritual's spell level, and double that many Hit Points. Destroying the chains frees the target.",
					"{@bold Prison} You render the creature completely unable to leave a particular confined area or structure of your choice, such as a jail cell or sealed cave. The magic also prevents the creature from damaging its prison, either directly or indirectly, to break free. If the creature's prison is entirely destroyed by some external force, the creature is freed, though for some larger or natural prisons, this might be unfeasible.",
					"{@bold Slumber} (sleep effect) You put the creature into an eternal sleep. It ceases aging and doesn't require food or drink. A single sincere physical display of affection from a creature who genuinely loves the target\u2014whether romantically, filially, or otherwise\u2014frees it from the slumber. This form of imprisonment is also enchantment magic.",
					"{@bold Temporal Stasis} You send the creature into a state of suspended animation outside the flow of time. The creature doesn't grow older and can't be affected by any effect from within the normal timestream. While casting this ritual, you can optionally name any amount of time for the stasis; after this duration elapses, the stasis ends. Unlike other forms of imprisonment, temporal stasis can be counteracted by a {@spell dispel magic} or {@spell haste} spell. This form of imprisonment is also transmutation magic.",
					"{@bold Object} (9th level or higher) You either shrink the creature to an inch in height or transform it into an insubstantial form whose body trails away into wisps below its head. Either way, you trap it inside a gem, jar, bottle, lamp, or similar container. The creature ceases aging and doesn't require food or drink. The creature is still aware of its surroundings and can move within the container and speak, but it can't use any other actions. Destroying the container kills the target rather than freeing it. This form of imprisonment is also transmutation magic.",
					"{@bold Oubliette} (10th level only) You entomb the target in a state of suspended animation deep beneath the surface of the ground and out of tune with reality so that it can't be reached by any means. You also prevent divinations from revealing the location where the imprisonment occurred. Powerful magic such as wish can reveal the location of the imprisonment, but even such magic can't free the target from the oubliette; only a 10th-level freedom ritual can do so.",
				],
			},
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						'You imprison the target. You can either use a form of imprisonment that usually requires 1 additional spell level, or give any creatures trying to use a freedom ritual to rescue the target a \u20132 circumstance penalty to checks associated with that ritual.',
					Success: 'You imprison the target.',
					Failure: 'You fail to imprison the target.',
					'Critical Failure':
						'You imprison yourself and the secondary casters in the same way you intended to imprison the target.',
				},
			},
		],
		heightened: {
			X: {
				'9': [
					'You can use the object form of imprisonment in addition to the other options, and you can target a creature of up to 18th level. The base cost increases to 2,000 gp.',
				],
				'10': [
					'You can use the object and oubliette forms of imprisonment in addition to the other options, and you can target a creature of up to 20th level. The base cost increases to 6,000 gp.',
				],
			},
		},
	},
	{
		name: 'Infernal Pact',
		source: 'B1',
		page: 348,
		level: 1,
		traits: ['uncommon', 'conjuration'],
		cast: {
			number: 1,
			unit: 'day',
		},
		primaryCheck: {
			mustBe: ['devil'],
			skills: ['Religion'],
			prof: 'expert',
		},
		entries: [
			"You make an appeal to a powerful devil, asking it to bind some of its subordinates to your service. If you succeed, the devil sends you its choice of one devil whose level is no more than double {@i infernal pact's} level, two devils whose levels are each at least 2 less than double the spell level, or three devils whose levels are each at least 3 less than double the spell level.",
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						'The devils are sent to you and serve you for {@dice 1d4} weeks.',
					Success: 'The devils are sent to you and serve you for {@dice 1d4} days.',
					Failure: 'Your request is denied.',
					'Critical Failure':
						'Not only is your request denied, but the powerful devil sends word of its displeasure to your master.',
				},
			},
		],
	},
	{
		name: 'Inveigle',
		source: 'CRB',
		page: 413,
		level: 2,
		traits: ['uncommon', 'enchantment', 'mental'],
		cast: {
			number: 1,
			unit: 'day',
		},
		cost: "rare oils worth a total value of 10 gp × the target's level",
		primaryCheck: {
			entry: '{@skill Arcana} (expert), {@skill Occultism} (expert), or {@skill Religion} (expert)',
			skills: ['Arcana', 'Occultism', 'Religion'],
			prof: 'expert',
		},
		range: {
			entry: '10 feet',
			distance: {
				type: 'feet',
				amount: 10,
			},
		},
		targets: "1 creature of a level no greater than double the inveigle ritual's level",
		duration: {
			entry: '1 year or until dismissed',
			number: 1,
			unit: 'year',
		},
		entries: [
			"You win over the target's mind, causing it to see you as a close and trusted friend and look upon your every suggestion as reasonable. The target is {@condition helpful} toward you, so it will go out of its way to help you. As with any other {@condition helpful} creature, there are limits to what you can ask of it. If you ever ask the target to do something completely against its nature or needlessly harmful to the target or its interests, not only does it refuse, but it also can attempt a Will save to end the effect early. Because of the casting time and range, it's generally difficult to cast this ritual unless the target is willing (perhaps convinced the ritual will have some other effect) or {@condition restrained}.",
			'If the creature is unwilling to accept the ritual, it can attempt a Will save to negate the effect.',
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						'The ritual succeeds and the target takes a \u20134 status penalty to Will saves to end the effect.',
					Success: 'The ritual succeeds.',
					Failure: 'The ritual fails.',
					'Critical Failure':
						'The ritual fails and the target instead hates you, becoming {@condition hostile} to you for the duration.',
				},
			},
		],
		heightened: {
			X: {
				'6': [
					"You can use inveigle on a creature up to 1 mile away throughout the casting, as long as you have a lock of hair, a drop of blood, or some other piece of the creature's body, which you mix into the oils used in the cost. The base cost increases to 100 gp. The duration is shorter than normal, based on how large a piece of the creature's body you use. Blood, hair, scales, and the like cause the ritual to last 1 week, while a hand or other substantial body part causes the ritual to last 1 month.",
				],
			},
		},
	},
	{
		name: 'Legend Lore',
		source: 'CRB',
		page: 413,
		level: 7,
		traits: ['uncommon', 'divination'],
		cast: {
			number: 1,
			unit: 'day',
		},
		cost: 'rare incense worth a total value of 300 gp',
		secondaryCasters: {
			number: 2,
		},
		primaryCheck: {
			entry: '{@skill Occultism} (master)',
			skills: ['Occultism'],
			prof: 'master',
		},
		secondaryCheck: {
			entry: '{@skill Performance}, {@skill Society}',
			skills: ['Performance', 'Society'],
		},
		entries: [
			'You attempt to learn useful legends about a particular subject, which must be an important person, place, or thing.',
			'If the subject is present, increase the degree of success of your primary skill check by one step. If you have only vague information about the subject before attempting the ritual, decrease the degree of success of your primary skill check by one step. These modifiers cancel each other out if you have a subject present with little to no baseline information.',
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						'You recite legends, tales, and lore about the subject over the course of an hour after the ritual ends. The information is mostly coherent, emphasizing more accurate or useful legends over those exaggerated over time.',
					Success:
						'You recite mysterious legends, tales, and lore about the subject over the course of an hour after the ritual ends. These provide useful information for further inquiry but are generally incomplete or enigmatic. As is the nature of legends, you are likely to learn multiple contradictory versions.',
					Failure: 'You fail to learn any useful legends.',
					'Critical Failure':
						"Your mind becomes lost in the past. You can't sense or respond to anything in the present for 1 week except to perform necessities like breathing and sleeping. When you return, however, you can retrain one of your skills into a {@skill Lore} based on the knowledge of the past you were uncontrollably viewing, as if you had spent 1 week retraining.",
				},
			},
		],
	},
	{
		name: 'Mind Swap',
		source: 'SoM',
		page: 151,
		level: 5,
		traits: ['rare', 'mental', 'necromancy', 'possession'],
		cast: {
			number: 1,
			unit: 'day',
		},
		cost: 'a pair of jeweled mirrors worth a total value of 50 gp × the level of the highest-level target',
		secondaryCasters: {
			number: 1,
		},
		primaryCheck: {
			entry: '{@skill Occultism} (expert)',
			skills: ['Occultism'],
			prof: 'expert',
		},
		secondaryCheck: {
			entry: '{@skill Medicine} or {@skill Occultism}',
			skills: ['Medicine', 'Occultism'],
		},
		range: {
			distance: {
				amount: 10,
				type: 'feet',
			},
			entry: '10 feet',
		},
		targets: '2 creatures of the same ancestry, of up to twice the level of mind swap',
		duration: {
			number: 1,
			unit: 'week',
		},
		entries: [
			"This ritual allows two subjects to exchange minds, fully inhabiting one another's bodies. The two targets can be chosen from you, the secondary caster, or unrelated third parties present throughout the ritual. Normally, both targets must be of the same ancestry for the minds to be fully compatible, but at the GM's discretion, for a much higher cost, the targets can be from different ancestries; this requires much more adjudication of ancestry feats and abilities. When both targets are of the same ancestry, muscle memory and the influence of their soul allow them to carry over all their mechanical abilities into each new body, except they use the other body's heritage (and lineage, if any). The GM might rule that similar physiological changes can't be overridden with a mind swap.",
			'If a body dies, the mind and spirit controlling it dies instantly. When the spell ends, the minds and souls snap back to their original bodies. At this time, if the original body is dead, the mind and soul attempting to return to that body die as well.',
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						"Each target's mind and spirit possess the other's body and can control it normally. The mind swap is unusually smooth, and the targets gain a +4 circumstance bonus to {@skill Deception} checks to {@action Impersonate} each other.",
					Success:
						"Each target's mind and spirit possess the other's body and can control it normally.",
					Failure: 'The ritual has no effect.',
					'Critical Failure':
						"The ritual is scrambled, sending a welter of {@condition confused} memories into the target's minds. You and the secondary casters are {@condition stupefied 2} for the next week.",
				},
			},
		],
		heightened: {
			X: {
				'9': [
					'You can cast the ritual without a duration, leaving no magic to counteract. The effects are reversible only by another mind swap ritual or powerful magic like wish. This increases the cost of the ritual to 10,000 gp and is an evil act unless both targets are willing.',
				],
			},
		},
	},
	{
		name: 'Mystic Carriage',
		source: 'SoM',
		page: 152,
		level: 3,
		traits: ['uncommon', 'conjuration'],
		cast: {
			number: 1,
			unit: 'hour',
		},
		cost: 'toy carriage, horse statues, rare incense, and feathers worth 50 gp',
		secondaryCasters: {
			number: 1,
		},
		primaryCheck: {
			entry: '{@skill Arcana} (Expert) or {@skill Occultism} (Expert)',
			skills: ['Arcana', 'Occultism'],
		},
		secondaryCheck: {
			entry: '{@skill Crafting} or {@skill Lore||Driving Lore}',
			skills: ['Crafting', 'Lore'],
		},
		duration: {
			entry: '1 week or until the named destination is reached, whichever comes first',
			unit: 'special',
		},
		entries: [
			'This ritual allows you and the other casters to conjure a magical carriage that transports you to a destination of your choice. To summon the mystic carriage, you must be within 250 miles of your destination and spend 1 hour burning incense and feathers while chanting the name of the location you wish the carriage to take you to. When it arrives, the carriage is a Large vehicle that can fit 4 Medium or smaller passengers, as well as 100 Bulk. It has a Speed of 60 feet, AC of 14, Fortitude saving throw modifier of +8, Hardness 5, 100 Hit Points (BT 50), object immunities, and immunities to critical hits and precision damage.',
			'Once loaded and boarded, the mystic carriage sets out at a Speed of 60 feet, heading unerringly towards its destination using whatever roads and trails are available.',
			"If it's attacked, it continues going as long as nothing blocks its passage. If something blocks its way, living or otherwise, it will stop until the way is cleared, waiting to continue until all of its passengers are aboard once more.",
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						'You create a mystic carriage that lasts for 2 weeks, instead of 1 week. It can take you to up to two destinations, the first of which must be within 250 miles and the second of which must be within 250 miles of the first destination.',
					Success: 'You create a mystic carriage as described above.',
					Failure: "You don't create a mystic carriage.",
					'Critical Failure':
						"You don't create a mystic carriage, and you're attacked by a herd of four {@creature riding horse||riding horses}.",
				},
			},
		],
		heightened: {
			plusX: {
				'1': [
					"The carriage's AC, Fortitude save, and Hardness increase by 2, its Hit Points increase by 20, and its {@condition Broken} Threshold increases by 10.",
				],
			},
		},
	},
	{
		name: 'Owb Pact',
		source: 'B3',
		page: 41,
		level: 3,
		traits: ['uncommon', 'conjuration'],
		cast: {
			number: 1,
			unit: 'day',
		},
		secondaryCasters: {
			number: 2,
		},
		primaryCheck: {
			entry: '{@skill Occultism} (expert)',
			skills: ['Occultism'],
			prof: 'expert',
		},
		entries: [
			'You call upon an owb to assist you in a goal. Only caligni callers can use this ritual with relative safety. If a different type of caligni attempts this ritual, they use an outcome one degree of success worse than the result of their check. If a non-caligni attempts this ritual, the result is an automatic critical failure.',
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						"You conjure the owb. It decides your goals closely match its own and doesn't request a favor in return.",
					Success:
						"You conjure the owb. It isn't eager to pursue the task, so it requires a favor in return.",
					Failure: "You don't conjure an owb.",
					'Critical Failure':
						'You conjure an owb, but it deems you unworthy and siphons away some of your soul energy. All casters become {@condition doomed 2}.',
				},
			},
		],
	},
	{
		name: 'Planar Ally',
		source: 'CRB',
		page: 413,
		level: 5,
		traits: ['uncommon', 'conjuration'],
		cast: {
			number: 1,
			unit: 'day',
		},
		cost: "rare incense and offerings worth a total value of 2 gp × the spell level × the target's level",
		secondaryCasters: {
			number: 2,
			note: 'must share your religion',
		},
		primaryCheck: {
			entry: '{@skill Religion} (expert)',
			skills: ['Religion'],
			prof: 'expert',
		},
		secondaryCheck: {
			entry: '{@skill Diplomacy}',
			skills: ['Diplomacy'],
		},
		duration: {
			entry: 'see text',
			unit: 'special',
		},
		entries: [
			"You call upon your deity to grant you aid in the form of a divine servitor of your deity's choice of a level no greater than double planar ally's spell level. While performing this ritual, the secondary casters entreat your deity, explaining what sort of assistance you need and why you need it; if the task is incredibly fitting to your deity, the GM can grant a circumstance bonus to the secondary {@skill Diplomacy} check or rule that the check is automatically a critical success. If the ritual succeeds, you must offer the servitor payment depending on factors such as the duration and danger of the task. Payment always costs at least as much as a consumable item of the creature's level, even for a short and simple task, and it often costs as much as a permanent magic item of the creature's level to persuade a creature to fight alongside you. If you use the ritual without good reason, the result is automatically a critical failure.",
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						"Your deity sends a servitor, and the servitor's payment costs only half as much as normal. If you ask for a particular servitor by name, your deity is likely to send that servitor unless the servitor is busy.",
					Success: 'Your deity sends a servitor.',
					Failure: 'Your deity does not send a servitor.',
					'Critical Failure':
						"Your deity is offended and sends a sign of displeasure or possibly even a servitor to scold or attack you, depending on your deity's nature. You must conduct an {@ritual atone} ritual to regain your former standing with your deity.",
				},
			},
		],
	},
	{
		name: 'Planar Binding',
		source: 'CRB',
		page: 414,
		level: 6,
		traits: ['uncommon', 'abjuration', 'conjuration'],
		cast: {
			number: 1,
			unit: 'day',
		},
		cost: "warding diagram ingredients worth a total value of 2 gp × the spell level × the target's level",
		secondaryCasters: {
			number: 4,
		},
		primaryCheck: {
			entry: '{@skill Arcana} (master) or {@skill Occultism} (master)',
			skills: ['Arcana', 'Occultism'],
			prof: 'master',
		},
		secondaryCheck: {
			entry: "{@skill Crafting}; {@skill Diplomacy} or {@skill Intimidation}; {@skill Arcana} or {@skill Occultism} (whichever isn't used for the primary check)",
			skills: ['Arcana', 'Crafting', 'Diplomacy', 'Intimidation', 'Occultism'],
		},
		range: {
			entry: 'interplanar',
			distance: {
				type: 'unknown',
				amount: 1,
			},
		},
		targets: '1 extraplanar creature',
		duration: {
			entry: 'varies',
			unit: 'special',
		},
		entries: [
			"You call forth an extraplanar creature of a level no greater than double that of the planar binding ritual's level and attempt to bargain with it. The secondary caster attempting the {@skill Crafting} check creates a warding diagram to prevent the extraplanar creature from attacking or leaving during the bargain; if that caster fails or critically fails, then instead of the usual effects of a failure or critical failure of the secondary skill check, the extraplanar creature can attack or leave instead of negotiate.",
			"You can also leave out this step, removing the need for a {@skill Crafting} check, with the same result (if you're summoning a good outsider you trust, for example). The creature can also attack or leave if you use any {@condition hostile} action against it or if the warding diagram breaks. Once the diagram is complete, you and the secondary casters each take your places at specific points at the diagram's edge where power concentrates.",
			"You conjure the extraplanar creature within your wards and negotiate a deal with it, generally to perform a task for you in exchange for payment. A creature that doesn't wish to negotiate at all can attempt a Will save to stay on its home plane. Most good and neutral extraplanar creatures feel that they have something better to do than cater to the whims of mortals and require a significant gift, especially if your task poses significant risks. Evil extraplanar creatures are more likely to accept a bargain for a lower cost as long as it allows them to wreak havoc on the Material Plane or inflict evil upon the world along the way. Monetary prices usually range from the cost of a consumable item of the creature's level for a short and simple task to a permanent magic item of the creature's level or more to persuade the creature to fight alongside you. However, some extraplanar creatures may want payments other than money, such as permission to cast a geas on you to fulfill an unspecified later favor or obtain ownership of your soul via an infernal contract. If you can't come to an agreement in a reasonable length of time after you've made your case, the extraplanar creature can return from whence it came at any time.",
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						'You call the extraplanar creature and bind it in the wards for up to a full day before it returns home, potentially allowing you to negotiate a better deal by threatening to leave it in the wards for the full day.',
					Success: 'You call the extraplanar creature.',
					Failure: 'You fail to call the extraplanar creature.',
					'Critical Failure':
						'You call something dark and horrible, unbound by your wards, and it immediately attempts to destroy you.',
				},
			},
		],
	},
	{
		name: 'Plant Growth',
		source: 'CRB',
		page: 415,
		level: 4,
		traits: ['uncommon', 'necromancy', 'plant', 'positive'],
		cast: {
			number: 1,
			unit: 'day',
		},
		secondaryCasters: {
			number: 1,
		},
		primaryCheck: {
			entry: '{@skill Nature} (expert)',
			skills: ['Nature'],
			prof: 'expert',
		},
		secondaryCheck: {
			entry: '{@skill Lore||Farming Lore} or {@skill Survival}',
			skills: ['Lore', 'Survival'],
		},
		area: {
			types: ['Misc.'],
			entry: '1/2-mile-radius circle centered on you',
		},
		duration: {
			number: 1,
			unit: 'year',
		},
		entries: [
			'You cause the plants within the area to be healthier and more fruitful. In addition to other benefits of healthy plants, this increases the crop yield for farms, depending on your success.',
			'If you cast it in the area of a blight, plant growth attempts to counteract the blight instead of producing its usual effect.',
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						'Double the crop yield in the area, or increase the area to a 1-mile radius.',
					Success: 'Increase the crop yield in the area by one-third.',
					Failure: 'The ritual has no effect.',
					'Critical Failure':
						'The flora in the area changes in an unanticipated way, determined by the GM but generally as contradictory to your true desires as possible (for instance, blighting crops when you would prefer to enrich them).',
				},
			},
		],
	},
	{
		name: 'Portrait Of Spite',
		source: 'SoM',
		page: 153,
		level: 5,
		traits: ['uncommon', 'curse', 'necromancy'],
		cast: {
			number: 7,
			unit: 'day',
		},
		cost: "splendid art supplies worth at least 100 gp × the target's level, at least one pint of blood from the target",
		secondaryCasters: {
			number: 3,
		},
		primaryCheck: {
			entry: '{@skill Occultism} or {@skill Religion} (master)',
			prof: 'master',
			skills: ['Occultism', 'Religion'],
		},
		secondaryCheck: {
			entry: "{@skill Crafting}, {@skill Occultism} or {@skill Religion} (whichever isn't used for the primary check)",
			skills: ['Crafting', 'Occultism', 'Religion'],
		},
		targets: '1 living creature',
		duration: {
			number: 1,
			unit: 'year',
		},
		entries: [
			"Using the blood, you compose a portrait of the target in perfect health. Once the portrait is complete, you recite your grievances against the target and enact on the portrait the punishments you wish to see them face, choosing from the {@condition clumsy}, {@condition enfeebled}, {@condition drained}, or {@condition stupefied} condition. The target must attempt a Will saving throw. You're only able to perform this ritual if you know the target's name and are able to see their face clearly in your mind's eye, and the secondary caster who performs the {@skill Crafting} check must be able to paint or draw the target from memory.",
			"The target suffers the effects over the course of {@dice 1d6} hours, during which time the portrait transforms to reveal a caricature of the punishment you chose\u2014muscles atrophied into nothing for {@condition enfeebled}, pallid and sickly for {@condition drained}, and so on. The target is immediately aware that they're under the effects of a magical ailment. If the duration expires or the target removes the curse with a remove curse or similar effect, their portrait slowly returns back to its original form. Destroying the portrait also ends the effect immediately.",
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						'The target is either {@condition clumsy 4}, {@condition drained 4}, {@condition enfeebled 4}, or {@condition stupefied 4}, depending on the punishment you chose. On a successful Will save, the condition value is 2, and the target is unaffected on a critical success.',
					Success:
						'The target is either {@condition clumsy 2}, {@condition drained 2}, {@condition enfeebled 2}, or {@condition stupefied 2}, depending on the punishment you chose. On a successful Will save, the condition value is 1, and the target is unaffected on a critical success.',
					Failure:
						"The portrait doesn't change, and the ritual has no effect on the target.",
					'Critical Failure':
						'The portrait turns into a sickening mimicry of your form and the forms of the secondary casters, and the blood of your target extracts itself from the canvas, dripping down and drying immediately to prevent you from reattempting the ritual. Over the course of the next {@dice 1d6} hours, you and the secondary casters experience the curse you had intended to place upon the target with the effects of a critical success.',
				},
			},
		],
	},
	{
		name: 'Primal Call',
		source: 'CRB',
		page: 415,
		level: 6,
		traits: ['uncommon', 'abjuration', 'conjuration'],
		cast: {
			number: 1,
			unit: 'day',
		},
		cost: "faerie circle ingredients worth a total value of 1 gp × the spell level × the target's level",
		secondaryCasters: {
			number: 4,
		},
		primaryCheck: {
			entry: '{@skill Nature} (master)',
			skills: ['Nature'],
			prof: 'master',
		},
		secondaryCheck: {
			entry: '{@skill Crafting}, {@skill Diplomacy}, {@skill Survival}',
			skills: ['Crafting', 'Diplomacy', 'Survival'],
		},
		range: {
			entry: '100 miles',
			distance: {
				type: 'miles',
				amount: 100,
			},
		},
		targets: '1 animal, beast, fey, fungus, or plant',
		duration: {
			entry: 'see text',
			unit: 'special',
		},
		entries: [
			'This functions as {@ritual planar ally} except you craft a faerie circle and call an animal, beast, fey, fungus, or plant from within 100 miles.',
		],
	},
	{
		name: 'Purify Soul Path',
		source: 'SoM',
		page: 234,
		level: 2,
		traits: ['uncommon', 'abjuration'],
		cast: {
			number: 1,
			unit: 'day',
		},
		cost: 'rare incense and offering worth a total value of 10 gp × your level',
		primaryCheck: {
			entry: '{@skill Religion} (trained)',
			skills: ['Religion'],
			prof: 'trained',
		},
		entries: [
			"You delve inward, spending extensive time contemplating the purity of your own soul and the actions of your past. If you aren't truly penitent, the outcome is always a critical failure.",
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						'You reconcile your misdeeds with your soul path, removing your soulforged corruption. The corruption flaw from your armament no longer affects you. Before your reconciliation is complete, you must perform a special quest or other task in accord with your soul path. If completed during downtime, this task should take no less than 1 week. For 1 month, you receive divine insight just before performing an act that would be anathema to your soul path.',
					Success:
						'As critical success, but you gain no special insight regarding its subsequent actions.',
					Failure:
						"You don't reconcile and must continue to meditate and redress your misdeeds. Any future purify soul path rituals for the same misdeeds cost half as much and gain a +4 circumstance bonus to the primary check.",
				},
			},
		],
		heightened: {
			plusX: {
				'1': ['Increase the maximum target level by 2 and the base cost by 10 gp.'],
			},
		},
	},
	{
		name: 'Ravenous Reanimation',
		source: 'B2',
		page: 223,
		level: 7,
		traits: ['rare', 'evil', 'necromancy'],
		cast: {
			number: 1,
			unit: 'day',
		},
		cost: "valuable treasures from the target dragon's hoard worth a total value of 50,000 gp",
		primaryCheck: {
			entry: '{@skill Arcana} (master), {@skill Occultism} (master), or {@skill Religion} (master)',
			skills: ['Occultism', 'Arcana', 'Religion'],
			prof: 'master',
		},
		requirements: 'You must be an evil dragon.',
		duration: {
			number: 1,
			unit: 'week',
		},
		entries: [
			"You destroy the gathered treasures with your breath weapon or other powerful magic, then invoke necromantic energies before you feed upon the charred and melted remains. As you do so, negative energy courses through your flesh, automatically killing you. Each individual {@creature ravener|B2|ravener's} {@i ravenous reanimation} requires three to five unique additional components. Whether or not you return as a {@creature ravener|b2} depends on the success of the ritual.",
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						'You immediately transform into a {@creature ravener|b2} upon finishing the ritual; your soul ward starts at full Hit Points (equal to 5 × your level).',
					Success:
						'You rise as a {@creature ravener|b2} 24 hours after completing the ritual, as long as your body remains relatively intact. When you rise as a ravener, your soul ward starts at 1 Hit Point.',
					Failure:
						'You rise as a {@creature ravener husk|b2} 24 hours after completing the ritual.',
					'Critical Failure': 'You die.',
				},
			},
		],
	},
	{
		name: 'Reincarnate',
		source: 'APG',
		page: 242,
		level: 3,
		traits: ['uncommon', 'necromancy'],
		cast: {
			number: 4,
			unit: 'hour',
		},
		cost: "rare herbs worth a total value of the target's level (minimum 1) × 25 gp",
		secondaryCasters: {
			number: 2,
		},
		primaryCheck: {
			entry: '{@skill Nature} (expert)',
			skills: ['Nature'],
			prof: 'expert',
		},
		secondaryCheck: {
			entry: '{@skill Occultism}, {@skill Religion}',
			skills: ['Occultism', 'Religion'],
		},
		range: {
			entry: '10 feet',
			distance: {
				type: 'feet',
				amount: 10,
			},
		},
		targets: '1 dead creature of up to 8th level',
		entries: [
			"You call forth the target's soul and attempt to incarnate it into a brand-new body. As the soul won't be returning to the original body, only a small portion of the creature's remains are required. These remains must have been part of the original body at the time of death, and the target must have died within the past week. If {@deity Pharasma} has decided that the target's time has come or the target's soul is trapped or doesn't wish to return, this ritual automatically fails, but you discover this after you succeed at the {@skill Religion} check and can end the ritual without paying the cost.",
			"If the ritual is successful, the target's new body has a random ancestry. First roll {@dice 1d20}. On a result of 1 through 14, the new body is one of a {@trait common} ancestry, while on a 15 through 20 they become a member of an {@trait uncommon} or {@trait rare} ancestry. The GM chooses possible ancestries based on those found in the region and then rolls randomly between them. For instance, the GM could roll {@dice 1d6} to choose a common ancestry from the Core Rulebook. The target replaces their ancestry Hit Points, size, Speeds, ability boosts, ability flaws, traits, and special abilities with those of their new ancestry. The target loses their heritage and ancestry feats, selecting replacements from their new ancestry. The target's background, class features, and known languages remain unaltered.",
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						'You reincarnate the target into a new adult body. This new body has full HP and has the same spells prepared and points in their pools as the original did when it died.',
					Success:
						"As critical success, except the new body has 1 HP and no spells prepared or points in any pools. The soul takes some time to adjust to their new body, leaving them {@condition clumsy 2}, {@condition drained 2}, and {@condition enfeebled 2} for 1 week; these conditions can't be removed or reduced by any means until the week has passed.",
					Failure: 'You fail to reincarnate the target.',
					'Critical Failure':
						"The target's soul becomes trapped in an unintelligent animal creature of the GM's choosing, with a level no greater than half the target's level. While trapped, the target has an Intelligence score of 1 (\u20135 modifier) and can't use any of their own abilities.",
				},
			},
		],
		heightened: {
			X: {
				'4': [
					"The maximum level of the target increases to 10. The cost is the target's level (minimum 1) × 40 gp.",
				],
				'5': [
					"The maximum level of the target increases to 12. The cost is the target's level (minimum 1) × 75 gp.",
				],
				'6': [
					"The maximum level of the target increases to 14. The cost is the target's level (minimum 1) × 125 gp. The target must have died within the past month.",
				],
				'7': [
					"The maximum level of the target increases to 16. The cost is the target's level (minimum 1) × 200 gp. The target must have died within the past month.",
				],
				'8': [
					"The maximum level of the target increases to 18. The cost is the target's level (minimum 1) × 300 gp. The target must have died within the past year.",
				],
				'9': [
					"The maximum level of the target increases to 20. The cost is the target's level (minimum 1) × 600 gp. The target must have died within the past decade.",
				],
			},
		},
	},
	{
		name: 'Rest Eternal',
		source: 'APG',
		page: 244,
		level: 4,
		traits: ['uncommon', 'necromancy'],
		cast: {
			number: 1,
			unit: 'day',
		},
		cost: "rare oils to anoint the body worth a total value of the target's level (minimum 1) × 25 gp",
		secondaryCasters: {
			number: 2,
		},
		primaryCheck: {
			entry: '{@skill Religion} (expert)',
			skills: ['Religion'],
			prof: 'expert',
		},
		secondaryCheck: {
			entry: '{@skill Occultism}, {@skill Religion}',
			skills: ['Occultism', 'Religion'],
		},
		range: {
			entry: '20 feet',
			distance: {
				type: 'feet',
				amount: 20,
			},
		},
		targets: '1 dead creature',
		entries: [
			"You call upon gods, spirits, and stranger beings to bar a creature's spirit from ever returning. A spirit that doesn't wish to be so constrained can attempt a Will save to resist this ritual; on a critical success, it fools you into believing the ritual succeeded. This ritual has no effect on a target who is undead or whose soul is otherwise not in the afterlife.",
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						"You sequester the subject's spirit to the afterlife. Attempts to communicate with the dead creature, return it to life, turn it into an undead, or otherwise disturb its afterlife fail unless the effect's counteract level is at least 2 higher than that of rest eternal or originates from an artifact or a deity. Successfully returning the creature to life ends the restrictions placed by rest eternal.",
					Success:
						"As critical success, but effects to interact with the spirit fail unless the effect's counteract level is higher than that of rest eternal or originates from an artifact or a deity.",
					Failure: 'The ritual has no effect.',
					'Critical Failure':
						'The ritual fails, and the spirits you appealed to are angered by your meddling. All casters become {@condition doomed 1} for 1 week.',
				},
			},
		],
	},
	{
		name: 'Resurrect',
		source: 'CRB',
		page: 415,
		level: 5,
		traits: ['uncommon', 'healing', 'necromancy'],
		cast: {
			number: 1,
			unit: 'day',
		},
		cost: "diamonds worth a total value of 75 gp × the target's level",
		secondaryCasters: {
			number: 2,
		},
		primaryCheck: {
			entry: '{@skill Religion} (expert)',
			skills: ['Religion'],
			prof: 'expert',
		},
		secondaryCheck: {
			entry: '{@skill Medicine}, {@skill Society}',
			skills: ['Medicine', 'Society'],
		},
		range: {
			entry: '10 feet',
			distance: {
				type: 'feet',
				amount: 10,
			},
		},
		targets: '1 dead creature of up to 10th level',
		entries: [
			"You attempt to call forth the target's soul and return it to its body. This requires the target's body to be present and relatively intact. The target must have died within the past year. If {@deity Pharasma} has decided that the target's time has come or the target doesn't wish to return, this ritual automatically fails, but you discover this after the successful {@skill Religion} check and can end the ritual without paying the cost.",
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						'You resurrect the target. They return to life with full Hit Points and the same spells prepared and points in their pools they had when they died, and still suffering from any long-term debilitations of the old body. The target meets an agent of their deity during the resurrection who inspires them, granting them a +1 status bonus to attack rolls, {@skill Perception}, saving throws, and skill checks for 1 week. The target is also permanently changed in some way by their time in the afterlife, such as gaining a slight personality shift, a streak of white in the hair, or a strange new birthmark.',
					Success:
						"As critical success, except the target returns to life with 1 Hit Point and no spells prepared or points in any pools, and still is affected by any long-term debilitations of the old body. Instead of inspiring them, the character's time in the Boneyard has left them temporarily debilitated. The target is {@condition clumsy 1}, {@condition drained 1}, and {@condition enfeebled 1} for 1 week; these conditions can't be removed or reduced by any means until the week has passed.",
					Failure: 'Your attempt is unsuccessful.',
					'Critical Failure':
						'Something goes horribly wrong\u2014an evil spirit possesses the body, the body transforms into a special kind of undead, or some worse fate befalls the target.',
				},
			},
		],
		heightened: {
			X: {
				'6': [
					'You can resurrect a target of up to 12th level, and the base cost is 125 gp.',
				],
				'7': [
					"You can use resurrect even with only a small portion of the body; the ritual creates a new body on a success or critical success. The target must have died within the past decade. The ritual requires four secondary casters, each of whom must be at least half the target's level. The target can be up to 14th level, and the base cost is 200 gp.",
				],
				'8': [
					'As 7th level, but the target can be up to 16th level and the base cost is 300 gp.',
				],
				'9': [
					"You can use resurrect even without the body as long as you know the target's name and have touched a portion of its body at any time. The target must have died within the past century, and it doesn't gain the negative conditions on a success. The ritual requires eight secondary casters, each of whom must be at least half the target's level. The target can be up to 18th level, and the base cost is 600 gp.",
				],
				'10': [
					"As 9th level, except it doesn't matter how long ago the target died. The ritual requires 16 secondary casters, each of whom must be at least half the target's level. The target can be up to 20th level, and the ritual's base cost is 1,000 gp.",
				],
			},
		},
	},
	{
		name: 'Simulacrum',
		source: 'APG',
		page: 244,
		level: 4,
		traits: ['uncommon', 'illusion'],
		cast: {
			number: 1,
			unit: 'day',
		},
		cost: 'a piece of hair, drop of blood, or other part of the creature to be duplicated, plus rare oils, minerals, and pigments with a total value of 300 gp',
		secondaryCasters: {
			number: 3,
		},
		primaryCheck: {
			entry: '{@skill Arcana} or {@skill Occultism} (master, the check has the {@trait secret} trait)',
			skills: ['Arcana', 'Occultism'],
			prof: 'master',
		},
		secondaryCheck: {
			entry: '{@skill Arcana}, {@skill Nature}, {@skill Occultism}, {@skill Religion}, or {@skill Society} (whichever is required to {@action Recall Knowledge} about the creature being duplicated); {@skill Crafting}, {@skill Deception}',
			skills: [
				'Arcana',
				'Nature',
				'Occultism',
				'Crafting',
				'Religion',
				'Society',
				'Deception',
			],
		},
		range: {
			entry: '20 feet',
			distance: {
				type: 'feet',
				amount: 20,
			},
		},
		targets: '1 living creature',
		entries: [
			"You create an illusory duplicate of the target creature by animating ice or snow sculpted in its shape. The simulacrum is a 4th-level creature with no special abilities. If it needs to attempt a roll or use a DC, use the moderate number for a monster, except as noted below. It doesn't have any specific memories from the target, but it can use information about the creature gained from any of the casters to {@action Impersonate} the target. It looks exactly like the target and has a {@skill Deception} modifier to {@action Impersonate} that creature equal to the modifier of the secondary spellcaster who rolled the {@skill Deception} check, with a +4 status bonus.",
			"While it doesn't have any of the original's special abilities, like a dragon's breath weapon, the illusions that make up the simulacrum allow it to appear to use those abilities; they just never seem to have an effect. For instance, against a simulacrum dragon's breath weapon, all creatures in the area seem to critically succeed at their saving throws and take no damage. Creatures can attempt to {@quickref disbelieve the illusion|CRB|2|disbelieving illusions|0} by attempting a {@skill Perception} check against the {@skill Deception} DC of the secondary spellcaster who rolled the {@skill Deception} check.",
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						'You bring the simulacrum to life. It has the {@trait minion} trait and is under your absolute control. You gain a direct mental link with the simulacrum and can spend an action to command the simulacrum via this link, even at a distance.',
					Success:
						'As a critical success, but there is no special link between you and the simulacrum. You must spend an action to command it verbally or by some other means.',
					Failure: 'The ritual fails and has no effect.',
					'Critical Failure':
						"The simulacrum awakens, but it isn't your {@trait minion} and is {@condition hostile} to all the casters. It does everything it can to destroy them, but if it can't immediately slay them, the simulacrum tries to escape and plots their demise.",
				},
			},
		],
	},
	{
		name: 'Statuette',
		source: 'EC4',
		page: 75,
		level: 6,
		traits: ['rare', 'polymorph'],
		cast: {
			number: 1,
			unit: 'hour',
		},
		secondaryCasters: {
			number: 2,
		},
		primaryCheck: {
			entry: '{@skill Arcana} (expert)',
			skills: ['Arcana'],
			prof: 'expert',
		},
		secondaryCheck: {
			entry: '{@skill Crafting}, {@skill Occultism}',
			skills: ['Crafting', 'Occultism'],
		},
		range: {
			entry: '10 feet',
			distance: {
				amount: 10,
				type: 'feet',
			},
		},
		targets:
			'1 freestanding, non-magical object no larger than 3,000 cubic feet (the size of a {@trait Huge} creature)',
		entries: [
			"This ritual is a variant of the {@spell shrink item} spell that allows for the transformation of significantly larger items. You transform the object into a tiny statuette of itself that is Light Bulk. The ritual does not shrink any creatures inside or on top of the item when it is transformed. The item remains in statuette form until the ritual's duration expires or until a creature places it on a stable surface and uses a 10-minute activity to {@action Interact} with the item to enlarge it. When restored to its normal size, the object simply pushes other creatures and objects aside or harmlessly contains them, as a magic item with the {@trait structure} trait.",
			'Your {@skill Arcana} check determines how long the object remains in statuette form.',
			{
				type: 'successDegree',
				entries: {
					'Critical Success': 'The object remains a statuette for 1 week.',
					Success: 'The object remains a statuette for 1 day.',
					Failure: 'You fail to shrink the object.',
					'Critical Failure':
						'You fail to shrink the object, and the highest-level item you carry of light Bulk or more shrinks to a tiny, unusable figurine of itself, weighing negligible bulk, for 1 week.',
				},
			},
		],
	},
	{
		name: 'Tattoo Whispers',
		source: 'SoT1',
		page: 38,
		level: 3,
		traits: ['rare', 'auditory', 'divination', 'linguistic', 'mental'],
		cast: {
			number: 1,
			unit: 'hour',
		},
		cost: 'tattoo inks and silver tattooing needles worth 20 gp for each secondary caster',
		secondaryCasters: {
			number: 2,
			note: 'up to a maximum of 6',
		},
		primaryCheck: {
			entry: '{@skill Crafting} (expert)',
			skills: ['Crafting'],
			prof: 'expert',
		},
		secondaryCheck: {
			entry: '{@skill Arcana}, {@skill Occultism}',
			skills: ['Arcana', 'Occultism'],
		},
		range: {
			entry: 'touch',
		},
		targets: 'the secondary casters',
		entries: [
			'You carefully tattoo the same design upon each secondary caster. The tattoo can be of any shape or symbol, but it must include a mouth. The tattoo fades naturally over the course of 1 month.',
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						"The tattoos on the secondary casters are all magically linked for 1 week, providing a semi-telepathic bond. Each secondary caster can communicate secretly with any other secondary casters at any time by mouthing words but making no sound. The person receiving a message must be within 120 feet of the sender, must be within the sender's line of sight, and must have their tattoo uncovered. The mouth of the tattoo moves to match the words, which the tattoo whispers, but only the tattoo's bearer can hear it.",
					Success: 'As critical success, but the effect lasts for 1 day.',
					Failure: 'The ritual has no effect.',
					'Critical Failure':
						'The ritual has no effect and creates a backlash of {@condition persistent damage||persistent mental} static. All casters are {@condition stupefied|CRB|stupefied 1} for 1 day.',
				},
			},
		],
	},
	{
		name: 'Teleportation Circle',
		source: 'APG',
		page: 244,
		level: 7,
		traits: ['uncommon', 'conjuration', 'teleportation'],
		cast: {
			number: 1,
			unit: 'day',
		},
		cost: 'rare incense, precious metals, and purified chalk worth 500 gp',
		secondaryCasters: {
			number: 2,
		},
		primaryCheck: {
			entry: '{@skill Arcana} or {@skill Occultism} (master)',
			skills: ['Arcana', 'Occultism'],
			prof: 'master',
		},
		secondaryCheck: {
			entry: '{@skill Crafting}, {@skill Survival}',
			skills: ['Crafting', 'Survival'],
		},
		range: {
			entry: '20 feet',
			distance: {
				amount: 20,
				type: 'feet',
			},
		},
		duration: {
			number: 1,
			unit: 'day',
		},
		entries: [
			"You create a 10-foot-diameter circle on the ground, which acts as a portal to a destination determined at the time of the ritual. You designate the destination of the teleportation as part of the ritual. This destination can't be changed. The destination must be a location within 1,000 miles and be on the same plane as the teleportation circle. You must be able to identify the location precisely both by its position relative to the location where you create the teleportation circle and by the destination's appearance (or other identifying features). The destination must also be a 10-foot-diameter circle that doesn't overlap with any solid structures, but it can be a place that is harmful or dangerous.",
			'A secondary caster attempting a {@skill Survival} check for this ritual can be located at the exact site of the destination, instead of with you at the point of origin. If the secondary succeeds at their check at the destination and you roll a success, the ritual is a critical success instead.',
			'While the circle is active, any creature that moves to be fully within the circle is instantly teleported to the destination. A creature that is unwilling to be teleported can attempt a Will save to resist the effect. If it remains in the circle, the creature must attempt this save again at the end of each of its turns.',
			'The teleportation circle normally goes only in one direction, though you can double the Cost to make the teleportation work in both directions.',
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						"You create the teleportation circle, and it's extremely precise, regardless of the distance traveled. Travelers arrive exactly at the designated point.",
					Success:
						'As a critical success, but the destination of the teleportation circle is slightly inaccurate, and is off target by roughly 1 percent of the distance traveled, to a maximum of 10 miles off target.',
					Failure: "The teleportation circle doesn't function.",
					'Critical Failure':
						'The teleportation circle is wildly inaccurate. It leads to a random destination roughly the same distance from the origin point, and the chances of some other unusual mishap are much greater.',
				},
			},
		],
		heightened: {
			X: {
				'9': [
					'The cost increases to 2,000 gp, the duration increases to 1 month, and the destination can be anywhere on the same planet.',
				],
				'10': [
					'The cost increases to 10,000 gp, the duration is unlimited, and the destination can be anywhere on the same planet.',
				],
			},
		},
	},
	{
		name: 'Terminate Bloodline',
		source: 'EC5',
		page: 74,
		level: 6,
		traits: ['uncommon', 'necromancy'],
		cast: {
			number: 1,
			unit: 'day',
		},
		cost: "a bodily sample from the target, and valuables belonging to the target worth a total value of 100 gp × the spell level × the target's level",
		secondaryCasters: {
			number: 3,
		},
		primaryCheck: {
			entry: '{@skill Occultism} (master)',
			skills: ['Occultism'],
			prof: 'master',
		},
		secondaryCheck: {
			entry: '{@skill Society}',
			skills: ['Society'],
		},
		range: {
			entry: '10 miles',
			distance: {
				amount: 10,
				type: 'miles',
			},
		},
		targets:
			"1 creature of a level no greater than double the {@i terminate bloodline} ritual's level",
		entries: [
			"Mighty drow noble houses, including House Shraen, use this ritual to stamp out fledgling noble houses before they rise to power. At the ritual's completion, you place a contagious wasting disease upon the target creature with the intention of ending their familial bloodline.",
			"The ritual is easiest to cast on a subdued target, typically a low-ranking member of the targeted family bloodline who is kidnapped and has their memory wiped. If the target is conscious when the ritual is cast, the target attempts a Fortitude save against the ritual's DC; on a success, the ritual fails. Otherwise, the target is automatically affected by the dying bloodline disease.",
			"Every member of an infected creature's immediate family (blood relationship or parent or child) that comes into physical contact with that infected creature must attempt a Fortitude save or contract the disease.",
			{
				type: 'data',
				tag: 'affliction',
				data: {
					name: 'Dying Bloodline',
					type: 'Disease',
					source: 'EC5',
					page: 74,
					traits: ['curse', 'disease'],
					entries: [
						"Failing or critically failing this disease's Fortitude save causes the disease to progress to the next stage as normal; however, succeeding or critically succeeding at the save has no effect. The disease can be removed only by first successfully counteracting the curse and then counteracting the disease.",
						"{@b Level} equal to twice the ritual's level;",
						{
							type: 'affliction',
							stages: [
								{
									stage: 1,
									entry: 'carrier with no effect',
									duration: '1 month',
								},
								{
									stage: 2,
									entry: '{@condition fatigued}',
									duration: '1 week',
								},
								{
									stage: 3,
									entry: '{@condition fatigued} and {@condition drained 1}',
									duration: '1 day',
								},
								{
									stage: 4,
									entry: '{@condition fatigued} and {@condition drained 3}',
									duration: '1 day',
								},
								{
									stage: 5,
									entry: 'death',
								},
							],
						},
					],
				},
			},
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						'The creature does not contract the disease and does not need to attempt further saves when coming into physical contact with that particular creature (the creature is not immune to the disease, however, and must attempt a save as normal if it comes into physical contact with a different infected family member).',
					Success:
						'The creature is not affected but must attempt another save the next time they come into physical contact with that particular infected creature.',
					Failure:
						'The creature contracts the disease and can spread it in the same way as the original target.',
				},
			},
		],
	},
	{
		name: "The World's A Stage",
		source: 'SoM',
		page: 153,
		level: 5,
		traits: ['uncommon', 'divination', 'fortune'],
		cast: {
			number: 1,
			unit: 'day',
		},
		cost: 'costumes and a stage large enough to fit all casters',
		secondaryCasters: {
			number: 2,
			note: 'to 12',
		},
		primaryCheck: {
			entry: '{@skill Occultism} (expert)',
			skills: ['Occultism'],
			prof: 'expert',
		},
		secondaryCheck: {
			entry: '{@skill Crafting}, {@skill Performance}',
			skills: ['Crafting', 'Performance'],
		},
		duration: {
			number: 1,
			unit: 'month',
		},
		entries: [
			"This famous ritual is a sophisticated example of symbolic magic, binding fate and fortune to follow a prepared script. To conduct the ritual, you and the secondary casters must put on a long-form, multi-person, plot-based performance that's usually a play or opera, though more unusual performances have been known. You take the role of the director, while the secondary casters are either actors ({@skill Performance}) or significant backstage figures, such as set or costume designers ({@skill Crafting}). The casting time of the ritual includes both preparations and rehearsals of various sorts and the actual performance, which must be at least an hour long.",
			"The performance presents current events and offers a particular vision on how they resolve, often in metaphorical or allegorical format (proposing the overthrow of a tyrant by referring to a different, legendary tyrant who was overthrown, or suggesting that a murderous secret might be uncovered by presenting an allegory of truth defeating murder). This performance must be presented to an audience of at least a hundred people, a majority of whom must both be connected, at least peripherally, to the events in question (the people of the tyrant's city, or the residents of the village where the murder occurred) and who must understand what the metaphor or allegory actually refers to. For the magic to spark, the performance must declare its purpose loudly and clearly to the parties most concerned. If a major antagonist featured in the performance is in the audience and the ritual is a success, you get a critical success instead.",
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						"Something sublime sparks between performance and audience, and destiny conspires to push events in the right direction. You and each secondary caster can reroll up to three skill checks at any point during the duration of the ritual after determining the results, as long as the skill check is connected to ensuring the topic of the performance comes true (to sneak past the tyrant's guards or find the murder weapon, for instance).",
					Success:
						'As critical success except the sparks of destiny are weaker, so each caster can reroll only a single skill check.',
					Failure: 'The ritual has no effect.',
					'Critical Failure':
						"The performance is a dramatic and horrendous botch, and fate strikes out at the casters. You and each secondary caster are {@condition doomed 1} for the next month, and this condition can't be removed by anything less than a wish or similarly powerful magic.",
				},
			},
		],
	},
	{
		name: 'Unfettered Mark',
		source: 'AoE5',
		page: 80,
		level: 8,
		traits: ['rare', 'abjuration'],
		cast: {
			number: 1,
			unit: 'hour',
		},
		cost: "rare inks and needles worth a total value of 100 gp × the spell level × the target's level (see text)",
		secondaryCasters: {
			number: 0,
			note: 'to 10',
		},
		primaryCheck: {
			entry: '{@skill Crafting} (master) or any (legendary)',
			skills: ['Crafting'],
			prof: 'master',
		},
		secondaryCheck: {
			entry: 'any (see text)',
		},
		range: {
			entry: 'touch',
			distance: {
				type: 'touch',
				amount: 1,
			},
		},
		targets: '1 creature or self',
		duration: {
			entry: '24 hours until the magic fades',
			number: 24,
			unit: 'hour',
		},
		entries: [
			'You tattoo the target with rare inks and create a magical tattoo called an unfettered mark. This particular version of the unfettered mark grants the target special powers to escape from the Black Whale and Stormholt (the demiplane that overlaps with the Black Whale). While {@skill Crafting} is the easiest method for creating this tattoo, the artistry is less important than maintaining a feeling of freedom in your mind while performing the ritual. Because of this, you can use any skill as long as it holds a special significance to you.',
			'A ranger who is at home in the woods, for example, could use a {@skill Survival} or {@skill Nature} check while creating the tattoo. If the target already has a successful unfettered mark currently active, the magic fades from the old tattoo and is replaced by the results of the new ritual.',
			'The ritual can be performed alone or with the aid of up to 10 secondary casters. Each secondary caster must tattoo themself with their own tattoo and pay the full ritual cost to participate. Creatures currently held captive in the prison have a special relationship with the ritual: for each month they spend drawing memories of home on the walls of their cell, they can reduce the total cost of the ritual by 50 gp.',
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						'The target and primary and secondary casters all gain the ability to leave Stormholt. To do so, they must leave the prison by swimming through the water or by riding in a vessel that is in contact with the water (such as a rowboat). When they reach the great whirlpool, they are pulled under as normal, but instead of being transported to the Flotsam Graveyard in Absalom, they are immediately transported (as teleport) to a location in Absalom of their choice. They also gain the benefits of water walk, water breathing, and resistance to electricity 10 for the duration of the ritual.',
					Success:
						"As critical success, except the affected creatures don't gain the benefits of water walk and water breathing.",
					Failure: 'You create the tattoo but fail to imbue it with magic.',
					'Critical Failure':
						'As failure, but the tattoo also creates an unwholesome bond with the demiplane of Stormholt. For 24 hours, the target and the primary and secondary casters gain a fishlike appearance and are covered in a slimy membrane. They gain the ability to breathe both water and air, but their skin quickly dries out when on land. After 1 hour on land they become {@condition drained|CRB|drained 1} and {@condition fatigued}, conditions that can be removed only if they reenter water. Additionally, the membrane conducts electricity well, causing them to gain weakness 10 to electricity.',
				},
			},
		],
	},
	{
		name: 'Unseen Custodians',
		source: 'APG',
		page: 245,
		level: 2,
		traits: ['uncommon', 'conjuration'],
		cast: {
			number: 1,
			unit: 'day',
		},
		cost: 'rare oils, salts, and herbs worth a total value of 15 gp',
		secondaryCasters: {
			number: 2,
		},
		primaryCheck: {
			entry: '{@skill Arcana} or {@skill Occultism} (expert)',
			skills: ['Arcana', 'Occultism'],
			prof: 'expert',
		},
		secondaryCheck: {
			entry: "{@skill Arcana}, {@skill Occultism} (whichever isn't used for the primary check), {@skill Diplomacy}",
			skills: ['Arcana', 'Occultism', 'Diplomacy'],
		},
		area: {
			types: ['Misc.'],
			entry: '100 feet × 100 feet, up to 20 feet high',
		},
		duration: {
			number: 1,
			unit: 'year',
		},
		entries: [
			'You create a site-bound, long-lasting {@spell unseen servant} spell effect, forming entities of pure force to carry out basic tasks at a fixed location.',
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						"The ritual creates six unseen servant. You don't need to concentrate on them, and they aren't {@trait summoned} {@trait minion|crb|minions}. You can spend an action, which has the {@trait concentrate} trait, to command one to perform a basic task; it continues to perform the task until commanded again.",
					Success: 'As critical success, but the ritual creates three unseen servants.',
					Failure: 'The ritual fails to create any servants.',
					'Critical Failure':
						'The ritual creates six unseen servants, but these creatures are {@condition hostile} and capable of making fist {@action Strike|CRB|Strikes} with an attack bonus equal to your skill modifier for the primary skill check, dealing {@dice 1d6} force damage. They attack you and your allies and attempt to break objects belonging to you and your allies within the area.',
				},
			},
		],
		heightened: {
			X: {
				'6': [
					'If destroyed, the unseen servants reform the next morning. The cost increases to 30 gp.',
				],
			},
		},
	},
	{
		name: 'Ward Domain',
		source: 'APG',
		page: 245,
		level: 6,
		traits: ['uncommon', 'abjuration'],
		cast: {
			number: 1,
			unit: 'day',
		},
		cost: 'rare incenses, oils, and powdered silver, worth 150 gp total',
		secondaryCasters: {
			number: 3,
		},
		primaryCheck: {
			entry: '{@skill Arcana}, {@skill Nature}, or {@skill Occultism} (master)',
			skills: ['Occultism', 'Arcana', 'Nature'],
			prof: 'master',
		},
		secondaryCheck: {
			entry: '{@skill Lore} (any), {@skill Survival}, {@skill Thievery}',
			skills: ['Lore', 'Survival', 'Thievery'],
		},
		area: {
			entry: '100 feet × 100 feet, up to 50 feet high',
			types: ['Misc.'],
		},
		duration: {
			number: 1,
			unit: 'week',
		},
		entries: [
			'This ritual has long been used to guard the private sanctums of powerful rulers, spellcasters, and other figures of import. You and the other casters spend the casting time burning incense, anointing doorframes, and drawing lines of powered silver across entryways. The ritual creates the following magical effects within the area; these effects are heightened to the level of {@i ward domain} and remain throughout the duration.',
			"All gates, doors, windows, and similar apertures in the area (if any) are locked, with the effects of lock. In addition, you can obscure up to six doors, doorways, or similar entrances within the area with the effects of illusory object to appear as plain walls. Scrying spells can't perceive any stimuli from the area, and {@i ward domain} attempts to counteract teleportation effects into or out of the area, including attempts to summon creatures into the area, using a modifier equal to the ritual's save DC \u2013 10.",
			'A successful {@spell dispel magic} used on a specific effect removes only that effect (such as the {@spell lock} effect on one window). A successful {@spell disjunction} ends the entire ritual.',
			{
				type: 'successDegree',
				entries: {
					'Critical Success':
						'You create the effects described above, and you protect an area twice as large.',
					Success: 'You create the effects described above.',
					Failure: 'The ritual has no effect.',
					'Critical Failure':
						"The area becomes trapped and {@condition hostile} to you and your allies in a way you didn't anticipate.",
				},
			},
		],
		heightened: {
			plusX: {
				'1': [
					'The ward covers an additional area 100 feet × 100 feet, up to 50 feet high, which must be contiguous with the original area.',
				],
			},
		},
	},
	{
		name: 'Word of Recall',
		source: 'APG',
		page: 245,
		level: 7,
		traits: ['rare', 'conjuration', 'teleportation'],
		cast: {
			number: 7,
			unit: 'day',
		},
		cost: 'rare oils and powdered minerals worth 5,000 gp',
		secondaryCasters: {
			number: 2,
		},
		primaryCheck: {
			entry: '{@skill Arcana} or {@skill Occultism} (expert, the check has the {@trait secret} trait)',
			skills: ['Occultism', 'Arcana'],
			prof: 'expert',
		},
		secondaryCheck: {
			entry: "{@skill Arcana} or {@skill Occultism} (whichever isn't used for the primary check), {@skill Society}",
			skills: ['Arcana', 'Occultism', 'Society'],
		},
		range: {
			entry: '20 feet',
			distance: {
				amount: 20,
				type: 'feet',
			},
		},
		targets: 'Up to seven willing creatures of 14th level or lower',
		duration: {
			number: 1,
			unit: 'year',
		},
		entries: [
			'You bind yourself and your allies to the specific safe location where you perform the ritual. This allows the participants to return later by simply speaking a word.',
			{
				type: 'successDegree',
				entries: {
					Success:
						'You form the connection with the designated sanctuary. Any participant in the ritual can spend a single action, which has the {@trait concentrate} trait, to utter a word of power you choose when you cast the spell. When they do, all the participants can immediately return to the sanctuary from any distance, as long as they are on the same plane as the sanctuary. Each participant arrives in the position in which they were standing during the casting of the ritual. When the word is spoken, all other participants know it, and each can choose whether or not to return to the sanctuary at that time. The ritual then immediately ends.',
					Failure:
						'You fail to form the connection between the participants and the sanctuary and are aware that the ritual has failed.',
					'Critical Failure':
						'The ritual inadvertently forms a connection with a location on another plane. The casters are unaware of this misalignment. When the word is invoked, all ritual participants are shifted to this extraplanar location.',
				},
			},
		],
		heightened: {
			plusX: {
				'1': [
					'The cost increases by 5,000 gp, the ritual can target one more creature, and the maximum level of creature it can target increases by 2.',
				],
			},
		},
	},
];
