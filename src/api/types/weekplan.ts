export interface WeekplanDayRecipeInfo {
    // A meal that has not been sent to the server yet has neither an id nor an image
    id?: number | string;
    title: string;
    type: 'SIMPLE_RECIPE' | 'NORMAL_RECIPE'
    titleImageUuid?: string;
    /** Servings cooked; null for leftovers. Sent as null, the recipe's own servings. */
    servings?: number | null;
    /** The day (yyyy-MM-dd) whose cooking this meal eats the leftovers of. */
    leftoverOf?: string | null;
}

/**
 * What the weekplan endpoint accepts when a day is written back. It is a subset
 * of what it returns: the title of a saved recipe is resolved server side, and
 * only a spontaneous meal carries one of its own.
 */
export interface WeekplanDayRecipeRequest {
    id?: number | string;
    type: 'SIMPLE_RECIPE' | 'NORMAL_RECIPE'
    title?: string;
    servings?: number | null;
    leftoverOf?: string | null;
}

export interface WeekplanDay {
    day: string,
    recipes: WeekplanDayRecipeInfo[]
    /** Which plan the day belongs to; absent for your own. */
    householdId?: string | null;
    householdName?: string | null;
}
