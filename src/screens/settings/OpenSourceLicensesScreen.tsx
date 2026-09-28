import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Linking, SectionList, StyleSheet, View} from 'react-native';
import {ActivityIndicator, Button, List, Searchbar, Surface, Text} from 'react-native-paper';
import RestAPI from '../../dao/RestAPI';
import {
  browsableHomepage,
  filterSections,
  OpenSourceComponent,
  OpenSourceSection,
} from '../../legal/openSourceComponents';
import CentralStyles, {useAppTheme} from '../../styles/CentralStyles';

// Generated when Metro starts (see metro.config.js); required here so it is only read once this screen opens.
const appSection = (): OpenSourceSection =>
  ({id: 'app', components: require('../../legal/openSourceComponents.generated.json').components});

const Link = ({url}: {url: string}) => {
  const theme = useAppTheme();
  return <Text variant="bodySmall" style={{color: theme.colors.primary}} onPress={() => Linking.openURL(url)}>{url}</Text>;
};

const ComponentDetails = ({component}: {component: OpenSourceComponent}) => {
  const {t} = useTranslation('translation');
  const homepage = browsableHomepage(component.homepage);
  return (
    <View style={styles.details}>
      {!!component.author && <Text variant="bodySmall">{t('screens.licenses.author', {author: component.author})}</Text>}
      {homepage && <Link url={homepage} />}
      {!!component.licenseUrl && <Link url={component.licenseUrl} />}
      {!!component.noticeText && <Text variant="bodySmall" selectable>{component.noticeText}</Text>}
      {!!component.licenseText && <Text variant="bodySmall" selectable>{component.licenseText}</Text>}
      {!component.licenseText && !component.licenseUrl &&
        <Text variant="bodySmall">{t('screens.licenses.noLicenseText')}</Text>}
    </View>
  );
};

// What the app and its server are built from and the data they use, with the license and notices each
// asks to be passed on. The app's own list is bundled; the server's is asked for.
export const OpenSourceLicensesScreen = () => {
  const {t} = useTranslation('translation');
  const app = useMemo(appSection, []);
  const [server, setServer] = useState<OpenSourceSection[] | 'loading' | 'failed'>('loading');
  const [query, setQuery] = useState('');

  const loadServer = useCallback(() => {
    setServer('loading');
    RestAPI.getOpenSourceSections().then(setServer).catch(() => setServer('failed'));
  }, []);
  useEffect(loadServer, []);

  const sections = useMemo(
      () => filterSections([app, ...(Array.isArray(server) ? server : [])], query)
          .map((section) => ({id: section.id, data: section.components})),
      [app, server, query]);

  return (
    <Surface style={CentralStyles.fullscreen}>
      <SectionList
        sections={sections}
        keyExtractor={(component, index) => `${component.name}-${index}`}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text variant="bodyMedium">{t('screens.licenses.intro')}</Text>
            <Searchbar placeholder={t('screens.licenses.search')} value={query} onChangeText={setQuery} />
          </View>}
        renderSectionHeader={({section}) => (
          <List.Subheader>{t(`screens.licenses.sections.${section.id}`)}</List.Subheader>
        )}
        renderItem={({item}) => (
          <List.Accordion title={item.name} description={item.license}>
            <ComponentDetails component={item} />
          </List.Accordion>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            {server === 'loading' && <ActivityIndicator />}
            {server === 'failed' &&
              <>
                <Text variant="bodyMedium">{t('screens.licenses.serverUnavailable')}</Text>
                <Button mode="outlined" onPress={loadServer}>{t('screens.licenses.retry')}</Button>
              </>}
          </View>} />
    </Surface>
  );
};

const styles = StyleSheet.create({
  header: {padding: 16, gap: 12},
  details: {paddingHorizontal: 16, paddingBottom: 16, gap: 8},
  footer: {padding: 16, gap: 12, alignItems: 'center'},
});
