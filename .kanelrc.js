// @ts-check
require('dotenv').config();
const { join } = require('path');
const _ = require('lodash');
const { tryParse } = require('tagged-comment-parser');

const { generateIndexFile } = require('kanel');
const {
	makeGenerateZodSchemas,
	defaultGetZodSchemaMetadata,
	defaultGetZodIdentifierMetadata,
	defaultZodTypeMap,
} = require('kanel-zod');
const { makeKyselyHook } = require('kanel-kysely');

const outputPath = './src/services/kobold/schemas/kanel';

const toCamelCase = _.camelCase;
const toPascalCase = (k)=>(_.capitalize(_.camelCase(k)));
const generateZodSchemas = makeGenerateZodSchemas({
	getZodSchemaMetadata: defaultGetZodSchemaMetadata,
	getZodIdentifierMetadata: defaultGetZodIdentifierMetadata,
	zodTypeMap: defaultZodTypeMap,
});

/** @type {import('kanel').Config} */
module.exports = {
	connection: {
		client: 'postgresql',
		connection: process.env.DATABASE_URL,
		pool: {
			min: 2,
			max: 10,
		},
	},

	outputPath,
	resolveViews: true,
	preDeleteOutputFolder: true,

	// Generate an index file with exports of everything
	preRenderHooks: [generateIndexFile, generateZodSchemas, makeKyselyHook()],

};
