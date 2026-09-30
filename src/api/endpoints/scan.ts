import {api, KEEP_BRIEFLY_SECONDS} from '../api';
import {formImage} from '../formImage';
import {imageForm, uploadRequest} from '../upload';
import {DetectedPage, RecipeScanJob} from '../types/scan';
import {asRecipe} from './recipes';

// The server does not send the discriminator the app's own Recipe type carries.
const asScanJob = (job: RecipeScanJob): RecipeScanJob =>
  job.recipe ? {...job, recipe: asRecipe(job.recipe)} : job;

const scanApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Several pictures are one scan: a recipe printed across a spread would otherwise be two halves.
    scanRecipe: builder.mutation<RecipeScanJob, {imageUris: string[], payload: string, trainingConsent: boolean}>({
      queryFn: async ({imageUris, payload, trainingConsent}, _api, _extra, baseQuery) => {
        const body = new FormData();
        for (const image of await Promise.all(imageUris.map(formImage))) {
          body.append('images', image);
        }
        body.append('payload', payload);
        body.append('trainingConsent', String(trainingConsent));
        const result = await baseQuery(uploadRequest('/ml/recipe-ocr', body));
        return result.error ? {error: result.error} : {data: asScanJob(result.data as RecipeScanJob)};
      },
    }),
    // Answered at once and costs no allowance, so it is asked for every picture taken.
    detectPageEdges: builder.mutation<DetectedPage, string>({
      queryFn: async (imageUri, _api, _extra, baseQuery) => {
        const result = await baseQuery(uploadRequest('/ml/page-edges', await imageForm('image', imageUri)));
        return result.error ? {error: result.error} : {data: result.data as DetectedPage};
      },
    }),
    getRecipeScanJob: builder.query<RecipeScanJob, string>({
      query: (jobId) => ({url: `/ml/jobs/${jobId}`}),
      transformResponse: asScanJob,
      keepUnusedDataFor: KEEP_BRIEFLY_SECONDS,
    }),
    // Relabels what has been read already rather than reading it again.
    refineRecipeScan: builder.mutation<RecipeScanJob, {jobId: string, corrections: Record<string, unknown>}>({
      query: ({jobId, corrections}) => ({url: `/ml/jobs/${jobId}/refine`, method: 'POST', body: {blocks: corrections}}),
      transformResponse: asScanJob,
    }),
    // Gives up a scan, so its place in the queue is not spent on a recipe nobody wants.
    cancelRecipeScanJob: builder.mutation<void, string>({
      query: (jobId) => ({url: `/ml/jobs/${jobId}`, method: 'DELETE'}),
    }),
    // Withdraws consent: the photographs kept for improving recognition are deleted.
    deleteScanTrainingData: builder.mutation<void, void>({
      query: () => ({url: '/ml/training-data', method: 'DELETE'}),
    }),
  }),
});

export const {
  useScanRecipeMutation,
  useDetectPageEdgesMutation,
  useLazyGetRecipeScanJobQuery,
  useRefineRecipeScanMutation,
  useCancelRecipeScanJobMutation,
  useDeleteScanTrainingDataMutation,
} = scanApi;
