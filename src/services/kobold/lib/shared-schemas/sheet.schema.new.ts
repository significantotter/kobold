import { JSONSchema7 } from 'json-schema';

export const Sheet: JSONSchema7 = {
	type: 'object',
	description: 'A character or monster sheet.',
	properties: {
		info: {
			description: 'The general character sheet formation.',
			type: 'object',
			properties: {
				name: {
					description: "The character's name.",
					type: 'string',
				},
				url: {
					description: 'The url to open the character.',
					type: ['string', 'null'],
				},
				description: {
					description: "The character's description.",
					type: ['string', 'null'],
				},
				gender: {
					description: "The character's gender",
					type: ['string', 'null'],
				},
				age: {
					description: "The character's age",
					type: ['number', 'null'],
				},
				alignment: {
					description: "The character's alignment",
					type: ['string', 'null'],
				},
				deity: {
					description: "The character's deity",
					type: ['string', 'null'],
				},
				imageURL: {
					description: "The character's portrait image URL.",
					type: ['string', 'null'],
				},
				level: {
					description: "The character's level.",
					type: ['integer', 'null'],
				},
				size: {
					description: "The character's size category.",
					type: ['string', 'null'],
				},
				class: {
					description: "The character's class.",
					type: ['string', 'null'],
				},
				keyability: {
					description: "The character's key ability.",
					type: ['string', 'null'],
				},
				ancestry: {
					description: "The character's ancestry.",
					type: ['string', 'null'],
				},
				heritage: {
					description: "The character's heritage.",
					type: ['string', 'null'],
				},
				background: {
					description: "The character's background.",
					type: ['string', 'null'],
				},
				traits: {
					description: "The character's traits.",
					type: ['array'],
					items: { type: ['string', 'null'] },
				},
				usesStamina: {
					description: 'Whether the character follows alternate stamina rules.',
					type: 'boolean',
				},
			},
		},
		abilities: {
			description: "The character's primary ability scores.",
			type: 'object',
			properties: {
				strength: {
					description: "The character's strength score.",
					type: ['integer', 'null'],
				},
				dexterity: {
					description: "The character's dexterity score.",
					type: ['integer', 'null'],
				},
				constitution: {
					description: "The character's constitution score.",
					type: ['integer', 'null'],
				},
				intelligence: {
					description: "The character's intelligence score.",
					type: ['integer', 'null'],
				},
				wisdom: {
					description: "The character's wisdom score.",
					type: ['integer', 'null'],
				},
				charisma: {
					description: "The character's charisma score.",
					type: ['integer', 'null'],
				},
			},
		},
		general: {
			description: 'The general attributes for the character.',
			type: 'object',
			properties: {
				currentHeroPoints: {
					description: "The character's current hero points.",
					type: ['integer', 'null'],
				},
				speed: {
					description: "The character's land speed.",
					type: ['integer', 'null'],
				},
				flySpeed: {
					description: "The character's fly speed.",
					type: ['integer', 'null'],
				},
				swimSpeed: {
					description: "The character's swim speed.",
					type: ['integer', 'null'],
				},
				climbSpeed: {
					description: "The character's climb speed.",
					type: ['integer', 'null'],
				},
				currentFocusPoints: {
					description: "The character's current focus points.",
					type: ['integer', 'null'],
				},
				focusPoints: {
					description: "The character's maximum focus points.",
					type: ['integer', 'null'],
				},
				classDC: {
					description: "The character's class DC.",
					type: ['integer', 'null'],
				},
				classAttack: {
					description: "The character's class attack roll.",
					type: ['integer', 'null'],
				},
				perception: {
					description: "The character's perception.",
					type: ['integer', 'null'],
				},
				perceptionProfMod: {
					description: "The character's perception proficiency modifier.",
					type: ['integer', 'null'],
				},
				languages: {
					description: "The character's spoken languages.",
					type: 'array',
					items: { type: ['string', 'null'] },
				},
				senses: {
					description: "The character's senses.",
					type: 'array',
					items: { type: ['string', 'null'] },
				},
			},
		},
		defenses: {
			description: 'The character defensive attributes.',
			type: 'object',
			properties: {
				currentHp: {
					description: "The character's current hit points.",
					type: ['integer', 'null'],
				},
				maxHp: {
					description: "The character's maximum hit points.",
					type: ['integer', 'null'],
				},
				tempHp: {
					description: "The character's temporary hit points.",
					type: ['integer', 'null'],
				},
				currentResolve: {
					description: "The character's current resolve points.",
					type: ['integer', 'null'],
				},
				maxResolve: {
					description: "The character's maximum resolve points.",
					type: ['integer', 'null'],
				},
				currentStamina: {
					description: "The character's current stamina points.",
					type: ['integer', 'null'],
				},
				maxStamina: {
					description: "The character's maximum stamina points.",
					type: ['integer', 'null'],
				},
				immunities: {
					description: "The character's immunities.",
					type: 'array',
					items: { type: ['string', 'null'] },
				},
				resistances: {
					description: "The character's resistances.",
					type: 'array',
					items: {
						type: 'object',
						properties: {
							amount: {
								description: 'the amount of resistance for this type of damage',
								type: ['integer', 'null'],
							},
							type: {
								description: "the damage type that's resisted",
								type: ['string', 'null'],
							},
						},
					},
				},
				weaknesses: {
					description: "The character's weaknesses.",
					type: 'array',
					items: {
						type: 'object',
						properties: {
							amount: {
								description: 'the amount of weakness for this type of damage',
								type: ['integer', 'null'],
							},
							type: {
								description: 'the damage type that of the weakness',
								type: ['string', 'null'],
							},
						},
					},
				},
				ac: { description: "The character's armor class", type: ['integer', 'null'] },
				heavyProfMod: {
					description: "The character's heavy armor proficiency modifier.",
					type: ['integer', 'null'],
				},
				mediumProfMod: {
					description: "The character's medium armor proficiency modifier.",
					type: ['integer', 'null'],
				},
				lightProfMod: {
					description: "The character's light armor proficiency modifier.",
					type: ['integer', 'null'],
				},
				unarmoredProfMod: {
					description: "The character's unarmored proficiency modifier.",
					type: ['integer', 'null'],
				},
			},
		},
		offense: {
			description: "The character's offensive attributes.",
			type: 'object',
			properties: {
				martialProfMod: {
					description: "The character's martial weapon proficiency modifier.",
					type: ['integer', 'null'],
				},
				simpleProfMod: {
					description: "The character's simple weapon proficiency modifier.",
					type: ['integer', 'null'],
				},
				unarmedProfMod: {
					description: "The character's unarmed weapon proficiency modifier.",
					type: ['integer', 'null'],
				},
				advancedProfMod: {
					description: "The character's advanced weapon proficiency modifier.",
					type: ['integer', 'null'],
				},
			},
		},
		castingStats: {
			description: "The character's casting stats.",
			type: 'object',
			properties: {
				arcaneAttack: {
					description: "The character's arcane casting attack bonus.",
					type: ['integer', 'null'],
				},
				arcaneDC: {
					description: "The character's arcane casting DC.",
					type: ['integer', 'null'],
				},
				arcaneProfMod: {
					description: "The character's arcane casting proficiency modifier.",
					type: ['integer', 'null'],
				},
				divineAttack: {
					description: "The character's divine casting stat.",
					type: ['integer', 'null'],
				},
				divineDC: {
					description: "The character's divine casting stat.",
					type: ['integer', 'null'],
				},
				divineProfMod: {
					description: "The character's divine casting proficiency modifier.",
					type: ['integer', 'null'],
				},
				occultAttack: {
					description: "The character's occult casting stat.",
					type: ['integer', 'null'],
				},
				occultDC: {
					description: "The character's occult casting stat.",
					type: ['integer', 'null'],
				},
				occultProfMod: {
					description: "The character's occult casting proficiency modifier.",
					type: ['integer', 'null'],
				},
				primalAttack: {
					description: "The character's primal casting stat.",
					type: ['integer', 'null'],
				},
				primalDC: {
					description: "The character's primal casting stat.",
					type: ['integer', 'null'],
				},
				primalProfMod: {
					description: "The character's primal casting proficiency modifier.",
					type: ['integer', 'null'],
				},
			},
		},
		saves: {
			description: "The character's saving throw attributes.",
			type: 'object',
			properties: {
				fortitude: {
					description: "The character's fortitude save.",
					type: ['integer', 'null'],
				},
				fortitudeProfMod: {
					description: "The character's fortitude proficiency modifier.",
					type: ['integer', 'null'],
				},
				reflex: {
					description: "The character's reflex save.",
					type: ['integer', 'null'],
				},
				reflexProfMod: {
					description: "The character's reflex proficiency modifier.",
					type: ['integer', 'null'],
				},
				will: {
					description: "The character's will save.",
					type: ['integer', 'null'],
				},
				willProfMod: {
					description: "The character's will proficiency modifier.",
					type: ['integer', 'null'],
				},
			},
		},
		skills: {
			description: "The character's skill attributes.",
			type: 'object',
			properties: {
				acrobatics: {
					description: "The character's acrobatics skill.",
					type: ['integer', 'null'],
				},
				acrobaticsProfMod: {
					description: "The character's acrobatics proficiency modifier.",
					type: ['integer', 'null'],
				},
				arcana: {
					description: "The character's arcana skill.",
					type: ['integer', 'null'],
				},
				arcanaProfMod: {
					description: "The character's arcana proficiency modifier.",
					type: ['integer', 'null'],
				},
				athletics: {
					description: "The character's athletics skill.",
					type: ['integer', 'null'],
				},
				athleticsProfMod: {
					description: "The character's athletics proficiency modifier.",
					type: ['integer', 'null'],
				},
				crafting: {
					description: "The character's crafting skill.",
					type: ['integer', 'null'],
				},
				craftingProfMod: {
					description: "The character's crafting proficiency modifier.",
					type: ['integer', 'null'],
				},
				deception: {
					description: "The character's deception skill.",
					type: ['integer', 'null'],
				},
				deceptionProfMod: {
					description: "The character's deception proficiency modifier.",
					type: ['integer', 'null'],
				},
				diplomacy: {
					description: "The character's diplomacy skill.",
					type: ['integer', 'null'],
				},
				diplomacyProfMod: {
					description: "The character's diplomacy proficiency modifier.",
					type: ['integer', 'null'],
				},
				intimidation: {
					description: "The character's intimidation skill.",
					type: ['integer', 'null'],
				},
				intimidationProfMod: {
					description: "The character's intimidation proficiency modifier.",
					type: ['integer', 'null'],
				},
				medicine: {
					description: "The character's medicine skill.",
					type: ['integer', 'null'],
				},
				medicineProfMod: {
					description: "The character's medicine proficiency modifier.",
					type: ['integer', 'null'],
				},
				nature: {
					description: "The character's nature skill.",
					type: ['integer', 'null'],
				},
				natureProfMod: {
					description: "The character's nature proficiency modifier.",
					type: ['integer', 'null'],
				},
				occultism: {
					description: "The character's occultism skill.",
					type: ['integer', 'null'],
				},
				occultismProfMod: {
					description: "The character's occultism proficiency modifier.",
					type: ['integer', 'null'],
				},
				performance: {
					description: "The character's performance skill.",
					type: ['integer', 'null'],
				},
				performanceProfMod: {
					description: "The character's performance proficiency modifier.",
					type: ['integer', 'null'],
				},
				religion: {
					description: "The character's religion skill.",
					type: ['integer', 'null'],
				},
				religionProfMod: {
					description: "The character's religion proficiency modifier.",
					type: ['integer', 'null'],
				},
				society: {
					description: "The character's society skill.",
					type: ['integer', 'null'],
				},
				societyProfMod: {
					description: "The character's society proficiency modifier.",
					type: ['integer', 'null'],
				},
				stealth: {
					description: "The character's stealth skill.",
					type: ['integer', 'null'],
				},
				stealthProfMod: {
					description: "The character's stealth proficiency modifier.",
					type: ['integer', 'null'],
				},
				survival: {
					description: "The character's survival skill.",
					type: ['integer', 'null'],
				},
				survivalProfMod: {
					description: "The character's survival proficiency modifier.",
					type: ['integer', 'null'],
				},
				thievery: {
					description: "The character's thievery skill.",
					type: ['integer', 'null'],
				},
				thieveryProfMod: {
					description: "The character's thievery proficiency modifier.",
					type: ['integer', 'null'],
				},
				lores: {
					description: "The character's lore skills.",
					type: 'array',
					items: {
						type: 'object',
						properties: {
							name: {
								description: 'The lore name.',
								type: ['string', 'null'],
							},
							bonus: {
								description: 'The lore bonus.',
								type: ['integer', 'null'],
							},
							profMod: {
								description: 'The lore proficiencyModifer.',
								type: ['integer', 'null'],
							},
						},
					},
				},
			},
		},
		attacks: {
			description: "The character's attacks.",
			type: 'array',
			items: {
				type: 'object',
				properties: {
					name: {
						description: 'The attack name.',
						type: ['string', 'null'],
					},
					toHit: {
						description: 'The attack toHit.',
						type: ['integer', 'null'],
					},
					damage: {
						description: 'The attack damage.',
						type: 'array',
						items: {
							type: 'object',
							description: 'A damage roll',
							properties: {
								dice: {
									description: 'The attack damage dice.',
									type: ['string', 'null'],
								},
								type: {
									description: 'The attack damage type.',
									type: ['string', 'null'],
								},
							},
						},
					},
					range: {
						description: 'The attack range.',
						type: ['string', 'null'],
					},
					traits: {
						description: 'The attack traits.',
						type: ['array', 'null'],
						items: {
							type: ['string', 'null'],
						},
					},
					notes: {
						description: 'The attack notes.',
						type: ['string', 'null'],
					},
				},
			},
		},
		sourceData: {
			description: 'The source data the sheet was parsed from',
			type: 'object',
		},
		modifiers: {
			type: 'array',
			description:
				'An array of toggleable modifier objects that apply dice expression values to rolls with certain tags.',
			items: {
				type: 'object',
				properties: {
					name: { type: 'string' },
					isActive: { type: 'boolean' },
					description: { type: ['string', 'null'] },
					type: { type: 'string' },
					targetTags: { type: ['string', 'null'] },
					value: { type: ['number', 'string', 'null'] },

					modifierType: { type: 'string', enum: ['roll', 'sheet'] },
					sheetAdjustments: {
						type: ['array', 'null'],
						items: {
							type: 'object',
							properties: {
								property: { type: 'string' },
								operation: { type: 'string', enum: ['+', '-', '='] },
								value: { type: 'string' },
							},
						},
					},
				},
			},
		},
		actions: {
			type: 'array',
			description:
				'An array of default actions set up for the user. These allow the user to make certain roll operations as a single command.',
			items: {
				type: 'object',
				properties: {
					name: { type: ['string', 'null'] },
					description: { type: ['string', 'null'] },
					type: { type: ['string', 'null'] },
					actionCost: { type: ['string', 'null'] },
					baseLevel: { type: ['number', 'null'] },
					autoHeighten: { type: ['boolean'] },
					tags: { type: 'array', items: { type: ['string', 'null'] } },
					rolls: {
						type: 'array',
						items: {
							oneOf: [
								{
									type: 'object',
									properties: {
										name: { type: ['string', 'null'] },
										type: {
											type: ['string', 'null'],
											enum: ['attack', 'skill-challenge'],
										},
										targetDC: { type: ['string', 'null'] },
										roll: { type: ['string', 'null'] },
										allowRollModifiers: { type: 'boolean' },
									},
								},
								{
									type: 'object',
									properties: {
										name: { type: ['string', 'null'] },
										type: { type: ['string', 'null'], enum: ['damage'] },
										roll: { type: ['string', 'null'] },
										healInsteadOfDamage: { type: ['boolean', 'null'] },
										allowRollModifiers: { type: 'boolean' },
									},
								},
								{
									type: 'object',
									properties: {
										name: { type: ['string', 'null'] },
										type: {
											type: ['string', 'null'],
											enum: ['advanced-damage'],
										},
										criticalSuccessRoll: { type: ['string', 'null'] },
										criticalFailureRoll: { type: ['string', 'null'] },
										successRoll: { type: ['string', 'null'] },
										failureRoll: { type: ['string', 'null'] },
										healInsteadOfDamage: { type: ['boolean', 'null'] },
										allowRollModifiers: { type: 'boolean' },
									},
								},
								{
									type: 'object',
									properties: {
										name: { type: ['string', 'null'] },
										type: { type: ['string', 'null'], enum: ['save'] },
										saveRollType: { type: ['string', 'null'] },
										saveTargetDC: { type: ['string', 'null'] },
										allowRollModifiers: { type: 'boolean' },
									},
								},
								{
									type: 'object',
									properties: {
										name: { type: ['string', 'null'] },
										type: { type: ['string', 'null'], enum: ['text'] },
										defaultText: { type: ['string', 'null'] },
										criticalSuccessText: { type: ['string', 'null'] },
										criticalFailureText: { type: ['string', 'null'] },
										successText: { type: ['string', 'null'] },
										failureText: { type: ['string', 'null'] },
										allowRollModifiers: { type: 'boolean' },
										extraTags: {
											type: 'array',
											items: { type: ['string', 'null'] },
										},
									},
								},
							],
						},
					},
				},
			},
		},
		rollMacros: {
			type: 'array',
			description:
				'An array of roll macro objects that allow the substituting of saved roll expressions for simple keywords.',
			items: {
				type: 'object',
				properties: {
					name: {
						type: ['string', 'null'],
					},
					macro: {
						type: ['string', 'null'],
					},
				},
			},
		},
	},
};