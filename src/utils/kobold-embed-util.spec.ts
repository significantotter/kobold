import { EmbedBuilder } from 'discord.js';
import { Character } from '../services/kobold/models/index.js';
import { KoboldEmbed } from './kobold-embed-utils.js';

function getFakeInitiativeBuilder() {
	return {
		init: {
			currentRound: 1,
		},
		activeGroup: {
			name: 'Test Group',
			id: 'test-group-id',
		},
		groups: [
			{
				name: 'Test Group',
				id: 'test-group-id',
			},
		],
		getActorGroupTurnText: jest.fn(() => 'Test Group Turn Text'),
		actorsByGroup: {
			'test-group-id': [
				{
					character: {
						characterData: {
							infoJSON: {
								imageURL: 'https://example.com/image.png',
							},
						},
					},
				},
			],
		},
	};
}

describe('KoboldEmbedUtils', () => {
	describe('KoboldEmbed', () => {
		test('creates a new extension of a message embed and sets it green', function () {
			const embed = new KoboldEmbed();
			expect(embed.data.color).toBe(5763719);
			expect(embed).toBeInstanceOf(EmbedBuilder);
		});
		describe('setCharacter', () => {
			test('sets the thumbnail of the embed to the character image url', function () {
				const embed = new KoboldEmbed();
				const character = {
					characterData: {
						infoJSON: {
							imageURL: 'https://example.com/image.png',
						},
					},
				};
				embed.setCharacter(character as Character);
				expect(embed.data.thumbnail).toMatchObject({
					url: 'https://example.com/image.png',
				});
			});
			test('does not set the thumbnail if the character does not have an image url', function () {
				const embed = new KoboldEmbed();
				const character = {
					characterData: {
						infoJSON: {},
					},
				};
				embed.setCharacter(character as Character);
				expect(embed.data.thumbnail).toBeNull();
			});
		});
		describe('turnFromInitiativeBuilder', () => {
			test('returns an error message if the initiative builder does not have an active group', function () {
				const embed = KoboldEmbed.turnFromInitiativeBuilder({
					...getFakeInitiativeBuilder(),
					activeGroup: null,
				} as any);
				expect(embed.data.title).toBe(
					"Yip! Something went wrong! I can't figure out whose turn it is!"
				);
			});
			test('sets the title to the active group name', function () {
				const initiativeBuilder = getFakeInitiativeBuilder();
				const embed = KoboldEmbed.turnFromInitiativeBuilder(initiativeBuilder as any);
				expect(embed.data.title).toContain('Test Group');
			});
			test('sets the description to the active group turn text', function () {
				const initiativeBuilder = getFakeInitiativeBuilder();
				const embed = KoboldEmbed.turnFromInitiativeBuilder(initiativeBuilder as any);
				expect(embed.data.description).toContain('Test Group');
			});
			test('sets the character if there is only one actor in the group', function () {
				const initiativeBuilder = getFakeInitiativeBuilder();
				const embed = KoboldEmbed.turnFromInitiativeBuilder(initiativeBuilder as any);
				expect(embed.data.thumbnail).toMatchObject({
					url: 'https://example.com/image.png',
				});
			});
			test('does not set the character if there is more than one actor in the group', function () {
				const initiativeBuilder = {
					...getFakeInitiativeBuilder(),
					actorsByGroup: {
						'test-group-id': [
							{
								character: {
									characterData: {
										infoJSON: {
											imageURL: 'https://example.com/image.png',
										},
									},
								},
							},
							{
								character: {
									characterData: {
										infoJSON: {
											imageURL: 'https://example.com/image.png',
										},
									},
								},
							},
						],
					},
				};
				const embed = KoboldEmbed.turnFromInitiativeBuilder(initiativeBuilder as any);
				expect(embed.data.thumbnail).toBeNull();
			});
			test('adds a link to the message url if there is one', function () {
				const initiativeBuilder = getFakeInitiativeBuilder();
				const embed = KoboldEmbed.turnFromInitiativeBuilder(
					initiativeBuilder as any,
					'https://example.com/message'
				);
				expect(embed.data.description).toContain('https://example.com/message');
			});
		});

		describe('roundFromInitiativeBuilder', () => {
			test('sets the title to the current round', function () {
				const initiativeBuilder = getFakeInitiativeBuilder();
				const embed = KoboldEmbed.roundFromInitiativeBuilder(initiativeBuilder as any);
				expect(embed.data.title).toContain('Round 1');
			});
			test('includes all the groups in the description', function () {
				const initiativeBuilder = {
					...getFakeInitiativeBuilder(),
					getActorGroupTurnText: jest.fn(group => `${group.name} Turn Text`),
					groups: [
						{
							name: 'Test Group 1',
							id: 'test-group-id-1',
						},
						{
							name: 'Test Group 2',
							id: 'test-group-id-2',
						},
					],
				};
				const embed = KoboldEmbed.roundFromInitiativeBuilder(initiativeBuilder as any);
				expect(embed.data.description).toContain('Test Group 1');
				expect(embed.data.description).toContain('Test Group 2');
			});
			test('still works if there are no groups', function () {
				const initiativeBuilder = {
					...getFakeInitiativeBuilder(),
					groups: [],
				};
				const embed = KoboldEmbed.roundFromInitiativeBuilder(initiativeBuilder as any);
				expect(embed.data.description).toBe('');
			});
			test('works if the initiative has no current round', function () {
				const initiativeBuilder = {
					...getFakeInitiativeBuilder(),
					init: { currentRound: null },
				};
				const embed = KoboldEmbed.roundFromInitiativeBuilder(initiativeBuilder as any);
				expect(embed.data.title).toContain('Round 0');
			});
		});
	});
});
