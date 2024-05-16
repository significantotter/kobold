import type { EmbedData } from 'discord.js';
import type { Hazard } from '../../schemas/index.js';
import type { CompendiumEmbedParser } from '../compendium-parser.js';

import _ from 'lodash';

export async function _parseHazard(this: CompendiumEmbedParser, hazard: Hazard) {
	const preprocessedData = (await this.preprocessData(hazard)) as Hazard;
	return parseHazard.call(this, preprocessedData);
}

export function parseHazard(this: CompendiumEmbedParser, hazard: Hazard): EmbedData {
	const title = `${hazard.name} (Hazard ${hazard.level})`;
	const descriptionLines: string[] = [];
	descriptionLines.push(`**Traits** ${hazard.traits.join(', ')}`);
	descriptionLines.push(
		`**Complexity** ${hazard.traits.includes('complex') ? 'complex' : 'simple'}`
	);
	if (hazard.perception) {
		let perceptionLine = [`**Perception**`];
		if (hazard.perception.bonus) perceptionLine.push(`+${hazard.perception.bonus}`);
		if (hazard.perception.dc) perceptionLine.push(`DC ${hazard.perception.dc}`);
		if (hazard.perception.minProf) perceptionLine.push(`(${hazard.perception.minProf})`);
		if (hazard.perception.notes) perceptionLine.push(`${hazard.perception.notes}`);
		descriptionLines.push(perceptionLine.join(' '));
	}
	if (hazard.stealth) {
		let stealthLine = [`**Stealth**`];
		if (hazard.stealth.bonus) stealthLine.push(`+${hazard.stealth.bonus}`);
		if (hazard.stealth.dc) stealthLine.push(`DC ${hazard.stealth.dc}`);
		if (hazard.stealth.minProf) stealthLine.push(`(${hazard.stealth.minProf})`);
		if (hazard.stealth.notes) stealthLine.push(`${hazard.stealth.notes}`);
		descriptionLines.push(stealthLine.join(' '));
	}
	if (hazard.description)
		descriptionLines.push(
			`**Description** ${this.entryParser.parseEntries(hazard.description)}`
		);

	descriptionLines.push('');
	if (hazard.disable.entries)
		descriptionLines.push(`**Disable** ${hazard.disable.entries.join(', ')}`);
	if (hazard.defenses) {
		hazard.defenses.savingThrows = {
			fort: hazard.defenses.fort,
			ref: hazard.defenses.ref,
			will: hazard.defenses.will,
		};
		delete hazard.defenses.fort;
		delete hazard.defenses.ref;
		delete hazard.defenses.will;
		const defenses = this.helpers.parseDefenses(hazard.defenses);
		descriptionLines.push(defenses);
	}
	for (const action of hazard.actions ?? []) {
		descriptionLines.push(
			this.entryParser.parseEntry(_.merge(action, { type: 'ability' }), true)
		);
	}
	descriptionLines.push('');
	if (hazard.routine) {
		descriptionLines.push(`**Routine** ${this.entryParser.parseEntries(hazard.routine)}`);
	}
	if (hazard.speed) descriptionLines.push(this.helpers.parseSpeed(hazard.speed));

	if (hazard.attacks) {
		for (const attack of hazard.attacks) {
			descriptionLines.push(this.entryParser.parseAttackEntry(attack));
		}
	}
	if (hazard.reset) {
		descriptionLines.push('');
		descriptionLines.push(`**Reset** ${hazard.reset.join('\n')}`);
	}

	return {
		title: title,
		description: descriptionLines.join('\n'),
	};
}
