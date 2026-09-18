export const palette = {
  accent: '#F59E0B',
  'accent-strong': '#FBBF24',
  'accent-soft': '#92400E',
  'on-accent': '#451A03',
  background: '#FFF7E6',
  surface: '#FFFFFF',
  elevated: '#FFFDF5',
  'text-primary': '#1C1917',
  'text-secondary': '#57534E',
  line: '#FDE68A',
} as const;

export type PaletteKey = keyof typeof palette;