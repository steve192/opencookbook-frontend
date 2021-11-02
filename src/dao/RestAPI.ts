import axios from "axios";
import Configuration from "../Configuration";


export interface Ingredient {
    id: number
    name: string
}

export interface IngredientUse {

    ingredient: Ingredient, amount: number, unit: string
}
export interface Recipe {
    title: string;
    neededIngredients: IngredientUse[];
    preparationSteps: string[];
}
class RestAPI {
    static async getRecipes(): Promise<Recipe[]> {
        //TODO: Implement API call
        return [
            {
                title: "Demo recipe",
                preparationSteps: ["Do stuff", "Do more stuff", "Done"],
                neededIngredients: [{ingredient: { id: 0, name: "Eatable" }, amount: 1, unit: ""}]
            },
            {
                title: "Demo recipe 2",
                preparationSteps: ["Do stuff", "Do more stuff", "Done"],
                neededIngredients: [{ingredient: { id: 0, name: "Eatable" }, amount: 1, unit: ""}]
            },
            {
                title: "Demo recipe 3",
                preparationSteps: ["Do stuff", "Do more stuff", "Done"],
                neededIngredients: [{ingredient: { id: 0, name: "Eatable" }, amount: 1, unit: ""}]
            },
            {
                title: "Demo recipe 4",
                preparationSteps: ["Do stuff", "Do more stuff", "Done"],
                neededIngredients: [{ingredient: { id: 0, name: "Eatable" }, amount: 1, unit: ""}]
            }
        ];
    }
    static async getIngredients(filter: string = ""): Promise<Ingredient[]> {
        //TODO: Implement API call
        return [
            { id: 1, name: "Zwiebel" },
            { id: 2, name: "Knoblauch" }
        ];
    }
    static async createNewRecipe(newRecipeData: Recipe) {
        alert(newRecipeData);
    }

    private static serverUrl = Configuration.getBackendURL();
    private static authToken: string;

    static async authenticate(emailAddress: string, password: string): Promise<void> {
        let response = await axios.post(this.url("/login"), {
            emailAddress: emailAddress,
            password: password
        });
        this.authToken = response.headers["Authentification"]

    }

    static async registerUser(emailAddress: string, password: string) {
        let response = await axios.post(this.url(Configuration.getApiRoute() + "/users/signup"), {
            emailAddress: emailAddress,
            password: password
        });
    }

    private static url(path: string): string {
        return RestAPI.serverUrl + path;
    }
}

export default RestAPI;