import { NethysDb } from '@kobold/nethys';
import { CompendiumEntry, PathBuilder } from '@kobold/schema';

export type NethysItemMetadata = {
	name: string;
	category?: string;
	itemCategory?: string;
	itemSubcategory?: string;
	weaponCategory?: string;
	weaponGroup?: string;
	weaponType?: string;
	range?: string | null;
	traits: string[];
	damageType?: string | null;
};

type RawEntry = CompendiumEntry | string | unknown;

function normalizeName(value: string | null | undefined): string {
	return (value ?? '')
		.toLowerCase()
		.replace(/\([^)]*\)/g, '')
		.replace(/[_-]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function parseEntry(raw: RawEntry): any | null {
	if (!raw) return null;
	if (typeof raw === 'string') {
		try {
			return JSON.parse(raw);
		} catch {
			return null;
		}
	}
	return raw;
}

function metadataFromEntry(entry: any): NethysItemMetadata | null {
	if (!entry?.name) return null;
	return {
		name: entry.name,
		category: entry.type ?? entry.category,
		itemCategory: entry.item_category,
		itemSubcategory: entry.item_subcategory,
		weaponCategory: entry.weapon_category,
		weaponGroup: entry.weapon_group,
		weaponType: entry.weapon_type,
		range: entry.range_raw ?? (entry.range ? `${entry.range} ft.` : null),
		traits: (entry.trait_raw ?? entry.trait ?? [])
			.map((trait: unknown) => String(trait).trim())
			.filter(Boolean),
		damageType: Array.isArray(entry.damage_type)
			? entry.damage_type[0]
			: entry.damage_type ?? null,
	};
}

export class NethysItemMetadataIndex {
	protected byName = new Map<string, NethysItemMetadata[]>();

	constructor(entries: RawEntry[] = []) {
		for (const rawEntry of entries) {
			const metadata = metadataFromEntry(parseEntry(rawEntry));
			if (!metadata) continue;
			const name = normalizeName(metadata.name);
			const values = this.byName.get(name) ?? [];
			values.push(metadata);
			this.byName.set(name, values);
		}
	}

	public findBaseWeapon(name: string): NethysItemMetadata | null {
		return (
			this.byName
				.get(normalizeName(name))
				?.find(
					entry =>
						entry.itemCategory === 'Weapons' &&
						entry.itemSubcategory === 'Base Weapons'
				) ?? null
		);
	}

	public findWeaponRune(name: string): NethysItemMetadata | null {
		return (
			this.byName
				.get(normalizeName(name))
				?.find(
					entry =>
						entry.itemCategory === 'Runes' &&
						entry.itemSubcategory === 'Weapon Property Runes'
				) ?? null
		);
	}

	public findMaterial(name: string | null | undefined): NethysItemMetadata | null {
		if (!name) return null;
		return (
			this.byName
				.get(normalizeName(name))
				?.find(entry => entry.itemCategory === 'Materials') ?? null
		);
	}
}

export function createNethysItemMetadataIndex(entries: RawEntry[] = []) {
	return new NethysItemMetadataIndex(entries);
}

function pathbuilderMetadataSearchTerms(pathBuilderSheet: PathBuilder.Character): string[] {
	const terms = new Set<string>();
	for (const weapon of pathBuilderSheet.weapons ?? []) {
		if (weapon.name) terms.add(String(weapon.name));
		for (const rune of weapon.runes ?? []) {
			if (rune) terms.add(String(rune));
		}
		if (weapon.mat) terms.add(String(weapon.mat));
	}
	return [...terms].map(normalizeName).filter(Boolean);
}

export async function fetchNethysItemMetadataForPathbuilder(
	pathBuilderSheet: PathBuilder.Character,
	options: { nethysDb?: NethysDb; gameSystem?: string } = {}
): Promise<CompendiumEntry[]> {
	const terms = pathbuilderMetadataSearchTerms(pathBuilderSheet);
	if (!terms.length) return [];

	const nethysDb = options.nethysDb ?? new NethysDb();
	const ownsDb = !options.nethysDb;
	try {
		const rows = await Promise.all(
			terms.map(term =>
				nethysDb.search(term, {
					limit: 25,
					searchTermOnly: false,
					bestiary: false,
					gameSystem: options.gameSystem ?? 'pf2e',
				})
			)
		);
		return rows.flat().map(row => row.data);
	} catch {
		return [];
	} finally {
		if (ownsDb) {
			await nethysDb.client.end({ timeout: 5 });
		}
	}
}
