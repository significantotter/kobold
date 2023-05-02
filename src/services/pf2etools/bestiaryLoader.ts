import fs from 'fs';
import xxhash from 'xxhashjs';
import { BestiaryFilesLoaded, Npc } from '../kobold/models/index.js';
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

	return hashesByFile;

	// compare hashes to the saved hashes of uploaded bestiary files in the db

	// if any hashes don't match, download the file from the server and then save it to the db overwriting any existing entries that match
}

export async function loadBestiaryFileIfNoMatchingHash(file: string, hash: string): Promise<void> {
	await transaction(BestiaryFilesLoaded, Npc, async (BestiaryFilesLoaded, Npc) => {
		const loadedFile = (await BestiaryFilesLoaded.query().where('fileName', file))[0];
		let load = false;

		if (loadedFile && loadedFile.fileHash !== hash) {
			// load the file if the hash doesn't match
			load = true;
			// delete the old records
			await Promise.all([
				loadedFile.$query().delete(),
				Npc.query().delete().where('sourceFileName', file),
			]);
		} else if (!loadedFile) {
			load = true;
		}

		if (load) {
			console.log('importing ' + file);

			// load the file
			const npcs = JSON.parse(
				fs.readFileSync(path.join(__dirname, `/Pf2eTools/data/bestiary/${file}`), 'utf8')
			) as { creature: { [k: string]: any }[] };

			let npcFluff: { npcFluff?: any[] } = { npcFluff: [] };
			try {
				npcFluff = JSON.parse(
					fs.readFileSync(
						path.join(__dirname, `/Pf2eTools/data/bestiary/fluff-${file}`),
						'utf8'
					)
				);
			} catch {}

			// save the file hash
			await BestiaryFilesLoaded.query().insert({ fileName: file, fileHash: hash });
			// save the npcs
			await Promise.all(
				(npcs?.creature || []).map(npc => {
					let fluff = {};
					if (npcFluff?.npcFluff?.length) {
						fluff = npcFluff.npcFluff.find(
							fluff =>
								(fluff?.name || '').toLowerCase() ===
								(npc?.name || '').toLowerCase()
						);
					}
					return Npc.query().insert({
						name: npc?.name || 'unknown',
						data: npc,
						fluff,
						sourceFileName: file,
					});
				})
			);
			console.log('loaded!');
		}
	});
}

export async function checkAndLoadBestiaryFiles() {
	const bestiaryHashesByFiles = await hashBestiaryFiles();
	for (const bestiaryFile in bestiaryHashesByFiles) {
		await loadBestiaryFileIfNoMatchingHash(bestiaryFile, bestiaryHashesByFiles[bestiaryFile]);
	}
}
