import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Icon, Text, TouchableRipple} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {useAppTheme} from '../../styles/CentralStyles';

export interface Preset {
  value: number;
  /** Finished texts. */
  label: string;
  caption?: string;
  picture: React.ReactNode;
}

interface Props {
  presets: Preset[];
  value: number;
  onChoose: (value: number) => void;
  /** The field for a value of one's own, shown once that is chosen or when no preset matches; without it, none. */
  ownField?: React.ReactNode;
}

interface TileProps {
  selected: boolean;
  picture: React.ReactNode;
  label: string;
  caption?: string;
  onPress: () => void;
}

const Tile = (props: TileProps) => {
  const theme = useAppTheme();
  return (
    <TouchableRipple borderless onPress={props.onPress} accessibilityRole="radio"
      accessibilityState={{selected: props.selected}}
      style={[styles.tile, {borderColor: props.selected ? theme.colors.primary : theme.colors.outlineVariant,
        backgroundColor: props.selected ? theme.colors.secondaryContainer : theme.colors.surface}]}>
      <View style={styles.tileContent}>
        <View style={styles.picture}>{props.picture}</View>
        <Text variant="titleSmall" numberOfLines={1}>{props.label}</Text>
        <Text variant="bodySmall" numberOfLines={1} style={{color: theme.colors.onSurfaceVariant}}>
          {props.caption ?? ' '}
        </Text>
      </View>
    </TouchableRipple>
  );
};

const matches = (a: number, b: number) => Math.abs(a - b) < 0.01;

// Common values as pictures to tap, and a field for a value of one's own.
export const PresetTiles = (props: Props) => {
  const {t} = useTranslation('translation');
  const theme = useAppTheme();
  const [ownChosen, setOwnChosen] = useState(false);
  const own = !!props.ownField && (ownChosen || !props.presets.some((preset) => matches(preset.value, props.value)));
  return (
    <>
      <View style={styles.tiles} accessibilityRole="radiogroup">
        {props.presets.map((preset) => (
          <Tile key={preset.value} selected={!own && matches(preset.value, props.value)} picture={preset.picture}
            label={preset.label} caption={preset.caption}
            onPress={() => {
              setOwnChosen(false);
              props.onChoose(preset.value);
            }} />
        ))}
        {props.ownField &&
          <Tile selected={own} label={t('tools.ownValue')} onPress={() => setOwnChosen(true)}
            picture={<Icon source="pencil-outline" size={28} color={theme.colors.onSurfaceVariant} />} />}
      </View>
      {own && props.ownField}
    </>
  );
};

const styles = StyleSheet.create({
  tiles: {flexDirection: 'row', gap: 8},
  tile: {flex: 1, borderRadius: 12, borderWidth: 1, overflow: 'hidden'},
  tileContent: {alignItems: 'center', paddingVertical: 8, paddingHorizontal: 4, gap: 2},
  picture: {width: 64, height: 64, alignItems: 'center', justifyContent: 'center'},
});
