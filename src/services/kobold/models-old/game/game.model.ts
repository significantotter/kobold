import { BaseModel } from '../../lib/base-model.js';
import { Model } from 'objection';
import type { CharacterModel } from '../character/character.model.js';
import { type Game, zGame } from '../../schemas/zod-tables/game.zod.js';
import { ZodValidator } from '../../lib/zod-validator.js';

export interface GameModel extends Game {
	characters: CharacterModel[];
}
export class GameModel extends BaseModel {
	static idColumn = ['id'];
	public $insertIgnore = ['id'];
	static get tableName(): string {
		return 'game';
	}

	static createValidator() {
		return new ZodValidator();
	}

	public $z = zGame;

	static setupRelationMappings({ CharacterModel }: { CharacterModel: any }) {
		this.relationMappings = {
			characters: {
				relation: Model.ManyToManyRelation,
				modelClass: CharacterModel,
				join: {
					from: 'game.id',
					through: {
						from: 'charactersInGames.gameId',
						to: 'charactersInGames.characterId',
					},
					to: 'character.id',
				},
			},
		};
	}
}
