import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleProp, ViewStyle} from 'react-native';
import {Button} from 'react-native-paper';
import {useShoppingImport} from '../../helper/shopping/useShoppingImport';
import {useIsOnline} from '../../offline/useIsOnline';
import {BringImportButton} from '../BringExportButton';

interface Props {
  recipeId: number;
  servings: number;
  style?: StyleProp<ViewStyle>;
}

// Bring's own button for those who chose Bring; the Cookpal list for everybody else.
export const AddToShoppingListButton = (props: Props) => {
  const {t} = useTranslation('translation');
  const {provider, start, exporting, dialog} = useShoppingImport();
  const online = useIsOnline();
  const addRecipe = () => start({kind: 'recipe', recipeId: props.recipeId, servings: props.servings});

  return (
    <>
      {provider === 'BRING' ?
        <BringImportButton style={props.style} loading={exporting} disabled={!online} onPress={addRecipe} /> :
        <Button
          style={props.style}
          mode="contained-tonal"
          icon="cart-plus"
          loading={exporting}
          disabled={!online || provider === undefined || exporting}
          onPress={addRecipe}>
          {t('screens.shopping.import.addToList')}
        </Button>}
      {dialog}
    </>
  );
};
