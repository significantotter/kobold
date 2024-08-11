

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.BkKwzRjg.js","_app/immutable/chunks/scheduler.BvLojk_z.js","_app/immutable/chunks/index.DFTQtrJW.js","_app/immutable/chunks/entry.Bh3PbIYB.js"];
export const stylesheets = [];
export const fonts = [];
