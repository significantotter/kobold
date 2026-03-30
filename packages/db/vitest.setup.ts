import { setFaker } from 'zod-schema-faker/v4';
import { faker } from '@faker-js/faker';

// Initialize zod-schema-faker with faker instance globally before any tests run
setFaker(faker);
