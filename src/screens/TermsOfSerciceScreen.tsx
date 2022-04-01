import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {Platform} from 'react-native';
import {StaticHtmlViewer} from '../components/StaticHtmlViewer';
import RestAPI from '../dao/RestAPI';
import {LoginNavigationProps} from '../navigation/NavigationRoutes';


type Props = NativeStackScreenProps<LoginNavigationProps, 'TermsOfServiceScreen'>;
export const TermsOfServiceScreen = (props: Props) => {
  const [tos, setTos] = useState('');

  useEffect(() => {
    RestAPI.getInstanceInfo().then((instanceInfo) => {
      setTos(instanceInfo.termsOfService);
    });
  }, []);


  if (Platform.OS === 'web') {
    return <div dangerouslySetInnerHTML={{__html: tos}} />;
  } else {
    return <StaticHtmlViewer html={tos}/>;
  }
};
