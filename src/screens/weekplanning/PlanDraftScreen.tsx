import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Button, Surface, Text} from 'react-native-paper';
import XDate from 'xdate';
import {
  DraftRef,
  useAcceptPlanDraftMutation,
  useDiscardPlanDraftMutation,
  useGetPlanDraftQuery,
  useRerollPlanDraftMutation,
  useRerollPlanSlotMutation,
  useSetPlanSlotLockedMutation,
  useTogglePlanSlotGapMutation,
} from '../../api/endpoints/planning';
import {PlanSlot, RerollReason} from '../../api/types/planning';
import {askForPlanningDetails} from '../../components/PlanningDetailsPrompt';
import {QueryFallback} from '../../components/QueryFallback';
import {HintText} from '../../components/QuestionSection';
import {ScreenFooter} from '../../components/ScreenFooter';
import {SectionTitle} from '../../components/SectionTitle';
import {errorMessageKey} from '../../helper/apiErrorMessage';
import {SnackbarUtil} from '../../helper/GlobalSnackbar';
import {draftDays, draftSummary, leftoverSource} from '../../helper/planDraft';
import {concerns} from '../../helper/scoreReasons';
import {formatWeekdayAndDate} from '../../helper/weekplan';
import {MainNavigationProps} from '../../navigation/NavigationRoutes';
import {useIsOnline} from '../../offline/useIsOnline';
import CentralStyles from '../../styles/CentralStyles';
import {PlanSlotRow} from './PlanSlotRow';

type Props = NativeStackScreenProps<MainNavigationProps, 'PlanDraftScreen'>;

// A proposed week to adjust before anything reaches the weekplan: keep a meal, draw another,
// or leave it to the cook. Leaving without adding it throws the proposal away.
export const PlanDraftScreen = (props: Props) => {
  const {t} = useTranslation('translation');
  const {draftId, householdId} = props.route.params;
  const ref: DraftRef = useMemo(() => ({draftId, householdId: householdId ?? null}), [draftId, householdId]);
  const online = useIsOnline();

  const {data: draft, error, refetch} = useGetPlanDraftQuery(ref);
  const [rerollPlanSlot] = useRerollPlanSlotMutation();
  const [setPlanSlotLocked] = useSetPlanSlotLockedMutation();
  const [togglePlanSlotGap] = useTogglePlanSlotGapMutation();
  const [rerollPlanDraft] = useRerollPlanDraftMutation();
  const [acceptPlanDraft] = useAcceptPlanDraftMutation();
  const [discardPlanDraft] = useDiscardPlanDraftMutation();
  const [changing, setChanging] = useState(false);
  const controlsDisabled = changing || !online;
  const accepted = useRef(false);

  useEffect(() => props.navigation.addListener('beforeRemove', () => {
    if (!accepted.current) {
      discardPlanDraft(ref);
    }
  }), [props.navigation, ref]);

  // Every change answers with the whole week, because one change can move others; it replaces the cached one.
  const change = async (request: () => Promise<unknown>) => {
    setChanging(true);
    try {
      await request();
    } catch (e) {
      SnackbarUtil.show({message: t(errorMessageKey(e, 'screens.planning.changeFailed'))});
    } finally {
      setChanging(false);
    }
  };

  const reroll = async (slot: PlanSlot, reason?: RerollReason) => {
    await change(() => rerollPlanSlot({...ref, slotId: slot.id, reason}).unwrap());
    // The cook just said what the recipe is; ask them to write it down so it is not planned as a meal again
    if (reason === 'NOT_A_FULL_MEAL' && slot.recipe) {
      askForPlanningDetails(slot.recipe, {always: true});
    }
  };

  const accept = () => change(async () => {
    await acceptPlanDraft(ref).unwrap();
    accepted.current = true;
    SnackbarUtil.show({message: t('screens.planning.accepted')});
    props.navigation.goBack();
  });

  if (!draft) {
    return <QueryFallback error={error} onRetry={refetch} />;
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
                  busy={controlsDisabled}
                  onOpenRecipe={(recipeId) => props.navigation.navigate('RecipeScreen', {recipeId})}
                  onReroll={(reason) => reroll(slot, reason)}
                  onLock={(locked) => change(() => setPlanSlotLocked({...ref, slotId: slot.id, locked}).unwrap())}
                  onToggleGap={() => change(() => togglePlanSlotGap({...ref, slotId: slot.id}).unwrap())} />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
      <ScreenFooter>
        <Button mode="outlined" disabled={controlsDisabled} onPress={() => change(() => rerollPlanDraft(ref).unwrap())}>
          {t('screens.planning.rerollAll')}
        </Button>
        <Button mode="contained" disabled={controlsDisabled} loading={changing} onPress={accept}>
          {t('screens.planning.accept')}
        </Button>
      </ScreenFooter>
    </Surface>
  );
};

const styles = StyleSheet.create({
  screen: {flex: 1},
  scrollContent: {paddingBottom: 16},
  content: {gap: 16, paddingTop: 16},
  day: {gap: 8},
});
