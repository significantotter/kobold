import type { BaseTranslation } from '../i18n-types';
// import refs from '../common.js';

const en: BaseTranslation = {
	hello: 'hi!',
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
};

export default en;
