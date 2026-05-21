import {
	DefenseRule,
	DefenseRuleAutomation,
	DefenseRuleSource,
	SheetDefenses,
} from '@kobold/schema';

const damageAliases: Record<string, string> = {
	b: 'bludgeoning',
	electric: 'electricity',
	negative: 'void',
	p: 'piercing',
	positive: 'vitality',
	s: 'slashing',
};

const knownDamageTypes = new Set([
	'acid',
	'bleed',
	'bludgeoning',
	'cold',
	'electricity',
	'fire',
	'force',
	'mental',
	'piercing',
	'poison',
	'precision',
	'slashing',
	'sonic',
	'spirit',
	'vitality',
	'void',
]);

const physicalDamageTypes = new Set(['bludgeoning', 'piercing', 'slashing']);
const materials = new Set(['adamantine', 'cold iron', 'dawnsilver', 'mithral', 'orichalcum', 'silver']);
const knownTraitMatchers = new Set([
	'area',
	'ghost touch',
	'magical',
	'non magical',
	'splash',
]);
const conditionLabels = new Set([
	'blinded',
	'confused',
	'controlled',
	'dazzled',
	'deafened',
	'doomed',
	'drained',
	'dying',
	'enfeebled',
	'fascinated',
	'fatigued',
	'fleeing',
	'frightened',
	'grabbed',
	'grappled',
	'immobilized',
	'paralyzed',
	'paralyze',
	'petrified',
	'prone',
	'quickened',
	'restrained',
	'sickened',
	'slowed',
	'stunned',
	'stupefied',
	'unconscious',
]);

function normalize(value: string | null | undefined): string {
	return (value ?? '')
		.toLowerCase()
		.replace(/[_-]/g, ' ')
		.replace(/\bnonmagical\b/g, 'non magical')
		.replace(/\bdeath\s+effects\b/g, 'death effects')
		.replace(/\s+/g, ' ')
		.trim();
}

function stripMarkdown(value: string | null | undefined): string {
	return (value ?? '')
		.replace(/\r/g, '')
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.replace(/<[^>]+>/g, ' ')
		.replace(/_/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

function extractBlock(markdown: string | null | undefined, label: string): string | null {
	const match = markdown?.match(
		new RegExp(
			`\\*\\*${label}\\*\\*\\s*([\\s\\S]*?)(?=\\n\\s*\\*\\*|\\n\\s*---|\\n\\s*</column>|$)`,
			'i'
		)
	);
	return match?.[1]?.trim() ?? null;
}

function isIgnorableDefenseEntry(value: string): boolean {
	return /^;?\s*double resistance\b/i.test(value) || /^\)+$/.test(value);
}

function splitList(value: string): string[] {
	const cleaned = stripMarkdown(value);
	const entries: string[] = [];
	let depth = 0;
	let current = '';

	for (const char of cleaned) {
		if (char === '(') depth += 1;
		if (char === ')') depth = Math.max(0, depth - 1);
		if (char === ',' && depth === 0) {
			const entry = current.trim();
			if (entry) entries.push(entry);
			current = '';
		} else {
			current += char;
		}
	}

	const finalEntry = current.trim();
	if (finalEntry) entries.push(finalEntry);

	return entries.filter(entry => !isIgnorableDefenseEntry(entry));
}

function hasAmount(entry: string): boolean {
	return (
		/^(.+?)\s+(\d+)(?:\s|\(|$)/.test(entry) ||
		/^(\d+)\s+([^()]+?)(?:\s|\(|$)/.test(entry) ||
		/^(\d+)(?:\s|\(|$)/.test(entry)
	);
}

function cleanListTerm(entry: string): string {
	return entry.replace(/^(?:or|and)\s+/i, '').trim();
}

function expandSharedAmountEntries(entries: string[]): string[] {
	const expanded: string[] = [];
	let pendingAmountless: string[] = [];

	for (const entry of entries) {
		if (!hasAmount(entry)) {
			pendingAmountless.push(entry);
			continue;
		}

		if (!pendingAmountless.length) {
			expanded.push(entry);
			continue;
		}

		const sharedAmountMatch = entry.match(/^(?:or\s+|and\s+)?(.+?)\s+(\d+)(.*)$/i);
		if (!sharedAmountMatch) {
			expanded.push(...pendingAmountless, entry);
			pendingAmountless = [];
			continue;
		}

		const [, finalTerm, amount, suffix = ''] = sharedAmountMatch;
		for (const term of [...pendingAmountless, finalTerm ?? '']) {
			const cleanedTerm = cleanListTerm(term);
			if (cleanedTerm) expanded.push(`${cleanedTerm} ${amount}${suffix}`);
		}
		pendingAmountless = [];
	}

	expanded.push(...pendingAmountless);
	return expanded;
}

function canonicalTerm(value: string): string {
	const term = normalize(value.replace(/\bdamage\b/g, ''));
	return damageAliases[term] ?? term;
}

function matcherForTerms(
	rawTerms: string,
	options: { unknownAs?: 'damageType' | 'trait' } = {}
): DefenseRule['match'] {
	const terms = normalize(stripMarkdown(rawTerms))
		.replace(/\bor\b/g, ',')
		.replace(/\band\b/g, ',')
		.split(',')
		.map(term => canonicalTerm(term))
		.filter(Boolean);

	const match: DefenseRule['match'] = {};
	for (const term of terms) {
		if (term === 'all' || term === 'all damage') {
			match.all = true;
		} else if (term === 'physical' || term === 'all physical') {
			match.damageGroups = [...(match.damageGroups ?? []), 'physical'];
		} else if (knownDamageTypes.has(term)) {
			match.damageTypes = [...(match.damageTypes ?? []), term];
		} else if (materials.has(term)) {
			match.materials = [...(match.materials ?? []), term];
		} else if (conditionLabels.has(term)) {
			match.conditions = [...(match.conditions ?? []), term];
		} else if (knownTraitMatchers.has(term) || options.unknownAs !== 'damageType') {
			match.traits = [...(match.traits ?? []), term];
		} else if (term) {
			match.damageTypes = [...(match.damageTypes ?? []), term];
		}
	}
	return match;
}

function parseException(value: string): DefenseRule['match'] | undefined {
	const exceptionMatch =
		value.match(/\(\s*except\s+([\s\S]*?)(?:;|\))/i) ??
		value.match(/\bexcept\s+([^);]+)/i);
	if (!exceptionMatch?.[1]) return undefined;
	return matcherForTerms(exceptionMatch[1], { unknownAs: 'damageType' });
}

function parseDoubleResistance(value: string): DefenseRule['match'] | undefined {
	const doubleMatch = value.match(
		/\bdouble\s+resistance\s+(?:vs\.?|versus|against|to)\s+([^;)]+)/i
	);
	if (!doubleMatch?.[1]) return undefined;
	return matcherForTerms(doubleMatch[1], { unknownAs: 'trait' });
}

function doubleResistanceLabel(match: DefenseRule['match']): string {
	const terms = [
		...(match.damageTypes ?? []),
		...(match.damageGroups ?? []),
		...(match.materials ?? []),
		...(match.traits ?? []),
		...(match.conditions ?? []),
		...(match.effectTypes ?? []),
	];
	return terms.length ? terms.join(', ') : 'special';
}

function withDoubleResistanceRule(
	baseRule: DefenseRule,
	kind: 'weakness' | 'resistance',
	doubleMatch: DefenseRule['match'] | undefined
): DefenseRule[] {
	if (
		kind !== 'resistance' ||
		!doubleMatch ||
		baseRule.amount == null ||
		baseRule.automation !== DefenseRuleAutomation.auto
	) {
		return [baseRule];
	}

	return [
		baseRule,
		{
			...baseRule,
			label: `${baseRule.label} vs ${doubleResistanceLabel(doubleMatch)}`,
			amount: baseRule.amount * 2,
			match: {
				allOf: [baseRule.match, doubleMatch],
			},
		},
	];
}

function parseAmountRule(
	rawEntry: string,
	source: DefenseRuleSource,
	kind: 'weakness' | 'resistance'
): DefenseRule[] {
	const cleaned = stripMarkdown(rawEntry);
	if (!cleaned || isIgnorableDefenseEntry(cleaned)) return [];

	const amountMatch = cleaned.match(/^(.+?)\s+(\d+)(?:\s|\(|$)/);
	const amountFirstMatch = cleaned.match(/^(\d+)\s+([^()]+?)(?:\s|\(|$)/);
	const amountOnlyMatch = cleaned.match(/^(\d+)(?:\s|\(|$)/);
	const doubleMatch = parseDoubleResistance(cleaned);

	if (!amountMatch) {
		if (amountFirstMatch) {
			const amount = Number(amountFirstMatch[1]);
			const target = amountFirstMatch[2]!.trim();
			const label = canonicalTerm(target).replace(/^all physical$/, 'physical');
			const match = matcherForTerms(target, { unknownAs: 'damageType' });
			const except = parseException(cleaned);
			if (except) match.except = except;

			return withDoubleResistanceRule(
				{
					label,
					raw: cleaned,
					amount,
					appliesTo: ['damage'],
					match,
					automation: DefenseRuleAutomation.auto,
					source,
				},
				kind,
				doubleMatch
			);
		}

		if (amountOnlyMatch) {
			const amount = Number(amountOnlyMatch[1]);
			const match: DefenseRule['match'] = {};
			const except = parseException(cleaned);
			if (except) match.except = except;
			return [
				{
					label: 'unspecified',
					raw: cleaned,
					amount,
					appliesTo: ['damage'],
					match,
					automation: DefenseRuleAutomation.partial,
					source,
				},
			];
		}

		return [
			{
				label: cleaned,
				raw: cleaned,
				appliesTo: ['damage'],
				match: matcherForTerms(cleaned, { unknownAs: 'trait' }),
				automation: DefenseRuleAutomation.manual,
				source,
			},
		];
	}

	const label = canonicalTerm(amountMatch[1]).replace(/^all physical$/, 'physical');
	const amount = Number(amountMatch[2]);
	const match = matcherForTerms(amountMatch[1], { unknownAs: 'damageType' });
	const except = parseException(cleaned);
	if (except) match.except = except;

	const hasUnknownMatcher =
		!match.all &&
		!(
			match.damageTypes?.length ||
			match.damageGroups?.length ||
			match.materials?.length ||
		match.traits?.length
	);

	return withDoubleResistanceRule(
		{
			label,
			raw: cleaned,
			amount,
			appliesTo: ['damage'],
			match,
			automation: hasUnknownMatcher
				? DefenseRuleAutomation.manual
				: DefenseRuleAutomation.auto,
			source,
		},
		kind,
		doubleMatch
	);
}

function parseImmunityRule(rawEntry: string, source: DefenseRuleSource): DefenseRule {
	const cleaned = stripMarkdown(rawEntry);
	const term = canonicalTerm(cleaned);
	const match = matcherForTerms(term, { unknownAs: 'trait' });
	const appliesTo: DefenseRule['appliesTo'] = [];

	if (term.includes('critical')) appliesTo.push('critical-hit');
	if (term.includes('nonlethal')) appliesTo.push('nonlethal', 'damage');
	if (match.conditions?.length) appliesTo.push('condition');
	if ((match.traits?.length && !term.includes('critical')) || term.endsWith('effects')) {
		appliesTo.push('effect');
	}
	if (match.all || match.damageTypes?.length || match.damageGroups?.length || match.materials?.length) {
		appliesTo.push('damage');
	}
	if (!appliesTo.length) appliesTo.push('effect');

	return {
		label: term,
		raw: cleaned,
		appliesTo: [...new Set(appliesTo)],
		match,
		automation: DefenseRuleAutomation.auto,
		source,
	};
}

export function parsePf2eDefenses(input: {
	markdown?: string | null;
	immunityMarkdown?: string | null;
	resistanceMarkdown?: string | null;
	weaknessMarkdown?: string | null;
	immunityRaw?: string | null;
	resistanceRaw?: string | null;
	weaknessRaw?: string | null;
	source?: DefenseRuleSource;
}): SheetDefenses {
	const source = input.source ?? DefenseRuleSource.nethys;
	const immunityText =
		extractBlock(input.markdown, 'Immunities') ??
		input.immunityMarkdown ??
		input.immunityRaw ??
		null;
	const resistanceText =
		extractBlock(input.markdown, 'Resistances') ??
		input.resistanceMarkdown ??
		input.resistanceRaw ??
		null;
	const weaknessText =
		extractBlock(input.markdown, 'Weaknesses') ??
		input.weaknessMarkdown ??
		input.weaknessRaw ??
		null;

	return {
		immunities: immunityText ? splitList(immunityText).map(entry => parseImmunityRule(entry, source)) : [],
		resistances: resistanceText
			? expandSharedAmountEntries(splitList(resistanceText))
					.flatMap(entry => parseAmountRule(entry, source, 'resistance'))
			: [],
		weaknesses: weaknessText
			? expandSharedAmountEntries(splitList(weaknessText))
					.flatMap(entry => parseAmountRule(entry, source, 'weakness'))
			: [],
	};
}

export const parsePathfinderDefenses = parsePf2eDefenses;

export function defenseRuleToLegacyLabel(rule: DefenseRule): string {
	return rule.amount == null ? rule.label : `${rule.label} ${rule.amount}`;
}
