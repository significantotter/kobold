import { Language } from './../../../models/enum-helpers/language';
import { InteractionUtils } from './../../../utils/interaction-utils';
import { Locale } from 'discord-api-types/v10';
import { Character, CharacterFactory } from '../../../services/kobold/models/index.js';
import { CharacterRemoveSubCommand } from './character-remove-subcommand.js';

describe('CharacterRemoveSubCommand', () => {
	const fakeData = {
		lang() {
			return 'en-US' as Locale;
		},
	};
	test("Returns a message when the user doesn't have an active character", done => {
		jest.spyOn(Character, 'query').mockReturnValue({
			where({ userId }) {
				return [];
			},
		} as any);

		jest.spyOn(InteractionUtils, 'send').mockImplementation((intr, message): any => {
			expect(message).toBe(Language.LL.commands.character.interactions.noActiveCharacter());
			done();
		});

		const fakeIntr = {
			user: { id: null },
		} as any;
		const command = new CharacterRemoveSubCommand();
		command.execute(fakeIntr, fakeData as any);
	});
});
