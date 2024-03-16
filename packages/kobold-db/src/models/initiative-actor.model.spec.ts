import { generateMock } from '@anatine/zod-mock';
import { zInitiativeActorInitializer } from '../index.js';
import _ from 'lodash';
import { truncateDbForTests, ResourceFactories, vitestKobold } from '../test-utils.js';

describe('InitiativeActorModel', () => {
	afterEach(async () => {
		await truncateDbForTests();
	});
	describe('create, read', () => {
		it('creates a new initiativeActor, reads it, and returns the initiativeActor plus relations', async () => {
			const initiative = await ResourceFactories.initiative();
			const game = await ResourceFactories.game();
			const initiativeActorGroup = await ResourceFactories.initiativeActorGroup({
				initiativeId: initiative.id,
			});
			const sheetRecord = await ResourceFactories.sheetRecord();
			const character = await ResourceFactories.character({ sheetRecordId: sheetRecord.id });
			const fakeInitiativeActorMock = generateMock(zInitiativeActorInitializer);

			fakeInitiativeActorMock.gameId = game.id;
			fakeInitiativeActorMock.initiativeId = initiative.id;
			fakeInitiativeActorMock.initiativeActorGroupId = initiativeActorGroup.id;
			fakeInitiativeActorMock.characterId = character.id;
			fakeInitiativeActorMock.sheetRecordId = sheetRecord.id;

			const created = await vitestKobold.initiativeActor.create(fakeInitiativeActorMock);
			const read = await vitestKobold.initiativeActor.read({ id: created.id });
			expect(created).toMatchObject(fakeInitiativeActorMock);
			expect(read).toMatchObject(fakeInitiativeActorMock);
		});

		it('reads the relations of the initiativeActor', async () => {
			let fakeInitiativeActor = _.omit(
				await ResourceFactories.initiativeActor(),
				'actors',
				'initiative',
				'currentTurnGroup'
			);

			const read = await vitestKobold.initiativeActor.read({ id: fakeInitiativeActor.id });
			expect(read).toMatchObject({
				...fakeInitiativeActor,
			});
		});
	});
	describe('update', () => {
		it('updates a initiativeActor', async () => {
			const fakeInitiativeActor = await ResourceFactories.initiativeActor();
			const updated = await vitestKobold.initiativeActor.update(
				{ id: fakeInitiativeActor.id },
				{ userId: 'new user' }
			);
			expect(updated).toEqual({
				...fakeInitiativeActor,
				userId: 'new user',
			});
		});
		it('fails to update a initiativeActor if the initiativeActor id is invalid', async () => {
			await expect(
				vitestKobold.initiativeActor.update({ id: -1 }, { userId: 'new user' })
			).rejects.toThrow();
		});
	});
	describe('delete', () => {
		it('deletes a initiativeActor', async () => {
			const fakeInitiativeActor = await ResourceFactories.initiativeActor();
			await vitestKobold.initiativeActor.delete({ id: fakeInitiativeActor.id });
			const read = await vitestKobold.initiativeActor.read({ id: fakeInitiativeActor.id });
			expect(read).toEqual(null);
		});
		it('fails to delete a initiativeActor if the initiativeActor does not exist', async () => {
			await expect(vitestKobold.initiativeActor.delete({ id: -1 })).rejects.toThrow();
		});
	});
});
