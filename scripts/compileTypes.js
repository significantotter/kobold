const Glob = require('glob');
const path = require('path');
const fs = require('fs');
const compile = require('json-schema-to-typescript').compile;

const files = Glob.sync('src/**/*.schema.json');

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
