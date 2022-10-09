// This file was auto-generated by 'typesafe-i18n'. Any manual changes will be overwritten.
/* eslint-disable */
import type { BaseTranslation as BaseTranslationType, LocalizedString, RequiredParams } from 'typesafe-i18n'

export type BaseTranslation = BaseTranslationType
export type BaseLocale = 'en'

export type Locales =
	| 'en'
	| 'en-GB'
	| 'en-US'

export type Translation = RootTranslation

export type Translations = RootTranslation

type RootTranslation = {
	/**
	 * h​i​!
	 */
	hello: string
	commands: {
		character: {
			/**
			 * c​h​a​r​a​c​t​e​r
			 */
			name: string
			/**
			 * C​h​a​r​a​c​t​e​r​ ​m​a​n​a​g​e​m​e​n​t
			 */
			description: string
			commandOptions: {
				wgUrl: {
					/**
					 * u​r​l
					 */
					name: string
					/**
					 * T​h​e​ ​u​r​l​ ​o​f​ ​y​o​u​r​ ​w​a​n​d​e​r​e​r​'​s​ ​g​u​i​d​e​ ​c​h​a​r​a​c​t​e​r​.
					 */
					description: string
				}
				name: {
					/**
					 * n​a​m​e
					 */
					name: string
					/**
					 * T​h​e​ ​n​a​m​e​ ​o​f​ ​y​o​u​r​ ​w​a​n​d​e​r​e​r​'​s​ ​g​u​i​d​e​ ​c​h​a​r​a​c​t​e​r​.
					 */
					description: string
				}
				id: {
					/**
					 * c​h​a​r​a​c​t​e​r​_​i​d
					 */
					name: string
					/**
					 * T​h​e​ ​i​d​ ​o​f​ ​y​o​u​r​ ​w​a​n​d​e​r​e​r​'​s​ ​g​u​i​d​e​ ​c​h​a​r​a​c​t​e​r​.
					 */
					description: string
				}
			}
			'import': {
				/**
				 * i​m​p​o​r​t
				 */
				name: string
				/**
				 * I​m​p​o​r​t​s​ ​a​ ​W​a​n​d​e​r​e​r​'​s​ ​G​u​i​d​e​ ​C​h​a​r​a​c​t​e​r
				 */
				description: string
				interactions: {
					/**
					 * Y​i​p​!​ ​I​ ​c​o​u​l​d​n​'​t​ ​f​i​n​d​ ​t​h​e​ ​c​h​a​r​a​c​t​e​r​ ​a​t​ ​t​h​e​ ​u​r​l​ ​'​{​u​r​l​}​'​.​ ​C​h​e​c​k​ ​a​n​d​ ​m​a​k​e​ ​s​u​r​e​ ​y​o​u​ ​c​o​p​i​e​d​ ​i​t​ ​o​v​e​r​ ​c​o​r​r​e​c​t​l​y​!​ ​O​r​ ​j​u​s​t​ ​p​a​s​t​e​ ​i​n​ ​t​h​e​ ​c​h​a​r​a​c​t​e​r​'​s​ ​i​d​ ​v​a​l​u​e​ ​i​n​s​t​e​a​d​.
					 * @param {unknown} url
					 */
					invalidUrl: RequiredParams<'url'>
					/**
					 * Y​i​p​!​ ​{​c​h​a​r​a​c​t​e​r​N​a​m​e​}​ ​i​s​ ​a​l​r​e​a​d​y​ ​i​n​ ​t​h​e​ ​s​y​s​t​e​m​!​ ​D​i​d​ ​y​o​u​ ​m​e​a​n​ ​t​o​ ​/​u​p​d​a​t​e​?
					 * @param {unknown} characterName
					 */
					characterAlreadyExists: RequiredParams<'characterName'>
					/**
					 * Y​i​p​!​ ​B​e​f​o​r​e​ ​y​o​u​ ​c​a​n​ ​i​m​p​o​r​t​ ​a​ ​c​h​a​r​a​c​t​e​r​,​ ​y​o​u​ ​n​e​e​d​ ​t​o​ ​a​u​t​h​e​n​t​i​c​a​t​e​ ​i​t​.​ ​G​i​v​e​ ​m​e​ ​p​e​r​m​i​s​s​i​o​n​ ​t​o​ ​r​e​a​d​ ​y​o​u​r​ ​w​a​n​d​e​r​e​r​'​s​ ​g​u​i​d​e​ ​c​h​a​r​a​c​t​e​r​ ​b​y​ ​f​o​l​l​o​w​i​n​g​ ​[​t​h​i​s​ ​l​i​n​k​]​(​{​w​g​B​a​s​e​U​r​l​}​?​c​h​a​r​a​c​t​e​r​I​d​=​{​c​h​a​r​I​d​}​)​.​ ​T​h​e​n​,​ ​/​i​m​p​o​r​t​ ​y​o​u​r​ ​c​h​a​r​a​c​t​e​r​ ​a​g​a​i​n​!
					 * @param {unknown} charId
					 * @param {unknown} wgBaseUrl
					 */
					authenticationRequest: RequiredParams<'charId' | 'wgBaseUrl'>
					/**
					 * Y​i​p​!​ ​I​'​v​e​ ​s​u​c​c​e​s​s​f​u​l​l​y​ ​i​m​p​o​r​t​e​d​ ​{​c​h​a​r​a​c​t​e​r​N​a​m​e​}​!
					 * @param {unknown} characterName
					 */
					success: RequiredParams<'characterName'>
				}
			}
			list: {
				/**
				 * l​i​s​t
				 */
				name: string
				/**
				 * l​i​s​t​s​ ​a​l​l​ ​a​c​t​i​v​e​ ​c​h​a​r​a​c​t​e​r​s
				 */
				description: string
				interactions: {
					/**
					 * Y​i​p​!​ ​Y​o​u​ ​d​o​n​'​t​ ​h​a​v​e​ ​a​n​y​ ​c​h​a​r​a​c​t​e​r​s​ ​y​e​t​!​ ​U​s​e​ ​/​i​m​p​o​r​t​ ​t​o​ ​i​m​p​o​r​t​ ​s​o​m​e​!
					 */
					noCharacters: string
					characterListEmbed: {
						/**
						 * C​h​a​r​a​c​t​e​r​s
						 */
						title: string
						/**
						 * {​c​h​a​r​a​c​t​e​r​N​a​m​e​}​{​a​c​t​i​v​e​T​e​x​t​?​}
						 * @param {unknown} [activeText]
						 * @param {unknown} characterName
						 */
						characterFieldName: RequiredParams<'activeText?' | 'characterName'> | RequiredParams<'characterName'>
						/**
						 * L​e​v​e​l​ ​{​l​e​v​e​l​}​ ​{​h​e​r​i​t​a​g​e​}​ ​{​a​n​c​e​s​t​r​y​}​ ​{​c​l​a​s​s​e​s​}
						 * @param {unknown} ancestry
						 * @param {unknown} classes
						 * @param {unknown} heritage
						 * @param {unknown} level
						 */
						characterFieldValue: RequiredParams<'ancestry' | 'classes' | 'heritage' | 'level'>
					}
				}
			}
			remove: {
				/**
				 * r​e​m​o​v​e
				 */
				name: string
				/**
				 * r​e​m​o​v​e​s​ ​a​n​ ​a​l​r​e​a​d​y​ ​i​m​p​o​r​t​e​d​ ​c​h​a​r​a​c​t​e​r
				 */
				description: string
			}
			setActive: {
				/**
				 * s​e​t​-​a​c​t​i​v​e
				 */
				name: string
				/**
				 * s​e​t​s​ ​a​ ​c​h​a​r​a​c​t​e​r​ ​a​s​ ​t​h​e​ ​a​c​t​i​v​e​ ​c​h​a​r​a​c​t​e​r
				 */
				description: string
			}
			sheet: {
				/**
				 * s​h​e​e​t
				 */
				name: string
				/**
				 * d​i​s​p​l​a​y​s​ ​t​h​e​ ​a​c​t​i​v​e​ ​c​h​a​r​a​c​t​e​r​'​s​ ​s​h​e​e​t
				 */
				description: string
			}
			update: {
				/**
				 * u​p​d​a​t​e
				 */
				name: string
				/**
				 * u​p​d​a​t​e​s​ ​a​n​ ​a​l​r​e​a​d​y​ ​i​m​p​o​r​t​e​d​ ​c​h​a​r​a​c​t​e​r
				 */
				description: string
			}
		}
	}
}

export type TranslationFunctions = {
	/**
	 * hi!
	 */
	hello: () => LocalizedString
	commands: {
		character: {
			/**
			 * character
			 */
			name: () => LocalizedString
			/**
			 * Character management
			 */
			description: () => LocalizedString
			commandOptions: {
				wgUrl: {
					/**
					 * url
					 */
					name: () => LocalizedString
					/**
					 * The url of your wanderer's guide character.
					 */
					description: () => LocalizedString
				}
				name: {
					/**
					 * name
					 */
					name: () => LocalizedString
					/**
					 * The name of your wanderer's guide character.
					 */
					description: () => LocalizedString
				}
				id: {
					/**
					 * character_id
					 */
					name: () => LocalizedString
					/**
					 * The id of your wanderer's guide character.
					 */
					description: () => LocalizedString
				}
			}
			'import': {
				/**
				 * import
				 */
				name: () => LocalizedString
				/**
				 * Imports a Wanderer's Guide Character
				 */
				description: () => LocalizedString
				interactions: {
					/**
					 * Yip! I couldn't find the character at the url '{url}'. Check and make sure you copied it over correctly! Or just paste in the character's id value instead.
					 */
					invalidUrl: (arg: { url: unknown }) => LocalizedString
					/**
					 * Yip! {characterName} is already in the system! Did you mean to /update?
					 */
					characterAlreadyExists: (arg: { characterName: unknown }) => LocalizedString
					/**
					 * Yip! Before you can import a character, you need to authenticate it. Give me permission to read your wanderer's guide character by following [this link]({wgBaseUrl}?characterId={charId}). Then, /import your character again!
					 */
					authenticationRequest: (arg: { charId: unknown, wgBaseUrl: unknown }) => LocalizedString
					/**
					 * Yip! I've successfully imported {characterName}!
					 */
					success: (arg: { characterName: unknown }) => LocalizedString
				}
			}
			list: {
				/**
				 * list
				 */
				name: () => LocalizedString
				/**
				 * lists all active characters
				 */
				description: () => LocalizedString
				interactions: {
					/**
					 * Yip! You don't have any characters yet! Use /import to import some!
					 */
					noCharacters: () => LocalizedString
					characterListEmbed: {
						/**
						 * Characters
						 */
						title: () => LocalizedString
						/**
						 * {characterName}{activeText?}
						 */
						characterFieldName: (arg: { activeText?: unknown, characterName: unknown }) => LocalizedString
						/**
						 * Level {level} {heritage} {ancestry} {classes}
						 */
						characterFieldValue: (arg: { ancestry: unknown, classes: unknown, heritage: unknown, level: unknown }) => LocalizedString
					}
				}
			}
			remove: {
				/**
				 * remove
				 */
				name: () => LocalizedString
				/**
				 * removes an already imported character
				 */
				description: () => LocalizedString
			}
			setActive: {
				/**
				 * set-active
				 */
				name: () => LocalizedString
				/**
				 * sets a character as the active character
				 */
				description: () => LocalizedString
			}
			sheet: {
				/**
				 * sheet
				 */
				name: () => LocalizedString
				/**
				 * displays the active character's sheet
				 */
				description: () => LocalizedString
			}
			update: {
				/**
				 * update
				 */
				name: () => LocalizedString
				/**
				 * updates an already imported character
				 */
				description: () => LocalizedString
			}
		}
	}
}

export type Formatters = {}