export enum AdjustablePropertyEnum {
	info = 'info',
	infoList = 'infoList',
	intProperty = 'intProperty',
	baseCounter = 'baseCounter',
	weaknessResistance = 'weaknessResistance',
	stat = 'stat',
	attack = 'attack',
	extraSkill = 'extraSkill',
	none = '',
}

export enum SheetAdjustmentTypeEnum {
	untyped = 'untyped',
	status = 'status',
	circumstance = 'circumstance',
	item = 'item',
}

export enum SheetAdjustmentOperationEnum {
	'+' = '+',
	'-' = '-',
	'=' = '=',
}

export enum ActionTypeEnum {
	attack = 'attack',
	spell = 'spell',
	other = 'other',
}

export enum ActionCostEnum {
	oneAction = 'oneAction',
	twoActions = 'twoActions',
	threeActions = 'threeActions',
	freeAction = 'freeAction',
	variableActions = 'variableActions',
	reaction = 'reaction',
}

export enum SheetIntegerKeys {
	// AC
	ac = 'ac',
	// Ability Scores
	strength = 'strength',
	dexterity = 'dexterity',
	constitution = 'constitution',
	intelligence = 'intelligence',
	wisdom = 'wisdom',
	charisma = 'charisma',
	// Speeds
	walkSpeed = 'walkSpeed',
	flySpeed = 'flySpeed',
	swimSpeed = 'swimSpeed',
	climbSpeed = 'climbSpeed',
	burrowSpeed = 'burrowSpeed',
	dimensionalSpeed = 'dimensionalSpeed',
	// Extra Proficiencies
	heavyProficiency = 'heavyProficiency',
	mediumProficiency = 'mediumProficiency',
	lightProficiency = 'lightProficiency',
	unarmoredProficiency = 'unarmoredProficiency',
	martialProficiency = 'martialProficiency',
	simpleProficiency = 'simpleProficiency',
	unarmedProficiency = 'unarmedProficiency',
	advancedProficiency = 'advancedProficiency',
}

export enum SheetStatKeys {
	// casting
	arcane = 'arcane',
	divine = 'divine',
	occult = 'occult',
	primal = 'primal',
	// Class attack/DC
	class = 'class',
	// perception
	perception = 'perception',
	// saves
	fortitude = 'fortitude',
	reflex = 'reflex',
	will = 'will',
	// skills
	acrobatics = 'acrobatics',
	arcana = 'arcana',
	athletics = 'athletics',
	crafting = 'crafting',
	deception = 'deception',
	diplomacy = 'diplomacy',
	intimidation = 'intimidation',
	medicine = 'medicine',
	nature = 'nature',
	occultism = 'occultism',
	performance = 'performance',
	religion = 'religion',
	society = 'society',
	stealth = 'stealth',
	survival = 'survival',
	thievery = 'thievery',
}

export enum SheetInfoKeys {
	url = 'url',
	description = 'description',
	gender = 'gender',
	age = 'age',
	alignment = 'alignment',
	deity = 'deity',
	imageURL = 'imageURL',
	size = 'size',
	class = 'class',
	keyAbility = 'keyAbility',
	ancestry = 'ancestry',
	heritage = 'heritage',
	background = 'background',
}

export enum SheetBaseCounterKeys {
	heroPoints = 'heroPoints',
	focusPoints = 'focusPoints',
	hp = 'hp',
	tempHp = 'tempHp',
	stamina = 'stamina',
	resolve = 'resolve',
}

export enum SheetInfoListKeys {
	traits = 'traits',
	languages = 'languages',
	senses = 'senses',
	immunities = 'immunities',
}

export enum SheetWeaknessesResistancesKeys {
	resistances = 'resistances',
	weaknesses = 'weaknesses',
}

export enum AbilityEnum {
	strength = 'strength',
	dexterity = 'dexterity',
	constitution = 'constitution',
	intelligence = 'intelligence',
	wisdom = 'wisdom',
	charisma = 'charisma',
}

export enum StatSubGroupEnum {
	proficiency = 'proficiency',
	dc = 'dc',
	bonus = 'bonus',
	ability = 'ability',
}
