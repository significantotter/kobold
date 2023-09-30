import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { CompendiumModel } from '../compendium.model.js';
import _ from 'lodash';
import { SharedParsers } from './compendium-parser-helpers.js';
import { EntryParser } from './compendium-entry-parser.js';
import { AttachmentBuilder } from 'discord.js';
import { parseCreature } from './parsers/creature-parser.js';
import { parseAbility } from './parsers/ability-parser.js';
import { parseAction } from './parsers/action-parser.js';

export class CompendiumEmbedParser {
	public helpers: SharedParsers;
	public entries: EntryParser;
	public embed: KoboldEmbed;
	public files: AttachmentBuilder[];
	constructor(
		public model: CompendiumModel,
		public emojiConverter: { (emoji: string): string }
	) {
		this.embed = new KoboldEmbed();
		this.files = [];
		this.helpers = new SharedParsers(this.model, this.emojiConverter, this.files);
		this.entries = new EntryParser(this.model, this.emojiConverter, this.files);
	}
	public parseAbility = parseAbility;
	public parseAction = parseAction;
	public parseCreature = parseCreature;
}
