import {NutritionLine, NutritionLineFlag, NutritionLineStatus, NutritionSummary, Nutrients} from '../dao/RestAPI';

export type LineNoteKey =
  | `nutrition.lineStatus.${Exclude<NutritionLineStatus, 'RESOLVED'>}`
  | `nutrition.lineFlag.${NutritionLineFlag}`;

export interface NutrientRow {
  key: keyof Nutrients;
  labelKey: `nutrition.nutrients.${'energy' | 'fat' | 'saturatedFat' | 'carbohydrates' | 'sugar' | 'fibre' | 'protein' | 'salt'}`;
  unit: 'kcal' | 'g';
  /** "of which saturates", listed under fat. */
  partOfAbove: boolean;
}

// In food label order.
export const NUTRIENT_ROWS: NutrientRow[] = [
  {key: 'energyKcal', labelKey: 'nutrition.nutrients.energy', unit: 'kcal', partOfAbove: false},
  {key: 'fat', labelKey: 'nutrition.nutrients.fat', unit: 'g', partOfAbove: false},
  {key: 'saturatedFat', labelKey: 'nutrition.nutrients.saturatedFat', unit: 'g', partOfAbove: true},
  {key: 'carbohydrates', labelKey: 'nutrition.nutrients.carbohydrates', unit: 'g', partOfAbove: false},
  {key: 'sugar', labelKey: 'nutrition.nutrients.sugar', unit: 'g', partOfAbove: true},
  {key: 'fibre', labelKey: 'nutrition.nutrients.fibre', unit: 'g', partOfAbove: false},
  {key: 'protein', labelKey: 'nutrition.nutrients.protein', unit: 'g', partOfAbove: false},
  {key: 'salt', labelKey: 'nutrition.nutrients.salt', unit: 'g', partOfAbove: false},
];

// Most telling first.
const FLAG_ORDER: NutritionLineFlag[] = ['LOW_CONFIDENCE', 'VOLUME_WITHOUT_DENSITY', 'TYPICAL_CONTAINER_SIZE',
  'SIZE_SCALED_PORTION', 'ESTIMATED_PORTION', 'PINCH'];

// No more precision than an estimate has: whole kcal, whole grams from 10 g.
export const formatNutrient = (value: number | null, unit: 'kcal' | 'g', language: string): string => {
  if (value === null) {
    return '–';
  }
  const fractionDigits = unit === 'kcal' || value >= 10 ? 0 : 1;
  const number = value.toLocaleString(language, {maximumFractionDigits: fractionDigits, minimumFractionDigits: 0});
  return `${number} ${unit}`;
};

export const formatEstimate = (value: number | null, unit: 'kcal' | 'g', language: string): string =>
  value === null ? formatNutrient(value, unit, language) : `≈ ${formatNutrient(value, unit, language)}`;

export const scaleNutrients = (values: Nutrients, factor: number): Nutrients =>
  Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value === null ? null : value * factor])) as
    unknown as Nutrients;

export interface NutritionColumns {
  /** Absent for a recipe that names no servings. */
  perServing?: Nutrients;
  total: Nutrients;
  /** Absent when the total is the whole recipe. */
  totalServings?: number;
}

export const nutritionColumns = (summary: NutritionSummary, scaledServings: number): NutritionColumns => {
  if (summary.basis === 'RECIPE') {
    return {total: summary.values};
  }
  return {
    perServing: summary.values,
    total: scaleNutrients(summary.values, scaledServings),
    totalServings: scaledServings,
  };
};

export const linesWarningFirst = (lines: NutritionLine[]): NutritionLine[] =>
  [...lines.filter((line) => line.warns), ...lines.filter((line) => !line.warns)];

const GUESSED_PIECE_FLAGS: NutritionLineFlag[] = ['ESTIMATED_PORTION', 'SIZE_SCALED_PORTION', 'TYPICAL_CONTAINER_SIZE'];

// Counted pieces whose weight is unknown, guessed, or already the owner's.
export const canWeighPieces = (line: NutritionLine): boolean =>
  line.ingredientId !== null && line.amount !== null &&
  (line.status === 'NO_PORTION' || line.ownPortion === true || line.flags.some((flag) => GUESSED_PIECE_FLAGS.includes(flag)));

export const lineNoteKeys = (line: NutritionLine): LineNoteKey[] => {
  if (line.status !== 'RESOLVED') {
    return [`nutrition.lineStatus.${line.status}`];
  }
  return FLAG_ORDER.filter((flag) => line.flags.includes(flag)).map((flag): LineNoteKey => `nutrition.lineFlag.${flag}`);
};
