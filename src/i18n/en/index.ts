import type { BaseTranslation } from '../i18n-types';
import { AdminCommandLang } from './commands/admin-lang.js';
import { CharacterCommandLang, CharacterCommandOptionsLang } from './commands/character-lang.js';
import { GameCommandLang, GameCommandOptionsLang } from './commands/game-lang.js';
import { HelpCommandLang } from './commands/help-lang.js';
import { InitCommandLang, InitCommandOptionsLang } from './commands/init-lang.js';
import { ModifierCommandLang, ModifierCommandOptionsLang } from './commands/modifier-lang.js';
import { RollCommandLang, RollCommandOptionsLang } from './commands/roll-lang.js';
import { UtilsLang } from './commands/utils-lang.js';

const links = {
	thumbnail: 'https://i.imgur.com/cVOfw8P.png',
	docs: 'https://top.gg/',
	donate: 'https://ko-fi.com/significantotter',
	invite: 'https://discord.com/oauth2/authorize?client_id=909138081163137094&scope=bot&permissions=532643576896',
	source: 'https://github.com/significantotter/kobold',
	support: 'https://discord.gg/6bS2GM59uj',
	template: 'https://github.com/KevinNovak/Discord-Bot-TypeScript-Template',
	vote: 'https://top.gg/',
};
const bot = {
	name: 'Kobold',
	author: 'SignificantOtter#3403',
};

let refs = {
	bot: { ...bot },
	colors: {
		default: '#0099ff',
		success: '#00ff83',
		warning: '#ffcc66',
		error: '#ff4a4a',
	},
	links: {
		...links,
		embed: {
			donate: `[Support Kobold's development through ko-fi](${links.donate})`,
			invite: `[Invite Kobold to a Discord Server](${links.invite})`,
			source: `[Follow Kobold's development on Github](${links.source})`,
			support: `[Join Kobold's Support Server on Discord](${links.support})`,
			template: `[Built with Kevin Novak's Discord Bot TypeScript Template](${links.template})`,
			vote: `[Vote for Kobold!](${links.vote})`,
			wanderersGuide: `[Wanderer's Guide](https://wanderersguide.app)`,
		},
	},
};

const en: BaseTranslation = {
	terms: {
		perception: 'Perception',
	},
	sharedInteractions: {
		choiceRegistered: 'You chose {choice}.',
	},
	commands: {
		admin: AdminCommandLang,
		help: HelpCommandLang,
		character: CharacterCommandLang,
		init: InitCommandLang,
		modifier: ModifierCommandLang,
		roll: RollCommandLang,
		game: GameCommandLang,
	},
	commandOptions: {
		...CharacterCommandOptionsLang,
		...RollCommandOptionsLang,
		...InitCommandOptionsLang,
		...ModifierCommandOptionsLang,
		...GameCommandOptionsLang,
	},
	utils: UtilsLang,
};

export default en;
