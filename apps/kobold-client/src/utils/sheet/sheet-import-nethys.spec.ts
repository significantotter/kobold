import { BestiaryEntry, CompendiumEntry } from '@kobold/nethys';
import { NethysSheetImporter } from './sheet-import-nethys.js';
import { AbilityEnum, TextRoll } from '@kobold/db';

const forestDragonStats: BestiaryEntry = {
	ac: 36,
	hp: 290,
	id: 'creature-1123',
	npc: false,
	pfs: 'Standard',
	url: '/Monsters.aspx?ID=1123',
	name: 'Adult Forest Dragon',
	size: ['Huge'],
	text: " Adult Forest Dragon Forest dragons oversee the endless growth of nature, protect it from plunder, and reclaim ruins for the wilderness. Some say these dragons jealously hoard nature's bounty for themselves while seeing everyone else who tries to benefit from nature as thieves and poachers. They loathe the progress of technology and civilization, preferring the company of monsters and animals. Forest dragons are their forests in a literal sense. Over time, their hair becomes mossy, their hide toughens like bark, and small insects or animals live within them. Recall Knowledge - Dragon (Arcana): DC 34 Recall Knowledge - Plant (Nature): DC 34 Unspecific Lore : DC 32 Specific Lore : DC 29 Adult Forest Dragon Source Bestiary 3 pg. 75 Perception +25; darkvision, scent (imprecise) 60 feet Languages Common, Draconic, Sylvan Skills Acrobatics +21, Athletics +27, Deception +24, Intimidation +26, Nature +25, Stealth +21, Dragon Lore +24, Survival +23 Str +7 Dex +3 Con +4 Int +3 Wis +5 Cha +4 --- AC 36 Fort +25 Ref +22 Will +27 +1 status to all saves vs. magic HP 290 Immunities paralyzed, poison, sleep Weaknesses fire 10 Countered by Metal If the forest dragon takes damage from a metal item, they lose woodland stride and pass without trace until the end of their next turn. Frightful Presence (aura, emotion, fear, mental) 90 feet, DC 32. Animals, fungi, and plants take a –2 circumstance penalty to the save. Fed by Water Reaction (healing, necromancy, primal) Frequency once per hour; Trigger The forest dragon is targeted with a water spell or effect; Effect The forest dragon gains 35 temporary Hit Points. --- Speed 40 feet, fly 120 feet; woodland stride Melee Single Action jaws +29 (Magical, reach 15 feet), Damage 3d10+13 piercing plus 2d6 poison Melee Single Action claw +29 (Agile, Magical, reach 10 feet), Damage 3d8+13 slashing plus Grab Melee Single Action tail +29 (Magical, reach 25 feet), Damage 3d8+13 bludgeoning plus Grab Primal Innate Spells DC 34 - Cantrips (4th) Know Direction - 4th Entangle, Tree Shape (see forest shape) - Constant (1st) Pass Without Trace (forest terrain only) Breath Weapon Two Actions (Evocation, Primal) The dragon unleashes a swarm of insects that deals 14d6 piercing damage in a 40-foot cone (DC 34 basic Reflex save) before dispersing. A creature that critically fails is stunned 2 from the insects' venom; this is a poison effect. The dragon can't use Breath Weapon again for 1d4 rounds. Coiling Frenzy Two Actions The dragon makes one claw Strike and one tail Strike in either order, each against the same target. If either Strike hits, the dragon automatically Grabs the target. Draconic Momentum The dragon recharges their Breath Weapon whenever they score a critical hit with a Strike. Draining Blight Two Actions (Healing, Necromancy, Negative, Primal) Frequency once per day; Effect The dragon draws moisture from the living creatures surrounding them, using the energy to heal their own wounds. Each living creature in a 30-foot emanation takes 7d10 negative damage (DC 34 basic Fortitude save). Creatures made entirely of water and plant creatures use the outcome one degree of success worse than they rolled. The dragon regains Hit Points equal to half of the highest damage a single creature takes from this effect. In addition, all non-creature plant life in the area withers and dies, eliminating non-magical undergrowth and any resulting difficult terrain, cover, and concealment. Water is also consumed in the same way, typically lowering any standing body of water fully within the area by 1 foot. Forest Shape When casting tree shape , a forest dragon can become a tree of the same size and age as themself. Greater Constrict Single Action 3d8+10 bludgeoning, DC 34 Woodland Stride The forest dragon ignores difficult terrain and greater difficult terrain from non-magical foliage. ",
	type: 'Creature',
	level: 14,
	sense: ' darkvision ,  scent  (imprecise) 60 feet',
	skill: [
		'Acrobatics',
		'Athletics',
		'Deception',
		'Intimidation',
		'Nature',
		'Stealth',
		'Survival',
	],
	speed: { fly: 120, max: 120, land: 40 },
	spell: ['Entangle', 'Tree Shape', 'Know Direction', 'Pass Without Trace'],
	trait: ['Dragon', 'Plant', 'Uncommon', 'CE', 'Huge'],
	hp_raw: '290',
	rarity: 'uncommon',
	source: ['Bestiary 3'],
	vision: 'Darkvision',
	wisdom: 5,
	size_id: [5],
	stealth: '21',
	summary:
		'Forest dragons oversee the endless growth of nature, protect it from plunder, and reclaim ruins for the wilderness. Some say these dragons jealously …',
	category: 'creature',
	charisma: 4,
	immunity: ['paralyzed', 'poison', 'sleep'],
	language: ['Common', 'Draconic', 'Sylvan'],
	markdown:
		'<title level="1" pfs="Standard">[Adult Forest Dragon](/Monsters.aspx?ID=1123)</title>\r\n\r\n<row gap="medium">\r\n\r\n<column gap="medium" flex="1 1 400px">\r\n\r\nForest dragons oversee the endless growth of nature, protect it from plunder, and reclaim ruins for the wilderness. Some say these dragons jealously hoard nature\'s bounty for themselves while seeing everyone else who tries to benefit from nature as thieves and poachers. They loathe the progress of technology and civilization, preferring the company of monsters and animals.\n\n Forest dragons are their forests in a literal sense. Over time, their hair becomes mossy, their hide toughens like bark, and small insects or animals live within them. \r\n\r\n<column gap="tiny">\r\n**[Recall Knowledge - Dragon](/Rules.aspx?ID=563)**\r\n([Arcana](/Skills.aspx?ID=2)): DC 34\r\n\r\n**[Recall Knowledge - Plant](/Rules.aspx?ID=563)**\r\n([Nature](/Skills.aspx?ID=10)): DC 34\r\n\r\n**[Unspecific Lore](/Rules.aspx?ID=563)**: DC 32\r\n\r\n**[Specific Lore](/Rules.aspx?ID=563)**: DC 29\r\n</column>\r\n\r\n</column>\r\n\r\n<column gap="medium">\r\n\r\n</column>\r\n\r\n</row>\r\n\r\n<title level="2" right="Creature 14">[Adult Forest Dragon](/Monsters.aspx?ID=1123)</title>\r\n\r\n<traits>\r\n<trait label="Uncommon" url="/Traits.aspx?ID=159" />\r\n<trait label="CE" url="/Rules.aspx?ID=95" />\r\n<trait label="Huge" />\r\n<trait label="Dragon" url="/Traits.aspx?ID=50" />\r\n<trait label="Plant" url="/Traits.aspx?ID=125" />\r\n</traits>\r\n\r\n<column gap="tiny">\r\n\r\n<row gap="tiny">**Source** [Bestiary 3](/Sources.aspx?ID=66) pg. 75</row>\n\n**Perception** +25; [darkvision](/MonsterAbilities.aspx?ID=12), [scent](/MonsterAbilities.aspx?ID=33) (imprecise) 60 feet\r\n\r\n**Languages**\r\n[Common](/Languages.aspx?ID=1), [Draconic](/Languages.aspx?ID=2), [Sylvan](/Languages.aspx?ID=10)\r\n\r\n**Skills**\r\n[Acrobatics](/Skills.aspx?ID=1) +21, [Athletics](/Skills.aspx?ID=3) +27, [Deception](/Skills.aspx?ID=5) +24, [Intimidation](/Skills.aspx?ID=7) +26, [Nature](/Skills.aspx?ID=10) +25, [Stealth](/Skills.aspx?ID=15) +21, [Survival](/Skills.aspx?ID=16) +23\r\n\r\n<row gap="medium">\r\n**Str** +7\r\n\r\n**Dex** +3\r\n\r\n**Con** +4\r\n\r\n**Int** +3\r\n\r\n**Wis** +5\r\n\r\n**Cha** +4\r\n</row>\n\n</column>\r\n\r\n---\r\n\r\n<column gap="tiny">\r\n\r\n<row gap="medium">\r\n**AC** 36 \r\n\r\n**Fort** +25 \r\n\r\n**Ref** +22 \r\n\r\n**Will** +27 \r\n\r\n+1 status to all saves vs. magic\r\n</row>\r\n\r\n<row gap="medium">\r\n**HP** 290\n\n</row>\r\n\r\n**Immunities**\r\n[paralyzed](/Conditions.aspx?ID=28), [poison](/Traits.aspx?ID=126), [sleep](/Traits.aspx?ID=145)\n\n**Weaknesses**\r\nfire 10\r\n\r\n**Countered by Metal** If the forest dragon takes damage from a metal item, they lose woodland stride and [_pass without trace_](/Spells.aspx?ID=215) until the end of their next turn.<br />**[Frightful Presence](/MonsterAbilities.aspx?ID=17)** ([aura](/Traits.aspx?ID=206), [emotion](/Traits.aspx?ID=60), [fear](/Traits.aspx?ID=68), [mental](/Traits.aspx?ID=106)) 90 feet, DC 32. [Animals](/Traits.aspx?ID=9), [fungi](/Traits.aspx?ID=77), and [plants](/Traits.aspx?ID=125) take a –2 circumstance penalty to the save.<br />**Fed by Water** <actions string="Reaction" /> ([healing](/Traits.aspx?ID=89), [necromancy](/Traits.aspx?ID=117), [primal](/Traits.aspx?ID=134)) **Frequency** once per hour; **Trigger** The forest dragon is targeted with a [water](/Traits.aspx?ID=165) spell or effect; **Effect** The forest dragon gains 35 temporary Hit Points.\r\n\r\n</column>\r\n\r\n---\r\n\r\n<column gap="tiny">\r\n\r\n**Speed** 40 feet, fly 120 feet; woodland stride\r\n\r\n**Melee**\r\n<actions string="Single Action" />\r\njaws +29 ([Magical](/Traits.aspx?ID=103), [reach 15 feet](/Traits.aspx?ID=192)),\r\n**Damage** 3d10+13 piercing plus 2d6 poison\r\n\r\n**Melee**\r\n<actions string="Single Action" />\r\nclaw +29 ([Agile](/Traits.aspx?ID=170), [Magical](/Traits.aspx?ID=103), [reach 10 feet](/Traits.aspx?ID=192)),\r\n**Damage** 3d8+13 slashing plus [Grab](/MonsterAbilities.aspx?ID=18)\r\n\r\n**Melee**\r\n<actions string="Single Action" />\r\ntail +29 ([Magical](/Traits.aspx?ID=103), [reach 25 feet](/Traits.aspx?ID=192)),\r\n**Damage** 3d8+13 bludgeoning plus [Grab](/MonsterAbilities.aspx?ID=18)\r\n\r\n**Primal Innate Spells** DC 34\r\n- **Cantrips (4th)**\r\n[Know Direction](/Spells.aspx?ID=169)\r\n- **4th**\r\n[Entangle](/Spells.aspx?ID=103), [Tree Shape](/Spells.aspx?ID=342) (see forest shape)\r\n- **Constant (1st)**\r\n[Pass Without Trace](/Spells.aspx?ID=215) (forest terrain only)\r\n\r\n**Breath Weapon** <actions string="Two Actions" /> ([Evocation](/Traits.aspx?ID=65), [Primal](/Traits.aspx?ID=134)) The dragon unleashes a swarm of insects that deals 14d6 piercing damage in a 40-foot cone (DC 34 basic Reflex save) before dispersing. A creature that critically fails is [stunned 2](/Conditions.aspx?ID=36) from the insects\' venom; this is a [poison](/Traits.aspx?ID=126) effect. The dragon can\'t use Breath Weapon again for 1d4 rounds.\r\n\r\n**Coiling Frenzy** <actions string="Two Actions" />  The dragon makes one claw Strike and one tail Strike in either order, each against the same target. If either Strike hits, the dragon automatically [Grabs](/MonsterAbilities.aspx?ID=18) the target.\r\n\r\n**Draconic Momentum**   The dragon recharges their Breath Weapon whenever they score a critical hit with a Strike.\r\n\r\n**Draining Blight** <actions string="Two Actions" /> ([Healing](/Traits.aspx?ID=89), [Necromancy](/Traits.aspx?ID=117), [Negative](/Traits.aspx?ID=118), [Primal](/Traits.aspx?ID=134)) **Frequency** once per day; **Effect** The dragon draws moisture from the living creatures surrounding them, using the energy to heal their own wounds. Each living creature in a 30-foot emanation takes 7d10 negative damage (DC 34 [basic](/Rules.aspx?ID=329) Fortitude save). Creatures made entirely of water and [plant](/Traits.aspx?ID=125) creatures use the outcome one degree of success worse than they rolled. The dragon regains Hit Points equal to half of the highest damage a single creature takes from this effect.<br /> In addition, all non-creature plant life in the area withers and dies, eliminating non-magical undergrowth and any resulting difficult terrain, cover, and concealment. Water is also consumed in the same way, typically lowering any standing body of water fully within the area by 1 foot.\r\n\r\n**Forest Shape**   When casting [_tree shape_](/Spells.aspx?ID=342), a forest dragon can become a tree of the same size and age as themself.\r\n\r\n**[Greater Constrict](/MonsterAbilities.aspx?ID=19)** <actions string="Single Action" />  3d8+10 bludgeoning, DC 34\r\n\r\n**Woodland Stride**   The forest dragon ignores difficult terrain and greater difficult terrain from non-magical foliage.\r\n\r\n</column>\n\n<document level="2" id="creature-family-227" />',
	strength: 7,
	weakness: { fire: 10 },
	alignment: 'CE',
	dexterity: 3,
	rarity_id: 2,
	skill_mod: {
		nature: 25,
		stealth: 21,
		survival: 23,
		athletics: 27,
		deception: 24,
		acrobatics: 21,
		intimidation: 26,
	},
	speed_raw: '40 feet, fly 120 feet; woodland stride',
	trait_raw: ['Dragon', 'Plant', 'Uncommon'],
	will_save: 27,
	perception: 25,
	resistance: { fire: 5 },
	source_raw: ['Bestiary 3 pg. 75'],
	reflex_save: 22,
	trait_group: ['Creature Type', 'Rarity'],
	constitution: 4,
	intelligence: 3,
	release_date: '2021-04-07',
	weakest_save: ['ref', 'reflex'],
	weakness_raw: 'fire 10',
	fortitude_save: 25,
	sense_markdown:
		'[darkvision](/MonsterAbilities.aspx?ID=12), [scent](/MonsterAbilities.aspx?ID=33) (imprecise) 60 feet',
	skill_markdown:
		'[Acrobatics](/Skills.aspx?ID=1) +21, [Athletics](/Skills.aspx?ID=3) +27, [Deception](/Skills.aspx?ID=5) +24, [Intimidation](/Skills.aspx?ID=7) +26, [Nature](/Skills.aspx?ID=10) +25, [Stealth](/Skills.aspx?ID=15) +21, [Survival](/Skills.aspx?ID=16) +23',
	speed_markdown: '40 feet, fly 120 feet; woodland stride',
	spell_markdown:
		'[Entangle](/Spells.aspx?ID=103), [Know Direction](/Spells.aspx?ID=169), [Pass Without Trace](/Spells.aspx?ID=215), [Tree Shape](/Spells.aspx?ID=342)',
	strongest_save: ['will'],
	trait_markdown:
		'[Dragon](/Traits.aspx?ID=50), [Plant](/Traits.aspx?ID=125), [Uncommon](/Traits.aspx?ID=159)',
	creature_family: 'Dragon, Forest',
	search_markdown:
		'<traits>\r\n<trait label="Uncommon" url="/Traits.aspx?ID=159" />\r\n<trait label="CE" url="/Rules.aspx?ID=95" />\r\n<trait label="Huge" />\r\n<trait label="Dragon" url="/Traits.aspx?ID=50" />\r\n<trait label="Plant" url="/Traits.aspx?ID=125" />\r\n</traits>\r\n\r\n<additional-info>\r\n<row gap="tiny">**Source** [Bestiary 3](/Sources.aspx?ID=66) pg. 75</row>\r\n\r\n**Creature Family** [Dragon, Forest](/MonsterFamilies.aspx?ID=227)\r\n\r\n<row gap="medium">\r\n**HP** 290\r\n\r\n**AC** 36\r\n\r\n**Fort** +25\r\n\r\n**Ref** +22\r\n\r\n**Will** +27\r\n\r\n**Perception** +25\r\n</row>\r\n</additional-info>\r\n\r\n---\r\n\r\n<summary>\r\nForest dragons oversee the endless growth of nature, protect it from plunder, and reclaim ruins for the wilderness. Some say these dragons jealously …\r\n</summary>',
	source_category: 'Rulebooks',
	source_markdown: '<row gap="tiny">[Bestiary 3](/Sources.aspx?ID=66) pg. 75</row>',
	creature_ability: [
		'Countered by Metal',
		'Frightful Presence',
		'Fed by Water',
		'Breath Weapon',
		'Coiling Frenzy',
		'Draconic Momentum',
		'Draining Blight',
		'Forest Shape',
		'Greater Constrict',
		'Woodland Stride',
	],
	summary_markdown:
		'Forest dragons oversee the endless growth of nature, protect it from plunder, and reclaim ruins for the wilderness. Some say these dragons jealously …',
	immunity_markdown:
		'[paralyzed](/Conditions.aspx?ID=28), [poison](/Traits.aspx?ID=126), [sleep](/Traits.aspx?ID=145)',
	language_markdown:
		'[Common](/Languages.aspx?ID=1), [Draconic](/Languages.aspx?ID=2), [Sylvan](/Languages.aspx?ID=10)',
	weakness_markdown: 'fire 10',
	exclude_from_search: false,
	creature_family_markdown: '[Dragon, Forest](/MonsterFamilies.aspx?ID=227)',
};
const forestDragonFamilyEntry: CompendiumEntry = {
	id: 'creature-family-227',
	url: '/MonsterFamilies.aspx?ID=227',
	name: 'Dragon, Forest',
	text: " Dragon, Forest Source Bestiary 3 pg. 74 Forest dragons oversee the endless growth of nature, protect it from plunder, and reclaim ruins for the wilderness. Some say these dragons jealously hoard nature's bounty for themselves while seeing everyone else who tries to benefit from nature as thieves and poachers. They loathe the progress of technology and civilization, preferring the company of monsters and animals. Forest dragons are their forests in a literal sense. Over time, their hair becomes mossy, their hide toughens like bark, and small insects or animals live within them. Members Adult Forest Dragon (Creature 14), Ancient Forest Dragon (Creature 19), Young Forest Dragon (Creature 10) Children of the Green Spears A great ancient forest dragon used to live in the Vale of Green Spears, a massive bamboo forest at the center of the Tengu nation Kwanlai. The dragon's last nest of eggs survived her death, and the young dragons hatched from this clutch now fight viciously for control over their late mother's territory. Forest Dragon Spellcasters Forest dragon spellcasters tend to cast the following spells. Young Forest Dragon Primal Prepared Spells DC 29, attack +22; 4th gaseous form , hallucinatory terrain , solid fog ; 3rd animal vision , stinking cloud , wall of thorns ; 2nd animal messenger , darkness , water breathing ; 1st create water , goblin pox , pest form ; Cantrips (4th) acid splash , detect magic , guidance , read aura , tanglefoot ; Rituals DC 29; plant growth Adult Forest Dragon Primal Prepared Spells DC 34, attack +28; As young forest dragon, plus 6th baleful polymorph , purple worm sting , tangling creepers ; 5th cloudkill , moon frenzy , tree stride ; Cantrips (6th) acid splash , detect magic , guidance , read aura , tanglefoot ; Rituals DC 34; commune with nature Ancient Forest Dragon Primal Prepared Spells DC 41, attack +35; As adult forest dragon, plus 9th implosion , nature's enmity ; 8th horrid wilting , polar ray , punishing winds ; 7th eclipse burst , prismatic spray , true target ; Cantrips (9th) acid splash , detect magic , guidance , read aura , tanglefoot Dragon, Imperial Related Families Dragon, Sea, Dragon, Sky, Dragon, Sovereign, Dragon, Underworld",
	type: 'Creature Family',
	image: ['/Images/Monsters/DragonImperial_Forest.png'],
	speed: {},
	rarity: 'common',
	source: ['Bestiary 3'],
	summary:
		'Forest dragons oversee the endless growth of nature, protect it from plunder, and reclaim ruins for the wilderness. Some say these dragons jealously …',
	category: 'creature-family',
	markdown:
		'<title level="1" right="Creature Family">[Dragon, Forest](/MonsterFamilies.aspx?ID=227)</title>\r\n\r\n<row gap="tiny">**Source** [Bestiary 3](/Sources.aspx?ID=66) pg. 74</row>\n\nForest dragons oversee the endless growth of nature, protect it from plunder, and reclaim ruins for the wilderness. Some say these dragons jealously hoard nature\'s bounty for themselves while seeing everyone else who tries to benefit from nature as thieves and poachers. They loathe the progress of technology and civilization, preferring the company of monsters and animals.\n\n Forest dragons are their forests in a literal sense. Over time, their hair becomes mossy, their hide toughens like bark, and small insects or animals live within them. \r\n\r\n<title level="2">Members</title>\r\n[Adult Forest Dragon](/Monsters.aspx?ID=1123) (Creature 14), [Ancient Forest Dragon](/Monsters.aspx?ID=1124) (Creature 19), [Young Forest Dragon](/Monsters.aspx?ID=1122) (Creature 10)\n\n<aside>\r\n<title level="2" noclass="true" icon="/images/Icons/Sidebar_4_RelatedCreatures.png">Children of the Green Spears</title>\r\n\r\nA great ancient forest dragon used to live in the Vale of Green Spears, a massive bamboo forest at the center of the Tengu nation Kwanlai. The dragon\'s last nest of eggs survived her death, and the young dragons hatched from this clutch now fight viciously for control over their late mother\'s territory.\r\n</aside>\r\n\r\n<aside>\r\n<title level="2" noclass="true" icon="">Forest Dragon Spellcasters</title>\r\n\r\nForest dragon spellcasters tend to cast the following spells. \n\n<title level="2" right="">Young Forest Dragon</title> **Primal Prepared Spells** DC 29, attack +22; **4th** [_gaseous form_](/Spells.aspx?ID=129), [_hallucinatory terrain_](/Spells.aspx?ID=145), [_solid fog_](/Spells.aspx?ID=290); **3rd** [_animal vision_](/Spells.aspx?ID=12), [_stinking cloud_](/Spells.aspx?ID=309), [_wall of thorns_](/Spells.aspx?ID=366); **2nd** [_animal messenger_](/Spells.aspx?ID=11), [_darkness_](/Spells.aspx?ID=59), [_water breathing_](/Spells.aspx?ID=370); **1st** [_create water_](/Spells.aspx?ID=53), [_goblin pox_](/Spells.aspx?ID=139), [_pest form_](/Spells.aspx?ID=217); **Cantrips (4th)** [_acid splash_](/Spells.aspx?ID=3), [_detect magic_](/Spells.aspx?ID=66), [_guidance_](/Spells.aspx?ID=142), [_read aura_](/Spells.aspx?ID=246), [_tanglefoot_](/Spells.aspx?ID=330); **Rituals** DC 29; [plant growth](/Rituals.aspx?ID=18) \n\n<title level="2" right="">Adult Forest Dragon</title> **Primal Prepared Spells** DC 34, attack +28; As young forest dragon, plus **6th** [_baleful polymorph_](/Spells.aspx?ID=17), [_purple worm sting_](/Spells.aspx?ID=242), [_tangling creepers_](/Spells.aspx?ID=331); **5th** [_cloudkill_](/Spells.aspx?ID=42), [_moon frenzy_](/Spells.aspx?ID=203), [_tree stride_](/Spells.aspx?ID=343); **Cantrips (6th)** [_acid splash_](/Spells.aspx?ID=3), [_detect magic_](/Spells.aspx?ID=66), [_guidance_](/Spells.aspx?ID=142), [_read aura_](/Spells.aspx?ID=246), [_tanglefoot_](/Spells.aspx?ID=330); **Rituals** DC 34; [commune with nature](/Rituals.aspx?ID=7) \n\n<title level="2" right="">Ancient Forest Dragon</title> **Primal Prepared Spells** DC 41, attack +35; As adult forest dragon, plus **9th** [_implosion_](/Spells.aspx?ID=162), [_nature\'s enmity_](/Spells.aspx?ID=205); **8th** [_horrid wilting_](/Spells.aspx?ID=152), [_polar ray_](/Spells.aspx?ID=224), [_punishing winds_](/Spells.aspx?ID=240); **7th** [_eclipse burst_](/Spells.aspx?ID=96), [_prismatic spray_](/Spells.aspx?ID=233), [_true target_](/Spells.aspx?ID=346); **Cantrips (9th)** [_acid splash_](/Spells.aspx?ID=3), [_detect magic_](/Spells.aspx?ID=66), [_guidance_](/Spells.aspx?ID=142), [_read aura_](/Spells.aspx?ID=246), [_tanglefoot_](/Spells.aspx?ID=330)\r\n</aside>\r\n\r\n<title level="2" right="Creature Family Group">Dragon, Imperial</title>\r\n\r\n**Related Families**\r\n[Dragon, Sea](/MonsterFamilies.aspx?ID=228), [Dragon, Sky](/MonsterFamilies.aspx?ID=229), [Dragon, Sovereign](/MonsterFamilies.aspx?ID=230), [Dragon, Underworld](/MonsterFamilies.aspx?ID=231)',
	weakness: {},
	rarity_id: 1,
	skill_mod: {},
	resistance: {},
	source_raw: ['Bestiary 3 pg. 74'],
	release_date: '2021-04-07',
	creature_family: 'Dragon, Forest',
	search_markdown:
		'<additional-info>\r\n<row gap="tiny">**Source** [Bestiary 3](/Sources.aspx?ID=66) pg. 74</row>\r\n</additional-info>\r\n\r\n---\r\n\r\n<summary>\r\nForest dragons oversee the endless growth of nature, protect it from plunder, and reclaim ruins for the wilderness. Some say these dragons jealously …\r\n</summary>',
	source_category: 'Rulebooks',
	source_markdown: '<row gap="tiny">[Bestiary 3](/Sources.aspx?ID=66) pg. 74</row>',
	summary_markdown:
		'Forest dragons oversee the endless growth of nature, protect it from plunder, and reclaim ruins for the wilderness. Some say these dragons jealously …',
	exclude_from_search: false,
	creature_family_markdown: 'Dragon, Forest',
};
class TestNethysSheetImporter extends NethysSheetImporter {
	constructor(
		stats: BestiaryEntry,
		options: {
			creatureFamilyEntry?: CompendiumEntry;
			template?: string;
			customName?: string;
			emojiConverter?: (emoji: string) => string;
		}
	) {
		super(stats, options);
	}
	public applyDetails() {
		super.applyDetails();
	}
	public applyBaseStats() {
		super.applyBaseStats();
	}
	public applySkills() {
		super.applySkills();
	}
	public applyLores() {
		super.applyLores();
	}
	public applyCounters() {
		super.applyCounters();
	}
	public applySpellcastingStats() {
		super.applySpellcastingStats();
	}
	public async applyAttacks() {
		await super.applyAttacks();
	}
	public async applyCreatureActions() {
		await super.applyCreatureActions();
	}
}

describe('sheet-import-nethys', () => {
	let importer: TestNethysSheetImporter = new TestNethysSheetImporter(forestDragonStats, {
		creatureFamilyEntry: forestDragonFamilyEntry,
	});
	beforeEach(() => {
		importer = new TestNethysSheetImporter(forestDragonStats, {
			creatureFamilyEntry: forestDragonFamilyEntry,
		});
	});
	test('applyDetails()', () => {
		test('Should apply the details of the creature onto the sheet', async () => {
			importer.applyDetails();
			const sheetInfo = importer.sheet.info;
			const sheetInfoList = importer.sheet.infoLists;

			expect(sheetInfo.description).toBe(
				'Forest dragons oversee the endless growth of nature, protect it from plunder, and reclaim ruins for the wilderness. Some say these dragons jealously …'
			);
			expect(sheetInfo.url).toBe(`https://2e.aonprd.com/Monsters.aspx?ID=1123`);
			expect(sheetInfo.alignment).toBe('CE');
			expect(sheetInfo.imageURL).toBe(
				`https://2e.aonprd.com/Images/Monsters/DragonImperial_Forest.png`
			);
			expect(sheetInfo.size).toBe('Huge');
			expect(sheetInfoList.traits).toStrictEqual([
				'Dragon',
				'Plant',
				'Uncommon',
				'CE',
				'Huge',
			]);
			expect(sheetInfoList.senses).toStrictEqual(['darkvision', 'scent (imprecise) 60 feet']);
			expect(sheetInfoList.languages).toStrictEqual(['Common', 'Draconic', 'Sylvan']);
		});
	});
	test('applyBaseStats()', () => {
		importer.applyBaseStats();
		const sheetStats = importer.sheet.stats;
		const sheetIntProperties = importer.sheet.intProperties;

		expect(sheetIntProperties.strength).toBe(7);
		expect(sheetIntProperties.dexterity).toBe(3);
		expect(sheetIntProperties.constitution).toBe(4);
		expect(sheetIntProperties.intelligence).toBe(3);
		expect(sheetIntProperties.wisdom).toBe(5);
		expect(sheetIntProperties.charisma).toBe(4);
		expect(sheetIntProperties.walkSpeed).toBe(40);
		expect(sheetIntProperties.flySpeed).toBe(120);
		expect(sheetIntProperties.swimSpeed).toBe(null);
		expect(sheetIntProperties.climbSpeed).toBe(null);
		expect(sheetIntProperties.burrowSpeed).toBe(null);
		expect(sheetStats.perception).toMatchObject({ bonus: 25, dc: 35 });
		expect(sheetIntProperties.ac).toBe(36);
		expect(sheetStats.fortitude).toMatchObject({ bonus: 25, dc: 35 });
		expect(sheetStats.reflex).toMatchObject({ bonus: 22, dc: 32 });
		expect(sheetStats.will).toMatchObject({ bonus: 27, dc: 37 });
		expect(importer.sheet.infoLists.immunities).toStrictEqual(['paralyzed', 'poison', 'sleep']);
		expect(importer.sheet.weaknessesResistances.weaknesses).toStrictEqual([
			{ type: 'fire', amount: 10 },
		]);
		expect(importer.sheet.weaknessesResistances.resistances).toStrictEqual([
			{ type: 'fire', amount: 5 },
		]);
	});
	test('applySkills()', () => {
		importer.applySkills();
		const sheetStats = importer.sheet.stats;

		expect(sheetStats.nature).toMatchObject({ bonus: 25, dc: 35 });
		expect(sheetStats.stealth).toMatchObject({ bonus: 21, dc: 31 });
		expect(sheetStats.survival).toMatchObject({ bonus: 23, dc: 33 });
		expect(sheetStats.athletics).toMatchObject({ bonus: 27, dc: 37 });
		expect(sheetStats.deception).toMatchObject({ bonus: 24, dc: 34 });
		expect(sheetStats.acrobatics).toMatchObject({ bonus: 21, dc: 31 });
		expect(sheetStats.intimidation).toMatchObject({ bonus: 26, dc: 36 });
		expect(sheetStats.diplomacy).toMatchObject({ bonus: null, dc: null });
	});
	test('applyLores()', () => {
		importer.applyLores();

		expect(importer.sheet.additionalSkills).toStrictEqual([
			{
				name: 'Dragon Lore',
				proficiency: null,
				dc: 34,
				bonus: 24,
				ability: AbilityEnum.intelligence,
				note: null,
			},
		]);
	});
	test('applyCounters()', () => {
		importer.applyCounters();
		const sheetBaseCounters = importer.sheet.baseCounters;
		expect(sheetBaseCounters.hp.current).toBe(290);
		expect(sheetBaseCounters.hp.max).toBe(290);
		expect(sheetBaseCounters.focusPoints.current).toBe(0);
	});
	test('applySpellcastingStats()', () => {
		importer.applySpellcastingStats();
		const sheetStats = importer.sheet.stats;

		expect(sheetStats.primal.bonus).toBe(24);
		expect(sheetStats.primal.dc).toBe(34);
		expect(sheetStats.arcane.bonus).toBe(null);
		expect(sheetStats.arcane.dc).toBe(null);
		expect(sheetStats.divine.bonus).toBe(null);
		expect(sheetStats.divine.dc).toBe(null);
		expect(sheetStats.occult.bonus).toBe(null);
		expect(sheetStats.occult.dc).toBe(null);
	});
	test('applyAttacks()', () => {});
	test('applyCreatureActions()', async () => {
		await importer.applyCreatureActions();
		const counteredByMetal = importer.actions.find(a => a.name === 'Countered by Metal');
		const frightfulPresence = importer.actions.find(a => a.name === 'Frightful Presence');
		const fedByWater = importer.actions.find(a => a.name === 'Fed by Water');
		const breathWeapon = importer.actions.find(a => a.name === 'Breath Weapon');
		const coilingFrenzy = importer.actions.find(a => a.name === 'Coiling Frenzy');
		const draconicMomentum = importer.actions.find(a => a.name === 'Draconic Momentum');
		const drainingBlight = importer.actions.find(a => a.name === 'Draining Blight');
		const forestShape = importer.actions.find(a => a.name === 'Forest Shape');
		const greaterConstrict = importer.actions.find(a => a.name === 'Greater Constrict');
		const woodlandStride = importer.actions.find(a => a.name === 'Woodland Stride');

		expect(counteredByMetal?.actionCost).toBe('none');
		expect(frightfulPresence?.actionCost).toBe('none');
		expect(fedByWater?.actionCost).toBe('reaction');
		expect(breathWeapon?.actionCost).toBe('twoActions');
		expect(coilingFrenzy?.actionCost).toBe('twoActions');
		expect(draconicMomentum?.actionCost).toBe('none');
		expect(drainingBlight?.actionCost).toBe('twoActions');
		expect(forestShape?.actionCost).toBe('none');
		expect(greaterConstrict?.actionCost).toBe('oneAction');
		expect(woodlandStride?.actionCost).toBe('none');

		expect((counteredByMetal?.rolls[0] as TextRoll).defaultText).toBe(
			'If the forest dragon takes damage from a metal item, they lose woodland stride and [*pass without trace*](<https://2e.aonprd.com/Spells.aspx?ID=215>) until the end of their next turn.'
		);
		expect((frightfulPresence?.rolls[0] as TextRoll).defaultText).toBe(
			'([aura](<https://2e.aonprd.com/Traits.aspx?ID=206>), [emotion](<https://2e.aonprd.com/Traits.aspx?ID=60>), [fear](<https://2e.aonprd.com/Traits.aspx?ID=68>), [mental](<https://2e.aonprd.com/Traits.aspx?ID=106>)) 90 feet, DC 32. [Animals](<https://2e.aonprd.com/Traits.aspx?ID=9>), [fungi](<https://2e.aonprd.com/Traits.aspx?ID=77>), and [plants](<https://2e.aonprd.com/Traits.aspx?ID=125>) take a –2 circumstance penalty to the save.'
		);
		expect((fedByWater?.rolls[0] as TextRoll).defaultText).toBe(
			'([healing](<https://2e.aonprd.com/Traits.aspx?ID=89>), [necromancy](<https://2e.aonprd.com/Traits.aspx?ID=117>), [primal](<https://2e.aonprd.com/Traits.aspx?ID=134>)) **Frequency** once per hour; **Trigger** The forest dragon is targeted with a [water](<https://2e.aonprd.com/Traits.aspx?ID=165>) spell or effect; **Effect** The forest dragon gains 35 temporary Hit Points.'
		);
		expect((breathWeapon?.rolls[0] as TextRoll).defaultText).toBe(
			"([Evocation](<https://2e.aonprd.com/Traits.aspx?ID=65>), [Primal](<https://2e.aonprd.com/Traits.aspx?ID=134>)) The dragon unleashes a swarm of insects that deals 14d6 piercing damage in a 40-foot cone (DC 34 basic Reflex save) before dispersing. A creature that critically fails is [stunned 2](<https://2e.aonprd.com/Conditions.aspx?ID=36>) from the insects' venom; this is a [poison](<https://2e.aonprd.com/Traits.aspx?ID=126>) effect. The dragon can't use Breath Weapon again for 1d4 rounds."
		);
		expect((coilingFrenzy?.rolls[0] as TextRoll).defaultText).toBe(
			'The dragon makes one claw Strike and one tail Strike in either order, each against the same target. If either Strike hits, the dragon automatically [Grabs](<https://2e.aonprd.com/MonsterAbilities.aspx?ID=18>) the target.'
		);
		expect((draconicMomentum?.rolls[0] as TextRoll).defaultText).toBe(
			'The dragon recharges their Breath Weapon whenever they score a critical hit with a Strike.'
		);
		expect((drainingBlight?.rolls[0] as TextRoll).defaultText).toBe(
			'([Healing](<https://2e.aonprd.com/Traits.aspx?ID=89>), [Necromancy](<https://2e.aonprd.com/Traits.aspx?ID=117>), [Negative](<https://2e.aonprd.com/Traits.aspx?ID=118>), [Primal](<https://2e.aonprd.com/Traits.aspx?ID=134>)) **Frequency** once per day; **Effect** The dragon draws moisture from the living creatures surrounding them, using the energy to heal their own wounds. Each living creature in a 30-foot emanation takes 7d10 negative damage (DC 34 [basic](<https://2e.aonprd.com/Rules.aspx?ID=329>) Fortitude save). Creatures made entirely of water and [plant](<https://2e.aonprd.com/Traits.aspx?ID=125>) creatures use the outcome one degree of success worse than they rolled. The dragon regains Hit Points equal to half of the highest damage a single creature takes from this effect.\n' +
				'In addition, all non-creature plant life in the area withers and dies, eliminating non-magical undergrowth and any resulting difficult terrain, cover, and concealment. Water is also consumed in the same way, typically lowering any standing body of water fully within the area by 1 foot.'
		);
		expect((forestShape?.rolls[0] as TextRoll).defaultText).toBe(
			'When casting [*tree shape*](<https://2e.aonprd.com/Spells.aspx?ID=342>), a forest dragon can become a tree of the same size and age as themself.'
		);
		expect((greaterConstrict?.rolls[0] as TextRoll).defaultText).toBe(
			'3d8+10 bludgeoning, DC 34'
		);
		expect((woodlandStride?.rolls[0] as TextRoll).defaultText).toBe(
			'The forest dragon ignores difficult terrain and greater difficult terrain from non-magical foliage.'
		);
	});
});
