import {
	InitiativeFactory,
	InitiativeActorFactory,
	InitiativeActorGroupFactory,
} from '../services/kobold/models/index.js';
import * as initiativeUtils from './initiative-utils.js';

// setup jest tests for each function in ./initiative-utils.ts
describe('initiative-utils', function () {
	describe('InitiativeBuilder', function () {
		test('creates an empty initiative', function () {
			const builder = new initiativeUtils.InitiativeBuilder({});
			expect(builder).toBeDefined();
		});
	});
});
