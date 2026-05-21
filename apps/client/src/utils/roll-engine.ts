import _ from 'lodash';
import { sql } from 'kysely';
import {
	Attribute,
	CharacterBasic,
	Condition,
	Kobold,
	Modifier,
	RollMacro,
	Sheet,
	UserSettings,
} from '@kobold/db';
import {
	SheetBaseCounterProperties,
	SheetIntegerProperties,
	SheetProperties,
	SheetStatProperties,
} from '@kobold/sheet';
import { utilStrings } from '@kobold/documentation';
import { StringUtils } from '@kobold/util';
import { attributeShorthands } from '../constants/attributes.js';
import { AttributeUtils } from './attribute-utils.js';
import { DiceRollError, DiceRollResult, DiceUtils, ErrorResult } from './dice-utils.js';
import { KoboldEmbed } from './kobold-embed-utils.js';
import { ModifierUtils } from './kobold-service-utils/modifier-utils.js';
import { RollBuilder } from './roll-builder.js';
import { DefaultUtils } from './default-utils.js';

const bracketRefRegex = /\[([^\[\]]+)\]/g;
const hasBracketRefRegex = /\[[^\[\]]+\]/;
const trimRegex = /[\[\]\\ _\-]/g;
const tagAttributeRegex = /__([A-Za-z][A-Za-z0-9_]*)/g;

type AttributePlan =
	| {
			kind: 'json';
			name: string;
			aliases: string[];
			type: string;
			tags: string[];
			path: string[];
	  }
	| {
			kind: 'levelComputed';
			name: string;
			aliases: string[];
			type: string;
			tags: string[];
			bonus: number;
	  }
	| {
			kind: 'proficiencyComputed';
			name: string;
			aliases: string[];
			type: string;
			tags: string[];
			proficiencyPath: string[];
	  };

type PlannedAttribute = {
	input: string;
	normalized: string;
	plan: AttributePlan | null;
};

export interface RollSubjectContext {
	character: CharacterBasic;
	gmUserId?: string;
}

export interface RollExpansionContext {
	subject: RollSubjectContext | null;
	userSettings: UserSettings;
	rollMacros: RollMacro[];
	rollModifiers: Condition[];
}

export interface PreparedRollOptions {
	rollExpression: string;
	rollTitle?: string;
	rollDescription: string;
	rollNote?: string | null;
	actorName: string;
	baseTags?: string[];
	modifierMultiplier?: number;
	skipModifiers?: boolean;
	userSettings?: UserSettings;
	subject?: RollSubjectContext | null;
}

export interface PreparedRollResult {
	builder: RollBuilder;
	total: number | null;
}

function normalizeAttributeRef(raw: string): string {
	const trimmed = raw.replace(trimRegex, '').trim().toLowerCase();
	return attributeShorthands[trimmed] ?? trimmed;
}

function collectBracketRefs(expression: string): string[] {
	return [...expression.matchAll(bracketRefRegex)].map(match => match[1].trim());
}

function hasBracketRefs(expression: string): boolean {
	return hasBracketRefRegex.test(expression);
}

function uniqueNormalizedRefs(refs: string[]): string[] {
	return _.uniq(refs.map(normalizeAttributeRef).filter(Boolean));
}

function collectTagAttributeRefs(rollTargetTags: string | null | undefined): string[] {
	if (!rollTargetTags) return [];
	return [...rollTargetTags.matchAll(tagAttributeRegex)].map(match => match[1]);
}

function conditionFromModifier(modifier: Modifier): Condition {
	return modifier as unknown as Condition;
}

export class RollAttributeRegistry {
	private static readonly levelNames = new Set(['level']);
	public static readonly generalProficiencyBonuses: Record<string, number> = {
		untrained: 0,
		trained: 2,
		expert: 4,
		master: 6,
		legendary: 8,
	};

	private static readonly computedProficiencies: Record<
		string,
		{ path: string[]; aliases: string[]; type: string }
	> = {
		unarmed: {
			path: ['intProperties', 'unarmedProficiency'],
			aliases: [
				'unarmed',
				'unarmedweapon',
				'unarmedattack',
				'unarmedproficiency',
				'unarmedprof',
			],
			type: 'attack',
		},
		simple: {
			path: ['intProperties', 'simpleProficiency'],
			aliases: ['simple', 'simpleweapon', 'simpleattack', 'simpleproficiency', 'simpleprof'],
			type: 'attack',
		},
		martial: {
			path: ['intProperties', 'martialProficiency'],
			aliases: [
				'martial',
				'martialweapon',
				'martialattack',
				'martialproficiency',
				'martialprof',
			],
			type: 'attack',
		},
		advanced: {
			path: ['intProperties', 'advancedProficiency'],
			aliases: [
				'advanced',
				'advancedweapon',
				'advancedattack',
				'advancedproficiency',
				'advancedprof',
			],
			type: 'attack',
		},
		unarmored: {
			path: ['intProperties', 'unarmoredProficiency'],
			aliases: [
				'unarmored',
				'unarmoredarmor',
				'unarmoreddefense',
				'unarmoredproficiency',
				'unarmoredprof',
			],
			type: 'armor',
		},
		light: {
			path: ['intProperties', 'lightProficiency'],
			aliases: ['light', 'lightarmor', 'lightdefense', 'lightproficiency', 'lightprof'],
			type: 'armor',
		},
		medium: {
			path: ['intProperties', 'mediumProficiency'],
			aliases: ['medium', 'mediumarmor', 'mediumdefense', 'mediumproficiency', 'mediumprof'],
			type: 'armor',
		},
		heavy: {
			path: ['intProperties', 'heavyProficiency'],
			aliases: ['heavy', 'heavyarmor', 'heavydefense', 'heavyproficiency', 'heavyprof'],
			type: 'armor',
		},
	};

	public static planAttribute(input: string): PlannedAttribute {
		const normalized = normalizeAttributeRef(input);
		const standardized = SheetProperties.standardizeProperty(normalized);
		const counterAlias = SheetBaseCounterProperties.readAliases[normalized.replaceAll(' ', '')];

		if (this.levelNames.has(normalized)) {
			return {
				input,
				normalized,
				plan: {
					kind: 'json',
					name: 'level',
					aliases: ['level'],
					type: 'base',
					tags: ['level'],
					path: ['staticInfo', 'level'],
				},
			};
		}

		if (this.generalProficiencyBonuses[normalized] !== undefined) {
			return {
				input,
				normalized,
				plan: {
					kind: 'levelComputed',
					name: normalized,
					aliases: [
						normalized,
						`${normalized}total`,
						`${normalized}bonus`,
						`${normalized}mod`,
						`${normalized}modifier`,
					],
					type: 'proficiency',
					tags: [],
					bonus: this.generalProficiencyBonuses[normalized],
				},
			};
		}

		const computed = Object.entries(this.computedProficiencies).find(([name, def]) => {
			return name === normalized || def.aliases.includes(normalized);
		});
		if (computed) {
			const [name, def] = computed;
			return {
				input,
				normalized,
				plan: {
					kind: 'proficiencyComputed',
					name,
					aliases: def.aliases,
					type: def.type,
					tags: [],
					proficiencyPath: def.path,
				},
			};
		}

		if (counterAlias) {
			const property = SheetProperties.properties[counterAlias.key];
			return {
				input,
				normalized,
				plan: {
					kind: 'json',
					name:
						(counterAlias.variant === 'max' ? 'max' : 'current') +
						_.capitalize(counterAlias.key),
					aliases: property.aliases,
					type: property.type,
					tags: property.tags,
					path: [
						'baseCounters',
						counterAlias.key,
						counterAlias.variant === 'max' ? 'max' : 'current',
					],
				},
			};
		}

		if (SheetIntegerProperties.properties[standardized as keyof typeof SheetIntegerProperties.properties]) {
			const key = standardized as keyof typeof SheetIntegerProperties.properties;
			const property = SheetIntegerProperties.properties[key];
			return {
				input,
				normalized,
				plan: {
					kind: 'json',
					name: key,
					aliases: property.aliases,
					type: property.type,
					tags: property.tags,
					path: ['intProperties', key],
				},
			};
		}

		if (SheetStatProperties.isSheetStatPropertyName(standardized)) {
			const property = SheetStatProperties.properties[standardized];
			return {
				input,
				normalized,
				plan: {
					kind: 'json',
					name: standardized,
					aliases: property.aliases,
					type: property.type,
					tags: property.tags,
					path: ['stats', property.baseKey, property.subKey],
				},
			};
		}

		return { input, normalized, plan: null };
	}

	public static tagsForRefs(refs: string[]): string[] {
		return _.uniq(
			refs.flatMap(ref => this.planAttribute(ref).plan?.tags ?? []).filter(Boolean)
		);
	}
}

export class RollContextService {
	constructor(private kobold: Kobold) {}

	public async getGmUserIdForCharacter(character: CharacterBasic): Promise<string | undefined> {
		const gameId = character.gameId;
		if (!gameId) return undefined;
		const game = await this.kobold.db
			.selectFrom('game')
			.select('game.gmUserId')
			.where('game.id', '=', gameId)
			.executeTakeFirst();
		return game?.gmUserId;
	}

	public async getActiveSubject({
		userId,
		guildId,
		channelId,
		includeGmUserId = false,
	}: {
		userId: string;
		guildId?: string;
		channelId?: string;
		includeGmUserId?: boolean;
	}): Promise<RollSubjectContext | null> {
		const character = await this.kobold.character.readActiveLite({ userId, guildId, channelId });
		if (!character) return null;
		return {
			character,
			gmUserId: includeGmUserId ? await this.getGmUserIdForCharacter(character) : undefined,
		};
	}

	public async getExpansionContext({
		userId,
		guildId,
		channelId,
		includeGmUserId = false,
	}: {
		userId: string;
		guildId?: string;
		channelId?: string;
		includeGmUserId?: boolean;
	}): Promise<RollExpansionContext> {
		const subject = await this.getActiveSubject({ userId, guildId, channelId, includeGmUserId });
		return this.getExpansionContextForSubject({ userId, subject });
	}

	public async getExpansionContextForSubject({
		userId,
		subject,
	}: {
		userId: string;
		subject: RollSubjectContext | null;
	}): Promise<RollExpansionContext> {
		if (!subject) {
			return {
				subject: null,
				userSettings: DefaultUtils.userSettings,
				rollMacros: [],
				rollModifiers: [],
			};
		}

		const sheetRecordId = subject.character.sheetRecordId;
		const [userSettings, rollMacros, modifiers, sheetRecord] = await Promise.all([
			this.kobold.userSettings.read({ userId }),
			this.kobold.rollMacro.readManyForCharacter({ userId, sheetRecordId }),
			this.kobold.db
				.selectFrom('modifier')
				.selectAll('modifier')
				.where('modifier.sheetRecordId', '=', sheetRecordId)
				.where('modifier.isActive', '=', true)
				.where('modifier.rollAdjustment', 'is not', null)
				.where('modifier.rollTargetTags', 'is not', null)
				.execute() as Promise<Modifier[]>,
			this.kobold.db
				.selectFrom('sheetRecord')
				.select(['sheetRecord.id', 'sheetRecord.conditions'])
				.where('sheetRecord.id', '=', sheetRecordId)
				.executeTakeFirst(),
		]);

		const rollConditions = ((sheetRecord?.conditions ?? []) as Condition[]).filter(
			condition => condition.isActive && condition.rollAdjustment && condition.rollTargetTags
		);

		return {
			subject,
			userSettings: _.defaults(userSettings, DefaultUtils.userSettings),
			rollMacros,
			rollModifiers: [...modifiers.map(conditionFromModifier), ...rollConditions],
		};
	}

	public async getAttributes({
		sheetRecordId,
		attributeRefs,
	}: {
		sheetRecordId: number;
		attributeRefs: string[];
	}): Promise<Attribute[]> {
		const planned = uniqueNormalizedRefs(attributeRefs).map(ref =>
			RollAttributeRegistry.planAttribute(ref)
		);
		const unknown = planned.filter(attr => !attr.plan);
		if (unknown.length > 0) {
			const full = await this.kobold.sheetRecord.readAdjusted({ id: sheetRecordId });
			const sheet = full?.sheet as Sheet | undefined;
			if (!sheet) return [];
			return planned
				.map(attr => AttributeUtils.getAttributeFromSheet(sheet, attr.input))
				.filter((attr): attr is Attribute => !!attr);
		}

		type SelectRequest = { alias: string; path: string[] };
		const selectRequests: SelectRequest[] = [];
		const valueAliases = new Map<string, string>();

		const addPath = (key: string, path: string[]) => {
			const existing = valueAliases.get(key);
			if (existing) return existing;
			const alias = `rollattr${valueAliases.size}`;
			valueAliases.set(key, alias);
			selectRequests.push({ alias, path });
			return alias;
		};

		const levelAlias = addPath('staticInfo.level', ['staticInfo', 'level']);
		for (const attr of planned) {
			if (!attr.plan) continue;
			if (attr.plan.kind === 'json') {
				addPath(attr.plan.path.join('.'), attr.plan.path);
			} else if (attr.plan.kind === 'proficiencyComputed') {
				addPath(attr.plan.proficiencyPath.join('.'), attr.plan.proficiencyPath);
			}
		}

		let query: any = this.kobold.db
			.selectFrom('sheetRecord')
			.select('sheetRecord.id')
			.where('sheetRecord.id', '=', sheetRecordId);

		for (const request of selectRequests) {
			query = query.select(
				sql<string | null>`jsonb_extract_path_text("sheet_record"."adjusted_sheet", ${sql.join(
					request.path
				)})`.as(request.alias)
			);
		}

		const row = (await query.executeTakeFirst()) as Record<string, string | null> | undefined;
		if (!row) return [];
		const readNumber = (alias: string) => Number(row[alias] ?? 0);
		const level = readNumber(levelAlias);

		const requestedAttributes = planned
			.map(attr => {
				const plan = attr.plan!;
				if (plan.kind === 'json') {
					const alias = valueAliases.get(plan.path.join('.'))!;
					return {
						name: plan.name,
						aliases: plan.aliases,
						type: plan.type,
						tags: plan.tags,
						value: readNumber(alias),
					};
				}
				if (plan.kind === 'levelComputed') {
					return {
						name: plan.name,
						aliases: plan.aliases,
						type: plan.type,
						tags: plan.tags,
						value: level + plan.bonus,
					};
				}
				const alias = valueAliases.get(plan.proficiencyPath.join('.'))!;
				return {
					name: plan.name,
					aliases: plan.aliases,
					type: plan.type,
					tags: plan.tags,
					value: level + readNumber(alias),
				};
			})
			.filter((attr): attr is Attribute => !!attr);

		const staticAttributes: Attribute[] = [
			{
				name: 'level',
				aliases: ['level'],
				type: 'base',
				tags: ['level'],
				value: level,
			},
			...Object.entries(RollAttributeRegistry.generalProficiencyBonuses).map(
				([name, bonus]) => ({
					name,
					aliases: [
						name,
						`${name}total`,
						`${name}bonus`,
						`${name}mod`,
						`${name}modifier`,
					],
					type: 'proficiency',
					tags: [],
					value: level + bonus,
				})
			),
		];

		return _.uniqBy([...requestedAttributes, ...staticAttributes], attr => attr.name);
	}
}

export class RollEngine {
	public static isPureDiceExpression(expression: string): boolean {
		return !hasBracketRefs(expression);
	}

	public static buildSimpleEmbed({
		actorName,
		rollDescription,
		rollNote,
		userSettings,
		rollTitle,
		rollField,
		tags,
	}: {
		actorName: string;
		rollDescription: string;
		rollNote?: string | null;
		userSettings?: UserSettings;
		rollTitle?: string;
		rollField: DiceRollResult | ErrorResult;
		tags?: string[];
	}) {
		const builder = new RollBuilder({
			actorName,
			rollDescription,
			rollNote: rollNote ?? '',
			userSettings,
		});
		const preparedRollField =
			rollField.type === 'error'
				? rollField
				: {
						...rollField,
						name: rollTitle || '\u200B',
				  };
		builder.addPreparedRollResult({
			rollResult: preparedRollField,
			tags,
		});
		return builder;
	}

	public static rollPure({
		rollExpression,
		rollTitle,
		rollDescription,
		rollNote,
		actorName,
		userSettings,
	}: PreparedRollOptions): PreparedRollResult {
		try {
			const rollField = DiceUtils.parseAndEvaluateDiceExpression({
				rollExpression,
				skipModifiers: true,
			});
			const builder = this.buildSimpleEmbed({
				actorName,
				rollDescription,
				rollNote,
				userSettings,
				rollTitle,
				rollField: { ...rollField, name: rollTitle || '\u200B', type: 'dice' },
			});
			return { builder, total: rollField.results.total };
		} catch (err) {
			const errorRoll: ErrorResult = {
				type: 'error',
				value: err instanceof DiceRollError ? err.message : `failed to roll ${rollExpression}`,
			};
			const builder = this.buildSimpleEmbed({
				actorName,
				rollDescription,
				rollNote,
				userSettings,
				rollTitle,
				rollField: errorRoll,
			});
			return { builder, total: null };
		}
	}

	public static async rollWithContext({
		context,
		attributeContextService,
		options,
	}: {
		context: RollExpansionContext;
		attributeContextService: RollContextService;
		options: PreparedRollOptions;
	}): Promise<PreparedRollResult> {
		if (!context.subject) {
			return this.rollPure({ ...options, userSettings: context.userSettings });
		}

		const expandedBase = DiceUtils.expandRollWithMacros(
			options.rollExpression,
			context.rollMacros
		);
		const baseAttributeRefs = uniqueNormalizedRefs(collectBracketRefs(expandedBase));
		const baseAttributePlans = baseAttributeRefs.map(ref =>
			RollAttributeRegistry.planAttribute(ref)
		);
		const hasUnknownBaseAttributeRef = baseAttributePlans.some(attr => !attr.plan);
		const baseAttributeTags = _.uniq(
			baseAttributePlans.flatMap(attr => attr.plan?.tags ?? []).filter(Boolean)
		);
		const baseTags = _.uniq([...(options.baseTags ?? []), ...baseAttributeTags]);

		const candidateModifiers = options.skipModifiers
			? []
			: context.rollModifiers.filter(modifier => {
					const tagAttributeRefs = collectTagAttributeRefs(modifier.rollTargetTags);
					if (tagAttributeRefs.length > 0) return true;
					if (hasUnknownBaseAttributeRef) return true;
					return ModifierUtils.isModifierValidForTags(modifier, [], baseTags);
			  });

		const expandedModifiers = candidateModifiers.map(modifier => {
			const severityApplied =
				modifier.severity !== null
					? ModifierUtils.getSeverityAppliedModifier(modifier)
					: modifier;
			return {
				...severityApplied,
				rollAdjustment: DiceUtils.expandRollWithMacros(
					severityApplied.rollAdjustment ?? '',
					context.rollMacros
				),
			};
		});

		const modifierAttributeRefs = uniqueNormalizedRefs(
			expandedModifiers.flatMap(modifier => [
				...collectBracketRefs(modifier.rollAdjustment ?? ''),
				...collectTagAttributeRefs(modifier.rollTargetTags),
			])
		);
		const allAttributeRefs = _.uniq([...baseAttributeRefs, ...modifierAttributeRefs]);

		if (allAttributeRefs.length === 0 && expandedModifiers.length === 0) {
			return this.rollPure({
				...options,
				rollExpression: expandedBase,
				userSettings: context.userSettings,
			});
		}

		const attributes =
			allAttributeRefs.length === 0
				? []
				: await attributeContextService.getAttributes({
						sheetRecordId: context.subject.character.sheetRecordId,
						attributeRefs: allAttributeRefs,
				  });

		const [parsedBase, parsedTags] = DiceUtils.parseAttributes(
			expandedBase,
			undefined,
			attributes
		);
		const finalTags = _.uniq([...baseTags, ...parsedTags]);
		const modifiers = ModifierUtils.parseBonusesForTagsFromModifiers(
			expandedModifiers,
			attributes,
			finalTags
		);
		const applicableModifiers = modifiers.untyped.concat(
			_.flatten(_.values(modifiers.bonuses)),
			_.flatten(_.values(modifiers.penalties))
		);

		let finalExpression = parsedBase;
		let displayExpression = parsedBase;
		for (const modifier of applicableModifiers) {
			const parsedModifier = modifier.rollAdjustment ?? '0';
			const multiplierText =
				(options.modifierMultiplier ?? 1) !== 1 ? `x${options.modifierMultiplier ?? 1}` : '';
			displayExpression += ` + "${modifier.name}" ${parsedModifier}${multiplierText}`;
			if (options.modifierMultiplier && options.modifierMultiplier !== 1) {
				finalExpression += ` +((${parsedModifier})*(${options.modifierMultiplier}))`;
			} else {
				finalExpression += ` +(${parsedModifier})`;
			}
		}

		try {
			const rollField = DiceUtils.parseAndEvaluateDiceExpression({
				rollExpression: finalExpression,
				skipModifiers: true,
			});
			const displayRollField = {
				...rollField,
				value: rollField.value.replace(finalExpression, displayExpression),
				name: options.rollTitle || '\u200B',
				type: 'dice' as const,
			};
			const builder = this.buildSimpleEmbed({
				actorName: options.actorName,
				rollDescription: options.rollDescription,
				rollNote: options.rollNote,
				userSettings: context.userSettings,
				rollTitle: options.rollTitle,
				rollField: displayRollField,
				tags: finalTags,
			});
			return { builder, total: rollField.results.total };
		} catch (err) {
			const errorRoll: ErrorResult = {
				type: 'error',
				value: err instanceof DiceRollError ? err.message : `failed to roll ${finalExpression}`,
			};
			const builder = this.buildSimpleEmbed({
				actorName: options.actorName,
				rollDescription: options.rollDescription,
				rollNote: options.rollNote,
				userSettings: context.userSettings,
				rollTitle: options.rollTitle,
				rollField: errorRoll,
			});
			return { builder, total: null };
		}
	}

	public static getStructuredRollName(
		choice: string,
		rollKind: 'skill' | 'save' | 'perception'
	): string {
		if (rollKind === 'perception') return 'perception';
		const normalizedChoice = SheetProperties.standardizeCustomPropName(choice);
		const statNames =
			rollKind === 'skill'
				? [
						'acrobatics',
						'arcana',
						'athletics',
						'crafting',
						'deception',
						'diplomacy',
						'intimidation',
						'medicine',
						'nature',
						'occultism',
						'performance',
						'religion',
						'society',
						'stealth',
						'survival',
						'thievery',
				  ]
				: ['fortitude', 'reflex', 'will'];
		const exactResult = statNames.find(statName => statName === normalizedChoice);
		if (exactResult) return exactResult;

		const prefixResults = statNames.filter(statName => statName.startsWith(normalizedChoice));
		if (prefixResults.length === 1) return prefixResults[0];

		const result = StringUtils.findClosestWord(normalizedChoice, statNames);
		if (!result) return choice;
		const distance = StringUtils.levenshteinDistance(normalizedChoice, result);
		return distance <= 2 ? result : choice;
	}

	public static structuredAttributeName(rollName: string): string {
		return `${SheetProperties.standardizeCustomPropName(rollName)}Bonus`;
	}

	public static structuredTags({
		rollName,
		rollKind,
		extraTags = [],
	}: {
		rollName: string;
		rollKind: 'skill' | 'save' | 'perception' | 'initiative';
		extraTags?: string[];
	}): string[] {
		const attrName = this.structuredAttributeName(rollName);
		const attrTags = RollAttributeRegistry.tagsForRefs([attrName]);
		const kindTag =
			rollKind === 'skill' ? 'skill' : rollKind === 'save' ? 'save' : rollKind === 'perception' ? 'skill' : 'initiative';
		return _.uniq([kindTag, ...attrTags, ...extraTags].filter(Boolean));
	}

	public static secretRequiresGm(secretRoll: string): boolean {
		return secretRoll === utilStrings.rollSecretValues.sendToGm;
	}
}
