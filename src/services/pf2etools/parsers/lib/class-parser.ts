import { EmbedData } from 'discord.js';
import { Class } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';
import _ from 'lodash';
import { table } from 'table';

export async function _parseClass(this: CompendiumEmbedParser, classValue: Class) {
	const preprocessedData = (await this.preprocessData(classValue)) as Class;
	return parseClass.call(this, preprocessedData);
}

export function parseClass(this: CompendiumEmbedParser, classValue: Class): EmbedData {
	const entryParser = new EntryParser({ delimiter: '\n\n', emojiConverter: this.emojiConverter });
	const title = `${classValue.name}`;
	const descriptionLines = [];
	if (classValue.summary.text) descriptionLines.push(classValue.summary.text);
	descriptionLines.push(`**Key Ability:** ${classValue.keyAbility}`);
	if (classValue.summary.sndAbility ?? classValue.summary.sndAbility)
		descriptionLines.push(`**Secondary Ability:** ${classValue.summary.sndAbility}`);
	if (classValue.hp) descriptionLines.push(`**Hit Points:** ${classValue.hp}`);

	const proficiencyLines: string[] = [];

	const profShorthandToText: { [k: string]: string } = {
		U: 'Untrained',
		T: 'Trained',
		E: 'Expert',
	};

	if (classValue.initialProficiencies.perception)
		proficiencyLines.push(
			`__Perception__\n${
				profShorthandToText[classValue.initialProficiencies.perception]
			} in Perception`
		);
	proficiencyLines.push(
		`__Saving Throws__\n${
			profShorthandToText[classValue.initialProficiencies.fort]
		} in Fortitude\n${profShorthandToText[classValue.initialProficiencies.ref]} in Reflex\n${
			profShorthandToText[classValue.initialProficiencies.will]
		} in Will`
	);
	let skillText = '';
	if (classValue.initialProficiencies.skills?.t) {
		classValue.initialProficiencies.skills?.t
			.map(skill => `Trained in ${skill.entry ?? skill.skill.join(', ')}`)
			.join('\n');
	}
	proficiencyLines.push(skillText);
	let attackLines: string[] = [];
	attackLines.push('__Attacks__');
	if (classValue.initialProficiencies.attacks?.e) {
		attackLines.push(
			classValue.initialProficiencies.attacks.e
				.map(attack => `Expert in ${attack}`)
				.join('\n')
		);
	}
	if (classValue.initialProficiencies.attacks?.t) {
		attackLines.push(
			classValue.initialProficiencies.attacks.t
				.map(attack => `Trained in ${attack}`)
				.join('\n')
		);
	}
	proficiencyLines.push(attackLines.join('\n'));

	let defenseLines: string[] = [];
	defenseLines.push('__Defenses__');
	if (classValue.initialProficiencies.defenses?.e) {
		defenseLines.push(
			classValue.initialProficiencies.defenses.e
				.map(defense => `Expert in ${defense}`)
				.join('\n')
		);
	}
	if (classValue.initialProficiencies.defenses?.t) {
		defenseLines.push(
			classValue.initialProficiencies.defenses.t
				.map(defense => `Trained in ${defense}`)
				.join('\n')
		);
	}
	proficiencyLines.push(defenseLines.join('\n'));
	if (classValue.initialProficiencies.spells) {
		const spellLines: string[] = [];
		spellLines.push('__Spells__');
		if (classValue.initialProficiencies.spells.t) {
			spellLines.push(
				classValue.initialProficiencies.spells.t
					.map(spell => `Trained in ${spell}`)
					.join('\n')
			);
		}
		if (classValue.initialProficiencies.spells.e) {
			spellLines.push(
				classValue.initialProficiencies.spells.e
					.map(spell => `Expert in ${spell}`)
					.join('\n')
			);
		}
		proficiencyLines.push(spellLines.join('\n'));
	}
	if (classValue.initialProficiencies.classDc) {
		proficiencyLines.push(`__Class DC__\n${classValue.initialProficiencies.classDc.entry}`);
	}

	const proficienciesField = {
		name: 'Initial Proficiencies',
		value: proficiencyLines.join('\n\n'),
	};

	const featuresByLevel: string[][] = [
		['lv', 'Class Features'],
		['1'],
		['2'],
		['3'],
		['4'],
		['5'],
		['6'],
		['7'],
		['8'],
		['9'],
		['10'],
		['11'],
		['12'],
		['13'],
		['14'],
		['15'],
		['16'],
		['17'],
		['18'],
		['19'],
		['20'],
	];
	classValue.advancement.classFeats.forEach(level =>
		featuresByLevel[Number(level)].push(`${classValue.name} feat`)
	);
	classValue.advancement.skillFeats.forEach(level =>
		featuresByLevel[Number(level)].push('skill feat')
	);
	classValue.advancement.generalFeats.forEach(level =>
		featuresByLevel[Number(level)].push('general feat')
	);
	classValue.advancement.ancestryFeats.forEach(level =>
		featuresByLevel[Number(level)].push('ancestry feat')
	);
	classValue.advancement.skillIncrease.forEach(level =>
		featuresByLevel[Number(level)].push('skill increase')
	);
	classValue.advancement.abilityBoosts.forEach(level =>
		featuresByLevel[Number(level)].push('ability boost')
	);
	for (const feature of classValue.classFeatures) {
		let targetLevel: string;
		let featureName: string;
		if (_.isObject(feature)) {
			const [name, className, source, level] = feature.classFeature.split('|');
			targetLevel = level;
			featureName = name;
		} else {
			const [name, className, source, level] = feature.split('|');
			targetLevel = level;
			featureName = name;
		}
		featuresByLevel[Number(targetLevel)].push(featureName);
	}

	const classFeatureArrays = [
		[
			featuresByLevel[0],
			...featuresByLevel.slice(1, 6).map(level => [level[0], level.slice(1).join('\n')]),
		],
		[
			featuresByLevel[0],
			...featuresByLevel.slice(6, 11).map(level => [level[0], level.slice(1).join('\n')]),
		],
		[
			featuresByLevel[0],
			...featuresByLevel.slice(11, 16).map(level => [level[0], level.slice(1).join('\n')]),
		],
		[
			featuresByLevel[0],
			...featuresByLevel.slice(16, 21).map(level => [level[0], level.slice(1).join('\n')]),
		],
	];
	const classFeatureTables = classFeatureArrays.map(classFeatureArray =>
		table(classFeatureArray, {
			border: {
				topLeft: ``,
				topRight: ``,
				bottomLeft: ``,
				bottomRight: ``,
				bodyLeft: ``,
				bodyRight: ``,
				joinLeft: ``,
				joinRight: ``,
			},
			columns: [
				{
					paddingLeft: 0,
					paddingRight: 0,
					width: 2,
				},
				{
					paddingLeft: 0,
					paddingRight: 0,
					width: 18,
				},
			],
		})
	);
	const classFeatureFields = classFeatureTables.map(classFeatureTable => ({
		name: '\u200B',
		value: '```' + classFeatureTable + '```',
		inline: true,
	}));
	classFeatureFields[0].name = 'Class Features';
	classFeatureFields.splice(0, 0, { name: '\u200B', value: '\u200B', inline: false });
	classFeatureFields.splice(3, 0, { name: '\u200B', value: '\u200B', inline: false });

	return {
		title: title,
		description: descriptionLines.join('\n\n'),
		fields: [proficienciesField, ...classFeatureFields],
		thumbnail: classValue.summary.images?.[0]
			? { url: classValue.summary.images[0] }
			: undefined,
	};
}
