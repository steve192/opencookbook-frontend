import {NutritionSummary} from './nutrition';

export interface Ingredient {
    id?: number
    name: string
}

export interface IngredientUse {
    ingredient: Ingredient
    amount: number | null
    unit: string
}

export interface RecipeImage {
    uuid: string
}

export type RecipeDiet = 'VEGAN' | 'VEGETARIAN' | 'MEAT';

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' | 'DESSERT';

/** What a recipe is when it is not a dish of its own; neither is planned or suggested as a meal. */
export type DishRole = 'SIDE' | 'COMPONENT';

export interface Recipe {
    id?: number
    title: string;
    neededIngredients: IngredientUse[];
    preparationSteps: string[];
    images: RecipeImage[];
    servings: number;
    recipeGroups: RecipeGroup[];
    type: 'Recipe'
    recipeSource?: string;
    // The server stores these and accepts them back on every write. Leaving them off the
    // client type meant the app sent null for all three, so saving a recipe erased the
    // times an import had found for it.
    preparationTime?: number | null;
    totalTime?: number | null;
    recipeType?: RecipeDiet | null;
    /** Empty while nobody has said which meals this suits, which keeps it eligible for all but breakfast. */
    mealTypes?: MealType[];
    /** Null for a dish. */
    dishRole?: DishRole | null;
    /** Absent where the instance does not estimate nutrition. */
    nutrition?: NutritionSummary | null;
    /** Whether you may edit it; absent where nobody in particular is reading, as in a share. */
    mine?: boolean | null;
    /** Who wrote it, for a recipe read through a household. Absent for your own. */
    ownerDisplayName?: string | null;
    /** Your households whose cookbook shows it; only in the cookbook listing. */
    householdIds?: string[];
}

/** A recipe website is saved; text and Instagram posts come back as an unsaved draft. */
export interface RecipeImport {
    recipe: Recipe;
    saved: boolean;
}

export interface RecipeGroup {
    id?: number;
    title: string;
    type: 'RecipeGroup'
}

/** What deleting a recipe would take with it. */
export interface RecipeDeletionImpact {
  households: number;
  plannedMeals: number;
}
