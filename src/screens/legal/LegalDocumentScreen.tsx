import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {useGetLegalDocumentQuery} from '../../api/endpoints/legal';
import {QueryFallback} from '../../components/QueryFallback';
import {StaticHtmlViewer} from '../../components/StaticHtmlViewer';
import {BaseNavigatorProps} from '../../navigation/NavigationRoutes';

type Props = NativeStackScreenProps<BaseNavigatorProps, 'LegalDocumentScreen'>;

export const LegalDocumentScreen = ({route}: Props) => {
  const {t} = useTranslation('translation');
  const {data, error, refetch} = useGetLegalDocumentQuery(route.params.document);

  return data === undefined ?
    <QueryFallback error={error} onRetry={refetch} /> :
    <StaticHtmlViewer html={data} title={t(`screens.legal.${route.params.document}`)} />;
};
