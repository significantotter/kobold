import { listMyCharacters, getCharacterWorkspace, renameCharacter, setActiveCharacter, deleteCharacter } from './management.js';
import { updateModifierState } from './modifiers.js';
import { createRollMacro, updateRollMacro, deleteRollMacro } from './roll-macros.js';
import { renameMinion, assignMinion, unassignMinion, updateMinionAutoJoinInitiative, deleteMinion } from './minions.js';
import { getCharacterLite, getCharacter, findWgCharacterByName, importWgCharacter, updateWgCharacter, importPathbuilderCharacter, updatePathbuilderCharacter } from './imports.js';

type CharacterRouterShape = {
	listMyCharacters: typeof listMyCharacters;
	getCharacterWorkspace: typeof getCharacterWorkspace;
	renameCharacter: typeof renameCharacter;
	setActiveCharacter: typeof setActiveCharacter;
	deleteCharacter: typeof deleteCharacter;
	updateModifierState: typeof updateModifierState;
	createRollMacro: typeof createRollMacro;
	updateRollMacro: typeof updateRollMacro;
	deleteRollMacro: typeof deleteRollMacro;
	renameMinion: typeof renameMinion;
	assignMinion: typeof assignMinion;
	unassignMinion: typeof unassignMinion;
	updateMinionAutoJoinInitiative: typeof updateMinionAutoJoinInitiative;
	deleteMinion: typeof deleteMinion;
	getCharacterLite: typeof getCharacterLite;
	getCharacter: typeof getCharacter;
	findWgCharacterByName: typeof findWgCharacterByName;
	importWgCharacter: typeof importWgCharacter;
	updateWgCharacter: typeof updateWgCharacter;
	importPathbuilderCharacter: typeof importPathbuilderCharacter;
	updatePathbuilderCharacter: typeof updatePathbuilderCharacter;
};

const builtCharacterRouter: CharacterRouterShape = {
	listMyCharacters,
	getCharacterWorkspace,
	renameCharacter,
	setActiveCharacter,
	deleteCharacter,
	updateModifierState,
	createRollMacro,
	updateRollMacro,
	deleteRollMacro,
	renameMinion,
	assignMinion,
	unassignMinion,
	updateMinionAutoJoinInitiative,
	deleteMinion,
	getCharacterLite,
	getCharacter,
	findWgCharacterByName,
	importWgCharacter,
	updateWgCharacter,
	importPathbuilderCharacter,
	updatePathbuilderCharacter,
};

export { builtCharacterRouter as characterRouter };

export type CharacterRouter = typeof builtCharacterRouter;
