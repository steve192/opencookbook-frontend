import {useIsFocused} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useKeepAwake} from 'expo-keep-awake';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Linking, ScrollView, StyleSheet, View} from 'react-native';
import {Appbar, Button, Chip, Divider, Surface, Text} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {BringImportButton} from '../components/BringExportButton';
import {IngredientList} from '../components/IngredientList';
import {RecipeImageViewPager} from '../components/RecipeImageViewPager';
import {SectionTitle} from '../components/SectionTitle';
import {TextBullet} from '../components/TextBullet';
import {dietLabel} from '../helper/recipeDiet';
import {formatDuration} from '../helper/recipeDuration';
import {useCheckedIngredients} from '../helper/useCheckedIngredients';
import {useOnlineGuard} from '../helper/useOnlineGuard';
import {MainNavigationProps} from '../navigation/NavigationRoutes';
import {fetchSingleRecipe} from '../redux/features/recipesSlice';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import CentralStyles, {useAppTheme} from '../styles/CentralStyles';

const getDomain = (url: string) => {
  return url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];
};

type Props = NativeStackScreenProps<MainNavigationProps, 'RecipeScreen'>;
export const RecipeScreen = (props: Props) => {
  const dispatch = useAppDispatch();
  const focussed = useIsFocused();
  const insets = useSafeAreaInsets();
  const requireOnline = useOnlineGuard();

  const displayedRecipe = useAppSelector((state) => state.recipes.recipes.filter((recipe) => recipe.id == props.route.params.recipeId)[0]);
  const [scaledServings, setScaledServings] = useState<number>(displayedRecipe?.servings ? displayedRecipe.servings : 1);
  const ingredientChecklist = useCheckedIngredients();
  const {t} = useTranslation('translation');

  const theme = useAppTheme();

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

  // Only when a different recipe is shown. Keyed on the recipe object, this also ran on
  // every refetch, so scaling to eight servings was undone by leaving the app and coming back.
  useEffect(() => {
    displayedRecipe && setScaledServings(displayedRecipe.servings);
    ingredientChecklist.reset();
  }, [props.route.params.recipeId]);

  useEffect(() => {
    props.navigation.setOptions({
      title: displayedRecipe ? displayedRecipe.title : t('screens.recipe.loading'),
      headerRight: () => (
        <Appbar.Action
          testID='recipe-edit-button'
          icon="pencil-outline"
          color={theme.colors.onPrimary}
          accessibilityLabel={t('screens.recipe.editRecipe')}
          onPress={() => {
            if (!requireOnline()) {
              return;
            }
            props.navigation.navigate('RecipeWizardScreen', {
              editing: true,
              recipeId: displayedRecipe.id,
            });
          }} />
      ),
    });
  }, [displayedRecipe, theme, t]);

  // What a recipe is, at a glance: how long it takes, how much it makes, where it came
  // from. Times were not shown at all before, and servings only appeared as a stepper
  // buried inside the ingredient list.
  const renderFacts = () => {
    const totalTime = formatDuration(displayedRecipe.totalTime);
    const prepTime = formatDuration(displayedRecipe.preparationTime);
    const diet = dietLabel(t, displayedRecipe.recipeType);

    return (
      <View style={styles.facts}>
        {totalTime &&
          <Chip icon="clock-outline" compact>{t('screens.recipe.totalTime', {duration: totalTime})}</Chip>
        }
        {prepTime &&
          <Chip icon="knife" compact>{t('screens.recipe.prepTime', {duration: prepTime})}</Chip>
        }
        {displayedRecipe.servings > 0 &&
          <Chip icon="silverware-fork-knife" compact>
            {t('screens.recipe.servingsCount', {count: displayedRecipe.servings})}
          </Chip>
        }
        {diet && <Chip icon="leaf" compact>{diet}</Chip>}
        {displayedRecipe.recipeSource &&
          <Chip
            icon="link-variant"
            compact
            onPress={() => Linking.openURL(displayedRecipe.recipeSource!)}>
            {getDomain(displayedRecipe.recipeSource)}
          </Chip>
        }
      </View>
    );
  };

  const renderIngredientsSection = () => (
    <View style={styles.section}>
      <SectionTitle testID='ingredient-section-caption'>{t('screens.recipe.ingredients')}</SectionTitle>
      {displayedRecipe.neededIngredients.length === 0 ?
        <Text style={{color: theme.colors.onSurfaceVariant}}>{t('screens.recipe.noIngredients')}</Text> :
        <IngredientList
          ingredients={displayedRecipe.neededIngredients}
          servings={displayedRecipe.servings}
          scaledServings={scaledServings}
          enableServingScaling={true}
          checkedIngredients={ingredientChecklist.checked}
          onIngredientToggle={ingredientChecklist.toggle}
          onServingScaleChange={setScaledServings}
        />}
    </View>
  );

  const renderStepsSection = () => (
    <View style={styles.section}>
      <SectionTitle testID='recipe-prepsteps-title'>{t('screens.recipe.preparationSteps')}</SectionTitle>
      {displayedRecipe.preparationSteps.length === 0 ?
        <Text style={{color: theme.colors.onSurfaceVariant}}>{t('screens.recipe.noSteps')}</Text> :
        displayedRecipe.preparationSteps.map((preparationStep, index) => (
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
    <Surface style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <RecipeImageViewPager
          style={{height: 300}}
          images={displayedRecipe ? displayedRecipe?.images : []}
        />
        {displayedRecipe &&
          <View style={[CentralStyles.contentContainer, styles.content]}>
            {renderFacts()}
            {renderIngredientsSection()}
            <Divider />
            {renderStepsSection()}
            {displayedRecipe.id &&
              <View style={styles.exportRow}>
                <BringImportButton style={styles.exportButton} recipeId={displayedRecipe.id} />
              </View>
            }
          </View>
        }
      </ScrollView>

      {/* Within reach instead of halfway down the page, between ingredients and steps */}
      {displayedRecipe &&
        <Surface elevation={3} style={[styles.actionBar, {paddingBottom: insets.bottom + 12}]}>
          <Button
            testID='guided-cooking-button'
            mode="contained"
            icon="chef-hat"
            disabled={displayedRecipe.preparationSteps.length === 0}
            onPress={() => props.navigation.navigate('GuidedCookingScreen', {recipe: displayedRecipe, scaledServings: scaledServings})}>
            {t('screens.recipe.startCookingButton')}
          </Button>
        </Surface>
      }
    </Surface>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
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
  actionBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  exportRow: {
    alignItems: 'center',
    paddingTop: 4,
  },
  exportButton: {
    maxWidth: '100%',
  },
});
