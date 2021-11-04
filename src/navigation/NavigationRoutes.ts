import { Recipe } from "../dao/RestAPI";

export type MainNavigationProps = {
    LoginScreen: undefined
    OverviewScreen: undefined
    RecipeWizardScreen: undefined
    RecipeScreen: {recipeId: number}
};

export type OverviewNavigationProps = {
    RecipesListScreen: undefined,
    WeeklyScreen: undefined,
}