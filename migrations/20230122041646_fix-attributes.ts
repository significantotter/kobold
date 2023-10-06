import { Knex } from 'knex';

const attributeAbilityMap: { [k: string]: string } = {
	acrobatics: 'dexterity',
	arcana: 'intelligence',
	athletics: 'strength',
	crafting: 'intelligence',
	deception: 'charisma',
	diplomacy: 'charisma',
	intimidation: 'charisma',
	medicine: 'wisdom',
	nature: 'wisdom',
	occultism: 'intelligence',
	performance: 'charisma',
	religion: 'dexterity',
	society: 'intelligence',
	stealth: 'dexterity',
	survival: 'wisdom',
	thievery: 'dexterity',
	perception: 'wisdom',

	fortitude: 'constitution',
	reflex: 'dexterity',
	will: 'wisdom',

	strength: 'strength',
	dexterity: 'dexterity',
	constitution: 'constitution',
	intelligence: 'intelligence',
	wisdom: 'wisdom',
	charisma: 'charisma',
};

//this needs to be run again because it referenced the wrong variable for maxHP and totalAC
export async function up(knex: Knex): Promise<void> {
	let [charactersCount, characters] = await Promise.all([
		knex('character').count('*', { as: 'count' }),
		knex('character').select('*').orderBy('id', 'asc').limit(1000).offset(0),
	]);
	let offset = 1000;
	while (characters.length) {
		//convert attributes into new structure
		const characterUpdates = characters.map(character => {
			const characterData = character.character_data;
			const calculatedStats = character.calculated_stats;
			const attributes = [
				{ name: 'level', type: 'base', value: characterData.level, tags: ['level'] },
				{ name: 'maxHp', type: 'base', value: calculatedStats.maxHP, tags: ['maxHp'] },
				{
					name: 'hp',
					type: 'base',
					value: characterData.currentHealth ?? calculatedStats.maxHP,
					tags: ['hp'],
				},
				{
					name: 'tempHp',
					type: 'base',
					value: characterData.tempHealth ?? 0,
					tags: ['tempHp'],
				},
				{ name: 'ac', type: 'base', value: calculatedStats.totalAC, tags: ['ac'] },
				{
					name: 'heroPoints',
					type: 'base',
					value: characterData.heroPoints,
					tags: ['heroPoints'],
				},

				{ name: 'speed', type: 'base', value: calculatedStats.totalSpeed, tags: ['speed'] },
				{
					name: 'classDC',
					type: 'base',
					value: calculatedStats.totalClassDC,
					tags: ['classDc'],
				},
				{
					name: 'perception',
					type: 'skill',
					value: calculatedStats.totalPerception,
					tags: ['skill', 'perception'],
				},
			];
			if (characterData.variantStamina) {
				attributes.push(
					{
						name: 'maxStamina',
						type: 'base',
						value: calculatedStats.maxStamina,
						tags: ['maxStamina'],
					},
					{
						name: 'maxResolve',
						type: 'base',
						value: calculatedStats.maxResolve,
						tags: ['maxResolve'],
					},
					{
						name: 'stamina',
						type: 'base',
						value: characterData.currentStamina ?? 0,
						tags: ['stamina'],
					},
					{
						name: 'resolve',
						type: 'base',
						value: characterData.currentResolve ?? 0,
						tags: ['resolve'],
					}
				);
			}
			for (const abilityScore of calculatedStats.totalAbilityScores) {
				attributes.push({
					name: abilityScore.Name,
					value: Math.floor((abilityScore.Score - 10) / 2),
					type: 'ability',
					tags: ['ability', abilityScore.Name.toLocaleLowerCase()],
				});
			}
			for (const save of calculatedStats.totalSaves) {
				const attr = {
					name: save.Name,
					value: Number(save.Bonus),
					type: 'save',
					tags: ['save', save.Name.toLocaleLowerCase()],
				};
				if (attributeAbilityMap[save.Name.toLocaleLowerCase()])
					attr.tags.push(attributeAbilityMap[save.Name.toLocaleLowerCase()]);
				attributes.push(attr);
			}
			for (const skill of calculatedStats.totalSkills) {
				const attr = {
					name: skill.Name,
					value: Number(skill.Bonus),
					type: 'skill',
					tags: ['skill', skill.Name.toLocaleLowerCase()],
				};
				if (attributeAbilityMap[skill.Name.toLocaleLowerCase()])
					attr.tags.push(attributeAbilityMap[skill.Name.toLocaleLowerCase()]);
				if ((skill.Name as string).toLocaleLowerCase().includes('lore'))
					attr.tags.push('intelligence');
				attributes.push(attr);
			}

			return {
				id: character.id,
				attributes,
			};
		});

		//perform and commit the batch attribute update
		const trx = await knex.transaction();
		await Promise.all(
			characterUpdates.map(update => {
				return knex('character')
					.where('id', update.id)
					.update({ attributes: JSON.stringify(update.attributes) })
					.transacting(trx);
			})
		);
		await trx.commit();

		//fetch the next page
		characters = await knex('character')
			.select('*')
			.orderBy('id', 'asc')
			.limit(1000)
			.offset(offset);
	}
}

export function down(knex: Knex): void {
	return;
}
