/**
 * The address of every screen on the web. Everything in an address is text, so a number or a flag a
 * screen takes is parsed back here; without that a reload handed `recipeId: "3"` to a screen comparing
 * it with a number, and `editing: "false"`, which is true.
 */

const flag = (value: string): boolean => value === 'true';

export const LINKING_SCREENS = {
  AccountActivationScreen: 'activateAccount',
  PasswordResetScreen: 'resetPassword',
  LegalDocumentScreen: 'legal/:document',
  SharedRecipeScreen: 'share/:shareId',
  default: {
    // Beneath any linked screen, so it has somewhere to go back to. The login stack
    // has no such route and drops it.
    initialRouteName: 'OverviewScreen',
    screens: {
      LoginScreen: 'login',
      SignupScreen: 'signup',
      RequestPasswordResetScreen: 'requestResetPassword',
      RecipeScreen: {path: 'recipe', parse: {recipeId: Number}},
      RecipeWizardScreen: {path: 'editRecipe', parse: {recipeId: Number, editing: flag, hasDraft: flag}},
      RecipeGroupEditScreen: {path: 'editRecipeGroup', parse: {recipeGroupId: Number, editing: flag}},
      WeekplanWizardScreen: {path: 'planWeek', parse: {weekOffset: Number}},
      PlanDraftScreen: {path: 'planDraft', parse: {draftId: Number}},
      GuidedCookingScreen: {path: 'cook', parse: {recipeId: Number, scaledServings: Number, initialStep: Number}},
      ImportScreen: 'import',
      RecipeScanScreen: 'scanRecipe',
      HouseholdListScreen: 'households',
      HouseholdScreen: 'household',
      HouseholdInviteScreen: 'household-invite/:token',
      ShoppingImportScreen: {path: 'addToShoppingList', parse: {recipeId: Number, servings: Number}},
      ShoppingListsScreen: 'shoppingLists',
      StaplesScreen: 'settings/shopping/usuallyAtHome',
      OpenSourceLicensesScreen: 'settings/licenses',
      AccountSettingsScreen: 'settings/account',
      ShoppingSettingsScreen: 'settings/shopping',
      PlanningSettingsScreen: 'settings/planning',
      ScanningSettingsScreen: 'settings/scanning',
      AppearanceSettingsScreen: 'settings/appearance',
      ApiKeysScreen: 'settings/apiKeys',
      OverviewScreen: {
        screens: {
          SettingsScreen: 'settings',
          WeeklyScreen: 'weekly',
          ShoppingScreen: 'shopping',
          RecipesListScreen: {
            screens: {
              RecipeListDetailScreen: {path: 'myRecipes', parse: {shownRecipeGroupId: Number}},
            },
          },
        },
      },
    },
  },
};
