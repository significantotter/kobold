import { KoboldEmbed } from './../../../utils/kobold-embed-utils';
import { Language } from './../../../models/enum-helpers/language';
import { InteractionUtils } from './../../../utils/interaction-utils';
import { Locale } from 'discord.js';
import {
	Character,
	CharacterFactory,
	GuildDefaultCharacter,
} from '../../../services/kobold/models/index.js';
import { CharacterListSubCommand } from './character-list-subcommand.js';

describe('CharacterListSubCommand', () => {
	const fakeData = {
		lang() {
			return 'en-US' as Locale;
		},
	};
	const builtCharacters = [
		...CharacterFactory.buildList(4, { isActiveCharacter: false }),
		CharacterFactory.build({ isActiveCharacter: true }),
	];
	it('Returns a message when there are no characters', done => {
		jest.spyOn(InteractionUtils, 'send').mockImplementation((intr, message): any => {
			expect(message).toBe(Language.LL.commands.character.list.interactions.noCharacters());
			done();
		});

		const fakeIntr = {
			user: { id: null },
			guildId: 'foo',
		} as any;
		const command = new CharacterListSubCommand();
		command.execute(fakeIntr, fakeData as any, Language.LL);
	});
	it("Returns an embed of the user's characters", done => {
		jest.spyOn(Character, 'query').mockReturnValue({
			where({ userId }) {
				return builtCharacters;
			},
			joinRelated(options) {
				return {
					where() {
						return [];
					},
				};
			},
		} as any);
		jest.spyOn(GuildDefaultCharacter, 'query').mockReturnValue({
			where({ userId, guildId }) {
				return [];
			},
		} as any);
		const fakeIntr = {
			user: { id: null },
		} as any;

		jest.spyOn(InteractionUtils, 'send').mockImplementation((intr, embed: KoboldEmbed): any => {
			expect(embed.data.title).toBe(
				Language.LL.commands.character.list.interactions.characterListEmbed.title()
			);
			expect(embed.data.fields.length).toBe(5);
			expect(embed.data.fields.find(field => field.name.includes('(active)'))).toBeDefined();
			for (const character of builtCharacters) {
				const field = embed.data.fields.find(field =>
					field.name.includes(character.sheet.info.name)
				);
				expect(field.value).toContain(String(character.sheet.info.level));
				if (character.sheet.info.ancestry) {
					expect(field.value).toContain(character.sheet.info.ancestry);
				}
			}

			done();
		});
		const command = new CharacterListSubCommand();
		command.execute(fakeIntr, fakeData as any, Language.LL);
	});
	afterEach(function () {
		jest.restoreAllMocks();
	});
});
