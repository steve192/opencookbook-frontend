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
export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' | 'DESSERT';
/** What a recipe is when it is not a dish of its own; neither is planned or suggested as a meal. */
export type DishRole = 'SIDE' | 'COMPONENT';

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
    /** Empty while nobody has said which meals this suits, which keeps it eligible for all but breakfast. */
    mealTypes?: MealType[];
    /** Null for a dish. */
    dishRole?: DishRole | null;
    /** Absent where the instance does not estimate nutrition. */
    nutrition?: NutritionSummary | null;
    /** Whether you may edit it; absent where nobody in particular is reading, as in a share. */
    mine?: boolean | null;
    /** Who wrote it, for a recipe read through a household. Absent for your own. */
    ownerDisplayName?: string | null;
}

/** Grams, except energy. */
export interface Nutrients {
    energyKcal: number | null;
    energyKj: number | null;
    fat: number | null;
    saturatedFat: number | null;
    carbohydrates: number | null;
    sugar: number | null;
    fibre: number | null;
    protein: number | null;
    salt: number | null;
}

/** UNAVAILABLE values are not shown. */
export interface NutritionSummary {
    basis: 'SERVING' | 'RECIPE';
    status: 'COMPLETE' | 'INCOMPLETE' | 'UNAVAILABLE';
    values: Nutrients;
    warningCount: number;
}

export type NutritionLineStatus = 'RESOLVED' | 'EXCLUDED' | 'UNLINKED' | 'UNIT_UNKNOWN' | 'NO_PORTION' | 'NO_AMOUNT';
export type NutritionLineFlag = 'LOW_CONFIDENCE' | 'VOLUME_WITHOUT_DENSITY' | 'ESTIMATED_PORTION' |
    'SIZE_SCALED_PORTION' | 'TYPICAL_CONTAINER_SIZE' | 'PINCH';

export interface NutritionLine {
    /** Null for shared recipes. */
    ingredientId: number | null;
    ingredientName: string;
    amount: number | null;
    unit: string | null;
    grams: number | null;
    values: Nutrients;
    food: {id: number, displayName: string, sourceName: string | null} | null;
    status: NutritionLineStatus;
    flags: NutritionLineFlag[];
    /** Null for shared recipes. */
    ownPortion: boolean | null;
    warns: boolean;
}

export interface NutritionAttribution {
    source: string;
    text: string;
    license: string;
    licenseUrl: string;
}

export interface RecipeNutrition {
    summary: NutritionSummary;
    lines: NutritionLine[];
    attributions: NutritionAttribution[];
}

export interface CatalogueFood {
    id: number;
    displayName: string;
    sourceName: string | null;
    /** Per 100 g. */
    energyKcal: number | null;
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
    /** Which plan the day belongs to; absent for your own. */
    householdId?: string | null;
    householdName?: string | null;
}
export interface UserInfo {
  email: string;
  /** Null while the account never set one; fellow household members then see a masked address. */
  displayName?: string | null;
  onboarded?: boolean;
}

export interface InstanceInfo {
  termsOfService: string;
  sharingEnabled: boolean;
  householdsEnabled: boolean;
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
  error?: {code: string; retryable: boolean};
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

/**
 * The query parameter that says which plan a scoped request is about.
 *
 * @param {string} householdId the household, or nothing for your own plan
 * @return {string} the query string, empty for your own
 */
const householdScope = (householdId?: string | null): string =>
  householdId ? `?household=${householdId}` : '';

export interface HouseholdMember {
  userId: number;
  /** A name the account chose, or its address with the local part masked. Never the address. */
  displayName: string;
  shareRecipes: boolean;
  /** Whether this is you, so leaving and being removed can be told apart. */
  me: boolean;
}

export interface Household {
  id: string;
  name: string;
  /** Whether your own cookbook is in this household. All of it or none of it. */
  shareRecipes: boolean;
  memberCount: number;
  /** Null in a listing, where only the household itself is asked about. */
  recipeCount?: number | null;
  members?: HouseholdMember[] | null;
}

export interface HouseholdInvite {
  token: string;
  link: string;
  expiresAt: string;
}

/** One line of a household cookbook: a summary, not the whole recipe. */
export interface HouseholdRecipe {
  id: number;
  title: string;
  titleImageUuid?: string;
  ownerDisplayName: string;
  /** Whether the viewer owns it, which is also whether they may edit it. */
  mine: boolean;
}

/** One page of a household cookbook, with whether there is another behind it. */
export interface HouseholdRecipePage {
  recipes: HouseholdRecipe[];
  last: boolean;
}

/** What deleting a recipe would take with it. */
export interface RecipeDeletionImpact {
  households: number;
  plannedMeals: number;
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
  nutrition?: NutritionSummary | null;
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
  nutrition: shared.nutrition,
});

/** How the ingredients a cook named are meant. */
export type SuggestionMatchMode = 'ANY_RANKED' | 'MUST_CONTAIN';

export type MacroStyle = 'BALANCED' | 'LOW_CARB' | 'LOW_FAT' | 'HIGH_PROTEIN';

/** Everything is optional: a request answering nothing is a valid "surprise me". */
export interface RecipeSuggestionRequest {
  mode?: SuggestionMatchMode;
  ingredientIds?: number[];
  maxTotalTimeMinutes?: number | null;
  diet?: RecipeDiet | null;
  mealTypes?: MealType[];
  targetKcalPerServing?: number | null;
  macroStyle?: MacroStyle | null;
  /** Also draw on the household cookbooks you may read; left out means no. */
  includeHouseholdRecipes?: boolean;
  limit?: number;
  /** Repeat a seed to get that result set back; leave it out for a new draw. */
  seed?: number | null;
}

/** Why a recipe was chosen: a key and its weight. The app writes the sentence; the server never sends prose. */
export interface ScoreReason {
  term: string;
  value: number;
}

export interface SuggestedRecipe {
  recipe: Recipe;
  score: number;
  matchedIngredients: Ingredient[];
  missingIngredients: Ingredient[];
  reasons: ScoreReason[];
}

/**
 * Where the cookbook was narrowed, so an empty list can say which answer emptied it:
 * `owned` to `afterFilters` is what diet, time and meal removed, `afterFilters` to `matched`
 * what the wanted ingredients did.
 */
export interface SuggestionPoolStats {
  owned: number;
  afterFilters: number;
  matched: number;
  returned: number;
}

export interface RecipeSuggestions {
  seed: number;
  results: SuggestedRecipe[];
  /** One wanted ingredient short, kept apart so MUST_CONTAIN still means what it says. */
  nearMisses: SuggestedRecipe[];
  poolStats: SuggestionPoolStats;
}

/** How much work a meal may be, judged against the cook's own cookbook. */
export type Effort = 'SIMPLE' | 'ANY' | 'ELABORATE';

export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

/** How one meal of the day is planned. */
export interface PlanningMeal {
  mealType: MealType;
  /** The weekdays it is cooked, each with how much work it may be; on the others it is a gap. */
  days: Partial<Record<DayOfWeek, Effort>>;
  /** Per serving; left out, the meal gets an even share of the daily calories. */
  targetKcal?: number | null;
}

/** Something the cook has and wants used up; without an amount it is worth one recipe. */
export interface PantryEntry {
  ingredientId: number;
  amount?: number | null;
  unit?: string | null;
}

/** A cook's answers to the weekplan wizard, kept so that next week is one tap. */
export interface PlanningProfile {
  id?: number;
  name: string;
  defaultProfile?: boolean;
  householdSize?: number;
  diet?: RecipeDiet | null;
  meatMealsPerWeek?: number | null;
  kcalPerDay?: number | null;
  macroStyle?: MacroStyle | null;
  cooldownWeeks?: number;
  leftoversAllowed?: boolean;
  spreadVariety?: boolean;
  /** A personal plan also draws on the household cookbooks you may read; ignored for a household's. */
  includeHouseholdRecipes?: boolean;
  meals: PlanningMeal[];
  pantry?: PantryEntry[];
  avoidedIngredientIds?: number[];
}

export type PlanSlotKind = 'COOKED' | 'LEFTOVER' | 'GAP';

/** Why a cook passed over a planned recipe; each steers the replacement away from what put them off. */
export type RerollReason = 'HAD_RECENTLY' | 'TOO_MUCH_WORK' | 'MISSING_INGREDIENTS' | 'NOT_A_FULL_MEAL';

/** One meal of a proposed week. */
export interface PlanSlot {
  id: number;
  date: string;
  mealType: MealType;
  kind: PlanSlotKind;
  /** Null for a gap, and for a meal the cookbook had nothing for. */
  recipe: Recipe | null;
  servings: number | null;
  /** For a leftover, the id of the slot where it is cooked. */
  leftoverOf: number | null;
  locked: boolean;
  reasons: ScoreReason[];
}

/** A proposed week. Nothing reaches the weekplan until it is accepted. */
export interface PlanDraft {
  id: number;
  profileId: number | null;
  startDate: string;
  days: number;
  status: 'DRAFT' | 'ACCEPTED' | 'DISCARDED';
  slots: PlanSlot[];
}

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

  /** Called when the session cannot be renewed, so the app can send somebody back to login. */
  static onSessionExpired?: () => void;

  static setIsOnline(payload: boolean) {
    RestAPI.isOnline = payload;
  }
  static async getUserInfo(): Promise<UserInfo> {
    const response = await this.get('/users/self');
    AppPersistence.storeUserInfoOffline(response.data);
    return response?.data;
  }
  static async setWeekplanRecipes(date: string, recipes: WeekplanDayRecipeRequest[],
      householdId?: string | null): Promise<WeekplanDay> {
    const response = await this.put(`/weekplan/${date}${householdScope(householdId)}`, {recipes: recipes});
    return response?.data;
  }
  static async getWeekplanDays(from: XDate, to: XDate): Promise<WeekplanDay[]> {
    const response = await this.get(
        `/weekplan/${from.toString('yyyy-MM-dd')}/to/${to.toString('yyyy-MM-dd')}?allPlans=true`);

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

  static async getSharedRecipeNutrition(shareId: string): Promise<RecipeNutrition> {
    return (await axios.get(await this.sharedUrl(shareId, '/nutrition'))).data;
  }

  /**
   * Ranks the user's own recipes against what they have and want.
   *
   * A POST because the request is structured, not because it changes anything.
   *
   * @param {RecipeSuggestionRequest} request what the cook answered
   * @return {Promise<RecipeSuggestions>} the ranked recipes, with the seed that ordered them
   */
  static async suggestRecipes(request: RecipeSuggestionRequest): Promise<RecipeSuggestions> {
    const response = await this.post('/recipes/suggestions', request);
    return response?.data;
  }

  static async getPlanningProfiles(householdId?: string | null): Promise<PlanningProfile[]> {
    const response = await this.get('/planning/profiles' + householdScope(householdId));
    return response?.data;
  }

  /**
   * @param {PlanningProfile} profile the answers; created when it has no id, changed otherwise
   * @param {string} householdId whose plan; nothing for your own
   * @return {Promise<PlanningProfile>} the profile as saved
   */
  static async savePlanningProfile(profile: PlanningProfile,
      householdId?: string | null): Promise<PlanningProfile> {
    const scope = householdScope(householdId);
    const response = profile.id === undefined ?
      await this.post('/planning/profiles' + scope, profile) :
      await this.put(`/planning/profiles/${profile.id}${scope}`, profile);
    return response?.data;
  }

  /**
   * @param {number} profileId the answers to plan from
   * @param {string} startDate the first day, as a day key
   * @param {number} days how many days from there
   * @param {string[]} skippedDates days the cook is not at home; nothing is planned for them
   * @param {string} householdId whose plan; nothing for your own
   * @return {Promise<PlanDraft>} the proposed week
   */
  static async generatePlanDraft(
      profileId: number, startDate: string, days: number, skippedDates: string[],
      householdId?: string | null,
  ): Promise<PlanDraft> {
    const response = await this.post('/planning/drafts' + householdScope(householdId),
        {profileId, startDate, days, skippedDates});
    return response?.data;
  }

  /**
   * @param {number} draftId the proposed week
   * @param {string} householdId whose plan; nothing for your own
   * @return {Promise<PlanDraft>} the week
   */
  static async getPlanDraft(draftId: number, householdId?: string | null): Promise<PlanDraft> {
    const response = await this.get(`/planning/drafts/${draftId}${householdScope(householdId)}`);
    return response?.data;
  }

  /**
   * Something else for one meal; never the recipe it had.
   *
   * @param {number} draftId the proposed week
   * @param {number} slotId the meal
   * @param {RerollReason} [reason] why the recipe was passed over, which steers the replacement
   * @param {string} householdId whose plan; nothing for your own
   * @return {Promise<PlanDraft>} the week after the change
   */
  static async rerollPlanSlot(draftId: number, slotId: number, reason?: RerollReason,
      householdId?: string | null): Promise<PlanDraft> {
    const response = await this.post(
        `/planning/drafts/${draftId}/slots/${slotId}/reroll${householdScope(householdId)}`, {reason});
    return response?.data;
  }

  /**
   * @param {number} draftId the proposed week
   * @param {number} slotId the meal
   * @param {boolean} locked whether it stays as it is when the week is drawn again
   * @param {string} householdId whose plan; nothing for your own
   * @return {Promise<PlanDraft>} the week after the change
   */
  static async setPlanSlotLocked(draftId: number, slotId: number, locked: boolean,
      householdId?: string | null): Promise<PlanDraft> {
    const response = await this.post(
        `/planning/drafts/${draftId}/slots/${slotId}/lock${householdScope(householdId)}`, {locked});
    return response?.data;
  }

  /**
   * Turns a meal into a gap for the cook to fill, or a gap back into a cooked meal.
   *
   * @param {number} draftId the proposed week
   * @param {number} slotId the meal
   * @param {string} householdId whose plan; nothing for your own
   * @return {Promise<PlanDraft>} the week after the change
   */
  static async togglePlanSlotGap(draftId: number, slotId: number,
      householdId?: string | null): Promise<PlanDraft> {
    const response = await this.post(
        `/planning/drafts/${draftId}/slots/${slotId}/toggle-gap${householdScope(householdId)}`, {});
    return response?.data;
  }

  /**
   * A new draw for every meal that is not locked.
   *
   * @param {number} draftId the proposed week
   * @param {string} householdId whose plan; nothing for your own
   * @return {Promise<PlanDraft>} the week after the change
   */
  static async rerollPlanDraft(draftId: number, householdId?: string | null): Promise<PlanDraft> {
    const response = await this.post(
        `/planning/drafts/${draftId}/reroll${householdScope(householdId)}`, {});
    return response?.data;
  }

  /**
   * Adds the week's meals to the weekplan; meals planned by hand stay.
   *
   * @param {number} draftId the proposed week
   * @param {string} householdId whose plan; nothing for your own
   * @return {Promise<PlanDraft>} the week, now accepted
   */
  static async acceptPlanDraft(draftId: number, householdId?: string | null): Promise<PlanDraft> {
    const response = await this.post(
        `/planning/drafts/${draftId}/accept${householdScope(householdId)}`, {});
    return response?.data;
  }

  static async discardPlanDraft(draftId: number, householdId?: string | null): Promise<void> {
    await this.delete(`/planning/drafts/${draftId}${householdScope(householdId)}`);
  }

  /**
   * @return {Promise<Household[]>} the caller's households
   */
  static async getHouseholds(): Promise<Household[]> {
    return (await this.get('/households'))?.data;
  }

  /**
   * @param {string} householdId which household
   * @return {Promise<Household>} it, with its members and the size of its cookbook
   */
  static async getHousehold(householdId: string): Promise<Household> {
    return (await this.get(`/households/${householdId}`))?.data;
  }

  /**
   * @param {string} name what to call it
   * @param {boolean} shareRecipes whether your own cookbook goes in
   * @return {Promise<Household>} the new household, with you as its first member
   */
  static async createHousehold(name: string, shareRecipes: boolean): Promise<Household> {
    return (await this.post('/households', {name: name, shareRecipes: shareRecipes}))?.data;
  }

  /**
   * @param {string} householdId which household
   * @param {string} name the new name
   * @return {Promise<Household>} it, renamed
   */
  static async renameHousehold(householdId: string, name: string): Promise<Household> {
    return (await this.put(`/households/${householdId}`, {name: name}))?.data;
  }

  /**
   * Puts your whole cookbook into a household, or takes it back out.
   *
   * @param {string} householdId which household
   * @param {boolean} shareRecipes whether your recipes are in it
   * @return {Promise<Household>} it, with the switch as it now stands
   */
  static async setHouseholdSharing(householdId: string, shareRecipes: boolean): Promise<Household> {
    return (await this.put(`/households/${householdId}/sharing`, {shareRecipes: shareRecipes}))?.data;
  }

  /**
   * Leaves a household, or removes somebody else.
   *
   * @param {string} householdId which household
   * @param {number} memberUserId who goes
   */
  static async removeHouseholdMember(householdId: string, memberUserId: number): Promise<void> {
    await this.delete(`/households/${householdId}/members/${memberUserId}`);
  }

  /**
   * @param {string} householdId which household
   * @return {Promise<HouseholdInvite>} a link that lets whoever holds it join
   */
  static async createHouseholdInvite(householdId: string): Promise<HouseholdInvite> {
    return (await this.post(`/households/${householdId}/invites`, {}))?.data;
  }

  /**
   * @param {string} householdId which household
   * @return {Promise<HouseholdInvite[]>} its links that are still valid
   */
  static async getHouseholdInvites(householdId: string): Promise<HouseholdInvite[]> {
    return (await this.get(`/households/${householdId}/invites`))?.data;
  }

  /**
   * @param {string} householdId which household
   * @param {string} inviteId the link to stop
   */
  static async revokeHouseholdInvite(householdId: string, inviteId: string): Promise<void> {
    await this.delete(`/households/${householdId}/invites/${inviteId}`);
  }

  /**
   * What an invite leads to: the household's name, and nothing else.
   *
   * @param {string} token the invite token
   * @return {Promise<string>} the household's name
   */
  static async previewHouseholdInvite(token: string): Promise<string> {
    return (await this.get(`/household-invites/${token}`))?.data?.householdName;
  }

  /**
   * @param {string} token the invite token
   * @param {boolean} shareRecipes whether your cookbook comes with you
   * @return {Promise<Household>} the household you joined
   */
  static async acceptHouseholdInvite(token: string, shareRecipes: boolean): Promise<Household> {
    return (await this.post(`/household-invites/${token}/accept`, {shareRecipes: shareRecipes}))?.data;
  }

  /**
   * One page of a household's cookbook.
   *
   * @param {string} householdId which household
   * @param {number} page which page, from zero
   * @param {string} search matched like the search of your own cookbook; empty for everything
   * @return {Promise<HouseholdRecipePage>} that page of its recipes, as summaries
   */
  static async getHouseholdRecipes(householdId: string, page = 0, search = ''): Promise<HouseholdRecipePage> {
    const query = search ? `&search=${encodeURIComponent(search)}` : '';
    return (await this.get(`/households/${householdId}/recipes?page=${page}${query}`))?.data;
  }

  /**
   * Copies a recipe somebody else owns into your own cookbook.
   *
   * @param {number} recipeId which recipe
   * @return {Promise<Recipe>} your copy
   */
  static async saveRecipeCopy(recipeId: number): Promise<Recipe> {
    return (await this.post(`/recipes/${recipeId}/import`, {}))?.data;
  }

  /**
   * What deleting one of your recipes would affect, for the warning shown first.
   *
   * @param {number} recipeId the recipe about to be deleted
   * @return {Promise<RecipeDeletionImpact>} how many households and planned meals it would leave
   */
  static async getRecipeDeletionImpact(recipeId: number): Promise<RecipeDeletionImpact> {
    return (await this.get(`/recipes/${recipeId}/impact`))?.data;
  }

  /**
   * The name fellow household members see. Blank clears it.
   *
   * @param {string} displayName what to be called
   * @return {Promise<UserInfo>} the account as it now stands
   */
  static async setDisplayName(displayName: string): Promise<UserInfo> {
    return (await this.put('/users/self/displayName', {displayName: displayName}))?.data;
  }

  /**
   * Finishes the first-run setup with the name it asked for.
   *
   * @param {string} displayName the name chosen during setup
   * @return {Promise<UserInfo>} the account, set up
   */
  static async completeOnboarding(displayName: string): Promise<UserInfo> {
    return (await this.post('/users/self/onboarding', {displayName: displayName}))?.data;
  }

  /**
   * The diet a recipe with these ingredients would have, read from the catalogue; nothing is stored.
   *
   * @param {string[]} ingredientNames the ingredients as written
   * @return {Promise<RecipeDiet | null>} the diet, or null where the ingredients do not tell
   */
  static async previewDiet(ingredientNames: string[]): Promise<RecipeDiet | null> {
    const response = await this.post('/recipes/diet-preview', {ingredientNames});
    return response?.data.diet ?? null;
  }

  static async getRecipeNutrition(recipeId: number): Promise<RecipeNutrition> {
    return (await this.get(`/recipes/${recipeId}/nutrition`))?.data;
  }

  static async searchCatalogue(query: string): Promise<CatalogueFood[]> {
    return (await this.get(`/catalogue/search?q=${encodeURIComponent(query)}`))?.data;
  }

  // catalogueFoodId null excludes the ingredient from nutrition.
  static async linkIngredient(ingredientId: number, catalogueFoodId: number | null): Promise<void> {
    await this.put(`/ingredients/${ingredientId}/link`,
      catalogueFoodId === null ? {excluded: true} : {catalogueFoodId: catalogueFoodId});
  }

  // unit as the recipe writes it; empty for pieces.
  static async setOwnPortion(ingredientId: number, unit: string, grams: number): Promise<void> {
    await this.put(`/ingredients/${ingredientId}/portion`, {unit: unit, grams: grams});
  }

  static async removeOwnPortion(ingredientId: number, unit: string): Promise<void> {
    await this.delete(`/ingredients/${ingredientId}/portion?unit=${encodeURIComponent(unit)}`);
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
    await axios.post(await this.url('/users/signup'), {
      emailAddress: emailAddress,
      password: password,
    });
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

    // 403 is a permission the account does not have, not a token that has run out; renewing
    // would answer the same way and cost a second request for every refusal.
    if (errResponse.status === 401) {
      console.warn('Axios warning: Auth fail, trying to refresh token');
      try {
        await this.refreshToken();
      } catch (refreshError) {
        // The refresh token is spent too, so there is no way back without signing in. Said
        // once, here, rather than left to each screen to notice.
        console.error('Failed to refresh token');
        this.onSessionExpired?.();
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


