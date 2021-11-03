import { Recipe } from "../dao/RestAPI";

export type MainNavigationProps = {
    LoginScreen: undefined
    OverviewScreen: undefined
    RecipeWizardScreen: undefined
    RecipeScreen: {recipe: Recipe}
};

export type OverviewNavigationProps = {
    RecipesListScreen: undefined,
    WeeklyScreen: undefined,
}