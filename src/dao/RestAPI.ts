import axios, { AxiosRequestConfig } from "axios";
import { Platform } from "react-native";
import Configuration from "../Configuration";
import { Buffer } from 'buffer';


export interface Ingredient {
    id?: number
    name: string
}

export interface IngredientUse {
    ingredient: Ingredient
    amount: number
    unit: string
}
export interface Recipe {
    id?: number
    title: string;
    neededIngredients: IngredientUse[];
    preparationSteps: string[];
    images: { uuid: string }[];
}
class RestAPI {

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
                "Authorization":"Bearer " + await Configuration.getAuthToken(),
            },
            responseType: 'arraybuffer'
        });
        // const dataURI =  "data:application/octet-stream;base64," + Buffer.from(response.data).toString("base64");
        const base64String = Buffer.from(response.data).toString("base64");
        const dataURI = "data:image/jpg;base64," +base64String;
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

            const extArr = /\.(\w+)$/.exec(filename);
            const type = "image/" + extArr[1];
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

        return response.data;
        // return {
        //     id : 1,
        //     title: "Demo recipe",
        //     preparationSteps: [
        //         "Do stuff and prepare shit. This is a very long description with a lot of words in it\nIt also\n has multiple\n lines",
        //         "Do more stuff",
        //         "Bake the shit out of that thing\n also make sure to check every 30 seconds\nok?",
        //         "Done"],
        //     neededIngredients: [
        //         { ingredient: { id: 0, name: "Eatable stuff with long name" }, amount: 1, unit: "Parts" },
        //         { ingredient: { id: 0, name: "Eatable" }, amount: 1, unit: "" },
        //         { ingredient: { id: 0, name: "Eatable" }, amount: 1, unit: "" }
        //     ]
        // }
    }
    static async getRecipes(): Promise<Recipe[]> {
        const response = await axios.get(this.url("/recipes"), await this.axiosConfig());
        if (response.status > 299) {
            throw new Error();
        }

        return response.data;
    }

    static async axiosConfig(): Promise<AxiosRequestConfig> {
        const token = await Configuration.getAuthToken();
        return {
            headers: { "Authorization": "Bearer " + token }
        }
    }
    static async getIngredients(filter: string = ""): Promise<Ingredient[]> {
        //TODO: Implement API call
        let response = await axios.get(this.url("/ingredients"), await this.axiosConfig());
        if (response.status > 299) {
            throw Error("Server error");
        }
        return response.data;
    }
    static async createNewRecipe(newRecipeData: Recipe) {
        let response = await axios.post(this.url("/recipes"), newRecipeData, await this.axiosConfig());

        if (response.status > 299) {
            throw Error("Server responded with http " + response.status);
        }
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

    static async isAuthTokenValid(token: string) {
        return true;
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