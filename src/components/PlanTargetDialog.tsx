import React from 'react';
import {useTranslation} from 'react-i18next';
import {Dialog, List, Portal} from 'react-native-paper';
import {Household} from '../dao/RestAPI';
import {overlayStyles} from '../styles/CentralStyles';

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
            left={(iconProps) => <List.Icon {...iconProps} icon="account" />}
            onPress={() => choose(undefined)} />
          {props.households.map((household) => (
            <List.Item
              key={household.id}
              title={household.name}
              left={(iconProps) => <List.Icon {...iconProps} icon="account-group" />}
              onPress={() => choose(household.id)} />
          ))}
        </Dialog.Content>
      </Dialog>
    </Portal>
  );
};
