import React from 'react';
import {useTranslation} from 'react-i18next';
import {Image, ScrollView, StyleSheet, View} from 'react-native';
import {Avatar, Button, Chip, HelperText, Text} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Notice} from '../../components/Notice';
import {MAX_SCAN_PAGES} from '../../helper/recipeScanPages';
import {hostOf, MAX_IMPORT_INPUT, SharedContent} from '../../helper/sharedContent';
import CentralStyles, {useAppTheme} from '../../styles/CentralStyles';

interface Props {
  share: SharedContent;
  canScan: boolean;
  importDisabled: boolean;
  onImport: () => void;
  onDismiss: () => void;
}

const INSTAGRAM = /(^|\.)(instagram\.com|instagr\.am)$/i;

// Nothing is imported before the answer.
export const SharePreview = ({share, canScan, importDisabled, onImport, onDismiss}: Props) => {
  const {t} = useTranslation('translation');
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const muted = {color: theme.colors.onSurfaceVariant};

  const renderLink = (link: string, host: string, title?: string) => (
    <>
      {title ?
        <Text variant="titleMedium" numberOfLines={3} style={styles.centered}>{title}</Text> :
        <Text variant="bodyMedium" numberOfLines={2} style={[styles.centered, muted]}>{link}</Text>}
      <Chip icon="web">{host}</Chip>
    </>
  );

  const renderText = (text: string, tooLong: boolean) => (
    <View style={styles.stretch}>
      <View style={[styles.quote, {borderColor: theme.colors.outlineVariant}]}>
        <Text variant="bodyMedium" numberOfLines={6} style={muted}>{text}</Text>
      </View>
      {tooLong &&
        <HelperText type="error" padding="none">{t('screens.import.tooLong')}</HelperText>}
    </View>
  );

  const renderPhotos = (uris: string[]) => (
    <View style={[styles.stretch, styles.photoSection]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photos}>
        {uris.slice(0, MAX_SCAN_PAGES).map((uri) => <Image key={uri} source={{uri}} style={styles.photo} />)}
      </ScrollView>
      {!canScan && <Notice icon="camera-off" tone="information">{t('screens.import.share.photosUnavailable')}</Notice>}
      {canScan && uris.length > MAX_SCAN_PAGES &&
        <Text variant="bodyMedium" style={[styles.centered, muted]}>
          {t('screens.import.share.photoLimit', {count: MAX_SCAN_PAGES})}
        </Text>}
    </View>
  );

  const preview = (() => {
    switch (share.kind) {
      case 'link': {
        const host = hostOf(share.link);
        return {
          icon: INSTAGRAM.test(host) ? 'instagram' : 'link-variant',
          title: t('screens.import.share.linkTitle'),
          body: renderLink(share.link, host, share.title),
          action: t('screens.import.import'),
        };
      }
      case 'text': {
        const tooLong = share.input.length > MAX_IMPORT_INPUT;
        return {
          icon: 'text-box-outline',
          title: t('screens.import.share.textTitle'),
          body: renderText(share.input, tooLong),
          action: tooLong ? undefined : t('screens.import.import'),
        };
      }
      case 'photos':
        return {
          icon: 'image-multiple-outline',
          title: canScan ?
            t('screens.import.share.photosTitle', {count: share.uris.length}) :
            t('screens.import.share.photosUnavailableTitle'),
          body: renderPhotos(share.uris),
          action: canScan ? t('screens.import.share.scan') : undefined,
        };
    }
  })();

  return (
    <View style={styles.preview}>
      <ScrollView contentContainerStyle={[CentralStyles.smallContentContainer, styles.body]}>
        <Avatar.Icon
          size={88}
          icon={preview.icon}
          color={theme.colors.onPrimaryContainer}
          style={{backgroundColor: theme.colors.primaryContainer}} />
        <Text variant="headlineSmall" style={styles.centered}>{preview.title}</Text>
        {preview.body}
      </ScrollView>
      <View style={[CentralStyles.smallContentContainer, styles.actions, {paddingBottom: insets.bottom + 16}]}>
        {preview.action &&
          <Button mode="contained" icon={share.kind === 'photos' ? 'text-recognition' : 'import'}
            contentStyle={styles.mainAction} disabled={importDisabled} onPress={onImport}>
            {preview.action}
          </Button>}
        <Button mode={preview.action ? 'text' : 'contained-tonal'} onPress={onDismiss}>
          {preview.action ? t('common.cancel') : t('common.close')}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  preview: {flex: 1},
  body: {flexGrow: 1, alignItems: 'center', gap: 16},
  actions: {gap: 8, paddingTop: 8},
  mainAction: {height: 48},
  centered: {textAlign: 'center'},
  stretch: {alignSelf: 'stretch'},
  quote: {borderLeftWidth: 3, paddingLeft: 12, paddingVertical: 2},
  photoSection: {gap: 12},
  photos: {flexGrow: 1, justifyContent: 'center', gap: 8},
  photo: {width: 64, height: 84, borderRadius: 8},
});
