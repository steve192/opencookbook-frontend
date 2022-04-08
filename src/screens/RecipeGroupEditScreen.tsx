import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {Button, Caption, Divider, Surface, TextInput, useTheme} from 'react-native-paper';
import Spacer from 'react-spacer';
import {RecipeGroup} from '../dao/RestAPI';
import {MainNavigationProps} from '../navigation/NavigationRoutes';
import {createRecipeGroup, deleteRecipeGroup, updateRecipeGroup} from '../redux/features/recipesSlice';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import CentralStyles from '../styles/CentralStyles';

type Props = NativeStackScreenProps<MainNavigationProps, 'RecipeGroupEditScreen'>;
export const RecipeGroupEditScreen = (props: Props) => {
  const {t} = useTranslation('translation');
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const existingRecipe = useAppSelector((store) => store.recipes.recipeGroups.filter((group) => group.id === props.route.params.recipeGroupId))[0];

  const [recipeGroupData, setRecipeGroupData] = useState<RecipeGroup>(
      existingRecipe ?
      existingRecipe :
            {
              title: '',
              type: 'RecipeGroup',
            },
  );

  const saveRecipeGroup = () => {
    if ( !existingRecipe) {
      dispatch(createRecipeGroup(recipeGroupData));
    } else {
      dispatch(updateRecipeGroup(recipeGroupData));
    }
    props.navigation.goBack();
  };

  const dispatchDeleteRecipeGroup = () => {
    recipeGroupData.id && dispatch(deleteRecipeGroup(recipeGroupData.id)).then(() => {
      props.navigation.goBack();
    });
  };

  const renderDeletionButton = () =>
    <>
      <Divider style={{marginVertical: 10}}/>
      <Button
        color={theme.colors.error}
        onPress={dispatchDeleteRecipeGroup}>{t('common.delete')}</Button>
    </>;

  return (
    <Surface style={CentralStyles.fullscreen}>
      <View style={CentralStyles.contentContainer}>
        <Caption>{t('screens.createGroup.groupName')}</Caption>
        <TextInput mode="flat" dense={true} value={recipeGroupData.title} onChangeText={(newText) => setRecipeGroupData({...recipeGroupData, title: newText})} />
        <Spacer height={10} />
        <Button mode='contained' onPress={saveRecipeGroup}>{existingRecipe ? t('common.save'): t('common.create')}</Button>
        {existingRecipe ? renderDeletionButton() : null}
      </View>
    </Surface>
  );
};
