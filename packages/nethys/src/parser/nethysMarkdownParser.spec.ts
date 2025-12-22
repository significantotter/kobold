import { nethysMarkdownToDiscordMarkdown, nethysMarkdownToHtml } from './nethysMarkdownParser.js';

describe('nethysMarkdownToHtml', () => {
	it('should process simple markdown', async () => {
		const markdown = `# Hello World
And then *italic text* and **bold text**.`;
		const result = await nethysMarkdownToHtml(markdown);
		expect(result).toBe(
			`<h1>Hello World</h1>
<p>And then <em>italic text</em> and <strong>bold text</strong>.</p>`
		);
	});
	it('should process standard html tags markdown', async () => {
		const markdown = `# Hello World
# List
<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>
And then *italic text* and **bold text**.`;
		const result = await nethysMarkdownToHtml(markdown);
		expect(result).toBe(
			`<h1>Hello World</h1>
<h1>List</h1>
<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>
And then *italic text* and **bold text**.`
		);
	});
	it('should transform custom html tags from the markdown', async () => {
		const markdown = `# Hello World
# List
<ul><action string="single action" />Item 1<action string="two actions">Item 2</action><action />Item 3</ul>
And then *italic text* and **bold text**.`;
		const result = await nethysMarkdownToHtml(markdown);
		expect(result).toBe(
			`<h1>Hello World</h1>
<h1>List</h1>
<ul> [one-action] Item 1 [two-actions] Item 2 Item 3</ul>
And then *italic text* and **bold text**.`
		);
	});
	it('should transform actual nethys markdown', async () => {
		const nethysMarkdown = `
<title
    level="1"
    right="Item 0+"
    pfs=""
>
[Sisterstone](/Equipment.aspx?ID=1720)
</title>

<spoilers>May contain spoilers from Blood Lords</spoilers>

<traits>
<trait label="Rare" url="/Traits.aspx?ID=137" />
<trait label="Precious" url="/Traits.aspx?ID=131" />
</traits>

<column gap="tiny">

<row gap="tiny">**Source** [Pathfinder #183: Field of Maidens](/Sources.aspx?ID=145) pg. 79</row>

<row gap="medium">

</row>

<row gap="medium">

 

 

 
</row>

</column>

---

Sisterstone is a term used for two closely related ores infused by the spiritual runoff in the Field of Maidens, dusk sisterstone and scarlet sisterstone. They have the same physical properties except for color—dusk sisterstone is a pale orange while scarlet sisterstone is orange-red. When near an object made of the other type of sisterstone, they both begin exuding spiritual energy that repels [undead](/Traits.aspx?ID=160). 

When an object made of dusk sisterstone is within 15 feet of an object made of scarlet sisterstone of the same grade, they create a reciprocal field. Any undead creature adjacent to one of the objects when the field is formed, or who moves adjacent to one while the field is active, becomes [enfeebled 1](/Conditions.aspx?ID=13) unless it succeeds at a DC 15 Fortitude save. This lasts until the undead creature is no longer adjacent to either of the items or until the field's removed (typically by the objects ceasing to be within 15 feet of one another). The DC increases to 22 if both items are standard grade or better, and to 33 if they're both high grade. Unworked chunks and ingots don't create a reciprocal field. A single object can't be made of both types of sisterstone.

## Sisterstone Items
<row gap="tiny">
<table> <tr><td>**Sisterstone Items**</td><td>**Hardness**</td><td>**HP**</td><td>**BT**</td></tr> <tr><td colspan="4">**Thin Items**</td></tr> <tr><td>Low-grade</td><td>6</td><td>18</td><td>9</td></tr> <tr><td>Standard-grade</td><td>8</td><td>24</td><td>12</td></tr> <tr><td>High-grade</td><td>10</td><td>36</td><td>18</td></tr> <tr><td colspan="4">**Items**</td></tr> <tr><td>Low-grade</td><td>10</td><td>28</td><td>14</td></tr> <tr><td>Standard-grade</td><td>12</td><td>40</td><td>20</td></tr> <tr><td>High-grade</td><td>15</td><td>54</td><td>27</td></tr> <tr><td colspan="4">**Structures**</td></tr> <tr><td>Low-grade</td><td>20</td><td>56</td><td>28</td></tr> <tr><td>Standard-grade</td><td>24</td><td>80</td><td>40</td></tr> <tr><td>High-grade</td><td>30</td><td>108</td><td>54</td></tr></table></row>

<title level="3">Material Uses</title>

<column gap="tiny">
[Sisterstone Armor](/Equipment.aspx?ID=1721)

[Sisterstone Weapon](/Equipment.aspx?ID=1722)
</column>

<title
level="2"
right="Item 0"
pfs=""
>
Sisterstone Chunk
</title>

<traits>

</traits>

<column gap="tiny">

<row gap="tiny">**Source** [Pathfinder #183: Field of Maidens](/Sources.aspx?ID=145) pg. 79</row>

**Price** 20 gp

<row gap="medium">

**Bulk** L

</row>

</column>

<title
level="2"
right="Item 0"
pfs=""
>
Sisterstone Ingot
</title>

<traits>

</traits>

<column gap="tiny">

<row gap="tiny">**Source** [Pathfinder #183: Field of Maidens](/Sources.aspx?ID=145) pg. 79</row>

**Price** 200 gp

<row gap="medium">

**Bulk** 1

</row>

</column>

<title
level="2"
right="Item 3"
pfs=""
>
Sisterstone Object (Low-Grade)
</title>

<traits>

</traits>

<column gap="tiny">

<row gap="tiny">**Source** [Pathfinder #183: Field of Maidens](/Sources.aspx?ID=145) pg. 79</row>

**Price** 30 gp (per Bulk)

<row gap="medium">

</row>

</column>

<title
level="2"
right="Item 8"
pfs=""
>
Sisterstone Object (Standard-Grade)
</title>

<traits>

</traits>

<column gap="tiny">

<row gap="tiny">**Source** [Pathfinder #183: Field of Maidens](/Sources.aspx?ID=145) pg. 79</row>

**Price** 350 gp (per Bulk)

<row gap="medium">

</row>

</column>

<title
level="2"
right="Item 16"
pfs=""
>
Sisterstone Object (High-Grade)
</title>

<traits>

</traits>

<column gap="tiny">

<row gap="tiny">**Source** [Pathfinder #183: Field of Maidens](/Sources.aspx?ID=145) pg. 79</row>

**Price** 5,500 gp (per Bulk)

<row gap="medium">

</row>

</column>`;

		const result = await nethysMarkdownToHtml(nethysMarkdown);
		expect(result).toBe(`<h1 level="1" right="Item 0+" pfs="">
[Sisterstone](/Equipment.aspx?ID=1720)
</h1>
<p><div>May contain spoilers from Blood Lords</div></p>
<div class="row traits wrap">
<span label="Rare" url="/Traits.aspx?ID=137"><a href="/Traits.aspx?ID=137">Rare</a></span></div>
<div class="column gap-tiny" style="">
<p><div class="row wrap gap-tiny"><strong>Source</strong> <a href="/Sources.aspx?ID=145">Pathfinder #183: Field of Maidens</a> pg. 79</div></p>
<div class="row wrap gap-medium">
</div>
<div class="row wrap gap-medium">
</div>
</div>
<hr>
<p>Sisterstone is a term used for two closely related ores infused by the spiritual runoff in the Field of Maidens, dusk sisterstone and scarlet sisterstone. They have the same physical properties except for color—dusk sisterstone is a pale orange while scarlet sisterstone is orange-red. When near an object made of the other type of sisterstone, they both begin exuding spiritual energy that repels <a href="/Traits.aspx?ID=160">undead</a>.</p>
<p>When an object made of dusk sisterstone is within 15 feet of an object made of scarlet sisterstone of the same grade, they create a reciprocal field. Any undead creature adjacent to one of the objects when the field is formed, or who moves adjacent to one while the field is active, becomes <a href="/Conditions.aspx?ID=13">enfeebled 1</a> unless it succeeds at a DC 15 Fortitude save. This lasts until the undead creature is no longer adjacent to either of the items or until the field's removed (typically by the objects ceasing to be within 15 feet of one another). The DC increases to 22 if both items are standard grade or better, and to 33 if they're both high grade. Unworked chunks and ingots don't create a reciprocal field. A single object can't be made of both types of sisterstone.</p>
<h2>Sisterstone Items</h2>
<div class="row wrap gap-tiny">
<table> <tbody><tr><td>**Sisterstone Items**</td><td>**Hardness**</td><td>**HP**</td><td>**BT**</td></tr> <tr><td colspan="4">**Thin Items**</td></tr> <tr><td>Low-grade</td><td>6</td><td>18</td><td>9</td></tr> <tr><td>Standard-grade</td><td>8</td><td>24</td><td>12</td></tr> <tr><td>High-grade</td><td>10</td><td>36</td><td>18</td></tr> <tr><td colspan="4">**Items**</td></tr> <tr><td>Low-grade</td><td>10</td><td>28</td><td>14</td></tr> <tr><td>Standard-grade</td><td>12</td><td>40</td><td>20</td></tr> <tr><td>High-grade</td><td>15</td><td>54</td><td>27</td></tr> <tr><td colspan="4">**Structures**</td></tr> <tr><td>Low-grade</td><td>20</td><td>56</td><td>28</td></tr> <tr><td>Standard-grade</td><td>24</td><td>80</td><td>40</td></tr> <tr><td>High-grade</td><td>30</td><td>108</td><td>54</td></tr></tbody></table></div>
<h1 level="3">Material Uses</h1>
<div class="column gap-tiny" style="">
[Sisterstone Armor](/Equipment.aspx?ID=1721)
<p><a href="/Equipment.aspx?ID=1722">Sisterstone Weapon</a>
</p>
<h1 level="2" right="Item 0" pfs="">
Sisterstone Chunk
</h1>
<div class="row traits wrap">
</div>
<div class="column gap-tiny" style="">
<p><div class="row wrap gap-tiny"><strong>Source</strong> <a href="/Sources.aspx?ID=145">Pathfinder #183: Field of Maidens</a> pg. 79</div></p>
<p><strong>Price</strong> 20 gp</p>
<div class="row wrap gap-medium">
<p><strong>Bulk</strong> L</p>
</div>
</div>
<h1 level="2" right="Item 0" pfs="">
Sisterstone Ingot
</h1>
<div class="row traits wrap">
</div>
<div class="column gap-tiny" style="">
<p><div class="row wrap gap-tiny"><strong>Source</strong> <a href="/Sources.aspx?ID=145">Pathfinder #183: Field of Maidens</a> pg. 79</div></p>
<p><strong>Price</strong> 200 gp</p>
<div class="row wrap gap-medium">
<p><strong>Bulk</strong> 1</p>
</div>
</div>
<h1 level="2" right="Item 3" pfs="">
Sisterstone Object (Low-Grade)
</h1>
<div class="row traits wrap">
</div>
<div class="column gap-tiny" style="">
<p><div class="row wrap gap-tiny"><strong>Source</strong> <a href="/Sources.aspx?ID=145">Pathfinder #183: Field of Maidens</a> pg. 79</div></p>
<p><strong>Price</strong> 30 gp (per Bulk)</p>
<div class="row wrap gap-medium">
</div>
</div>
<h1 level="2" right="Item 8" pfs="">
Sisterstone Object (Standard-Grade)
</h1>
<div class="row traits wrap">
</div>
<div class="column gap-tiny" style="">
<p><div class="row wrap gap-tiny"><strong>Source</strong> <a href="/Sources.aspx?ID=145">Pathfinder #183: Field of Maidens</a> pg. 79</div></p>
<p><strong>Price</strong> 350 gp (per Bulk)</p>
<div class="row wrap gap-medium">
</div>
</div>
<h1 level="2" right="Item 16" pfs="">
Sisterstone Object (High-Grade)
</h1>
<div class="row traits wrap">
</div>
<div class="column gap-tiny" style="">
<p><div class="row wrap gap-tiny"><strong>Source</strong> <a href="/Sources.aspx?ID=145">Pathfinder #183: Field of Maidens</a> pg. 79</div></p>
<p><strong>Price</strong> 5,500 gp (per Bulk)</p>
<div class="row wrap gap-medium">
</div>
</div></div>`);
	});
});
describe.only('nethysMarkdownToDiscordMarkdown', () => {
	it('should process simple markdown', async () => {
		const markdown = `# Hello World
And then *italic text* and **bold text**.`;
		const result = await nethysMarkdownToDiscordMarkdown(markdown);
		expect(result).toBe(
			`# Hello World
And then *italic text* and **bold text**.`
		);
	});

	it('should process standard html tags markdown', async () => {
		const markdown = `# Hello World
# List
<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>
And then *italic text* and **bold text**.`;
		const result = await nethysMarkdownToDiscordMarkdown(markdown);
		expect(result).toBe(
			`# Hello World
# List
* Item 1
* Item 2
* Item 3
And then *italic text* and **bold text**.`
		);
	});
	it('should transform custom html tags from the markdown', async () => {
		const markdown = `# Hello World
# List
<ul><action string="single action" />Item 1<action string="two actions">Item 2 </action><action />Item 3</ul>
And then *italic text* and **bold text**.`;
		const result = await nethysMarkdownToDiscordMarkdown(markdown);
		expect(result).toBe(
			`# Hello World
# List
* [one-action]Item 1[two-actions]Item 2 Item 3
And then *italic text* and **bold text**.`
		);
	});
	it('should transform actual nethys markdown', async () => {
		const nethysMarkdown = `<title level=\"1\" pfs=\"Standard\">[Kangaroo](/Monsters.aspx?ID=1205)</title>\r\n\r\n<row gap=\"medium\">\r\n\r\n<column gap=\"medium\" flex=\"1 1 400px\">\r\n\r\nKangaroos are marsupials distinguished by long faces, large ears, powerful back legs and tails, and a distinctive hopping gait. These generally placid herbivores are shy of other creatures, preferring to live in open grasslands where their keen ears and eyes can spot danger approaching from a distance.\r\n\r\n<column gap=\"tiny\">\r\n**[Recall Knowledge - Animal](/Rules.aspx?ID=563)**\r\n([Nature](/Skills.aspx?ID=10)): DC 14\r\n\r\n**[Unspecific Lore](/Rules.aspx?ID=563)**: DC 12\r\n\r\n**[Specific Lore](/Rules.aspx?ID=563)**: DC 9\r\n</column>\r\n\r\n</column>\r\n\r\n<column gap=\"medium\">\r\n<image src=\"/images/Monsters/Kangaroo.png\" />\r\n</column>\r\n\r\n</row>\r\n\r\n<title level=\"2\" right=\"Creature 0\">[Kangaroo](/Monsters.aspx?ID=1205)</title>\r\n\r\n<traits>\r\n<trait label=\"N\" url=\"/Rules.aspx?ID=95\" />\r\n<trait label=\"Medium\" />\r\n<trait label=\"Animal\" url=\"/Traits.aspx?ID=9\" />\r\n</traits>\r\n\r\n<column gap=\"tiny\">\r\n\r\n<row gap=\"tiny\">**Source** [Bestiary 3](/Sources.aspx?ID=66) pg. 146</row>\n\n**Perception** +7; [scent](/MonsterAbilities.aspx?ID=33) (imprecise) 60 feet\r\n\r\n**Languages**\n\n**Skills**\r\n[Acrobatics](/Skills.aspx?ID=1) +4, [Athletics](/Skills.aspx?ID=3) +7, [Survival](/Skills.aspx?ID=16) +3\r\n\r\n<row gap=\"medium\">\r\n**Str** +3\r\n\r\n**Dex** +2\r\n\r\n**Con** +3\r\n\r\n**Int** -4\r\n\r\n**Wis** +1\r\n\r\n**Cha** +1\r\n</row>\r\n\r\n**Powerful Leaper** The kangaroo doesn't need to Stride while attempting a [Long Jump](/Actions.aspx?ID=37), nor does it automatically fail if it doesn't.\n\n</column>\r\n\r\n---\r\n\r\n<column gap=\"tiny\">\r\n\r\n<row gap=\"medium\">\r\n**AC** 15 \r\n\r\n**Fort** +7 \r\n\r\n**Ref** +6 \r\n\r\n**Will** +3 \n\n</row>\r\n\r\n<row gap=\"medium\">\r\n**HP** 18\n\n</row>\n\n**Defensive Shove** <actions string=\"Reaction\" /> **Trigger** The kangaroo takes damage from an adjacent creature; **Effect** The kangaroo attempts to [Shove](/Actions.aspx?ID=38) the creature that damaged it.\r\n\r\n</column>\r\n\r\n---\r\n\r\n<column gap=\"tiny\">\r\n\r\n**Speed** 35 feet\r\n\r\n**Melee**\r\n<actions string=\"Single Action\" />\r\nclaw +7,\r\n**Damage** 1d4+3 slashing\r\n\r\n**Melee**\r\n<actions string=\"Single Action\" />\r\nfoot +7,\r\n**Damage** 1d6+3 slashing plus [Push](/MonsterAbilities.aspx?ID=25)\n\n</column>\r\n\r\n<aside>\r\n<title level=\"2\" noclass=\"true\" icon=\"/images/Icons/Sidebar_4_RelatedCreatures.png\">Few Foes</title>\r\n\r\nKangaroos have very few natural predators. They survive in relatively inhospitable regions where most predators are physically on the smaller side, and their great speed makes them difficult prey to catch. Humanoids hunt them more often than other animals, though a [drake](/MonsterFamilies.aspx?ID=36) or [giant eagle](/Monsters.aspx?ID=173) might still choose a kangaroo for its dinner in certain areas.\r\n</aside>`;

		const result = await nethysMarkdownToDiscordMarkdown(nethysMarkdown);
		expect(result).toBe(`# [Kangaroo](<https://2e.aonprd.com/Monsters.aspx?ID=1205>)
Kangaroos are marsupials distinguished by long faces, large ears, powerful back legs and tails, and a distinctive hopping gait. These generally placid herbivores are shy of other creatures, preferring to live in open grasslands where their keen ears and eyes can spot danger approaching from a distance.
**[Recall Knowledge - Animal](<https://2e.aonprd.com/Rules.aspx?ID=563>)** ([Nature](<https://2e.aonprd.com/Skills.aspx?ID=10>)): DC 14
**[Unspecific Lore](<https://2e.aonprd.com/Rules.aspx?ID=563>)**: DC 12
**[Specific Lore](<https://2e.aonprd.com/Rules.aspx?ID=563>)**: DC 9
# [Kangaroo](<https://2e.aonprd.com/Monsters.aspx?ID=1205>)
[N](<https://2e.aonprd.com/Rules.aspx?ID=95>)
**Source** [Bestiary 3](<https://2e.aonprd.com/Sources.aspx?ID=66>) pg. 146
**Perception** +7; [scent](<https://2e.aonprd.com/MonsterAbilities.aspx?ID=33>) (imprecise) 60 feet
**Languages**
**Skills** [Acrobatics](<https://2e.aonprd.com/Skills.aspx?ID=1>) +4, [Athletics](<https://2e.aonprd.com/Skills.aspx?ID=3>) +7, [Survival](<https://2e.aonprd.com/Skills.aspx?ID=16>) +3
**Str** +3
**Dex** +2
**Con** +3
**Int** -4
**Wis** +1
**Cha** +1
**Powerful Leaper** The kangaroo doesn't need to Stride while attempting a [Long Jump](<https://2e.aonprd.com/Actions.aspx?ID=37>), nor does it automatically fail if it doesn't.

**AC** 15
**Fort** +7
**Ref** +6
**Will** +3
**HP** 18
**Defensive Shove** [reaction] **Trigger** The kangaroo takes damage from an adjacent creature; **Effect** The kangaroo attempts to [Shove](<https://2e.aonprd.com/Actions.aspx?ID=38>) the creature that damaged it.

**Speed** 35 feet
**Melee** [one-action] claw +7, **Damage** 1d4+3 slashing
**Melee** [one-action] foot +7, **Damage** 1d6+3 slashing plus [Push](<https://2e.aonprd.com/MonsterAbilities.aspx?ID=25>)
# Few Foes
Kangaroos have very few natural predators. They survive in relatively inhospitable regions where most predators are physically on the smaller side, and their great speed makes them difficult prey to catch. Humanoids hunt them more often than other animals, though a [drake](<https://2e.aonprd.com/MonsterFamilies.aspx?ID=36>) or [giant eagle](<https://2e.aonprd.com/Monsters.aspx?ID=173>) might still choose a kangaroo for its dinner in certain areas.`);
	});
});
