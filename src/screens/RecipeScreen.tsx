import {useIsFocused} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useKeepAwake} from 'expo-keep-awake';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView, View} from 'react-native';
import {Appbar, Button, Caption, Divider, Surface, Text, TextInput} from 'react-native-paper';
import Spacer from 'react-spacer';
import {ChunkView} from '../ChunkView';
import {BringImportButton} from '../components/BringExportButton';
import {IngredientList} from '../components/IngredientList';
import {RecipeImageViewPager} from '../components/RecipeImageViewPager';
import {TextBullet} from '../components/TextBullet';
import {PromptUtil} from '../helper/Prompt';
import {MainNavigationProps} from '../navigation/NavigationRoutes';
import {fetchSingleRecipe} from '../redux/features/recipesSlice';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import CentralStyles, {useAppTheme} from '../styles/CentralStyles';


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
            {displayedRecipe.recipeSource &&
              <TextInput />}
            {displayedRecipe && renderStepsSection()}

          </View>
        </ScrollView>
      </Surface>
    </ChunkView>
  );
};

