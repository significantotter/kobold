type PasteBinImport = {
	/** A creature's sheet. */
	sheet?:
		| {
				/** Sheet information not modifiable in Kobold */
				staticInfo: {
					/** The creature's name. */
					name: string;
					/** The creature's level. */
					level?: number | null;
					/** The creature's key ability. */
					keyAbility: unknown | null;
					/** Whether the creature follows alternate stamina rules. */
					usesStamina?: boolean;
				};
				/** Textual sheet information */
				info: {
					url?: string | null;
					description?: string | null;
					gender?: string | null;
					age?: string | null;
					alignment?: string | null;
					deity?: string | null;
					imageURL?: string | null;
					size?: string | null;
					class?: string | null;
					ancestry?: string | null;
					heritage?: string | null;
					background?: string | null;
				};
				/** Sheet information as arrays of strings. */
				infoLists: {
					traits?: string[];
					languages?: string[];
					senses?: string[];
					immunities?: string[];
				};
				/** Weakness or resistance typed information. */
				weaknessesResistances: {
					resistances?: {
						/** the amount of weakness/resistance for this type of damage */
						amount: number;
						/** the damage type */
						type: string;
					}[];
					weaknesses?: {
						/** the amount of weakness/resistance for this type of damage */
						amount: number;
						/** the damage type */
						type: string;
					}[];
				};
				/** All nullable integer properties of a sheet. */
				intProperties: {
					ac?: number | null;
					strength?: number | null;
					dexterity?: number | null;
					constitution?: number | null;
					intelligence?: number | null;
					wisdom?: number | null;
					charisma?: number | null;
					walkSpeed?: number | null;
					flySpeed?: number | null;
					swimSpeed?: number | null;
					climbSpeed?: number | null;
					burrowSpeed?: number | null;
					dimensionalSpeed?: number | null;
					heavyProficiency?: number | null;
					mediumProficiency?: number | null;
					lightProficiency?: number | null;
					unarmoredProficiency?: number | null;
					martialProficiency?: number | null;
					simpleProficiency?: number | null;
					unarmedProficiency?: number | null;
					advancedProficiency?: number | null;
				};
				/** All stats, each potentially having a roll, a dc, a proficiency, and an ability. */
				stats: {
					arcane: {
						/** The stat's name. */
						name: string;
						proficiency?: number | null;
						dc?: number | null;
						bonus?: number | null;
						ability?: unknown | null;
						note?: string | null;
					};
					divine: {
						/** The stat's name. */
						name: string;
						proficiency?: number | null;
						dc?: number | null;
						bonus?: number | null;
						ability?: unknown | null;
						note?: string | null;
					};
					occult: {
						/** The stat's name. */
						name: string;
						proficiency?: number | null;
						dc?: number | null;
						bonus?: number | null;
						ability?: unknown | null;
						note?: string | null;
					};
					primal: {
						/** The stat's name. */
						name: string;
						proficiency?: number | null;
						dc?: number | null;
						bonus?: number | null;
						ability?: unknown | null;
						note?: string | null;
					};
					class: {
						/** The stat's name. */
						name: string;
						proficiency?: number | null;
						dc?: number | null;
						bonus?: number | null;
						ability?: unknown | null;
						note?: string | null;
					};
					perception: {
						/** The stat's name. */
						name: string;
						proficiency?: number | null;
						dc?: number | null;
						bonus?: number | null;
						ability?: unknown | null;
						note?: string | null;
					};
					fortitude: {
						/** The stat's name. */
						name: string;
						proficiency?: number | null;
						dc?: number | null;
						bonus?: number | null;
						ability?: unknown | null;
						note?: string | null;
					};
					reflex: {
						/** The stat's name. */
						name: string;
						proficiency?: number | null;
						dc?: number | null;
						bonus?: number | null;
						ability?: unknown | null;
						note?: string | null;
					};
					will: {
						/** The stat's name. */
						name: string;
						proficiency?: number | null;
						dc?: number | null;
						bonus?: number | null;
						ability?: unknown | null;
						note?: string | null;
					};
					acrobatics: {
						/** The stat's name. */
						name: string;
						proficiency?: number | null;
						dc?: number | null;
						bonus?: number | null;
						ability?: unknown | null;
						note?: string | null;
					};
					arcana: {
						/** The stat's name. */
						name: string;
						proficiency?: number | null;
						dc?: number | null;
						bonus?: number | null;
						ability?: unknown | null;
						note?: string | null;
					};
					athletics: {
						/** The stat's name. */
						name: string;
						proficiency?: number | null;
						dc?: number | null;
						bonus?: number | null;
						ability?: unknown | null;
						note?: string | null;
					};
					crafting: {
						/** The stat's name. */
						name: string;
						proficiency?: number | null;
						dc?: number | null;
						bonus?: number | null;
						ability?: unknown | null;
						note?: string | null;
					};
					deception: {
						/** The stat's name. */
						name: string;
						proficiency?: number | null;
						dc?: number | null;
						bonus?: number | null;
						ability?: unknown | null;
						note?: string | null;
					};
					diplomacy: {
						/** The stat's name. */
						name: string;
						proficiency?: number | null;
						dc?: number | null;
						bonus?: number | null;
						ability?: unknown | null;
						note?: string | null;
					};
					intimidation: {
						/** The stat's name. */
						name: string;
						proficiency?: number | null;
						dc?: number | null;
						bonus?: number | null;
						ability?: unknown | null;
						note?: string | null;
					};
					medicine: {
						/** The stat's name. */
						name: string;
						proficiency?: number | null;
						dc?: number | null;
						bonus?: number | null;
						ability?: unknown | null;
						note?: string | null;
					};
					nature: {
						/** The stat's name. */
						name: string;
						proficiency?: number | null;
						dc?: number | null;
						bonus?: number | null;
						ability?: unknown | null;
						note?: string | null;
					};
					occultism: {
						/** The stat's name. */
						name: string;
						proficiency?: number | null;
						dc?: number | null;
						bonus?: number | null;
						ability?: unknown | null;
						note?: string | null;
					};
					performance: {
						/** The stat's name. */
						name: string;
						proficiency?: number | null;
						dc?: number | null;
						bonus?: number | null;
						ability?: unknown | null;
						note?: string | null;
					};
					religion: {
						/** The stat's name. */
						name: string;
						proficiency?: number | null;
						dc?: number | null;
						bonus?: number | null;
						ability?: unknown | null;
						note?: string | null;
					};
					society: {
						/** The stat's name. */
						name: string;
						proficiency?: number | null;
						dc?: number | null;
						bonus?: number | null;
						ability?: unknown | null;
						note?: string | null;
					};
					stealth: {
						/** The stat's name. */
						name: string;
						proficiency?: number | null;
						dc?: number | null;
						bonus?: number | null;
						ability?: unknown | null;
						note?: string | null;
					};
					survival: {
						/** The stat's name. */
						name: string;
						proficiency?: number | null;
						dc?: number | null;
						bonus?: number | null;
						ability?: unknown | null;
						note?: string | null;
					};
					thievery: {
						/** The stat's name. */
						name: string;
						proficiency?: number | null;
						dc?: number | null;
						bonus?: number | null;
						ability?: unknown | null;
						note?: string | null;
					};
				};
				/** All incrementable counters on a sheet */
				baseCounters: {
					heroPoints?: {
						style: 'default' | 'dots';
						name: string;
						current: number;
						max?: number | null;
						recoverable?: boolean;
					};
					focusPoints?: {
						style: 'default' | 'dots';
						name: string;
						current: number;
						max?: number | null;
						recoverable?: boolean;
					};
					hp?: {
						style: 'default' | 'dots';
						name: string;
						current: number;
						max?: number | null;
						recoverable?: boolean;
					};
					tempHp?: {
						style: 'default' | 'dots';
						name: string;
						current: number;
						max?: number | null;
						recoverable?: boolean;
					};
					stamina?: {
						style: 'default' | 'dots';
						name: string;
						current: number;
						max?: number | null;
						recoverable?: boolean;
					};
					resolve?: {
						style: 'default' | 'dots';
						name: string;
						current: number;
						max?: number | null;
						recoverable?: boolean;
					};
				};
				/** The creature's lore/additional skills. */
				additionalSkills?: {
					/** The stat's name. */
					name: string;
					proficiency?: number | null;
					dc?: number | null;
					bonus?: number | null;
					ability?: unknown | null;
					note?: string | null;
				}[];
				/** The creature's attacks. */
				attacks: {
					/** The attack name. */
					name: string;
					/** The attack toHit. */
					toHit?: number | null;
					/** The attack damage. */
					damage?: {
						/** The attack damage dice. */
						dice: string;
						/** The attack damage type. */
						type: string | null;
					}[];
					/** Any abilities or rider effects to an attack */
					effects?: string[];
					/** The attack range. */
					range?: string | null;
					/** The attack traits. */
					traits?: string[];
					/** The attack notes. */
					notes?: string | null;
				}[];
				/** The source data the sheet was parsed from */
				sourceData?: {};
		  }
		| undefined;
	modifiers?:
		| (
				| {
						modifierType: 'sheet';
						name: string;
						isActive?: boolean;
						description?: string | null;
						type?: unknown;
						sheetAdjustments?: {
							property: string;
							propertyType: unknown;
							operation: unknown;
							value: string;
							type?: unknown;
						}[];
				  }
				| {
						modifierType: 'roll';
						name: string;
						isActive?: boolean;
						description?: string | null;
						type?: unknown;
						value?: string;
						targetTags: string | null;
				  }
		  )[]
		| undefined;
	actions?:
		| {
				name: string;
				description?: string | null;
				type: unknown;
				actionCost: unknown;
				baseLevel?: number | null;
				autoHeighten?: boolean;
				tags?: string[];
				rolls?: (
					| {
							name: string;
							allowRollModifiers?: boolean;
							type: 'attack' | 'skill-challenge';
							targetDC?: string | null;
							roll?: string;
					  }
					| {
							name: string;
							allowRollModifiers?: boolean;
							type: 'damage';
							damageType?: string | null;
							healInsteadOfDamage?: boolean;
							roll?: string | null;
					  }
					| {
							name: string;
							allowRollModifiers?: boolean;
							type: 'advanced-damage';
							damageType?: string | null;
							healInsteadOfDamage?: boolean;
							criticalSuccessRoll?: string | null;
							criticalFailureRoll?: string | null;
							successRoll?: string | null;
							failureRoll?: string | null;
					  }
					| {
							name: string;
							allowRollModifiers?: boolean;
							type: 'save';
							saveRollType?: string | null;
							saveTargetDC?: string | null;
					  }
					| {
							name: string;
							allowRollModifiers?: boolean;
							type: 'text';
							defaultText?: string | null;
							criticalSuccessText?: string | null;
							criticalFailureText?: string | null;
							successText?: string | null;
							failureText?: string | null;
							extraTags?: string[];
					  }
				)[];
		  }[]
		| undefined;
	rollMacros?:
		| {
				name: string;
				macro: string;
		  }[]
		| undefined;
};
