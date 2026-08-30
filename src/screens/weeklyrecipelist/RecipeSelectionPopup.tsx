import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Modal, Pressable, View} from 'react-native';
import {Appbar, Button, Caption, Divider, Headline, Surface, TextInput, TouchableRipple} from 'react-native-paper';
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

  const {t} = useTranslation('translation');

  useEffect(() => {
    setSelectionType(undefined);
    setShownRecipeGroup(undefined);
  }, [props.visible]);

  const renderContent = () => {
    if (selectionType === 'normal') {
      return (
        <View style={CentralStyles.fullscreen}>
          {/* Without this header, tapping a group inside the popup leaves the
              user with no way back to the full list except dismissing the
              entire popup. */}
          <Appbar.Header>
            {shownRecipeGroup && (
              <Appbar.BackAction onPress={() => setShownRecipeGroup(undefined)} />
            )}
            <Appbar.Content
              title={shownRecipeGroup ?
                shownRecipeGroup.title :
                t('screens.recipeselectionpopup.normal')} />
          </Appbar.Header>
          <RecipeList
            shownRecipeGroupId={shownRecipeGroup?.id}
            onRecipeClick={props.onRecipeSelected}
            onRecipeGroupClick={setShownRecipeGroup} />
        </View>
      );
    } else if (selectionType === 'simple') {
      return (
        <View style={[CentralStyles.fullscreen, {justifyContent: 'center'}]}>
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
        </View>
      );
    } else {
      return (
        <View style={{flex: 1}}>
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
        </View>
      );
    }
  };

  return (
    <View style={modalStyles.centeredView}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={props.visible}
        onRequestClose={props.onClose}
      >
        <View style={CentralStyles.fullscreen}>
          <Pressable
            onPress={props.onClose}
            style={modalStyles.modalBackdrop} />
          {/* box-none lets presses in the margins around the popup reach the backdrop */}
          <View style={modalStyles.centeredView} pointerEvents="box-none">
            <Surface style={[modalStyles.modalView]}>
              {renderContent()}
            </Surface>
          </View>
        </View>
      </Modal>
    </View>
  );
};
