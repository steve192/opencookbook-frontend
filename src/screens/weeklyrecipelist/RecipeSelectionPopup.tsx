import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Modal, Pressable, TouchableWithoutFeedback, View} from 'react-native';
import {Button, Caption, Divider, Headline, Surface, TextInput, TouchableRipple} from 'react-native-paper';
import Spacer from 'react-spacer';
import {RecipeList} from '../../components/RecipeList';
import {Recipe, RecipeGroup} from '../../dao/RestAPI';
import CentralStyles, {modalStyles} from '../../styles/CentralStyles';

interface Props {
  visible: boolean;
  onClose: () => void;
  onRecipeSelected: (recipe: Recipe) => void;
  onSimpleRecipeSelected: (name: string) => void;
}

export const RecipeSelectionPopup = (props: Props) => {
  const [selectionType, setSelectionType] = useState<undefined | 'simple' | 'normal'>(undefined);
  const [shownRecipeGroup, setShownRecipeGroup] = useState<RecipeGroup>();
  const [simpleRecipeName, setSimpleRecipeName] = useState('');
  const onRecipeGroupSelected = (recipeGroup: RecipeGroup) => {
    setShownRecipeGroup(recipeGroup);
  };

  const {t} = useTranslation('translation');

  useEffect(() => {
    setSelectionType(undefined);
  }, [props.visible]);

  const renderContent = () => {
    if (selectionType === 'normal') {
      return <RecipeList
        shownRecipeGroupId={shownRecipeGroup?.id}
        onRecipeClick={props.onRecipeSelected}
        onRecipeGroupClick={onRecipeGroupSelected} />;
    } else if (selectionType === 'simple') {
      return <View style={[CentralStyles.fullscreen, {justifyContent: 'center'}]}>
        <TextInput
          value={simpleRecipeName}
          onChangeText={setSimpleRecipeName}
          label={t('screens.recipeselectionpopup.simplerecipeinput')}
          multiline={true}
        />
        <Spacer height={20} />
        <Button
          onPress={() => props.onSimpleRecipeSelected(simpleRecipeName)}
          mode="contained">{t('screens.recipeselectionpopup.savesimplerecipe')}</Button>
      </View>;
    } else {
      return <View style={{flex: 1}}>
        <TouchableRipple
          style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
          onPress={() => setSelectionType('normal')}>
          <>
            <Headline>{t('screens.recipeselectionpopup.normal')}</Headline>
            <Caption>{t('screens.recipeselectionpopup.normaldescription')}</Caption>
          </>
        </TouchableRipple>
        <Divider />
        <TouchableRipple
          style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
          onPress={() => setSelectionType('simple')}>
          <>
            <Headline>{t('screens.recipeselectionpopup.simple')}</Headline>
            <Caption>{t('screens.recipeselectionpopup.simpledescription')}</Caption>
          </>
        </TouchableRipple>
      </View>;
    }
  };

  return (
    <View style={modalStyles.centeredView}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={props.visible}
        // onShow={() => modalInputRef.current?.focus()}
        onRequestClose={props.onClose}
      >
        <Pressable
          onPress={props.onClose}
          style={modalStyles.modalBackdrop}>
          <>
            <View style={modalStyles.centeredView}>
              <Surface style={[modalStyles.modalView]}>
                <TouchableWithoutFeedback>
                  {renderContent()}
                </TouchableWithoutFeedback>
              </Surface>
            </View>
          </>
        </Pressable>
      </Modal>
    </View>
  );
};
