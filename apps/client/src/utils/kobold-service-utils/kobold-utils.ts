import { Interaction } from 'discord.js';
import _ from 'lodash';
import { SetNonNullable } from 'type-fest';
import {
	CharacterBasic,
	CharacterWithRelations,
	GameWithCharactersLite,
	InitiativeWithRelations,
	Kobold,
	UserSettings,
} from '@kobold/db';
import { KoboldError } from '../KoboldError.js';
import { AdjustedSheetService } from './adjusted-sheet-service.js';
import { AutocompleteUtils } from './autocomplete-utils.js';
import { CharacterUtils } from './character-utils.js';
import { CreatureUtils } from './creature-utils.js';
import { GameUtils } from './game-utils.js';
import { GameplayUtils } from './gameplay-utils.js';
import { InitiativeUtils } from './initiative-utils.js';
import { ModifierUtils } from './modifier-utils.js';
import { NpcUtils } from './npc-utils.js';
import { UserSettingsUtils } from './user-settings-utils.js';

export interface InjectedData {
	activeCharacter: CharacterWithRelations | null;
	activeCharacterLite: CharacterBasic | null;
	ownedCharacters: CharacterWithRelations[];
	userSettings: UserSettings;
	activeGame: GameWithCharactersLite | null;
	currentInitiative: InitiativeWithRelations | null;
	currentInitiativeLite: InitiativeWithRelations | null;
}

export type InjectableCommandData = { [K in keyof InjectedData]?: boolean };

export class KoboldUtils {
	public characterUtils: CharacterUtils;
	public gameUtils: GameUtils;
	public initiativeUtils: InitiativeUtils;
	public modifierUtils: ModifierUtils;
	public npcUtils: NpcUtils;
	public userSettingsUtils: UserSettingsUtils;
	public autocompleteUtils: AutocompleteUtils;
	public gameplayUtils: GameplayUtils;
	public creatureUtils: CreatureUtils;
	public adjustedSheetService: AdjustedSheetService;
	constructor(public kobold: Kobold) {
		this.characterUtils = new CharacterUtils(this);
		this.gameUtils = new GameUtils(this);
		this.initiativeUtils = new InitiativeUtils(this);
		this.modifierUtils = new ModifierUtils(this);
		this.npcUtils = new NpcUtils(this);
		this.userSettingsUtils = new UserSettingsUtils(this);
		this.autocompleteUtils = new AutocompleteUtils(this);
		this.gameplayUtils = new GameplayUtils(this);
		this.creatureUtils = new CreatureUtils(this);
		this.adjustedSheetService = new AdjustedSheetService(kobold);
	}

	public async fetchDataForCommand<T extends InjectableCommandData>(
		intr: Interaction,
		usesData: T
	): Promise<{ [k in keyof T]: k extends keyof InjectedData ? InjectedData[k] : never }> {
		let activeCharacterPromise = usesData.activeCharacter
			? this.kobold.character.readActive({
					userId: intr.user.id,
					guildId: intr.guild?.id,
					channelId: intr.channel?.id,
				})
			: Promise.resolve(undefined);

		let activeCharacterLitePromise = usesData.activeCharacterLite
			? this.kobold.character.readActiveLite({
					userId: intr.user.id,
					guildId: intr.guild?.id,
					channelId: intr.channel?.id,
				})
			: Promise.resolve(undefined);

		let ownedCharactersPromise = usesData.ownedCharacters
			? this.kobold.character.readMany({ userId: intr.user.id })
			: Promise.resolve(undefined);

		let userSettingsPromise = usesData.userSettings
			? this.userSettingsUtils.getSettingsForUser(intr)
			: Promise.resolve(undefined);

		let activeGamePromise =
			usesData.activeGame && intr.guild
				? this.gameUtils.getActiveGame(intr.user.id, intr.guild?.id, intr.channel?.id)
				: Promise.resolve(undefined);

		let currentInitiativePromise = usesData.currentInitiative
			? this.initiativeUtils.getInitiativeForChannelOrNull(intr.channel)
			: Promise.resolve(undefined);

		let currentInitiativeLitePromise = usesData.currentInitiativeLite
			? this.initiativeUtils.getInitiativeForChannelOrNullLite(intr.channel)
			: Promise.resolve(undefined);

		let [
			activeCharacter,
			activeCharacterLite,
			ownedCharacters,
			userSettings,
			activeGame,
			currentInitiative,
			currentInitiativeLite,
		] = await Promise.all([
			activeCharacterPromise,
			activeCharacterLitePromise,
			ownedCharactersPromise,
			userSettingsPromise,
			activeGamePromise,
			currentInitiativePromise,
			currentInitiativeLitePromise,
		]);

		return _.pickBy(
			{
				activeCharacter,
				activeCharacterLite,
				ownedCharacters,
				userSettings,
				activeGame,
				currentInitiative,
				currentInitiativeLite,
			},
			val => val !== undefined
		) as { [k in keyof T]: k extends keyof InjectedData ? InjectedData[k] : never };
	}
	public async fetchNonNullableDataForCommand<T extends InjectableCommandData>(
		intr: Interaction,
		usesData: T
	) {
		return await this.fetchDataForCommand(intr, usesData).then(data => {
			this.assertDataNotNull(data);
			return data;
		});
	}

	public assertDataNotNull<T extends Partial<InjectedData>>(
		data: T
	): asserts data is SetNonNullable<T> {
		if (data.activeCharacter !== undefined)
			this.assertActiveCharacterNotNull(data.activeCharacter);
		if (data.activeCharacterLite !== undefined)
			this.assertActiveCharacterLiteNotNull(data.activeCharacterLite);
		if (data.activeGame !== undefined) this.assertActiveGameNotNull(data.activeGame);
		if (data.currentInitiative !== undefined)
			this.assertCurrentInitiativeNotNull(data.currentInitiative);
		if (data.currentInitiativeLite !== undefined)
			this.assertCurrentInitiativeNotNull(data.currentInitiativeLite);
		if (data.ownedCharacters !== undefined)
			this.assertOwnedCharactersNotEmpty(data.ownedCharacters);
	}

	public assertActiveCharacterNotNull(
		data: InjectedData['activeCharacter'] | null
	): asserts data is NonNullable<InjectedData['activeCharacter']> {
		if (data == null)
			throw new KoboldError("Yip! You don't have any characters! Use /import to import one.");
	}

	public assertActiveCharacterLiteNotNull(
		data: InjectedData['activeCharacterLite'] | null
	): asserts data is NonNullable<InjectedData['activeCharacterLite']> {
		if (data == null)
			throw new KoboldError("Yip! You don't have any characters! Use /import to import one.");
	}

	public assertActiveGameNotNull(
		data: InjectedData['activeGame'] | null
	): asserts data is NonNullable<InjectedData['activeGame']> {
		if (data == null)
			throw new KoboldError('Yip! You must have an active game to use this command.');
	}

	public assertCurrentInitiativeNotNull(
		data: InjectedData['currentInitiative'] | null
	): asserts data is NonNullable<InjectedData['currentInitiative']> {
		if (data == null)
			throw new KoboldError('Yip! You must be in an initiative to use this command.');
	}

	public assertOwnedCharactersNotEmpty(data: InjectedData['ownedCharacters'] | null) {
		if (data == null)
			throw new KoboldError("Yip! You don't have any characters! Use /import to import one.");
	}
}
