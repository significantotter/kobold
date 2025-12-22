// Auto-generated TypeScript type definitions from Zod schema
// Do not edit manually

type PasteBinImport = { sheet?: { /**
 * Sheet information not modifiable in Kobold.
 */
staticInfo: { /**
 * The creature's name.
 */
name: string, /**
 * The creature's level.
 */
level: null | number, /**
 * The creature's key ability.
 */
keyAbility: null | ("strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma"), /**
 * Whether the creature follows alternate stamina rules.
 */
usesStamina: boolean } & { [x: string]: never }, /**
 * A sheet's nullable/mutable string information.
 */
info: { url: null | string, description: null | string, gender: null | string, age: null | string, alignment: null | string, deity: null | string, imageURL: null | string, size: null | string, class: null | string, ancestry: null | string, heritage: null | string, background: null | string }, /**
 * Sheet information as arrays of strings.
 */
infoLists: { traits: Array<string>, languages: Array<string>, senses: Array<string>, immunities: Array<string> }, /**
 * Weakness or resistance typed information.
 */
weaknessesResistances: { resistances: Array<{ /**
 * the amount of weakness/resistance for this type of damage
 */
amount: number, /**
 * the damage type
 */
type: string } & { [x: string]: never }>, weaknesses: Array<{ /**
 * the amount of weakness/resistance for this type of damage
 */
amount: number, /**
 * the damage type
 */
type: string } & { [x: string]: never }> }, /**
 * The creature's nullable integer properties.
 */
intProperties: { ac: null | number, strength: null | number, dexterity: null | number, constitution: null | number, intelligence: null | number, wisdom: null | number, charisma: null | number, walkSpeed: null | number, flySpeed: null | number, swimSpeed: null | number, climbSpeed: null | number, burrowSpeed: null | number, dimensionalSpeed: null | number, heavyProficiency: null | number, mediumProficiency: null | number, lightProficiency: null | number, unarmoredProficiency: null | number, martialProficiency: null | number, simpleProficiency: null | number, unarmedProficiency: null | number, advancedProficiency: null | number }, /**
 * All stats, each potentially having a roll, a dc, a proficiency, and an ability.
 */
stats: { arcane: { /**
 * The stat's name.
 */
name: string, proficiency: null | number, dc: null | number, bonus: null | number, ability: null | ("strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma"), note: null | string } & { [x: string]: never }, divine: { /**
 * The stat's name.
 */
name: string, proficiency: null | number, dc: null | number, bonus: null | number, ability: null | ("strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma"), note: null | string } & { [x: string]: never }, occult: { /**
 * The stat's name.
 */
name: string, proficiency: null | number, dc: null | number, bonus: null | number, ability: null | ("strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma"), note: null | string } & { [x: string]: never }, primal: { /**
 * The stat's name.
 */
name: string, proficiency: null | number, dc: null | number, bonus: null | number, ability: null | ("strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma"), note: null | string } & { [x: string]: never }, class: { /**
 * The stat's name.
 */
name: string, proficiency: null | number, dc: null | number, bonus: null | number, ability: null | ("strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma"), note: null | string } & { [x: string]: never }, perception: { /**
 * The stat's name.
 */
name: string, proficiency: null | number, dc: null | number, bonus: null | number, ability: null | ("strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma"), note: null | string } & { [x: string]: never }, fortitude: { /**
 * The stat's name.
 */
name: string, proficiency: null | number, dc: null | number, bonus: null | number, ability: null | ("strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma"), note: null | string } & { [x: string]: never }, reflex: { /**
 * The stat's name.
 */
name: string, proficiency: null | number, dc: null | number, bonus: null | number, ability: null | ("strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma"), note: null | string } & { [x: string]: never }, will: { /**
 * The stat's name.
 */
name: string, proficiency: null | number, dc: null | number, bonus: null | number, ability: null | ("strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma"), note: null | string } & { [x: string]: never }, acrobatics: { /**
 * The stat's name.
 */
name: string, proficiency: null | number, dc: null | number, bonus: null | number, ability: null | ("strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma"), note: null | string } & { [x: string]: never }, arcana: { /**
 * The stat's name.
 */
name: string, proficiency: null | number, dc: null | number, bonus: null | number, ability: null | ("strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma"), note: null | string } & { [x: string]: never }, athletics: { /**
 * The stat's name.
 */
name: string, proficiency: null | number, dc: null | number, bonus: null | number, ability: null | ("strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma"), note: null | string } & { [x: string]: never }, crafting: { /**
 * The stat's name.
 */
name: string, proficiency: null | number, dc: null | number, bonus: null | number, ability: null | ("strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma"), note: null | string } & { [x: string]: never }, deception: { /**
 * The stat's name.
 */
name: string, proficiency: null | number, dc: null | number, bonus: null | number, ability: null | ("strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma"), note: null | string } & { [x: string]: never }, diplomacy: { /**
 * The stat's name.
 */
name: string, proficiency: null | number, dc: null | number, bonus: null | number, ability: null | ("strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma"), note: null | string } & { [x: string]: never }, intimidation: { /**
 * The stat's name.
 */
name: string, proficiency: null | number, dc: null | number, bonus: null | number, ability: null | ("strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma"), note: null | string } & { [x: string]: never }, medicine: { /**
 * The stat's name.
 */
name: string, proficiency: null | number, dc: null | number, bonus: null | number, ability: null | ("strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma"), note: null | string } & { [x: string]: never }, nature: { /**
 * The stat's name.
 */
name: string, proficiency: null | number, dc: null | number, bonus: null | number, ability: null | ("strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma"), note: null | string } & { [x: string]: never }, occultism: { /**
 * The stat's name.
 */
name: string, proficiency: null | number, dc: null | number, bonus: null | number, ability: null | ("strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma"), note: null | string } & { [x: string]: never }, performance: { /**
 * The stat's name.
 */
name: string, proficiency: null | number, dc: null | number, bonus: null | number, ability: null | ("strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma"), note: null | string } & { [x: string]: never }, religion: { /**
 * The stat's name.
 */
name: string, proficiency: null | number, dc: null | number, bonus: null | number, ability: null | ("strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma"), note: null | string } & { [x: string]: never }, society: { /**
 * The stat's name.
 */
name: string, proficiency: null | number, dc: null | number, bonus: null | number, ability: null | ("strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma"), note: null | string } & { [x: string]: never }, stealth: { /**
 * The stat's name.
 */
name: string, proficiency: null | number, dc: null | number, bonus: null | number, ability: null | ("strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma"), note: null | string } & { [x: string]: never }, survival: { /**
 * The stat's name.
 */
name: string, proficiency: null | number, dc: null | number, bonus: null | number, ability: null | ("strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma"), note: null | string } & { [x: string]: never }, thievery: { /**
 * The stat's name.
 */
name: string, proficiency: null | number, dc: null | number, bonus: null | number, ability: null | ("strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma"), note: null | string } & { [x: string]: never } }, /**
 * The non-configurable base counters for a sheet.
 */
baseCounters: { heroPoints: { style: "default", name: string, description: null | string, current: number, max: null | number, recoverTo: number, recoverable: boolean, text: string } & { [x: string]: never }, focusPoints: { style: "default", name: string, description: null | string, current: number, max: null | number, recoverTo: number, recoverable: boolean, text: string } & { [x: string]: never }, hp: { style: "default", name: string, description: null | string, current: number, max: null | number, recoverTo: number, recoverable: boolean, text: string } & { [x: string]: never }, tempHp: { style: "default", name: string, description: null | string, current: number, max: null | number, recoverTo: number, recoverable: boolean, text: string } & { [x: string]: never }, stamina: { style: "default", name: string, description: null | string, current: number, max: null | number, recoverTo: number, recoverable: boolean, text: string } & { [x: string]: never }, resolve: { style: "default", name: string, description: null | string, current: number, max: null | number, recoverTo: number, recoverable: boolean, text: string } & { [x: string]: never } }, /**
 * The configurable counters for a sheet that aren't in a group.
 */
counterGroups: Array<{ name: string, description: null | string, counters: Array<({ style: "prepared", name: string, description: null | string, prepared: Array<(string | null)>, active: Array<boolean>, max: null | number, recoverable: boolean, text: string } & { [x: string]: never } | { style: "default", name: string, description: null | string, current: number, max: null | number, recoverTo: number, recoverable: boolean, text: string } & { [x: string]: never } | { style: "dots", name: string, description: null | string, current: number, max: number, recoverTo: number, recoverable: boolean, text: string } & { [x: string]: never })> } & { [x: string]: never }>, /**
 * The configurable counter groups for a sheet.
 */
countersOutsideGroups: Array<({ style: "prepared", name: string, description: null | string, prepared: Array<(string | null)>, active: Array<boolean>, max: null | number, recoverable: boolean, text: string } & { [x: string]: never } | { style: "default", name: string, description: null | string, current: number, max: null | number, recoverTo: number, recoverable: boolean, text: string } & { [x: string]: never } | { style: "dots", name: string, description: null | string, current: number, max: number, recoverTo: number, recoverable: boolean, text: string } & { [x: string]: never })>, /**
 * The creature's lore/additional skills.
 */
additionalSkills: Array<{ /**
 * The stat's name.
 */
name: string, proficiency: null | number, dc: null | number, bonus: null | number, ability: null | ("strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma"), note: null | string } & { [x: string]: never }>, /**
 * The creature's attacks.
 */
attacks: Array<{ /**
 * The attack name.
 */
name: string, /**
 * The attack toHit.
 */
toHit: null | number, /**
 * The attack damage.
 */
damage: Array<{ /**
 * The attack damage dice.
 */
dice: string, /**
 * The attack damage type.
 */
type: null | string } & { [x: string]: never }>, /**
 * Any abilities or rider effects to an attack
 */
effects: Array<string>, /**
 * The attack range.
 */
range: null | string, /**
 * The attack traits.
 */
traits: Array<string>, /**
 * The attack notes.
 */
notes: null | string } & { [x: string]: never }>, /**
 * The source data the sheet was parsed from
 */
sourceData: Record<string, any> } & { [x: string]: never }, modifiers?: Array<{ name: string, isActive: boolean, description: null | string, type: ("untyped" | "status" | "circumstance" | "item"), severity: null | number, sheetAdjustments: Array<{ property: string, propertyType: ("info" | "infoList" | "intProperty" | "baseCounter" | "weaknessResistance" | "stat" | "attack" | "extraSkill" | "statGroup" | ""), operation: ("+" | "-" | "="), value: string, type: ("untyped" | "status" | "circumstance" | "item") } & { [x: string]: never }>, rollAdjustment: null | string, rollTargetTags: null | string, note: null | string } & { [x: string]: never }>, actions?: Array<{ name: string, description: null | string, type: ("attack" | "spell" | "other"), actionCost: ("oneAction" | "twoActions" | "threeActions" | "freeAction" | "variableActions" | "reaction" | "none"), baseLevel: null | number, autoHeighten: boolean, tags: Array<string>, rolls: Array<({ name: string, allowRollModifiers: boolean, type: ("attack" | "skill-challenge"), targetDC: null | string, roll: string } & { [x: string]: never } | { name: string, allowRollModifiers: boolean, type: "damage", damageType: null | string, healInsteadOfDamage: boolean, roll: null | string } & { [x: string]: never } | { name: string, allowRollModifiers: boolean, type: "advanced-damage", damageType: null | string, healInsteadOfDamage: boolean, criticalSuccessRoll: null | string, criticalFailureRoll: null | string, successRoll: null | string, failureRoll: null | string } & { [x: string]: never } | { name: string, allowRollModifiers: boolean, type: "save", saveRollType: null | string, saveTargetDC: null | string } & { [x: string]: never } | { name: string, allowRollModifiers: boolean, type: "text", defaultText: null | string, criticalSuccessText: null | string, criticalFailureText: null | string, successText: null | string, failureText: null | string, extraTags: Array<string> } & { [x: string]: never })> } & { [x: string]: never }>, rollMacros?: Array<{ name: string, macro: string } & { [x: string]: never }> }
