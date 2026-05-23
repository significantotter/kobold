import type { DefenseMatcher, DefenseRule, Sheet } from '@kobold/db';

export type DamageOutcome = 'critical success' | 'success' | 'failure' | 'critical failure';

const damageTypeAliases: Record<string, string> = {
	b: 'bludgeoning',
	electric: 'electricity',
	negative: 'void',
	p: 'piercing',
	positive: 'vitality',
	s: 'slashing',
};

const physicalDamageTypes = new Set(['bludgeoning', 'piercing', 'slashing']);
const energyDamageTypes = new Set(['acid', 'cold', 'electricity', 'fire', 'force', 'sonic']);
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
]);

export type PreparedDamageLine = {
	amount: number;
	damageType?: string | null;
	tags?: string[];
	sourceName?: string;
	actualOutcome?: DamageOutcome | null;
	damageOutcome?: DamageOutcome | null;
	outcomeAdjustedBy?: DefenseRule[];
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
	appliedWeaknesses: DefenseRule[];
	appliedResistance?: DefenseRule;
	appliedImmunities: DefenseRule[];
};

export type ResolvedDamage = {
	totalBeforeIwr: number;
	totalAfterIwr: number;
	appliedWeaknesses: DefenseRule[];
	appliedResistances: DefenseRule[];
	appliedImmunities: DefenseRule[];
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

function addContextTags(tags: Set<string>, damageType: string) {
	tags.add(damageType);
	tags.add('damage');
	if (physicalDamageTypes.has(damageType)) tags.add('physical');
	if (energyDamageTypes.has(damageType)) tags.add('energy');
	if (tags.has('spell') || tags.has('magical')) tags.add('magical');
	else tags.add('non magical');
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

function matcherTermsMatch(values: string[] | undefined, bucket: DamageBucket): boolean {
	if (!values?.length) return false;
	for (const value of values) {
		const term = canonicalDamageType(value);
		if (bucket.damageType === term || bucket.tags.has(term)) return true;
	}
	return false;
}

function matcherDamageTypesMatch(values: string[] | undefined, bucket: DamageBucket): boolean {
	if (!values?.length) return false;
	return values.some(value => bucket.damageType === canonicalDamageType(value));
}

function matcherTraitsMatch(values: string[] | undefined, bucket: DamageBucket): boolean {
	if (!values?.length) return false;
	for (const value of values) {
		const term = canonicalDamageType(value);
		if (knownDamageTypes.has(term)) continue;
		if (bucket.tags.has(term)) return true;
	}
	return false;
}

function matcherMatches(matcher: DefenseMatcher, bucket: DamageBucket): boolean {
	if (matcher.except && matcherMatches(matcher.except, bucket)) return false;
	if (matcher.allOf?.length) {
		return matcher.allOf.every(childMatcher => matcherMatches(childMatcher, bucket));
	}
	if (matcher.all) return true;
	if (matcher.damageGroups?.includes('physical') && physicalDamageTypes.has(bucket.damageType)) {
		return true;
	}
	if (matcherDamageTypesMatch(matcher.damageTypes, bucket)) return true;
	if (matcherTermsMatch(matcher.materials, bucket)) return true;
	if (matcherTraitsMatch(matcher.traits, bucket)) return true;
	if (matcherTermsMatch(matcher.effectTypes, bucket)) return true;
	if (matcherTermsMatch(matcher.conditions, bucket)) return true;
	return false;
}

function automaticRules(rules: DefenseRule[] | undefined): DefenseRule[] {
	return (rules ?? []).filter(rule => rule.automation !== 'manual');
}

function matchingImmunities(immunities: DefenseRule[], bucket: DamageBucket): DefenseRule[] {
	return automaticRules(immunities).filter(rule => matcherMatches(rule.match, bucket));
}

function highestResistance(
	resistances: DefenseRule[],
	bucket: DamageBucket
): DefenseRule | undefined {
	return automaticRules(resistances)
		.filter(rule => rule.amount != null && matcherMatches(rule.match, bucket))
		.sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0))[0];
}

function matchingWeaknesses(
	weaknesses: DefenseRule[],
	bucket: DamageBucket,
	alreadyApplied: Set<string>
): DefenseRule[] {
	const matchingByLabel = new Map<string, DefenseRule>();
	for (const weakness of automaticRules(weaknesses)) {
		const key = normalizeTerm(weakness.label || weakness.raw);
		if (
			alreadyApplied.has(key) ||
			weakness.amount == null ||
			!matcherMatches(weakness.match, bucket)
		) {
			continue;
		}
		const currentWeakness = matchingByLabel.get(key);
		if (!currentWeakness || (weakness.amount ?? 0) > (currentWeakness.amount ?? 0)) {
			matchingByLabel.set(key, weakness);
		}
	}
	return [...matchingByLabel.values()];
}

function nonlethalImmune(sheet: Sheet, packet: DamagePacket): DefenseRule[] {
	const packetTags = new Set((packet.tags ?? []).map(normalizeTerm));
	for (const line of packet.lines) {
		for (const tag of line.tags ?? []) packetTags.add(normalizeTerm(tag));
	}
	if (!packetTags.has('nonlethal')) return [];
	return automaticRules(sheet.defenses.immunities).filter(rule =>
		rule.appliesTo.includes('nonlethal')
	);
}

export function hasCriticalHitImmunity(sheet: Sheet): boolean {
	return getCriticalHitImmunities(sheet).length > 0;
}

export function getCriticalHitImmunities(sheet: Sheet): DefenseRule[] {
	return automaticRules(sheet.defenses.immunities).filter(rule =>
		rule.appliesTo.includes('critical-hit')
	);
}

export function resolveDamagePacket(sheet: Sheet, packet: DamagePacket): ResolvedDamage {
	const packetImmunities = nonlethalImmune(sheet, packet);
	if (packetImmunities.length) {
		const buckets = bucketDamage(packet);
		return {
			totalBeforeIwr: buckets.reduce((total, bucket) => total + bucket.amount, 0),
			totalAfterIwr: 0,
			appliedWeaknesses: [],
			appliedResistances: [],
			appliedImmunities: packetImmunities,
			byType: buckets.map(bucket => ({
				damageType: bucket.damageType,
				amountBeforeIwr: bucket.amount,
				amountAfterIwr: 0,
				appliedWeaknesses: [],
				appliedImmunities: packetImmunities,
			})),
		};
	}

	const buckets = bucketDamage(packet);
	const appliedWeaknessKeys = new Set<string>();
	const byType: DamageTypeResolution[] = [];

	for (const bucket of buckets) {
		const immunities = matchingImmunities(sheet.defenses.immunities, bucket);
		let resolvedAmount = bucket.amount;
		let weaknesses: DefenseRule[] = [];
		let resistance: DefenseRule | undefined;

		if (immunities.length) {
			resolvedAmount = 0;
		} else {
			weaknesses = matchingWeaknesses(sheet.defenses.weaknesses, bucket, appliedWeaknessKeys);
			for (const weakness of weaknesses) {
				appliedWeaknessKeys.add(normalizeTerm(weakness.label || weakness.raw));
				resolvedAmount += weakness.amount ?? 0;
			}

			resistance = highestResistance(sheet.defenses.resistances, bucket);
			if (resistance?.amount != null) {
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
			.filter((resistance): resistance is DefenseRule => !!resistance),
		appliedImmunities: [
			...new Map(
				byType
					.flatMap(bucket => bucket.appliedImmunities)
					.map(rule => [normalizeTerm(rule.label || rule.raw), rule])
			).values(),
		],
		byType,
	};
}
