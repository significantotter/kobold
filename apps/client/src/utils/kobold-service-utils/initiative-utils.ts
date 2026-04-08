import { ChatInputCommandInteraction, TextBasedChannel } from 'discord.js';
import { utilStrings } from '@kobold/documentation';
import {
	CharacterWithRelations,
	InitiativeWithRelations,
	Kobold,
	MinionBasic,
	MinionWithRelations,
	Sheet,
} from '@kobold/db';
import { KoboldError } from '../KoboldError.js';
import { InitiativeBuilderUtils } from '../initiative-builder.js';
import type { KoboldUtils } from './kobold-utils.js';

export class InitiativeUtils {
	private kobold: Kobold;
	constructor(private koboldUtils: KoboldUtils) {
		this.kobold = koboldUtils.kobold;
	}

	public async getInitiativeForChannel(
		channel: TextBasedChannel | null
	): Promise<InitiativeWithRelations | null> {
		let errorMessage = null;
		if (!channel || !channel.id) {
			throw new KoboldError(utilStrings.initiative.initOutsideServerChannelError);
		}
		const channelId = channel.id;

		let currentInit: InitiativeWithRelations;
		const currentInitOptions = await this.kobold.initiative.readMany({ channelId: channelId });
		if (currentInitOptions.length === 0) {
			throw new KoboldError(utilStrings.initiative.noActiveInitError);
		} else {
			currentInit = currentInitOptions[0];
		}
		return currentInit;
	}
	public async getInitiativeForChannelOrNull(channel: TextBasedChannel | null) {
		try {
			return await this.getInitiativeForChannel(channel);
		} catch (err) {
			return null;
		}
	}

	/**
	 * Lite variant — skips actions and rollMacros for actors.
	 * Use for display, turn management, and other non-mechanical paths.
	 */
	public async getInitiativeForChannelLite(
		channel: TextBasedChannel | null
	): Promise<InitiativeWithRelations | null> {
		if (!channel || !channel.id) {
			throw new KoboldError(utilStrings.initiative.initOutsideServerChannelError);
		}
		const currentInitOptions = await this.kobold.initiative.readManyLite({
			channelId: channel.id,
		});
		if (currentInitOptions.length === 0) {
			throw new KoboldError(utilStrings.initiative.noActiveInitError);
		}
		return currentInitOptions[0];
	}

	public async getInitiativeForChannelOrNullLite(channel: TextBasedChannel | null) {
		try {
			return await this.getInitiativeForChannelLite(channel);
		} catch (err) {
			return null;
		}
	}

	public async getInitActorByName(intr: ChatInputCommandInteraction, name: string) {
		let currentInit = await this.getInitiativeForChannelOrNull(intr.channel);
		if (!currentInit) return null;

		const actor = await InitiativeBuilderUtils.getNameMatchActorFromInitiative(
			intr.user.id,
			currentInit,
			name,
			false
		);
		return actor;
	}

	public async createActorFromCharacter({
		initiativeId,
		character,
		initiativeResult,
		hideStats,
		name,
	}: {
		initiativeId: number;
		character: CharacterWithRelations;
		initiativeResult: number;
		hideStats?: boolean;
		name?: string;
	}) {
		const actorGroup = await this.kobold.initiativeActorGroup.create({
			initiativeId,
			userId: character.userId,
			name: character.name,
			initiativeResult,
		});
		const actor = await this.kobold.initiativeActor.create({
			initiativeId,
			name: name ?? character.name,
			characterId: character.id,
			sheetRecordId: character.sheetRecordId,
			userId: character.userId,
			hideStats: hideStats ?? false,
			initiativeActorGroupId: actorGroup.id,
		});
		return actor;
	}

	public async createActorFromSheet({
		initiativeId,
		sheet,
		name,
		userId,
		initiativeResult,
		hideStats,
	}: {
		initiativeId: number;
		sheet: Sheet;
		userId: string;
		name: string;
		initiativeResult: number;
		hideStats?: boolean;
	}) {
		const actorGroup = await this.kobold.initiativeActorGroup.create({
			initiativeId,
			userId,
			name,
			initiativeResult,
		});
		const sheetRecord = await this.kobold.sheetRecord.create({
			sheet,
		});
		const actor = await this.kobold.initiativeActor.create({
			initiativeId,
			name,
			sheetRecordId: sheetRecord.id,
			userId,
			hideStats: hideStats ?? false,
			initiativeActorGroupId: actorGroup.id,
		});
		return actor;
	}

	/**
	 * Creates an initiative actor from a minion.
	 *
	 * By default (separateTurn=false), the minion joins the parent character's
	 * existing InitiativeActorGroup and acts on the same turn, appearing after
	 * the character.
	 *
	 * With separateTurn=true, the minion gets its own InitiativeActorGroup with
	 * its own initiative roll and acts independently.
	 */
	public async createActorFromMinion({
		initiativeId,
		minion,
		characterActorGroupId,
		initiativeResult,
		separateTurn = false,
		hideStats,
		name,
	}: {
		initiativeId: number;
		minion: MinionBasic;
		/** Parent character's actor group ID. Required if separateTurn=false */
		characterActorGroupId?: number;
		/** Initiative roll result. Required if separateTurn=true */
		initiativeResult?: number;
		/** If true, create a separate initiative group for the minion */
		separateTurn?: boolean;
		hideStats?: boolean;
		name?: string;
	}) {
		let actorGroupId: number;

		if (separateTurn) {
			// Create a new initiative group for the minion
			if (initiativeResult === undefined) {
				throw new KoboldError(
					'Yip! Initiative result is required when minion has a separate turn.'
				);
			}
			const actorGroup = await this.kobold.initiativeActorGroup.create({
				initiativeId,
				userId: minion.userId,
				name: name ?? minion.name,
				initiativeResult,
			});
			actorGroupId = actorGroup.id;
		} else {
			// Join the parent character's initiative group
			if (characterActorGroupId === undefined) {
				throw new KoboldError(
					"Yip! Character's actor group ID is required when minion joins the same turn."
				);
			}
			actorGroupId = characterActorGroupId;
		}

		// Minion now always has a sheetRecordId (required)
		const sheetRecordId = minion.sheetRecordId;

		const actor = await this.kobold.initiativeActor.create({
			initiativeId,
			name: name ?? minion.name,
			minionId: minion.id,
			sheetRecordId,
			userId: minion.userId,
			hideStats: hideStats ?? false,
			initiativeActorGroupId: actorGroupId,
		});
		return actor;
	}
}
