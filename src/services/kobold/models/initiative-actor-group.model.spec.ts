import { generateMock } from '@anatine/zod-mock';
import {
	ResourceFactories,
	truncateDbForTests,
	vitestKobold,
} from '../../../utils/discord-test-utils.js';
import { zInitiativeActorGroupInitializer } from '../index.js';
import _ from 'lodash';

describe('InitiativeActorGroupModel', () => {
	afterEach(async () => {
		await truncateDbForTests();
	});
	describe('create, read', () => {
		it('creates a new initiativeActorGroup, reads it, and returns the initiativeActorGroup plus relations', async () => {
			const initiative = await ResourceFactories.initiative();
			const fakeInitiativeActorGroupMock = generateMock(zInitiativeActorGroupInitializer);
			fakeInitiativeActorGroupMock.initiativeId = initiative.id;

			const created = await vitestKobold.initiativeActorGroup.create(
				fakeInitiativeActorGroupMock
			);
			expect(created).toMatchObject(fakeInitiativeActorGroupMock);

			const initiativeActors = await Promise.all([
				ResourceFactories.initiativeActor({
					initiativeId: initiative.id,
					initiativeActorGroupId: created.id,
				}),
				ResourceFactories.initiativeActor({
					initiativeId: initiative.id,
					initiativeActorGroupId: created.id,
				}),
			]);
			const read = await vitestKobold.initiativeActorGroup.read({ id: created.id });
			expect(read).toMatchObject(fakeInitiativeActorGroupMock);
			expect(read?.actors.length).toBe(2);
			expect(read?.actors.map(actor => actor.id)).toContain(initiativeActors[0].id);
			expect(read?.actors.map(actor => actor.id)).toContain(initiativeActors[1].id);
		});

		it('reads the relations of the initiativeActorGroup', async () => {
			let fakeInitiativeActorGroup = _.omit(
				await ResourceFactories.initiativeActorGroup(),
				'actors',
				'initiative',
				'currentTurnGroup'
			);

			const read = await vitestKobold.initiativeActorGroup.read({
				id: fakeInitiativeActorGroup.id,
			});
			expect(read).toMatchObject({
				...fakeInitiativeActorGroup,
			});
		});
	});
	describe('update', () => {
		it('updates a initiativeActorGroup', async () => {
			const fakeInitiativeActorGroup = await ResourceFactories.initiativeActorGroup();
			const updated = await vitestKobold.initiativeActorGroup.update(
				{ id: fakeInitiativeActorGroup.id },
				{ userId: 'new user' }
			);
			expect(updated).toEqual({
				...fakeInitiativeActorGroup,
				userId: 'new user',
			});
		});
		it('fails to update a initiativeActorGroup if the initiativeActorGroup id is invalid', async () => {
			await expect(
				vitestKobold.initiativeActorGroup.update({ id: -1 }, { userId: 'new user' })
			).rejects.toThrow();
		});
	});
	describe('delete', () => {
		it('deletes a initiativeActorGroup', async () => {
			const fakeInitiativeActorGroup = await ResourceFactories.initiativeActorGroup();
			await vitestKobold.initiativeActorGroup.delete({ id: fakeInitiativeActorGroup.id });
			const read = await vitestKobold.initiativeActorGroup.read({
				id: fakeInitiativeActorGroup.id,
			});
			expect(read).toEqual(null);
		});
		it('fails to delete a initiativeActorGroup if the initiativeActorGroup does not exist', async () => {
			await expect(vitestKobold.initiativeActorGroup.delete({ id: -1 })).rejects.toThrow();
		});
	});
});
