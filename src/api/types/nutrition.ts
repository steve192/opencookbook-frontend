/** Grams, except energy. */
export interface Nutrients {
    energyKcal: number | null;
    energyKj: number | null;
    fat: number | null;
    saturatedFat: number | null;
    carbohydrates: number | null;
    sugar: number | null;
    fibre: number | null;
    protein: number | null;
    salt: number | null;
}

/** UNAVAILABLE values are not shown. */
export interface NutritionSummary {
    basis: 'SERVING' | 'RECIPE';
    status: 'COMPLETE' | 'INCOMPLETE' | 'UNAVAILABLE';
    values: Nutrients;
    warningCount: number;
}

export type NutritionLineStatus = 'RESOLVED' | 'EXCLUDED' | 'UNLINKED' | 'UNIT_UNKNOWN' | 'NO_PORTION' | 'NO_AMOUNT';

export type NutritionLineFlag = 'LOW_CONFIDENCE' | 'VOLUME_WITHOUT_DENSITY' | 'ESTIMATED_PORTION' |
    'SIZE_SCALED_PORTION' | 'TYPICAL_CONTAINER_SIZE' | 'PINCH';

export interface NutritionLine {
    /** Null for shared recipes. */
    ingredientId: number | null;
    ingredientName: string;
    amount: number | null;
    unit: string | null;
    grams: number | null;
    values: Nutrients;
    food: {id: number, displayName: string, sourceName: string | null} | null;
    status: NutritionLineStatus;
    flags: NutritionLineFlag[];
    /** Null for shared recipes. */
    ownPortion: boolean | null;
    warns: boolean;
}

export interface NutritionAttribution {
    source: string;
    text: string;
    license: string;
    licenseUrl: string;
}

export interface RecipeNutrition {
    summary: NutritionSummary;
    lines: NutritionLine[];
    attributions: NutritionAttribution[];
}

export interface NutritionOfRecipe {
    recipeId: number;
    nutrition: RecipeNutrition;
}

export interface CatalogueFood {
    id: number;
    displayName: string;
    sourceName: string | null;
    /** Per 100 g. */
    energyKcal: number | null;
}
