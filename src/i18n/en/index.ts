import type { BaseTranslation } from '../i18n-types';
import Config from './../../config/config.json';

const refs = {
	bot: {
		name: 'Kobold',
		author: 'Significantotter',
	},
	colors: {
		default: '#0099ff',
		success: '#00ff83',
		warning: '#ffcc66',
		error: '#ff4a4a',
	},
	links: {
		author: 'https://github.com/significantotter',
		docs: 'https://top.gg/',
		donate: 'https://ko-fi.com/significantotter',
		invite: 'https://discord.com/',
		source: 'https://github.com/significantotter/kobold',
		support: 'https://discord.gg/6bS2GM59uj',
		template: '',
		vote: 'https://top.gg/',
	},
};

const embedLinks = {
	authorEmbed: `[${refs.bot.author}](${refs.links.author})`,
	docsEmbed: `[View Documentation](${refs.links.docs})`,
	donateEmbed: `[Help support ${refs.bot.name}'s development!](${refs.links.donate})`,
	inviteEmbed: `[Invite ${refs.bot.name} to a Server!](${refs.links.invite})`,
	sourceEmbed: `[View Source Code](${refs.links.source})`,
	supportEmbed: `[Join Support Server](${refs.links.support})`,
	templateEmbed: `[Discord Bot TypeScript Template](${refs.links.template})`,
	voteEmbed: `[Vote for ${refs.bot.name}!](${refs.links.vote})`,
	wgEmbed: `[Wanderer's Guide](https://wanderersguide.app)`,
};

const en: BaseTranslation = {
	commands: {
		character: {
			// MAIN COMMAND INFO
			name: 'character',
			description: 'Character management',

			// SLASH COMMAND OPTIONS
			commandOptions: {
				wgUrl: {
					name: 'url',
					description: "The url of your wanderer's guide character.",
				},
				name: {
					name: 'name',
					description: "The name of your wanderer's guide character.",
				},
				id: {
					name: 'character_id',
					description: `The id of your wanderer's guide character.`,
				},
			},

			// SHARED INTERACTIONS
			interactions: {
				noActiveCharacter: `Yip! You don't have any active characters! Use /import to import one.`,
			},

			// SUBCOMMANDS
			import: {
				name: 'import',
				description: "Imports a Wanderer's Guide Character",
				interactions: {
					invalidUrl:
						`Yip! I couldn't find the character at the url '{url}'. Check ` +
						`and make sure you copied it over correctly! Or just paste ` +
						`in the character's id value instead.`,
					characterAlreadyExists:
						`Yip! {characterName} is already in the system!` +
						` Did you mean to /update?`,
					authenticationRequest:
						`Yip! Before you can import a character, you need to authenticate it. ` +
						`Give me permission to read your wanderer's guide character by following [this link](` +
						`{wgBaseUrl}?characterId={charId}). ` +
						`Then, /import your character again!`,
					success: `Yip! I've successfully imported {characterName}!`,
				},
			},
			list: {
				name: 'list',
				description: 'lists all active characters',
				interactions: {
					noCharacters: `Yip! You don't have any characters yet! Use /import to import some!`,
					characterListEmbed: {
						title: 'Characters',
						characterFieldName: '{characterName}{activeText?}',
						characterFieldValue: 'Level {level} {heritage} {ancestry} {classes}',
					},
				},
			},
			remove: {
				name: 'remove',
				description: 'removes an already imported character',
				interactions: {
					removeConfirmation: {
						text: `Are you sure you want to remove {characterName}?`,
						removeButton: 'REMOVE',
						cancelButton: 'CANCEL',
						expired: 'Yip! Character removal request expired.',
					},
					success: `Yip! I've successfully removed {characterName}! You can import them again at any time.`,
					cancelled: `Yip! Canceled the request to remove {characterName}!`,
				},
			},
			setActive: {
				name: 'set-active',
				description: 'sets a character as the active character',
			},
			sheet: {
				name: 'sheet',
				description: "displays the active character's sheet",
			},
			update: {
				name: 'update',
				description: 'updates an already imported character',
			},
		},
	},
	embedLinks,
};

export default en;
