/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
export default {
	preset: 'ts-jest',
	testEnvironment: 'node',
	setupFilesAfterEnv: ['./jest.setup.ts'],
	transform: {
		'\\.[jt]sx?$': [
			'ts-jest',
			{
				useESM: true,
			},
		],
	},
	moduleNameMapper: {
		'discord.js': 'discord.js',
		'(.+)\\.js': '$1',
	},
	modulePathIgnorePatterns: ['discord.js'],
	moduleDirectories: ['node_modules', 'src'],
	extensionsToTreatAsEsm: ['.ts', '.json'],
};
