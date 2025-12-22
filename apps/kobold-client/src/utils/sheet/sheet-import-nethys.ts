import {
	Sheet,
	isSheetStatKeys,
	AbilityEnum,
	ProficiencyStat,
	Action,
	ActionTypeEnum,
	ActionCostEnum,
	RollTypeEnum,
	Roll,
} from '@kobold/db';
import _ from 'lodash';
import { SheetProperties } from './sheet-properties.js';
import { BestiaryEntry, CompendiumEntry, NethysEmoji, NethysParser } from '@kobold/nethys';
import { Config } from '@kobold/config';

export const NethysActionsRegex = new RegExp(
	Object.values(NethysEmoji)
		.join('|')
		.replaceAll(/([\[\]])/gi, '\\$1'),
	'gi'
);

export class NethysSheetImporter {
	sheet: Sheet;
	rollAdjustment: number;
	hpAdjustment: number;
	challengeAdjustment: number;
	nethysParser: NethysParser;
	actions: Action[] = [];
	constructor(
		private bestiaryEntry: BestiaryEntry,
		private options: {
			creatureFamilyEntry?: CompendiumEntry;
			template?: string;
			customName?: string;
			emojiConverter?: (emoji: string) => string;
		} = {}
	) {
		this.nethysParser = new NethysParser();
		this.sheet = SheetProperties.defaultSheet;

		const defaultName =
			(options?.template ? `${_.capitalize(options.template)} ` : '') + bestiaryEntry.name;
		this.sheet.staticInfo.name = options.customName ? options.customName : defaultName;

		this.challengeAdjustment =
			0 + (options?.template === 'elite' ? 1 : 0) - (options?.template === 'weak' ? 1 : 0);
		this.sheet.staticInfo.level = (bestiaryEntry.level ?? 0) + (this.challengeAdjustment ?? 0);

		this.hpAdjustment = 0;
		if (this.challengeAdjustment > 0) {
			if (!bestiaryEntry.level || bestiaryEntry.level <= 1) {
				this.hpAdjustment = 10;
			} else if (bestiaryEntry.level <= 4) {
				this.hpAdjustment = 15;
			} else if (bestiaryEntry.level <= 19) {
				this.hpAdjustment = 20;
			} else {
				this.hpAdjustment = 30;
			}
		} else if (this.challengeAdjustment < 0) {
			if (!bestiaryEntry.level || bestiaryEntry.level <= 2) {
				this.hpAdjustment = -10;
			} else if (bestiaryEntry.level <= 5) {
				this.hpAdjustment = -15;
			} else if (bestiaryEntry.level <= 20) {
				this.hpAdjustment = -20;
			} else {
				this.hpAdjustment = -30;
			}
		}
		this.hpAdjustment *= Math.abs(this.challengeAdjustment) ?? 0;

		this.rollAdjustment = 2 * (this.challengeAdjustment ?? 0);
	}

	protected applySpellcastingStats() {
		const spellEntries: RegExpMatchArray[] = Array.from(
			this.bestiaryEntry.text.matchAll(
				/(arcane|divine|primal|occult) ?[A-Za-z]* spells ?(dc [0-9]*)?,? ?(attack [+-]?[0-9]*)?/gi
			)
		);
		for (const spellEntry of spellEntries) {
			const spellcastingTradition = spellEntry?.[1]?.toLowerCase() as
				| 'arcane'
				| 'divine'
				| 'occult'
				| 'primal';
			let spellcastingDc: string | undefined;
			let spellcastingAttack: string | undefined;
			if (spellEntry?.[2]?.toLowerCase()?.includes('dc'))
				spellcastingDc = spellEntry?.[2]?.replaceAll(/[^\d+-]/g, '');
			if (spellEntry?.[2]?.toLowerCase()?.includes('attack'))
				spellcastingAttack = spellEntry?.[2]?.replaceAll(/[^\d+-]/g, '');
			if (spellEntry?.[3]?.toLowerCase()?.includes('dc'))
				spellcastingDc = spellEntry?.[2]?.replaceAll(/[^\d+-]/g, '');
			if (spellEntry?.[3]?.toLowerCase()?.includes('attack'))
				spellcastingAttack = spellEntry?.[2]?.replaceAll(/[^\d+-]/g, '');
			let dc = spellcastingDc == null ? null : parseInt(spellcastingDc) + this.rollAdjustment;
			let attack =
				spellcastingAttack == null
					? null
					: parseInt(spellcastingAttack) + this.rollAdjustment;
			if ((dc == null || isNaN(dc)) && attack != null && !isNaN(attack)) dc = attack + 10;
			if ((attack == null || isNaN(attack)) && dc != null && !isNaN(dc)) attack = dc - 10;
			if (attack && dc) {
				this.sheet.stats[spellcastingTradition].bonus = attack;
				this.sheet.stats[spellcastingTradition].dc = dc;
			}
		}
	}

	protected applySkills() {
		for (const [skillName, skillBonus] of Object.entries(this.bestiaryEntry.skill_mod) as [
			string,
			number
		][]) {
			let lowerSkillName = skillName.toLowerCase();
			const bonus = skillBonus + this.rollAdjustment;
			let dc = 10 + skillBonus;

			if (isSheetStatKeys(lowerSkillName)) {
				this.sheet.stats[lowerSkillName] = {
					...this.sheet.stats[lowerSkillName],
					bonus,
					dc,
				};
			} else {
				const existingSkill = this.sheet.additionalSkills.find(
					skill => skill.name === lowerSkillName
				);
				if (existingSkill) {
					existingSkill.bonus = bonus;
					existingSkill.dc = dc;
				} else {
					this.sheet.additionalSkills.push({
						name: lowerSkillName,
						proficiency: null,
						bonus,
						dc,
						note: '',
						ability: AbilityEnum.intelligence,
					});
				}
			}
		}
	}
	protected applyLores() {
		const lores: ProficiencyStat[] = [];
		const loreEntries: RegExpMatchArray[] = Array.from(
			this.bestiaryEntry.text.matchAll(/([a-zA-Z][a-zA-Z ]* Lore) ([+-]?[0-9]+)/gi)
		);
		for (const loreEntry of loreEntries) {
			const loreName = loreEntry[1]!.split(' ').map(_.capitalize).join(' ');
			const loreBonus = parseInt(loreEntry[2]!);
			if (isNaN(loreBonus)) continue;
			const existingSkill = this.sheet.additionalSkills.find(
				skill => skill.name === loreName
			);
			if (existingSkill) {
				existingSkill.bonus = loreBonus;
				existingSkill.dc = loreBonus + 10;
			} else {
				this.sheet.additionalSkills.push({
					name: loreName,
					proficiency: null,
					bonus: loreBonus,
					dc: loreBonus + 10,
					note: null,
					ability: AbilityEnum.intelligence,
				});
			}
		}
	}
	protected applyCounters() {
		this.sheet.baseCounters.hp.current = this.bestiaryEntry.hp + this.hpAdjustment;
		this.sheet.baseCounters.hp.max = this.bestiaryEntry.hp + this.hpAdjustment;

		const focusPointsMatch =
			this.bestiaryEntry.text.match(/focus points ([0-9]*)/i)?.[1] ?? null;
		const focusPoints = focusPointsMatch ? parseInt(focusPointsMatch) : null;
		this.sheet.baseCounters.focusPoints = {
			...this.sheet.baseCounters.focusPoints,
			current: focusPoints ?? 0,
			max: focusPoints,
		};
	}

	protected applyBaseStats() {
		this.sheet.intProperties.strength = this.bestiaryEntry.strength;
		this.sheet.intProperties.dexterity = this.bestiaryEntry.dexterity;
		this.sheet.intProperties.constitution = this.bestiaryEntry.constitution;
		this.sheet.intProperties.intelligence = this.bestiaryEntry.intelligence;
		this.sheet.intProperties.wisdom = this.bestiaryEntry.wisdom;
		this.sheet.intProperties.charisma = this.bestiaryEntry.charisma;

		this.sheet.intProperties.walkSpeed = this.bestiaryEntry.speed.land ?? null;
		this.sheet.intProperties.flySpeed = this.bestiaryEntry.speed.fly ?? null;
		this.sheet.intProperties.swimSpeed = this.bestiaryEntry.speed.swim ?? null;
		this.sheet.intProperties.climbSpeed = this.bestiaryEntry.speed.climb ?? null;
		this.sheet.intProperties.burrowSpeed = this.bestiaryEntry.speed.burrow ?? null;

		const perceptionBonus = this.bestiaryEntry.perception + this.rollAdjustment;
		this.sheet.stats.perception = {
			...this.sheet.stats.perception,
			bonus: perceptionBonus,
			dc: perceptionBonus + 10,
		};

		this.sheet.intProperties.ac = this.bestiaryEntry.ac + this.rollAdjustment;

		const fortBonus = this.bestiaryEntry.fortitude_save + this.rollAdjustment;
		const refBonus = this.bestiaryEntry.reflex_save + this.rollAdjustment;
		const willBonus = this.bestiaryEntry.will_save + this.rollAdjustment;

		this.sheet.stats.fortitude = {
			...this.sheet.stats.fortitude,
			bonus: fortBonus,
			dc: fortBonus + 10,
		};
		this.sheet.stats.reflex = {
			...this.sheet.stats.reflex,
			bonus: refBonus,
			dc: refBonus + 10,
		};
		this.sheet.stats.will = {
			...this.sheet.stats.will,
			bonus: willBonus,
			dc: willBonus + 10,
		};

		this.sheet.infoLists.immunities = this.bestiaryEntry.immunity ?? [];

		this.sheet.weaknessesResistances.weaknesses = (
			Object.entries(this.bestiaryEntry.weakness) as [string, number][]
		).map(([type, amount]) => {
			return {
				type,
				amount,
			};
		});
		this.sheet.weaknessesResistances.resistances = (
			Object.entries(this.bestiaryEntry.resistance) as [string, number][]
		).map(([type, amount]) => {
			return {
				type,
				amount,
			};
		});
	}

	protected applyDetails() {
		this.sheet.info.description = this.bestiaryEntry.summary ?? null;
		// Remove leading slash from URL if baseUrl ends with slash to avoid double slashes
		const urlPath =
			this.bestiaryEntry.url.startsWith('/') && Config.nethys.baseUrl.endsWith('/')
				? this.bestiaryEntry.url.slice(1)
				: this.bestiaryEntry.url;
		this.sheet.info.url = `${Config.nethys.baseUrl}${urlPath}`;
		this.sheet.info.alignment = this.bestiaryEntry.alignment ?? null;
		const imageOptions = [...(this.bestiaryEntry.image ?? [])];
		if (this.options.creatureFamilyEntry) {
			// check the creature family record for an image
			imageOptions.push(...(this.options.creatureFamilyEntry.image ?? []));
		}
		const urlSuffix =
			this.bestiaryEntry.image?.[0] ?? this.options.creatureFamilyEntry?.image?.[0];
		// Remove leading slash from image URL if baseUrl ends with slash to avoid double slashes
		const imagePath =
			urlSuffix && urlSuffix.startsWith('/') && Config.nethys.baseUrl.endsWith('/')
				? urlSuffix.slice(1)
				: urlSuffix;
		this.sheet.info.imageURL = imagePath ? `${Config.nethys.baseUrl}${imagePath}` : null;

		this.sheet.info.size = this.bestiaryEntry.size[0] ?? null;

		this.sheet.infoLists.traits = this.bestiaryEntry.trait ?? [];
		this.sheet.infoLists.senses =
			this.bestiaryEntry.sense
				?.split(/,/)
				.map((sense: string) => sense.trim().replaceAll('  ', ' ')) ?? [];
		this.sheet.infoLists.languages = this.bestiaryEntry.language ?? [];
	}

	protected parseActionCost(parsedNethysMarkdown: string) {
		const actionCostRegex = NethysActionsRegex;
		let actionCostEnum: ActionCostEnum = ActionCostEnum.none;
		const actionCostMatch = Array.from(parsedNethysMarkdown.matchAll(actionCostRegex)).flat();
		parsedNethysMarkdown = parsedNethysMarkdown.replace(actionCostRegex, '');
		if (actionCostMatch.length > 1) {
			actionCostEnum = ActionCostEnum.variableActions;
		} else {
			const actionCost = actionCostMatch[0];
			if (actionCost === NethysEmoji.oneAction) {
				actionCostEnum = ActionCostEnum.oneAction;
			}
			if (actionCost === NethysEmoji.twoActions) {
				actionCostEnum = ActionCostEnum.twoActions;
			}
			if (actionCost === NethysEmoji.threeActions) {
				actionCostEnum = ActionCostEnum.threeActions;
			}
			if (actionCost === NethysEmoji.reaction) {
				actionCostEnum = ActionCostEnum.reaction;
			}
			if (actionCost === NethysEmoji.freeAction) {
				actionCostEnum = ActionCostEnum.freeAction;
			}
		}
		return actionCostEnum;
	}

	protected parseDamageEffectClause(damageClause: string) {
		const match = damageClause
			.trim()
			.match(/(\d+\W*d?\W*\d*\W*\+?\W*\d*)?(?:\s*([a-zA-Z\s\.]+))?/);
		if (match) {
			const [, dice, type] = match;
			return {
				rollType: 'damage',
				type: type ? type.trim() : null,
				dice: dice ? dice.trim() : null,
			};
		} else {
			return {
				rollType: 'effect',
				effect: damageClause,
			};
		}
	}

	protected async applyCreatureSpells() {
		// very similar to applying actions, but we plan to eventually add better spellcasting support
		//Ex:
		// **Primal Innate Spells** DC 34\r\n- **Cantrips (4th)**\r\n[Know Direction](/Spells.aspx?ID=169)\r\n- **4th**\r\n[Entangle](/Spells.aspx?ID=103), [Tree Shape](/Spells.aspx?ID=342) (see forest shape)\r\n- **Constant (1st)**\r\n[Pass Without Trace](/Spells.aspx?ID=215) (forest terrain only)\r\n\r\n
		const spellTraditionRegex = /\*\*([a-zA-Z]+ Spells)\*\*(.*?)(?=\r\n\r\n)/gi;
		const spellTraditionMatches: RegExpMatchArray[] = Array.from(
			this.bestiaryEntry.markdown.matchAll(spellTraditionRegex)
		);
		for (const spellTraditionMatch of spellTraditionMatches) {
			const parsedSpellTradition = await this.nethysParser.parseNethysMarkdown(
				spellTraditionMatch[2]!
			);
			const spellTraditionName = spellTraditionMatch[1]!;
			const rolls: Roll[] = [];
			rolls.push({
				name: 'Details',
				type: RollTypeEnum.text,
				defaultText: parsedSpellTradition,
				criticalSuccessText: null,
				criticalFailureText: null,
				successText: null,
				failureText: null,
				extraTags: [],
				allowRollModifiers: false,
			});
			this.actions.push({
				type: ActionTypeEnum.other,
				name: spellTraditionName,
				description: '',
				actionCost: ActionCostEnum.none,
				baseLevel: null,
				autoHeighten: false,
				tags: [],
				rolls,
			});
		}
	}
	protected async applyCreatureActions() {
		for (const ability of this.bestiaryEntry.creature_ability ?? []) {
			const abilityRegex = new RegExp(
				`(?<=\\*\\*\\[?${ability}\\]?(?:\\([^\\)]*\\))?\\*\\*).*?(?=<br ?\/>\\*\\*|(?:\\r\\n|\\n)(?:\\r\\n|\\n)|<\/ ?column>)`,
				'i'
			);
			const fullAbility = abilityRegex.exec(this.bestiaryEntry.markdown)?.[0];
			if (fullAbility === undefined) continue;
			let parsedAbility = await this.nethysParser.parseNethysMarkdown(fullAbility);

			// determine action cost
			let actionCostEnum = this.parseActionCost(parsedAbility);
			const parsedWithoutActions = parsedAbility.replace(NethysActionsRegex, '').trim();

			this.actions.push({
				type: ActionTypeEnum.other,
				name: ability,
				description: '',
				actionCost: actionCostEnum,
				baseLevel: null,
				autoHeighten: false,
				tags: [],
				rolls: [
					{
						name: 'Details',
						type: RollTypeEnum.text,
						defaultText: parsedWithoutActions,
						criticalSuccessText: null,
						successText: null,
						failureText: null,
						criticalFailureText: null,
						extraTags: [],
						allowRollModifiers: false,
					},
				],
			});
		}
	}

	protected async applyAttacks() {
		const attackRegex = /\*\*(?:melee|ranged)\*\*.*?(?=(?:\\r\\n|\\n)*\*\*(?! |damage\*\*))/gis;
		const attackMatches: RegExpMatchArray[] = Array.from(
			this.bestiaryEntry.markdown.matchAll(attackRegex)
		);
		for (const attackMatch of attackMatches) {
			const parsedMatch = await this.nethysParser.parseNethysMarkdown(attackMatch[0]!);
			const parsedMatchWithoutLinks = this.nethysParser.stripMarkdownLinks(parsedMatch);
			const nameBonusClause = /[\_\*]?([\w \(\)]+)[\_\*]? ([+-][0-9]+)/gi;
			const traitsClause = /\(([^<>\(\)]+)\)/gi;
			const damageClause = /(?<=,\W*Damage\*\*|,\W*Effect\*\*)(.*)/gi;
			const nameBonusResults = Array.from(
				parsedMatchWithoutLinks.matchAll(nameBonusClause)
			)[0];
			const traitsResults = Array.from(parsedMatchWithoutLinks.matchAll(traitsClause))[0];
			const damageResults = Array.from(parsedMatchWithoutLinks.matchAll(damageClause))[0];

			if (!nameBonusResults) continue;
			const actionCost = this.parseActionCost(parsedMatchWithoutLinks);

			const attackName = nameBonusResults?.[1]?.toString()?.trim();
			const attackBonus =
				parseInt(nameBonusResults?.[2]?.toString()?.trim()) + this.rollAdjustment;
			const traits = traitsResults?.[1]?.toString().split(', ') ?? [];
			const damageClauses = damageResults?.[1]?.toString().split(/ plus | and /) ?? [];
			const rolls: Roll[] = [];

			rolls.push({
				name: 'To Hit',
				type: RollTypeEnum.attack,
				roll: `1d20${attackBonus >= 0 ? '+' : ''}${attackBonus}`,
				targetDC: 'AC',
				allowRollModifiers: true,
			});

			for (let i = 0; i < damageClauses.length; i++) {
				const damageResult = this.parseDamageEffectClause(damageClauses[i]);
				if (damageResult.rollType === 'damage') {
					let damage = damageResult.dice ?? null;
					if (i === 0) {
						damage = damageResult.dice
							? damageResult.dice +
							  `${this.rollAdjustment >= 0 ? '+' : ''}${this.rollAdjustment}`
							: null;
					}
					rolls.push({
						name: `Damage${damageClauses.length === 1 ? '' : ' ' + i}`,
						type: RollTypeEnum.damage,
						damageType: damageResult.type ?? null,
						roll: damage,
						healInsteadOfDamage: false,
						allowRollModifiers: true,
					});
				} else if (damageResult.rollType === 'effect') {
					if (!damageResult.effect) continue;
					rolls.push({
						name: `Effect ${i}`,
						type: RollTypeEnum.text,
						defaultText: damageResult.effect,
						criticalSuccessText: null,
						criticalFailureText: null,
						successText: null,
						failureText: null,
						extraTags: [],
						allowRollModifiers: false,
					});
				}
			}
			this.actions.push({
				type: ActionTypeEnum.attack,
				name: attackName,
				description: '',
				actionCost,
				baseLevel: null,
				autoHeighten: false,
				tags: traits,
				rolls,
			});
		}
	}

	public async buildSheet() {
		this.applyDetails();
		this.applyBaseStats();
		this.applySkills();
		this.applyLores();
		this.applyCounters();
		this.applySpellcastingStats();
		return this.sheet;
	}
	public async buildActions() {
		await this.applyAttacks();
		await this.applyCreatureActions();
		return this.actions;
	}
}
