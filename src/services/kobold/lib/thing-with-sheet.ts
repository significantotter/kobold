import { Sheet } from './sheet.schema.js';

export type ModelWithSheet = {
	name?: string;
	sheet?: Sheet;
	hideStats?: boolean;
	saveSheet(sheet: Sheet): Promise<void>;
	[key: string]: any;
};
