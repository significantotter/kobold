import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import {
	Ability,
	Action,
	Affliction,
	Archetype,
	Background,
	Book,
	Class,
	ClassFeature,
	Companion,
	CompanionAbility,
	Condition,
	Creature,
	CreatureFluff,
	CreatureTemplate,
	Deity,
	DeityFluff,
	Domain,
	Eidolon,
	EventType,
	Familiar,
	FamiliarAbility,
	Feat,
	Group,
	Hazard,
	Item,
	Language,
	OptionalFeature,
	Organization,
	Place,
	QuickRule,
	RelicGift,
	Ritual,
	Skill,
	Source,
	Spell,
	SubclassFeature,
	Table,
	Trait,
	VariantRule,
	Vehicle,
	Ancestry,
	VersatileHeritage,
	RenderDemo,
	OrganizationFluff,
	CreatureTemplateFluff,
} from './models/index-types.js';
import { ItemFluff } from './models/Items.zod.js';

const standardFields = {
	id: integer('id').primaryKey().notNull(),
	name: text('name').notNull(),
	search: text('search').notNull(),
	tags: text('tags', { mode: 'json' }).notNull().$type<string[]>(),
};

export const Abilities = sqliteTable('Abilities', {
	...standardFields,
	data: text('data', { mode: 'json' }).notNull().$type<Ability>(),
});

export const Actions = sqliteTable('Actions', {
	...standardFields,
	data: text('data', { mode: 'json' }).notNull().$type<Action>(),
});

export const Afflictions = sqliteTable('Afflictions', {
	...standardFields,
	data: text('data', { mode: 'json' }).notNull().$type<Affliction>(),
});

export const Ancestries = sqliteTable('Ancestries', {
	...standardFields,
	data: text('data', { mode: 'json' }).notNull().$type<Ancestry>(),
});

export const Archetypes = sqliteTable('Archetypes', {
	...standardFields,
	data: text('data', { mode: 'json' }).notNull().$type<Archetype>(),
});

export const Backgrounds = sqliteTable('Backgrounds', {
	...standardFields,
	data: text('data', { mode: 'json' }).notNull().$type<Background>(),
});

export const Books = sqliteTable('Books', {
	...standardFields,
	data: text('data', { mode: 'json' }).notNull().$type<Book>(),
});

export const Classes = sqliteTable('Classes', {
	...standardFields,
	data: text('data', { mode: 'json' }).notNull().$type<Class>(),
});

export const ClassFeatures = sqliteTable('ClassFeatures', {
	...standardFields,
	data: text('data', { mode: 'json' }).notNull().$type<ClassFeature>(),
});

export const CompanionAbilities = sqliteTable('CompanionAbilities', {
	...standardFields,
	data: text('data', { mode: 'json' }).notNull().$type<CompanionAbility>(),
});

export const Companions = sqliteTable('Companions', {
	...standardFields,
	data: text('data', { mode: 'json' }).notNull().$type<Companion>(),
});

export const Conditions = sqliteTable('Conditions', {
	...standardFields,
	data: text('data', { mode: 'json' }).notNull().$type<Condition>(),
});

export const Creatures = sqliteTable('Creatures', {
	...standardFields,
	data: text('data', { mode: 'json' }).notNull().$type<Creature>(),
});

export const CreaturesFluff = sqliteTable('CreaturesFluff', {
	...standardFields,
	data: text('data', { mode: 'json' }).notNull().$type<CreatureFluff>(),
});

export const CreatureTemplates = sqliteTable('CreatureTemplates', {
	...standardFields,
	data: text('data', { mode: 'json' }).notNull().$type<CreatureTemplate>(),
});

export const CreatureTemplatesFluff = sqliteTable('CreatureTemplatesFluff', {
	...standardFields,
	data: text('data', { mode: 'json' }).notNull().$type<CreatureTemplateFluff>(),
});

export const Deities = sqliteTable('Deities', {
	...standardFields,
	data: text('data', { mode: 'json' }).notNull().$type<Deity>(),
});

export const DeitiesFluff = sqliteTable('DeitiesFluff', {
	...standardFields,
	data: text('data', { mode: 'json' }).notNull().$type<DeityFluff>(),
});

export const Domains = sqliteTable('Domains', {
	...standardFields,
	data: text('data', { mode: 'json' }).notNull().$type<Domain>(),
});

export const Eidolons = sqliteTable('Eidolons', {
	...standardFields,
	data: text('data', { mode: 'json' }).notNull().$type<Eidolon>(),
});

export const Events = sqliteTable('Events', {
	...standardFields,
	data: text('data', { mode: 'json' }).notNull().$type<EventType>(),
});

export const FamiliarAbilities = sqliteTable('FamiliarAbilities', {
	...standardFields,
	data: text('data', { mode: 'json' }).notNull().$type<FamiliarAbility>(),
});

export const Familiars = sqliteTable('Familiars', {
	...standardFields,
	data: text('data', { mode: 'json' }).notNull().$type<Familiar>(),
});

export const Feats = sqliteTable('Feats', {
	...standardFields,
	data: text('data', { mode: 'json' }).notNull().$type<Feat>(),
});

export const Groups = sqliteTable('Groups', {
	...standardFields,
	data: text('data', { mode: 'json' }).notNull().$type<Group>(),
});

export const Hazards = sqliteTable('Hazards', {
	...standardFields,
	data: text('data', { mode: 'json' }).notNull().$type<Hazard>(),
});

export const VersatileHeritages = sqliteTable('VersatileHeritages', {
	...standardFields,
	data: text('data', { mode: 'json' }).notNull().$type<VersatileHeritage>(),
});

export const Items = sqliteTable('Items', {
	...standardFields,
	data: text('data', { mode: 'json' }).notNull().$type<Item>(),
});

export const ItemsFluff = sqliteTable('ItemsFluff', {
	...standardFields,
	data: text('data', { mode: 'json' }).notNull().$type<ItemFluff>(),
});

export const Languages = sqliteTable('Languages', {
	...standardFields,
	data: text('data', { mode: 'json' }).notNull().$type<Language>(),
});

export const OptionalFeatures = sqliteTable('OptionalFeatures', {
	...standardFields,
	data: text('data', { mode: 'json' }).notNull().$type<OptionalFeature>(),
});

export const Organizations = sqliteTable('Organizations', {
	...standardFields,
	data: text('data', { mode: 'json' }).notNull().$type<Organization>(),
});

export const OrganizationsFluff = sqliteTable('OrganizationsFluff', {
	...standardFields,
	data: text('data', { mode: 'json' }).notNull().$type<OrganizationFluff>(),
});

export const Places = sqliteTable('Places', {
	...standardFields,
	data: text('data', { mode: 'json' }).notNull().$type<Place>(),
});

export const QuickRules = sqliteTable('QuickRules', {
	...standardFields,
	data: text('data', { mode: 'json' }).notNull().$type<QuickRule>(),
});

export const RelicGifts = sqliteTable('RelicGifts', {
	...standardFields,
	data: text('data', { mode: 'json' }).notNull().$type<RelicGift>(),
});

export const RenderDemos = sqliteTable('RenderDemos', {
	...standardFields,
	data: text('data', { mode: 'json' }).notNull().$type<RenderDemo>(),
});

export const Rituals = sqliteTable('Rituals', {
	...standardFields,
	data: text('data', { mode: 'json' }).notNull().$type<Ritual>(),
});

export const Skills = sqliteTable('Skills', {
	...standardFields,
	data: text('data', { mode: 'json' }).notNull().$type<Skill>(),
});

export const Sources = sqliteTable('Sources', {
	...standardFields,
	data: text('data', { mode: 'json' }).notNull().$type<Source>(),
});

export const Spells = sqliteTable('Spells', {
	...standardFields,
	data: text('data', { mode: 'json' }).notNull().$type<Spell>(),
});

export const SubclassFeatures = sqliteTable('SubclassFeatures', {
	...standardFields,
	data: text('data', { mode: 'json' }).notNull().$type<SubclassFeature>(),
});

export const Tables = sqliteTable('Tables', {
	...standardFields,
	data: text('data', { mode: 'json' }).notNull().$type<Table>(),
});

export const Traits = sqliteTable('Traits', {
	...standardFields,
	data: text('data', { mode: 'json' }).notNull().$type<Trait>(),
});

export const VariantRules = sqliteTable('VariantRules', {
	...standardFields,
	data: text('data', { mode: 'json' }).notNull().$type<VariantRule>(),
});

export const Vehicles = sqliteTable('Vehicles', {
	...standardFields,
	data: text('data', { mode: 'json' }).notNull().$type<Vehicle>(),
});

export const Search = sqliteTable('Search', {
	id: integer('id').notNull(),
	name: text('name').notNull(),
	search: text('search').notNull(),
	tags: text('tags', { mode: 'json' }).notNull().$type<string[]>(),
	table: text('table').notNull(),
});
