import React from 'react';
import {useTranslation} from 'react-i18next';
import {Avatar, Dialog, List, Portal, Text} from 'react-native-paper';
import {ShoppingProvider} from '../../dao/RestAPI';
import {overlayStyles} from '../../styles/CentralStyles';
import {iconSide} from '../listSides';

interface Props {
  visible: boolean;
  onDismiss: () => void;
  onChoose: (provider: ShoppingProvider) => void;
}

const BringLogo = () => <Avatar.Image size={40} source={require('../../../assets/Bring_Logo_big.png')} />;

// Asked on the first shopping import: the built-in list, or Bring.
export const ProviderDialog = (props: Props) => {
  const {t} = useTranslation('translation');
  const choose = (provider: ShoppingProvider) => {
    props.onDismiss();
    props.onChoose(provider);
  };
  return (
    <Portal>
      <Dialog visible={props.visible} style={overlayStyles.dialogView} onDismiss={props.onDismiss}>
        <Dialog.Title>{t('screens.shopping.provider.question')}</Dialog.Title>
        <Dialog.Content>
          <List.Item
            title={t('screens.shopping.provider.cookpal')}
            description={t('screens.shopping.provider.cookpalDescription')}
            descriptionNumberOfLines={3}
            left={iconSide('cart-outline')}
            onPress={() => choose('COOKPAL')} />
          <List.Item
            title={t('screens.shopping.provider.bring')}
            description={t('screens.shopping.provider.bringDescription')}
            descriptionNumberOfLines={3}
            left={BringLogo}
            onPress={() => choose('BRING')} />
          <Text variant="bodySmall">{t('screens.shopping.provider.explanation')}</Text>
        </Dialog.Content>
      </Dialog>
    </Portal>
  );
};
