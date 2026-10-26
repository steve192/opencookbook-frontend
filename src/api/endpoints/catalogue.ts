import {api, KEEP_BRIEFLY_SECONDS} from '../api';
import {queryString} from '../queryString';
import {CatalogueFood, SeasonalFood, SoakingFood} from '../types/catalogue';

const catalogueApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Without lang the names come in the user's language; the tools pass it, as they work without an account.
    searchCatalogue: builder.query<CatalogueFood[], {q: string, lang?: string}>({
      query: ({q, lang}) => ({url: '/catalogue/search' + queryString({q, lang}), signInOptional: true}),
      keepUnusedDataFor: KEEP_BRIEFLY_SECONDS,
    }),
    getSeasons: builder.query<SeasonalFood[], {lang: string}>({
      query: ({lang}) => ({url: '/catalogue/seasons' + queryString({lang}), signInOptional: true}),
    }),
    getSoaking: builder.query<SoakingFood[], void>({
      query: () => ({url: '/catalogue/soaking', signInOptional: true}),
    }),
  }),
});

export const {useSearchCatalogueQuery, useGetSeasonsQuery, useGetSoakingQuery} = catalogueApi;
