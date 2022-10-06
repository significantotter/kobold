import {
	Character,
	CharacterFactory,
	WgToken,
	WgTokenFactory,
} from '../../../services/kobold/models/index.js';
import { InteractionUtils } from '../../../utils/interaction-utils.js';
import { CharacterImportSubCommand } from './character-import-subcommand';
import Config from '../../../config/config.json';
import { QueryBuilder, Model } from 'objection';

describe('CharacterImportSubCommand', () => {
	beforeEach(function () {
		jest.spyOn(Character, 'query').mockReturnValue({
			where({ charId, userId }) {
				if (charId == 12345) {
					return [CharacterFactory.build({ charId, userId })];
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
				if (charId == 12345) {
					return [WgTokenFactory.build({ charId })];
				} else return [];
			},
		} as any);
	});
	test("responds with an error if no wanderer's guide character id is found", function (done) {
		jest.spyOn(InteractionUtils, 'send').mockImplementation((intr, err): any => {
			expect(err).toContain("I couldn't find the character");
			done();
		});
		const fakeIntr = {
			options: {
				getString: () => 'https://www.wanderersguide.com/characters/',
			},
		} as any;
		const command = new CharacterImportSubCommand();
		command.execute(fakeIntr, null as any);
	});
	test(
		"responds with an error if an existing character with that wanderer's " +
			'guide character id is found for that user',
		function (done) {
			jest.spyOn(InteractionUtils, 'send').mockImplementation((intr, err): any => {
				expect(err).toContain('is already in the system!');
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
			command.execute(fakeIntr, null as any);
		}
	);
	test('responds with an auth link if a Wg token is not found for the character', function (done) {
		jest.spyOn(InteractionUtils, 'send').mockImplementation((intr, msg): any => {
			expect(msg).toContain(Config.wanderersGuide.oauthBaseUrl);
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
		command.execute(fakeIntr, null as any);
	});
	afterEach(function () {
		jest.restoreAllMocks();
	});
});
