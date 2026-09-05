import {NavigatorScreenParams} from '@react-navigation/native';
import {Recipe} from '../dao/RestAPI';

export type BaseNavigatorProps = {
    AccountActivationScreen: { activationId: string}
    PasswordResetScreen: { id: string}
    TermsOfServiceScreen: undefined
    // Outside the authenticated navigator on purpose: a public link that demanded an account
    // would not be public. Only saving the recipe needs one.
    SharedRecipeScreen: { shareId: string }
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
    /**
     * `hasDraft` opens the wizard on an unsaved recipe left in `recipeDraftHandover`. A flag
     * rather than the recipe itself: navigation parameters go into the address bar, where a
     * recipe becomes "[object Object]".
     */
    RecipeWizardScreen: { editing?: boolean, recipeId?: number, hasDraft?: boolean }
    RecipeScanScreen: undefined
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
