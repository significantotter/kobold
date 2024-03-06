import { ChatInputCommandInteraction, TextBasedChannel } from 'discord.js';
import L from '../../i18n/i18n-node.js';
import { CharacterWithRelations, InitiativeWithRelations, Kobold, Sheet } from 'kobold-db';
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
			throw new KoboldError(L.en.utils.initiative.initOutsideServerChannelError());
		}
		const channelId = channel.id;

		let currentInit: InitiativeWithRelations;
		const currentInitOptions = await this.kobold.initiative.readMany({ channelId: channelId });
		if (currentInitOptions.length === 0) {
			throw new KoboldError(L.en.utils.initiative.noActiveInitError());
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
}
