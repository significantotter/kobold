import {glob} from 'glob'
import path from 'path'
import fs from 'fs'
import {compile} from 'json-schema-to-typescript';

const files = glob.sync('src/**/*.schema.json');

for (const file of files) {
	const filePath = path.parse(file);

	const jsonSchemaText = fs.readFileSync(file, 'utf-8');
	const jsonSchemaInput = JSON.parse(jsonSchemaText);

	const jsonSchemaOutput = compile(jsonSchemaInput, filePath.name, {
		unreachableDefinitions: true,
		unknownAny: false,
		style: {
			useTabs: true,
			tabWidth: 1,
		},
	}).then(jsonSchemaOutput => {
		fs.writeFileSync(`${filePath.dir}/${filePath.name}.d.ts`, jsonSchemaOutput);
	});
}