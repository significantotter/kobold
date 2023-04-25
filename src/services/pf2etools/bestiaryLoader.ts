import fs from 'fs';
import xxhash from 'xxhashjs';
import { BestiaryFilesLoaded, Creature } from '../kobold/models/index.js';
import { transaction } from 'objection';
import path from 'path';

export async function hashBestiaryFiles() {
	// Find all files named with "creatures-" in the pf2etools bestiary directory
	const bestiaryFiles = fs
		.readdirSync(path.join(__dirname, `/Pf2eTools/data/bestiary`), {
			withFileTypes: true,
		})
		.filter(dirent => dirent.name.startsWith('creatures-'))
		.map(dirent => dirent.name);

	// compute the hash of each of the files
	// use a stream to avoid slowdowns from reading the entire file into memory
	const hashesByFile: { [k: string]: string } = {};
	const promises = bestiaryFiles.map(file => {
		return new Promise<void>((resolve, reject) => {
			const stream = fs.createReadStream(
				path.join(__dirname, `/Pf2eTools/data/bestiary/${file}`)
			);
			const hash = xxhash.h32(0xabcd);
			stream.on('data', chunk => hash.update(chunk));
			stream.on('end', () => {
				hashesByFile[file] = hash.digest().toString(16);
				resolve();
			});
			stream.on('error', error => reject(error));
		});
	});

	await Promise.all(promises);

	console.log('Hashed bestiary files:');
	console.log(hashesByFile);

	return hashesByFile;

	// compare hashes to the saved hashes of uploaded bestiary files in the db

	// if any hashes don't match, download the file from the server and then save it to the db overwriting any existing entries that match
}

export async function loadBestiaryFileIfNoMatchingHash(file: string, hash: string): Promise<void> {
	await transaction(BestiaryFilesLoaded, Creature, async (BestiaryFilesLoaded, Creature) => {
		const loadedFile = (await BestiaryFilesLoaded.query().where('fileName', file))[0];
		console.log('checking ' + file);
		let load = false;

		if (loadedFile && loadedFile.fileHash !== hash) {
			// load the file if the hash doesn't match
			load = true;
			// delete the old records
			await Promise.all([
				loadedFile.$query().delete(),
				Creature.query().delete().where('sourceFileName', file),
			]);
		} else if (!loadedFile) {
			load = true;
		}

		if (load) {
			console.log('loading the file');
			// load the file
			const creatures = JSON.parse(
				fs.readFileSync(path.join(__dirname, `/Pf2eTools/data/bestiary/${file}`), 'utf8')
			) as { creature: { [k: string]: any }[] };
			// save the file hash
			await BestiaryFilesLoaded.query().insert({ fileName: file, fileHash: hash });
			// save the creatures
			await Promise.all(
				(creatures?.creature || []).map(creature =>
					Creature.query().insert({
						data: creature,
						sourceFileName: file,
						name: creature?.name || 'unknown',
					})
				)
			);
			console.log('loaded!');
		} else {
			console.log('skipping');
		}
	});
}

export async function checkAndLoadBestiaryFiles() {
	const bestiaryHashesByFiles = await hashBestiaryFiles();
	for (const bestiaryFile in bestiaryHashesByFiles) {
		await loadBestiaryFileIfNoMatchingHash(bestiaryFile, bestiaryHashesByFiles[bestiaryFile]);
	}
}
