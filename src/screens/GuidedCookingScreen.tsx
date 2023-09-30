import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useKeepAwake} from 'expo-keep-awake';
import fuzzy from 'fuzzy';
import React, {ReactNode, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Platform, StyleSheet, View} from 'react-native';
import {ScrollView} from 'react-native';
import {Button, Caption, Divider, Surface} from 'react-native-paper';
import Spacer from 'react-spacer';
import {IngredientList} from '../components/IngredientList';
import {PreparationStepText} from '../components/PreparationStepText';
import {TextBullet} from '../components/TextBullet';
import {ViewPager} from '../components/ViewPager';
import {MainNavigationProps} from '../navigation/NavigationRoutes';
import CentralStyles from '../styles/CentralStyles';

type Props = NativeStackScreenProps<MainNavigationProps, 'GuidedCookingScreen'>;

const wrapInScrollviewWhenWeb = (element: ReactNode) => {
  // Needed as scrollviews + viewpager behafe painfully different on web
  return Platform.OS === 'web' ? <ScrollView>{element}</ScrollView> : element;
};
export const GuidedCookingScreen = (props: Props) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [textSize, setTextSize] = useState<number>(15);

  const {t} = useTranslation('translation');

  const recipe = props.route.params.recipe;
  useKeepAwake();

  return (
    <Surface style={{flex: 1}} >
      {wrapInScrollviewWhenWeb(
          <>
            <View style={CentralStyles.contentContainer}>
              <View style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
                {recipe.preparationSteps.map((step, index) =>
                  <>
                    <TextBullet
                      selected={index <= currentStep}
                      onPress={() => setCurrentStep(index)}
                      value={(index + 1).toString()} />
                    {/* {index < currentStep && <View style={styles.stepConnector}></View>} */}
                  </>,
                )}
              </View>
            </View>
            <Spacer height={20} />
            <Divider />
            <Spacer height={20} />
            <ViewPager
              selectedIndex={currentStep}
              onIndexChange={setCurrentStep}>
              {recipe.preparationSteps.map((step, index) =>
                <ScrollView
                  key={index}>
                  <Surface
                    style={[CentralStyles.contentContainer, {elevation: 0, marginLeft: 'auto', marginRight: 'auto'}]}
                  >
                    <PreparationStepText
                      style={[styles.preparationStep, {fontSize: textSize}]}
                      value={step}
                      ingredients={recipe.neededIngredients} />
                    <Spacer height={20} />
                    <Divider />
                    <Spacer height={20} />
                    <Caption>{t('screens.guidedCooking.ingredients')}</Caption>
                    <IngredientList
                      ingredients={recipe.neededIngredients
                          .filter((neededIngredient) => isIngredientContainedInText(neededIngredient.ingredient.name, step))}
                      scaledServings={props.route.params.scaledServings}
                      servings={recipe.servings}
                    />
                    <Divider/>
                    <IngredientList
                      greyedOutStyle={true}
                      ingredients={recipe.neededIngredients
                          .filter((neededIngredient) => !isIngredientContainedInText(neededIngredient.ingredient.name, step))}
                      scaledServings={props.route.params.scaledServings}
                      servings={recipe.servings}
                    />
                  </Surface>
                </ScrollView>,
              )}

            </ViewPager>
          </>)}
      <View>
        <Spacer height={20} />
        <Divider />
        <View style={CentralStyles.contentContainer}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Button
              disabled={currentStep === 0}
              onPress={() => setCurrentStep(currentStep - 1)}>
              {t('common.previous')}
            </Button>
            <Button
              disabled={currentStep === recipe.preparationSteps.length - 1}
              onPress={() => setCurrentStep(currentStep + 1)}>
              {t('common.next')}
            </Button>
          </View>
        </View>
      </View>
    </Surface>
  );
};

const isIngredientContainedInText = (ingredient:string, text:string) => {
  let cleanText = text.replace(',', ' ');
  cleanText = cleanText.replace('(', ' ');
  cleanText = cleanText.replace(')', ' ');

  // Is any ingredient a word of the text?
  const results = fuzzy.filter(ingredient, cleanText.split(' '), {
    extract: (text) => text,
  });
  if (results.length > 0 && results[0].score > 50) {
    console.log(ingredient, 'matches to', results[0].original, 'score', results[0].score);
    return true;
  }

  // TODO: Vice versa check, is a word contained in the ingredients?
  return false;
};

const cleanupIngredientName = (name: string) => {
  let newName = name.toLowerCase();
  newName = newName.replace(/\([^)]*\)/, '');
  newName = newName.replace(/,.*/, '');
  return newName;
};

const styles = StyleSheet.create({
  stepConnector: {
    backgroundColor: 'green',
    height: 2,
    flexGrow: 0.2,
    alignSelf: 'center',
    marginHorizontal: 10,

  },
  preparationStep: {
  },
});
