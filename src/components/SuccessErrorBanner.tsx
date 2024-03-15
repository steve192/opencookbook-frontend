import React, {ReactElement} from 'react';
import {View} from 'react-native';
import {MD3Colors, ProgressBar, Text} from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import Spacer from 'react-spacer';
import CentralStyles, {useAppTheme} from '../styles/CentralStyles';

interface Props {
    error: boolean;
    success: boolean;
    pending: boolean;
    errorContent: string | ReactElement;
    successContent: string | ReactElement;
    pendingContent: string | ReactElement;
}
export const SuccessErrorBanner = (props: Props) => {
  const theme = useAppTheme();

  const renderError =
  <>
    <Icon style={{textAlign: 'center'}} name="exclamation-circle" size={30} color={theme.colors.error} />
    <Spacer height={20}/>
    <Text style={{fontWeight: 'bold', color: theme.colors.error, textAlign: 'center'}}>{props.errorContent}</Text>
  </>;
  const renderSuccess =
  <>
    <Icon style={{textAlign: 'center'}} name="check-circle" size={30} color={theme.colors.success} />
    <Spacer height={20}/>
    <Text style={{fontWeight: 'bold', color: theme.colors.success, textAlign: 'center'}}>{props.successContent}</Text>
  </>;

  const renderPending =
    <>
      <Text style={{fontWeight: 'bold', color: MD3Colors.neutral0, textAlign: 'center'}}>{props.pendingContent}</Text>
      <Spacer height={20}/>
      <View style={{maxWidth: 300, width: '100%', alignSelf: 'center', justifyContent: 'center'}}>
        <ProgressBar indeterminate={true} />
      </View>
    </>;

  if (!props.error && !props.success && !props.pending) {
    return <></>;
  }

  return (
    <View style={{flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'}}>

      <View style={[CentralStyles.contentContainer,
        {
          backgroundColor: 'rgba(0,0,0,0.47)',
        }]}>
        {props.pending && renderPending }
        {props.error && renderError }
        {props.success && renderSuccess }
      </View>
    </View>
  );
};
