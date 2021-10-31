import axios from "axios";
import Configuration from "../Configuration";

export interface Recipe {
    title: string;
    neededIngredients: {ingredient: {id: number, name:string}, amount: number, unit: string}[];
    preparationSteps: string[];
}
class RestAPI {
    static createNewRecipe(newRecipeData: Recipe) {
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