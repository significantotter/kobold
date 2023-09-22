import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Model } from './Model.js';
import { z } from 'zod';
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

export function fetchOneJsonFile(fileName: string) {
	return JSON.parse(
		fs.readFileSync(path.join(currentDirectory, `../Pf2eTools/data/${fileName}.json`), 'utf8')
	);
}
export function fetchOneJsonFileAndEscape(fileName: string) {
	return JSON.parse(
		fs
			.readFileSync(path.join(currentDirectory, `../Pf2eTools/data/${fileName}.json`), 'utf8')
			.replaceAll("'", "''")
	);
}

export async function importData<T extends z.ZodTypeAny, K extends Model<T>>(model: K) {
	//truncate the existing entries
	const ids = await model.collection.query().find();
	await model.collection.deleteMany(ids.map(id => id._id));

	const actionsInsert: z.infer<T>[] = [];
	const jsonFiles = model.getFiles();

	for (const jsonFile of jsonFiles) {
		for (const resource of model.resourceListFromFile(jsonFile)) {
			console.log(resource?.name);
			const parse = model.z.safeParse(resource);

			if (!parse.success) {
				console.dir(resource, { depth: null });
				console.dir(parse.error.format(), { depth: null });
				return;
			}
			await model.collection.insert(parse.data);
		}
	}
}
export function fetchManyJsonFiles(folderName: string) {
	const indexFile = fs.readFileSync(
		path.join(currentDirectory, `../Pf2eTools/data/${folderName}/index.json`),
		'utf8'
	);
	return Object.values(JSON.parse(indexFile)).map(filePath =>
		JSON.parse(
			fs
				.readFileSync(
					path.join(currentDirectory, `../Pf2eTools/data/${folderName}/${filePath}`),
					'utf8'
				)
				.replaceAll("'", "''")
		)
	);
}
