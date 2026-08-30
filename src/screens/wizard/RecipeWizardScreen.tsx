import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useLayoutEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Appbar, Button, Caption, Divider, Surface, TextInput} from 'react-native-paper';
import Spacer from 'react-spacer';
import {ChunkView} from '../../ChunkView';
import {RecipeImageViewPager} from '../../components/RecipeImageViewPager';
import {IngredientUse, Recipe, RecipeGroup, RecipeImage} from '../../dao/RestAPI';
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

  const [recipeData, setRecipeData] = useState<Recipe>(
      existingRecipe ??
            {
              title: '',
              neededIngredients: [{ingredient: {name: ''}, amount: null, unit: ''}],
              preparationSteps: [''],
              images: [],
              servings: 1,
              recipeGroups: [{title: '', type: 'RecipeGroup'}],
              type: 'Recipe',
            });


  useLayoutEffect(() => {
    props.navigation.setOptions({
      title: props.route.params?.editing ? t('screens.editRecipe.screenTitleEdit') : t('screens.editRecipe.screenTitleCreate'),
      headerRight: () => (
        <>
          <Appbar.Action
            icon="delete-outline"
            color={theme.colors.error}
            onPress={() => onDeleteRecipe()}
          />
          <Appbar.Action
            icon="content-save-outline"
            color={theme.colors.onPrimary}
            onPress={() => saveRecipe()}
          />
        </>
      ),
    });
  }, [props.navigation, recipeData]);


  const changePreparationStep = (newText: string, index: number) => {
    const preparationStepsCopy = [...recipeData.preparationSteps];
    preparationStepsCopy[index] = newText;
    setRecipeData({...recipeData, preparationSteps: preparationStepsCopy});
  };

  const addPreparationStep = () => {
    const preparationStepsCopy = [...recipeData.preparationSteps];
    preparationStepsCopy.push('');
    setRecipeData({...recipeData, preparationSteps: preparationStepsCopy});
  };

  const removePreparationStep = (index: number) => {
    const preparationStepsCopy = [...recipeData.preparationSteps];
    preparationStepsCopy.splice(index, 1);
    setRecipeData({...recipeData, preparationSteps: preparationStepsCopy});
  };

  const removeIngredient = useCallback((index: number) => {
    setRecipeData((previousData) => {
      const ingredientsCopy = [...previousData.neededIngredients];
      ingredientsCopy.splice(index, 1);
      return {...previousData, neededIngredients: ingredientsCopy};
    });
  }, [setRecipeData]);

  const addRecipeImage = (uuid: string) => {
    setRecipeData((previousData) => ({...previousData, images: [...previousData.images, {uuid}]}));
  };

  const reorderRecipeImages = (images: RecipeImage[]) => {
    setRecipeData((previousData) => ({...previousData, images}));
  };

  // Unlinking is enough: the server drops the image from the recipe on save and its
  // deletion job collects images that no recipe references any more.
  const removeRecipeImage = (uuid: string) => {
    setRecipeData((previousData) => ({
      ...previousData,
      images: previousData.images.filter((image) => image.uuid !== uuid),
    }));
  };

  const addIngredient = () => {
    const ingredientsCopy = [...recipeData.neededIngredients];
    ingredientsCopy.push({
      ingredient: {id: undefined, name: ''},
      unit: '',
      amount: null,
    });
    setRecipeData({...recipeData, neededIngredients: ingredientsCopy});
  };

  const changeIngredient = useCallback(( ingredient: IngredientUse, index: number) => {
    setRecipeData((previousData) => {
      const ingredientsCopy = [...previousData.neededIngredients];
      ingredientsCopy[index] = ingredient;
      return {...previousData, neededIngredients: ingredientsCopy};
    });
  }, [setRecipeData]);

  const setRecipeGroup = (recipeGroup: RecipeGroup | undefined) => {
    if (!recipeGroup) {
      setRecipeData({...recipeData, recipeGroups: []});
    } else {
      setRecipeData({...recipeData, recipeGroups: [recipeGroup]});
    }
  };


  const [savePending, setSavePending] = useState(false);

  const saveRecipe = () => {
    if (savePending) return;
    setSavePending(true);
    const recipeDataCopy = {...recipeData};
    if (!recipeDataCopy.recipeGroups[0] || recipeDataCopy.recipeGroups[0].title === '') {
      // As long as there are no multiple groups
      recipeDataCopy.recipeGroups = [];
    }
    const action = props.route.params.editing ?
      updateRecipe(recipeDataCopy) :
      createRecipe(recipeDataCopy);
    dispatch(action).then(() => {
      props.navigation.goBack();
    }).finally(() => setSavePending(false));
  };

  const performDelete = () => {
    if (props.route.params.editing) {
      dispatch(deleteRecipe(recipeData)).then(() => {
        props.navigation.goBack();
      });
    } else {
      props.navigation.goBack();
    }
  };

  // Always confirm before destroying a recipe — the old behaviour was a single
  // tap on the trash icon with no safety net.
  const onDeleteRecipe = () => {
    if (!props.route.params.editing) {
      // For an unsaved recipe "delete" just means discard; still confirm so the
      // user doesn't accidentally lose work they've typed in.
      PromptUtil.show({
        title: t('screens.editRecipe.discardTitle'),
        message: t('screens.editRecipe.discardMessage'),
        button1: t('common.delete'),
        button1Callback: performDelete,
        button2: t('common.cancel'),
      });
      return;
    }
    PromptUtil.show({
      title: t('screens.editRecipe.deleteTitle'),
      message: t('screens.editRecipe.deleteMessage'),
      button1: t('common.delete'),
      button1Callback: performDelete,
      button2: t('common.cancel'),
    });
  };

  const renderIngredientsSection = () =>
    <>
      <Caption testID='ingredient-list-title'>{t('screens.editRecipe.ingredients')}</Caption>
      {recipeData.neededIngredients.map((neededIngredient, ingredientIndex) =>
        <React.Fragment key={ingredientIndex}>
          <IngredientFormField
            ingredient={neededIngredient}
            ingredientIndex={ingredientIndex}
            onIngredientChange={changeIngredient}
            onRemovePress={removeIngredient} />
          <Spacer height={10} />
        </React.Fragment>,
      )}
      <Spacer height={10} />
      <Button
        icon="plus"
        onPress={addIngredient} >{t('common.more')}</Button>
    </>;


  const renderPreparationStepsSection = () =>
    <>
      <Caption>{t('screens.editRecipe.preparationSteps')}</Caption>
      {recipeData.preparationSteps.map((preparationStep, preparationStepIndex) =>
        <React.Fragment key={preparationStepIndex}>
          <RecipeFormField
            onRemovePress={() => removePreparationStep(preparationStepIndex)}
            multiline={true}
            numberOfLines={5}
            value={recipeData.preparationSteps[preparationStepIndex]}
            onChangeText={(newText: string) => changePreparationStep(newText, preparationStepIndex)}
            placeholder={t('screens.editRecipe.preparationStepPlaceholder')} />
          <Spacer height={5} />
        </React.Fragment>,
      )}
      <Spacer height={10} />
      <Button
        icon="plus"
        onPress={addPreparationStep} >{t('common.more')}</Button>
    </>;

  const renderGroupSelectionSection = () => (
    <>
      <Caption>{t('screens.editRecipe.recipeGroups')}</Caption>
      <RecipeGroupFormField
        recipeGroup={recipeData.recipeGroups?.[0]}
        onRecipeGroupChange={setRecipeGroup} />
    </>
  );

  return (
    <Surface style={styles.contentContainer}>
      <ChunkView>
        <ScrollView
          keyboardShouldPersistTaps='handled'>
          <RecipeImageViewPager
            style={{height: 320}}
            onImageAdded={addRecipeImage}
            onImageRemoved={removeRecipeImage}
            onImagesReordered={reorderRecipeImages}
            images={recipeData.images}
            allowEdit={true}
          />
          <View style={[CentralStyles.contentContainer, CentralStyles.elementSpacing]}>

            <TextInput
              label={t('screens.editRecipe.title')}
              value={recipeData.title}
              mode="outlined"
              onChangeText={(newText) => setRecipeData({...recipeData, title: newText})}
              placeholder="Name" />
            <Divider style={{marginVertical: 10}} />
            {renderIngredientsSection()}
            <Divider style={{marginVertical: 10}} />
            <Spacer height={15} />
            <TextInput
              mode='outlined'
              label={t('screens.editRecipe.servings')}
              keyboardType='numeric'
              value={recipeData.servings === undefined ? '' : recipeData.servings?.toString()}
              // @ts-ignore
              onChangeText={(newText) => setRecipeData({...recipeData, servings: parseInt(newText) ? parseInt(newText) : undefined})} />
            <Divider style={{marginVertical: 10}} />
            {renderPreparationStepsSection()}
            <Divider style={{marginVertical: 10}} />
            {renderGroupSelectionSection()}
          </View>
          <Button
            mode="contained"
            contentStyle={{height: 50}}
            theme={{roundness: 0}}
            loading={savePending}
            disabled={savePending || recipeData.title.trim().length === 0}
            onPress={saveRecipe}>{props.route.params?.editing ? t('common.save'): t('common.create')}</Button>
        </ScrollView>
      </ChunkView>
    </Surface>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
});


export default RecipeWizardScreen;
