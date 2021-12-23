import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Button, Input, Layout, Text} from '@ui-kitten/components';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import Spacer from 'react-spacer';
import RestAPI, {RecipeGroup} from '../dao/RestAPI';
import {MainNavigationProps} from '../navigation/NavigationRoutes';
import CentralStyles from '../styles/CentralStyles';

type Props = NativeStackScreenProps<MainNavigationProps, 'RecipeGroupEditScreen'>;
export const RecipeGroupEditScreen = (props: Props) => {
  const {t} = useTranslation('translation');

  const [recipeGroup, setRecipeGroup] = useState<RecipeGroup>(
        props.route.params.recipeGroup ?
            props.route.params.recipeGroup :
            {
              title: '',
              type: 'RecipeGroup',
            },
  );

  const saveRecipeGroup = () => {
    RestAPI.createNewRecipeGroup(recipeGroup).then((savedRecipeGroup) => {
      props.navigation.goBack();
      props.route.params.onRecipeGroupChanges?.(savedRecipeGroup);
    });
  };
  return (
    <Layout style={CentralStyles.contentContainer}>
      <Text category="label">{t('screens.createGroup.groupName')}</Text>
      <Input value={recipeGroup.title} onChangeText={(newText) => setRecipeGroup({...recipeGroup, title: newText})} />
      <Spacer height={10} />
      <Button onPress={saveRecipeGroup}>{t('common.create')}</Button>
    </Layout>
  );
};
