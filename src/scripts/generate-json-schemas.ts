import { zodToJsonSchema } from 'zod-to-json-schema';
import { createTypeAlias, printNode, zodToTs } from 'zod-to-ts';
import { zPastebinImport } from '../commands/chat/characters/character-import-pastebin.js';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pastebinImportSchema = zodToJsonSchema(zPastebinImport, 'pastebin-import');
const pastebinImportTs = zodToTs(zPastebinImport, 'pastebin-import');

await fs.writeFile(
	path.join(__dirname, 'schema-dist/pastebin-import.json'),
	JSON.stringify(pastebinImportSchema, null, 2),
	'utf-8'
);

await fs.writeFile(
	path.join(__dirname, 'schema-dist/pastebin-import.d.ts'),
	printNode(createTypeAlias(pastebinImportTs.node, 'PastebinImport')),
	'utf-8'
);
