import {NavigatorScreenParams} from '@react-navigation/core';
import {Recipe} from '../dao/RestAPI';

export type BaseNavigatorProps = {
    AccountActivationScreen: { activationId: string}
    PasswordResetScreen: { id: string}
    TermsOfServiceScreen: undefined
    default: undefined
}
export type LoginNavigationProps = {
    LoginScreen: undefined
    SignupScreen: undefined
    RequestPasswordResetScreen: undefined
}
export type MainNavigationProps = {
    OverviewScreen: NavigatorScreenParams<OverviewNavigationProps>
    RecipeImportBrowser: undefined
    RecipeWizardScreen: { editing?: boolean, recipeId?: number }
    RecipeScreen: { recipeId: number }
    ImportScreen: { importUrl?: string },
    RecipeOCRImportScreen: undefined,
    RecipeGroupEditScreen: { recipeGroupId?: number, editing: boolean}
    GuidedCookingScreen: { recipe: Recipe, scaledServings: number }
};

export type OverviewNavigationProps = {
    RecipesListScreen: NavigatorScreenParams<RecipeScreenNavigation>,
    WeeklyScreen: undefined,
    SettingsScreen: undefined,
}

export type RecipeScreenNavigation = {
    RecipeListDetailScreen: { shownRecipeGroupId?: number }
}
