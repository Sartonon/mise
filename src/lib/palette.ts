// The colour palettes defined in src/styles/palettes.css. `as const` keeps the exact names,
// so `Palette` is the union 'tomato' | 'matcha' | ..., not just `string`.
export const palettes = ['tomato', 'matcha', 'saffron', 'nordic', 'fig'] as const
export type Palette = (typeof palettes)[number]

// The switch: change this to use another palette everywhere. A name that isn't in the list
// above is a type error. __root.tsx puts it on <html data-palette="...">, which picks the
// matching block in palettes.css.
export const palette: Palette = 'tomato'
