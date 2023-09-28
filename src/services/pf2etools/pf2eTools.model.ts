import { Neboa } from 'neboa';
import {
	Abilities,
	Actions,
	Afflictions,
	Archetypes,
	Backgrounds,
	Books,
	CompanionAbilities,
	Companions,
	Conditions,
	Creatures,
	CreaturesFluff,
	CreatureTemplates,
	CreatureTemplatesFluff,
	Deities,
	DeitiesFluff,
	Eidolons,
	Events,
	FamiliarAbilities,
	Familiars,
	Feats,
	Groups,
	Hazards,
	Items,
	Languages,
	OptionalFeatures,
	Organizations,
	OrganizationsFluff,
	Places,
	QuickRules,
	RelicGifts,
	Rituals,
	Skills,
	Sources,
	Spells,
	Tables,
	Traits,
	VariantRules,
	Vehicles,
} from './models/index.js';

export class Pf2eToolsModel {
	public readonly abilities: Abilities;
	public readonly actions: Actions;
	public readonly afflictions: Afflictions;
	public readonly archetypes: Archetypes;
	public readonly backgrounds: Backgrounds;
	public readonly creatures: Creatures;
	public readonly creaturesFluff: CreaturesFluff;
	public readonly books: Books;
	public readonly companionAbilities: CompanionAbilities;
	public readonly companions: Companions;
	public readonly conditions: Conditions;
	public readonly creatureTemplates: CreatureTemplates;
	public readonly creatureTemplatesFluff: CreatureTemplatesFluff;
	public readonly deities: Deities;
	public readonly deitiesFluff: DeitiesFluff;
	public readonly eidolons: Eidolons;
	public readonly events: Events;
	public readonly familiarAbilities: FamiliarAbilities;
	public readonly familiars: Familiars;
	public readonly feats: Feats;
	public readonly groups: Groups;
	public readonly hazards: Hazards;
	public readonly items: Items;
	public readonly languages: Languages;
	public readonly optionalFeatures: OptionalFeatures;
	public readonly organizations: Organizations;
	public readonly organizationsFluff: OrganizationsFluff;
	public readonly places: Places;
	public readonly quickRules: QuickRules;
	public readonly relicGifts: RelicGifts;
	public readonly rituals: Rituals;
	public readonly skills: Skills;
	public readonly sources: Sources;
	public readonly spells: Spells;
	public readonly tables: Tables;
	public readonly traits: Traits;
	public readonly variantRules: VariantRules;
	public readonly vehicles: Vehicles;

	constructor(db: Neboa) {
		this.abilities = new Abilities(db);
		this.actions = new Actions(db);
		this.afflictions = new Afflictions(db);
		this.archetypes = new Archetypes(db);
		this.backgrounds = new Backgrounds(db);
		this.creatures = new Creatures(db);
		this.creaturesFluff = new CreaturesFluff(db);
		this.books = new Books(db);
		this.companionAbilities = new CompanionAbilities(db);
		this.companions = new Companions(db);
		this.conditions = new Conditions(db);
		this.creatureTemplates = new CreatureTemplates(db);
		this.creatureTemplatesFluff = new CreatureTemplatesFluff(db);
		this.deities = new Deities(db);
		this.deitiesFluff = new DeitiesFluff(db);
		this.eidolons = new Eidolons(db);
		this.events = new Events(db);
		this.familiarAbilities = new FamiliarAbilities(db);
		this.familiars = new Familiars(db);
		this.feats = new Feats(db);
		this.groups = new Groups(db);
		this.hazards = new Hazards(db);
		this.items = new Items(db);
		this.languages = new Languages(db);
		this.optionalFeatures = new OptionalFeatures(db);
		this.organizations = new Organizations(db);
		this.organizationsFluff = new OrganizationsFluff(db);
		this.places = new Places(db);
		this.quickRules = new QuickRules(db);
		this.relicGifts = new RelicGifts(db);
		this.rituals = new Rituals(db);
		this.skills = new Skills(db);
		this.sources = new Sources(db);
		this.spells = new Spells(db);
		this.tables = new Tables(db);
		this.traits = new Traits(db);
		this.variantRules = new VariantRules(db);
		this.vehicles = new Vehicles(db);
	}
}
