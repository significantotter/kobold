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
		'(.+)\\.js': '$1',
	},
	moduleDirectories: ['node_modules', 'src'],
	extensionsToTreatAsEsm: ['.ts', '.json'],
};
