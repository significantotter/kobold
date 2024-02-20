import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

export function fetchOneJsonFile(fileName: string) {
	return JSON.parse(
		fs.readFileSync(
			path.join(currentDirectory, `../../Pf2eTools/data/${fileName}.json`),
			'utf8'
		)
	);
}

export function fetchManyJsonFiles(folderName: string, indexFileName = 'index.json') {
	const indexFile = fs.readFileSync(
		path.join(currentDirectory, `../../Pf2eTools/data/${folderName}/${indexFileName}`),
		'utf8'
	);
	return Object.values(JSON.parse(indexFile)).map(filePath =>
		JSON.parse(
			fs.readFileSync(
				path.join(currentDirectory, `../../Pf2eTools/data/${folderName}/${filePath}`),
				'utf8'
			)
		)
	);
}

export function fetchAllJsonFilesInDirectory(folderName: string) {
	const directory = fs.readdirSync(
		path.join(currentDirectory, `../../Pf2eTools/data/${folderName}`)
	);
	return directory.map(filePath =>
		JSON.parse(
			fs.readFileSync(
				path.join(currentDirectory, `../../Pf2eTools/data/${folderName}/${filePath}`),
				'utf8'
			)
		)
	);
}
