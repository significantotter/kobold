import { CollectorUtils } from './../../../utils/collector-utils.js';
import { Language } from './../../../models/enum-helpers/language';
import { InteractionUtils } from './../../../utils/interaction-utils';
import { Locale } from 'discord.js';
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
		command.execute(fakeIntr, fakeData as any, Language.LL);
	});
	test('Allows the user to cancel the removal of their character', done => {
		let charToRemove = CharacterFactory.withFakeId().build();
		let interactionCount = 0;
		let prompt;
		jest.spyOn(Character, 'query').mockReturnValue({
			where({ userId }) {
				return [charToRemove];
			},
		} as any);

		jest.spyOn(InteractionUtils, 'send').mockImplementation((intr, message: any): any => {
			prompt = 'arrived here!';
			return prompt;
		});
		jest.spyOn(InteractionUtils, 'editReply').mockImplementation((intr, message: any): any => {
			expect(message?.content).toBe(
				Language.LL.commands.character.remove.interactions.cancelled({
					characterName: charToRemove.characterData.name,
				})
			);
			done();
		});

		jest.spyOn(CollectorUtils, 'collectByButton').mockImplementation(((
			message,
			retriever,
			options
		) => {
			expect(message).toBe(prompt);
			return { value: 'cancel' };
		}) as any);

		const fakeIntr = {
			user: { id: null },
		} as any;
		const command = new CharacterRemoveSubCommand();
		command.execute(fakeIntr, fakeData as any, Language.LL);
	});
	test('A removal request can expire', () => {});
	test("Removes the user's character", () => {});
	afterEach(function () {
		jest.restoreAllMocks();
	});
});
