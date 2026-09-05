import axios, {AxiosError, AxiosRequestConfig, AxiosResponse} from 'axios';
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
    amount: number | null
    unit: string
}

export interface RecipeImage {
    uuid: string
}
export type RecipeDiet = 'VEGAN' | 'VEGETARIAN' | 'MEAT';

export interface Recipe {
    id?: number
    title: string;
    neededIngredients: IngredientUse[];
    preparationSteps: string[];
    images: RecipeImage[];
    servings: number;
    recipeGroups: RecipeGroup[];
    type: 'Recipe'
    recipeSource?: string;
    // The server stores these and accepts them back on every write. Leaving them off the
    // client type meant the app sent null for all three, so saving a recipe erased the
    // times an import had found for it.
    preparationTime?: number | null;
    totalTime?: number | null;
    recipeType?: RecipeDiet | null;
}

export interface RecipeGroup {
    id?: number;
    title: string;
    type: 'RecipeGroup'
}

export interface WeekplanDayRecipeInfo {
    // A meal that has not been sent to the server yet has neither an id nor an image
    id?: number | string;
    title: string;
    type: 'SIMPLE_RECIPE' | 'NORMAL_RECIPE'
    titleImageUuid?: string;
}

/**
 * What the weekplan endpoint accepts when a day is written back. It is a subset
 * of what it returns: the title of a saved recipe is resolved server side, and
 * only a spontaneous meal carries one of its own.
 */
export interface WeekplanDayRecipeRequest {
    id?: number | string;
    type: 'SIMPLE_RECIPE' | 'NORMAL_RECIPE'
    title?: string;
}
export interface WeekplanDay {
    day: string,
    recipes: WeekplanDayRecipeInfo[]
}
export interface UserInfo {
  email: string;
}

export interface InstanceInfo {
  termsOfService: string;
  sharingEnabled: boolean;
  /**
   * Whether this instance can read a recipe from a photograph. False when the operator has no
   * machine learning subsystem, switched scanning off, or has one that is unreachable.
   */
  ocrImportEnabled: boolean;
}

/** One area of a photograph holding a kind of content, as fractions of the picture. */
export interface RecipeScanBlock {
  pageIndex: number;
  lineCount: number;
  box: {left: number; top: number; right: number; bottom: number};
}

/** Where the server thinks the page is in a photograph. */
export interface DetectedPage {
  /** Four corners as [x, y] fractions of the picture, clockwise from the top left. */
  corners: [number, number][];
  confidence: number;
  /** False when nothing convincing was found; the corners are then the whole frame. */
  detected: boolean;
}

/** What the server says about a recipe being read from photographs. */
export interface RecipeScanJob {
  id: string;
  jobType: string;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  /** The recipe that was read, once it is done. Not saved anywhere until somebody says so. */
  recipe?: Recipe;
  /** Where each kind of content was found. Either half may be null: none found is an answer. */
  blocks?: {
    ingredients?: RecipeScanBlock[] | null;
    steps?: RecipeScanBlock[] | null;
  };
  /**
   * What is wrong with the photograph. Beside the recipe rather than instead of it: a page that
   * could not be read is still read as far as it goes.
   */
  photo?: {usable: boolean; problem?: string | null; pageIndex?: number | null};
  /** How many scans are ahead of this one, while it is still waiting. */
  queuePosition?: number | null;
  error?: {code: string; message: string; retryable: boolean};
}

/** A public link to one of your own recipes. */
export interface RecipeShare {
  shareId: string;
  shareUrl: string;
  recipeId: number;
  /** When the link stops working, as an ISO instant. Fixed when it was created. */
  expiresAt: string;
  accessCount: number;
}

export interface BringExportData {
  baseAmount: number;
  ingredients: string[];
}

/**
 * What the public share endpoint returns.
 *
 * Deliberately narrower than {@link Recipe}: it carries no ids, no owner and no recipe groups,
 * because none of that is a link recipient's business. The nesting matches {@link IngredientUse}
 * so that the adaptation below stays a matter of filling in what a shared recipe cannot have.
 */
interface SharedRecipeResponse {
  title: string;
  neededIngredients: IngredientUse[];
  preparationSteps: string[];
  images: RecipeImage[];
  servings: number;
  preparationTime?: number | null;
  totalTime?: number | null;
  recipeType?: RecipeDiet | null;
  recipeSource?: string;
}

/**
 * Adapts a shared recipe into the shape the app renders.
 *
 * It has no id and belongs to no group, because it is not in this user's cookbook - which is
 * exactly what stops a shared recipe from being editable or plannable by accident.
 *
 * @param {SharedRecipeResponse} shared what the share endpoint returned
 * @return {Recipe} the same recipe, in the app's own shape
 */
const sharedRecipeToRecipe = (shared: SharedRecipeResponse): Recipe => ({
  title: shared.title,
  neededIngredients: shared.neededIngredients,
  preparationSteps: shared.preparationSteps,
  images: shared.images,
  servings: shared.servings,
  recipeGroups: [],
  type: 'Recipe',
  recipeSource: shared.recipeSource,
  preparationTime: shared.preparationTime,
  totalTime: shared.totalTime,
  recipeType: shared.recipeType,
});

/**
 * Wraps image bytes so they can be handed straight to an Image source.
 *
 * @param {ArrayBuffer} data the response body
 * @return {string} a data uri
 */
const imageDataUri = (data: ArrayBuffer): string =>
  'data:image/jpg;base64,' + Buffer.from(data).toString('base64');

/**
 * RESTApi for communication with opencookbook backend
 */
class RestAPI {
  private static isOnline = true;
  static setIsOnline(payload: boolean) {
    RestAPI.isOnline = payload;
  }
  static async getUserInfo(): Promise<UserInfo> {
    const response = await this.get('/users/self');
    AppPersistence.storeUserInfoOffline(response.data);
    return response?.data;
  }
  static async setWeekplanRecipes(date: string, recipes: WeekplanDayRecipeRequest[]): Promise<WeekplanDay> {
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
          return ({...recipe});
        }),
      });
    });
  }

  /**
   * The public links of one of your own recipes.
   *
   * A list rather than a single share: a recipe will be able to carry more than one kind of
   * share, and an empty list is how "not shared" is said.
   *
   * @param {number} recipeId the recipe to look up
   * @return {Promise<RecipeShare[]>} its live shares
   */
  static async getSharesOfRecipe(recipeId: number): Promise<RecipeShare[]> {
    return (await this.get(`/shares?recipeId=${recipeId}`))?.data;
  }

  /**
   * Shares a recipe publicly, or returns the link it already has.
   *
   * @param {number} recipeId the recipe to share
   * @return {Promise<RecipeShare>} its public link
   */
  static async shareRecipe(recipeId: number): Promise<RecipeShare> {
    return (await this.post('/shares', {recipeId: recipeId}))?.data;
  }

  /**
   * Stops a link from working, permanently.
   *
   * @param {string} shareId the share to withdraw
   */
  static async revokeShare(shareId: string): Promise<void> {
    await this.delete(`/shares/${shareId}`);
  }

  /**
   * Reads a recipe somebody shared.
   *
   * Sent without a token: the whole point of the link is that it works for people who have no
   * account, and the app has to take exactly the same route they do.
   *
   * Resolved against the server this app is signed in to, which is the only place a share can
   * be looked up. A link from somebody else's instance is therefore not found here - and saying
   * so is better than making the app fetch from whatever host a link happened to name.
   *
   * @param {string} shareId the share to read
   * @return {Promise<Recipe>} the shared recipe
   */
  static async getSharedRecipe(shareId: string): Promise<Recipe> {
    const response = await axios.get(await this.sharedUrl(shareId, ''));
    return sharedRecipeToRecipe(response.data);
  }

  /**
   * Copies a shared recipe into the signed in user's own cookbook.
   *
   * @param {string} shareId the share the recipe was reached through
   * @return {Promise<Recipe>} the newly created copy
   */
  static async importSharedRecipe(shareId: string): Promise<Recipe> {
    const response = await this.post(`/shares/${shareId}/import`, {});
    return {...response?.data, type: 'Recipe'};
  }

  static async createBringExport(recipeId: number): Promise<string> {
    return (await this.post('/bringexport', {recipeId: recipeId})).data.exportId;
  }

  static async getInstanceInfo(): Promise<InstanceInfo> {
    return (await this.get('/instance')).data;
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
  static async updateRecipeGroup(recipeGroup: RecipeGroup): Promise<RecipeGroup> {
    const response = await this.put('/recipe-groups/' + recipeGroup.id, recipeGroup);
    return {...response?.data, type: 'RecipeGroup'};
  }
  static async getRecipeGroups(): Promise<RecipeGroup[]> {
    const response = await this.get('/recipe-groups');
    return response?.data.map((item: RecipeGroup) => {
      return {...item, type: 'RecipeGroup'};
    });
  }

  static async getAvailableImportHosts(): Promise<string[]> {
    const response = await this.get('/recipes/import/available-hosts');
    return response?.data;
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


  /**
   * A recipe image thumbnail, as a data uri.
   *
   * @param {string} uuid the image
   * @param {string} [viaShare] the share to read it through, instead of as its owner
   * @return {Promise<string>} the image, or an empty string when it cannot be read
   */
  static async getThumbnailImageAsDataURI(uuid: string, viaShare?: string): Promise<string> {
    return viaShare ?
      this.publicImageAsDataURI(await this.sharedUrl(viaShare, `/images/thumbnail/${uuid}`)) :
      this.ownImageAsDataURI(`/recipes-images/thumbnail/${uuid}`);
  }

  /**
   * A recipe image, as a data uri.
   *
   * @param {string} uuid the image
   * @param {string} [viaShare] the share to read it through, instead of as its owner
   * @return {Promise<string>} the image, or an empty string when it cannot be read
   */
  static async getImageAsDataURI(uuid: string, viaShare?: string): Promise<string> {
    return viaShare ?
      this.publicImageAsDataURI(await this.sharedUrl(viaShare, `/images/${uuid}`)) :
      this.ownImageAsDataURI(`/recipes-images/${uuid}`);
  }

  private static async ownImageAsDataURI(apiPath: string): Promise<string> {
    try {
      const response = await axios.get(await this.url(apiPath), {
        headers: {
          'Authorization': 'Bearer ' + await AppPersistence.getAuthToken(),
        },
        responseType: 'arraybuffer',
      });
      return imageDataUri(response.data);
    } catch (e) {
      await this.handleAxiosError(e);
      return '';
    }
  }

  private static async publicImageAsDataURI(url: string): Promise<string> {
    // No token, and no refresh on failure: there is nothing to refresh, and retrying a refused
    // public request is how a rate limit turns into two rate limited requests.
    const response = await axios.get(url, {responseType: 'arraybuffer'});
    return imageDataUri(response.data);
  }
  /**
   * Hands photographs of one recipe to the server to be read. Several pictures are one scan:
   * a recipe printed across a spread would otherwise come back as two halves.
   *
   * @param {string[]} imageUris the pages, in the order they should be read
   * @param {string} payload what to do with them, as json - see buildScanPayload
   * @param {boolean} trainingConsent whether the pictures may be kept to improve recognition
   * @return {Promise<RecipeScanJob>} the job to watch
   */
  static async scanRecipe(
      imageUris: string[], payload: string, trainingConsent: boolean,
  ): Promise<RecipeScanJob> {
    const formData = new FormData();
    for (const uri of imageUris) {
      formData.append('images', await this.imagePart(uri));
    }
    formData.append('payload', payload);
    formData.append('trainingConsent', String(trainingConsent));

    const response = await this.post(
        '/ml/recipe-ocr', formData, {'Content-Type': 'multipart/form-data'});
    return this.asScanJob(response?.data);
  }

  /**
   * Asks where the page is in a photograph, so the crop starts on the recipe. Answered at once
   * and costs no allowance, so it is safe to call for every picture taken.
   *
   * @param {string} imageUri the photograph just taken
   * @return {Promise<DetectedPage>} the corners to start from, and whether anything was found
   */
  static async detectPageEdges(imageUri: string): Promise<DetectedPage> {
    const formData = new FormData();
    formData.append('image', await this.imagePart(imageUri));
    const response = await this.post(
        '/ml/page-edges', formData, {'Content-Type': 'multipart/form-data'});
    return response?.data;
  }

  static async getRecipeScanJob(jobId: string): Promise<RecipeScanJob> {
    const response = await this.get(`/ml/jobs/${jobId}`);
    return this.asScanJob(response?.data);
  }

  /**
   * The server does not send the discriminator the app's own Recipe type carries. Added here so
   * nothing downstream has to.
   *
   * @param {any} data what the scan endpoint returned
   * @return {RecipeScanJob} the same job, with a recipe the rest of the app can use
   */
  private static asScanJob(data: any): RecipeScanJob {
    if (!data?.recipe) {
      return data;
    }
    return {...data, recipe: {...data.recipe, type: 'Recipe'}};
  }

  /**
   * Tells the server where the ingredients and the steps actually are. Answered at once: it
   * relabels what has already been read rather than starting the whole thing again.
   *
   * @param {string} jobId the scan to correct
   * @param {Record<string, unknown>} corrections the areas, keyed by kind
   * @return {Promise<RecipeScanJob>} the scan, read again
   */
  static async refineRecipeScan(
      jobId: string, corrections: Record<string, unknown>,
  ): Promise<RecipeScanJob> {
    const response = await this.post(`/ml/jobs/${jobId}/refine`, {blocks: corrections});
    return this.asScanJob(response?.data);
  }

  // Gives up a scan, so its place in the queue is not spent on a recipe nobody wants.
  static async cancelRecipeScanJob(jobId: string): Promise<void> {
    await this.delete(`/ml/jobs/${jobId}`);
  }

  // Withdraws consent: the photographs kept for improving recognition are deleted.
  static async deleteScanTrainingData(): Promise<void> {
    await this.delete('/ml/training-data');
  }

  /**
   * One picture, in whichever shape form data accepts on this platform.
   *
   * @param {string} uri where the picture is
   * @return {Promise<any>} the part to append
   */
  private static async imagePart(uri: string): Promise<any> {
    if (Platform.OS === 'web') {
      // The picker hands out a blob: url; fetch reads that back with its mime type.
      return await (await fetch(uri)).blob();
    }
    // Android and ios file:/// uris must be passed to form data in this undocumented shape.
    const filename = uri.split('/').pop() ?? 'page.jpg';
    const extension = /\.(\w+)$/.exec(filename);
    return {uri, name: filename, type: 'image/' + (extension ? extension[1] : 'jpeg')} as any;
  }

  static async uploadImage(uri: string): Promise<string> {
    const formData = new FormData();
    if (Platform.OS === 'web') {
      // The picker hands out a blob: url on web (older versions handed out a data: uri).
      // fetch reads the bytes back for either shape, and carries the mime type the file was
      // picked with, so nothing here has to know how the uri was built.
      const blob = await (await fetch(uri)).blob();
      formData.append('image', blob, 'image');
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


    const response = await this.post('/recipes-images', formData, {'Content-Type': 'multipart/form-data'});
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

  static async axiosConfig(headers?: {[headerName: string]: string}): Promise<AxiosRequestConfig> {
    const mergedHeaders = {...await this.getAuthHeader(), ...headers};
    return {
      headers: mergedHeaders,
    };
  }

  static async getAuthHeader(): Promise<Record<string, string>> {
    const token = await AppPersistence.getAuthToken();
    return {'Authorization': 'Bearer ' + token};
  }
  // The endpoint returns everything the user has; the selection popup filters client side.
  // It takes no query, so callers fetch this once rather than per keystroke.
  static async getIngredients(): Promise<Ingredient[]> {
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
    const response = await axios.get(await this.url('/users/activate?activationId=' + activationId));

    AppPersistence.setAuthToken(response.data.token);
    AppPersistence.setRefreshToken(response.data.refreshToken);
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

  /**
   * The address of something reachable through a share, on this instance.
   *
   * @param {string} shareId the share
   * @param {string} path what to read under it
   * @return {Promise<string>} the absolute address
   */
  private static async sharedUrl(shareId: string, path: string): Promise<string> {
    return `${await this.url('/shared/')}${shareId}${path}`;
  }

  private static async post(apiPath: string, data: any, headers?: {[headerName: string]: string}) {
    try {
      return await axios.post(await this.url(apiPath), data, await this.axiosConfig(headers));
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
    if (!this.isOnline) {
      const offlineData = await RestAPI.offlineGet(apiPath);
      if (offlineData) return offlineData;
    }
    try {
      const response = await axios.get(await this.url(apiPath), await this.axiosConfig());
      RestAPI.offlineGetStore(apiPath, response);
      return response;
    } catch (e) {
      await RestAPI.handleAxiosError(e);
      // Retry after error handling
      const response = await axios.get(await this.url(apiPath), await this.axiosConfig());
      RestAPI.offlineGetStore(apiPath, response);
      return response;
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

  private static offlineGetStore(apiPath: string, response: AxiosResponse<any, any>) {
    if (apiPath === '/recipes') {
      AppPersistence.storeRecipesOffline(response.data);
    }
  }

  private static async offlineGet(apiPath: string) {
    // Only for offline stuff that is not managed by redux
    if (apiPath === '/users/self') {
      const userinfo = await AppPersistence.getUserInfoOffline();
      if (userinfo !== undefined) {
        return {data: userinfo};
      }
    }
  }
}

export default RestAPI;


