

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/0.2dACa3gy.js","_app/immutable/chunks/scheduler.BvLojk_z.js","_app/immutable/chunks/index.D6A44wRX.js"];
export const stylesheets = [];
export const fonts = [];
