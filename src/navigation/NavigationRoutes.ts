import { Recipe } from "../dao/RestAPI";

export type MainNavigationProps = {
    LoginScreen: undefined
    SignupScreen: undefined
    OverviewScreen: undefined
    RecipeWizardScreen: undefined
    RecipeScreen: {recipeId: number}
    ImportScreen: {importUrl?: string}
};

export type OverviewNavigationProps = {
    RecipesListScreen: undefined,
    WeeklyScreen: undefined,
}