import {
	APIEmbed,
	APIEmbedField,
	ChatInputCommandInteraction,
	CommandInteraction,
	EmbedBuilder,
	EmbedData,
} from 'discord.js';
import _ from 'lodash';
import L from '../i18n/i18n-node.js';
import { TranslationFunctions } from '../i18n/i18n-types.js';
import {
	Action,
	CharacterWithRelations,
	Sheet,
	SheetInfoLists,
	SheetRecord,
	SheetWeaknessesResistances,
} from '../services/kobold/index.js';
import { KoboldError } from './KoboldError.js';
import type { ActionRoller } from './action-roller.js';
import type { InitiativeBuilder, TurnData } from './initiative-builder.js';
import { InteractionUtils } from './interaction-utils.js';

export class KoboldEmbed extends EmbedBuilder {
	public constructor(data?: APIEmbed | EmbedData) {
		super(data);
		this.setColor('Green');
	}
	/**
	 * Sets character specific attributes for the embed: currently just the thumbnail
	 * @param character The character to set the attributes for
	 */
	public setSheetRecord(sheetRecord: SheetRecord) {
		if (sheetRecord.sheet.info.imageURL) {
			this.setThumbnail(sheetRecord.sheet.info.imageURL);
		}
		return this;
	}
	public setCharacter(character: CharacterWithRelations) {
		return this.setSheetRecord(character.sheetRecord);
	}

	public static async sendInitiative(
		intr: ChatInputCommandInteraction,
		initiativeBuilder: InitiativeBuilder,
		LL?: TranslationFunctions,
		options: {
			dmIfHiddenCreatures?: boolean;
		} = { dmIfHiddenCreatures: false }
	) {
		const embed = await KoboldEmbed.roundFromInitiativeBuilder(initiativeBuilder, LL, {
			showHiddenCreatureStats: false,
		});
		if (
			initiativeBuilder.hasActorsWithHiddenStats() &&
			initiativeBuilder.init.gmUserId &&
			options.dmIfHiddenCreatures
		) {
			const embedWithHiddenStats = await KoboldEmbed.roundFromInitiativeBuilder(
				initiativeBuilder,
				LL,
				{
					showHiddenCreatureStats: true,
				}
			);
			if (initiativeBuilder.userSettings?.initStatsNotification !== 'never') {
				await intr.client.users.send(initiativeBuilder.init.gmUserId, {
					embeds: [embedWithHiddenStats],
				});
			}
		}

		await InteractionUtils.send(intr, { embeds: [embed] });
	}

	public static async dmInitiativeWithHiddenStats({
		intr,
		initBuilder,
		currentTurn,
		targetTurn,
		LL,
	}: {
		intr: ChatInputCommandInteraction;
		initBuilder: InitiativeBuilder;
		currentTurn: TurnData;
		targetTurn: TurnData;
		LL: TranslationFunctions;
	}) {
		const embedWithHiddenStats = await KoboldEmbed.roundFromInitiativeBuilder(initBuilder, LL, {
			showHiddenCreatureStats: true,
		});
		const initStatsNotificationSetting = initBuilder.userSettings.initStatsNotification;
		let dmMessage = false;
		switch (initStatsNotificationSetting) {
			case 'every_turn':
				dmMessage = true;
				break;
			case 'every_round':
				if (targetTurn.currentRound > currentTurn.currentRound) dmMessage = true;
				break;
			case 'whenever_hidden':
				if (
					initBuilder.currentTurnGroup &&
					initBuilder.actorsByGroup[initBuilder.currentTurnGroup.id].some(
						actor => actor.hideStats
					)
				)
					dmMessage = true;
		}
		if (dmMessage) {
			await intr.client.users.send(initBuilder.init.gmUserId, {
				embeds: [embedWithHiddenStats],
			});
		}
	}

	public static turnFromInitiativeBuilder(
		initiativeBuilder: InitiativeBuilder,
		LL?: TranslationFunctions
	) {
		LL = LL || L.en;
		const result = new KoboldEmbed();
		const groupTurn = initiativeBuilder.activeGroup;
		if (!groupTurn) {
			result.setTitle(LL.utils.koboldEmbed.cantDetermineTurnError());
			return result;
		}
		result.setTitle(
			LL.utils.koboldEmbed.turnTitle({
				groupName: groupTurn.name,
			})
		);
		result.addFields([
			{
				name: LL.utils.koboldEmbed.roundTitle({
					currentRound: initiativeBuilder.init?.currentRound || 0,
				}),
				value: initiativeBuilder.getAllGroupsTurnText(),
			},
		]);

		if (initiativeBuilder.actorsByGroup[groupTurn.id].length === 1) {
			const actor = initiativeBuilder.actorsByGroup[groupTurn.id][0];
			if (actor.characterId) {
				result.setSheetRecord(actor.sheetRecord);
			}
		}
		return result;
	}
	public static roundFromInitiativeBuilder(
		initiativeBuilder: InitiativeBuilder,
		LL?: TranslationFunctions,
		options: {
			showHiddenCreatureStats?: boolean;
		} = { showHiddenCreatureStats: false }
	) {
		LL = LL || L.en;
		const result = new KoboldEmbed().setTitle(
			LL.utils.koboldEmbed.roundTitle({
				currentRound: initiativeBuilder.init?.currentRound || 0,
			})
		);
		result.setDescription(initiativeBuilder.getAllGroupsTurnText(options));
		return result;
	}
	public determineEmbedMetaTextLength(): number {
		let length = 0;
		length += this.data?.title?.length || 0;
		length += this.data?.description?.length || 0;
		length += this.data?.footer?.text?.length || 0;
		length += this.data?.author?.name?.length || 0;
		return length;
	}

	public isOverSized() {
		return (
			this.determineEmbedFieldTextLength() + this.determineEmbedMetaTextLength() > 6000 ||
			(this.data?.fields ?? []).length > 25
		);
	}

	public splitField(field: APIEmbedField) {
		// leave the name the same, adding 'cont\'d' to the end of split fields, splitting values on word boundaries if possible
		const splitFields: APIEmbedField[] = [];

		// first, split on newlines
		const splitValues = field.value.split('\n');

		// add values to a field until a value would make it too large. If a single value + a name is too large, split on spaces
		let newField: APIEmbedField = {
			name: field.name,
			value: '',
		};
		for (const splitValue of splitValues) {
			if (splitValue.length + field.name.length > 1024) {
				// split the value on periods
				const splitWords = splitValue.split('.');
				for (const splitWord of splitWords) {
					if (newField.value.length + splitWord.length > 1024) {
						// add the new field to the list of fields
						splitFields.push(newField);
						// create a new field
						newField = {
							name: '\u200b',
							value: '',
						};
					}
					newField.value += splitWord + '.';
				}
			}
			if (newField.value.length + splitValue.length > 1024) {
				// add the new field to the list of fields
				splitFields.push(newField);
				// create a new field
				newField = {
					name: '\u200b',
					value: '',
				};
			}
			newField.value += splitValue + '\n';
		}
		if (newField.value.length > 0) splitFields.push(newField);
		return splitFields;
	}

	public splitFieldsThatAreTooLong() {
		if (!this.data.fields) return;
		for (let i = 0; i < this.data.fields.length; i++) {
			const field = this.data.fields[i];
			if (field.name.length + field.value.length > 1024) {
				const splitFields = this.splitField(field);
				this.data.fields.splice(i, 1, ...splitFields);
			}
		}
	}

	public determineEmbedFieldTextLength(): number {
		return (
			this.data?.fields?.reduce((acc, field) => {
				return acc + field.name.length + field.value.length;
			}, 0) || 0
		);
	}

	public splitEmbedIfTooLong(): KoboldEmbed[] {
		const cloneOfThis = new KoboldEmbed(this.toJSON());

		let length = cloneOfThis.determineEmbedMetaTextLength();
		let fieldLength = cloneOfThis.determineEmbedFieldTextLength();

		if (length + fieldLength < 6000) {
			//we're within normal embed size, so we can just return ourselves.
			return [cloneOfThis];
		} else if (length > 6000) {
			throw new KoboldError(
				`Yip! That command would have returned a message that was way too long!`
			);
		}

		// if the embed isn't oversized, we can fit at least 1 embed with the static text
		// so we can split this into many embeds if over the text limit
		let extraEmbeds: KoboldEmbed[] = [];
		while (cloneOfThis.isOverSized()) {
			// splice the field to move off of the end of this embed
			const splicedField = (cloneOfThis.data.fields ?? []).splice(
				(cloneOfThis.data.fields ?? []).length - 1,
				1
			)[0];
			// check the most recent extra embed to see if the field can be added to it
			let canAddFieldToEmbed = false;
			if (extraEmbeds.length > 0) {
				const mostRecentExtraEmbed = extraEmbeds[0];
				canAddFieldToEmbed =
					(mostRecentExtraEmbed.data.fields ?? []).length < 25 &&
					mostRecentExtraEmbed.determineEmbedFieldTextLength() +
						splicedField.name.length +
						splicedField.value.length <
						6000;
			}
			if (canAddFieldToEmbed) {
				// if it can, then add it to the most recent extra embed
				extraEmbeds[0].spliceFields(0, 0, splicedField);
			}
			// if it can't, then we need to create a new extra embed
			else {
				let newEmbed = new KoboldEmbed();
				newEmbed.addFields(splicedField);
				extraEmbeds.unshift(newEmbed);
			}
			length = cloneOfThis.determineEmbedMetaTextLength();
			fieldLength = cloneOfThis.determineEmbedFieldTextLength();
		}

		if (extraEmbeds.length >= 9) {
			// What the heck are they doing asking for 30,000 characters of embed text?
			let errorEmbed = new KoboldEmbed();
			errorEmbed.setTitle("Error! Holy heck that's a lot of stuff!");
			errorEmbed.setDescription(
				"Yip! That command would have returned 10 whole heckin' messages at their limit of 6000 characters or 25 fields each! You need to" +
					" learn some moderation there, buddy! Or contact my author for help if you think this is a legit use of me! I'm just " +
					"a little kobold! I can't handle all that!"
			);
			return [errorEmbed];
		}
		return [cloneOfThis, ...extraEmbeds];
	}

	public batchEmbeds() {
		const splitEmbeds = this.splitEmbedIfTooLong();
		const embedBatches: KoboldEmbed[][] = [];
		return _.chunk(splitEmbeds, 1);
	}
	public static prepareEmbeds(embeds: KoboldEmbed[]) {
		const finalEmbeds: KoboldEmbed[] = [];
		for (const embed of embeds) {
			if (!embed) continue;
			embed.splitEmbedIfTooLong();
			const splitEmbeds = embed.splitEmbedIfTooLong();
			finalEmbeds.push(...splitEmbeds);
		}
		return finalEmbeds;
	}
	public async splitDescriptionToFields() {
		//if a description is longer than 4096 characters, split excess into a field
		if (!this.data.description || this.data.description.length <= 4096) return;
		const splitDescription = this.data.description.split('\n');
		// group description into chunks of 1024 characters
		const descriptionChunks: string[][] = [];
		let currentChunk: string[] = [];
		let currentChunkLength = 0;
		let currentChunkContinuesCodeBlock = false;
		let currentChunkContinuesQuote = false;
		for (const line of splitDescription) {
			if (currentChunkLength + line.length > 1000) {
				if (currentChunkContinuesCodeBlock) currentChunk.push('```');
				if (currentChunkContinuesQuote) currentChunk.push('`');
				descriptionChunks.push(currentChunk);
				currentChunk = [];
				if (currentChunkContinuesCodeBlock) currentChunk.push('```');
				if (currentChunkContinuesQuote) currentChunk.push('`');
				currentChunkLength = 0;
			}
			if (line.length > 1000) {
				// ignore newline characters when splitting an oversized block
				const numberOfSegments = Math.ceil(line.length / 1000);
				const splitLine = _.chunk(line, numberOfSegments).map(segment => segment.join(''));
				for (let splitLineSegment of splitLine) {
					if (currentChunkContinuesCodeBlock) splitLineSegment = '```' + splitLineSegment;
					if (currentChunkContinuesQuote) splitLineSegment = '`' + splitLineSegment;
					// check for an odd number of ``` formatters
					if ((splitLineSegment?.match(/```/g) ?? []).length % 2 === 1)
						currentChunkContinuesCodeBlock = !currentChunkContinuesCodeBlock;
					// check for an odd number of ` formatters
					if ((splitLineSegment?.match(/(?<!`)`{1}(?!`)/g) ?? []).length % 2 === 1)
						currentChunkContinuesQuote = !currentChunkContinuesQuote;
					if (currentChunkContinuesCodeBlock) splitLineSegment += '```';
					if (currentChunkContinuesQuote) splitLineSegment = '`';
					descriptionChunks.push([splitLineSegment]);
				}
			} else {
				// check for an odd number of ``` formatters
				if ((line?.match(/```/g) ?? []).length % 2 === 1)
					currentChunkContinuesCodeBlock = !currentChunkContinuesCodeBlock;
				// check for an odd number of ` formatters
				if ((line?.match(/(?<!`)`{1}(?!`)/g) ?? []).length % 2 === 1)
					currentChunkContinuesQuote = !currentChunkContinuesQuote;
				currentChunk.push(line);
				currentChunkLength += line.length + 2; //lines are each joined with \n, adding 2
			}
		}
		// add the first four chunks to the description
		this.setDescription(descriptionChunks.slice(0, 4).flat(2).join('\n'));
		this.addFields(
			descriptionChunks.slice(4).map(chunk => ({ name: '\u200b', value: chunk.join('\n') }))
		);
	}
	public fixDiscordFormattingInQuotes() {
		//fix discord emoji in codeblocks
		const emojiRegex = /\<\w*\:\w*\:\w*\>/g;
		if (this.data.description) {
			const splitByCodeblock = this.data.description.split(/(?<!`)`{1}(?!`)/g);
			if (splitByCodeblock.length > 1) {
				for (let i = 1; i < splitByCodeblock.length; i += 2) {
					splitByCodeblock[i] = splitByCodeblock[i].replaceAll(
						emojiRegex,
						emoji => '`' + emoji + '`'
					);
				}
			}
			this.data.description = splitByCodeblock.join('`');
		}
		if (this.data.fields?.length) {
			const fields = this.data.fields;
			for (const field of fields ?? []) {
				const splitByCodeblock = field.value.split(/(?<!`)`{1}(?!`)/g);
				if (splitByCodeblock.length > 1) {
					for (let i = 1; i < splitByCodeblock.length; i += 2) {
						splitByCodeblock[i] = splitByCodeblock[i].replace(
							emojiRegex,
							emoji => '`' + emoji + '`'
						);
					}
				}
				field.value = splitByCodeblock.join('`');
			}
			this.data.fields = fields;
		}
	}
	public async sendBatches(intr: CommandInteraction, isEphemeral = false) {
		this.fixDiscordFormattingInQuotes();
		this.splitDescriptionToFields();
		this.splitFieldsThatAreTooLong();
		const splitEmbeds = this.splitEmbedIfTooLong();
		for (const embed of splitEmbeds) {
			await InteractionUtils.send(intr, embed, isEphemeral);
		}
	}
}

export class EmbedUtils {
	public static async dispatchEmbeds(
		intr: ChatInputCommandInteraction,
		embeds: KoboldEmbed[],
		secretStatus: string,
		gmUserId?: string
	) {
		const isEphemeral =
			secretStatus === L.en.commandOptions.rollSecret.choices.secret.value() ||
			secretStatus === L.en.commandOptions.rollSecret.choices.secretAndNotify.value() ||
			secretStatus === L.en.commandOptions.rollSecret.choices.sendToGm.value();
		const notifyRoll =
			secretStatus === L.en.commandOptions.rollSecret.choices.secretAndNotify.value() ||
			secretStatus === L.en.commandOptions.rollSecret.choices.sendToGm.value();
		const sendToGm = secretStatus === L.en.commandOptions.rollSecret.choices.sendToGm.value();

		if (notifyRoll) {
			await InteractionUtils.send(
				intr,
				L.en.commands.roll.interactions.secretRollNotification()
			);
		}
		const finalEmbeds = KoboldEmbed.prepareEmbeds(embeds);
		if (sendToGm && gmUserId) {
			await intr.client.users.send(gmUserId, { embeds: finalEmbeds });
		} else if (sendToGm && !gmUserId) {
			throw new KoboldError(
				"Yip! You can't send a secret roll to the GM if you aren't in a game! See `/help game` for more info!"
			);
		} else {
			if (intr.replied) {
				intr.followUp({ embeds: finalEmbeds, ephemeral: isEphemeral });
			} else {
				intr.reply({ embeds: finalEmbeds, ephemeral: isEphemeral });
			}
		}
	}
	public static describeActionResult({
		embed,
		action,
		heightenLevel,
		saveRollType,
		targetDC,
	}: {
		embed: KoboldEmbed;
		action: Action;
		heightenLevel?: number;
		saveRollType?: string;
		targetDC?: number;
	}): KoboldEmbed {
		const descriptionArr = [];
		if (heightenLevel) {
			descriptionArr.push(`Heightened to level ${heightenLevel}`);
		}
		if (saveRollType) {
			let rollType = '';
			for (const roll of action.rolls) {
				if (roll.type === 'save') {
					rollType = ` ${roll.saveRollType}`;
					break;
				}
			}
			descriptionArr.push(`The target rolls${rollType} ${saveRollType}`);
		}
		if (targetDC) {
			let saveType = ' DC';
			for (const roll of action.rolls) {
				if (roll.type === 'save' || roll.type === 'attack') {
					saveType = ` ${
						roll.type === 'save' ? roll.saveTargetDC ?? 'ac' : roll.targetDC ?? 'ac'
					}`;
					// add the word DC if we aren't checking vs the AC
					if (
						saveType.toLocaleLowerCase() !== ' ac' &&
						!_.endsWith(saveType.toLocaleLowerCase(), ' dc')
					)
						saveType += ' DC';
					// change a to an if the next letter is a vowel
					if (['a', 'e', 'i', 'o', 'u'].includes(saveType[1].toLocaleLowerCase()))
						saveType = `n${saveType}`;
					break;
				}
			}
			descriptionArr.push(`VS a${saveType} of ${targetDC}`);
		}
		if (descriptionArr.length) embed.setDescription(descriptionArr.join('\n'));
		return embed;
	}
	public static async getOrSendActionDamageField({
		intr,
		actionRoller,
		hideStats,
		targetNameOverwrite,
		sourceNameOverwrite,
	}: {
		intr: ChatInputCommandInteraction;
		actionRoller: ActionRoller;
		hideStats: boolean;
		targetNameOverwrite?: string;
		sourceNameOverwrite?: string;
	}) {
		let message = '\u200b';
		if (true || !hideStats) {
			message = actionRoller.buildResultText() ?? '\u200b';
			//turn this back on if we want to hide damage messages when stats are hidden
		} else {
			// DM the damage to the Initiative GM
			// const currentInit = await InitiativeUtils.getInitiativeForChannelOrNull(intr.channel);
			// if (currentInit) {
			// 	await intr.client.users.send(currentInit.gmUserId, actionRoller.buildResultText());
			// }
		}
		let title = '';
		let netDamage = actionRoller.totalDamageDealt - actionRoller.totalHealingDone;
		if (actionRoller.targetCreature && netDamage < 0) {
			title = `${targetNameOverwrite ?? actionRoller.targetCreature.name} healed ${
				actionRoller.totalHealingDone
			} health`;
		} else if (actionRoller.targetCreature) {
			title = `${targetNameOverwrite ?? actionRoller.targetCreature.name} took${
				actionRoller.totalDamageDealt === 0 ? ' no' : ''
			} damage from ${sourceNameOverwrite ?? actionRoller.creature?.name ?? ''}`;
			if (
				//turn this back on if we want to hide damage messages when stats are hidden
				actionRoller.targetCreature?.sheet?.baseCounters?.hp?.current === 0
			) {
				message += "\nYip! They're down!";
			}
		}

		return {
			name: title,
			value: message,
		};
	}

	public static buildDamageResultText({
		initialDamageAmount,
		sourceCreatureName,
		targetCreatureName,
		totalDamageDealt,
		targetCreatureSheet,
		actionName,
		triggeredWeaknesses,
		triggeredResistances,
		triggeredImmunities,
	}: {
		initialDamageAmount?: number;
		sourceCreatureName?: string;
		targetCreatureName: string;
		totalDamageDealt: number;
		targetCreatureSheet: Sheet;
		actionName?: string;
		triggeredWeaknesses?: SheetWeaknessesResistances['weaknesses'];
		triggeredResistances?: SheetWeaknessesResistances['resistances'];
		triggeredImmunities?: SheetInfoLists['immunities'];
	}) {
		let message = `${targetCreatureName} ${totalDamageDealt < 0 ? 'healed' : 'took'} ${Math.abs(
			totalDamageDealt
		)} ${totalDamageDealt < 0 ? 'health' : 'damage'}`;
		if (sourceCreatureName || actionName) message += ' from';
		if (sourceCreatureName) message += ` ${sourceCreatureName}'s`;
		if (actionName) message += ` ${actionName ?? 'action'}`;
		message += '!';

		const currentHp = targetCreatureSheet.baseCounters.hp.current;

		if (totalDamageDealt < 0) {
			if (currentHp === targetCreatureSheet.baseCounters.hp.max) {
				message += " They're now at full health!";
			}
		} else if ((initialDamageAmount ?? 0) < 0 && totalDamageDealt === 0) {
			message = `Yip! I tried to heal ${targetCreatureName}, but they're already at full health!`;
		} else {
			if (currentHp === 0) {
				message += " They're down!";
			}
			if (triggeredWeaknesses && triggeredWeaknesses?.length > 0) {
				let weaknessesMessage = triggeredWeaknesses[0].type;
				let mappedWeaknesses = triggeredWeaknesses.map(resistance => resistance.type);
				if (triggeredWeaknesses.length > 1) {
					const lastResistance = mappedWeaknesses.pop();
					const joinedWeaknesses = mappedWeaknesses.join(', ');
					weaknessesMessage = joinedWeaknesses + ', and' + lastResistance;
				}
				message += `\nThey took extra damage from ${weaknessesMessage}!`;
			}
			if (triggeredResistances && triggeredResistances.length > 0) {
				let resistancesMessage = triggeredResistances[0].type;
				let mappedResistances = triggeredResistances.map(resistance => resistance.type);
				if (triggeredResistances.length > 1) {
					const lastResistance = mappedResistances.pop();
					const joinedResistances = mappedResistances.join(', ');
					resistancesMessage = joinedResistances + ', and' + lastResistance;
				}
				message += `\nThey took less damage from ${resistancesMessage}!`;
			}
			if (triggeredImmunities && triggeredImmunities.length > 0) {
				let immunitiesMessage = triggeredImmunities[0];
				if (triggeredImmunities.length > 1) {
					const lastImmunity = triggeredImmunities.pop();
					const joinedImmunities = triggeredImmunities.join(', ');
					if (lastImmunity) {
						immunitiesMessage = joinedImmunities + ', and' + lastImmunity;
						triggeredImmunities.push(lastImmunity);
					}
				}
				message += `\nThey took no damage from ${immunitiesMessage}!`;
			}
		}
		return message;
	}
}
