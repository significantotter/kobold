import { Collection } from 'neboa';
import { z } from 'zod';

export abstract class Model<T extends z.ZodTypeAny> {
	public abstract collection: Collection<z.infer<T>>;
	public abstract z: T;

	public abstract getFiles(): any[];
	public abstract resourceListFromFile(file: any): any[];
	public abstract import(): Promise<void>;

	public async _importData() {
		//truncate the existing entries
		const ids = await this.collection.query().find();
		await this.collection.deleteMany(ids.map(id => id._id));

		const jsonFiles = this.getFiles();

		for (const jsonFile of jsonFiles) {
			for (const resource of this.resourceListFromFile(jsonFile)) {
				console.log(resource?.name);
				const parse = this.z.safeParse(resource);

				if (!parse.success) {
					console.dir(parse.error.format(), { depth: null });
					console.dir(resource, { depth: null });
					throw new Error();
				}
				await this.collection.insert(parse.data);
			}
		}
	}
}
