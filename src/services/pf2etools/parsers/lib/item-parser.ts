import { EmbedData } from 'discord.js';
import { Item } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';
import _ from 'lodash';

export async function parseItem(this: CompendiumEmbedParser, item: Item): Promise<EmbedData> {
	const entryParser = new EntryParser({ delimiter: '\n', emojiConverter: this.emojiConverter });
	const title = `${item.name}`;
	const descriptionLines: string[] = [];
	if (item.traits) descriptionLines.push(`**Traits** ${item.traits.join(', ')}`);
	if (item.contract) {
		descriptionLines.push(
			`**Devil** ${item.contract.devil} **Decipher Writing** ${item.contract.decipher.join(
				', '
			)}`
		);
	}
	if (item.aspects) descriptionLines.push(`**Aspects** ${item.aspects.join(', ')}`);
	if (item.access) descriptionLines.push(`**Access** ${item.access}`);
	if (item.cost) descriptionLines.push(`**Cost** ${item.cost}`);
	if (item.prerequisites) descriptionLines.push(`**Prerequisites** ${item.prerequisites}`);
	let grantedStatsLine: string[] = [];
	if (item.price) {
		grantedStatsLine.push(this.helpers.parsePrice(item.price));
	}
	if (item.armorData) {
		if (item.armorData.ac) grantedStatsLine.push(`**AC Bonus** +${item.armorData.ac}`);
		if (item.armorData.dexCap) grantedStatsLine.push(`**Dex Cap** +${item.armorData.dexCap}`);
		if (item.armorData.checkPen)
			grantedStatsLine.push(`**Check Penalty** ${item.armorData.checkPen}`);
		if (item.armorData.speedPen)
			grantedStatsLine.push(`**Speed Penalty** -${item.armorData.speedPen} ft`);
	}
	if (item.shieldData) {
		if (item.shieldData.ac)
			grantedStatsLine.push(
				`**AC Bonus** +${item.shieldData.ac}${
					item.shieldData.ac2 ? `/+${item.shieldData.ac2}` : ''
				}`
			);
		if (item.shieldData.hardness)
			grantedStatsLine.push(`**Hardness** ${item.shieldData.hardness}`);
		if (item.shieldData.hp) grantedStatsLine.push(`**HP** ${item.shieldData.hp}`);
		if (item.shieldData.bt) grantedStatsLine.push(`**BT** ${item.shieldData.bt}`);
		if (item.shieldData.speedPen)
			grantedStatsLine.push(`**Speed Penalty** -${item.shieldData.speedPen} ft`);
	}
	if (!item.comboWeaponData && item.weaponData) {
		if (item.weaponData.damage)
			grantedStatsLine.push(
				`**Damage** ${item.weaponData.damage} ${
					item.weaponData.type ?? item.weaponData.damageType
				}`.trim()
			);
		if (item.weaponData.hands) grantedStatsLine.push(`**Hands** ${item.weaponData.hands}`);
	}
	const fields: { name: string; value: string; inline: boolean }[] = [];
	if (item.comboWeaponData) {
		let weaponDataLine = [];
		let comboWeaponDataLine = [];
		if (item.weaponData?.traits?.length)
			weaponDataLine.push(`**Traits** ${item.weaponData.traits.join(', ')}`);
		if (item.comboWeaponData?.traits?.length)
			comboWeaponDataLine.push(`**Traits** ${item.comboWeaponData.traits.join(', ')}`);
		if (item.weaponData?.damage)
			weaponDataLine.push(
				`**Damage** ${item.weaponData.damage} ${
					' ' + (item.weaponData.type ?? item.weaponData.damageType)
				}`
			);
		if (item.comboWeaponData?.damage)
			comboWeaponDataLine.push(
				`**Damage** ${item.comboWeaponData.damage}${
					' ' + (item.comboWeaponData.type ?? item.comboWeaponData.damageType)
				}`
			);

		if (item.weaponData?.ammunition)
			weaponDataLine.push(`**Ammunition** ${item.weaponData.ammunition}`);
		if (item.comboWeaponData?.ammunition)
			comboWeaponDataLine.push(`**Ammunition** ${item.comboWeaponData.ammunition}`);
		if (item.weaponData?.range) weaponDataLine.push(`**Range** ${item.weaponData.range}`);
		if (item.comboWeaponData?.range)
			comboWeaponDataLine.push(`**Range** ${item.comboWeaponData.range}`);
		if (item.weaponData?.reload) weaponDataLine.push(`**Reload** ${item.weaponData.reload}`);
		if (item.comboWeaponData?.reload)
			comboWeaponDataLine.push(`**Reload** ${item.comboWeaponData.reload}`);

		if (item.weaponData?.group) weaponDataLine.push(`**Group** ${item.weaponData.group}`);
		if (item.comboWeaponData?.group)
			comboWeaponDataLine.push(`**Group** ${item.comboWeaponData.group}`);
		if (item.weaponData?.hands) weaponDataLine.push(`**Hands** ${item.weaponData.hands}`);
		if (item.comboWeaponData?.hands)
			comboWeaponDataLine.push(`**Hands** ${item.comboWeaponData.hands}`);

		fields.push({ name: 'Ranged', value: weaponDataLine.join('\n'), inline: true });
		fields.push({
			name: 'Melee',
			value: comboWeaponDataLine.join('\n'),
			inline: true,
		});
	}
	if (item.siegeWeaponData?.ammunition) {
		grantedStatsLine.push(`**Ammunition** ${item.siegeWeaponData.ammunition}`);
	}
	descriptionLines.push(grantedStatsLine.join('; '));
	const usageLine: string[] = [];
	if (item.usage) usageLine.push(`**Usage** ${item.usage}`);
	if (item.siegeWeaponData?.space) {
		usageLine.push(
			`**Space** ${this.helpers.parseTypedNumber(
				item.siegeWeaponData.space.long
			)} long, ${this.helpers.parseTypedNumber(
				item.siegeWeaponData.space.wide
			)} wide, ${this.helpers.parseTypedNumber(item.siegeWeaponData.space.high)} high`
		);
	}
	if (usageLine.length) descriptionLines.push(usageLine.join('; '));
	if (item.siegeWeaponData?.crew) {
		descriptionLines.push(
			`**Crew** ${item.siegeWeaponData.crew.min}${
				item.siegeWeaponData.crew.max ? ` to ${item.siegeWeaponData.crew.max}` : ''
			}`
		);
	}
	if (item.siegeWeaponData?.defenses) {
		descriptionLines.push(this.helpers.parseDefenses(item.siegeWeaponData.defenses));
	}
	if (item.siegeWeaponData?.speed) {
		descriptionLines.push(
			`**Speed** ${item.siegeWeaponData.speed.speed} ft. ${item.siegeWeaponData.speed.note}`
		);
	}

	if (item.activate) descriptionLines.push(entryParser.parseActivate(item.activate));
	if (item.onset) descriptionLines.push(`**Onset** ${item.onset}`);
	if (item.duration) descriptionLines.push(this.helpers.parseDuration(item.duration));

	let equipmentStatsLine: string[] = [];
	if (item.armorData?.str) equipmentStatsLine.push(`**Strength** ${item.armorData.str}`);
	if (item.bulk) equipmentStatsLine.push(`**Bulk** ${item.bulk}`);
	if (item.category)
		equipmentStatsLine.push(`**Category** ${[item.category].flat(2).join(', ')}`);
	if (item.subCategory) descriptionLines.push(`**Subcategory** ${item.subCategory}`);
	if (item.group) equipmentStatsLine.push(`**Group**: ${item.group}`);
	if (item.ammunition) equipmentStatsLine.push(`**Ammunition** ${item.ammunition}`);

	let itemStats: string[] = [];
	if (item.perception) {
		let sensesData = [];
		if (item.perception.senses?.precise)
			sensesData.push(`Precise ${item.perception.senses.precise}`);
		if (item.perception.senses?.imprecise)
			sensesData.push(`Imprecise ${item.perception.senses.imprecise}`);
		if (item.perception.senses?.notes) sensesData.push(item.perception.senses.notes);
		itemStats.push(`**Perception** ${item.perception.default} ${sensesData.join(', ')}`.trim());
	}
	if (item.communication) {
		itemStats.push(
			`**Communication** ${item.communication
				.map(c => (c.name + c.notes ? ` (${c.notes})` : ''))
				.join(', ')}`
		);
	}
	if (item.skills) {
		itemStats.push(
			`**Skills** ${Object.entries(item.skills)
				.map(([skillName, skill]) => `**${skillName}** +${skill.default}`)
				.join(', ')}`
		);
	}
	if (item.abilityMods) {
		const parsableAbilityMods = {
			str: item.abilityMods.Str,
			dex: item.abilityMods.Dex,
			con: item.abilityMods.Con,
			int: item.abilityMods.Int,
			wis: item.abilityMods.Wis,
			cha: item.abilityMods.Cha,
		};
		itemStats.push(this.helpers.parseAttributes(parsableAbilityMods));
	}
	if (item.savingThrows) {
		itemStats.push(
			`**Saving Throws** ${Object.entries(item.savingThrows)
				.map(([saveName, save]) => `**${saveName}** +${save.default}`)
				.join(', ')}`
		);
	}

	descriptionLines.push(equipmentStatsLine.join('; '));
	if (itemStats.length) {
		descriptionLines.push('');
		descriptionLines.push(itemStats.join('\n'));
	}

	if (item.entries?.length) {
		descriptionLines.push('');
		descriptionLines.push(entryParser.parseEntries(item.entries, true));
	}

	for (const variant of item.variants ?? []) {
		const variantLine: string[] = [];
		if (variant.variantType) variantLine.push(`**Type** ${variant.variantType}`);
		if (variant.traits) variantLine.push(`**Traits** ${variant.traits.join(', ')}`);
		if (variant.level) variantLine.push(`**Level** ${variant.level}`);
		if (variant.price) variantLine.push(this.helpers.parsePrice(variant.price));
		if (variant.bulk) variantLine.push(`**Bulk** ${variant.bulk}`);
		if (variant.activate) variantLine.push(`**Activate** ${variant.activate}`);
		if (variant.usage) variantLine.push(`**Usage** ${variant.usage}`);
		if (variant.appliesTo) variantLine.push(`**Applies to** ${variant.appliesTo.join(' or ')}`);
		if (variant.onset) variantLine.push(`**Onset** ${variant.onset}`);
		if (variant.entries) variantLine.push(entryParser.parseEntries(variant.entries));
		if (variant.craftReq)
			variantLine.push(`**Crafting Requirements** ${variant.craftReq.join(', ')}`);
		fields.push({
			name: variant.name ?? 'Variant',
			value: variantLine.join('\n'),
			inline: false,
		});
	}

	if (item.craftReq)
		descriptionLines.push(`**Crafting Requirements** ${item.craftReq.join(', ')}`);
	if (item.special) descriptionLines.push(`**Special** ${item.special}`);
	if (item.destruction) descriptionLines.push(`**Destruction** ${item.destruction.join('\n')}`);

	if (item.gifts) {
		let gifts = [];
		if (item.gifts.minor?.length) {
			gifts.push(
				`**Minor Gifts** ${item.gifts.minor?.map(gift => gift.split('|')[0]).join(', ')}`
			);
		}
		if (item.gifts.major?.length) {
			gifts.push(
				`**Major Gifts** ${item.gifts.major?.map(gift => gift.split('|')[0]).join(', ')}`
			);
		}
		if (item.gifts.grand?.length) {
			gifts.push(
				`**Grand Gifts** ${item.gifts.grand?.map(gift => gift.split('|')[0]).join(', ')}`
			);
		}
		fields.push({ name: 'Gifts', value: gifts.join('\n'), inline: false });
	}

	return {
		title: title,
		description: descriptionLines.join('\n'),
		fields,
	};
}
