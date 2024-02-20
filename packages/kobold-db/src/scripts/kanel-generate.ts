// @ts-check
import kanel, { Details, InstantiatedConfig, Output, Path, PreRenderHook } from 'kanel';
import 'kobold-config';
import kk from 'kanel-kysely';
import kz from 'kanel-zod';
import { recase } from '@kristiandupont/recase';
import { tryParse } from 'tagged-comment-parser';
import { join } from 'path';
import _ from 'lodash';
const { makeKyselyHook } = kk;
const { makeGenerateZodSchemas, defaultGetZodIdentifierMetadata, defaultZodTypeMap } = kz;
const toPascalCase = recase('snake', 'pascal');

const outputPath = './src/services/kobold/schemas/kanel';

function convertESMPaths(path: string, lines: string[], instantiatedConfig: InstantiatedConfig) {
	return lines.map(line =>
		line
			.replace(/^import\stype\s.*'(.*)';$/, (match, p1) => {
				return /\sfrom\s'kysely';$/.test(match) ? match : match.replace(p1, `${p1}.js`);
			})
			.replace(/^import\s.*'(\.\/(?:(?!\.js).)*)';$/, (match, p1) => {
				return /\sfrom';$/.test(match) ? match : match.replace(p1, `${p1}.js`);
			})
	);
}
const removeSchemaInference: PreRenderHook = (
	outputAcc: Output,
	instantiatedConfig: InstantiatedConfig
) => {
	for (const fileName in outputAcc) {
		const file = outputAcc[fileName];
		for (const declaration of file.declarations) {
			if (declaration.declarationType === 'generic') {
				declaration.lines = declaration.lines.map((line: string) =>
					line
						.replaceAll(/: z\.Schema<.*>/g, '')
						.replaceAll(/ as any/g, '')
						.replaceAll(/z\.object\(/g, 'z.strictObject(')
				);
			}
		}
	}

	return outputAcc;
};

await kanel.processDatabase({
	connection: process.env.DATABASE_URL ?? '',
	outputPath,
	schemas: ['public'],
	resolveViews: true,
	preDeleteOutputFolder: true,
	enumStyle: 'type',
	// propertyCasing: 'camel',
	preRenderHooks: [
		makeGenerateZodSchemas({
			getZodSchemaMetadata(
				details: Details,
				generateFor: 'selector' | 'initializer' | 'mutator' | undefined,
				instantiatedConfig: InstantiatedConfig
			): { name: string; comment?: string[]; path: Path } {
				const { path, name: typescriptName } = instantiatedConfig.getMetadata(
					details,
					generateFor,
					instantiatedConfig
				);
				const name = 'z' + toPascalCase(typescriptName);
				return { path, name };
			},
			getZodIdentifierMetadata: defaultGetZodIdentifierMetadata,
			zodTypeMap: {
				...defaultZodTypeMap,
				'pg_catalog.numeric': 'z.number()',
				'pg_catalog.int4': 'z.number().int().max(2147483647)',
			},
			castToSchema: true,
		}),
		makeKyselyHook({
			databaseFilename: 'Database',
			getKyselyItemMetadata: (d, selectorName, canInitialize, canMutate) => {
				//this hack allows me to use the camelCase names in the PublicSchema.ts file
				const camelName = _.camelCase(d.name);
				d.name = camelName;

				return {
					tableInterfaceName: `${selectorName}Table`,
					selectableName: selectorName,
					insertableName: canInitialize ? `New${selectorName}` : undefined,
					updatableName: canMutate ? `${selectorName}Update` : undefined,
				};
			},
		}),
		removeSchemaInference,
	],
	postRenderHooks: [convertESMPaths],

	// Add a comment about the entity that the type represents above each type.
	getMetadata: (details, generateFor) => {
		const { comment: strippedComment } = tryParse(details.comment);
		const isAgentNoun = ['initializer', 'mutator'].includes(generateFor as string);

		const relationComment = isAgentNoun
			? `Represents the ${generateFor} for the ${details.kind} ${details.schemaName}.${details.name}`
			: `Represents the ${details.kind} ${details.schemaName}.${details.name}`;

		const suffix = isAgentNoun ? `_${generateFor}` : '';
		return {
			name: toPascalCase(details.name + suffix),
			comment: [relationComment, ...(strippedComment ? [strippedComment] : [])],
			path: join(outputPath, toPascalCase(details.name)),
		};
	},

	// Add a comment that says what the type of the column/attribute is in the database.
	getPropertyMetadata: (property, _details, generateFor) => {
		const { comment: strippedComment } = tryParse(property.comment);

		return {
			name: _.camelCase(property.name),
			comment: [
				`Database type: ${property.expandedType}`,
				...(generateFor === 'initializer' && property.defaultValue
					? [`Default value: ${property.defaultValue}`]
					: []),
				...(strippedComment ? [strippedComment] : []),
			],
		};
	},

	generateIdentifierType: (c, d, config) => {
		const tableName = toPascalCase(d.name);
		const name = toPascalCase(c.name);
		const fullName = tableName + name;
		const innerType = kanel.resolveType(c, d, {
			...config,
			// @ts-ignore
			generateIdentifierType: undefined,
		});
		return {
			declarationType: 'typeDeclaration',
			name: fullName,
			exportAs: 'named',
			typeDefinition: [`${innerType}`],
			comment: [],
		};
	},
	customTypeMap: {
		'pg_catalog.tsvector': 'Set<string>',
		'pg_catalog.int4': 'number',
		'pg_catalog.numeric': 'number',
		'pg_catalog.bpchar': 'string',
		'public.citext': 'string',
	},
});
