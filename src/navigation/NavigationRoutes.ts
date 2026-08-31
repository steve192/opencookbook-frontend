import {NavigatorScreenParams} from '@react-navigation/native';
import {Recipe} from '../dao/RestAPI';

export type BaseNavigatorProps = {
    AccountActivationScreen: { activationId: string}
    PasswordResetScreen: { id: string}
    TermsOfServiceScreen: undefined
    // Holds the login stack until somebody is signed in and the main one afterwards. Typed
    // as the main one so that reaching a screen from outside the app - from a notification,
    // say - is checked rather than cast away.
    default: NavigatorScreenParams<MainNavigationProps> | undefined
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
    RecipeGroupEditScreen: { recipeGroupId?: number, editing: boolean}
    GuidedCookingScreen: { recipe: Recipe, scaledServings: number, initialStep?: number }
};

export type OverviewNavigationProps = {
    RecipesListScreen: NavigatorScreenParams<RecipeScreenNavigation>,
    WeeklyScreen: undefined,
    SettingsScreen: undefined,
}

export type RecipeScreenNavigation = {
    RecipeListDetailScreen: { shownRecipeGroupId?: number }
}
