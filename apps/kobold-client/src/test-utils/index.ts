/**
 * Test utilities for integration testing Kobold Discord bot commands.
 *
 * @module test-utils
 */

// Mock interaction factories
export {
	createMockChatInputInteraction,
	createMockAutocompleteInteraction,
	getInteractionResponseContent,
	getFullEmbedContent,
	type MockInteractionOptions,
} from './mock-interactions.js';

// Command test harness
export {
	CommandTestHarness,
	createCommandHarness,
	type CommandExecutionResult,
	type AutocompleteExecutionResult,
	type CommandTestHarnessOptions,
} from './command-test-harness.js';

// Mock utilities for KoboldUtils and services
export {
	createMockCharacter,
	createMockAction,
	createAttackRoll,
	createSkillChallengeRoll,
	createDamageRoll,
	createAdvancedDamageRoll,
	createSaveRoll,
	createTextRoll,
	setupKoboldUtilsMocks,
	setupAutocompleteKoboldMocks,
	setupFinderHelpersMocks,
	setupSheetRecordUpdateMock,
	setupCharacterUtilsMocks,
	setupListDataMocks,
	// Condition-related mocks
	createMockCondition,
	setupGameUtilsMocks,
	setupConditionFinderHelpersMocks,
	setupConditionMocks,
	setupConditionAutocompleteMocks,
	// Initiative-related mocks
	createMockInitiative,
	createMockSheetRecord,
	createMockActorGroup,
	createMockInitiativeActor,
	createMockInitiativeWithActors,
	resetInitTestIds,
	// Counter-related mocks
	createMockNumericCounter,
	createMockCounterGroup,
	createMockDotsCounter,
	createMockPreparedCounter,
	type MockCharacterOptions,
	type KoboldUtilsMockSetup,
	type FinderHelpersMockSetup,
	type SheetRecordUpdateMockSetup,
	type CharacterUtilsMockSetup,
	type ListDataMockSetup,
	type GameUtilsMockOptions,
	type GameUtilsMockSetup,
	type ConditionFinderHelpersMockSetup,
	type ConditionMockOptions,
	type ConditionMockSetup,
} from './mock-kobold-utils.js';

// Test setup helpers
export {
	mockNethysDb,
	TEST_USER_ID,
	TEST_GUILD_ID,
	TEST_CHANNEL_ID,
	getDefaultTestServices,
	createTestHarness,
	getStandardMockModules,
} from './test-setup.js';
