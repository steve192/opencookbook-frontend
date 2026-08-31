import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Appbar, Button, Divider, Menu, SegmentedButtons, Surface, Text, TextInput} from 'react-native-paper';
import {RecipeImageViewPager} from '../../components/RecipeImageViewPager';
import {SectionTitle} from '../../components/SectionTitle';
import {Option} from '../../components/SelectionPopupModal';
import RestAPI, {Ingredient, IngredientUse, Recipe, RecipeDiet} from '../../dao/RestAPI';
import {dietLabel, RECIPE_DIETS} from '../../helper/recipeDiet';
import {
  emptyRecipe,
  forSaving,
  withDiet,
  withGroup,
  withImageAdded,
  withImageRemoved,
  withImages,
  withIngredientAdded,
  withIngredientChanged,
  withIngredientMoved,
  withIngredientRemoved,
  withNumberField,
  withStepAdded,
  withStepChanged,
  withStepMoved,
  withStepRemoved,
  withTitle,
} from '../../helper/recipeEdits';
import {useProgressiveRender} from '../../helper/useProgressiveRender';
import {PromptUtil} from '../../helper/Prompt';
import {MainNavigationProps} from '../../navigation/NavigationRoutes';
import {createRecipe, deleteRecipe, updateRecipe} from '../../redux/features/recipesSlice';
import {useAppDispatch, useAppSelector} from '../../redux/hooks';
import CentralStyles, {useAppTheme} from '../../styles/CentralStyles';
import {IngredientFormField} from './IngredientFromField';
import {RecipeFormField} from './PreparationStepFormField';
import {RecipeGroupFormField} from './RecipeGroupFormField';


type Props = NativeStackScreenProps<MainNavigationProps, 'RecipeWizardScreen'>;

const RecipeWizardScreen = (props: Props) => {
  const theme = useAppTheme();

  const {t} = useTranslation('translation');
  const dispatch = useAppDispatch();

  const existingRecipe: Recipe | undefined = useAppSelector((state) => state.recipes.recipes.filter((recipe) => recipe.id === props.route.params?.recipeId)?.[0]);

  const [recipeData, setRecipeData] = useState<Recipe>(existingRecipe ?? emptyRecipe());
  const [savePending, setSavePending] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // What the form looked like when it opened, to tell an edit from an untouched visit
  const pristineRecipe = useRef(JSON.stringify(existingRecipe ?? emptyRecipe()));
  const savedOrDiscarded = useRef(false);

  // Fetched once for the whole screen. Every ingredient row used to request the full
  // ingredient list on mount and again on every keystroke, so opening a recipe with
  // fifteen ingredients fired fifteen requests before anything could be drawn.
  const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([]);
  const [availableUnits, setAvailableUnits] = useState<string[]>([]);

  useEffect(() => {
    RestAPI.getIngredients().then(setAvailableIngredients).catch(() => setAvailableIngredients([]));
    RestAPI.getUnits().then(setAvailableUnits);
  }, []);

  // Every row used to turn the whole ingredient and unit list into options of its own, on
  // every render, even though the picker only reads them once it is opened.
  const ingredientOptions = useMemo<Option[]>(
      () => availableIngredients.map((ingredient) => ({
        key: ingredient.id ? ingredient.id.toString() : ingredient.name,
        value: ingredient.name,
      })),
      [availableIngredients],
  );
  const unitOptions = useMemo<Option[]>(
      () => availableUnits.map((unit, index) => ({key: index.toString(), value: unit})),
      [availableUnits],
  );
  const resolveIngredient = useCallback(
      (name: string) => availableIngredients.find(
          (ingredient) => ingredient.name.toLowerCase() === name.toLowerCase()),
      [availableIngredients],
  );

  const isDirty = () => JSON.stringify(recipeData) !== pristineRecipe.current;

  // Each change is a pure function on the recipe; the screen only says when to apply one
  const edit = useCallback((change: (recipe: Recipe) => Recipe) => setRecipeData(change), []);

  const changeIngredient = useCallback(
      (ingredient: IngredientUse, index: number) =>
        edit((recipe) => withIngredientChanged(recipe, index, ingredient)),
      [edit],
  );
  const removeIngredient = useCallback(
      (index: number) => edit((recipe) => withIngredientRemoved(recipe, index)),
      [edit],
  );
  const moveIngredient = useCallback(
      (fromIndex: number, toIndex: number) => edit((recipe) => withIngredientMoved(recipe, fromIndex, toIndex)),
      [edit],
  );

  const saveRecipe = () => {
    if (savePending) return;
    setSavePending(true);
    const toSave = forSaving(recipeData);
    const action = props.route.params.editing ? updateRecipe(toSave) : createRecipe(toSave);
    dispatch(action).then(() => {
      savedOrDiscarded.current = true;
      props.navigation.goBack();
    }).finally(() => setSavePending(false));
  };

  const performDelete = () => {
    savedOrDiscarded.current = true;
    if (props.route.params.editing) {
      dispatch(deleteRecipe(recipeData)).then(() => props.navigation.goBack());
    } else {
      props.navigation.goBack();
    }
  };

  // Always confirm before destroying a recipe - the old behaviour was a single
  // tap on the trash icon with no safety net.
  const onDeleteRecipe = () => {
    const discarding = !props.route.params.editing;
    PromptUtil.show({
      title: discarding ? t('screens.editRecipe.discardTitle') : t('screens.editRecipe.deleteTitle'),
      message: discarding ? t('screens.editRecipe.discardMessage') : t('screens.editRecipe.deleteMessage'),
      button1: t('common.delete'),
      button1Callback: performDelete,
      button2: t('common.cancel'),
    });
  };

  // Leaving the screen threw the whole edit away without asking. Delete and discard were
  // already guarded; the back gesture, which is far easier to hit by accident, was not.
  useEffect(() => props.navigation.addListener('beforeRemove', (event) => {
    if (savedOrDiscarded.current || !isDirty()) {
      return;
    }
    event.preventDefault();
    PromptUtil.show({
      title: t('screens.editRecipe.unsavedTitle'),
      message: t('screens.editRecipe.unsavedMessage'),
      button1: t('common.delete'),
      button1Callback: () => {
        savedOrDiscarded.current = true;
        props.navigation.dispatch(event.data.action);
      },
      button2: t('screens.editRecipe.keepEditing'),
    });
  }), [props.navigation, recipeData, t]);

  useLayoutEffect(() => {
    props.navigation.setOptions({
      title: props.route.params?.editing ? t('screens.editRecipe.screenTitleEdit') : t('screens.editRecipe.screenTitleCreate'),
      // Save is the only thing in the bar now. Delete used to sit right beside it.
      headerRight: () => (
        <>
          <Appbar.Action
            icon="content-save-outline"
            color={theme.colors.onPrimary}
            disabled={savePending || recipeData.title.trim().length === 0}
            onPress={saveRecipe}
          />
          <Menu
            visible={menuOpen}
            onDismiss={() => setMenuOpen(false)}
            anchor={
              <Appbar.Action
                icon="dots-vertical"
                color={theme.colors.onPrimary}
                accessibilityLabel={t('screens.recipe.moreActions')}
                onPress={() => setMenuOpen(true)} />
            }>
            <Menu.Item
              leadingIcon="delete-outline"
              title={t('common.delete')}
              onPress={() => {
                setMenuOpen(false);
                onDeleteRecipe();
              }} />
          </Menu>
        </>
      ),
    });
  }, [props.navigation, recipeData, menuOpen, savePending, theme, t]);

  // Enough to fill the screen at once, the rest as soon as the transition is over
  const renderedIngredients = useProgressiveRender(recipeData.neededIngredients.length, 5);
  const renderedSteps = useProgressiveRender(recipeData.preparationSteps.length, 3);

  const dietOptions = useMemo(
      () => RECIPE_DIETS.map((diet) => ({value: diet, label: dietLabel(t, diet) ?? diet})),
      [t],
  );

  const renderIngredientsSection = () => (
    <View style={styles.section}>
      <SectionTitle testID='ingredient-list-title'>{t('screens.editRecipe.ingredients')}</SectionTitle>
      {recipeData.neededIngredients.length === 0 &&
        <Text style={{color: theme.colors.onSurfaceVariant}}>{t('screens.editRecipe.noIngredientsYet')}</Text>
      }
      {recipeData.neededIngredients.slice(0, renderedIngredients).map((neededIngredient, ingredientIndex) => (
        <IngredientFormField
          key={ingredientIndex}
          ingredient={neededIngredient}
          ingredientIndex={ingredientIndex}
          ingredientOptions={ingredientOptions}
          unitOptions={unitOptions}
          resolveIngredient={resolveIngredient}
          canMoveUp={ingredientIndex > 0}
          canMoveDown={ingredientIndex < recipeData.neededIngredients.length - 1}
          onIngredientChange={changeIngredient}
          onMove={moveIngredient}
          onRemovePress={removeIngredient} />
      ))}
      <Button icon="plus" onPress={() => edit(withIngredientAdded)}>{t('screens.editRecipe.addIngredient')}</Button>
    </View>
  );

  const renderPreparationStepsSection = () => (
    <View style={styles.section}>
      <SectionTitle>{t('screens.editRecipe.preparationSteps')}</SectionTitle>
      {recipeData.preparationSteps.length === 0 &&
        <Text style={{color: theme.colors.onSurfaceVariant}}>{t('screens.editRecipe.noStepsYet')}</Text>
      }
      {recipeData.preparationSteps.slice(0, renderedSteps).map((preparationStep, preparationStepIndex) => (
        <RecipeFormField
          key={preparationStepIndex}
          label={t('screens.editRecipe.stepNumber', {number: preparationStepIndex + 1})}
          multiline={true}
          numberOfLines={4}
          value={preparationStep}
          canMoveUp={preparationStepIndex > 0}
          canMoveDown={preparationStepIndex < recipeData.preparationSteps.length - 1}
          onMoveUp={() => edit((recipe) => withStepMoved(recipe, preparationStepIndex, preparationStepIndex - 1))}
          onMoveDown={() => edit((recipe) => withStepMoved(recipe, preparationStepIndex, preparationStepIndex + 1))}
          onRemovePress={() => edit((recipe) => withStepRemoved(recipe, preparationStepIndex))}
          onChangeText={(newText: string) => edit((recipe) => withStepChanged(recipe, preparationStepIndex, newText))}
          placeholder={t('screens.editRecipe.preparationStepPlaceholder')} />
      ))}
      <Button icon="plus" onPress={() => edit(withStepAdded)}>{t('screens.editRecipe.addStep')}</Button>
    </View>
  );

  // Servings and the two times describe the recipe, so they sit together under the title
  // instead of servings being a lone number field between ingredients and steps.
  const renderFactsSection = () => (
    <View style={styles.section}>
      <View style={styles.factsRow}>
        <TextInput
          mode='outlined'
          dense={true}
          style={styles.fact}
          label={t('screens.editRecipe.servings')}
          keyboardType='numeric'
          value={recipeData.servings === undefined ? '' : recipeData.servings?.toString()}
          onChangeText={(newText) => edit((recipe) => withNumberField(recipe, 'servings', newText))} />
        <TextInput
          mode='outlined'
          dense={true}
          style={styles.fact}
          label={t('screens.editRecipe.preparationTime')}
          keyboardType='numeric'
          value={recipeData.preparationTime ? String(recipeData.preparationTime) : ''}
          onChangeText={(newText) => edit((recipe) => withNumberField(recipe, 'preparationTime', newText))} />
        <TextInput
          mode='outlined'
          dense={true}
          style={styles.fact}
          label={t('screens.editRecipe.totalTimeField')}
          keyboardType='numeric'
          value={recipeData.totalTime ? String(recipeData.totalTime) : ''}
          onChangeText={(newText) => edit((recipe) => withNumberField(recipe, 'totalTime', newText))} />
      </View>
      <Text variant="labelLarge" style={{color: theme.colors.onSurfaceVariant}}>{t('screens.editRecipe.diet')}</Text>
      <SegmentedButtons
        density="small"
        value={recipeData.recipeType ?? ''}
        // Tapping the selected option again clears it, so a recipe can go back to unset
        onValueChange={(value) => edit((recipe) =>
          withDiet(recipe, value === recipe.recipeType ? null : (value as RecipeDiet)))}
        buttons={dietOptions} />
    </View>
  );

  return (
    <Surface style={styles.screen}>
      <ScrollView keyboardShouldPersistTaps='handled' contentContainerStyle={styles.scrollContent}>
        <RecipeImageViewPager
          style={{height: 260}}
          onImageAdded={(uuid) => edit((recipe) => withImageAdded(recipe, uuid))}
          onImageRemoved={(uuid) => edit((recipe) => withImageRemoved(recipe, uuid))}
          onImagesReordered={(images) => edit((recipe) => withImages(recipe, images))}
          images={recipeData.images}
          allowEdit={true}
        />
        <View style={[CentralStyles.contentContainer, styles.form]}>
          <TextInput
            label={t('screens.editRecipe.title')}
            value={recipeData.title}
            mode="outlined"
            onChangeText={(newText) => edit((recipe) => withTitle(recipe, newText))}
            placeholder={t('screens.editRecipe.name')} />
          {renderFactsSection()}
          <Divider />
          {renderIngredientsSection()}
          <Divider />
          {renderPreparationStepsSection()}
          <Divider />
          <View style={styles.section}>
            <SectionTitle>{t('screens.editRecipe.recipeGroups')}</SectionTitle>
            <RecipeGroupFormField
              recipeGroup={recipeData.recipeGroups?.[0]}
              onRecipeGroupChange={(group) => edit((recipe) => withGroup(recipe, group))} />
          </View>
          <Button
            mode="contained"
            loading={savePending}
            disabled={savePending || recipeData.title.trim().length === 0}
            onPress={saveRecipe}>
            {props.route.params?.editing ? t('common.save') : t('common.create')}
          </Button>
        </View>
      </ScrollView>
    </Surface>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  form: {
    gap: 16,
  },
  section: {
    gap: 8,
  },
  factsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  fact: {
    flex: 1,
  },
});


export default RecipeWizardScreen;
