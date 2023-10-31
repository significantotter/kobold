import { BaseModel } from '../../lib/base-model.js';
import { Model, RelationMappings } from 'objection';
import { CharacterModel } from '../character/character.model.js';
import { Game, zGame } from '../../schemas/game.zod.js';
import { ZodValidator } from '../../lib/zod-validator.js';

export interface GameModel extends Game {
	characters: CharacterModel[];
}
export class GameModel extends BaseModel {
	static get tableName(): string {
		return 'game';
	}

	static createValidator() {
		return new ZodValidator();
	}

	public $z = zGame;

	static async queryWhereUserHasCharacter(userId: string, guildId: string | null) {
		const options = await this.query()
			.withGraphJoined('characters')
			.where({ guildId: guildId });

		return options.filter(
			option =>
				option.characters.filter(char => char.userId === userId && char.isActiveCharacter)
					.length > 0 || option.gmUserId === userId
		);
	}
	static async queryWhereUserLacksCharacter(userId: string, guildId: string) {
		const options = await this.query().withGraphFetched('characters').where('guildId', guildId);
		// Filter out the games that the user is already in
		return options.filter(
			option =>
				option.characters.filter(char => char.userId === userId && char.isActiveCharacter)
					.length === 0
		);
	}

	static get relationMappings(): RelationMappings {
		return {
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
