import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {RadioButton, Surface, Text} from 'react-native-paper';
import CentralStyles, {useAppTheme} from '../styles/CentralStyles';
import {RecipeImageComponent} from './RecipeImageComponent';

interface Props {
  title: string
  coverImageUuid?: string
  /** A second line under the title, for lists where whose recipe it is matters. */
  subtitle?: string
  onPress: () => void
  onLongPress?: () => void
  /** Draws the multi-selection radio button. */
  selectable?: boolean
  selected?: boolean
  testID?: string
}

const IMAGE_HEIGHT = 180;
const TITLE_HEIGHT = 60;

/**
 * One recipe tile of a cookbook. Its height is what {@link ../helper/recipeGrid.RECIPE_TILE_HEIGHT} reserves.
 *
 * @param {Props} props what to show and what a tap means
 * @return {React.JSX.Element} the tile
 */
export const RecipeTile = (props: Props) => {
  const theme = useAppTheme();

  return (
    <Pressable
      testID={props.testID ?? 'recipeListItem'}
      style={[styles.tile, props.selected && {backgroundColor: theme.colors.primary}]}
      onPress={props.onPress}
      onLongPress={props.onLongPress}>

      <Surface style={styles.image}>
        <RecipeImageComponent
          useThumbnail={true}
          forceFitScaling={true}
          uuid={props.coverImageUuid} />
      </Surface>

      <View style={styles.caption}>
        <Text numberOfLines={props.subtitle ? 1 : 2} style={styles.title}>
          {props.title}
        </Text>
        {props.subtitle !== undefined &&
          <Text numberOfLines={1} variant="bodySmall"
            style={{color: theme.colors.onSurfaceVariant}}>
            {props.subtitle}
          </Text>
        }
      </View>

      {props.selectable &&
        <View style={styles.selection}>
          <RadioButton
            value=''
            color={theme.colors.primary}
            uncheckedColor={theme.colors.primary}
            status={props.selected ? 'checked' : 'unchecked'}
            onPress={props.onPress} />
        </View>
      }
    </Pressable>
  );
};

const styles = StyleSheet.create({
  tile: {
    ...CentralStyles.recipeCardFrame,
    margin: 3,
    flex: 1,
  },
  image: {
    height: IMAGE_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
  },
  caption: {
    height: TITLE_HEIGHT,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
  },
  selection: {
    position: 'absolute',
  },
});
