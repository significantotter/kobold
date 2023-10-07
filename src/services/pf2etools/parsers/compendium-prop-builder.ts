import { z } from 'zod';
import { EntryParser } from './compendium-entry-parser.js';
import { SharedParsers } from './compendium-parser-helpers.js';
import { CompendiumEmbedParser } from './compendium-parser.js';
import _ from 'lodash';

type Expand<T> = T extends T ? { [P in keyof T]: T[P] } : never;

type ZodKeys<T extends z.ZodTypeAny> = keyof z.infer<T>;

function hasKey<T extends {}, K extends PropertyKey>(obj: T, key: K): key is keyof T & K {
	return key in obj;
}
interface traitable {
	[k: string]: any;
	traits?: string[];
}
export class CompendiumPropBuilder<T extends z.ZodTypeAny, K = z.infer<T>> {
	public entryParser: EntryParser;
	public helpers: SharedParsers;
	constructor(
		public schema: T,
		public embedParser: CompendiumEmbedParser,
		entryParser?: EntryParser,
		helpers?: SharedParsers,
		public textLines: string[] = [],
		public delimiter: string = '\n'
	) {
		if (!entryParser) {
			this.entryParser = new EntryParser({
				delimiter: this.delimiter ?? '\n',
				emojiConverter: this.embedParser.emojiConverter,
			});
		} else this.entryParser = entryParser;
		if (!helpers) this.helpers = new SharedParsers();
		else this.helpers = helpers;
	}

	private _parsers = {
		traits: (resource: K, addToBuilder = true) => {
			if (resource instanceof Object && 'traits' in resource && _.isArray(resource.traits)) {
				this.textLines.push(
					`**Traits** ${resource.traits.map(trait => `[${trait}]`).join(', ')}`
				);
			}
		},
		cost: (resource: K, addToBuilder = true) => {},
		prerequisites: (resource: K, addToBuilder = true) => {},
		requirements: (resource: K, addToBuilder = true) => {},
		frequency: (resource: K, addToBuilder = true) => {},
		entries: (resource: K, addToBuilder = true) => {},
	};

	public get parse(): Expand<
		Pick<typeof this._parsers, ZodKeys<T> & keyof typeof this._parsers>
	> {
		return this.getParsers(this.schema);
	}
	public fetchOtherParsers<K extends z.ZodTypeAny>(
		schema: K
	): Expand<Pick<typeof this._parsers, ZodKeys<K> & keyof typeof this._parsers>> {
		const propBuilder = new CompendiumPropBuilder(
			schema,
			this.embedParser,
			this.entryParser,
			this.helpers,
			this.textLines,
			this.delimiter
		);
		return propBuilder.getParsers(schema);
	}

	private getParsers<T extends z.ZodTypeAny>(
		zodObject: T
	): Expand<Pick<typeof this._parsers, ZodKeys<T> & keyof typeof this._parsers>> {
		const result: Partial<Pick<typeof this._parsers, ZodKeys<T> & keyof typeof this._parsers>> =
			{};
		const keys = Object.keys(zodObject._def.shape) as ZodKeys<T>[];
		for (const key of keys) {
			if (hasKey(this._parsers, key)) {
				result[key] = this._parsers[key];
			}
		}
		return result as never;
	}

	public compile(): string {
		return this.textLines.join(this.delimiter);
	}
}
