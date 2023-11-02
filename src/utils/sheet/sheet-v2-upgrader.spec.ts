import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
	ActionV1,
	ModifierV1,
	RollV1,
	SheetAdjustmentV1,
	SheetV1,
	zCharacterV1,
} from './character.v1.zod.js';
import {
	upgradeAction,
	upgradeModifier,
	upgradeRoll,
	upgradeSheet,
	upgradeSheetAdjustment,
} from './sheet-v2-upgrader.js';
import {
	AbilityEnum,
	Action,
	ActionCostEnum,
	ActionTypeEnum,
	AdjustablePropertyEnum,
	AttackOrSkillRoll,
	ModifierTypeEnum,
	RollTypeEnum,
	SaveRoll,
	Sheet,
	SheetAdjustmentOperationEnum,
	SheetAdjustmentTypeEnum,
	TextRoll,
	zSheet,
} from '../../services/kobold/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const csv = readFileSync(join(__dirname, 'character_rows.csv'));
const records = parse(csv, {
	columns: true,
	skip_empty_lines: true,
}) as {
	[k: string]: any;
	sheet: string;
	name: string;
	import_source: string;
	attributes: string;
	custom_attributes: string;
	modifiers: string;
	actions: string;
	custom_actions: string;
	tracker_message_id: string;
	tracker_channel_id: string;
	tracker_guild_id: string;
	tracker_mode: string;
	roll_macros: string;
	user_id: string;
	char_id: string;
	is_active_character: string;
	character_data: string;
	calculated_stats: string;
	created_at: string;
	last_updated_at: string;
	id: string;
}[];

function parseOldCharacterData(data: any) {
	const asCharacter = {
		sheet: JSON.parse(data.sheet),
		name: data.name,
		importSource: data.import_source,
		attributes: JSON.parse(data.attributes),
		customAttributes: JSON.parse(data.custom_attributes),
		modifiers: JSON.parse(data.modifiers),
		actions: JSON.parse(data.actions),
		customActions: JSON.parse(data.custom_actions),
		trackerMessageId: data.tracker_message_id,
		trackerChannelId: data.tracker_channel_id,
		trackerGuildId: data.tracker_guild_id,
		trackerMode: data.tracker_mode,
		rollMacros: JSON.parse(data.roll_macros),
		userId: data.user_id,
		charId: Number(data.char_id),
		isActiveCharacter: data.is_active_character.toLowerCase() == 'true',
		characterData: JSON.parse(data.character_data),
		calculatedStats: JSON.parse(data.calculated_stats),
		createdAt: new Date(data.created_at).toISOString(),
		lastUpdatedAt: new Date(data.last_updated_at).toISOString(),
		id: Number(data.id),
	};
	const parsed = zCharacterV1.safeParse(asCharacter);
	if (!parsed.success) {
		console.dir(asCharacter, { depth: null });
		console.dir(parsed.error.format(), { depth: null });
		throw new Error();
	}
	return parsed.data;
}

test('character.v1.zod', () => {
	//it parses old character data properly
	expect(() => {
		for (const record of records) {
			const parsed = parseOldCharacterData(record);
		}
	}).not.toThrow();
});

test('all old sheets are upgraded without error', () => {
	expect(() => {
		for (const record of records) {
			const parsed = parseOldCharacterData(record);
			const upgraded = upgradeSheet(parsed.sheet);
			zSheet.parse(upgraded);
		}
	}).not.toThrow();
});

describe('sheet-v2-upgrader', () => {
	describe('upgradeRoll', () => {
		it('should upgrade an attack roll', () => {
			const roll: RollV1 = {
				name: 'Attack',
				type: RollTypeEnum.attack,
				allowRollModifiers: true,
				targetDC: '10',
				roll: '1d20',
			};
			const upgradedRoll = upgradeRoll(roll);
			expect(upgradedRoll).toEqual({
				name: 'Attack',
				type: RollTypeEnum.attack,
				allowRollModifiers: true,
				targetDC: '10',
				roll: '1d20',
			} as AttackOrSkillRoll);
		});

		it('should upgrade a save roll', () => {
			const roll: RollV1 = {
				name: 'Save',
				type: RollTypeEnum.save,
				allowRollModifiers: true,
				saveRollType: 'Fortitude',
				saveTargetDC: '15',
			};
			const upgradedRoll = upgradeRoll(roll);
			expect(upgradedRoll).toEqual({
				name: 'Save',
				type: RollTypeEnum.save,
				allowRollModifiers: true,
				saveRollType: 'Fortitude',
				saveTargetDC: '15',
			} as SaveRoll);
		});

		it('should upgrade a text roll', () => {
			const roll: RollV1 = {
				name: 'Text',
				type: RollTypeEnum.text,
				allowRollModifiers: true,
				defaultText: 'Hello, world!',
				extraTags: ['foo', 'bar'],
			};
			const upgradedRoll = upgradeRoll(roll);
			expect(upgradedRoll).toEqual({
				name: 'Text',
				type: RollTypeEnum.text,
				allowRollModifiers: true,
				criticalFailureText: null,
				criticalSuccessText: null,
				failureText: null,
				successText: null,
				defaultText: 'Hello, world!',
				extraTags: ['foo', 'bar'],
			} as TextRoll);
		});

		it('should throw an error for an invalid roll type', () => {
			const roll: any = {
				name: 'Invalid',
				type: 'invalid',
				allowRollModifiers: true,
			};
			expect(() => upgradeRoll(roll)).toThrow();
		});
	});

	describe('upgradeAction', () => {
		it('should upgrade an action', () => {
			const actionV1: ActionV1 = {
				name: 'Test Action',
				description: 'This is a test action',
				type: 'Test Type',
				actionCost: 'Test Cost',
				baseLevel: 1,
				autoHeighten: true,
				tags: ['test', 'action'],
				rolls: [
					{
						name: 'Test Roll',
						type: 'attack',
						allowRollModifiers: true,
						roll: '1d20',
						targetDC: '10',
					},
				],
			};
			const expectedActionV2: Action = {
				name: 'Test Action',
				description: 'This is a test action',
				type: ActionTypeEnum.other,
				actionCost: ActionCostEnum.none,
				baseLevel: 1,
				autoHeighten: true,
				tags: ['test', 'action'],
				rolls: [
					{
						name: 'Test Roll',
						type: RollTypeEnum.attack,
						allowRollModifiers: true,
						roll: '1d20',
						targetDC: '10',
					},
				],
			};
			const upgradedAction = upgradeAction(actionV1);
			expect(upgradedAction).toEqual(expectedActionV2);
			actionV1.type = 'attack';
			actionV1.actionCost = 'twoActions';
			const upgradedAction2 = upgradeAction(actionV1);
			expect(upgradedAction2).toEqual({
				...expectedActionV2,
				type: ActionTypeEnum.attack,
				actionCost: ActionCostEnum.twoActions,
			});
		});

		it('should throw an error for an invalid action', () => {
			const invalidAction: any = {
				name: 'Test Action',
				description: 'This is a test action',
				type: 'Test Type',
				rolls: [],
			};
			expect(() => upgradeAction(invalidAction)).toThrow();
		});
	});

	describe('upgradeSheetAdjustment', () => {
		it('should upgrade a sheet adjustment', () => {
			const sheetAdjustmentV1: SheetAdjustmentV1 = {
				value: '10',
				property: 'age',
				operation: '+',
			};
			const expectedSheetAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				value: '10',
				property: 'age',
				operation: SheetAdjustmentOperationEnum['+'],
				propertyType: AdjustablePropertyEnum.info,
			};
			const upgradedSheetAdjustment = upgradeSheetAdjustment(sheetAdjustmentV1);
			expect(upgradedSheetAdjustment).toEqual(expectedSheetAdjustment);
		});

		it('should throw an error for an invalid sheet adjustment', () => {
			const invalidSheetAdjustment: any = {
				value: '10',
				operation: '+',
			};
			expect(() => upgradeSheetAdjustment(invalidSheetAdjustment)).toThrow();
		});
	});

	describe('upgradeModifier', () => {
		it('should upgrade a roll modifier', () => {
			const modifierV1: ModifierV1 = {
				name: 'Test Modifier',
				isActive: true,
				description: 'This is a test modifier',
				type: 'Test Type',
				modifierType: ModifierTypeEnum.roll,
				value: '10',
				targetTags: 'test',
			};
			const expectedModifier = {
				modifierType: ModifierTypeEnum.roll,
				name: 'Test Modifier',
				isActive: true,
				description: 'This is a test modifier',
				type: SheetAdjustmentTypeEnum.untyped,
				value: '10',
				targetTags: 'test',
			};
			const upgradedModifier = upgradeModifier(modifierV1);
			expect(upgradedModifier).toEqual(expectedModifier);
		});

		it('should upgrade a sheet modifier', () => {
			const modifierV1: ModifierV1 = {
				name: 'Test Modifier',
				isActive: true,
				description: 'This is a test modifier',
				type: 'Test Type',
				modifierType: ModifierTypeEnum.sheet,
				sheetAdjustments: [],
			};
			const expectedModifier = {
				modifierType: ModifierTypeEnum.sheet,
				name: 'Test Modifier',
				isActive: true,
				description: 'This is a test modifier',
				type: SheetAdjustmentTypeEnum.untyped,
				sheetAdjustments: [],
			};
			const upgradedModifier = upgradeModifier(modifierV1);
			expect(upgradedModifier).toEqual(expectedModifier);
		});

		it('should throw an error for an invalid modifier', () => {
			const invalidModifier: any = {
				name: 'Test Modifier',
				isActive: true,
				description: 'This is a test modifier',
				type: 'Test Type',
				modifierType: 'invalid',
			};
			expect(() => upgradeModifier(invalidModifier)).toThrow();
		});
	});

	describe('upgradeSheet', () => {
		it('should upgrade a SheetV1 to a Sheet', () => {
			const sheetV1: SheetV1 = {
				info: {
					name: 'John Doe',
					url: 'http://example.com',
					description: 'Test character',
					gender: 'Male',
					age: 30,
					alignment: 'Neutral',
					deity: 'Aphrodite',
					imageURL: 'http://example.com/image.jpg',
					level: 1,
					size: 'Medium',
					class: 'Warrior',
					keyability: 'Strength',
					ancestry: 'Human',
					heritage: 'City-born',
					background: 'Soldier',
					traits: ['Human', 'City-born'],
					usesStamina: true,
				},
				abilities: {
					strength: 15,
					dexterity: 14,
					constitution: 13,
					intelligence: 12,
					wisdom: 10,
					charisma: 8,
				},
				general: {
					currentHeroPoints: 1,
					speed: 30,
					flySpeed: 0,
					swimSpeed: 0,
					climbSpeed: 0,
					currentFocusPoints: 1,
					focusPoints: 1,
					classDC: 15,
					classAttack: 5,
					perception: 2,
					perceptionProfMod: 4,
					languages: ['Common', 'Elven'],
					senses: ['Normal'],
				},
				defenses: {
					currentHp: 12,
					maxHp: 12,
					tempHp: 0,
					currentResolve: 1,
					maxResolve: 1,
					currentStamina: 1,
					maxStamina: 1,
					immunities: [],
					resistances: [],
					weaknesses: [],
					ac: 15,
					heavyProfMod: 2,
					mediumProfMod: 4,
					lightProfMod: 6,
					unarmoredProfMod: 2,
				},
				offense: {
					martialProfMod: 4,
					simpleProfMod: 2,
					unarmedProfMod: 6,
					advancedProfMod: 2,
				},
				castingStats: {
					arcaneAttack: 2,
					arcaneDC: 12,
					arcaneProfMod: 4,
					divineAttack: 2,
					divineDC: 12,
					divineProfMod: 6,
					occultAttack: 2,
					occultDC: null,
					occultProfMod: 2,
					primalAttack: null,
					primalDC: null,
					primalProfMod: 4,
				},
				saves: {
					fortitude: 2,
					fortitudeProfMod: 4,
					reflex: 2,
					reflexProfMod: 6,
					will: 2,
					willProfMod: 2,
				},
				skills: {
					acrobatics: 2,
					acrobaticsProfMod: 4,
					arcana: 2,
					arcanaProfMod: 6,
					athletics: 2,
					athleticsProfMod: 2,
					crafting: 2,
					craftingProfMod: 4,
					deception: 2,
					deceptionProfMod: 6,
					diplomacy: 2,
					diplomacyProfMod: 2,
					intimidation: null,
					intimidationProfMod: 4,
					medicine: 2,
					medicineProfMod: 6,
					nature: 2,
					natureProfMod: 2,
					occultism: 2,
					occultismProfMod: 4,
					performance: 2,
					performanceProfMod: 6,
					religion: 2,
					religionProfMod: 2,
					society: null,
					societyProfMod: 4,
					stealth: null,
					stealthProfMod: 6,
					survival: 2,
					survivalProfMod: 2,
					thievery: 2,
					thieveryProfMod: 4,
					lores: [{ name: 'Warfare Lore', bonus: 5, profMod: 2 }],
				},
				attacks: [
					{
						name: "Dragon's Breath",
						toHit: 5,
						damage: [
							{
								dice: '2d6',
								type: 'fire',
							},
						],
						range: '30 ft',
						traits: ['fire', 'breath weapon'],
						notes: 'Can be used once every 3 rounds',
					},
				],
				sourceData: {},
				modifiers: [],
				actions: [],
				rollMacros: [],
			};
			sheetV1.attacks;

			const expectedSheet: Sheet = {
				staticInfo: { name: 'John Doe', level: 1, usesStamina: true, keyAbility: null },
				info: {
					url: 'http://example.com',
					description: 'Test character',
					gender: 'Male',
					age: '30',
					alignment: 'Neutral',
					deity: 'Aphrodite',
					imageURL: 'http://example.com/image.jpg',
					size: 'Medium',
					class: 'Warrior',
					ancestry: 'Human',
					heritage: 'City-born',
					background: 'Soldier',
				},
				infoLists: {
					traits: ['Human', 'City-born'],
					senses: ['Normal'],
					languages: ['Common', 'Elven'],
					immunities: [],
				},
				weaknessesResistances: { resistances: [], weaknesses: [] },
				intProperties: {
					ac: 15,
					strength: 2,
					dexterity: 2,
					constitution: 1,
					intelligence: 1,
					wisdom: 0,
					charisma: -1,
					walkSpeed: 30,
					flySpeed: 0,
					swimSpeed: 0,
					climbSpeed: 0,
					burrowSpeed: null,
					dimensionalSpeed: null,
					heavyProficiency: 2,
					mediumProficiency: 4,
					lightProficiency: 6,
					unarmoredProficiency: 2,
					martialProficiency: 4,
					simpleProficiency: 2,
					unarmedProficiency: 6,
					advancedProficiency: 2,
				},
				baseCounters: {
					heroPoints: {
						name: 'Hero Points',
						style: 'default',
						current: 1,
						max: 3,
						recoverable: false,
					},
					focusPoints: {
						name: 'Focus Points',
						style: 'default',
						current: 1,
						max: 1,
						recoverable: false,
					},
					hp: {
						name: 'HP',
						style: 'default',
						current: 12,
						max: 12,
						recoverable: true,
					},
					tempHp: {
						name: 'Temp HP',
						style: 'default',
						current: 0,
						max: null,
						recoverable: true,
					},
					resolve: {
						name: 'Resolve',
						style: 'default',
						current: 1,
						max: 1,
						recoverable: true,
					},
					stamina: {
						name: 'Stamina',
						style: 'default',
						current: 1,
						max: 1,
						recoverable: true,
					},
				},
				stats: {
					perception: {
						name: 'Perception',
						bonus: 2,
						dc: 12,
						proficiency: 4,
						ability: AbilityEnum.wisdom,
						note: null,
					},
					class: {
						name: 'Class',
						bonus: 5,
						dc: 15,
						proficiency: null,
						ability: null,
						note: null,
					},
					arcane: {
						name: 'Arcane',
						bonus: 2,
						dc: 12,
						proficiency: 4,
						ability: null,
						note: null,
					},
					divine: {
						name: 'Divine',
						bonus: 2,
						dc: 12,
						proficiency: 6,
						ability: null,
						note: null,
					},
					occult: {
						name: 'Occult',
						bonus: 2,
						dc: 12,
						proficiency: 2,
						ability: null,
						note: null,
					},
					primal: {
						name: 'Primal',
						bonus: null,
						dc: null,
						proficiency: 4,
						ability: null,
						note: null,
					},
					fortitude: {
						name: 'Fortitude',
						bonus: 2,
						dc: 12,
						proficiency: 4,
						ability: AbilityEnum.constitution,
						note: null,
					},
					reflex: {
						name: 'Reflex',
						bonus: 2,
						dc: 12,
						proficiency: 6,
						ability: AbilityEnum.dexterity,
						note: null,
					},
					will: {
						name: 'Will',
						bonus: 2,
						dc: 12,
						proficiency: 2,
						ability: AbilityEnum.wisdom,
						note: null,
					},
					acrobatics: {
						name: 'Acrobatics',
						bonus: 2,
						dc: 12,
						proficiency: 4,
						ability: AbilityEnum.dexterity,
						note: null,
					},
					arcana: {
						name: 'Arcana',
						bonus: 2,
						dc: 12,
						proficiency: 6,
						ability: AbilityEnum.intelligence,
						note: null,
					},
					athletics: {
						name: 'Athletics',
						bonus: 2,
						dc: 12,
						proficiency: 2,
						ability: AbilityEnum.strength,
						note: null,
					},
					crafting: {
						name: 'Crafting',
						bonus: 2,
						dc: 12,
						proficiency: 4,
						ability: AbilityEnum.intelligence,
						note: null,
					},
					deception: {
						name: 'Deception',
						bonus: 2,
						dc: 12,
						proficiency: 6,
						ability: AbilityEnum.charisma,
						note: null,
					},
					diplomacy: {
						name: 'Diplomacy',
						bonus: 2,
						dc: 12,
						proficiency: 2,
						ability: AbilityEnum.charisma,
						note: null,
					},
					intimidation: {
						name: 'Intimidation',
						bonus: 4,
						dc: 14,
						proficiency: 4,
						ability: AbilityEnum.charisma,
						note: null,
					},
					medicine: {
						name: 'Medicine',
						bonus: 2,
						dc: 12,
						proficiency: 6,
						ability: AbilityEnum.wisdom,
						note: null,
					},
					nature: {
						name: 'Nature',
						bonus: 2,
						dc: 12,
						proficiency: 2,
						ability: AbilityEnum.wisdom,
						note: null,
					},
					occultism: {
						name: 'Occultism',
						bonus: 2,
						dc: 12,
						proficiency: 4,
						ability: AbilityEnum.intelligence,
						note: null,
					},
					performance: {
						name: 'Performance',
						bonus: 2,
						dc: 12,
						proficiency: 6,
						ability: AbilityEnum.charisma,
						note: null,
					},
					religion: {
						name: 'Religion',
						bonus: 2,
						dc: 12,
						proficiency: 2,
						ability: AbilityEnum.wisdom,
						note: null,
					},
					society: {
						name: 'Society',
						bonus: 6,
						dc: 16,
						proficiency: 4,
						ability: AbilityEnum.intelligence,
						note: null,
					},
					stealth: {
						name: 'Stealth',
						bonus: 9,
						dc: 19,
						proficiency: 6,
						ability: AbilityEnum.dexterity,
						note: null,
					},
					survival: {
						name: 'Survival',
						bonus: 2,
						dc: 12,
						proficiency: 2,
						ability: AbilityEnum.wisdom,
						note: null,
					},
					thievery: {
						name: 'Thievery',
						bonus: 2,
						dc: 12,
						proficiency: 4,
						ability: AbilityEnum.dexterity,
						note: null,
					},
				},
				additionalSkills: [
					{
						name: 'Warfare Lore',
						bonus: 5,
						dc: 15,
						proficiency: 2,
						ability: AbilityEnum.intelligence,
						note: null,
					},
				],
				attacks: [
					{
						name: "Dragon's Breath",
						toHit: 5,
						damage: [{ dice: '2d6', type: 'fire' }],
						range: '30 ft',
						traits: ['fire', 'breath weapon'],
						notes: 'Can be used once every 3 rounds',
					},
				],
				rollMacros: [],
				actions: [],
				modifiers: [],
				sourceData: {},
			};

			const result = upgradeSheet(sheetV1);

			expect(result).toEqual(expectedSheet);
		});
	});
});
