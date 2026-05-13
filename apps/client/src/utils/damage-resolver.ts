import type {
	Sheet,
	SheetInfoLists,
	SheetWeaknessesResistances,
	WeaknessOrResistance,
} from '@kobold/db';

const damageTypeAliases: Record<string, string> = {
	b: 'bludgeoning',
	electric: 'electricity',
	negative: 'void',
	p: 'piercing',
	positive: 'vitality',
	s: 'slashing',
};

const physicalDamageTypes = new Set(['bludgeoning', 'piercing', 'slashing']);
const energyDamageTypes = new Set([
	'acid',
	'cold',
	'electricity',
	'fire',
	'force',
	'sonic',
]);
const knownDamageTypes = new Set([
	...physicalDamageTypes,
	...energyDamageTypes,
	'bleed',
	'mental',
	'poison',
	'precision',
	'spirit',
	'vitality',
	'void',
	'untyped',
]);
const knownPhrases = [
	'adamantine',
	'cold iron',
	'energy',
	'magical',
	'mithral',
	'non magical',
	'physical',
	'silver',
];

export type PreparedDamageLine = {
	amount: number;
	damageType?: string | null;
	tags?: string[];
	sourceName?: string;
};

export type DamagePacket = {
	actionName?: string;
	tags?: string[];
	lines: PreparedDamageLine[];
};

export type DamageTypeResolution = {
	damageType: string;
	amountBeforeIwr: number;
	amountAfterIwr: number;
	appliedWeaknesses: WeaknessOrResistance[];
	appliedResistance?: WeaknessOrResistance;
	appliedImmunities: string[];
};

export type ResolvedDamage = {
	totalBeforeIwr: number;
	totalAfterIwr: number;
	appliedWeaknesses: SheetWeaknessesResistances['weaknesses'];
	appliedResistances: SheetWeaknessesResistances['resistances'];
	appliedImmunities: SheetInfoLists['immunities'];
	byType: DamageTypeResolution[];
};

type DamageBucket = {
	damageType: string;
	amount: number;
	tags: Set<string>;
};

function normalizeTerm(term: string | null | undefined): string {
	return (term ?? '')
		.toLowerCase()
		.replace(/[-_]/g, ' ')
		.replace(/\bnonmagical\b/g, 'non magical')
		.replace(/\s+/g, ' ')
		.trim();
}

function canonicalDamageType(damageType: string | null | undefined): string {
	const normalized = normalizeTerm(damageType) || 'untyped';
	return damageTypeAliases[normalized] ?? normalized;
}

function splitTerms(value: string): string[] {
	const normalized = normalizeTerm(value).replace(/\bdamage\b/g, '').trim();
	if (!normalized || normalized === 'all') return [];

	let remaining = normalized;
	const terms: string[] = [];
	for (const phrase of knownPhrases.sort((a, b) => b.length - a.length)) {
		if (remaining.includes(phrase)) {
			terms.push(phrase);
			remaining = remaining.replaceAll(phrase, ' ');
		}
	}
	for (const word of remaining.split(/\s+/).filter(Boolean)) {
		terms.push(canonicalDamageType(word));
	}
	return [...new Set(terms)];
}

function parseRuleText(value: string): {
	appliesToAllDamage: boolean;
	exceptions: string[];
	requirements: string[];
} {
	const normalized = normalizeTerm(value).replace(/[()]/g, ' ');
	const [rawRequirement, rawException] = normalized.split(/\bexcept\b/, 2);
	const requirement = rawRequirement.replace(/\bdamage\b/g, '').trim();
	return {
		appliesToAllDamage: requirement === 'all' || requirement === 'all damage',
		exceptions: splitTerms(rawException ?? ''),
		requirements: splitTerms(rawRequirement),
	};
}

function addContextTags(tags: Set<string>, damageType: string) {
	tags.add(damageType);
	tags.add('damage');
	if (physicalDamageTypes.has(damageType)) tags.add('physical');
	if (energyDamageTypes.has(damageType)) tags.add('energy');

	if (tags.has('spell') || tags.has('magical')) tags.add('magical');
	else tags.add('non magical');
}

function buildBucketContext(bucket: DamageBucket): Set<string> {
	const context = new Set<string>();
	for (const tag of bucket.tags) {
		const normalizedTag = normalizeTerm(tag);
		if (normalizedTag) context.add(canonicalDamageType(normalizedTag));
	}
	addContextTags(context, bucket.damageType);
	return context;
}

function termMatches(term: string, bucket: DamageBucket, context: Set<string>): boolean {
	if (term === 'physical') return physicalDamageTypes.has(bucket.damageType);
	if (term === 'energy') return energyDamageTypes.has(bucket.damageType);
	if (term === 'magical') return context.has('magical') || context.has('spell');
	if (term === 'non magical') return !context.has('magical') && !context.has('spell');
	if (knownDamageTypes.has(term)) return bucket.damageType === term || context.has(term);
	return context.has(term);
}

function ruleMatches(value: string, bucket: DamageBucket): boolean {
	const parsed = parseRuleText(value);
	const context = buildBucketContext(bucket);

	if (parsed.exceptions.some(exception => termMatches(exception, bucket, context))) {
		return false;
	}
	if (parsed.appliesToAllDamage) return true;
	if (!parsed.requirements.length) return false;

	return parsed.requirements.every(requirement =>
		termMatches(requirement, bucket, context)
	);
}

function bucketDamage(packet: DamagePacket): DamageBucket[] {
	const buckets = new Map<string, DamageBucket>();
	const packetTags = (packet.tags ?? []).map(normalizeTerm).filter(Boolean);
	for (const line of packet.lines) {
		if (line.amount <= 0) continue;

		const damageType = canonicalDamageType(line.damageType);
		const bucket = buckets.get(damageType) ?? {
			damageType,
			amount: 0,
			tags: new Set<string>(),
		};
		bucket.amount += line.amount;
		for (const tag of [...packetTags, ...(line.tags ?? [])]) {
			const normalizedTag = normalizeTerm(tag);
			if (normalizedTag) bucket.tags.add(normalizedTag);
		}
		addContextTags(bucket.tags, damageType);
		buckets.set(damageType, bucket);
	}
	return [...buckets.values()];
}

function highestResistance(
	resistances: WeaknessOrResistance[],
	bucket: DamageBucket
): WeaknessOrResistance | undefined {
	return resistances
		.filter(resistance => ruleMatches(resistance.type, bucket))
		.sort((a, b) => b.amount - a.amount)[0];
}

function matchingImmunities(immunities: string[], bucket: DamageBucket): string[] {
	return immunities.filter(immunity => ruleMatches(immunity, bucket));
}

function matchingWeaknesses(
	weaknesses: WeaknessOrResistance[],
	bucket: DamageBucket,
	alreadyApplied: Set<string>
): WeaknessOrResistance[] {
	const matchingByType = new Map<string, WeaknessOrResistance>();
	for (const weakness of weaknesses) {
		const key = normalizeTerm(weakness.type);
		if (alreadyApplied.has(key) || !ruleMatches(weakness.type, bucket)) continue;
		const currentWeakness = matchingByType.get(key);
		if (!currentWeakness || weakness.amount > currentWeakness.amount) {
			matchingByType.set(key, weakness);
		}
	}
	return [...matchingByType.values()];
}

export function resolveDamagePacket(sheet: Sheet, packet: DamagePacket): ResolvedDamage {
	const buckets = bucketDamage(packet);
	const appliedWeaknessKeys = new Set<string>();
	const byType: DamageTypeResolution[] = [];

	for (const bucket of buckets) {
		const immunities = matchingImmunities(sheet.infoLists.immunities, bucket);
		let resolvedAmount = bucket.amount;
		let weaknesses: WeaknessOrResistance[] = [];
		let resistance: WeaknessOrResistance | undefined;

		if (immunities.length) {
			resolvedAmount = 0;
		} else {
			weaknesses = matchingWeaknesses(
				sheet.weaknessesResistances.weaknesses,
				bucket,
				appliedWeaknessKeys
			);
			for (const weakness of weaknesses) {
				appliedWeaknessKeys.add(normalizeTerm(weakness.type));
				resolvedAmount += weakness.amount;
			}

			resistance = highestResistance(sheet.weaknessesResistances.resistances, bucket);
			if (resistance) {
				resolvedAmount = Math.max(0, resolvedAmount - resistance.amount);
			}
		}

		byType.push({
			damageType: bucket.damageType,
			amountBeforeIwr: bucket.amount,
			amountAfterIwr: resolvedAmount,
			appliedWeaknesses: weaknesses,
			appliedResistance: resistance,
			appliedImmunities: immunities,
		});
	}

	return {
		totalBeforeIwr: byType.reduce((total, bucket) => total + bucket.amountBeforeIwr, 0),
		totalAfterIwr: byType.reduce((total, bucket) => total + bucket.amountAfterIwr, 0),
		appliedWeaknesses: byType.flatMap(bucket => bucket.appliedWeaknesses),
		appliedResistances: byType
			.map(bucket => bucket.appliedResistance)
			.filter((resistance): resistance is WeaknessOrResistance => !!resistance),
		appliedImmunities: [...new Set(byType.flatMap(bucket => bucket.appliedImmunities))],
		byType,
	};
}
