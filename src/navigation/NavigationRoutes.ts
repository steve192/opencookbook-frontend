import { Recipe } from "../dao/RestAPI";

export type MainNavigationProps = {
    LoginScreen: undefined
    SignupScreen: undefined
    OverviewScreen: undefined
    RecipeWizardScreen: { editing?: boolean, recipe?: Recipe, onRecipeChanged?: (changedRecipe: Recipe) => void, onRecipeDeleted?: () => void}
    RecipeScreen: { recipeId: number,  onRecipeChanged?: () => void }
    ImportScreen: { importUrl?: string }
};

export type OverviewNavigationProps = {
    RecipesListScreen: undefined,
    WeeklyScreen: undefined,
}