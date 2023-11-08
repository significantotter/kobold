import { ChatInputCommandInteraction, TextBasedChannel } from 'discord.js';
import {
	InitiativeWithRelations,
	InitiativeModel,
	Character,
	UserSettings,
	Sheet,
} from '../../services/kobold/index.js';
import { Kobold } from '../../services/kobold/kobold.model.js';
import { KoboldError } from '../KoboldError.js';
import type { KoboldUtils } from './kobold-utils.js';
import L from '../../i18n/i18n-node.js';
import { InitiativeBuilder, InitiativeBuilderUtils } from '../initiative-builder.js';

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

	public async addActorToInitiative({
		initiativeId,
		characterId,
		userId,
		name,
		initiativeResult,
		sheet,
		hideStats,
	}: {
		initiativeId: number;
		characterId: number;
		userId: string;
		name: string;
		initiativeResult: number;
		sheet: Sheet;
		hideStats?: boolean;
	}) {
		const actorGroup = await this.kobold.initiativeActorGroup.create({
			initiativeId,
			userId,
			name,
			initiativeResult,
		});
		const actor = await this.kobold.initiativeActor.create({
			initiativeId,
			name,
			characterId,
			sheet,
			userId,
			hideStats,
			initiativeActorGroupId: actorGroup.id,
		});
		return actor;
	}
}
