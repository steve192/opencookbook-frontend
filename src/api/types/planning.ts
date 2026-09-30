import {Ingredient, MealType, Recipe, RecipeDiet} from './recipes';

/** How the ingredients a cook named are meant. */
export type SuggestionMatchMode = 'ANY_RANKED' | 'MUST_CONTAIN';

export type MacroStyle = 'BALANCED' | 'LOW_CARB' | 'LOW_FAT' | 'HIGH_PROTEIN';

/** Everything is optional: a request answering nothing is a valid "surprise me". */
export interface RecipeSuggestionRequest {
  mode?: SuggestionMatchMode;
  ingredientIds?: number[];
  maxTotalTimeMinutes?: number | null;
  diet?: RecipeDiet | null;
  mealTypes?: MealType[];
  targetKcalPerServing?: number | null;
  macroStyle?: MacroStyle | null;
  /** Also draw on the household cookbooks you may read; left out means no. */
  includeHouseholdRecipes?: boolean;
  limit?: number;
  /** Repeat a seed to get that result set back; leave it out for a new draw. */
  seed?: number | null;
}

/** Why a recipe was chosen: a key and its weight. The app writes the sentence; the server never sends prose. */
export interface ScoreReason {
  term: string;
  value: number;
}

export interface SuggestedRecipe {
  recipe: Recipe;
  score: number;
  matchedIngredients: Ingredient[];
  missingIngredients: Ingredient[];
  reasons: ScoreReason[];
}

/**
 * Where the cookbook was narrowed, so an empty list can say which answer emptied it:
 * `owned` to `afterFilters` is what diet, time and meal removed, `afterFilters` to `matched`
 * what the wanted ingredients did.
 */
export interface SuggestionPoolStats {
  owned: number;
  afterFilters: number;
  matched: number;
  returned: number;
}

export interface RecipeSuggestions {
  seed: number;
  results: SuggestedRecipe[];
  /** One wanted ingredient short, kept apart so MUST_CONTAIN still means what it says. */
  nearMisses: SuggestedRecipe[];
  poolStats: SuggestionPoolStats;
}

/** How much work a meal may be, judged against the cook's own cookbook. */
export type Effort = 'SIMPLE' | 'ANY' | 'ELABORATE';

export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

/** How one meal of the day is planned. */
export interface PlanningMeal {
  mealType: MealType;
  /** The weekdays it is cooked, each with how much work it may be; on the others it is a gap. */
  days: Partial<Record<DayOfWeek, Effort>>;
  /** Per serving; left out, the meal gets an even share of the daily calories. */
  targetKcal?: number | null;
}

/** Something the cook has and wants used up; without an amount it is worth one recipe. */
export interface PantryEntry {
  ingredientId: number;
  amount?: number | null;
  unit?: string | null;
}

/** A cook's answers to the weekplan wizard, kept so that next week is one tap. */
export interface PlanningProfile {
  id?: number;
  name: string;
  defaultProfile?: boolean;
  householdSize?: number;
  diet?: RecipeDiet | null;
  meatMealsPerWeek?: number | null;
  kcalPerDay?: number | null;
  macroStyle?: MacroStyle | null;
  cooldownWeeks?: number;
  leftoversAllowed?: boolean;
  spreadVariety?: boolean;
  /** A personal plan also draws on the household cookbooks you may read; ignored for a household's. */
  includeHouseholdRecipes?: boolean;
  meals: PlanningMeal[];
  pantry?: PantryEntry[];
  avoidedIngredientIds?: number[];
}

export type PlanSlotKind = 'COOKED' | 'LEFTOVER' | 'GAP';

/** Why a cook passed over a planned recipe; each steers the replacement away from what put them off. */
export type RerollReason = 'HAD_RECENTLY' | 'TOO_MUCH_WORK' | 'MISSING_INGREDIENTS' | 'NOT_A_FULL_MEAL';

/** One meal of a proposed week. */
export interface PlanSlot {
  id: number;
  date: string;
  mealType: MealType;
  kind: PlanSlotKind;
  /** Null for a gap, and for a meal the cookbook had nothing for. */
  recipe: Recipe | null;
  servings: number | null;
  /** For a leftover, the id of the slot where it is cooked. */
  leftoverOf: number | null;
  locked: boolean;
  reasons: ScoreReason[];
}

/** A proposed week. Nothing reaches the weekplan until it is accepted. */
export interface PlanDraft {
  id: number;
  profileId: number | null;
  startDate: string;
  days: number;
  status: 'DRAFT' | 'ACCEPTED' | 'DISCARDED';
  slots: PlanSlot[];
}
