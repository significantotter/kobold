import { os } from '@orpc/server';
import { z } from 'zod';
import type { AppContext } from '../context.js';
import {
	zLibraryWorkspace,
	toActionWorkspaceItem,
	toMinionWorkspaceItem,
	toModifierWorkspaceItem,
	toRollMacroWorkspaceItem,
} from './workspace-shared.js';

const orpc = os.$context<AppContext>();

function requireAuth(userId: string | null): asserts userId is string {
	if (!userId) {
		throw new Error('You must be logged in to perform this action.');
	}
}

const getLibraryWorkspace = orpc
	.input(z.object({}).optional())
	.output(zLibraryWorkspace)
	.handler(async ({ context }) => {
		requireAuth(context.userId);
		const userId = context.userId;

		const [sharedActions, sharedRollMacros, unassignedModifiers, allMinions] =
			await Promise.all([
				context.kobold.action.readManyByUser({ userId, filter: 'user' }),
				context.kobold.rollMacro.readManyByUser({ userId, filter: 'user' }),
				context.kobold.modifier.readManyUserWide({ userId }),
				context.kobold.minion.readManyByUserId({ userId }),
			]);

		const unassignedMinions = allMinions.filter(minion => minion.characterId === null);

		return {
			overview: {
				sharedActionCount: sharedActions.length,
				sharedRollMacroCount: sharedRollMacros.length,
				unassignedModifierCount: unassignedModifiers.length,
				unassignedMinionCount: unassignedMinions.length,
			},
			sharedActions: sharedActions.map(action =>
				toActionWorkspaceItem(action, {
					scope: 'library',
					assignment: 'inherited-all',
					source: 'Library',
				})
			),
			sharedRollMacros: sharedRollMacros.map(rollMacro =>
				toRollMacroWorkspaceItem(rollMacro, {
					scope: 'library',
					assignment: 'inherited-all',
					source: 'Library',
					capabilities: {
						canEdit: true,
						canDelete: true,
					},
				})
			),
			unassignedModifiers: unassignedModifiers.map(modifier =>
				toModifierWorkspaceItem(modifier, {
					scope: 'library',
					assignment: 'none',
					source: 'Library',
				})
			),
			unassignedMinions: unassignedMinions.map(minion =>
				toMinionWorkspaceItem(minion, {
					scope: 'library',
					assignment: 'none',
					source: 'Library',
					capabilities: {
						canEdit: true,
						canDelete: true,
						canAssign: true,
					},
				})
			),
			capabilities: {
				canCreateRollMacro: true,
				canImportWgCharacter: true,
				canImportPathbuilderCharacter: true,
				canManageModifiers: false,
				canManageMinions: true,
			},
		};
	});

export const libraryRouter = orpc.router({
	getLibraryWorkspace,
});

export type LibraryRouter = typeof libraryRouter;
