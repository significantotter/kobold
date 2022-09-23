export namespace WG {
	interface CharacterApiResponse {
		id: number;
		userID: number;
		buildID: null;
		name: string;
		level: number;
		experience: number;
		currentHealth: number;
		tempHealth: null | number;
		heroPoints: null | number;
		ancestryID: null | number;
		heritageID: null | number;
		uniHeritageID: null | number;
		backgroundID: null | number;
		classID: null | number;
		classID_2: null | number;
		inventoryID: number;
		notes: null;
		infoJSON: { imageUrl: string; pronouns: string; [key: string]: any };
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
	}
	interface SpellSlot {
		slotID: number;
		slotLevel: number;
		used: boolean;
		spellID: number | null;
		type: string;
		level_lock: number;
		srcStruct: SrcStruct;
	}

	interface SpellSlotsMap {
		[classname: string]: SpellSlot;
	}

	interface Spell {
		SpellBookSpellID: number;
		SpellID: number;
		SpellLevel: number;
		SpellType: string;
	}

	interface SpellBook {
		SpellSRC: string;
		SpellList: string;
		SpellCastingType: string;
		SpellKeyAbility: string;
		IsFocus: boolean;
		SpellBook: Spell[];
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
	}

	interface FocusSpell extends SrcStruct {
		SpellID: string;
	}

	interface FocusSpellsMap {
		[className: string]: FocusSpell;
	}

	interface CharacterSpellAPIResponse {
		spell_slots_map: SpellSlotsMap;
		spell_books: SpellBook[];
		innate_spells: InnateSpell;
		focus_spells_map: FocusSpellsMap;
		focus_points: SrcStruct[];
	}

	interface NamedScore {
		Name: string;
		Score: number | null;
		[key: string]: any;
	}

	interface NamedBonus {
		Name: string;
		Bonus: number | null;
		[key: string]: any;
	}

	interface Attack {
		Name: string;
		Bonus: number | null;
		Damage: String | null;
		[key: string]: any;
	}

	interface CharacterCalculatedStatsApiResponse {
		charID: number;
		maxHP: number | null;
		totalClassDC: number | null;
		totalSpeed: number | null;
		totalAC: number | null;
		totalPerception: number | null;
		totalSkills: NamedBonus[];
		totalSaves: NamedBonus[];
		totalAbilityScores: NamedScore[];
		weapons: Attack[];
		createdAt: Date;
		updatedAt: Date;
		[key: string]: any;
	}

	interface InventoryMetadata {
		id: number;
		equippedArmorInvItemID: number | null;
		equippedShieldInvItemID: number | null;
		equippedArmorCategory: string | null;
		createdAt: string;
		updatedAt: string;
	}

	interface InventoryItem {
		id: number;
		invID: number;
		itemID: number;
		name: string;
		price: number;
		bulk: number;
		description: string;
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
	}

	interface CharacterInventoryAPIResponse {
		Inventory: InventoryMetadata;
		InvItems: InventoryItem[];
	}

	interface Condition {
		id: number;
		name: string;
		description: string;
		hasValue: number;
		code: string;
		createdAt: string;
		updatedAt: string;
	}
	interface ConditionEntry {
		EntryID: number;
		Value: number | null;
		SourceText: string;
		ParentID: number;
	}

	interface CharacterConditionsAPIResponse {
		[id: string]: ConditionEntry;
	}

	interface CharacterMetadataAPIResponseItem {
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
	type CharacterMetadataAPIResponse = CharacterMetadataAPIResponseItem[];
}
