import { zodToJsonSchema } from 'zod-to-json-schema';
import { createTypeAlias, printNode, zodToTs } from 'zod-to-ts';
import { zPasteBinImport } from '../commands/chat/characters/character-import-pastebin-subcommand.js';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pastebinImportSchema = zodToJsonSchema(zPasteBinImport, 'pastebin-import');
const pastebinImportTs = zodToTs(zPasteBinImport, 'pastebin-import');

await fs.writeFile(
	path.join(__dirname, 'schema-dist/pastebin-import.json'),
	JSON.stringify(pastebinImportSchema, null, 2),
	'utf-8'
);

await fs.writeFile(
	path.join(__dirname, 'schema-dist/pastebin-import.d.ts'),
	printNode(createTypeAlias(pastebinImportTs.node, 'PasteBinImport')),
	'utf-8'
);
