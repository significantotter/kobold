import { z } from 'zod';
import { zx } from '@traversable/zod';
import { zPasteBinImport } from '../commands/chat/characters/character-import-pastebin-subcommand.js';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputDir = path.join(__dirname, 'schema-dist');

// Ensure output directory exists
await fs.mkdir(outputDir, { recursive: true });

// Generate JSON Schema using Zod 4's native toJSONSchema
z.globalRegistry.add(zPasteBinImport, { id: 'pastebin-import' });
const pastebinImportJsonSchema = z.toJSONSchema(zPasteBinImport);

await fs.writeFile(
	path.join(outputDir, 'pastebin-import.json'),
	JSON.stringify(pastebinImportJsonSchema, null, 2),
	'utf-8'
);

// Generate TypeScript type definitions using @traversable/zod
const pastebinImportType = zx.toType(zPasteBinImport, {
	typeName: 'PasteBinImport',
	preserveJsDocs: true,
});

await fs.writeFile(
	path.join(outputDir, 'pastebin-import.d.ts'),
	`// Auto-generated TypeScript type definitions from Zod schema\n// Do not edit manually\n\n${pastebinImportType}\n`,
	'utf-8'
);

console.log('Generated schema files in', outputDir);
