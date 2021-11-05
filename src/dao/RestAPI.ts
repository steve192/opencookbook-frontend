import axios, { AxiosRequestConfig } from "axios";
import Configuration from "../Configuration";


export interface Ingredient {
    id: number | undefined
    name: string
}

export interface IngredientUse {
    ingredient: Ingredient
    amount: number | undefined
    unit: string
}
export interface Recipe {
    title: string;
    neededIngredients: IngredientUse[];
    preparationSteps: string[];
}
class RestAPI {
    static async getRecipeById(recipeId: number): Promise<Recipe> {
        return {
            title: "Demo recipe",
            preparationSteps: [
                "Do stuff and prepare shit. This is a very long description with a lot of words in it\nIt also\n has multiple\n lines",
                "Do more stuff",
                "Bake the shit out of that thing\n also make sure to check every 30 seconds\nok?",
                "Done"],
            neededIngredients: [
                { ingredient: { id: 0, name: "Eatable stuff with long name" }, amount: 1, unit: "Parts" },
                { ingredient: { id: 0, name: "Eatable" }, amount: 1, unit: "" },
                { ingredient: { id: 0, name: "Eatable" }, amount: 1, unit: "" }
            ]
        }
    }
    static async getRecipes(): Promise<Recipe[]> {
        //TODO: Implement API call
        return [
            {
                title: "Demo recipe",
                preparationSteps: [
                    "Do stuff and prepare shit. This is a very long description with a lot of words in it\nIt also\n has multiple\n lines",
                    "Do more stuff",
                    "Bake the shit out of that thing\n also make sure to check every 30 seconds\nok?",
                    "Done"],
                neededIngredients: [
                    { ingredient: { id: 0, name: "Eatable stuff with long name" }, amount: 1, unit: "Parts" },
                    { ingredient: { id: 0, name: "Eatable" }, amount: 1, unit: "" },
                    { ingredient: { id: 0, name: "Eatable" }, amount: 1, unit: "" }
                ]
            },
            {
                title: "Demo recipe 2",
                preparationSteps: ["Do stuff", "Do more stuff", "Done"],
                neededIngredients: [{ ingredient: { id: 0, name: "Eatable" }, amount: 1, unit: "" }]
            },
            {
                title: "Demo recipe 3",
                preparationSteps: ["Do stuff", "Do more stuff", "Done"],
                neededIngredients: [{ ingredient: { id: 0, name: "Eatable" }, amount: 1, unit: "" }]
            },
            {
                title: "Demo recipe 4",
                preparationSteps: ["Do stuff", "Do more stuff", "Done"],
                neededIngredients: [{ ingredient: { id: 0, name: "Eatable" }, amount: 1, unit: "" }]
            }
        ];
    }

    static axiosConfig(): AxiosRequestConfig {
        return {
            headers: {"Authorization": "Bearer " + this.authToken}
        }
    }
    static async getIngredients(filter: string = ""): Promise<Ingredient[]> {
        //TODO: Implement API call
        let response = await axios.get(this.url("/ingredients"), this.axiosConfig());
        if (response.status > 299) {
            throw Error("Server error");
        }
        return response.data;
    }
    static async createNewRecipe(newRecipeData: Recipe) {
        let response = await axios.post(this.url("/recipes"),newRecipeData, this.axiosConfig());

        if (response.status > 299) {
            throw Error("Server responded with http " + response.status);
        }
    }

    private static authToken: string;

    static async authenticate(emailAddress: string, password: string): Promise<void> {
        let response = await axios.post(this.url("/users/login"), {
            emailAddress: emailAddress,
            password: password
        });

        if (response.status > 299) {
            throw Error("Server responded with http " + response.status);
        }

        this.authToken = response.data.token;

    }

    static async registerUser(emailAddress: string, password: string) {
        let response = await axios.post(this.url(Configuration.getApiRoute() + "/users/signup"), {
            emailAddress: emailAddress,
            password: password
        });

        if (response.status > 299) {
            throw Error("Error server responded with http" + response.status);
        }
    }

    private static url(path: string): string {
        return Configuration.getApiRoute() + path;
    }
}

export default RestAPI;