import {useIsFocused} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Button, Divider, Layout, Text} from '@ui-kitten/components';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import Spacer from 'react-spacer';
import {EditIcon} from '../assets/Icons';
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


  useEffect(() => {
    // Load recipe if recipe id of screen has changed or screen is navigated to
    dispatch(fetchSingleRecipe(props.route.params.recipeId))
        .then((result) => {
          if (result.meta.requestStatus === 'rejected') {
            // Recipe does not exist, try to go back
            props.navigation.goBack();
          }
        });


    props.navigation.setOptions({title: displayedRecipe ? displayedRecipe.title : 'Loading'});

    props.navigation.setOptions({
      headerRight: () => (
        <Button
          onPress={() => props.navigation.navigate('RecipeWizardScreen', {
            editing: true,
            recipeId: displayedRecipe.id,
          })} accessoryLeft={<EditIcon />} />
      ),
    });
  }, [props.route.params.recipeId, focussed]);

  const renderIngredientsSection = () =>
    <IngredientList
      ingredients={displayedRecipe.neededIngredients}
      servings={displayedRecipe.servings}
      scaledServings={scaledServings}
      enableServingScaling={true}

      onServingScaleChange={setScaledServings}
    />
  ;


  const renderStepsSection = () => (
    <>
      <Text category="label">{t('screens.recipe.preparationSteps')}</Text>
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
      <Layout style={CentralStyles.fullscreen}>
        <ScrollView>
          <RecipeImageViewPager
            style={{height: 320}}
            images={displayedRecipe ? displayedRecipe?.images : []}
          />
          <View style={[CentralStyles.contentContainer, {flex: 1}]} >
            {displayedRecipe && renderIngredientsSection()}

            <Spacer height={20} />
            <Button onPress={() => displayedRecipe && props.navigation.navigate('GuidedCookingScreen', {recipe: displayedRecipe, scaledServings: scaledServings})}>{t('screens.recipe.startCookingButton')}</Button>
            <Spacer height={20} />

            {displayedRecipe && renderStepsSection()}

          </View>
        </ScrollView>
      </Layout>
      <Text/>
    </ChunkView>
  );
};

