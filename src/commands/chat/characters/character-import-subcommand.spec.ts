import { Locale } from 'discord.js';
import {
	Character,
	CharacterFactory,
	WgToken,
	WgTokenFactory,
} from '../../../services/kobold/models/index.js';
import { InteractionUtils } from '../../../utils/interaction-utils.js';
import { CharacterImportSubCommand } from './character-import-subcommand';
import { CharacterHelpers } from './helpers.js';
import Config from '../../../config/config.json';
import { Language } from '../../../models/enum-helpers/index.js';

describe('CharacterImportSubCommand', () => {
	const fakeData = {
		lang() {
			return 'en-US' as Locale;
		},
	};
	beforeEach(function () {
		jest.spyOn(Character, 'query').mockReturnValue({
			where({ charId, userId }) {
				if (charId == 12345) {
					return [CharacterFactory.withName('firstTest').build({ charId, userId })];
				} else return [];
			},
			update({ isActiveCharacter }) {
				return {
					where({ userId }) {
						return [CharacterFactory.build({ userId, isActiveCharacter })];
					},
				};
			},
			insertAndFetch(character) {
				return CharacterFactory.build(character);
			},
		} as any);

		jest.spyOn(WgToken, 'query').mockReturnValue({
			async where({ charId }) {
				if (charId == 12345 || charId == 28375) {
					return [WgTokenFactory.build({ charId })];
				} else return [];
			},
		} as any);
	});
	test("responds with an error if no wanderer's guide character id is found", function (done) {
		jest.spyOn(InteractionUtils, 'send').mockImplementation((intr, err): any => {
			expect(err).toContain(
				Language.LL.commands.character.import.interactions.invalidUrl({
					url: 'https://www.wanderersguide.com/characters/',
				})
			);
			done();
		});
		const fakeIntr = {
			options: {
				getString: () => 'https://www.wanderersguide.com/characters/',
			},
		} as any;
		const command = new CharacterImportSubCommand();
		command.execute(fakeIntr, fakeData as any, Language.LL);
	});
	test(
		"responds with an error if an existing character with that wanderer's " +
			'guide character id is found for that user',
		function (done) {
			jest.spyOn(InteractionUtils, 'send').mockImplementation((intr, err): any => {
				expect(err).toBe(
					Language.LL.commands.character.import.interactions.characterAlreadyExists({
						characterName: 'firstTest',
					})
				);
				done();
			});
			const fakeIntr = {
				options: {
					getString: () => 'https://www.wanderersguide.com/characters/12345',
				},
				user: {
					id: 'asdf',
				},
			} as any;
			const command = new CharacterImportSubCommand();
			command.execute(fakeIntr, fakeData as any, Language.LL);
		}
	);
	test('responds with an auth link if a Wg token is not found for the character', function (done) {
		jest.spyOn(InteractionUtils, 'send').mockImplementation((intr, msg): any => {
			expect(msg).toBe(
				Language.LL.commands.character.interactions.authenticationRequest({
					wgBaseUrl: Config.wanderersGuide.oauthBaseUrl,
					charId: '56789',
					action: 'import',
				})
			);
			done();
		});
		const fakeIntr = {
			options: {
				getString: () => 'https://www.wanderersguide.com/characters/56789',
			},
			user: {
				id: 'asdf',
			},
		} as any;
		const command = new CharacterImportSubCommand();
		command.execute(fakeIntr, fakeData as any, Language.LL);
	});
	test('imports a character successfully', function (done) {
		// pretend we fetch a real character
		jest.spyOn(CharacterHelpers, 'fetchWgCharacterFromToken').mockImplementation(((
			charId,
			Token
		) => {
			expect(charId).toBe(28375);
			return CharacterFactory.withName('importedChar').build({ charId });
		}) as any);
		//expect a successful import response
		jest.spyOn(InteractionUtils, 'send').mockImplementation((intr, msg): any => {
			expect(msg).toBe(
				Language.LL.commands.character.import.interactions.success({
					characterName: 'importedChar',
				})
			);
			done();
		});
		const fakeIntr = {
			options: {
				getString: () => 'https://www.wanderersguide.com/characters/28375',
			},
			user: {
				id: 'asdf',
			},
		} as any;
		const command = new CharacterImportSubCommand();
		command.execute(fakeIntr, fakeData as any, Language.LL);
	});
	afterEach(function () {
		jest.restoreAllMocks();
	});
});
