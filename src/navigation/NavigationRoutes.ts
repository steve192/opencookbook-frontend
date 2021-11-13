import { Recipe, RecipeGroup } from "../dao/RestAPI";

export type MainNavigationProps = {
    LoginScreen: undefined
    SignupScreen: undefined
    OverviewScreen: undefined
    RecipeWizardScreen: { editing?: boolean, recipe?: Recipe, onRecipeChanged?: (changedRecipe: Recipe) => void, onRecipeDeleted?: () => void }
    RecipeScreen: { recipeId: number, onRecipeChanged?: () => void }
    ImportScreen: { importUrl?: string },
    RecipeGroupEditScreen: { recipeGroup? : RecipeGroup, onRecipeGroupChanges? : (changedRecipeGroup: RecipeGroup) => void}
};

export type OverviewNavigationProps = {
    RecipesListScreen: { shownRecipeGroup?: RecipeGroup },
    WeeklyScreen: undefined,
}
