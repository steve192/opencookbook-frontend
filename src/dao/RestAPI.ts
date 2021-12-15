import axios, { AxiosRequestConfig, AxiosRequestHeaders } from "axios";
import { Buffer } from 'buffer';
import { Platform } from "react-native";
import XDate from "xdate";
import Configuration from "../Configuration";


export interface Ingredient {
    id?: number
    name: string
}

export interface IngredientUse {
    ingredient: Ingredient
    amount: number
    unit: string
}

export interface RecipeImage {
    uuid: string
}
export interface Recipe {
    id?: number
    title: string;
    neededIngredients: IngredientUse[];
    preparationSteps: string[];
    images: RecipeImage[];
    servings: number;
    recipeGroups: RecipeGroup[];
    type: string
}

export interface RecipeGroup {
    id?: number;
    title: string;
    type: string
}

export interface WeekplanDay {
    day: string,
    recipes: Recipe[]
}
class RestAPI {
    static async setWeekplanRecipes(date: XDate) {
        const response = await axios.put(this.url(`/weekplan/${date.toISOString().split("T")[0]}`), await this.axiosConfig());
        return response.data;
    }
    static async getWeekplanDays(from: XDate, to: XDate): Promise<WeekplanDay[]> {
        const response = await axios.get(this.url(`/weekplan/${from.toISOString().split("T")[0]}/to/${to.toISOString().split("T")[0]}`), await this.axiosConfig());

        // Add type recipe to recipe objects
        return response.data.map((weekplanDay: WeekplanDay) => {
            return ({
                ...weekplanDay,
                recipes: weekplanDay.recipes.map(recipe => {
                    return ({ ...recipe, type: "Recipe" });
                })
            })
        });
    }
    static async deleteRecipeGroup(group: RecipeGroup) {
        await axios.delete(this.url("/recipe-groups/" + group.id), await this.axiosConfig());
    }
    static async renewToken(oldToken: string) {
        let response = await axios.get(this.url("/users/renewToken"), await this.axiosConfig());
        //TODO: Implement this correcly. Currently this is only used to check if the token is still valid
    }
    static async createNewRecipeGroup(recipeGroup: RecipeGroup): Promise<RecipeGroup> {
        let response = await axios.post(this.url("/recipe-groups"), recipeGroup, await this.axiosConfig());
        return { ...response.data, type: "RecipeGroup" };
    }
    static async getRecipeGroups(): Promise<RecipeGroup[]> {
        let response = await axios.get(this.url("/recipe-groups"), await this.axiosConfig());
        return response.data.map((item: RecipeGroup) => {
            return { ...item, type: "RecipeGroup" }
        });
    }

    static async getUnits(): Promise<string[]> {
        return [
            "",
            "Becher",
            "Beet/e",
            "Beutel",
            "Blatt",
            "Blätter",
            "Bund",
            "Bündel",
            "cl",
            "cm",
            "dicke",
            "dl",
            "Dose",
            "Dose/n",
            "dünne",
            "Ecke(n)",
            "Eimer",
            "einige",
            "einige Stiele",
            "EL",
            "EL gehäuft",
            "EL gestr.",
            "etwas",
            "evtl.",
            "extra",
            "Fässchen",
            "Fläschchen",
            "Flasche",
            "Flaschen",
            "g",
            "Glas",
            "Gläser",
            "gr. Dose/n",
            "gr. Flasche(n)",
            "gr. Glas",
            "gr. Gläser",
            "gr. Kopf",
            "gr. Scheibe(n)",
            "gr. Stück(e)",
            "große",
            "großen",
            "großer",
            "großes",
            "halbe",
            "Halm(e)",
            "Handvoll",
            "Kästchen",
            "kg",
            "kl. Bund",
            "kl. Dose/n",
            "kl. Flasche/n",
            "kl. Glas",
            "kl. Gläser",
            "kl. Kopf",
            "kl. Scheibe(n)",
            "kl. Stange(n)",
            "kl. Stück(e)",
            "kleine",
            "kleiner",
            "kleines",
            "Knolle/n",
            "Kopf",
            "Köpfe",
            "Körner",
            "Kugel",
            "Kugel/n",
            "Kugeln",
            "Liter",
            "m.-große",
            "m.-großer",
            "m.-großes",
            "mehr",
            "mg",
            "ml",
            "Msp.",
            "n. B.",
            "Paar",
            "Paket",
            "Pck.",
            "Pkt.",
            "Platte/n",
            "Port.",
            "Prise(n)",
            "Prisen",
            "Prozent %",
            "Riegel",
            "Ring/e",
            "Rippe/n",
            "Rispe(n)",
            "Rolle(n)",
            "Schälchen",
            "Scheibe/n",
            "Schuss",
            "Spritzer",
            "Stange/n",
            "Stängel",
            "Staude(n)",
            "Stick(s)",
            "Stiel/e",
            "Stiele",
            "Streifen",
            "Stück(e)",
            "Tablette(n)",
            "Tafel",
            "Tafeln",
            "Tasse",
            "Tasse/n",
            "Teil/e",
            "TL",
            "TL gehäuft",
            "TL gestr.",
            "Topf",
            "Tropfen",
            "Tube/n",
            "Tüte/n",
            "viel",
            "wenig",
            "Würfel",
            "Wurzel",
            "Wurzel/n",
            "Zehe/n",
            "Zweig/e"
        ];
    }
    static async deleteRecipe(recipe: Recipe): Promise<void> {
        await axios.delete(this.url("/recipes/" + recipe.id), await this.axiosConfig());
    }
    static async updateRecipe(newRecipeData: Recipe): Promise<Recipe> {
        let response = await axios.put(this.url("/recipes/" + newRecipeData.id), newRecipeData, await this.axiosConfig());
        return { ...response.data, type: "Recipe" }

    }
    static async importRecipe(importURL: string): Promise<Recipe> {
        let response = await axios.get(this.url("/recipes/import?importUrl=" + encodeURI(importURL)), await this.axiosConfig());
        return { ...response.data, type: "Recipe" }
    }

    private static dataURItoBlob(dataURI: string) {
        // convert base64/URLEncoded data component to raw binary data held in a string
        var byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0)
            byteString = atob(dataURI.split(',')[1]);
        else
            byteString = unescape(dataURI.split(',')[1]);

        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

        // write the bytes of the string to a typed array
        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ia], { type: mimeString });
    }



    static async getImageAsDataURI(uuid: string) {
        let response = await axios.get(this.url("/recipes-images/" + uuid), {
            headers: {
                "Authorization": "Bearer " + await Configuration.getAuthToken(),
            },
            responseType: 'arraybuffer'
        });
        // const dataURI =  "data:application/octet-stream;base64," + Buffer.from(response.data).toString("base64");
        const base64String = Buffer.from(response.data).toString("base64");
        const dataURI = "data:image/jpg;base64," + base64String;
        return dataURI;
    }
    static async uploadImage(uri: string): Promise<string> {
        const formData = new FormData();
        if (Platform.OS === "web") {
            // Web has data uris instead of file uris
            const blob = this.dataURItoBlob(uri);
            formData.append("image", blob);
        } else {
            // Android and ios file:/// uris must be passed to form data in a strange undocumented format
            // Converting to blob etc does not work..
            let filename = uri.split('/').pop();

            //@ts-ignore
            const extArr = /\.(\w+)$/.exec(filename);
            //@ts-ignore
            const type = "image/" + extArr[1];
            //@ts-ignore
            formData.append("image", { uri: uri, name: filename, type });
        }


        let response = await axios.post(this.url("/recipes-images"), formData, await this.axiosConfig());
        if (response.status > 299) {
            throw new Error("Server responded with http " + response.status);
        }
        return response.data.uuid;
    }
    static async getRecipeById(recipeId: number): Promise<Recipe> {
        const response = await axios.get(this.url(`/recipes/${recipeId}`), await this.axiosConfig());
        if (response.status > 299) {
            throw new Error();
        }
        return { ...response.data, type: "Recipe" }
    }

    static async getRecipes(): Promise<Recipe[]> {
        const response = await axios.get(this.url("/recipes"), await this.axiosConfig());
        if (response.status > 299) {
            throw new Error();
        }

        return response.data.map((item: Recipe) => {
            return { ...item, type: "Recipe" }
        });
    }

    static async axiosConfig(): Promise<AxiosRequestConfig> {
        return {
            headers: await this.getAuthHeader()
        }
    }

    static async getAuthHeader(): Promise<AxiosRequestHeaders> {
        const token = await Configuration.getAuthToken();
        return { "Authorization": "Bearer " + token };
    }
    static async getIngredients(filter: string = ""): Promise<Ingredient[]> {
        let response = await axios.get(this.url("/ingredients"), await this.axiosConfig());
        if (response.status > 299) {
            //TODO: Error handling
            throw Error("Server error");
        }
        return response.data;
    }
    static async createNewRecipe(newRecipeData: Recipe): Promise<Recipe> {
        let response = await axios.post(this.url("/recipes"), newRecipeData, await this.axiosConfig());
        return { ...response.data, type: "Recipe" }
    }


    static async authenticate(emailAddress: string, password: string): Promise<void> {
        let response = await axios.post(this.url("/users/login"), {
            emailAddress: emailAddress,
            password: password
        });

        if (response.status > 299) {
            throw Error("Server responded with http " + response.status);
        }

        Configuration.setAuthToken(response.data.token);

    }

    static async registerUser(emailAddress: string, password: string) {
        let response = await axios.post(this.url("/users/signup"), {
            emailAddress: emailAddress,
            password: password
        });

        if (response.status > 299) {
            throw Error("Error server responded with http" + response.status);
        }
    }

    private static url(path: string): string {
        return Configuration.getBackendURL() + Configuration.getApiRoute() + path;
    }
}

export default RestAPI;