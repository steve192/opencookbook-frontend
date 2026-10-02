import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {Button} from 'react-native-paper';
import {LEGAL_DOCUMENTS} from '../api/types/legal';
import {BaseNavigatorProps} from '../navigation/NavigationRoutes';

interface Props {
  /** Text color, for a background the theme does not know about. */
  color?: string;
}

export const LegalLinks = ({color}: Props) => {
  const {t} = useTranslation('translation');
  const navigation = useNavigation<NativeStackNavigationProp<BaseNavigatorProps>>();

  return (
    <View style={styles.row}>
      {LEGAL_DOCUMENTS.map((document) => (
        <Button
          key={document}
          compact
          uppercase={false}
          textColor={color}
          onPress={() => navigation.navigate('LegalDocumentScreen', {document})}>
          {t(`screens.legal.${document}`)}
        </Button>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center'},
});
