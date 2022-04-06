import React, {useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {IconButton, Paragraph, useTheme} from 'react-native-paper';
import {RecipeImageComponent} from '../../components/RecipeImageComponent';


interface Props {
    title: string;
    imageUuid?: string;
    onPress?: () => void;
    onRemovePress: () => void;
}
export const WeeklyRecipeCard = (props: Props) => {
  const [editMode, setEditMode] = useState(false);

  const theme = useTheme();
  return (
    <Pressable
      style={styles.card}
      onLongPress={() => setEditMode(!editMode)}
      onPress={props.onPress}>
      {props.imageUuid && <View style={{height: 80, borderRadius: 16, overflow: 'hidden'}}>
        <RecipeImageComponent
          useThumbnail={true}
          forceFitScaling={true}
          uuid={props.imageUuid} />
      </View>}
      <Paragraph style={{textAlign: 'center', fontWeight: 'bold'}}>
        {props.title}
      </Paragraph>
      {editMode &&
      <IconButton
        color={theme.colors.error}
        icon="delete-outline"
        onPress={props.onRemovePress} />}
    </Pressable>

  );
};

const styles = StyleSheet.create({
  card: {
    justifyContent: 'center',
    width: 120,
    minHeight: 110,
    margin: 3,
    borderColor: 'rgba(0,0,0,0.09)',
    borderRadius: 16,
    borderWidth: 1,

  },
});
