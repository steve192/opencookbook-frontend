/** A public link to one of your own recipes. */
export interface RecipeShare {
  shareId: string;
  shareUrl: string;
  recipeId: number;
  /** When the link stops working, as an ISO instant. Fixed when it was created. */
  expiresAt: string;
  accessCount: number;
}
