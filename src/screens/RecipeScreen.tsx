import {useIsFocused} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {Appbar, Button, Caption, Divider, useTheme, Text, Surface} from 'react-native-paper';
import Spacer from 'react-spacer';
import {ChunkView} from '../ChunkView';
import {IngredientList} from '../components/IngredientList';
import {RecipeImageViewPager} from '../components/RecipeImageViewPager';
import {TextBullet} from '../components/TextBullet';
import {MainNavigationProps} from '../navigation/NavigationRoutes';
import {fetchSingleRecipe} from '../redux/features/recipesSlice';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import CentralStyles from '../styles/CentralStyles';


type Props = NativeStackScreenProps<MainNavigationProps, 'RecipeScreen'>;
export const RecipeScreen = (props: Props) => {
  const dispatch = useAppDispatch();
  const focussed = useIsFocused();

  const displayedRecipe = useAppSelector((state) => state.recipes.recipes.filter((recipe) => recipe.id == props.route.params.recipeId)[0]);
  const [scaledServings, setScaledServings] = useState<number>(displayedRecipe?.servings ? displayedRecipe.servings : 0);
  const {t} = useTranslation('translation');

  const theme = useTheme();


  useEffect(() => {
    // Load recipe if recipe id of screen has changed or screen is navigated to
    dispatch(fetchSingleRecipe(props.route.params.recipeId))
        .then((result) => {
          if (result.meta.requestStatus === 'rejected') {
            // Recipe does not exist, try to go back
            props.navigation.goBack();
          }
        });


    props.navigation.setOptions({
      title: displayedRecipe ? displayedRecipe.title : 'Loading',
      headerRight: () => (
        <Appbar.Action
          icon="pencil-outline"
          color={theme.colors.textOnPrimary}
          onPress={() => props.navigation.navigate('RecipeWizardScreen', {
            editing: true,
            recipeId: displayedRecipe.id,
          })} />
      ),
    });
  }, [props.route.params.recipeId, focussed]);

  const renderIngredientsSection = () =>
    <>
      <Caption>{t('screens.recipe.ingredients')}</Caption>
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
      <Caption>{t('screens.recipe.preparationSteps')}</Caption>
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
              mode="contained"
              dark={true}
              onPress={() => displayedRecipe && props.navigation.navigate('GuidedCookingScreen', {recipe: displayedRecipe, scaledServings: scaledServings})}>
              {t('screens.recipe.startCookingButton')}
            </Button>
            <Spacer height={20} />

            {displayedRecipe && renderStepsSection()}

          </View>
        </ScrollView>
      </Surface>
      <Text/>
    </ChunkView>
  );
};

