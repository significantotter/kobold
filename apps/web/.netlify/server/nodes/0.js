

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/0.V07vbrzA.js","_app/immutable/chunks/scheduler.BvLojk_z.js","_app/immutable/chunks/index.DFTQtrJW.js"];
export const stylesheets = [];
export const fonts = [];
