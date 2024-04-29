import { db } from '../nethys.db.js';
import * as schema from '../nethys.schema.js';
import fs from 'node:fs';
import { quicktype, InputData, jsonInputForTargetLanguage } from 'quicktype-core';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import _ from 'lodash';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class NethysTypeParser {
	constructor(protected targetDir: string) {
		if (!fs.existsSync(targetDir)) {
			fs.mkdirSync(targetDir);
		}
	}
	public async parseCompendiumTypes() {
		const jsonInput = jsonInputForTargetLanguage('typescript-zod');

		const data = await db.select().from(schema.compendium);

		await jsonInput.addSource({
			name: 'compendium',
			samples: data.map(d => JSON.stringify(d.data)),
		});
		const inputData = new InputData();
		inputData.addInput(jsonInput);

		const types = await quicktype({
			inputData,
			lang: 'typescript-zod',
		});
		await fs.writeFileSync(
			`${this.targetDir}/compendium.zod.ts`,
			types.lines.join('\n') + '\n' + types.annotations.join('\n')
		);
	}
	public async parseBestiaryTypes() {
		const jsonInput = jsonInputForTargetLanguage('typescript-zod');

		const data = await db.select().from(schema.bestiary);

		await jsonInput.addSource({
			name: 'bestiary',
			samples: data.map(d => JSON.stringify(d.data)),
		});
		const inputData = new InputData();
		inputData.addInput(jsonInput);

		const types = await quicktype({
			inputData,
			lang: 'typescript-zod',
		});
		await fs.writeFileSync(
			`${this.targetDir}/bestiary.zod.ts`,
			types.lines.join('\n') + '\n' + types.annotations.join('\n')
		);
	}
}

const typeParser = new NethysTypeParser(path.join(__dirname, './generated-types'));
await typeParser.parseBestiaryTypes();
await typeParser.parseCompendiumTypes();
