import { generateMock } from '@anatine/zod-mock';
import type { ChatInputCommandInteraction } from 'discord.js';
import L from '../../../i18n/i18n-node.js';
import { zAction, zCharacterWithRelations, zSheetRecord } from '../../../services/kobold/index.js';
import {
	MockChatInputCommandInteraction,
	vitestKobold,
} from '../../../utils/discord-test-utils.js';
import { InteractionUtils } from '../../../utils/index.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { ActionCreateSubCommand } from './action-create-subcommand.js';

vitest.mock('../../../utils/kobold-service-utils/kobold-utils');
vitest.mock('../../../utils/index');
vitest.mock('../../../utils/kobold-helpers/finder-helpers');

describe('ActionCreateSubCommand', () => {
	let command: ActionCreateSubCommand;
	let mockInteraction: ChatInputCommandInteraction;

	beforeEach(() => {
		mockInteraction = new MockChatInputCommandInteraction();
		command = new ActionCreateSubCommand();
	});

	it('should create a new action if the name does not already exist', async () => {
		// Arrange
		vitest.spyOn(FinderHelpers, 'getActionByName').mockReturnValue(undefined);
		vitest.spyOn(KoboldUtils.prototype, 'fetchNonNullableDataForCommand').mockResolvedValue({
			activeCharacter: generateMock(zCharacterWithRelations),
		});
		vitest
			.spyOn(vitestKobold.sheetRecord, 'update')
			.mockResolvedValue(generateMock(zSheetRecord));

		// Act
		await command.execute(mockInteraction, L.en, { kobold: vitestKobold });

		// Assert
		expect(KoboldUtils.prototype.fetchNonNullableDataForCommand).toHaveBeenCalled();
		expect(FinderHelpers.getActionByName).toHaveBeenCalled();
		expect(vitestKobold.sheetRecord.update).toHaveBeenCalled();
		expect(InteractionUtils.send).toHaveBeenCalled();
	});

	it('should not create a new action if the name already exists', async () => {
		// Arrange
		vitest.spyOn(FinderHelpers, 'getActionByName').mockReturnValue(generateMock(zAction));
		vitest.spyOn(KoboldUtils.prototype, 'fetchNonNullableDataForCommand').mockResolvedValue({
			activeCharacter: generateMock(zCharacterWithRelations),
		});
		vitest.spyOn(vitestKobold.sheetRecord, 'update');

		// Act
		await command.execute(mockInteraction, L.en, { kobold: vitestKobold });

		// Assert
		expect(KoboldUtils.prototype.fetchNonNullableDataForCommand).toHaveBeenCalled();
		expect(FinderHelpers.getActionByName).toHaveBeenCalled();
		expect(vitestKobold.sheetRecord.update).not.toHaveBeenCalled();
		expect(InteractionUtils.send).toHaveBeenCalled();
	});
});
