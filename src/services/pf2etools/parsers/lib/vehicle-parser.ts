import { EmbedData } from 'discord.js';
import { Speed, Vehicle } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function _parseVehicle(this: CompendiumEmbedParser, vehicle: Vehicle) {
	const preprocessedData = (await this.preprocessData(vehicle)) as Vehicle;
	return parseVehicle.call(this, preprocessedData);
}

export function parseVehicle(this: CompendiumEmbedParser, vehicle: Vehicle): EmbedData {
	const title = `${vehicle.name} (Vehicle ${vehicle.level})`;
	const entryParser = new EntryParser({ delimiter: '\n', emojiConverter: this.emojiConverter });
	const descriptionLines: string[] = [];
	if (vehicle.traits) descriptionLines.push(`**Traits** ${vehicle.traits.join(', ')}`);
	if (vehicle.price)
		descriptionLines.push(`**Price** ${vehicle.price.coin} ${vehicle.price.amount}`);
	descriptionLines.push('');
	if (vehicle.entries) {
		descriptionLines.push(entryParser.parseEntries(vehicle.entries));
		descriptionLines.push('');
	}
	descriptionLines.push(
		`**Space** ${this.helpers.parseTypedNumber(
			vehicle.space.long
		)} long, ${this.helpers.parseTypedNumber(
			vehicle.space.wide
		)} wide, ${this.helpers.parseTypedNumber(vehicle.space.high)} high`
	);
	const crewLine: string[] = [];
	for (const crew of vehicle.crew) {
		if ('entry' in crew) {
			crewLine.push(`${crew.number} ${crew.entry ?? crew.type}`);
		} else {
			crewLine.push(`${crew.number} ${crew.type}`);
		}
	}
	if (vehicle.passengers) crewLine.push(`${vehicle.passengers} passengers`);
	if (crewLine.length) descriptionLines.push(`**Crew** ${crewLine.join('; ')}`);
	if (vehicle.pilotingCheck) {
		descriptionLines.push(
			`**Piloting Check** ${vehicle.pilotingCheck
				.map(check => `${check.skill} DC ${check.dc} ${check.entry ?? ''}`.trim())
				.join(', ')}`
		);
	}
	if (vehicle.abilities?.top) {
		descriptionLines.push('');
		descriptionLines.push(
			vehicle.abilities.top.map(ability => entryParser.parseEntry(ability)).join('\n\n')
		);
	}
	if (vehicle.defenses) {
		descriptionLines.push('');
		descriptionLines.push(this.helpers.parseDefenses(vehicle.defenses));
	}
	if (vehicle.abilities?.mid) {
		descriptionLines.push('');
		descriptionLines.push(
			vehicle.abilities.mid.map(ability => entryParser.parseEntry(ability)).join('\n\n')
		);
	}
	descriptionLines.push('');
	const isSpeed = (speed: Vehicle['speed']): speed is Speed => 'type' in vehicle.speed;
	if (isSpeed(vehicle.speed)) {
		descriptionLines.push(this.helpers.parseSpeed(vehicle.speed));
	} else {
		descriptionLines.push(
			vehicle.speed
				.map(speed => {
					const speedLine: string[] = [speed.type];
					if (speed.speed) speedLine.push(speed.speed.toString());
					if (speed.traits) speedLine.push(`(${speed.traits.join(', ')})`);
					if (speed.entry) speedLine.push(`(${speed.entry})`);
					if (speed.note) speedLine.push(speed.note);
					return speedLine.join(' ');
				})
				.join('; ')
		);
	}
	if (vehicle.collision) {
		descriptionLines.push('');
		descriptionLines.push(
			`**Collision** ${vehicle.collision.damage}${
				vehicle.collision.dc ? ` (DC ${vehicle.collision.dc})` : ''
			} ${vehicle.collision.entries ?? ''}`.trim()
		);
	}
	if (vehicle.abilities?.bot) {
		descriptionLines.push('');
		descriptionLines.push(
			vehicle.abilities.bot.map(ability => entryParser.parseEntry(ability)).join('\n\n')
		);
	}
	if (vehicle.destruction) {
		descriptionLines.push('');
		descriptionLines.push(`**Destruction** ${vehicle.destruction.join(', ')}`);
	}
	if (vehicle.passengersNote) {
		descriptionLines.push('');
		descriptionLines.push(vehicle.passengersNote);
	}
	return {
		title: title,
		description: descriptionLines.join('\n'),
	};
}
