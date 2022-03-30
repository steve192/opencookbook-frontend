import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {CompositeScreenProps} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {Divider, IconButton, Subheading, Text, useTheme} from 'react-native-paper';
import {useDispatch} from 'react-redux';
import XDate from 'xdate';
import {ChunkView} from '../../ChunkView';
import {CustomCard} from '../../components/CustomCard';
import {SideScroller} from '../../components/SideScroller';
import {Recipe, WeekplanDay} from '../../dao/RestAPI';
import {MainNavigationProps, OverviewNavigationProps} from '../../navigation/NavigationRoutes';
import {fetchWeekplanDays, updateSingleWeekplanDay} from '../../redux/features/weeklyRecipesSlice';
import {useAppSelector} from '../../redux/hooks';
import CentralStyles from '../../styles/CentralStyles';
import {RecipeSelectionPopup} from './RecipeSelectionPopup';
import {WeeklyRecipeCard} from './WeeklyRecipeCard';


type Props =
    CompositeScreenProps<
        StackScreenProps<MainNavigationProps, 'OverviewScreen'>,
        BottomTabScreenProps<OverviewNavigationProps, 'WeeklyScreen'>
    >;

const dateFormat = 'yyyy-MM-dd';
export const WeeklyRecipeListScreen = (props: Props) => {
  const now = new XDate();
  const {t} = useTranslation('translation');
  const dispatch = useDispatch();

  const theme = useTheme();

  const [recipeSelectionVisible, setRecipeSelectionVisible] = useState<boolean>(false);

  const [selectedWeekplanDay, setSelectedWeekplanDay] = useState<WeekplanDay>();
  const weekplanDays = useAppSelector((state) => state.weeklyRecipes.weekplanDays);

  const loadData = () => {
    dispatch(fetchWeekplanDays({
      from: getDateOfISOWeek(getCurrentWeekNumber(now), now.getFullYear()),
      to: getDateOfISOWeek(getCurrentWeekNumber(now) + 3, now.getFullYear()),
    }));
  };
  useEffect(loadData, []);

  useEffect(() => {
    return props.navigation.addListener('focus', () => {
      props.navigation.getParent()?.setOptions({
        title: t('screens.weekplan.screenTitle'),
        headerRight: undefined,
      });
    });
  }, [props.navigation]);

  const addRecipeToWeekplanDay = (recipe: Recipe, weekplanDay: WeekplanDay) => {
    const newWeekplanDay = {...weekplanDay, recipes: [...weekplanDay.recipes]};
    // @ts-ignore id is always set
    newWeekplanDay.recipes.push({id: recipe.id, title: recipe.title, type: 'NORMAL_RECIPE'});
    dispatch(updateSingleWeekplanDay(newWeekplanDay));
    setRecipeSelectionVisible(false);
  };
  const removeRecipeFromWeekplanDay = (recipeId: number | string, weekplanDay: WeekplanDay) => {
    const newWeekplanDay = {...weekplanDay, recipes: [...weekplanDay.recipes]};
    newWeekplanDay.recipes = newWeekplanDay.recipes.filter((existingRecipe) => existingRecipe.id !== recipeId);
    dispatch(updateSingleWeekplanDay(newWeekplanDay));
    setRecipeSelectionVisible(false);
  };

  const openRecipe = (recipeId: number) => {
    props.navigation.navigate('RecipeScreen', {recipeId});
  };

  const renderWeek = (weekNumber: number, year: number) => {
    const startWeekDate = getDateOfISOWeek(weekNumber, year);
    return [
      t('weekdays.monday'),
      t('weekdays.tuesday'),
      t('weekdays.wednesday'),
      t('weekdays.thursday'),
      t('weekdays.friday'),
      t('weekdays.saturday'),
      t('weekdays.sunday')]
        .map((weekday, weekdayIndex) => {
          const weekdayDate = new XDate(startWeekDate);
          weekdayDate.setDate(weekdayDate.getDate() + weekdayIndex);
          const existingWeekplanDay = weekplanDays.filter((weekplanDay) => weekplanDay.day === weekdayDate.toString(dateFormat))[0];
          return (
            <CustomCard key={weekdayIndex} style={{marginVertical: 5}}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={styles.weekTitle}>{weekday} {weekdayDate.toLocaleDateString()}</Text>
                <IconButton
                  icon="plus-circle-outline"
                  onPress={() => {
                    setRecipeSelectionVisible(true);
                    setSelectedWeekplanDay(existingWeekplanDay ? existingWeekplanDay : {day: weekdayDate.toString(dateFormat), recipes: []});
                  }
                  } />
              </View>
              <SideScroller>
                {weekplanDays.filter((weekplanDay) => weekplanDay.day === weekdayDate.toString(dateFormat)).map((weekplanDay) => (
                  weekplanDay.recipes.map((recipe, index) => {
                    if (recipe.type === 'NORMAL_RECIPE') {
                      return <WeeklyRecipeCard
                        key={weekplanDay.day + index}
                        // @ts-ignore
                        onPress={() => openRecipe(recipe.id)}
                        onRemovePress={() => removeRecipeFromWeekplanDay(recipe.id, weekplanDay)}
                        title={recipe.title}
                        imageUuid={recipe.titleImageUuid} />;
                    }
                  })
                ))}
              </SideScroller>
            </CustomCard>
          );
        });
  };

  return (
    <>
      <ChunkView>
        <View style={CentralStyles.fullscreen}>
          <ScrollView contentContainerStyle={CentralStyles.contentContainer}>
            <Subheading>{t('screens.weekplan.currentWeek')}</Subheading>
            {renderWeek(getCurrentWeekNumber(now), now.getFullYear())}
            <Divider style={{marginVertical: 25}}/>
            <Subheading>{t('screens.weekplan.nextWeek')}</Subheading>
            {renderWeek(getCurrentWeekNumber(now) + 1, now.getFullYear())}
            <Divider style={{marginVertical: 25}}/>
            <Subheading>{t('screens.weekplan.week')} {getCurrentWeekNumber(now) + 2}</Subheading>
            {renderWeek(getCurrentWeekNumber(now) + 2, now.getFullYear())}
            <Divider style={{marginVertical: 25}}/>
            <Subheading>{t('screens.weekplan.week')} {getCurrentWeekNumber(now) + 3}</Subheading>
            {renderWeek(getCurrentWeekNumber(now) + 3, now.getFullYear())}
          </ScrollView>
        </View>
      </ChunkView>

      <RecipeSelectionPopup
        visible={recipeSelectionVisible}
        onClose={() => setRecipeSelectionVisible(false)}
        // @ts-ignore cannot be undefined
        onRecipeSelected={(recipe) => addRecipeToWeekplanDay(recipe, selectedWeekplanDay)}
      />
    </>
  );
};

const getCurrentWeekNumber = (now: XDate) => {
  const tdt = new Date(now.valueOf());
  const dayn = (now.getDay() + 6) % 7;
  tdt.setDate(tdt.getDate() - dayn + 3);
  const firstThursday = tdt.valueOf();
  tdt.setMonth(0, 1);
  if (tdt.getDay() !== 4) {
    tdt.setMonth(0, 1 + ((4 - tdt.getDay()) + 7) % 7);
  }
  return 1 + Math.ceil((firstThursday - tdt.valueOf()) / 604800000);
};

const getDateOfISOWeek = (week: number, year: number) => {
  const simple = new XDate(year, 0, 1 + (week - 1) * 7);
  const dow = simple.getDay();
  const ISOweekStart = simple;
  if (dow <= 4) {
    ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  } else {
    ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  }
  return ISOweekStart;
};


const styles = StyleSheet.create({
  weekTitle: {
    fontWeight: 'bold',
  },
});
