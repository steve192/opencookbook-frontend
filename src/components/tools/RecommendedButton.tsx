import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet} from 'react-native';
import {Button} from 'react-native-paper';

interface Props {
  /** What the settings come to now and as recommended: the same means nothing to reset, however it was set. */
  result: object;
  recommendedResult: object;
  onPress: () => void;
}

// Sets a tool back to its recommended settings.
export const RecommendedButton = ({result, recommendedResult, onPress}: Props) => {
  const {t} = useTranslation('translation');
  const recommended = JSON.stringify(result) === JSON.stringify(recommendedResult);
  return (
    <Button mode="outlined" icon={recommended ? 'check' : 'restore'} disabled={recommended} onPress={onPress}
      style={styles.button}>
      {t(recommended ? 'tools.recommendedSettingsActive' : 'tools.recommendedSettings')}
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {alignSelf: 'flex-start'},
});
