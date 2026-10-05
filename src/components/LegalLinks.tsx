import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Text as RNText, StyleSheet, View} from 'react-native';
import {Button} from 'react-native-paper';
import {LEGAL_DOCUMENTS, LegalDocument} from '../api/types/legal';
import {BaseNavigatorProps} from '../navigation/NavigationRoutes';
import {useAppTheme} from '../styles/CentralStyles';

interface Props {
  /** Text color, for a background the theme does not know about. */
  color?: string;
}

const useOpenLegalDocument = () => {
  const navigation = useNavigation<NativeStackNavigationProp<BaseNavigatorProps>>();
  return (document: LegalDocument) => navigation.navigate('LegalDocumentScreen', {document});
};

export const LegalLinks = ({color}: Props) => {
  const {t} = useTranslation('translation');
  const open = useOpenLegalDocument();

  return (
    <View style={styles.row}>
      {LEGAL_DOCUMENTS.map((document) => (
        <Button
          key={document}
          compact
          uppercase={false}
          textColor={color}
          onPress={() => open(document)}>
          {t(`screens.legal.${document}`)}
        </Button>
      ))}
    </View>
  );
};

/**
 * The links of a translated sentence that names the documents as `<terms>` and `<privacy>`.
 *
 * @return {object} the components for `Trans`
 */
export const useLegalDocumentLinks = () => {
  const open = useOpenLegalDocument();
  const {colors} = useAppTheme();
  const link = (document: LegalDocument) => (
    <RNText onPress={() => open(document)} style={{color: colors.primary}} />
  );
  return {terms: link('terms'), privacy: link('privacy')};
};

const styles = StyleSheet.create({
  row: {flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center'},
});
