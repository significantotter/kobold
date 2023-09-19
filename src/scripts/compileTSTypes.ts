import fs from 'fs';
import { compile } from 'json-schema-to-typescript';
import { JSONSchema4, JSONSchema7 } from 'json-schema';

// Type Files
import { Sheet } from '../services/kobold/lib/shared-schemas/sheet.schema.new.js';
import { Action } from '../services/kobold/lib/shared-schemas/action.schema.new.js';

const path = '../services/kobold/lib/shared-schemas';

const fileNameMapper: { [k: string]: JSONSchema7 } = {
	sheet: Sheet,
	action: Action,
};

for (const schemaName of Object.keys(fileNameMapper)) {
	compile(fileNameMapper[schemaName] as unknown as JSONSchema4, schemaName, {
		unreachableDefinitions: true,
		unknownAny: false,
		style: {
			useTabs: true,
			tabWidth: 1,
		},
	}).then(jsonSchemaOutput => {
		fs.writeFileSync(`${path}/${schemaName}.d.ts`, jsonSchemaOutput);
	});
}
