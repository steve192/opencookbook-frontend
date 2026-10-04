import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {toApiError} from '../api/ApiError';
import {useImportRecipeMutation} from '../api/endpoints/recipes';
import {Recipe} from '../api/types/recipes';
import {askForPlanningDetails} from '../components/PlanningDetailsPrompt';
import {ErrorMessageKey, errorMessageKey} from './apiErrorMessage';
import {PromptUtil} from './Prompt';
import {holdDraft} from './recipeDraftHandover';
import {hostOf} from './sharedContent';

export type ImportResult<Fallback extends string> =
  | {kind: 'saved'; recipe: Recipe}
  | {kind: 'failed'; messageKey: Fallback | ErrorMessageKey};

interface Options<Fallback extends string> {
  /** Opens the wizard on the draft held in recipeDraftHandover. */
  openDraft: () => void;
  onSaved?: (recipe: Recipe) => void;
  failureFallback: Fallback | ErrorMessageKey;
}

// A recipe website is saved; text and Instagram posts open in the wizard unsaved, as a scan does.
export const useRecipeImport = <Fallback extends string>({openDraft, onSaved, failureFallback}: Options<Fallback>) => {
  const {t} = useTranslation('translation');
  const [importRecipe, {isLoading: importing}] = useImportRecipeMutation();
  const [result, setResult] = useState<ImportResult<Fallback>>();

  const startImport = (input: string) => {
    setResult(undefined);
    importRecipe(input).unwrap().then(({recipe, saved}) => {
      if (saved) {
        setResult({kind: 'saved', recipe});
        onSaved?.(recipe);
        askForPlanningDetails(recipe);
        return;
      }
      holdDraft(recipe);
      openDraft();
    }).catch((error) => {
      const {code, link} = toApiError(error);
      const failed: ImportResult<Fallback> = {kind: 'failed', messageKey: errorMessageKey(error, failureFallback)};
      if (code !== 'IMPORT_NO_RECIPE' || !link) {
        setResult(failed);
        return;
      }
      // A post without a recipe that points to one.
      PromptUtil.show({
        title: t('screens.import.linkedRecipe.title'),
        message: t('screens.import.linkedRecipe.message', {host: hostOf(link)}),
        cancel: t('common.cancel'),
        onCancel: () => setResult(failed),
        confirm: t('screens.import.import'),
        onConfirm: () => startImport(link),
      });
    });
  };

  return {startImport, importing, result, clearResult: () => setResult(undefined)};
};
