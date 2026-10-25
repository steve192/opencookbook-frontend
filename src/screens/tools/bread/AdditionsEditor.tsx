import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {ActivityIndicator, IconButton, List, Searchbar, SegmentedButtons, Text} from 'react-native-paper';
import {useGetSoakingQuery, useSearchCatalogueQuery} from '../../../api/endpoints/catalogue';
import {QuestionSection} from '../../../components/QuestionSection';
import {MeasureSlider} from '../../../components/tools/MeasureSlider';
import {Addition, doughWaterPer100g} from '../../../tools/bread/bread';
import {ADDITION_PREPARATIONS} from '../../../tools/bread/breadData';

interface Props {
  additions: Addition[];
  onChange: (additions: Addition[]) => void;
}

const SEARCH_DELAY_MS = 400;
const MAX_ADDITIONS = 10;

// Pumpkin, quark or seeds from the food catalogue, which knows their water and what they soak up.
export const AdditionsEditor = (props: Props) => {
  const {t, i18n} = useTranslation('translation');
  const [text, setText] = useState('');
  const [searched, setSearched] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setSearched(text.trim()), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [text]);

  const search = useSearchCatalogueQuery({q: searched, lang: i18n.language}, {skip: searched.length < 2});
  const soaking = useGetSoakingQuery();
  const absorptionOf = (foodId: number) => soaking.data?.find((food) => food.foodId === foodId)?.absorption;
  const waterHint = (addition: Addition) => {
    if (addition.soakAbsorption != null) {
      return t('tools.bread.soaks', {grams: addition.soakAbsorption});
    }
    const given = Math.round(doughWaterPer100g(addition));
    return t(given >= 0 ? 'tools.bread.waterGiven' : 'tools.bread.waterBound',
        {percent: Math.round(addition.waterPer100g), grams: Math.abs(given)});
  };
  const replace = (index: number, changes: Partial<Addition>) =>
    props.onChange(props.additions.map((addition, at) => at === index ? {...addition, ...changes} : addition));

  return (
    <QuestionSection title={t('tools.bread.additions')} hint={t('tools.bread.additionsHint')}>
      {props.additions.map((addition, index) => (
        <View key={addition.foodId} style={styles.row}>
          <View style={styles.field}>
            <MeasureSlider label={addition.name} measure="weight" value={addition.grams} min={10} max={1000}
              step={{metric: 5, imperial: 0.25}}
              hint={waterHint(addition)}
              onChange={(grams) => replace(index, {grams})} />
            {addition.preparation && <SegmentedButtons value={addition.preparation} density="small"
              onValueChange={(preparation) => replace(index, {preparation: preparation as Addition['preparation']})}
              buttons={ADDITION_PREPARATIONS.map((preparation) => ({value: preparation,
                label: t(`tools.bread.preparations.${preparation}`)}))} />}
          </View>
          <IconButton icon="delete-outline" accessibilityLabel={t('tools.bread.removeAddition')}
            onPress={() => props.onChange(props.additions.filter((_, at) => at !== index))} />
        </View>
      ))}
      {props.additions.length < MAX_ADDITIONS && <>
        <Searchbar placeholder={t('tools.bread.searchAddition')} value={text} onChangeText={setText} />
        {search.isFetching && <ActivityIndicator />}
        {search.isError && <Text variant="bodySmall">{t('tools.bread.searchFailed')}</Text>}
        {searched.length >= 2 && search.data?.filter((food) => food.waterPer100g != null &&
            !props.additions.some((addition) => addition.foodId === food.id)).slice(0, 6).map((food) => (
          <List.Item key={food.id} title={food.displayName} left={(side) => <List.Icon {...side} icon="plus" />}
            onPress={() => {
              const soakAbsorption = absorptionOf(food.id);
              // Cooked is the safer guess: a dough short of water takes more while kneading, a wet one does not
              // give it back.
              props.onChange([...props.additions, {foodId: food.id, name: food.displayName, grams: 100,
                waterPer100g: food.waterPer100g ?? 0, soakAbsorption, starchPer100g: food.starchPer100g ?? undefined,
                preparation: food.aisle === 'FRUIT_VEG' && soakAbsorption == null ? 'cooked' : undefined}]);
              setText('');
            }} />
        ))}
      </>}
    </QuestionSection>
  );
};

const styles = StyleSheet.create({
  row: {flexDirection: 'row', alignItems: 'flex-start', gap: 8},
  field: {flex: 1, gap: 8},
});
