import {api} from '../api';
import {LegalDocument} from '../types/legal';

const legalApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // An HTML fragment, public so that it can be read before anybody has an account.
    getLegalDocument: builder.query<string, LegalDocument>({
      query: (document) => ({url: `/legal/${document}`, anonymous: true}),
    }),
  }),
});

export const {useGetLegalDocumentQuery} = legalApi;
