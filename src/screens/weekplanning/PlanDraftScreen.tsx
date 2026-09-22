import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView, StyleSheet, View} from 'react-native';
import {ActivityIndicator, Button, Surface, Text} from 'react-native-paper';
import XDate from 'xdate';
import {askForPlanningDetails} from '../../components/PlanningDetailsPrompt';
import {HintText} from '../../components/QuestionSection';
import {ScreenFooter} from '../../components/ScreenFooter';
import {SectionTitle} from '../../components/SectionTitle';
import RestAPI, {PlanDraft, PlanSlot, RerollReason} from '../../dao/RestAPI';
import {errorMessageKey} from '../../helper/apiErrorMessage';
import {SnackbarUtil} from '../../helper/GlobalSnackbar';
import {draftDays, draftSummary, leftoverSource} from '../../helper/planDraft';
import {concerns} from '../../helper/scoreReasons';
import {formatWeekdayAndDate} from '../../helper/weekplan';
import {MainNavigationProps} from '../../navigation/NavigationRoutes';
import CentralStyles from '../../styles/CentralStyles';
import {PlanSlotRow} from './PlanSlotRow';

type Props = NativeStackScreenProps<MainNavigationProps, 'PlanDraftScreen'>;

// A proposed week to adjust before anything reaches the weekplan: keep a meal, draw another,
// or leave it to the cook. Leaving without adding it throws the proposal away.
export const PlanDraftScreen = (props: Props) => {
  const {t} = useTranslation('translation');
  const {draftId, householdId} = props.route.params;

  const [draft, setDraft] = useState<PlanDraft>();
  const [busy, setBusy] = useState(false);
  const accepted = useRef(false);

  useEffect(() => {
    RestAPI.getPlanDraft(draftId, householdId)
        .then(setDraft)
        .catch((e) => SnackbarUtil.show({message: t(errorMessageKey(e, 'screens.planning.loadFailed'))}));
  }, [draftId, householdId, t]);

  useEffect(() => props.navigation.addListener('beforeRemove', () => {
    if (!accepted.current) {
      RestAPI.discardPlanDraft(draftId, householdId).catch(() => undefined);
    }
  }), [props.navigation, draftId, householdId]);

  const whileBusy = async (action: () => Promise<void>) => {
    setBusy(true);
    try {
      await action();
    } catch (e) {
      SnackbarUtil.show({message: t(errorMessageKey(e, 'screens.planning.changeFailed'))});
    } finally {
      setBusy(false);
    }
  };

  // Every change comes back as the whole week, because one change can move others.
  const change = (request: () => Promise<PlanDraft>) => whileBusy(async () => setDraft(await request()));

  const reroll = async (slot: PlanSlot, reason?: RerollReason) => {
    await change(() => RestAPI.rerollPlanSlot(draftId, slot.id, reason, householdId));
    // The cook just said what the recipe is; ask them to write it down so it is not planned as a meal again
    if (reason === 'NOT_A_FULL_MEAL' && slot.recipe) {
      askForPlanningDetails(slot.recipe, {always: true});
    }
  };

  const accept = () => whileBusy(async () => {
    await RestAPI.acceptPlanDraft(draftId, householdId);
    accepted.current = true;
    SnackbarUtil.show({message: t('screens.planning.accepted')});
    props.navigation.goBack();
  });

  if (!draft) {
    return <Surface style={styles.screen}><ActivityIndicator style={styles.loading} /></Surface>;
  }

  const repeats = draft.slots.some((slot) => concerns(slot.reasons).some((reason) => reason.term === 'cooldown'));

  return (
    <Surface style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[CentralStyles.contentContainer, styles.content]}>
          <Text variant="bodyMedium">{draftSummary(t, draft)}</Text>
          {repeats &&
            <HintText>{t('screens.planning.repeatsNote')}</HintText>
          }
          {draftDays(draft).map((day) => (
            <View key={day.date} style={styles.day}>
              <SectionTitle>{formatWeekdayAndDate(new XDate(day.date))}</SectionTitle>
              {day.slots.map((slot) => (
                <PlanSlotRow
                  key={slot.id}
                  slot={slot}
                  source={leftoverSource(draft, slot)}
                  busy={busy}
                  onOpenRecipe={(recipeId) => props.navigation.navigate('RecipeScreen', {recipeId})}
                  onReroll={(reason) => reroll(slot, reason)}
                  onLock={(locked) => change(() => RestAPI.setPlanSlotLocked(draftId, slot.id, locked, householdId))}
                  onToggleGap={() => change(() => RestAPI.togglePlanSlotGap(draftId, slot.id, householdId))} />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
      <ScreenFooter>
        <Button mode="outlined" disabled={busy} onPress={() => change(() => RestAPI.rerollPlanDraft(draftId, householdId))}>
          {t('screens.planning.rerollAll')}
        </Button>
        <Button mode="contained" disabled={busy} loading={busy} onPress={accept}>
          {t('screens.planning.accept')}
        </Button>
      </ScreenFooter>
    </Surface>
  );
};

const styles = StyleSheet.create({
  screen: {flex: 1},
  loading: {marginTop: 32},
  scrollContent: {paddingBottom: 16},
  content: {gap: 16, paddingTop: 16},
  day: {gap: 8},
});
