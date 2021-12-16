import { Button, Layout, Text } from '@ui-kitten/components';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useDispatch } from 'react-redux';
import XDate from 'xdate';
import { PlusIcon } from '../../assets/Icons';
import { CustomCard } from '../../components/CustomCard';
import { Recipe, WeekplanDay } from '../../dao/RestAPI';
import { fetchWeekplanDays, updateSingleWeekplanDay } from '../../redux/features/weeklyRecipesSlice';
import { useAppSelector } from '../../redux/hooks';
import CentralStyles from '../../styles/CentralStyles';
import { RecipeSelectionPopup } from './RecipeSelectionPopup';
import { WeeklyRecipeCard } from './WeeklyRecipeCard';

export const WeeklyRecipeListScreen = () => {

    const now = new XDate();
    const { t } = useTranslation("translation");
    const dispatch = useDispatch();

    const [recipeSelectionVisible, setRecipeSelectionVisible] = useState<boolean>(false);

    const [selectedWeekplanDay, setSelectedWeekplanDay] = useState<WeekplanDay>();
    const weekplanDays = useAppSelector((state) => state.weeklyRecipes.weekplanDays);

    const loadData = () => {
        dispatch(fetchWeekplanDays({
            from: getDateOfISOWeek(getCurrentWeekNumber(now), now.getFullYear()),
            to: getDateOfISOWeek(getCurrentWeekNumber(now) + 3, now.getFullYear())
        }));
    }
    useEffect(loadData, []);

    const addRecipeToWeekplanDay = (recipe: Recipe, weekplanDay: WeekplanDay) => {
        //@ts-ignore id is always set
        weekplanDay.recipes.push({ id: recipe.id, title: recipe.title });
        dispatch(updateSingleWeekplanDay(weekplanDay));
        setRecipeSelectionVisible(false);
    }

    const renderWeek = (weekNumber: number, year: number) => {
        let startWeekDate = getDateOfISOWeek(weekNumber, year);
        return [
            t("weekdays.monday"),
            t("weekdays.tuesday"),
            t("weekdays.wednesday"),
            t("weekdays.thursday"),
            t("weekdays.friday"),
            t("weekdays.saturday"),
            t("weekdays.sunday")]
            .map((weekday, weekdayIndex) => {
                const weekdayDate = new XDate(startWeekDate);
                weekdayDate.setDate(weekdayDate.getDate() + weekdayIndex);
                const existingWeekplanDay = weekplanDays.filter(weekplanDay => weekplanDay.day === weekdayDate.toString("yyyy-MM-dd"))[0];
                return (
                    <CustomCard style={{ marginVertical: 5 }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <Text style={styles.weekTitle}>{weekday} {weekdayDate.toLocaleDateString()}</Text>
                            <Button
                                size="tiny"
                                accessoryRight={PlusIcon}
                                appearance="outline"
                                onPress={() => {
                                    setRecipeSelectionVisible(true);
                                    setSelectedWeekplanDay(existingWeekplanDay ? existingWeekplanDay : { day: weekdayDate.toString("yyyy-MM-dd"), recipes: [] });
                                }
                                } />
                        </View>
                        <ScrollView
                            horizontal={true}>
                            {weekplanDays.filter(weekplanDay => weekplanDay.day === weekdayDate.toString("yyyy-MM-dd")).map(weekplanDay => (
                                weekplanDay.recipes.map(recipe => (
                                    <WeeklyRecipeCard
                                        title={recipe.title} />
                                ))
                            ))}
                        </ScrollView>
                    </CustomCard>
                )
            });
    }

    return (
        <>
            <Layout style={CentralStyles.fullscreen}>
                <ScrollView contentContainerStyle={CentralStyles.contentContainer}>
                    <Text category="h5">{t("screens.weekplan.currentWeek")}</Text>
                    {renderWeek(getCurrentWeekNumber(now), now.getFullYear())}
                    <Text category="h5">{t("screens.weekplan.nextWeek")}</Text>
                    {renderWeek(getCurrentWeekNumber(now) + 1, now.getFullYear())}
                    <Text category="h5">{t("screens.weekplan.week")} {getCurrentWeekNumber(now) + 2}</Text>
                    {renderWeek(getCurrentWeekNumber(now) + 2, now.getFullYear())}
                    <Text category="h5">{t("screens.weekplan.week")} {getCurrentWeekNumber(now) + 3}</Text>
                    {renderWeek(getCurrentWeekNumber(now) + 3, now.getFullYear())}
                </ScrollView>
            </Layout>

            <RecipeSelectionPopup
                visible={recipeSelectionVisible}
                onClose={() => setRecipeSelectionVisible(false)}
                //@ts-ignore cannot be undefined
                onRecipeSelected={(recipe) => addRecipeToWeekplanDay(recipe, selectedWeekplanDay)}
            />
        </>
    )
}

const getCurrentWeekNumber = (now: XDate) => {
    var tdt = new Date(now.valueOf());
    var dayn = (now.getDay() + 6) % 7;
    tdt.setDate(tdt.getDate() - dayn + 3);
    var firstThursday = tdt.valueOf();
    tdt.setMonth(0, 1);
    if (tdt.getDay() !== 4) {
        tdt.setMonth(0, 1 + ((4 - tdt.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - tdt.valueOf()) / 604800000);
}

const getDateOfISOWeek = (week: number, year: number) => {
    var simple = new XDate(year, 0, 1 + (week - 1) * 7);
    var dow = simple.getDay();
    var ISOweekStart = simple;
    if (dow <= 4)
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    return ISOweekStart;
}


const styles = StyleSheet.create({
    weekTitle: {
        fontWeight: "bold"
    }
});