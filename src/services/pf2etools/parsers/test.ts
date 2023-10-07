import z from 'zod';
const foo = z.object({
	name: z.string(),
	traits: z.array(z.string()),
	cost: z.string(),
	prerequisites: z.string(),
	requirements: z.string(),
});

const bar = z.object({
	name: z.string(),
	cost: z.string(),
	frequency: z.string(),
	prerequisites: z.string(),
	entries: z.array(z.string()),
});

const parsers = {
	traits: () => {},
	cost: () => {},
	prerequisites: () => {},
	requirements: () => {},
	frequency: () => {},
	entries: () => {},
};

type Expand<T> = T extends T ? { [P in keyof T]: T[P] } : never;

type ZodKeys<T extends z.ZodType<any, z.ZodObjectDef>> = keyof z.infer<T>;

function getParsersFunction<T extends z.ZodType<any, z.ZodObjectDef>>(
	zodObject: T
): Expand<Pick<typeof parsers, ZodKeys<T> & keyof typeof parsers>> {
	const keys = Object.keys(zodObject._def.shape) as ZodKeys<T>[];

	const result: Partial<Pick<typeof parsers, ZodKeys<T> & keyof typeof parsers>> = {};
	for (const key of keys) {
		if (hasKey(parsers, key)) {
			result[key] = parsers[key];
		}
	}
	return result as never;
}

function hasKey<T extends {}, K extends PropertyKey>(obj: T, key: K): key is keyof T & K {
	return key in obj;
}

const fooParsers = getParsersFunction(foo);
// { traits: ()=>{}, cost: ()=>{}, prerequisites: ()=>{}, requirements: ()=>{} }
const barParsers = getParsersFunction(bar);
// { cost: ()=>{}, frequency: ()=>{}, prerequisites: ()=>{}, entries: ()=>{} }
