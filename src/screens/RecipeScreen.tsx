import {useIsFocused} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useKeepAwake} from 'expo-keep-awake';
import React, {useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Linking, ScrollView, View} from 'react-native';
import {Appbar, Button, Caption, Chip, Divider, Surface, Text} from 'react-native-paper';
import Spacer from 'react-spacer';
import {ChunkView} from '../ChunkView';
import {BringImportButton} from '../components/BringExportButton';
import {IngredientList} from '../components/IngredientList';
import {RecipeImageViewPager} from '../components/RecipeImageViewPager';
import {TextBullet} from '../components/TextBullet';
import {PromptUtil} from '../helper/Prompt';
import {MainNavigationProps} from '../navigation/NavigationRoutes';
import {fetchSingleRecipe, recipesSlice} from '../redux/features/recipesSlice';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import CentralStyles, {useAppTheme} from '../styles/CentralStyles';

const getDomain = (url: string) => {
  return url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];
};

type Props = NativeStackScreenProps<MainNavigationProps, 'RecipeScreen'>;
export const RecipeScreen = (props: Props) => {
  const dispatch = useAppDispatch();
  const focussed = useIsFocused();

  const displayedRecipe = useAppSelector((state) => state.recipes.recipes.filter((recipe) => recipe.id == props.route.params.recipeId)[0]);
  const [scaledServings, setScaledServings] = useState<number>(displayedRecipe?.servings ? displayedRecipe.servings : 1);
  const {t} = useTranslation('translation');

  const theme = useAppTheme();

  const isOnline = useAppSelector((state) => state.settings.isOnline);

  useKeepAwake();


  useEffect(() => {
    // Load recipe if recipe id of screen has changed or screen is navigated to
    dispatch(fetchSingleRecipe(props.route.params.recipeId))
        .then((result) => {
          if (result.meta.requestStatus === 'rejected') {
            // Recipe does not exist, try to go back
            props.navigation.goBack();
          }
        });
  }, [props.route.params.recipeId, focussed]);

  useEffect(() => {
    props.navigation.setOptions({
      title: displayedRecipe ? displayedRecipe.title : 'Loading',
      headerRight: () => (
        <Appbar.Action
          testID='recipe-edit-button'
          icon="pencil-outline"
          color={theme.colors.onPrimary}
          onPress={() => {
            if (!isOnline) {
              PromptUtil.show({title: t('common.offline.notavailabletitle'), button1: t('common.ok'), message: t('common.offline.notavailable')});
              return;
            }
            props.navigation.navigate('RecipeWizardScreen', {
              editing: true,
              recipeId: displayedRecipe.id,
            });
          }} />
      ),
    });
    displayedRecipe && setScaledServings(displayedRecipe.servings);
  }, [displayedRecipe]);

  const calculateNutrients = useMemo(() => {
    return {
      energy: displayedRecipe?.neededIngredients.reduce((sum, ingredientUse) => sum + (ingredientUse.ingredient.nutrientsEnergy || 0) * (ingredientUse.amount || 0) / (displayedRecipe.servings), 0),
      fat: displayedRecipe?.neededIngredients.reduce((sum, ingredientUse) => sum + (ingredientUse.ingredient.nutrientsFat || 0) * (ingredientUse.amount || 0) / (displayedRecipe.servings), 0) || 0,
      protein: displayedRecipe?.neededIngredients.reduce((sum, ingredientUse) => sum + (ingredientUse.ingredient.nutrientsProtein || 0) * (ingredientUse.amount || 0) / (displayedRecipe.servings), 0) || 0,
      carbohydrates: displayedRecipe?.neededIngredients.reduce((sum, ingredientUse) => sum + (ingredientUse.ingredient.nutrientsCarbohydrates || 0) * (ingredientUse.amount || 0) / (displayedRecipe.servings), 0) || 0,
    };
  }, [displayedRecipe]);

  const renderIngredientsSection = () =>
    <>
      <Caption testID='ingredient-section-caption'>{t('screens.recipe.ingredients')}</Caption>
      <IngredientList
        ingredients={displayedRecipe.neededIngredients}
        servings={displayedRecipe.servings}
        scaledServings={scaledServings}
        enableServingScaling={true}
        onServingScaleChange={setScaledServings}
      />

{/* TODO: Add density factor to ingredients and factors in amounts to calculate per gram */}
      {/* <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
        <Caption style={{alignSelf: 'center'}}>{t('screens.recipe.nutrients-label')}</Caption>
        <Spacer width={10} />
        <Chip icon="" compact={true} textStyle={{fontSize: 10}}>{ calculateNutrients.energy} kcal</Chip>
        <Spacer width={10} />
        <Chip icon="" compact={true} textStyle={{fontSize: 10}}>{ calculateNutrients.fat} {t('screens.recipe.carbohydrates')}</Chip>
        <Spacer width={10} />
        <Chip icon="" compact={true} textStyle={{fontSize: 10}}>{ calculateNutrients.fat} {t('screens.recipe.fat')}</Chip>
        <Spacer width={10} />
        <Chip icon="" compact={true} textStyle={{fontSize: 10}}>{ calculateNutrients.protein} {t('screens.recipe.protein')}</Chip>
      </View> */}
    </>
  ;


  const renderStepsSection = () => (
    <>
      <Caption testID='recipe-prepsteps-title'>{t('screens.recipe.preparationSteps')}</Caption>
      <Spacer height={20} />
      {displayedRecipe && displayedRecipe.preparationSteps.map((preparationStep, index) => (
        <React.Fragment key={index}>
          <Divider />
          <View style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 10}}>
            <TextBullet
              value={(index + 1).toString()} />
            <Text style={{flex: 1}}>{preparationStep}</Text>
          </View>
        </React.Fragment>
      ))}
    </>
  );


  return (

    <ChunkView>
      <Surface style={CentralStyles.fullscreen}>
        <ScrollView>
          <RecipeImageViewPager
            style={{height: 320}}
            images={displayedRecipe ? displayedRecipe?.images : []}
          />
          {displayedRecipe?.recipeSource &&
               <>
                 <Spacer height={20}/>
                 <View style={{alignItems: 'center'}}>
                   <Chip
                     onPress={() => {
                       Linking.openURL(displayedRecipe.recipeSource!);
                     }}
                   >
                     <Text>{t('screens.recipe.importedFrom')} <Text style={{color: theme.colors.primary}}>{getDomain(displayedRecipe.recipeSource)}</Text></Text>
                   </Chip>
                 </View>
                 <Spacer height={20}/>
               </>}
          <View style={[CentralStyles.contentContainer, {flex: 1}]} >
            {displayedRecipe && renderIngredientsSection()}

            <Spacer height={20} />
            <Button
              testID='guided-cooking-button'
              mode="contained"
              dark={true}
              onPress={() => displayedRecipe && props.navigation.navigate('GuidedCookingScreen', {recipe: displayedRecipe, scaledServings: scaledServings})}>
              {t('screens.recipe.startCookingButton')}
            </Button>
            <Spacer height={30}/>
            {displayedRecipe?.id && <View style={{alignItems: 'center'}}>
              <BringImportButton style={{maxWidth: '90%'}}recipeId={displayedRecipe.id} />
            </View>}
            <Spacer height={20} />

            {displayedRecipe && renderStepsSection()}

          </View>
        </ScrollView>
      </Surface>
    </ChunkView>
  );
};

