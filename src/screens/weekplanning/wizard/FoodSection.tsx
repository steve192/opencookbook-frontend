import React from 'react';
import {useTranslation} from 'react-i18next';
import {ChoiceChips} from '../../../components/ChoiceChips';
import {CountStepper} from '../../../components/CountStepper';
import {IngredientChips} from '../../../components/IngredientChips';
import {QuestionSection} from '../../../components/QuestionSection';
import {withToggled} from '../../../helper/choices';
import {OwnIngredient} from '../../../helper/ownIngredients';
import {
  cookedMealsPerWeek,
  meatLimit,
  withAvoidedToggled,
  withMeatLimitStep,
} from '../../../helper/planningProfile';
import {RECIPE_DIETS, dietLabel} from '../../../helper/recipeDiet';
import {ProfileSectionProps} from './ProfileSectionProps';

interface Props extends ProfileSectionProps {
  ingredients: OwnIngredient[];
}

// What may be planned at all: the diet, how much meat, and what never.
export const FoodSection = ({profile, onChange, ingredients}: Props) => {
  const {t} = useTranslation('translation');
  const limit = meatLimit(profile);
  const mayEatMeat = profile.diet !== 'VEGAN' && profile.diet !== 'VEGETARIAN';
  return (
    <>
      <ChoiceChips
        title={t('screens.planning.diet')}
        values={RECIPE_DIETS}
        isChosen={(diet) => profile.diet === diet}
        label={(diet) => dietLabel(t, diet) ?? diet}
        onToggle={(diet) => onChange(withToggled(profile, 'diet', diet))} />
      {mayEatMeat && cookedMealsPerWeek(profile) > 0 &&
        <CountStepper
          label={t('screens.planning.meatMealsPerWeek')}
          value={limit?.toString() ?? t('screens.planning.noLimit')}
          decreaseLabel={t('screens.planning.fewer')}
          increaseLabel={t('screens.planning.more')}
          canDecrease={limit !== 0}
          canIncrease={limit !== null}
          onDecrease={() => onChange(withMeatLimitStep(profile, -1))}
          onIncrease={() => onChange(withMeatLimitStep(profile, 1))} />
      }
      <QuestionSection title={t('screens.planning.avoid')}>
        <IngredientChips
          ingredients={ingredients}
          chosenIds={profile.avoidedIngredientIds ?? []}
          addLabel={t('screens.planning.addIngredient')}
          onToggle={(id) => onChange(withAvoidedToggled(profile, id))} />
      </QuestionSection>
    </>
  );
};
