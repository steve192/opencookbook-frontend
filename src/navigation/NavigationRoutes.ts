import {NavigatorScreenParams} from '@react-navigation/native';
import {ShoppingImportTarget} from '../helper/shopping/importTarget';

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
    RecipeSuggestionScreen: undefined
    /** The week preselected for planning, in weeks from the current one. */
    WeekplanWizardScreen: { weekOffset: number, householdId?: string }
    PlanDraftScreen: { draftId: number, householdId?: string }
    RecipeScreen: { recipeId: number }
    ImportScreen: { importUrl?: string },
    RecipeGroupEditScreen: { recipeGroupId?: number, editing: boolean}
    /** By id rather than the recipe itself: parameters go into the address bar, where a recipe is "[object Object]". */
    GuidedCookingScreen: { recipeId: number, scaledServings: number, initialStep?: number }
    HouseholdListScreen: undefined
    HouseholdScreen: { householdId: string }
    /** Opening an invitation link. The token is the invitation. */
    HouseholdInviteScreen: { token: string }
    ShoppingImportScreen: ShoppingImportTarget
    ShoppingListsScreen: undefined
    StaplesScreen: undefined
    OpenSourceLicensesScreen: undefined
    AccountSettingsScreen: undefined
    ShoppingSettingsScreen: undefined
    PlanningSettingsScreen: undefined
    ScanningSettingsScreen: undefined
    AppearanceSettingsScreen: undefined
};

export type OverviewNavigationProps = {
    RecipesListScreen: NavigatorScreenParams<RecipeScreenNavigation>,
    WeeklyScreen: undefined,
    ShoppingScreen: undefined,
    SettingsScreen: undefined,
}

export type RecipeScreenNavigation = {
    RecipeListDetailScreen: { shownRecipeGroupId?: number }
}
