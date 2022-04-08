import {Recipe} from '../dao/RestAPI';

export type BaseNavigatorProps = {
    AccountActivationScreen: { activationId: string}
    PasswordResetScreen: { id: string}
    TermsOfServiceScreen: undefined
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
    RecipeGroupEditScreen: { recipeGroupId: number, editing: boolean}
    GuidedCookingScreen: { recipe: Recipe, scaledServings: number }
};

export type OverviewNavigationProps = {
    RecipesListScreen: undefined,
    WeeklyScreen: undefined,
    SettingsScreen: undefined,
}

export type RecipeScreenNavigation = {
    RecipeListDetailScreen: { shownRecipeGroupId?: number }
}
