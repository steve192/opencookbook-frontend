import React, {useEffect, useState} from 'react';
import {Platform, ScrollView} from 'react-native';
import {StaticHtmlViewer} from '../components/StaticHtmlViewer';
import RestAPI from '../dao/RestAPI';


export const TermsOfServiceScreen = () => {
  const [tos, setTos] = useState('');

  useEffect(() => {
    RestAPI.getInstanceInfo().then((instanceInfo) => {
      setTos(instanceInfo.termsOfService);
    });
  }, []);

  return <ScrollView>
    {(Platform.OS === 'web') ?
      <div dangerouslySetInnerHTML={{__html: tos}} /> :
      <StaticHtmlViewer html={tos}/>
    }
  </ScrollView>;
};
