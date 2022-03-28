import {HeaderHeightContext} from '@react-navigation/elements';
import React, {useState} from 'react';
import {Modal, Pressable, StyleSheet, View} from 'react-native';
import {RecipeList} from '../../components/RecipeList';
import {Recipe, RecipeGroup} from '../../dao/RestAPI';

interface Props {
    visible: boolean;
    onClose: () => void;
    onRecipeSelected: (recipe: Recipe) => void;
}

export const RecipeSelectionPopup = (props: Props) => {
  const [shownRecipeGroup, setShownRecipeGroup] = useState<RecipeGroup>();
  const onRecipeGroupSelected = (recipeGroup: RecipeGroup) => {
    setShownRecipeGroup(recipeGroup);
  };

  return (
    <View style={styles.centeredView}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={props.visible}
        // onShow={() => modalInputRef.current?.focus()}
        onRequestClose={props.onClose}
      >
        <Pressable
          onPress={props.onClose}
          style={styles.modalBackdrop}>
          <>
            <View style={styles.centeredView}>
              <View style={[styles.modalView]}>
                <RecipeList
                  shownRecipeGroupId={shownRecipeGroup?.id}
                  onRecipeClick={props.onRecipeSelected}
                  onRecipeGroupClick={onRecipeGroupSelected} />
              </View>
            </View>
          </>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    width: '100%',
  },
  modalBackdrop: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxWidth: 600,
    maxHeight: 800,
    flex: 1,
    marginBottom: 10,
    padding: 10,
    marginHorizontal: 10,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});
