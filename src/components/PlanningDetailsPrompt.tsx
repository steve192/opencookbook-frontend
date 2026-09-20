import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet} from 'react-native';
import {Button, Dialog, Portal, Text} from 'react-native-paper';
import AppPersistence from '../AppPersistence';
import {Recipe, RecipeDiet} from '../dao/RestAPI';
import {errorMessageKey} from '../helper/apiErrorMessage';
import {createGlobalOverlay} from '../helper/globalOverlay';
import {SnackbarUtil} from '../helper/GlobalSnackbar';
import {missingDetails} from '../helper/recipeCompleteness';
import {withDiet, withSuitToggled} from '../helper/recipeEdits';
import {RecipeSuit} from '../helper/recipeSuits';
import {useDerivedDiet} from '../helper/useDerivedDiet';
import {updateRecipe} from '../redux/features/recipesSlice';
import {useAppDispatch} from '../redux/hooks';
import {overlayStyles} from '../styles/CentralStyles';
import {PlanningDetailsFields} from './PlanningDetailsFields';

interface Options {
  /** Asks even where the cook switched the question off, for a question they brought up themselves. */
  always?: boolean;
}

const overlay = createGlobalOverlay<{recipe: Recipe} & Options>();

/**
 * Asks for what planning needs to know about a freshly imported recipe. Silent where the recipe
 * says it already, or where the cook asked not to be bothered after an import.
 *
 * @param {Recipe} recipe the recipe as saved
 * @param {Options} [options] how insistently to ask
 * @return {void}
 */
export const askForPlanningDetails = (recipe: Recipe, options?: Options) => overlay.show({recipe, ...options});

// Mounted once, shown from wherever a recipe arrives: an import, the browser, a shared recipe, or a
// reroll saying the recipe is no meal of its own.
export const PlanningDetailsPrompt = () => {
  const {t} = useTranslation('translation');
  const dispatch = useAppDispatch();
  const [recipe, setRecipe] = useState<Recipe>();
  const [insisted, setInsisted] = useState(false);
  const [saving, setSaving] = useState(false);
  // A diet read from the ingredients is offered as an answer, not kept behind the cook's back;
  // once the cook answers themselves it is never read again, not even when they clear it
  const [dietDerived, setDietDerived] = useState(false);
  const [dietChosen, setDietChosen] = useState(false);

  useDerivedDiet(
      recipe?.neededIngredients.map((use) => use.ingredient.name) ?? [],
      recipe !== undefined && !recipe.recipeType && !dietChosen,
      (diet) => {
        setRecipe((asked) => asked && diet ? withDiet(asked, diet) : asked);
        setDietDerived(diet !== null);
      });

  overlay.useOpener(({recipe: asked, always}) => {
    const insisting = always === true;
    const ask = async () => {
      if (!insisting && (missingDetails(asked).length === 0 || !await AppPersistence.getAskForPlanningDetails())) {
        return;
      }
      setInsisted(insisting);
      setDietDerived(false);
      setDietChosen(false);
      setRecipe(asked);
    };
    // The opener answers nothing, so the read of the stored preference is settled here.
    // Failing to read it leaves the prompt closed, same as answering no.
    ask().catch(() => undefined);
  });

  if (!recipe) {
    return null;
  }

  const close = () => setRecipe(undefined);

  const neverAgain = () => {
    AppPersistence.setAskForPlanningDetails(false);
    close();
  };

  const save = () => {
    setSaving(true);
    dispatch(updateRecipe(recipe)).unwrap()
        .then(() => SnackbarUtil.show({message: t('planningDetails.saved')}))
        .catch((error) => SnackbarUtil.show({message: t(errorMessageKey(error))}))
        .finally(() => {
          setSaving(false);
          close();
        });
  };

  return (
    <Portal>
      <Dialog visible style={overlayStyles.dialogView} onDismiss={close}>
        <Dialog.Title>{t('planningDetails.title')}</Dialog.Title>
        <Dialog.Content style={styles.content}>
          <Text variant="bodyMedium">{t('planningDetails.explanation', {title: recipe.title})}</Text>
          <PlanningDetailsFields
            recipe={recipe}
            dietDerived={dietDerived}
            onDietChosen={(diet: RecipeDiet | null) => {
              setDietDerived(false);
              setDietChosen(true);
              setRecipe(withDiet(recipe, diet));
            }}
            onSuitToggled={(suit: RecipeSuit) => setRecipe(withSuitToggled(recipe, suit))} />
        </Dialog.Content>
        <Dialog.Actions style={overlayStyles.dialogActions}>
          {!insisted && <Button onPress={neverAgain}>{t('planningDetails.neverAgain')}</Button>}
          <Button onPress={close}>{t('planningDetails.later')}</Button>
          <Button mode="contained" loading={saving} disabled={saving} onPress={save}>{t('common.save')}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  content: {gap: 12},
});
