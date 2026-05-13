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

const damageTypes = new Set([
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

function splitList(value: string): string[] {
	return stripMarkdown(value)
		.split(/,(?![^()]*\))/)
		.map(part => part.trim())
		.filter(Boolean);
}

function canonicalTerm(value: string): string {
	const term = normalize(value.replace(/\bdamage\b/g, ''));
	return damageAliases[term] ?? term;
}

function matcherForTerms(rawTerms: string): DefenseRule['match'] {
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
		} else if (damageTypes.has(term)) {
			match.damageTypes = [...(match.damageTypes ?? []), term];
		} else if (materials.has(term)) {
			match.materials = [...(match.materials ?? []), term];
		} else if (conditionLabels.has(term)) {
			match.conditions = [...(match.conditions ?? []), term];
		} else if (term) {
			match.traits = [...(match.traits ?? []), term];
		}
	}
	return match;
}

function parseException(value: string): DefenseRule['match'] | undefined {
	const exceptionMatch = value.match(/\((?:[^)]*?\bexcept\b)([^);]+)(?:;[^)]*)?\)/i);
	if (!exceptionMatch?.[1]) return undefined;
	return matcherForTerms(exceptionMatch[1]);
}

function parseAmountRule(
	rawEntry: string,
	source: DefenseRuleSource,
	kind: 'weakness' | 'resistance'
): DefenseRule {
	const cleaned = stripMarkdown(rawEntry);
	const amountMatch = cleaned.match(/^(.+?)\s+(\d+)(?:\s|\(|$)/);
	if (!amountMatch) {
		return {
			label: cleaned,
			raw: cleaned,
			appliesTo: ['damage'],
			match: matcherForTerms(cleaned),
			automation: DefenseRuleAutomation.manual,
			source,
		};
	}

	const label = canonicalTerm(amountMatch[1]).replace(/^all physical$/, 'physical');
	const amount = Number(amountMatch[2]);
	const match = matcherForTerms(amountMatch[1]);
	const except = parseException(cleaned);
	if (except) match.except = except;

	const hasUnknownMatcher =
		!match.all &&
		!(match.damageTypes?.length || match.damageGroups?.length || match.materials?.length || match.traits?.length);

	return {
		label,
		raw: cleaned,
		amount,
		appliesTo: ['damage'],
		match,
		automation: hasUnknownMatcher ? DefenseRuleAutomation.manual : DefenseRuleAutomation.auto,
		source,
	};
}

function parseImmunityRule(rawEntry: string, source: DefenseRuleSource): DefenseRule {
	const cleaned = stripMarkdown(rawEntry);
	const term = canonicalTerm(cleaned);
	const match = matcherForTerms(term);
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
			? splitList(resistanceText).map(entry => parseAmountRule(entry, source, 'resistance'))
			: [],
		weaknesses: weaknessText
			? splitList(weaknessText).map(entry => parseAmountRule(entry, source, 'weakness'))
			: [],
	};
}

export function defenseRuleToLegacyLabel(rule: DefenseRule): string {
	return rule.amount == null ? rule.label : `${rule.label} ${rule.amount}`;
}
