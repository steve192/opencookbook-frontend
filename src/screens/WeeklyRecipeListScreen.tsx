import { Layout, Text } from '@ui-kitten/components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { CustomCard } from '../components/CustomCard';
import CentralStyles from '../styles/CentralStyles';
import * as Localization from 'expo-localization';
import XDate from 'xdate';

export const WeeklyRecipeListScreen = () => {
    const now = new XDate();
    const { t } = useTranslation("translation");
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
                return (
                    <CustomCard style={{ marginVertical: 5 }}>
                        <Text style={styles.weekTitle}>{weekday} {weekdayDate.toString("dd.MM")}</Text>
                    </CustomCard>
                )

            });
    }

    return (
        <>
            <View style={CentralStyles.fullscreen}>
                <Layout style={CentralStyles.contentContainer}>
                    <ScrollView>
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
            </View>
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

const getDateOfISOWeek = (w, y) => {
    var simple = new Date(y, 0, 1 + (w - 1) * 7);
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