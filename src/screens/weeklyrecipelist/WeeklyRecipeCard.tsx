import {Button, Layout, Text} from '@ui-kitten/components';
import React, {useState} from 'react';
import {Pressable, StyleSheet} from 'react-native';
import {DeleteIcon} from '../../assets/Icons';
import {RecipeImageComponent} from '../../components/RecipeImageComponent';


interface Props {
    title: string;
    imageUuid: string;
    onPress: () => void;
    onRemovePress: () => void;
}
export const WeeklyRecipeCard = (props: Props) => {
  const [editMode, setEditMode] = useState(false);
  return (
    <Pressable
      style={styles.card}
      onLongPress={() => setEditMode(!editMode)}
      onPress={props.onPress}>
      <Layout style={{height: 80, borderRadius: 16, overflow: 'hidden'}}>
        <RecipeImageComponent
          forceFitScaling={true}
          uuid={props.imageUuid} />
      </Layout>
      <Text style={{padding: 10, fontWeight: 'bold'}} >
        {props.title}
      </Text>
      {editMode &&
      <Button
        size="medium"
        appearance="outline"
        status="danger"
        onPress={props.onRemovePress}
        accessoryRight={DeleteIcon}/>}
    </Pressable>

  );
};

const styles = StyleSheet.create({
  card: {
    width: 120,
    margin: 3,
    borderColor: 'rgba(0,0,0,0.09)',
    borderRadius: 16,
    borderWidth: 1,

  },
});
