import { z } from 'zod';
import { zMinionWithRelations } from '@kobold/db';
import { orpc, requireAuth, getOwnedMinionOrThrow, assertUniqueMinionNameInScope, moveOwnedMinion, deleteOwnedMinion, type MinionMutationProcedure, zRenameMinionInput, zAssignMinionInput, zUnassignMinionInput, zUpdateMinionAutoJoinInitiativeInput, zDeleteMinionInput } from './shared.js';

export const renameMinion: MinionMutationProcedure<typeof zRenameMinionInput> = orpc
	.input(zRenameMinionInput)
	.output(zMinionWithRelations)
	.handler(async ({ input, context }) => {
		requireAuth(context.userId);
		const minion = await getOwnedMinionOrThrow({ context, minionId: input.minionId });

		await assertUniqueMinionNameInScope({
			context,
			userId: context.userId,
			name: input.name,
			characterId: minion.characterId,
			excludeMinionId: minion.id,
		});

		return context.kobold.minion.update({ id: minion.id }, { name: input.name });
	});

export const assignMinion: MinionMutationProcedure<typeof zAssignMinionInput> = orpc
	.input(zAssignMinionInput)
	.output(zMinionWithRelations)
	.handler(async ({ input, context }) => {
		requireAuth(context.userId);
		return moveOwnedMinion({
			context,
			minionId: input.minionId,
			characterId: input.characterId,
		});
	});

export const unassignMinion: MinionMutationProcedure<typeof zUnassignMinionInput> = orpc
	.input(zUnassignMinionInput)
	.output(zMinionWithRelations)
	.handler(async ({ input, context }) => {
		requireAuth(context.userId);
		return moveOwnedMinion({
			context,
			minionId: input.minionId,
			characterId: null,
		});
	});

export const updateMinionAutoJoinInitiative: MinionMutationProcedure<
	typeof zUpdateMinionAutoJoinInitiativeInput
> = orpc
	.input(zUpdateMinionAutoJoinInitiativeInput)
	.output(zMinionWithRelations)
	.handler(async ({ input, context }) => {
		requireAuth(context.userId);
		const minion = await getOwnedMinionOrThrow({ context, minionId: input.minionId });
		return context.kobold.minion.update(
			{ id: minion.id },
			{ autoJoinInitiative: input.autoJoinInitiative }
		);
	});

export const deleteMinion = orpc
	.input(zDeleteMinionInput)
	.output(z.object({ deletedMinionId: z.number() }))
	.handler(async ({ input, context }) => {
		requireAuth(context.userId);
		await deleteOwnedMinion({ context, minionId: input.minionId });
		return {
			deletedMinionId: input.minionId,
		};
	});

