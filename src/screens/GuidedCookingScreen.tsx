import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Button, Divider, Layout, Text, ViewPager} from '@ui-kitten/components';
import {useKeepAwake} from 'expo-keep-awake';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import Spacer from 'react-spacer';
import {IngredientList} from '../components/IngredientList';
import {PreparationStepText} from '../components/PreparationStepText';
import {TextBullet} from '../components/TextBullet';
import {MainNavigationProps} from '../navigation/NavigationRoutes';
import CentralStyles from '../styles/CentralStyles';

type Props = NativeStackScreenProps<MainNavigationProps, 'GuidedCookingScreen'>;
export const GuidedCookingScreen = (props: Props) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [textSize, setTextSize] = useState<number>(15);

  const {t} = useTranslation('translation');

  const recipe = props.route.params.recipe;
  useKeepAwake();

  return (
    <Layout style={{flex: 1}} >
      <ScrollView>
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
          onSelect={setCurrentStep}>
          {recipe.preparationSteps.map((step, index) =>
            <View key={index} style={CentralStyles.contentContainer}>
              <PreparationStepText
                style={[styles.preparationStep, {fontSize: textSize}]}
                value={step}
                ingredients={recipe.neededIngredients} />
              <Spacer height={20} />
              <Divider />
              <Spacer height={20} />
              <Text category="label">{t('screens.guidedCooking.ingredients')}</Text>
              <IngredientList
                ingredients={recipe.neededIngredients
                    .filter((neededIngredient) => step.toLowerCase().includes(cleanupIngredientName(neededIngredient.ingredient.name)))}
                scaledServings={props.route.params.scaledServings}
                servings={recipe.servings}
              />
              <Divider/>
              <IngredientList
                greyedOutStyle={true}
                ingredients={recipe.neededIngredients
                    .filter((neededIngredient) => !step.toLowerCase().includes(cleanupIngredientName(neededIngredient.ingredient.name)))}
                scaledServings={props.route.params.scaledServings}
                servings={recipe.servings}
              />
            </View>,
          )}

        </ViewPager>

      </ScrollView>
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
    </Layout>
  );
};

const cleanupIngredientName = (name: string) => {
  let newName = name.toLowerCase();
  newName = newName.replace(/\(.*\)/, '');
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
