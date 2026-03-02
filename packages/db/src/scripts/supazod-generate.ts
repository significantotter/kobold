import { generateContent } from 'supazod';
import { writeFileSync } from 'fs';

// Convert snake_case to camelCase
function snakeToCamel(str: string): string {
	return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// Convert all property names in z.object() calls from snake_case to camelCase
function convertPropertyNamesToCamelCase(content: string): string {
	// Match property names at the start of lines within z.object() blocks
	// Pattern: whitespace followed by snake_case identifier followed by colon
	return content.replace(
		/^(\s+)([a-z][a-z0-9]*(?:_[a-z0-9]+)+)(:)/gm,
		(match, indent, propName, colon) => {
			return `${indent}${snakeToCamel(propName)}${colon}`;
		}
	);
}

const result = await generateContent({
	input: './src/schemas/supabase.types.ts',
	output: './src/schemas/supabase.zod.generated.ts',
	schema: ['public'],
	processDependencies: true,
	enumFormatter: (name: string) => name,
	compositeTypeFormatter: (name: string) => name,
	functionFormatter: (name: string, _operation: string) => name,
	tableOrViewFormatter: (name: string, _operation: string) => name,
	keepComments: true,
	skipParseJSDoc: false,
	verbose: false,
	inlineTypes: false,
	typeNameTransformer: (name: string) => name,
	namingConfig: {
		// Use patterns that we can easily transform afterward
		tableOperationPattern: '{table}{operation}',
		tableSchemaPattern: 'z{table}{operation}',
		enumPattern: '{name}',
		enumSchemaPattern: 'z{name}',
		compositeTypePattern: '{name}',
		compositeTypeSchemaPattern: 'z{name}',
		functionArgsPattern: '{function}Args',
		functionArgsSchemaPattern: 'z{function}Args',
		functionReturnsPattern: '{function}Returns',
		functionReturnsSchemaPattern: 'z{function}Returns',
		capitalizeSchema: true,
		capitalizeNames: true,
		separator: '',
	},
});

// Post-process the output to match Kysely naming conventions:
// - zCharacterRowSchema -> zCharacter
// - zCharacterInsertSchema -> zNewCharacter
// - zCharacterUpdateSchema -> zCharacterUpdate
// - zCharacterRelationshipsSchema -> zCharacterRelationships (no change)
let schemaContent = result.formatterSchemasFileContent;

// Replace operation names to match Kysely style
schemaContent = schemaContent
	// Row -> base (remove Row and Schema suffix)
	.replace(/(\w+)RowSchema/g, '$1')
	// Insert -> New (remove Schema suffix, keep z prefix)
	.replace(/z(\w+)InsertSchema/g, 'zNew$1')
	// Update -> Update (remove Schema suffix)
	.replace(/(\w+)UpdateSchema/g, '$1Update')
	// Relationships -> keep but remove Schema suffix
	.replace(/(\w+)RelationshipsSchema/g, '$1Relationships')
	// Fix ESM imports to use .js extension
	.replace(/from ["']\.\/supabase\.types["']/g, 'from "./supabase.types.js"');

// Convert property names to camelCase
schemaContent = convertPropertyNamesToCamelCase(schemaContent);

// Write the transformed content
writeFileSync('./src/schemas/supabase.zod.generated.ts', schemaContent);

console.log('✅ Supazod generation complete');
console.log('   Output: ./src/schemas/supabase.zod.generated.ts');
console.log('   Naming: Kysely-style (zCharacter, zNewCharacter, zCharacterUpdate)');
