/** What an import sheet is for: a week of one plan, or one recipe at the servings it was showing. */
export type ShoppingImportTarget =
  | {kind: 'week', from: string, to: string, householdId?: string}
  | {kind: 'recipe', recipeId: number, servings: number};
