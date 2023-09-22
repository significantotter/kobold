// import { dCharacter } from './character/character.drizzle.js';

export class Kobold {
	// public character: dCharacter;
	constructor(private dbService: any) {
		// this.character = new dCharacter(this);
	}
	public get schema() {
		return this.dbService.schema;
	}
	public get db() {
		return this.dbService.db;
	}
}
