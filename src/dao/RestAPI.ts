import axios, {AxiosError, AxiosRequestConfig, AxiosRequestHeaders} from 'axios';
import {Buffer} from 'buffer';
import {Platform} from 'react-native';
import XDate from 'xdate';
import AppPersistence from '../AppPersistence';


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

export interface WeekplanDayRecipeInfo {
    id: number | string;
    title: string;
    type: 'SIMPLE_RECIPE' | 'NORMAL_RECIPE'
    titleImageUuid: string;
}
export interface WeekplanDay {
    day: string,
    recipes: WeekplanDayRecipeInfo[]
}
export interface UserInfo {

}
/**
 * RESTApi for communication with opencookbook backend
 */
class RestAPI {
  static async getUserInfo(): Promise<UserInfo> {
    const response = await this.get('/users/self');
    return response?.data;
  }
  static async setWeekplanRecipes(date: string, recipes: WeekplanDayRecipeInfo[]): Promise<WeekplanDay> {
    const response = await this.put(`/weekplan/${date}`, {recipes: recipes});
    return response?.data;
  }
  static async getWeekplanDays(from: XDate, to: XDate): Promise<WeekplanDay[]> {
    const response = await this.get(`/weekplan/${from.toString('yyyy-MM-dd')}/to/${to.toString('yyyy-MM-dd')}`);

    // Add type recipe to recipe objects
    return response?.data.map((weekplanDay: WeekplanDay) => {
      return ({
        ...weekplanDay,
        recipes: weekplanDay.recipes.map((recipe) => {
          return ({...recipe, type: 'Recipe'});
        }),
      });
    });
  }
  static async deleteAccount() {
    await this.delete('/users/self');
  }
  static async deleteRecipeGroup(groupId: number) {
    await this.delete('/recipe-groups/' + groupId);
  }
  static async refreshToken() {
    const response = await axios.post(await this.url('/users/refreshToken'), {refreshToken: await AppPersistence.getRefreshToken()});
    await AppPersistence.setAuthToken(response.data.token);
  }
  static async createNewRecipeGroup(recipeGroup: RecipeGroup): Promise<RecipeGroup> {
    const response = await this.post('/recipe-groups', recipeGroup);
    return {...response?.data, type: 'RecipeGroup'};
  }
  static async getRecipeGroups(): Promise<RecipeGroup[]> {
    const response = await this.get('/recipe-groups');
    return response?.data.map((item: RecipeGroup) => {
      return {...item, type: 'RecipeGroup'};
    });
  }

  static async getUnits(): Promise<string[]> {
    return [
      '',
      'Becher',
      'Beet/e',
      'Beutel',
      'Blatt',
      'Blätter',
      'Bund',
      'Bündel',
      'cl',
      'cm',
      'dicke',
      'dl',
      'Dose',
      'Dose/n',
      'dünne',
      'Ecke(n)',
      'Eimer',
      'einige',
      'einige Stiele',
      'EL',
      'EL gehäuft',
      'EL gestr.',
      'etwas',
      'evtl.',
      'extra',
      'Fässchen',
      'Fläschchen',
      'Flasche',
      'Flaschen',
      'g',
      'Glas',
      'Gläser',
      'gr. Dose/n',
      'gr. Flasche(n)',
      'gr. Glas',
      'gr. Gläser',
      'gr. Kopf',
      'gr. Scheibe(n)',
      'gr. Stück(e)',
      'große',
      'großen',
      'großer',
      'großes',
      'halbe',
      'Halm(e)',
      'Handvoll',
      'Kästchen',
      'kg',
      'kl. Bund',
      'kl. Dose/n',
      'kl. Flasche/n',
      'kl. Glas',
      'kl. Gläser',
      'kl. Kopf',
      'kl. Scheibe(n)',
      'kl. Stange(n)',
      'kl. Stück(e)',
      'kleine',
      'kleiner',
      'kleines',
      'Knolle/n',
      'Kopf',
      'Köpfe',
      'Körner',
      'Kugel',
      'Kugel/n',
      'Kugeln',
      'Liter',
      'm.-große',
      'm.-großer',
      'm.-großes',
      'mehr',
      'mg',
      'ml',
      'Msp.',
      'n. B.',
      'Paar',
      'Paket',
      'Pck.',
      'Pkt.',
      'Platte/n',
      'Port.',
      'Prise(n)',
      'Prisen',
      'Prozent %',
      'Riegel',
      'Ring/e',
      'Rippe/n',
      'Rispe(n)',
      'Rolle(n)',
      'Schälchen',
      'Scheibe/n',
      'Schuss',
      'Spritzer',
      'Stange/n',
      'Stängel',
      'Staude(n)',
      'Stick(s)',
      'Stiel/e',
      'Stiele',
      'Streifen',
      'Stück(e)',
      'Tablette(n)',
      'Tafel',
      'Tafeln',
      'Tasse',
      'Tasse/n',
      'Teil/e',
      'TL',
      'TL gehäuft',
      'TL gestr.',
      'Topf',
      'Tropfen',
      'Tube/n',
      'Tüte/n',
      'viel',
      'wenig',
      'Würfel',
      'Wurzel',
      'Wurzel/n',
      'Zehe/n',
      'Zweig/e',
    ];
  }
  static async deleteRecipe(recipe: Recipe): Promise<void> {
    await this.delete('/recipes/' + recipe.id);
  }
  static async updateRecipe(newRecipeData: Recipe): Promise<Recipe> {
    const response = await this.put('/recipes/' + newRecipeData.id, newRecipeData);
    return {...response?.data, type: 'Recipe'};
  }
  static async importRecipe(importURL: string): Promise<Recipe> {
    const response = await this.get('/recipes/import?importUrl=' + encodeURI(importURL));
    return {...response?.data, type: 'Recipe'};
  }

  private static dataURItoBlob(dataURI: string) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    let byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0) {
      byteString = atob(dataURI.split(',')[1]);
    } else {
      byteString = unescape(dataURI.split(',')[1]);
    }

    // separate out the mime component
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], {type: mimeString});
  }


  static async getImageAsDataURI(uuid: string): Promise<string> {
    // const cachedImage = await AppPersistence.getCachedImage(uuid);
    // if (cachedImage) {
    //   return cachedImage;
    // }
    try {
      const response = await axios.get(await this.url('/recipes-images/' + uuid), {
        headers: {
          'Authorization': 'Bearer ' + await AppPersistence.getAuthToken(),
        },
        responseType: 'arraybuffer',
      });

      const base64String = Buffer.from(response.data).toString('base64');
      const datastring = 'data:image/jpg;base64,' + base64String;
      // await AppPersistence.cacheImage(uuid, datastring);
      return datastring;
    } catch (e) {
      await this.handleAxiosError(e);
      return '';
    }
  }
  static async uploadImage(uri: string): Promise<string> {
    const formData = new FormData();
    if (Platform.OS === 'web') {
      // Web has data uris instead of file uris
      const blob = this.dataURItoBlob(uri);
      formData.append('image', blob);
    } else {
      // Android and ios file:/// uris must be passed to form data in a strange undocumented format
      // Converting to blob etc does not work..
      const filename = uri.split('/').pop();

      // @ts-ignore
      const extArr = /\.(\w+)$/.exec(filename);
      // @ts-ignore
      const type = 'image/' + extArr[1];
      // @ts-ignore
      formData.append('image', {uri: uri, name: filename, type});
    }


    const response = await this.post('/recipes-images', formData);
    return response?.data.uuid;
  }
  static async getRecipeById(recipeId: number): Promise<Recipe> {
    const response = await this.get(`/recipes/${recipeId}`);
    return {...response?.data, type: 'Recipe'};
  }

  static async getRecipes(): Promise<Recipe[]> {
    const response = await this.get('/recipes');

    return response?.data.map((item: Recipe) => {
      return {...item, type: 'Recipe'};
    });
  }

  static async axiosConfig(): Promise<AxiosRequestConfig> {
    return {
      headers: await this.getAuthHeader(),
    };
  }

  static async getAuthHeader(): Promise<AxiosRequestHeaders> {
    const token = await AppPersistence.getAuthToken();
    return {'Authorization': 'Bearer ' + token};
  }
  static async getIngredients(filter: string = ''): Promise<Ingredient[]> {
    const response = await this.get('/ingredients');
    return response?.data;
  }
  static async createNewRecipe(newRecipeData: Recipe): Promise<Recipe> {
    const response = await axios.post(await this.url('/recipes'), newRecipeData, await this.axiosConfig());
    return {...response.data, type: 'Recipe'};
  }


  static async authenticate(emailAddress: string, password: string): Promise<void> {
    const response = await axios.post(await this.url('/users/login'), {
      emailAddress: emailAddress,
      password: password,
    });

    AppPersistence.setAuthToken(response.data.token);
    AppPersistence.setRefreshToken(response.data.refreshToken);
  }

  static async activateAccount(activationId: string) {
    await axios.get(await this.url('/users/activate?activationId=' + activationId));
  }

  static async requestPasswordReset(emailAddress: string) {
    await axios.post(await this.url('/users/requestPasswordReset'), {emailAddress: emailAddress});
  }
  static async resetPassword(passwordResetId: string, newPassword: string) {
    await axios.post(await this.url('/users/resetPassword'), {newPassword: newPassword, passwordResetId: passwordResetId});
  }

  static async registerUser(emailAddress: string, password: string) {
    const response = await axios.post(await this.url('/users/signup'), {
      emailAddress: emailAddress,
      password: password,
    });

    if (response.status > 299) {
      throw Error('Error server responded with http' + response.status);
    }
  }

  private static async url(path: string) {
    return await AppPersistence.getBackendURL() + AppPersistence.getApiRoute() + path;
  }

  private static async post(apiPath: string, data: any) {
    try {
      return await axios.post(await this.url(apiPath), data, await this.axiosConfig());
    } catch (e) {
      await RestAPI.handleAxiosError(e);
      // Retry after error handling
      return axios.post(await this.url(apiPath), data, await this.axiosConfig());
    }
  }
  private static async delete(apiPath: string) {
    try {
      return await axios.delete(await this.url(apiPath), await this.axiosConfig());
    } catch (e) {
      await RestAPI.handleAxiosError(e);
      // Retry after error handling
      return axios.delete(await this.url(apiPath), await this.axiosConfig());
    }
  }
  private static async put(apiPath: string, data: any) {
    try {
      return await axios.put(await this.url(apiPath), data, await this.axiosConfig());
    } catch (e) {
      await RestAPI.handleAxiosError(e);
      // Retry after error handling
      return axios.put(await this.url(apiPath), data, await this.axiosConfig());
    }
  }
  private static async get(apiPath: string) {
    try {
      return await axios.get(await this.url(apiPath), await this.axiosConfig());
    } catch (e) {
      await RestAPI.handleAxiosError(e);
      // Retry after error handling
      return axios.get(await this.url(apiPath), await this.axiosConfig());
    }
  }

  private static async handleAxiosError(axiosError: unknown) {
    const errResponse = (axiosError as AxiosError).response;
    if (!errResponse) {
      console.error('Axios error: No response from server');
      throw axiosError;
    }

    if (errResponse.status === 401 || errResponse.status === 403) {
      // Maybe token expired?
      console.warn('Axios warning: Auth fail, trying to refresh token');
      try {
        await this.refreshToken();
      } catch (refreshError) {
        console.error('Failed to refesh token');
        throw refreshError;
      }
    } else {
      console.error('Axios error: Server responded with http '+ errResponse.status);
      throw axiosError;
    }
  }
}

export default RestAPI;
