import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Modal, Pressable, StyleSheet, View} from 'react-native';
import {Appbar, Button, Icon, Surface, Text, TextInput, TouchableRipple} from 'react-native-paper';
import {RecipeList} from '../../components/RecipeList';
import {Recipe, RecipeGroup} from '../../dao/RestAPI';
import CentralStyles, {modalStyles, useAppTheme} from '../../styles/CentralStyles';

interface Props {
  visible: boolean;
  /** The day being planned, shown as the header subtitle */
  dayLabel?: string;
  onClose: () => void;
  onRecipeSelected: (recipe: Recipe) => void;
  onSimpleRecipeSelected: (name: string) => void;
}

export const RecipeSelectionPopup = (props: Props) => {
  const [selectionType, setSelectionType] = useState<undefined | 'simple' | 'normal'>(undefined);
  const [shownRecipeGroup, setShownRecipeGroup] = useState<RecipeGroup>();
  const [simpleRecipeName, setSimpleRecipeName] = useState('');

  const {t} = useTranslation('translation');
  const theme = useAppTheme();

  useEffect(() => {
    setSelectionType(undefined);
    setShownRecipeGroup(undefined);
    setSimpleRecipeName('');
  }, [props.visible]);

  // One step back at a time: out of a group, then out of the chosen mode, and
  // only the explicit close button dismisses the whole popup. Previously the
  // back action existed only while inside a group, so the other steps were
  // one-way and a group could feel like a dead end.
  const goBack = () => {
    if (shownRecipeGroup) {
      setShownRecipeGroup(undefined);
      return;
    }
    setSelectionType(undefined);
  };

  const headerTitle = () => {
    if (shownRecipeGroup) return shownRecipeGroup.title;
    if (selectionType === 'normal') return t('screens.recipeselectionpopup.normal');
    if (selectionType === 'simple') return t('screens.recipeselectionpopup.simple');
    return t('screens.recipeselectionpopup.title');
  };

  const renderModeOption = (
      type: 'normal' | 'simple',
      icon: string,
      title: string,
      description: string,
  ) => (
    <TouchableRipple style={styles.modeOption} onPress={() => setSelectionType(type)}>
      <View style={styles.modeOptionContent}>
        <View style={[styles.modeIcon, {backgroundColor: theme.colors.primaryContainer}]}>
          <Icon source={icon} size={26} color={theme.colors.onPrimaryContainer} />
        </View>
        <View style={styles.modeTexts}>
          <Text variant="titleMedium" style={styles.modeTitle}>{title}</Text>
          <Text variant="bodySmall" style={{color: theme.colors.onSurfaceVariant}}>{description}</Text>
        </View>
        <Icon source="chevron-right" size={22} color={theme.colors.onSurfaceVariant} />
      </View>
    </TouchableRipple>
  );

  const renderContent = () => {
    if (selectionType === 'normal') {
      return (
        <RecipeList
          // Remounting on group changes clears the search term, which otherwise
          // keeps filtering inside the group the user just opened - typically
          // down to nothing, because the term matched the group name.
          key={shownRecipeGroup?.id ?? 'all'}
          shownRecipeGroupId={shownRecipeGroup?.id}
          onRecipeClick={props.onRecipeSelected}
          onRecipeGroupClick={setShownRecipeGroup} />
      );
    }

    if (selectionType === 'simple') {
      return (
        <View style={styles.simpleContent}>
          <TextInput
            value={simpleRecipeName}
            onChangeText={setSimpleRecipeName}
            label={t('screens.recipeselectionpopup.simplerecipeinput')}
            autoFocus={true}
            multiline={true} />
          <Button
            mode="contained"
            icon="check"
            disabled={simpleRecipeName.trim().length === 0}
            style={styles.simpleSaveButton}
            onPress={() => props.onSimpleRecipeSelected(simpleRecipeName.trim())}>
            {t('screens.recipeselectionpopup.savesimplerecipe')}
          </Button>
        </View>
      );
    }

    return (
      <View style={styles.modeChooser}>
        {renderModeOption(
            'normal',
            'book-open-variant',
            t('screens.recipeselectionpopup.normal'),
            t('screens.recipeselectionpopup.normaldescription'))}
        {renderModeOption(
            'simple',
            'lightning-bolt-outline',
            t('screens.recipeselectionpopup.simple'),
            t('screens.recipeselectionpopup.simpledescription'))}
      </View>
    );
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
            <Surface style={[modalStyles.modalView, styles.modal]}>
              {/* The popup is not under the system status bar, so the header must
                  not reserve room for it. */}
              <Appbar.Header statusBarHeight={0} style={styles.header}>
                {selectionType !== undefined &&
                  <Appbar.BackAction
                    accessibilityLabel={t('screens.recipeselectionpopup.back')}
                    onPress={goBack} />
                }
                <Appbar.Content title={headerTitle()} />
                <Appbar.Action
                  icon="close"
                  accessibilityLabel={t('screens.recipeselectionpopup.close')}
                  onPress={props.onClose} />
              </Appbar.Header>
              {/* Appbar.Content drops its subtitle under MD3, so the day this is
                  planning for gets its own line. */}
              {props.dayLabel ?
                <View style={styles.dayContext}>
                  <Icon source="calendar-outline" size={16} color={theme.colors.onSurfaceVariant} />
                  <Text variant="bodySmall" style={{color: theme.colors.onSurfaceVariant}}>
                    {props.dayLabel}
                  </Text>
                </View> :
                null}
              {renderContent()}
            </Surface>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modal: {
    padding: 0,
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: 'transparent',
  },
  dayContext: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  modeChooser: {
    flex: 1,
    padding: 12,
    gap: 12,
  },
  modeOption: {
    borderRadius: 12,
  },
  modeOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 12,
  },
  modeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeTexts: {
    flex: 1,
  },
  modeTitle: {
    fontWeight: 'bold',
  },
  simpleContent: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  simpleSaveButton: {
    marginTop: 20,
  },
});
