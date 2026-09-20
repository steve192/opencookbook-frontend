import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import {Recipe} from '../dao/RestAPI';
import CentralStyles, {useAppTheme} from '../styles/CentralStyles';
import {RecipeImageComponent} from './RecipeImageComponent';

interface Props {
  recipe: Recipe;
  onOpen: () => void;
  /** Shown under the title: why the recipe is here, and what can be done with it. */
  children?: React.ReactNode;
}

// The recipe overview's tile turned on its side, with room on the right for the screen's details.
export const RecipeRowCard = (props: Props) => {
  const theme = useAppTheme();
  return (
    <Pressable style={styles.card} onPress={props.onOpen}>
      <View style={[styles.cover, {backgroundColor: theme.colors.surfaceVariant}]}>
        <RecipeImageComponent
          useThumbnail={true}
          forceFitScaling={true}
          uuid={props.recipe.images[0]?.uuid} />
      </View>
      <View style={styles.details}>
        <Text numberOfLines={2} style={styles.title}>{props.recipe.title}</Text>
        {props.children}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    ...CentralStyles.recipeCardFrame,
    flexDirection: 'row',
    // Keeps the stretched cover from collapsing to a stripe on a short card
    minHeight: 110,
    padding: 8,
  },
  // Inset, so all four corners are rounded rather than only the two touching the card's edge
  cover: {
    width: 96,
    alignSelf: 'stretch',
    borderRadius: 12,
    overflow: 'hidden',
  },
  details: {
    flex: 1,
    paddingLeft: 10,
    gap: 4,
  },
  title: {
    fontWeight: 'bold',
  },
});
