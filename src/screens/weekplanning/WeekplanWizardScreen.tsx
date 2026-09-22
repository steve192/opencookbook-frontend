import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView, StyleSheet, View} from 'react-native';
import {ActivityIndicator, Button, List, Surface, Text} from 'react-native-paper';
import {MealTypeCoverageWarning} from '../../components/MealTypeCoverageWarning';
import {HintText} from '../../components/QuestionSection';
import {ScreenFooter} from '../../components/ScreenFooter';
import {SectionTitle} from '../../components/SectionTitle';
import {StepProgressBar} from '../../components/StepProgressBar';
import RestAPI, {PlanningProfile} from '../../dao/RestAPI';
import {errorMessageKey} from '../../helper/apiErrorMessage';
import {SnackbarUtil} from '../../helper/GlobalSnackbar';
import {
  canPlan,
  extrasSummary,
  foodSummary,
  householdSummary,
  newPlanningProfile,
} from '../../helper/planningProfile';
import {useOwnIngredients} from '../../helper/useOwnIngredients';
import {usePlanPeriod} from '../../helper/usePlanPeriod';
import {toDayKey} from '../../helper/weekplan';
import {MainNavigationProps} from '../../navigation/NavigationRoutes';
import CentralStyles from '../../styles/CentralStyles';
import {ExtrasSection} from './wizard/ExtrasSection';
import {FoodSection} from './wizard/FoodSection';
import {HouseholdSection} from './wizard/HouseholdSection';
import {WeekSection} from './wizard/WeekSection';
import {useHouseholds} from '../households/useHouseholds';

type Props = NativeStackScreenProps<MainNavigationProps, 'WeekplanWizardScreen'>;

type SectionKey = 'household' | 'food' | 'extras' | 'week';

const SECTION_TEXTS = {
  household: {title: 'screens.planning.sectionHousehold', intro: 'screens.planning.introHousehold'},
  food: {title: 'screens.planning.sectionFood', intro: 'screens.planning.introFood'},
  extras: {title: 'screens.planning.sectionExtras', intro: 'screens.planning.introExtras'},
  week: {title: 'screens.planning.sectionWeek', intro: 'screens.planning.introWeek'},
} as const;

const GUIDED_STEPS: SectionKey[] = ['household', 'food', 'extras', 'week'];

/** What stays the same from week to week; shown collapsed once a profile is saved. */
const USUAL_SECTIONS: SectionKey[] = ['household', 'food', 'extras'];

// The first plan walks through the questions one step at a time. Later plans open on what is
// different this week, with the saved answers collapsed underneath, so planning again is one tap.
export const WeekplanWizardScreen = (props: Props) => {
  const {t} = useTranslation('translation');
  const ingredients = useOwnIngredients();
  const period = usePlanPeriod(props.route.params.weekOffset);
  const scrollRef = useRef<ScrollView>(null);

  const [profile, setProfile] = useState<PlanningProfile>();
  const [guidedStep, setGuidedStep] = useState<number>();
  const [expanded, setExpanded] = useState<SectionKey>();
  const [planning, setPlanning] = useState(false);
  // Undefined for your own plan.
  const householdId = props.route.params.householdId;
  const {households} = useHouseholds();

  useEffect(() => {
    RestAPI.getPlanningProfiles(householdId)
        .then((profiles) => profiles.find((saved) => saved.defaultProfile) ?? profiles[0])
        .catch(() => undefined)
        .then((saved) => {
          setProfile(saved ?? newPlanningProfile(t('screens.planning.defaultProfileName')));
          setGuidedStep(saved ? undefined : 0);
        });
  }, [t, householdId]);

  if (!profile) {
    return <Surface style={styles.screen}><ActivityIndicator style={styles.loading} /></Surface>;
  }

  const plan = async () => {
    setPlanning(true);
    try {
      const saved = await RestAPI.savePlanningProfile({...profile, defaultProfile: true}, householdId);
      const draft = await RestAPI.generatePlanDraft(saved.id!, toDayKey(period.days[0]), period.days.length,
          period.awayDays, householdId);
      props.navigation.replace('PlanDraftScreen', {draftId: draft.id, householdId: householdId});
    } catch (e) {
      SnackbarUtil.show({message: t(errorMessageKey(e, 'screens.planning.planFailed'))});
      setPlanning(false);
    }
  };

  const goToStep = (step: number) => {
    setGuidedStep(step);
    scrollRef.current?.scrollTo({y: 0, animated: false});
  };

  const renderSection = (section: SectionKey) => {
    const sectionProps = {profile, onChange: setProfile};
    return {
      household: <HouseholdSection {...sectionProps} />,
      food: <FoodSection {...sectionProps} ingredients={ingredients} />,
      extras: <ExtrasSection {...sectionProps} offerHouseholdRecipes={!householdId && households.length > 0} />,
      week: <WeekSection {...sectionProps} period={period} ingredients={ingredients} />,
    }[section];
  };

  const summaryOf = (section: SectionKey): string => ({
    household: () => householdSummary(t, profile),
    food: () => foodSummary(t, profile),
    extras: () => extrasSummary(t, profile),
    week: () => '',
  })[section]();

  const renderGuided = (step: number) => {
    const section = GUIDED_STEPS[step];
    return (
      <>
        <View style={styles.stepHeader}>
          <StepProgressBar progress={(step + 1) / GUIDED_STEPS.length} />
          <HintText>{t('screens.planning.stepOf', {step: step + 1, count: GUIDED_STEPS.length})}</HintText>
          <Text variant="headlineSmall">{t(SECTION_TEXTS[section].title)}</Text>
          <HintText>{t(SECTION_TEXTS[section].intro)}</HintText>
        </View>
        {renderSection(section)}
      </>
    );
  };

  const renderOverview = () => (
    <>
      <Surface style={styles.weekCard} elevation={1}>
        {renderSection('week')}
      </Surface>
      <View>
        <SectionTitle>{t('screens.planning.usualWeek')}</SectionTitle>
        {USUAL_SECTIONS.map((section) => (
          <List.Accordion
            key={section}
            title={t(SECTION_TEXTS[section].title)}
            description={summaryOf(section)}
            descriptionNumberOfLines={2}
            style={styles.accordion}
            expanded={expanded === section}
            onPress={() => setExpanded(expanded === section ? undefined : section)}>
            <View style={styles.accordionContent}>{renderSection(section)}</View>
          </List.Accordion>
        ))}
      </View>
    </>
  );

  const isLastStep = guidedStep === GUIDED_STEPS.length - 1;
  const blocked = planning || !canPlan(profile);

  return (
    <Surface style={styles.screen}>
      <ScrollView ref={scrollRef} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
        <View style={[CentralStyles.contentContainer, styles.content]}>
          <MealTypeCoverageWarning />
          {guidedStep === undefined ? renderOverview() : renderGuided(guidedStep)}
        </View>
      </ScrollView>
      <ScreenFooter>
        {guidedStep !== undefined && guidedStep > 0 &&
          <Button mode="outlined" onPress={() => goToStep(guidedStep - 1)}>{t('screens.planning.back')}</Button>
        }
        {guidedStep !== undefined && !isLastStep ?
          <Button mode="contained" disabled={blocked} onPress={() => goToStep(guidedStep + 1)}>
            {t('screens.planning.next')}
          </Button> :
          <Button mode="contained" icon="creation" disabled={blocked} loading={planning} onPress={plan}>
            {t('screens.planning.plan')}
          </Button>
        }
      </ScreenFooter>
    </Surface>
  );
};

const styles = StyleSheet.create({
  screen: {flex: 1},
  loading: {marginTop: 32},
  scrollContent: {paddingBottom: 16},
  content: {gap: 20, paddingTop: 16},
  stepHeader: {gap: 6},
  weekCard: {padding: 16, borderRadius: 16, gap: 16},
  accordion: {paddingHorizontal: 0},
  accordionContent: {gap: 16, paddingBottom: 16},
});
