import {useLinkTo} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {ActivityIndicator, Button, Icon, Searchbar, Text} from 'react-native-paper';
import {useGetSeasonsQuery} from '../../../api/endpoints/catalogue';
import {useSuggestRecipesMutation} from '../../../api/endpoints/recipes';
import {SeasonalFood} from '../../../api/types/catalogue';
import {ChoiceChips} from '../../../components/ChoiceChips';
import {InfoButton} from '../../../components/InfoButton';
import {Notice} from '../../../components/Notice';
import {QuestionSection} from '../../../components/QuestionSection';
import {RecipeRowCard} from '../../../components/RecipeRowCard';
import {SectionTitle} from '../../../components/SectionTitle';
import {SignupHintCard} from '../../../components/tools/SignupHintCard';
import {ToolFrame} from '../../../components/tools/ToolFrame';
import {selectLoggedIn} from '../../../redux/features/authSlice';
import {useAppSelector} from '../../../redux/hooks';
import {useAppTheme} from '../../../styles/CentralStyles';
import {parseSeasonalInputs, SEASON_CATEGORIES, SeasonalInputs, seasonOverview} from '../../../tools/seasonal/seasonal';
import {useToolInputs} from '../useToolInputs';
import {FoodDetails} from './FoodDetails';
import {SeasonRow, SeasonTableHeader, useMonthName} from './SeasonTable';

// The month's recipes from the signed-in cook's cookbooks, as the rest of the app shows recipes.
const SeasonalRecipes = ({month}: {month: number}) => {
  const {t} = useTranslation('translation');
  const theme = useAppTheme();
  const linkTo = useLinkTo();
  const monthName = useMonthName();
  const [suggest, suggestions] = useSuggestRecipesMutation();
  useEffect(() => {
    void suggest({inSeasonMonth: month, includeHouseholdRecipes: true, limit: 10});
  }, [month]);
  const results = suggestions.data?.results ?? [];
  return (
    <QuestionSection title={t('tools.seasonalCalendar.myRecipes', {month: monthName(month, 'long')})}>
      {suggestions.isLoading && <ActivityIndicator />}
      {suggestions.isSuccess && results.length === 0 &&
        <Text variant="bodySmall">{t('tools.seasonalCalendar.noRecipes')}</Text>}
      <View style={styles.recipes}>
        {results.map((result) => (
          <RecipeRowCard key={result.recipe.id} recipe={result.recipe}
            onOpen={() => linkTo(`/recipe?recipeId=${result.recipe.id}`)}>
            <Text numberOfLines={2} variant="bodySmall" style={{color: theme.colors.primary}}>
              {result.matchedIngredients.map((ingredient) => ingredient.name).join(', ')}
            </Text>
          </RecipeRowCard>
        ))}
      </View>
    </QuestionSection>
  );
};

interface GroupProps {
  title: string;
  foods: SeasonalFood[];
  month: number;
  onOpen: (food: SeasonalFood) => void;
}

const FoodGroup = ({title, foods, month, onOpen}: GroupProps) => foods.length === 0 ? null : (
  <View>
    <SectionTitle>{title}</SectionTitle>
    {foods.map((food) => <SeasonRow key={food.id} food={food} month={month} onOpen={() => onOpen(food)} />)}
  </View>
);

export const SeasonalTool = () => {
  const {t, i18n} = useTranslation('translation');
  const loggedIn = useAppSelector(selectLoggedIn);
  const [inputs, change] = useToolInputs('seasonalCalendar', parseSeasonalInputs);
  const [search, setSearch] = useState('');
  const [showUnavailable, setShowUnavailable] = useState(false);
  const [opened, setOpened] = useState<SeasonalFood>();
  const seasons = useGetSeasonsQuery({lang: i18n.language});
  const overview = seasonOverview(seasons.data ?? [], inputs.month, inputs.category, search);
  const monthName = useMonthName();
  const month = monthName(inputs.month, 'long');
  const searching = search.trim() !== '';
  const groupProps = {month: inputs.month, onOpen: setOpened};
  const found = Object.values(overview).some((foods) => foods.length > 0);

  // The table's header is the third child, so it stays on top while the foods scroll.
  return (
    <ToolFrame stickyIndex={2} result={loggedIn ? <SeasonalRecipes month={inputs.month} /> : <SignupHintCard />}>
      <View style={styles.region}>
        <Icon source="map-marker-outline" size={20} />
        <Text variant="titleSmall">{t('tools.seasonalCalendar.regionTitle')}</Text>
        <InfoButton title={t('tools.seasonalCalendar.regionTitle')} text={t('tools.seasonalCalendar.region')} />
      </View>
      <View style={styles.filters}>
        <Searchbar placeholder={t('tools.seasonalCalendar.search')} value={search} onChangeText={setSearch} />
        <ChoiceChips values={['ALL', ...SEASON_CATEGORIES] as SeasonalInputs['category'][]}
          label={(category) => t(`tools.seasonalCalendar.categories.${category}`)}
          isChosen={(category) => category === inputs.category} onToggle={(category) => change({category})} />
      </View>
      <SeasonTableHeader month={inputs.month} onMonth={(chosen) => change({month: chosen})} />

      {seasons.isLoading && <ActivityIndicator />}
      {seasons.isError && <Notice icon="cloud-off-outline" tone="warning">{t('tools.seasonalCalendar.loadFailed')}</Notice>}
      {seasons.isSuccess && <View style={styles.groups}>
        {searching && !found &&
          <Text variant="bodyMedium">{t('tools.seasonalCalendar.noMatch', {search: search.trim()})}</Text>}
        {!searching && overview.inSeason.length === 0 &&
          <Text variant="bodyMedium">{t('tools.seasonalCalendar.nothing')}</Text>}
        <FoodGroup title={t('tools.seasonalCalendar.inSeason', {month})} foods={overview.inSeason} {...groupProps} />
        <FoodGroup title={t('tools.seasonalCalendar.startingSoon')} foods={overview.startingSoon} {...groupProps} />
        <FoodGroup title={t('tools.seasonalCalendar.available')} foods={overview.available} {...groupProps} />
        {searching || showUnavailable ?
          <FoodGroup title={t('tools.seasonalCalendar.unavailable', {month})} foods={overview.unavailable}
            {...groupProps} /> :
          overview.unavailable.length > 0 &&
            <Button mode="text" icon="chevron-down" style={styles.more} onPress={() => setShowUnavailable(true)}>
              {t('tools.seasonalCalendar.showUnavailable', {count: overview.unavailable.length, month})}
            </Button>}
      </View>}
      <FoodDetails food={opened} month={inputs.month} onDismiss={() => setOpened(undefined)} />
    </ToolFrame>
  );
};

const styles = StyleSheet.create({
  region: {flexDirection: 'row', alignItems: 'center', gap: 6},
  filters: {gap: 12},
  groups: {gap: 20},
  more: {alignSelf: 'flex-start'},
  recipes: {gap: 8},
});
