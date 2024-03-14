import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {Platform} from 'react-native';
import {StaticHtmlViewer} from '../components/StaticHtmlViewer';
import RestAPI, {BringExportData} from '../dao/RestAPI';
import {BaseNavigatorProps} from '../navigation/NavigationRoutes';


type Props = NativeStackScreenProps<BaseNavigatorProps, 'BringExportScreen'>;
export const BringExportScreen = (props: Props) => {
  const [exportData, setExportData] = useState<BringExportData>();

  useEffect(() => {
    RestAPI.getBringExportData(props.route.params.exportId).then((exportData) => {
      setExportData(exportData);
    });
  }, []);


  if (Platform.OS === 'web') {
    return <div itemType="http://schema.org/Recipe">
      <span itemProp='yield'>{exportData?.baseAmount}</span>
      <ul>
        {exportData?.ingredients?.map((ingredient) => <li itemProp='ingredients'>{ingredient}</li> )}
      </ul>
    </div>;
  }
};
