/**
 * Fixed-order categorical palette, validated for CVD-safe adjacent contrast
 * (dataviz skill reference palette). Assign by an entity's stable index —
 * never by sort/count rank — so a color always means the same category.
 */
export const CATEGORICAL_COLORS = [
  '#2a78d6', // blue
  '#eb6834', // orange
  '#1baf7a', // aqua
  '#eda100', // yellow
  '#e87ba4', // magenta
  '#008300', // green
  '#4a3aa7', // violet
  '#e34948', // red
] as const

const OTHER_COLOR = '#8a8477' // ink-muted-ish neutral for the folded "그 외" bucket

export function colorForIndex(index: number): string {
  if (index < 0 || index >= CATEGORICAL_COLORS.length - 1) return OTHER_COLOR
  return CATEGORICAL_COLORS[index]
}
