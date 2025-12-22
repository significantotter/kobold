import { Initiative, zInitiativeInitializer } from '../index.js';
import _ from 'lodash';
import { truncateDbForTests, vitestKobold, ResourceFactories, fake } from '../test-utils.js';

describe('InitiativeModel', () => {
	afterEach(async () => {
		await truncateDbForTests();
	});
	describe('create, read', () => {
		it('creates a new initiative, reads it, and returns the initiative plus relations', async () => {
			const fakeInitiativeMock = fake(zInitiativeInitializer);

			const created = await vitestKobold.initiative.create(fakeInitiativeMock);
			const read = await vitestKobold.initiative.read({ id: created.id });
			expect(created).toMatchObject(fakeInitiativeMock);
			expect(read).toMatchObject(fakeInitiativeMock);
		});

		it('reads the relations of the initiative', async () => {
			let fakeInitiative: Initiative = _.omit(
				await ResourceFactories.initiative(),
				'actors',
				'actorGroups',
				'currentTurnGroup'
			);
			const [fakeInitiativeActor, fakeInitiativeActor2] = await Promise.all([
				ResourceFactories.initiativeActor({ initiativeId: fakeInitiative.id }),
				ResourceFactories.initiativeActor({ initiativeId: fakeInitiative.id }),
			]);
			fakeInitiative = await vitestKobold.initiative.update(
				{ id: fakeInitiative.id },
				{ currentTurnGroupId: fakeInitiativeActor2.actorGroup.id }
			);

			const read = await vitestKobold.initiative.read({ id: fakeInitiative.id });
			expect(read).toMatchObject({
				...fakeInitiative,
			});
			expect(read?.actors.length).toBe(2);
			expect(read?.actors.map(actor => actor.id)).toContain(fakeInitiativeActor.id);
			expect(read?.actors.map(actor => actor.id)).toContain(fakeInitiativeActor2.id);
			expect(read?.actorGroups.length).toBe(2);
			expect(read?.actorGroups.map(actorGroup => actorGroup.id)).toContain(
				fakeInitiativeActor.actorGroup.id
			);
			expect(read?.actorGroups.map(actorGroup => actorGroup.id)).toContain(
				fakeInitiativeActor2.actorGroup.id
			);
			expect(read?.currentTurnGroup?.id).toBe(fakeInitiativeActor2.actorGroup.id);
		});
	});
	describe('update', () => {
		it('updates a initiative', async () => {
			const fakeInitiative = await ResourceFactories.initiative();
			const updated = await vitestKobold.initiative.update(
				{ id: fakeInitiative.id },
				{ gmUserId: 'new gm user' }
			);
			expect(updated).toEqual({
				...fakeInitiative,
				gmUserId: 'new gm user',
			});
		});
		it('fails to update a initiative if the initiative id is invalid', async () => {
			await expect(
				vitestKobold.initiative.update({ id: -1 }, { gmUserId: 'new gm user' })
			).rejects.toThrow();
		});
	});
	describe('delete', () => {
		it('deletes a initiative', async () => {
			const fakeInitiative = await ResourceFactories.initiative();
			await vitestKobold.initiative.delete({ id: fakeInitiative.id });
			const read = await vitestKobold.initiative.read({ id: fakeInitiative.id });
			expect(read).toEqual(null);
		});
		it('fails to delete a initiative if the initiative does not exist', async () => {
			await expect(vitestKobold.initiative.delete({ id: -1 })).rejects.toThrow();
		});
	});
});
