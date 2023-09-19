import { VHeritageApi } from './v-heritage-api/index.js';
export namespace WG {
	/**
	 * CHARACTER API
	 */

	// GET
	interface CharacterApiResponse {
		id: number;
		userID: number;
		buildID: null | number;
		name: string;
		level: number;
		experience: number;
		currentHealth: null | number;
		tempHealth: null | number;
		heroPoints: null | number;
		ancestryID: null | number;
		heritageID: null | number;
		uniHeritageID: null | number;
		backgroundID: null | number;
		classID: null | number;
		classID_2: null | number;
		inventoryID: number;
		notes: any;
		infoJSON: null | {
			gender?: string;
			beliefs?: string;
			appearance?: string;
			nationality?: string;
			alignment?: string;
			imageURL?: string;
			pronouns?: string;
			[key: string]: any;
		};
		rollHistoryJSON: any;
		details: any;
		customCode: any;
		dataID: null | number;
		currentStamina: null | number;
		currentResolve: null | number;
		builderByLevel: number;
		optionAutoDetectPreReqs: number;
		optionAutoHeightenSpells: number;
		optionPublicCharacter: number;
		optionCustomCodeBlock: number;
		optionDiceRoller: number;
		optionClassArchetypes: number;
		optionIgnoreBulk: number;
		variantProfWithoutLevel: number;
		variantFreeArchetype: number;
		variantAncestryParagon: number;
		variantStamina: number;
		variantAutoBonusProgression: number;
		variantGradualAbilityBoosts: number;
		enabledSources: string[];
		enabledHomebrew: any[];
		createdAt: string;
		updatedAt: string;
		[key: string]: any;
	}

	// GET SPELLS
	interface SrcStruct {
		charID: number;
		source: string;
		sourceType: string;
		sourceLevel: number;
		sourceCode: string;
		sourceCodeSNum: string;
		value: any;
		createdAt: string;
		updatedAt: string;
		[k: string]: any;
	}
	interface SpellSlot {
		slotID: number;
		slotLevel: number;
		used: boolean;
		spellID: number | null;
		type: string;
		level_lock: number;
		srcStruct: SrcStruct;
		[k: string]: any;
	}

	interface SpellSlotsMap {
		[classname: string]: SpellSlot;
		[k: string]: any;
	}

	interface Spell {
		SpellBookSpellID: number;
		SpellID: number;
		SpellLevel: number;
		SpellType: string;
		[k: string]: any;
	}

	interface SpellBook {
		SpellSRC: string;
		SpellList: string;
		SpellCastingType: string;
		SpellKeyAbility: string;
		IsFocus: boolean;
		SpellBook: Spell[];
		[k: string]: any;
	}

	interface InnateSpell {
		charID: number;
		source: string;
		sourceType: string;
		sourceLevel: number;
		sourceCode: string;
		sourceCodeSNum: string;
		value: string;
		createdAt: string;
		updatedAt: string;
		SpellID: string;
		SpellLevel: number;
		SpellTradition: string;
		TimesPerDay: number;
		KeyAbility: string;
		TimesCast: number;
		[k: string]: any;
	}

	interface FocusSpell extends SrcStruct {
		SpellID: string;
		[k: string]: any;
	}

	interface FocusSpellsMap {
		[className: string]: FocusSpell;
		[k: string]: any;
	}

	interface CharacterSpellApiResponse {
		spell_slots_map: SpellSlotsMap;
		spell_books: SpellBook[];
		innate_spells: InnateSpell;
		focus_spells_map: FocusSpellsMap;
		focus_points: SrcStruct[];
		[k: string]: any;
	}

	// GET CALCULATED STATS
	interface NamedScore {
		Name: string;
		Score: number | null;
		[key: string]: any;
	}

	interface NamedBonus {
		Name: string;
		Bonus: number | string | null;
		ProficiencyMod?: number | null;
		[key: string]: any;
	}

	interface Attack {
		Name: string;
		Bonus: number | null;
		Damage: string | null;
		[key: string]: any;
	}

	interface CalculatedCondition {
		conditionID: number | null;
		name: string | null;
		entryID: number | null;
		parentEntryID: number | null;
		sourceText: any;
		value: number | null;
		[key: string]: any;
	}

	interface CharacterCalculatedStatsApiResponse {
		charID: number;
		maxHP: number | null;
		maxStamina: number | null;
		maxResolve: number | null;
		conditions: CalculatedCondition[] | null;
		totalClassDC: number | null;
		classDCProfMod?: number | null;
		totalSpeed: number | null;
		generalInfo: {
			className?: string;
			heritageAncestryName?: string;
			backgroundName?: string;
			size?: string;
			traits?: string[];
		};
		totalAC: number | null;
		totalPerception: number | null;
		perceptionProfMod?: number | null;
		totalSkills: NamedBonus[];
		totalSaves: NamedBonus[];
		totalAbilityScores: NamedScore[];
		weapons: Attack[];

		unarmedProfMod?: number | null;
		simpleWeaponProfMod?: number | null;
		martialWeaponProfMod?: number | null;
		advancedWeaponProfMod?: number | null;

		arcaneSpellDC?: number | null;
		divineSpellDC?: number | null;
		occultSpellDC?: number | null;
		primalSpellDC?: number | null;
		arcaneSpellAttack?: number | null;
		divineSpellAttack?: number | null;
		occultSpellAttack?: number | null;
		primalSpellAttack?: number | null;
		arcaneSpellProfMod?: number | null;
		divineSpellProfMod?: number | null;
		occultSpellProfMod?: number | null;
		primalSpellProfMod?: number | null;

		createdAt: string;
		updatedAt: string;
		[key: string]: any;
	}

	// GET INVENTORY

	interface InventoryMetadata {
		id: number;
		equippedArmorInvItemID: number | null;
		equippedShieldInvItemID: number | null;
		equippedArmorCategory: string | null;
		createdAt: string;
		updatedAt: string;
		[k: string]: any;
	}

	interface InventoryItem {
		id: number;
		invID: number;
		itemID: number;
		name: string;
		price: number;
		bulk: number;
		description: string | null;
		size: string;
		quantity: number;
		isShoddy: number;
		isDropped: number;
		currentHitPoints: number;
		hitPoints: number;
		materialType: string | null;
		brokenThreshold: number;
		hardness: number;
		code: any | null;
		itemTags: any | null;
		isInvested: number;
		bagInvItemID: any | null;
		itemIsWeapon: number;
		itemWeaponDieType: any | null;
		itemWeaponDamageType: any | null;
		itemWeaponRange: any | null;
		itemWeaponReload: any | null;
		itemWeaponAtkBonus: number;
		itemWeaponDmgBonus: number;
		itemIsStorage: number;
		itemStorageMaxBulk: number;
		fundRuneID: any | null;
		fundPotencyRuneID: any | null;
		propRune1ID: any | null;
		propRune2ID: any | null;
		propRune3ID: any | null;
		propRune4ID: any | null;
		createdAt: string;
		updatedAt: string;
		[k: string]: any;
	}

	interface CharacterInventoryApiResponse {
		Inventory: InventoryMetadata;
		InvItems: InventoryItem[];
	}

	// GET CONDITION
	interface Condition {
		id: number;
		name: string;
		description: string | null;
		hasValue: number;
		code: string;
		createdAt: string;
		updatedAt: string;
		[k: string]: any;
	}
	interface ConditionEntry {
		EntryID: number;
		Value: number | null;
		SourceText: string | null;
		ParentID: number;
		[k: string]: any;
	}

	interface CharacterConditionsApiResponse {
		[id: string]: ConditionEntry;
		[k: string]: any;
	}

	// GET METADATA
	interface CharacterMetadataApiResponseItem {
		charID: number;
		source: string;
		sourceType: string;
		sourceLevel: number;
		sourceCode: string;
		sourceCodeSNum: string;
		value: string;
		createdAt: string;
		updatedAt: string;
		[key: string]: any;
	}
	type CharacterMetadataApiResponse = CharacterMetadataApiResponseItem[];

	/**
	 * CLASS API
	 */

	interface ClassFeature {
		id: number;
		classID: number;
		name: string;
		level: any;
		description: string | null;
		code: string;
		selectType: string;
		selectOptionFor: number;
		displayInSheet: number;
		indivClassName: any;
		indivClassAbilName: any;
		isArchived: number;
		contentSrc: string;
		homebrewID: any;
		createdAt: string;
		updatedAt: string;
		[k: string]: any;
	}

	interface ClassApiResponse {
		class: {
			id: number;
			name: string;
			rarity: string;
			description: string | null;
			keyAbility: string;
			hitPoints: number;
			tPerception: string;
			tFortitude: string;
			tReflex: string;
			tWill: string;
			tClassDC: string;
			tSkills: string;
			tSkillsMore: number;
			tWeapons: string;
			weaponsExtra: any;
			tArmor: string;
			tagID: number;
			artworkURL: string;
			code: any;
			isArchived: number;
			contentSrc: string;
			homebrewID: any;
			version: string;
			createdAt: string;
			updatedAt: string;
			[k: string]: any;
		};
		class_features: ClassFeature[];
		[k: string]: any;
	}
	interface ClassApiMapResponse {
		[id: string]: ClassApiResponse;
		[k: string]: any;
	}

	/**
	 * ANCESTRY API
	 */

	interface AncestryHeritage {
		id: number;
		name: string;
		ancestryID?: number;
		tagId?: number;
		rarity: string;
		description: string | null;
		code: string;
		isArchived: number;
		contentSrc: string;
		indivAncestryName?: any;
		homebrewID: any;
		artworkURL?: string | null;
		version?: string;
		createdAt: string;
		updatedAt: string;
		[k: string]: any;
	}

	interface Language {
		id: number;
		name: string;
		speakers: string;
		script: any;
		description: string | null;
		homebrewID: any;
		createdAt: string;
		updatedAt: string;
		[k: string]: any;
	}
	interface AncestryFeature {
		id: number;
		name: string;
		description: string | null;
		code: string;
		itemWeaponID: any;
		overrides: any;
		[k: string]: any;
	}

	interface Ancestry {
		id: number;
		name: string;
		rarity: string;
		hitPoints: number;
		size: string;
		speed: number;
		description: string;
		visionSenseID: number;
		additionalSenseID: any;
		physicalFeatureOneID: number;
		physicalFeatureTwoID: number;
		tagID: number;
		artworkURL: any;
		isArchived: number;
		contentSrc: string;
		homebrewID: any;
		version: string;
		createdAt: string;
		updatedAt: string;
		[k: string]: any;
	}
	interface AncestryApiResponse {
		ancestry: Ancestry;
		heritages: AncestryHeritage[];
		languages: Language[];
		bonus_languages: Language[];
		boosts: string[];
		flaws: string[];
		vision_sense: {
			id: number;
			name: string;
			description: string | null;
			isVisionType: number;
			visionPrecedence: number;
			createdAt: string;
			updatedAt: string;
		};
		additional_sense: null;
		physical_feature_one: AncestryFeature;
		physical_feature_two: AncestryFeature;
		[otherFeature: string]: any;
		[k: string]: any;
	}
	interface AncestryApiMapResponse {
		[id: string]: AncestryApiResponse;
		[k: string]: any;
	}

	/**
	 * HERITAGE API
	 */

	// just uses AncestryHeritage

	/**
	 * V-HERITAGE API
	 */

	interface VHeritageApiResponse {
		heritage: AncestryHeritage;
		[k: string]: any;
	}

	/**
	 * BACKGROUND API
	 */

	interface Background {
		id: number;
		name: string;
		rarity: string;
		description: string | null;
		boostOne: string;
		boostTwo: string;
		code: string;
		isArchived: number;
		contentSrc: string;
		homebrewID: any;
		version: string;
		createdAt: string;
		updatedAt: string;
		[k: string]: any;
	}

	interface BackgroundApiResponse {
		background: Background;
		[k: string]: any;
	}
}
