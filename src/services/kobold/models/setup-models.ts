import { BestiaryFilesLoadedModel } from './bestiary-files-loaded/bestiary-files-loaded.model.js';
import { ChannelDefaultCharacterModel } from './channel-default-character/channel-default-character.model.js';
import { CharacterModel } from './character/character.model.js';
import { GameModel } from './game/game.model.js';
import { GuildDefaultCharacterModel } from './guild-default-character/guild-default-character.model.js';
import { InitiativeActorGroupModel } from './initiative-actor-group/initiative-actor-group.model.js';
import { InitiativeActorModel } from './initiative-actor/initiative-actor.model.js';
import { InitiativeModel } from './initiative/initiative.model.js';
import { NpcModel } from './npc/npc.model.js';
import { UserSettingsModel } from './user-settings/user-settings.model.js';
import { WgTokenModel } from './wg-token/wg-token.model.js';

const allModels = {
	BestiaryFilesLoadedModel,
	ChannelDefaultCharacterModel,
	CharacterModel,
	GameModel,
	GuildDefaultCharacterModel,
	InitiativeActorGroupModel,
	InitiativeActorModel,
	InitiativeModel,
	NpcModel,
	UserSettingsModel,
	WgTokenModel,
};
for (const model of Object.values(allModels)) {
	model.setupRelationMappings(allModels);
}
