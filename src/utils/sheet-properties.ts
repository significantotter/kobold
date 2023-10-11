import _ from 'lodash';
import { SheetInfo } from '../services/kobold/models/index.js';

export class SheetInfoProperties {
	constructor(protected sheetInfo: SheetInfo) {}
	public static properties: Record<keyof SheetInfo, { aliases: string[] }> = {
		imageURL: { aliases: ['image', 'imagelink'] },
		url: { aliases: [] },
		description: { aliases: [] },
		gender: { aliases: [] },
		age: { aliases: [] },
		alignment: { aliases: [] },
		deity: { aliases: [] },
		size: { aliases: [] },
		class: { aliases: [] },
		keyability: { aliases: [] },
		ancestry: { aliases: [] },
		heritage: { aliases: [] },
		background: { aliases: [] },
	};

	public static get _aliases(): { [k: string]: undefined | keyof SheetInfo } {
		const aliases: { [k: string]: undefined | keyof SheetInfo } = {};
		for (const [key, value] of Object.entries(SheetInfoProperties.properties)) {
			for (const alias of value.aliases) {
				aliases[alias] = key as keyof SheetInfo;
			}
			aliases[key.toLowerCase()] = key as keyof SheetInfo;
		}
		return aliases;
	}
	public static aliases = SheetInfoProperties._aliases;
}

export class SheetProperties {
	public static aliases = SheetInfoProperties.aliases;
	public static properties = SheetInfoProperties.properties;
	public static adjustableAliases = _.omit(SheetInfoProperties.aliases, [
		'name',
		'level',
		'usesStamina',
	]) as { [k: string]: string | undefined };
}
