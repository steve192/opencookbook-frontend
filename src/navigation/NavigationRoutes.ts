import { Recipe, RecipeGroup } from "../dao/RestAPI";


export type LoginNavigationProps = {
    LoginScreen: undefined
    SignupScreen: undefined
}
export type MainNavigationProps = {
    OverviewScreen: undefined
    RecipeWizardScreen: { editing?: boolean, recipe?: Recipe, onRecipeChanged?: (changedRecipe: Recipe) => void, onRecipeDeleted?: () => void }
    RecipeScreen: { recipeId: number, onRecipeChanged?: () => void }
    ImportScreen: { importUrl?: string },
    RecipeGroupEditScreen: { recipeGroup?: RecipeGroup, onRecipeGroupChanges?: (changedRecipeGroup: RecipeGroup) => void }
    GuidedCookingScreen: { recipe: Recipe }
};

export type OverviewNavigationProps = {
    RecipesListScreen: undefined,
    WeeklyScreen: undefined,
}

export type RecipeScreenNavigation = {
    RecipeListDetailScreen: { shownRecipeGroup?: RecipeGroup }
}
