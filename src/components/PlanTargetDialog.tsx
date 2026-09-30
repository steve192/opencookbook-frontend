import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Dialog, List, Portal} from 'react-native-paper';
import {Household} from '../api/types/households';
import {overlayStyles} from '../styles/CentralStyles';
import {iconSide} from './listSides';

interface Props {
  visible: boolean;
  title: string;
  households: Household[];
  onDismiss: () => void;
  /** Nothing means your own plan. */
  onChoose: (householdId: string | undefined) => void;
}

/**
 * Which plan something goes on: your own, or one of the households you are in.
 *
 * @param {Props} props the plans to offer and what to do with the answer
 * @return {JSX.Element} the dialog
 */
export const PlanTargetDialog = (props: Props) => {
  const {t} = useTranslation('translation');

  const choose = (householdId: string | undefined) => {
    props.onDismiss();
    props.onChoose(householdId);
  };

  return (
    <Portal>
      <Dialog visible={props.visible} style={overlayStyles.dialogView} onDismiss={props.onDismiss}>
        <Dialog.Title>{props.title}</Dialog.Title>
        <Dialog.Content>
          <List.Item
            testID="planTargetMine"
            title={t('screens.weekplan.myPlan')}
            left={iconSide('account')}
            onPress={() => choose(undefined)} />
          {props.households.map((household) => (
            <List.Item
              key={household.id}
              title={household.name}
              left={iconSide('account-group')}
              onPress={() => choose(household.id)} />
          ))}
        </Dialog.Content>
      </Dialog>
    </Portal>
  );
};

interface PlanTargetQuestion {
  title: string;
  onChosen: (householdId: string | undefined) => void;
}

/**
 * Asks which plan something goes on, only when there is a choice: without households it is your own.
 * One dialog serves every question a screen asks.
 *
 * @param {Household[]} households the households the person is in
 * @return {object} choose, which asks the given question and calls back with the plan, and the dialog to render
 */
export const usePlanTarget = (households: Household[]) => {
  const [question, setQuestion] = useState<PlanTargetQuestion>();
  const choose = (title: string, onChosen: PlanTargetQuestion['onChosen']) =>
    households.length === 0 ? onChosen(undefined) : setQuestion({title, onChosen});
  const dialog = (
    <PlanTargetDialog
      visible={question !== undefined}
      title={question?.title ?? ''}
      households={households}
      onDismiss={() => setQuestion(undefined)}
      onChoose={(householdId) => question?.onChosen(householdId)} />
  );
  return {choose, dialog};
};
