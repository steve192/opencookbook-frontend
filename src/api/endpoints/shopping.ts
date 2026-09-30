import {api, KEEP_BRIEFLY_SECONDS} from '../api';
import {apiUrl} from '../client';
import {householdScope, queryString} from '../queryString';
import {
  ImportLine, PreviewMeal, ShoppingChanges, ShoppingList, ShoppingOp, ShoppingVocabulary, ShownLine, Staple,
} from '../types/shopping';

// Lists and their items live in the shopping slice, which keeps what is changed offline.
const NOT_CACHED = 0;

/** The amounts in the lines are final; servings is only the yield Bring shows. */
interface BringLinesExport {
  title: string;
  servings: number;
  lines: string[];
  shown: ShownLine[];
}

/** The live channel speaks websocket on the same host. */
export const shoppingLiveUrl = async (): Promise<string> => (await apiUrl('/shopping/live')).replace(/^http/, 'ws');

/** A week of one plan, or one recipe. */
export type PreviewSource =
  | {kind: 'week', from: string, to: string, householdId?: string}
  | {kind: 'recipe', recipeId: number};

const shoppingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Every list you can use, your own first; default lists are made on first asking.
    getShoppingLists: builder.query<ShoppingList[], void>({
      query: () => ({url: '/shopping/lists'}),
      keepUnusedDataFor: NOT_CACHED,
    }),
    createShoppingList: builder.mutation<ShoppingList, {name: string, householdId: string | null}>({
      query: ({name, householdId}) => ({url: '/shopping/lists' + householdScope(householdId), method: 'POST',
        body: {name}}),
    }),
    renameShoppingList: builder.mutation<ShoppingList, {list: ShoppingList, name: string}>({
      query: ({list, name}) => ({url: `/shopping/lists/${list.id}${householdScope(list.householdId)}`, method: 'PUT',
        body: {name}}),
    }),
    deleteShoppingList: builder.mutation<void, ShoppingList>({
      query: (list) => ({url: `/shopping/lists/${list.id}${householdScope(list.householdId)}`, method: 'DELETE'}),
    }),
    getShoppingChanges: builder.query<ShoppingChanges, {list: ShoppingList, since: number}>({
      query: ({list, since}) => ({url: `/shopping/lists/${list.id}/changes${queryString({household: list.householdId, since})}`}),
      keepUnusedDataFor: NOT_CACHED,
    }),
    // A batch may be sent again: the server skips ops it applied already.
    applyShoppingOps: builder.mutation<ShoppingChanges, {list: ShoppingList, since: number, ops: ShoppingOp[]}>({
      query: ({list, since, ops}) => ({url: `/shopping/lists/${list.id}/ops${queryString({household: list.householdId, since})}`,
        method: 'POST', body: {ops}}),
    }),
    importToShoppingList: builder.mutation<ShoppingList, {list: ShoppingList, lines: ImportLine[], shown: ShownLine[]}>({
      query: ({list, lines, shown}) => ({url: `/shopping/lists/${list.id}/import${householdScope(list.householdId)}`,
        method: 'POST', body: {lines, shown}}),
    }),
    getShoppingVocabulary: builder.query<ShoppingVocabulary, void>({
      query: () => ({url: '/shopping/vocabulary'}),
      keepUnusedDataFor: NOT_CACHED,
    }),
    // The meals with their ingredients unscaled.
    getImportPreview: builder.query<PreviewMeal[], PreviewSource>({
      query: (source) => ({url: source.kind === 'week' ?
        '/shopping/preview/week' + queryString({from: source.from, to: source.to, household: source.householdId}) :
        `/shopping/preview/recipe/${source.recipeId}`}),
      transformResponse: (preview: {meals: PreviewMeal[]}) => preview.meals,
      keepUnusedDataFor: KEEP_BRIEFLY_SECONDS,
    }),
    getStaples: builder.query<Staple[], void>({
      query: () => ({url: '/shopping/staples'}),
      providesTags: ['Staple'],
    }),
    forgetStaple: builder.mutation<void, number>({
      query: (stapleId) => ({url: `/shopping/staples/${stapleId}`, method: 'DELETE'}),
      invalidatesTags: ['Staple'],
    }),
    // Resolves to the export id Bring fetches the lines by.
    createBringExport: builder.mutation<string, number>({
      query: (recipeId) => ({url: '/bringexport', method: 'POST', body: {recipeId}}),
      transformResponse: (created: {exportId: string}) => created.exportId,
    }),
    createBringExportOfLines: builder.mutation<string, BringLinesExport>({
      query: (request) => ({url: '/bringexport/lines', method: 'POST', body: request}),
      transformResponse: (created: {exportId: string}) => created.exportId,
    }),
  }),
});

export const {
  useCreateShoppingListMutation,
  useRenameShoppingListMutation,
  useDeleteShoppingListMutation,
  useImportToShoppingListMutation,
  useGetImportPreviewQuery,
  useGetStaplesQuery,
  useForgetStapleMutation,
  useCreateBringExportMutation,
  useCreateBringExportOfLinesMutation,
} = shoppingApi;

export const shoppingEndpoints = shoppingApi.endpoints;
