import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {Button, Divider, Surface, Text, TextInput} from 'react-native-paper';
import Spacer from 'react-spacer';
import {
  useCreateRecipeGroupMutation, useDeleteRecipeGroupMutation, useGetRecipeGroupsQuery, useUpdateRecipeGroupMutation,
} from '../api/endpoints/recipes';
import {RecipeGroup} from '../api/types/recipes';
import {errorMessageKey} from '../helper/apiErrorMessage';
import {SnackbarUtil} from '../helper/GlobalSnackbar';
import {PromptUtil} from '../helper/Prompt';
import {MainNavigationProps} from '../navigation/NavigationRoutes';
import {OfflineSaveHint} from '../offline/OfflineSaveHint';
import {useIsOnline} from '../offline/useIsOnline';
import CentralStyles, {useAppTheme} from '../styles/CentralStyles';

type Props = NativeStackScreenProps<MainNavigationProps, 'RecipeGroupEditScreen'>;

export const RecipeGroupEditScreen = (props: Props) => {
  const {t} = useTranslation('translation');
  const theme = useAppTheme();
  const online = useIsOnline();

  const existingRecipeGroup = useGetRecipeGroupsQuery().data
      ?.find((group) => group.id === props.route.params.recipeGroupId);

  const [recipeGroupData, setRecipeGroupData] = useState<RecipeGroup>(
      existingRecipeGroup ?? {title: '', type: 'RecipeGroup'},
  );

  const [createRecipeGroup, creating] = useCreateRecipeGroupMutation();
  const [updateRecipeGroup, updating] = useUpdateRecipeGroupMutation();
  const [deleteRecipeGroup] = useDeleteRecipeGroupMutation();
  const pending = creating.isLoading || updating.isLoading;

  const trimmedTitle = recipeGroupData.title.trim();
  const canSave = online && !pending && trimmedTitle.length > 0;

  const saveRecipeGroup = () => {
    if (!canSave) return;
    const saving = existingRecipeGroup ? updateRecipeGroup(recipeGroupData) : createRecipeGroup(recipeGroupData);
    saving.unwrap()
        .then(() => props.navigation.goBack())
        .catch((error) => SnackbarUtil.show({message: t(errorMessageKey(error))}));
  };

  const performDelete = () => {
    if (!recipeGroupData.id) return;
    deleteRecipeGroup(recipeGroupData.id).unwrap().then(() => {
      // After deleting, leave the (now-stale) group view and land back on the
      // top-level "My recipes" list.
      props.navigation.navigate('OverviewScreen', {
        screen: 'RecipesListScreen',
        params: {
          screen: 'RecipeListDetailScreen',
          params: {shownRecipeGroupId: undefined},
        },
      });
    }).catch((error) => SnackbarUtil.show({message: t(errorMessageKey(error))}));
  };

  const onDeletePress = () => {
    PromptUtil.show({
      title: t('screens.createGroup.deleteTitle'),
      message: t('screens.createGroup.deleteMessage'),
      destructive: true,
      confirm: t('common.delete'),
      onConfirm: performDelete,
      cancel: t('common.cancel'),
    });
  };

  const renderDeletionButton = () => (
    <>
      <Divider style={{marginVertical: 10}}/>
      <Button
        mode="contained"
        buttonColor={theme.colors.destructive}
        textColor={theme.colors.onDestructive}
        disabled={!online}
        onPress={onDeletePress}>{t('common.delete')}</Button>
    </>
  );

  return (
    <Surface style={CentralStyles.screen}>
      <View style={CentralStyles.contentContainer}>
        <Text variant="bodySmall" style={{color: theme.colors.onSurfaceVariant}}>{t('screens.createGroup.groupName')}</Text>
        <TextInput
          mode="flat"
          dense={true}
          autoFocus={!existingRecipeGroup}
          value={recipeGroupData.title}
          onChangeText={(newText) => setRecipeGroupData({...recipeGroupData, title: newText})}
          returnKeyType='go'
          onSubmitEditing={saveRecipeGroup} />
        <OfflineSaveHint />
        <Spacer height={10} />
        <Button
          mode='contained'
          loading={pending}
          disabled={!canSave}
          onPress={saveRecipeGroup}>
          {existingRecipeGroup ? t('common.save') : t('common.create')}
        </Button>
        {existingRecipeGroup ? renderDeletionButton() : null}
      </View>
    </Surface>
  );
};
