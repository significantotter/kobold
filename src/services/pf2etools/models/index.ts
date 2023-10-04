import * as ModelImports from './index.models.js';
export * from './index.models.js';
export * from '../schemas/index-types.js';

const modelsArray = Object.values(ModelImports);
export const Models = modelsArray;
