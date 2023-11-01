import { CharacterFactory } from './../services/kobold/models/character/character.factory.js';
import { CharacterUtils } from './character-utils.js';
import { WG } from './../services/wanderers-guide/wanderers-guide.js';
import {
	Character,
	GuildDefaultCharacterFactory,
	Modifier,
	ModifierTypeEnum,
	SheetAdjustmentTypeEnum,
} from '../services/kobold/index.js';
import { afterEach } from 'vitest';

describe('Character Utils', function () {
	describe('CharacterUtils.getBestNameMatch', function () {
		it('returns null if no possible matches are provided', function () {
			const match = CharacterUtils.getBestNameMatch('test', []);
			expect(match).toBe(null);
		});
		it('finds the best match on multiple close possibilities', function () {
			const target = 'stealth';
			const oneOff = 'spealth';
			const twoOff = 'steltn';
			const twoOffAgain = 'steelt';
			const threeOff = 'slphth';
			const match = CharacterUtils.getBestNameMatch(
				target,
				[oneOff, twoOff, twoOffAgain, threeOff].map(str => ({ Name: str }))
			);
			expect(match?.Name).toBe(oneOff);
		});
		it('finds the an exact match on multiple close possibilities', function () {
			const target = 'stealth';
			const oneOff = 'spealth';
			const twoOff = 'steltn';
			const twoOffAgain = 'steelt';
			const threeOff = 'slphth';
			const match = CharacterUtils.getBestNameMatch(
				target,
				[oneOff, twoOff, twoOffAgain, threeOff, target].map(str => ({ Name: str }))
			);
			expect(match?.Name).toBe(target);
		});
	});
	describe('CharacterUtils.findPossibleModifierFromString', function () {
		it('fetches possible skill targets from a character', function () {
			const fakeCharacter = CharacterFactory.build();
			const targetModifier: Modifier = {
				isActive: true,
				targetTags: '',
				modifierType: ModifierTypeEnum.roll,
				name: 'FakeModifier',
				description: 'description',
				type: SheetAdjustmentTypeEnum.untyped,
				value: '10',
			};
			const otherTargetModifier: Modifier = {
				isActive: true,
				targetTags: '',
				modifierType: ModifierTypeEnum.roll,
				name: 'qwer FakeModifier asdf',
				description: 'description',
				type: SheetAdjustmentTypeEnum.untyped,
				value: '10',
			};
			const unmatchedModifier: Modifier = {
				isActive: true,
				targetTags: '',
				modifierType: ModifierTypeEnum.roll,
				name: 'akeAbilit',
				description: 'description',
				type: SheetAdjustmentTypeEnum.untyped,
				value: '10',
			};
			fakeCharacter.modifiers = [targetModifier, otherTargetModifier, unmatchedModifier];
			const foundModifiers = CharacterUtils.findPossibleModifierFromString(
				fakeCharacter,
				targetModifier.name
			);
			expect(foundModifiers).toContain(targetModifier);
			expect(foundModifiers).toContain(otherTargetModifier);
			expect(foundModifiers).not.toContain(unmatchedModifier);
		});
		it("fails to fetch skills that don't match from a character", function () {
			const fakeCharacter = CharacterFactory.build();
			const firstModifier: Modifier = {
				isActive: true,
				targetTags: '',
				modifierType: ModifierTypeEnum.roll,
				name: 'FakeModifier',
				description: 'description',
				type: SheetAdjustmentTypeEnum.untyped,
				value: '10',
			};
			const secondModifier: Modifier = {
				isActive: true,
				targetTags: '',
				modifierType: ModifierTypeEnum.roll,
				name: 'qwer FakeModifier asdf',
				description: 'description',
				type: SheetAdjustmentTypeEnum.untyped,
				value: '10',
			};
			const thirdModifier: Modifier = {
				isActive: true,
				targetTags: '',
				modifierType: ModifierTypeEnum.roll,
				name: 'akeAbilit',
				description: 'description',
				type: SheetAdjustmentTypeEnum.untyped,
				value: '10',
			};
			fakeCharacter.modifiers = [firstModifier, secondModifier, thirdModifier];
			const foundModifiers = CharacterUtils.findPossibleModifierFromString(
				fakeCharacter,
				'jkljdfiawhedfiuws'
			);
			expect(foundModifiers.length).toBe(0);
		});
	});
	describe('CharacterUtils.getActiveCharacter', function () {
		it('gets a single active character', async function () {
			const activeCharacter = await CharacterFactory.create({
				userId: '0',
				isActiveCharacter: true,
			});
			await CharacterFactory.createList(10, {
				userId: '0',
				isActiveCharacter: false,
			});
			const fetchedCharacter = await CharacterUtils.getActiveCharacter({
				user: { id: '0' },
				channelId: '1',
				guildId: '2',
			} as any);
			expect(activeCharacter.id).toBe(fetchedCharacter?.id);
		});
		it(
			'gets one of multiple characters if we have an issue' +
				'where we have multiple isActiveCharacter states',
			async function () {
				const activeCharacters = await CharacterFactory.createList(2, {
					userId: '0',
					isActiveCharacter: true,
				});
				const inactiveCharacters = await CharacterFactory.createList(10, {
					userId: '0',
					isActiveCharacter: false,
				});
				const fetchedCharacter = await CharacterUtils.getActiveCharacter({
					user: { id: '0' },
					channelId: '1',
					guildId: '2',
				} as any);
				expect(activeCharacters.map(char => char.id)).toContain(fetchedCharacter?.id);
			}
		);
		it('fetches a default character for a guild even when an active character is present', async function () {
			const inactiveCharacters = await CharacterFactory.createList(10, {
				userId: '0',
				isActiveCharacter: false,
			});
			const activeCharacter = await CharacterFactory.create({
				userId: '0',
				isActiveCharacter: true,
			});
			const guildDefaultCharacter = await GuildDefaultCharacterFactory.create({
				characterId: inactiveCharacters[4].id,
				userId: '0',
				guildId: 'foo',
			});
			const fetchedCharacter = await CharacterUtils.getActiveCharacter({
				user: { id: '0' },
				channelId: '1',
				guildId: 'foo',
			} as any);
			expect(fetchedCharacter?.id).toEqual(inactiveCharacters[4].id);
		});
		it('returns null if no active character is present', async function () {
			const inactiveCharacters = await CharacterFactory.createList(10, {
				userId: '0',
				isActiveCharacter: false,
			});
			const fetchedCharacter = await CharacterUtils.getActiveCharacter({
				user: { id: '0' },
				channelId: '1',
				guildId: '2',
			} as any);
			expect(fetchedCharacter).toBe(null);
		});
	});
	describe('CharacterUtils.parseCharacterIdFromText', function () {
		test('it parses a trimmed number', function () {
			const charId = CharacterUtils.parseCharacterIdFromText('1234');
			expect(charId).toBe(1234);
			const trimmedCharId = CharacterUtils.parseCharacterIdFromText('  5432 ');
			expect(trimmedCharId).toBe(5432);
		});
		test('it parses a wg url', function () {
			const charId = CharacterUtils.parseCharacterIdFromText(
				'https://wanderersguide.app/profile/characters/9876'
			);
			expect(charId).toBe(9876);
			const trimmedCharId = CharacterUtils.parseCharacterIdFromText(' /characters/8765 ');
			expect(trimmedCharId).toBe(8765);
		});
		test('it returns null when it fails to parse an invalid input', function () {
			const fail1 = CharacterUtils.parseCharacterIdFromText('  54 32 ');
			expect(fail1).toBe(null);

			const fail2 = CharacterUtils.parseCharacterIdFromText(
				'https://wanderersguide.appprofilecharacters9876'
			);
			expect(fail2).toBe(null);
			const fail3 = CharacterUtils.parseCharacterIdFromText(' /8765 ');
			expect(fail3).toBe(null);
		});
	});
});
