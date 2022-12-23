import { CharacterFactory } from './../services/kobold/models/character/character.factory';
import { CharacterUtils } from './character-utils.js';
import { WG } from './../services/wanderers-guide/wanderers-guide.js';
import { Character, GuildDefaultCharacterFactory } from '../services/kobold/models/index.js';

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
			expect(match.Name).toBe(oneOff);
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
			expect(match.Name).toBe(target);
		});
	});
	describe('CharacterUtils.findPossibleSkillFromString', function () {
		it('fetches possible skill targets from a character', function () {
			const fakeCharacter = CharacterFactory.build();
			const targetSkill: WG.NamedBonus = { Name: 'FakeSkill', Bonus: 3 };
			const otherTargetSkill: WG.NamedBonus = { Name: 'qwer FakeSkill asdf', Bonus: 3 };
			const unmatchedSkill: WG.NamedBonus = { Name: 'akeSkil', Bonus: 3 };
			fakeCharacter.calculatedStats.totalSkills = [
				targetSkill,
				otherTargetSkill,
				unmatchedSkill,
			];
			const foundSkills = CharacterUtils.findPossibleSkillFromString(
				fakeCharacter,
				targetSkill.Name
			);
			expect(foundSkills).toContain(targetSkill);
			expect(foundSkills).toContain(otherTargetSkill);
			expect(foundSkills).not.toContain(unmatchedSkill);
		});
		it("fails to fetch skills that don't match from a character", function () {
			const fakeCharacter = CharacterFactory.build();
			const firstSkill: WG.NamedBonus = { Name: 'FakeSkill', Bonus: 3 };
			const secondSkill: WG.NamedBonus = { Name: 'qwer FakeSkill asdf', Bonus: 3 };
			const thirdSkill: WG.NamedBonus = { Name: 'akeSkil', Bonus: 3 };
			fakeCharacter.calculatedStats.totalSkills = [firstSkill, secondSkill, thirdSkill];
			const foundSkills = CharacterUtils.findPossibleSkillFromString(
				fakeCharacter,
				'jkljdfiawhedfiuws'
			);
			expect(foundSkills.length).toBe(0);
		});
	});
	describe('CharacterUtils.findPossibleAttackFromString', function () {
		it('fetches possible attack targets from a character', function () {
			const fakeCharacter = CharacterFactory.build();
			const targetAttack: WG.Attack = { Name: 'FakeAttack', Bonus: 3, Damage: 'd4' };
			const otherTargetAttack: WG.Attack = {
				Name: 'qwer FakeAttack asdf',
				Bonus: 3,
				Damage: 'd4',
			};
			const unmatchedAttack: WG.Attack = { Name: 'akeAttac', Bonus: 3, Damage: 'd4' };
			fakeCharacter.calculatedStats.weapons = [
				targetAttack,
				otherTargetAttack,
				unmatchedAttack,
			];
			const foundAttacks = CharacterUtils.findPossibleAttackFromString(
				fakeCharacter,
				targetAttack.Name
			);
			expect(foundAttacks).toContain(targetAttack);
			expect(foundAttacks).toContain(otherTargetAttack);
			expect(foundAttacks).not.toContain(unmatchedAttack);
		});
		it("fails to fetch attacks that don't match from a character", function () {
			const fakeCharacter = CharacterFactory.build();
			const firstAttack: WG.Attack = { Name: 'FakeAttack', Bonus: 3, Damage: 'd4' };
			const secondAttack: WG.Attack = {
				Name: 'qwer FakeAttack asdf',
				Bonus: 3,
				Damage: 'd4',
			};
			const thirdAttack: WG.Attack = { Name: 'akeAttac', Bonus: 3, Damage: 'd4' };
			fakeCharacter.calculatedStats.weapons = [firstAttack, secondAttack, thirdAttack];
			const foundAttacks = CharacterUtils.findPossibleAttackFromString(
				fakeCharacter,
				'jkljdfiawhedfiuws'
			);
			expect(foundAttacks.length).toBe(0);
		});
	});
	describe('CharacterUtils.findPossibleAbilityFromString', function () {
		it('fetches possible skill targets from a character', function () {
			const fakeCharacter = CharacterFactory.build();
			const targetAbility: WG.NamedScore = { Name: 'FakeAbility', Score: 10 };
			const otherTargetAbility: WG.NamedScore = { Name: 'qwer FakeAbility asdf', Score: 10 };
			const unmatchedAbility: WG.NamedScore = { Name: 'akeAbilit', Score: 10 };
			fakeCharacter.calculatedStats.totalAbilityScores = [
				targetAbility,
				otherTargetAbility,
				unmatchedAbility,
			];
			const foundAbilitys = CharacterUtils.findPossibleAbilityFromString(
				fakeCharacter,
				targetAbility.Name
			);
			expect(foundAbilitys).toContain(targetAbility);
			expect(foundAbilitys).toContain(otherTargetAbility);
			expect(foundAbilitys).not.toContain(unmatchedAbility);
		});
		it("fails to fetch skills that don't match from a character", function () {
			const fakeCharacter = CharacterFactory.build();
			const firstAbility: WG.NamedScore = { Name: 'FakeAbility', Score: 10 };
			const secondAbility: WG.NamedScore = { Name: 'qwer FakeAbility asdf', Score: 10 };
			const thirdAbility: WG.NamedScore = { Name: 'akeAbilit', Score: 10 };
			fakeCharacter.calculatedStats.totalAbilityScores = [
				firstAbility,
				secondAbility,
				thirdAbility,
			];
			const foundAbilitys = CharacterUtils.findPossibleAbilityFromString(
				fakeCharacter,
				'jkljdfiawhedfiuws'
			);
			expect(foundAbilitys.length).toBe(0);
		});
	});
	describe('CharacterUtils.findPossibleSaveFromString', function () {
		it('fetches possible skill targets from a character', function () {
			const fakeCharacter = CharacterFactory.build();
			const targetSave: WG.NamedBonus = { Name: 'FakeSave', Bonus: 3 };
			const otherTargetSave: WG.NamedBonus = { Name: 'qwer FakeSave asdf', Bonus: 3 };
			const unmatchedSave: WG.NamedBonus = { Name: 'akeSav', Bonus: 3 };
			fakeCharacter.calculatedStats.totalSaves = [targetSave, otherTargetSave, unmatchedSave];
			const foundSaves = CharacterUtils.findPossibleSaveFromString(
				fakeCharacter,
				targetSave.Name
			);
			expect(foundSaves).toContain(targetSave);
			expect(foundSaves).toContain(otherTargetSave);
			expect(foundSaves).not.toContain(unmatchedSave);
		});
		it("fails to fetch skills that don't match from a character", function () {
			const fakeCharacter = CharacterFactory.build();
			const firstSave: WG.NamedBonus = { Name: 'FakeSave', Bonus: 3 };
			const secondSave: WG.NamedBonus = { Name: 'qwer FakeSave asdf', Bonus: 3 };
			const thirdSave: WG.NamedBonus = { Name: 'akeSav', Bonus: 3 };
			fakeCharacter.calculatedStats.totalSaves = [firstSave, secondSave, thirdSave];
			const foundSaves = CharacterUtils.findPossibleSaveFromString(
				fakeCharacter,
				'jkljdfiawhedfiuws'
			);
			expect(foundSaves.length).toBe(0);
		});
	});
	describe('CharacterUtils.getActiveCharacter', function () {
		afterEach(function () {
			return Character.query().delete().whereRaw('true');
		});
		it('gets a single active character', async function () {
			const activeCharacter = await CharacterFactory.create({
				userId: '0',
				isActiveCharacter: true,
			});
			const inactiveCharacters = await CharacterFactory.createList(10, {
				userId: '0',
				isActiveCharacter: false,
			});
			const fetchedCharacter = await CharacterUtils.getActiveCharacter('0');
			expect(activeCharacter.id).toBe(fetchedCharacter.id);
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
				const fetchedCharacter = await CharacterUtils.getActiveCharacter('0');
				expect(activeCharacters.map(char => char.id)).toContain(fetchedCharacter.id);
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
			const fetchedCharacter = await CharacterUtils.getActiveCharacter('0', 'foo');
			expect(fetchedCharacter.id).toEqual(inactiveCharacters[4].id);
		});
		it('returns null if no active character is present', async function () {
			const inactiveCharacters = await CharacterFactory.createList(10, {
				userId: '0',
				isActiveCharacter: false,
			});
			const fetchedCharacter = await CharacterUtils.getActiveCharacter('0');
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
