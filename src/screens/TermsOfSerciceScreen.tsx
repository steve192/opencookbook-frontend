import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {Platform} from 'react-native';
import {useGetInstanceInfoQuery} from '../api/endpoints/account';
import {StaticHtmlViewer} from '../components/StaticHtmlViewer';
import {BaseNavigatorProps} from '../navigation/NavigationRoutes';


type Props = NativeStackScreenProps<BaseNavigatorProps, 'TermsOfServiceScreen'>;
export const TermsOfServiceScreen = (props: Props) => {
  const tos = useGetInstanceInfoQuery().data?.termsOfService ?? '';

  if (Platform.OS === 'web') {
    return <div dangerouslySetInnerHTML={{__html: tos}} />;
  } else {
    return <StaticHtmlViewer html={tos}/>;
  }
};
