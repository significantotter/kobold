import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

export function fetchOneJsonFile(fileName: string) {
	return JSON.parse(
		fs.readFileSync(path.join(currentDirectory, `../Pf2eTools/data/${fileName}.json`), 'utf8')
	);
}

export function fetchManyJsonFiles(folderName: string) {}
