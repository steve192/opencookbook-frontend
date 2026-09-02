import React, {ReactNode, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {Linking, ScrollView, StyleSheet, View} from 'react-native';
import {Chip, Divider, Text} from 'react-native-paper';
import {Recipe} from '../dao/RestAPI';
import {dietLabel} from '../helper/recipeDiet';
import {formatDuration} from '../helper/recipeDuration';
import {useCheckedIngredients} from '../helper/useCheckedIngredients';
import CentralStyles, {useAppTheme} from '../styles/CentralStyles';
import {IngredientList} from './IngredientList';
import {RecipeImageViewPager} from './RecipeImageViewPager';
import {SectionTitle} from './SectionTitle';
import {TextBullet} from './TextBullet';

const IMAGE_HEIGHT = 300;

const getDomain = (url: string) => {
  return url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];
};

interface Props {
  recipe: Recipe;
  /** Servings the amounts are currently shown for. */
  scaledServings: number;
  onScaledServingsChange: (servings: number) => void;
  /**
   * Anything the surrounding screen offers to do with the recipe, shown below the steps.
   * What that is depends on whether this is your recipe or somebody else's.
   */
  footer?: ReactNode;
}

/**
 * A recipe as it is read: pictures, what it is at a glance, what goes in, and what to do.
 *
 * Shown both for a recipe of your own and for one somebody shared with you. Those two screens
 * differ in how the recipe is fetched, how its images are reached and what can be done with it -
 * not in what a recipe looks like, which is why none of that is decided here.
 *
 * @param {Props} props the recipe, how it is scaled, and what the screen offers to do with it
 * @return {JSX.Element} the recipe, ready to read
 */
export const RecipeDetailView = (props: Props) => {
  const {t} = useTranslation('translation');
  const theme = useAppTheme();
  const ingredientChecklist = useCheckedIngredients();

  // A different recipe starts with nothing ticked off. Keyed on the title rather than on the
  // recipe object, which changes identity on every refetch of the same recipe.
  useEffect(() => {
    ingredientChecklist.reset();
  }, [props.recipe.id, props.recipe.title]);

  // What a recipe is, at a glance: how long it takes, how much it makes, where it came from.
  const renderFacts = () => {
    const totalTime = formatDuration(props.recipe.totalTime);
    const prepTime = formatDuration(props.recipe.preparationTime);
    const diet = dietLabel(t, props.recipe.recipeType);

    return (
      <View style={styles.facts}>
        {totalTime &&
          <Chip icon="clock-outline" compact>{t('screens.recipe.totalTime', {duration: totalTime})}</Chip>
        }
        {prepTime &&
          <Chip icon="knife" compact>{t('screens.recipe.prepTime', {duration: prepTime})}</Chip>
        }
        {props.recipe.servings > 0 &&
          <Chip icon="silverware-fork-knife" compact>
            {t('screens.recipe.servingsCount', {count: props.recipe.servings})}
          </Chip>
        }
        {diet && <Chip icon="leaf" compact>{diet}</Chip>}
        {props.recipe.recipeSource &&
          <Chip
            icon="link-variant"
            compact
            onPress={() => Linking.openURL(props.recipe.recipeSource!)}>
            {getDomain(props.recipe.recipeSource)}
          </Chip>
        }
      </View>
    );
  };

  const renderIngredientsSection = () => (
    <View style={styles.section}>
      <SectionTitle testID='ingredient-section-caption'>{t('screens.recipe.ingredients')}</SectionTitle>
      {props.recipe.neededIngredients.length === 0 ?
        <Text style={{color: theme.colors.onSurfaceVariant}}>{t('screens.recipe.noIngredients')}</Text> :
        <IngredientList
          ingredients={props.recipe.neededIngredients}
          servings={props.recipe.servings}
          scaledServings={props.scaledServings}
          enableServingScaling={true}
          checkedIngredients={ingredientChecklist.checked}
          onIngredientToggle={ingredientChecklist.toggle}
          onServingScaleChange={props.onScaledServingsChange}
        />}
    </View>
  );

  const renderStepsSection = () => (
    <View style={styles.section}>
      <SectionTitle testID='recipe-prepsteps-title'>{t('screens.recipe.preparationSteps')}</SectionTitle>
      {props.recipe.preparationSteps.length === 0 ?
        <Text style={{color: theme.colors.onSurfaceVariant}}>{t('screens.recipe.noSteps')}</Text> :
        props.recipe.preparationSteps.map((preparationStep, index) => (
          <React.Fragment key={index}>
            {index > 0 && <Divider />}
            <View style={styles.step}>
              <TextBullet value={(index + 1).toString()} />
              <Text style={styles.stepText}>{preparationStep}</Text>
            </View>
          </React.Fragment>
        ))}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <RecipeImageViewPager
        style={{height: IMAGE_HEIGHT}}
        images={props.recipe.images}
      />
      <View style={[CentralStyles.contentContainer, styles.content]}>
        {renderFacts()}
        {renderIngredientsSection()}
        <Divider />
        {renderStepsSection()}
        {props.footer}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 12,
  },
  content: {
    gap: 18,
  },
  facts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  section: {
    gap: 8,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    paddingVertical: 10,
  },
  stepText: {
    flex: 1,
  },
});
