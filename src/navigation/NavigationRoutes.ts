import {Recipe, RecipeGroup} from '../dao/RestAPI';

export type BaseNavigatorProps = {
    AccountActivationScreen: { activationId: string}
    PasswordResetScreen: { id: string}
}
export type LoginNavigationProps = {
    LoginScreen: undefined
    SignupScreen: undefined
    RequestPasswordResetScreen: undefined
}
export type MainNavigationProps = {
    OverviewScreen: undefined
    RecipeWizardScreen: { editing?: boolean, recipeId?: number }
    RecipeScreen: { recipeId: number }
    ImportScreen: { importUrl?: string },
    RecipeGroupEditScreen: { recipeGroup?: RecipeGroup, onRecipeGroupChanges?: (changedRecipeGroup: RecipeGroup) => void }
    GuidedCookingScreen: { recipe: Recipe, scaledServings: number }
};

export type OverviewNavigationProps = {
    RecipesListScreen: undefined,
    WeeklyScreen: undefined,
}

export type RecipeScreenNavigation = {
    RecipeListDetailScreen: { shownRecipeGroupId?: number }
}
