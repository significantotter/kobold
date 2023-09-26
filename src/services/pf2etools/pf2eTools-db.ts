import { neboa } from 'neboa';
import { Abilities } from './models/Abilities.js';
import { Actions } from './models/Actions.js';
import { Afflictions } from './models/Afflictions.js';
import { Feats } from './models/Feats.js';
import { Items } from './models/Items.js';
import { Spells } from './models/Spells.js';
import { Archetypes } from './models/Archetypes.js';
import { Backgrounds } from './models/Backgrounds.js';
import { Books } from './models/Books.js';
import { Creatures, CreatureFluff } from './models/Bestiary.js';

export const db = neboa('pf2eTools.db');

// const abilities = new Abilities(db);
// await abilities.import();

// const actions = new Actions(db);
// await actions.import();

// const afflictions = new Afflictions(db);
// await afflictions.import();

// const archetypes = new Archetypes(db);
// await archetypes.import();

// const backgrounds = new Backgrounds(db);
// await backgrounds.import();

const creatures = new Creatures(db);
const creatureFluff = new CreatureFluff(db);
await creatures.import();
// await creatureFluff.import();

// const books = new Books(db);
// await books.import();

// const feats = new Feats(db);
// await feats.import();

// const items = new Items(db);
// await items.import();

// const spells = new Spells(db);
// await spells.import();
