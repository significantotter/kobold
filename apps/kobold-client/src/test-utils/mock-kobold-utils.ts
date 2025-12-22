/**
 * Mock utilities for KoboldUtils and related services.
 *
 * These helpers reduce boilerplate when mocking the common patterns
 * used across command integration tests.
 */
import { vi, type MockInstance } from 'vitest';
import { fake } from 'zod-schema-faker/v4';

import {
	CharacterWithRelations,
	zCharacterWithRelations,
	zSheetRecord,
	Action,
	ActionTypeEnum,
	ActionCostEnum,
	RollTypeEnum,
	type Roll,
	type AttackOrSkillRoll,
	type DamageRoll,
	type AdvancedDamageRoll,
	type SaveRoll,
	type TextRoll,
	type Modifier,
	type SheetRecord,
	SheetAdjustmentTypeEnum,
	UserSettings,
	type InitiativeWithRelations,
	type InitiativeActorWithRelations,
	type InitiativeActorGroupWithRelations,
	type NumericCounter,
	type CounterGroup,
	type DotsCounter,
	type PreparedCounter,
	CounterStyleEnum,
} from '@kobold/db';
import { SheetProperties } from '../utils/sheet/sheet-properties.js';
import { KoboldUtils, InjectedData } from '../utils/kobold-service-utils/kobold-utils.js';
import { FinderHelpers } from '../utils/kobold-helpers/finder-helpers.js';

/**
 * Deep partial type utility for creating mock objects with only the needed properties.
 */
type DeepPartial<T> = T extends object
	? {
			[P in keyof T]?: DeepPartial<T[P]>;
	  }
	: T;

/**
 * Type for partial KoboldUtils mock implementations.
 * Used when mocking the constructor to return only the needed properties.
 */
type PartialKoboldUtils = DeepPartial<KoboldUtils>;

/**
 * Type for partial InjectedData mock implementations.
 * Used when mocking fetchDataForCommand or fetchNonNullableDataForCommand.
 */
type PartialInjectedData = Partial<InjectedData>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MockReturnValue = any;

/**
 * Options for configuring mock character behavior
 */
export interface MockCharacterOptions {
	/** Pre-configured actions on the character's sheet */
	actions?: Action[];
	/** Custom character overrides */
	characterOverrides?: Partial<CharacterWithRelations>;
}

/**
 * Creates a mock character with optional customizations.
 * Uses zod-mock for realistic data generation.
 */
export function createMockCharacter(options: MockCharacterOptions = {}): CharacterWithRelations {
	const { actions = [], characterOverrides = {} } = options;

	const mockCharacter = fake(zCharacterWithRelations);
	mockCharacter.sheetRecord.actions = actions;
	// Explicitly set tracker fields to null to avoid triggering Discord API calls in tests
	mockCharacter.sheetRecord.trackerGuildId = null;
	mockCharacter.sheetRecord.trackerChannelId = null;
	mockCharacter.sheetRecord.trackerMessageId = null;

	return { ...mockCharacter, ...characterOverrides };
}

/**
 * Helper functions for creating properly typed roll objects for tests.
 */
export function createAttackRoll(overrides: Partial<AttackOrSkillRoll> = {}): AttackOrSkillRoll {
	return {
		name: 'Attack',
		type: RollTypeEnum.attack,
		roll: '1d20+10',
		allowRollModifiers: false,
		targetDC: null,
		...overrides,
	};
}

export function createSkillChallengeRoll(
	overrides: Partial<AttackOrSkillRoll> = {}
): AttackOrSkillRoll {
	return {
		name: 'Skill Check',
		type: RollTypeEnum.skillChallenge,
		roll: '1d20+10',
		allowRollModifiers: false,
		targetDC: null,
		...overrides,
	};
}

export function createDamageRoll(overrides: Partial<DamageRoll> = {}): DamageRoll {
	return {
		name: 'Damage',
		type: RollTypeEnum.damage,
		roll: '2d6+4',
		allowRollModifiers: false,
		damageType: null,
		healInsteadOfDamage: false,
		...overrides,
	};
}

export function createAdvancedDamageRoll(
	overrides: Partial<AdvancedDamageRoll> = {}
): AdvancedDamageRoll {
	return {
		name: 'Advanced Damage',
		type: RollTypeEnum.advancedDamage,
		allowRollModifiers: false,
		damageType: null,
		healInsteadOfDamage: false,
		criticalSuccessRoll: null,
		criticalFailureRoll: null,
		successRoll: null,
		failureRoll: null,
		...overrides,
	};
}

export function createSaveRoll(overrides: Partial<SaveRoll> = {}): SaveRoll {
	return {
		name: 'Save',
		type: RollTypeEnum.save,
		allowRollModifiers: false,
		saveRollType: null,
		saveTargetDC: null,
		...overrides,
	};
}

export function createTextRoll(overrides: Partial<TextRoll> = {}): TextRoll {
	return {
		name: 'Text',
		type: RollTypeEnum.text,
		allowRollModifiers: false,
		defaultText: null,
		criticalSuccessText: null,
		criticalFailureText: null,
		successText: null,
		failureText: null,
		extraTags: [],
		...overrides,
	};
}

/**
 * Creates a standard mock action with sensible defaults.
 */
export function createMockAction(overrides: Partial<Action> = {}): Action {
	return {
		name: 'Test Action',
		description: 'A test action description',
		type: ActionTypeEnum.attack,
		actionCost: ActionCostEnum.oneAction,
		baseLevel: null,
		autoHeighten: false,
		rolls: [],
		tags: [],
		...overrides,
	};
}

/**
 * Result from setting up KoboldUtils mocks
 */
export interface KoboldUtilsMockSetup {
	/** Mock for fetchDataForCommand (nullable data) */
	fetchDataMock: MockInstance;
	/** Mock for fetchNonNullableDataForCommand */
	fetchNonNullableDataMock: MockInstance;
	/** Mock for characterUtils.getActiveCharacter */
	getActiveCharacterMock: MockInstance;
	/** The mock character being used */
	mockCharacter: CharacterWithRelations;
}

/**
 * Sets up KoboldUtils mocks for command execution tests.
 *
 * This handles the common pattern of:
 * - Mocking fetchNonNullableDataForCommand to return an active character
 *
 * @example
 * ```typescript
 * const { mockCharacter } = setupKoboldUtilsMocks({
 *   actions: [createMockAction({ name: 'Strike' })]
 * });
 * ```
 */
export function setupKoboldUtilsMocks(options: MockCharacterOptions = {}): KoboldUtilsMockSetup {
	const mockCharacter = createMockCharacter(options);

	const fetchDataMock = vi.fn(
		async () =>
			({
				activeCharacter: mockCharacter,
			} as MockReturnValue)
	);

	const fetchNonNullableDataMock = vi.fn(
		async () =>
			({
				activeCharacter: mockCharacter,
				userSettings: undefined,
			} as MockReturnValue)
	);

	const getActiveCharacterMock = vi.fn(async () => mockCharacter);

	vi.mocked(KoboldUtils).mockImplementation(function (this: any) {
		this.fetchNonNullableDataForCommand = fetchNonNullableDataMock;
		this.fetchDataForCommand = fetchDataMock;
		this.assertActiveCharacterNotNull = vi.fn(() => {});
		this.characterUtils = {
			getActiveCharacter: getActiveCharacterMock,
		};
		return this;
	} as MockReturnValue);

	return {
		fetchDataMock,
		fetchNonNullableDataMock,
		getActiveCharacterMock,
		mockCharacter,
	};
}

/**
 * Sets up KoboldUtils mocks specifically for autocomplete tests.
 *
 * Uses vi.mocked(KoboldUtils).mockImplementation() to mock the constructor,
 * which is the proper pattern for mocking instance properties that are created
 * in the constructor.
 *
 * @example
 * ```typescript
 * const { mockCharacter } = setupAutocompleteKoboldMocks();
 * vi.spyOn(FinderHelpers, 'matchAllActions').mockReturnValue([...]);
 * ```
 */
export function setupAutocompleteKoboldMocks(
	options: MockCharacterOptions & { noActiveCharacter?: boolean } = {}
): KoboldUtilsMockSetup {
	const { noActiveCharacter = false, ...characterOptions } = options;
	const mockCharacter = createMockCharacter(characterOptions);

	const getActiveCharacterMock = vi
		.fn()
		.mockResolvedValue(noActiveCharacter ? null : mockCharacter);

	const fetchDataMock = vi.fn(async () => ({
		activeCharacter: noActiveCharacter ? undefined : mockCharacter,
	}));

	const fetchNonNullableDataMock = vi.fn(async () => ({
		activeCharacter: mockCharacter,
	}));

	vi.mocked(KoboldUtils).mockImplementation(function (this: any) {
		this.fetchNonNullableDataForCommand = fetchNonNullableDataMock;
		this.fetchDataForCommand = fetchDataMock;
		this.characterUtils = {
			getActiveCharacter: getActiveCharacterMock,
		};
		return this;
	} as MockReturnValue);

	return {
		fetchDataMock,
		fetchNonNullableDataMock,
		getActiveCharacterMock,
		mockCharacter,
	};
}

/**
 * Sets up FinderHelpers mocks for action-related tests.
 */
export interface FinderHelpersMockSetup {
	getActionByNameMock: MockInstance;
	matchAllActionsMock: MockInstance;
}

/**
 * Sets up FinderHelpers mocks with common configurations.
 *
 * @param foundAction - The action to return from getActionByName, or undefined for "not found"
 * @param matchedActions - Actions to return from matchAllActions for autocomplete
 */
export function setupFinderHelpersMocks(
	foundAction?: Action,
	matchedActions: Action[] = []
): FinderHelpersMockSetup {
	const getActionByNameMock = vi
		.spyOn(FinderHelpers, 'getActionByName')
		.mockReturnValue(foundAction);

	const matchAllActionsMock = vi
		.spyOn(FinderHelpers, 'matchAllActions')
		.mockReturnValue(matchedActions);

	return {
		getActionByNameMock,
		matchAllActionsMock,
	};
}

/**
 * Result from setting up sheetRecord update mock
 */
export interface SheetRecordUpdateMockSetup {
	/** Mock for vitestKobold.sheetRecord.update */
	updateMock: MockInstance;
}

/**
 * Sets up the vitestKobold.sheetRecord.update mock commonly used in action tests.
 *
 * Many action commands update the sheet record after modifying rolls.
 * This helper standardizes that mock setup.
 *
 * @param vitestKobold - The vitestKobold instance from @kobold/db/test-utils
 * @returns The mock for further assertions if needed
 *
 * @example
 * ```typescript
 * const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);
 * // ... execute command ...
 * expect(updateMock).toHaveBeenCalled();
 * ```
 */
export function setupSheetRecordUpdateMock(vitestKobold: {
	sheetRecord: { update: (...args: any[]) => any };
}): SheetRecordUpdateMockSetup {
	const updateMock = vi
		.spyOn(vitestKobold.sheetRecord, 'update')
		.mockResolvedValue(fake(zSheetRecord));

	return { updateMock };
}

/**
 * Result from setting up character utils mocks for character commands
 */
export interface CharacterUtilsMockSetup {
	/** Mock for findOwnedCharacterByName */
	findOwnedCharacterMock: MockInstance;
	/** The mock characters being returned */
	mockCharacters: CharacterWithRelations[];
}

/**
 * Sets up KoboldUtils mocks specifically for character subcommands that use
 * characterUtils.findOwnedCharacterByName.
 *
 * Uses vi.mocked(KoboldUtils).mockImplementation() to mock the constructor,
 * which is the proper pattern for mocking instance properties.
 *
 * @param characters - Characters to return from findOwnedCharacterByName
 *
 * @example
 * ```typescript
 * const { findOwnedCharacterMock, mockCharacters } = setupCharacterUtilsMocks([
 *   createMockCharacter({ characterOverrides: { name: 'Fighter' } }),
 * ]);
 * ```
 */
export function setupCharacterUtilsMocks(
	characters: CharacterWithRelations[] = []
): CharacterUtilsMockSetup {
	const findOwnedCharacterMock = vi.fn(async () => characters);

	vi.mocked(KoboldUtils).mockImplementation(function (this: any) {
		this.characterUtils = {
			findOwnedCharacterByName: findOwnedCharacterMock,
		};
		return this;
	} as MockReturnValue);

	return {
		findOwnedCharacterMock,
		mockCharacters: characters,
	};
}

/**
 * Result from setting up list data mocks
 */
export interface ListDataMockSetup {
	/** Mock for fetchDataForCommand */
	fetchDataMock: MockInstance;
	/** The mock characters being returned */
	mockCharacters: CharacterWithRelations[];
}

/**
 * Sets up KoboldUtils mocks for commands that use fetchDataForCommand
 * with ownedCharacters (like character list).
 *
 * Uses vi.mocked(KoboldUtils).mockImplementation() for consistency with other mock setup functions.
 *
 * @param characters - Characters to return as ownedCharacters
 *
 * @example
 * ```typescript
 * const { fetchDataMock } = setupListDataMocks([
 *   createMockCharacter({ characterOverrides: { name: 'Character 1' } }),
 *   createMockCharacter({ characterOverrides: { name: 'Character 2' } }),
 * ]);
 * ```
 */
export function setupListDataMocks(characters: CharacterWithRelations[] = []): ListDataMockSetup {
	const fetchDataMock = vi.fn(
		async () =>
			({
				ownedCharacters: characters,
			} as MockReturnValue)
	);

	vi.mocked(KoboldUtils).mockImplementation(function (this: any) {
		this.fetchDataForCommand = fetchDataMock;
		return this;
	} as MockReturnValue);

	return {
		fetchDataMock,
		mockCharacters: characters,
	};
}

/**
 * Creates a mock condition (Modifier) for testing condition commands.
 */
export function createMockCondition(overrides: Partial<Modifier> = {}): Modifier {
	return {
		name: 'Test Condition',
		isActive: true,
		description: 'A test condition description',
		type: SheetAdjustmentTypeEnum.untyped,
		severity: null,
		sheetAdjustments: [],
		rollAdjustment: null,
		rollTargetTags: null,
		note: null,
		...overrides,
	};
}

/**
 * Options for setting up game utils mocks
 */
export interface GameUtilsMockOptions {
	/** The mock sheet record to return */
	targetSheetRecord?: SheetRecord;
	/** The target name to return */
	targetName?: string;
	/** Whether to hide stats */
	hideStats?: boolean;
	/** Whether the target should not be found */
	targetNotFound?: boolean;
}

/**
 * Result from setting up game utils mocks
 */
export interface GameUtilsMockSetup {
	/** Mock for getCharacterOrInitActorTarget */
	getCharacterOrInitActorTargetMock: MockInstance;
	/** The mock sheet record */
	mockSheetRecord: SheetRecord | null;
}

/**
 * Sets up KoboldUtils mocks for condition and gameplay commands that use
 * gameUtils.getCharacterOrInitActorTarget.
 *
 * Uses vi.mocked(KoboldUtils).mockImplementation() to mock the constructor,
 * which is the proper pattern for mocking instance properties.
 *
 * @param options - Configuration options for the mock
 *
 * @example
 * ```typescript
 * const { mockSheetRecord } = setupGameUtilsMocks({
 *   targetSheetRecord: mockCharacter.sheetRecord,
 *   targetName: 'Test Character'
 * });
 * ```
 */
export function setupGameUtilsMocks(options: GameUtilsMockOptions = {}): GameUtilsMockSetup {
	const {
		targetSheetRecord = fake(zSheetRecord),
		targetName = 'Test Character',
		hideStats = false,
		targetNotFound = false,
	} = options;

	const getCharacterOrInitActorTargetMock = vi.fn(async () => {
		if (targetNotFound) {
			throw new Error('Target not found');
		}
		return {
			targetSheetRecord,
			targetName,
			hideStats,
		};
	});

	vi.mocked(KoboldUtils).mockImplementation(function (this: any) {
		this.gameUtils = {
			getCharacterOrInitActorTarget: getCharacterOrInitActorTargetMock,
		};
		return this;
	} as MockReturnValue);

	return {
		getCharacterOrInitActorTargetMock,
		mockSheetRecord: targetNotFound ? null : targetSheetRecord,
	};
}

/**
 * Result from setting up condition finder helpers mocks
 */
export interface ConditionFinderHelpersMockSetup {
	/** Mock for getConditionByName */
	getConditionByNameMock: MockInstance;
}

/**
 * Sets up FinderHelpers mocks for condition-related tests.
 *
 * @param foundCondition - The condition to return from getConditionByName, or undefined for "not found"
 */
export function setupConditionFinderHelpersMocks(
	foundCondition?: Modifier
): ConditionFinderHelpersMockSetup {
	const getConditionByNameMock = vi
		.spyOn(FinderHelpers, 'getConditionByName')
		.mockReturnValue(foundCondition);

	return {
		getConditionByNameMock,
	};
}

/**
 * Combined mock options for condition commands that need both gameUtils and autocomplete
 */
export interface ConditionMockOptions extends GameUtilsMockOptions {
	/** Conditions on the target sheet record */
	conditions?: Modifier[];
}

/**
 * Combined result from setting up condition command mocks
 */
export interface ConditionMockSetup extends GameUtilsMockSetup {
	/** Mock conditions on the sheet */
	mockConditions: Modifier[];
}

/**
 * Sets up comprehensive mocks for condition commands.
 * Combines gameUtils mocks with conditions on the sheet record.
 *
 * @param options - Configuration options for the mocks
 *
 * @example
 * ```typescript
 * const { mockSheetRecord, mockConditions } = setupConditionMocks({
 *   conditions: [createMockCondition({ name: 'Frightened', severity: 2 })]
 * });
 * ```
 */
export function setupConditionMocks(options: ConditionMockOptions = {}): ConditionMockSetup {
	const { conditions = [], ...gameUtilsOptions } = options;

	// Create or update the sheet record with conditions
	const baseSheetRecord = gameUtilsOptions.targetSheetRecord ?? fake(zSheetRecord);
	const sheetRecordWithConditions: SheetRecord = {
		...baseSheetRecord,
		conditions,
	};

	const gameUtilsSetup = setupGameUtilsMocks({
		...gameUtilsOptions,
		targetSheetRecord: sheetRecordWithConditions,
	});

	return {
		...gameUtilsSetup,
		mockConditions: conditions,
	};
}

/**
 * Sets up autocomplete mocks for condition commands.
 * Similar to setupAutocompleteKoboldMocks but for condition-specific autocomplete needs.
 *
 * Uses vi.mocked(KoboldUtils).mockImplementation() to mock the constructor,
 * which is the proper pattern for mocking instance properties.
 *
 * @param options - Configuration options including conditions and target options
 */
export function setupConditionAutocompleteMocks(
	options: ConditionMockOptions & { noActiveCharacter?: boolean } = {}
): ConditionMockSetup & { autocompleteUtilsMock: MockInstance } {
	const { conditions = [], noActiveCharacter = false, ...gameUtilsOptions } = options;

	const baseSheetRecord = gameUtilsOptions.targetSheetRecord ?? fake(zSheetRecord);
	const sheetRecordWithConditions: SheetRecord = {
		...baseSheetRecord,
		conditions,
	};

	const getCharacterOrInitActorTargetMock = vi.fn(async () => {
		if (noActiveCharacter) {
			throw new Error('Target not found');
		}
		return {
			targetSheetRecord: sheetRecordWithConditions,
			targetName: gameUtilsOptions.targetName ?? 'Test Character',
			hideStats: gameUtilsOptions.hideStats ?? false,
		};
	});

	const getAllTargetOptionsMock = vi.fn(async () => [
		{ name: 'Test Character', value: 'Test Character' },
	]);

	const getConditionsOnTargetMock = vi.fn(async () => {
		return conditions.map(c => ({ name: c.name, value: c.name }));
	});

	vi.mocked(KoboldUtils).mockImplementation(function (this: any) {
		this.gameUtils = {
			getCharacterOrInitActorTarget: getCharacterOrInitActorTargetMock,
		};
		this.autocompleteUtils = {
			getAllTargetOptions: getAllTargetOptionsMock,
			getConditionsOnTarget: getConditionsOnTargetMock,
		};
		return this;
	} as MockReturnValue);

	return {
		getCharacterOrInitActorTargetMock,
		mockSheetRecord: noActiveCharacter ? null : sheetRecordWithConditions,
		mockConditions: conditions,
		autocompleteUtilsMock: getAllTargetOptionsMock,
	};
}

// ============================================================================
// Initiative Mock Utilities
// ============================================================================

let nextInitId = 1;
let nextActorId = 1;
let nextGroupId = 1;
let nextSheetRecordId = 1;

/**
 * Creates a mock initiative object for testing.
 */
export function createMockInitiative(
	overrides: Partial<InitiativeWithRelations> = {},
	constants: { userId?: string; channelId?: string } = {}
): InitiativeWithRelations {
	const id = nextInitId++;
	const { userId = '123456789012345678', channelId = '123456789012345679' } = constants;
	return {
		id,
		gmUserId: userId,
		channelId,
		currentTurnGroupId: null,
		currentTurnGroup: null,
		currentRound: 0,
		createdAt: new Date(),
		lastUpdatedAt: new Date(),
		actors: [],
		actorGroups: [],
		...overrides,
	};
}

/**
 * Creates a mock sheet record for an actor.
 */
export function createMockSheetRecord(overrides: Partial<SheetRecord> = {}): SheetRecord {
	const id = nextSheetRecordId++;
	return {
		id,
		sheet: {
			...SheetProperties.defaultSheet,
			staticInfo: {
				...SheetProperties.defaultSheet.staticInfo,
				name: `Actor ${id}`,
			},
		},
		conditions: [],
		modifiers: [],
		actions: [],
		rollMacros: [],
		trackerMode: null,
		trackerMessageId: null,
		trackerChannelId: null,
		trackerGuildId: null,
		...overrides,
	};
}

/**
 * Creates a mock initiative actor group.
 */
export function createMockActorGroup(
	overrides: Partial<InitiativeActorGroupWithRelations> = {},
	constants: { userId?: string } = {}
): InitiativeActorGroupWithRelations {
	const id = nextGroupId++;
	const { userId = '123456789012345678' } = constants;
	return {
		id,
		initiativeId: 1,
		userId,
		name: `Group ${id}`,
		initiativeResult: 15,
		createdAt: new Date(),
		lastUpdatedAt: new Date(),
		actors: [],
		...overrides,
	};
}

/**
 * Creates a mock initiative actor.
 */
export function createMockInitiativeActor(
	overrides: Partial<InitiativeActorWithRelations> = {},
	constants: { userId?: string } = {}
): InitiativeActorWithRelations {
	const id = nextActorId++;
	const { userId = '123456789012345678' } = constants;
	const sheetRecord = createMockSheetRecord();
	const group = createMockActorGroup({}, { userId });
	return {
		id,
		initiativeId: 1,
		name: `Actor ${id}`,
		sheetRecordId: sheetRecord.id,
		sheetRecord,
		initiativeActorGroupId: group.id,
		actorGroup: group,
		characterId: null,
		gameId: null,
		userId,
		hideStats: false,
		note: '',
		referenceNpcName: null,
		createdAt: new Date(),
		lastUpdatedAt: new Date(),
		...overrides,
	};
}

/**
 * Creates a mock initiative with actors and groups.
 */
export function createMockInitiativeWithActors(
	actorCount: number = 2,
	overrides: Partial<InitiativeWithRelations> = {},
	constants: { userId?: string; channelId?: string } = {}
): InitiativeWithRelations {
	const init = createMockInitiative(overrides, constants);
	const { userId = '123456789012345678' } = constants;
	const actors: InitiativeActorWithRelations[] = [];
	const groups: InitiativeActorGroupWithRelations[] = [];

	for (let i = 0; i < actorCount; i++) {
		const group = createMockActorGroup(
			{
				initiativeId: init.id,
				name: `Actor ${i + 1}`,
				initiativeResult: 20 - i,
			},
			{ userId }
		);
		groups.push(group);

		const sheetRecord = createMockSheetRecord({
			sheet: {
				...SheetProperties.defaultSheet,
				staticInfo: {
					...SheetProperties.defaultSheet.staticInfo,
					name: `Actor ${i + 1}`,
				},
			},
		});

		const actor = createMockInitiativeActor(
			{
				initiativeId: init.id,
				name: `Actor ${i + 1}`,
				initiativeActorGroupId: group.id,
				sheetRecord,
				sheetRecordId: sheetRecord.id,
			},
			{ userId }
		);
		actors.push(actor);
	}

	init.actors = actors;
	init.actorGroups = groups;
	if (groups.length > 0 && init.currentRound > 0) {
		init.currentTurnGroupId = groups[0].id;
	}

	return init;
}

/**
 * Resets the ID counters for initiative test isolation.
 * Call this in beforeEach to ensure consistent IDs across tests.
 */
export function resetInitTestIds(): void {
	nextInitId = 1;
	nextActorId = 1;
	nextGroupId = 1;
	nextSheetRecordId = 1;
}

// ============================================================================
// Counter Mock Utilities
// ============================================================================

/**
 * Creates a mock numeric counter for testing.
 */
export function createMockNumericCounter(overrides: Partial<NumericCounter> = {}): NumericCounter {
	return {
		style: CounterStyleEnum.default,
		name: 'Test Counter',
		description: null,
		current: 5,
		max: 10,
		recoverTo: 0,
		recoverable: false,
		text: '',
		...overrides,
	};
}

/**
 * Creates a mock counter group for testing.
 */
export function createMockCounterGroup(overrides: Partial<CounterGroup> = {}): CounterGroup {
	return {
		name: 'Resources',
		description: null,
		counters: [],
		...overrides,
	};
}

/**
 * Creates a mock dots counter for testing.
 */
export function createMockDotsCounter(overrides: Partial<DotsCounter> = {}): DotsCounter {
	return {
		style: CounterStyleEnum.dots,
		name: 'Focus Points',
		description: null,
		current: 2,
		max: 3,
		recoverTo: 0,
		recoverable: true,
		text: '',
		...overrides,
	};
}

/**
 * Creates a mock prepared counter for testing.
 */
export function createMockPreparedCounter(
	overrides: Partial<PreparedCounter> = {}
): PreparedCounter {
	return {
		style: CounterStyleEnum.prepared,
		name: 'Spell Slots',
		description: null,
		prepared: ['Fireball', 'Shield', null],
		active: [true, true, true],
		max: 3,
		recoverable: true,
		text: '',
		...overrides,
	};
}

/**
 * Options for mocking Creature getters
 */
export interface CreatureMockOptions {
	sheet?: {
		staticInfo?: { name?: string };
		stats?: { perception?: { value?: number } };
	};
	skillRolls?: Record<string, { name: string; bonus?: number; roll?: string }>;
	savingThrowRolls?: Record<string, { name: string; bonus?: number; roll?: string }>;
	statBonuses?: Record<string, number>;
	attacks?: any[];
	rolls?: Record<string, any>;
}

/**
 * Sets up Creature getter mocks using vi.spyOn.
 * Use this for tests that import and mock Creature via vi.mock().
 *
 * Creature properties like sheet, skillRolls, savingThrowRolls, etc. are getters,
 * so simple property assignment doesn't work with vitest's auto-mocking.
 * This function uses vi.spyOn with 'get' accessor to properly mock them.
 *
 * @example
 * ```typescript
 * vi.mock('../../../utils/creature.js');
 *
 * beforeEach(() => {
 *   vi.mocked(Creature).mockImplementation(function (this: any) {
 *     return this;
 *   } as any);
 *
 *   setupCreatureMocks({
 *     sheet: { staticInfo: { name: 'Test Character' } },
 *     skillRolls: { acrobatics: { name: 'Acrobatics', bonus: 10 } },
 *   });
 * });
 * ```
 */
export function setupCreatureMocks(Creature: any, options: CreatureMockOptions = {}): void {
	const {
		sheet = { staticInfo: { name: 'Test Character' } },
		skillRolls = {},
		savingThrowRolls = {},
		statBonuses = {},
		attacks = [],
		rolls = {},
	} = options;

	vi.spyOn(Creature.prototype, 'sheet', 'get').mockReturnValue(sheet as any);

	if (Object.keys(skillRolls).length > 0) {
		vi.spyOn(Creature.prototype, 'skillRolls', 'get').mockReturnValue(skillRolls);
	}

	if (Object.keys(savingThrowRolls).length > 0) {
		vi.spyOn(Creature.prototype, 'savingThrowRolls', 'get').mockReturnValue(savingThrowRolls);
	}

	if (Object.keys(statBonuses).length > 0) {
		vi.spyOn(Creature.prototype, 'statBonuses', 'get').mockReturnValue(statBonuses as any);
	}

	if (attacks.length > 0) {
		vi.spyOn(Creature.prototype, 'attacks', 'get').mockReturnValue(attacks);
	}

	if (Object.keys(rolls).length > 0) {
		vi.spyOn(Creature.prototype, 'rolls', 'get').mockReturnValue(rolls);
	}
}
