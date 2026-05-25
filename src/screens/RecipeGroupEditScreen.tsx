import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {Button, Caption, Divider, Surface, TextInput} from 'react-native-paper';
import Spacer from 'react-spacer';
import {RecipeGroup} from '../dao/RestAPI';
import {PromptUtil} from '../helper/Prompt';
import {MainNavigationProps} from '../navigation/NavigationRoutes';
import {createRecipeGroup, deleteRecipeGroup, updateRecipeGroup} from '../redux/features/recipesSlice';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import CentralStyles, {useAppTheme} from '../styles/CentralStyles';

type Props = NativeStackScreenProps<MainNavigationProps, 'RecipeGroupEditScreen'>;

export const RecipeGroupEditScreen = (props: Props) => {
  const {t} = useTranslation('translation');
  const dispatch = useAppDispatch();
  const theme = useAppTheme();

  const existingRecipeGroup = useAppSelector(
      (store) => store.recipes.recipeGroups.filter((group) => group.id === props.route.params.recipeGroupId),
  )[0];

  const [recipeGroupData, setRecipeGroupData] = useState<RecipeGroup>(
      existingRecipeGroup ?
        existingRecipeGroup :
        {title: '', type: 'RecipeGroup'},
  );

  const [pending, setPending] = useState(false);

  const trimmedTitle = recipeGroupData.title.trim();
  const canSave = !pending && trimmedTitle.length > 0;

  const saveRecipeGroup = () => {
    if (!canSave) return;
    setPending(true);
    const action = existingRecipeGroup
      ? updateRecipeGroup(recipeGroupData)
      : createRecipeGroup(recipeGroupData);
    dispatch(action).finally(() => {
      setPending(false);
      props.navigation.goBack();
    });
  };

  const performDelete = () => {
    if (!recipeGroupData.id) return;
    dispatch(deleteRecipeGroup(recipeGroupData.id)).then(() => {
      // After deleting, leave the (now-stale) group view and land back on the
      // top-level "My recipes" list.
      props.navigation.navigate('OverviewScreen', {
        screen: 'RecipesListScreen',
        params: {
          screen: 'RecipeListDetailScreen',
          params: {shownRecipeGroupId: undefined},
        },
      });
    });
  };

  const onDeletePress = () => {
    PromptUtil.show({
      title: t('screens.createGroup.deleteTitle'),
      message: t('screens.createGroup.deleteMessage'),
      button1: t('common.delete'),
      button1Callback: performDelete,
      button2: t('common.cancel'),
    });
  };

  const renderDeletionButton = () => (
    <>
      <Divider style={{marginVertical: 10}}/>
      <Button
        buttonColor={theme.colors.error}
        onPress={onDeletePress}>{t('common.delete')}</Button>
    </>
  );

  return (
    <Surface style={CentralStyles.fullscreen}>
      <View style={CentralStyles.contentContainer}>
        <Caption>{t('screens.createGroup.groupName')}</Caption>
        <TextInput
          mode="flat"
          dense={true}
          autoFocus={!existingRecipeGroup}
          value={recipeGroupData.title}
          onChangeText={(newText) => setRecipeGroupData({...recipeGroupData, title: newText})}
          returnKeyType='go'
          onSubmitEditing={saveRecipeGroup} />
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
