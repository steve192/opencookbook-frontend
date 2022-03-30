import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Caption, Surface, TextInput} from 'react-native-paper';
import Spacer from 'react-spacer';
import {RecipeGroup} from '../dao/RestAPI';
import {MainNavigationProps} from '../navigation/NavigationRoutes';
import {createRecipeGroup} from '../redux/features/recipesSlice';
import {useAppDispatch} from '../redux/hooks';
import CentralStyles from '../styles/CentralStyles';

type Props = NativeStackScreenProps<MainNavigationProps, 'RecipeGroupEditScreen'>;
export const RecipeGroupEditScreen = (props: Props) => {
  const {t} = useTranslation('translation');
  const dispatch = useAppDispatch();

  const [recipeGroup, setRecipeGroup] = useState<RecipeGroup>(
        props.route.params.recipeGroup ?
            props.route.params.recipeGroup :
            {
              title: '',
              type: 'RecipeGroup',
            },
  );

  const saveRecipeGroup = () => {
    dispatch(createRecipeGroup(recipeGroup));
    props.navigation.goBack();
  };
  return (
    <Surface style={CentralStyles.contentContainer}>
      <Caption>{t('screens.createGroup.groupName')}</Caption>
      <TextInput mode="flat" dense={true} value={recipeGroup.title} onChangeText={(newText) => setRecipeGroup({...recipeGroup, title: newText})} />
      <Spacer height={10} />
      <Button onPress={saveRecipeGroup}>{t('common.create')}</Button>
    </Surface>
  );
};
