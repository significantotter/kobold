import { Neboa, Collection } from 'neboa';
import { fetchOneJsonFileAndEscape } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import { zRelicGiftSchema, RelicGift } from './RelicGifts.zod.js';

export class RelicGifts extends Model<typeof zRelicGiftSchema> {
	public collection: Collection<RelicGift>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<RelicGift>('relicGifts');
	}
	public z = zRelicGiftSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFileAndEscape('relicGifts')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.relicGift;
	}
	public async import() {
		await this._importData();
	}
}
