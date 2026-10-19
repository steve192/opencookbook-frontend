import {RouteProp, useRoute} from '@react-navigation/native';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {Button, Card, Divider, Icon, Text} from 'react-native-paper';
import {SnackbarUtil} from '../../helper/GlobalSnackbar';
import {printHtmlDocument} from '../../helper/printHtmlDocument';
import {shareLink} from '../../helper/shareLink';
import {shareText} from '../../helper/shareText';
import {BASE_PATH} from '../../navigation/basePath';
import {BaseNavigatorProps} from '../../navigation/NavigationRoutes';
import {useAppSelector} from '../../redux/hooks';
import {useAppTheme} from '../../styles/CentralStyles';
import {useInFloatingPanel} from '../FloatingPanel';
import {resultHtml, ResultSection, resultText} from '../../tools/result';
import {SignupHintCard} from './SignupHintCard';

interface Props {
  title: string;
  sections: ResultSection[];
  /** Anything the lines cannot say, such as a timeline. */
  children?: React.ReactNode;
}

// A tool's result, and what can be done with it: copy, print, or send the link to the calculation.
export const ToolResult = (props: Props) => {
  const {t} = useTranslation('translation');
  const theme = useAppTheme();
  const floating = useInFloatingPanel();
  const route = useRoute<RouteProp<BaseNavigatorProps, 'ToolScreen'>>();
  const instance = useAppSelector((state) => state.settings.backendUrl);

  const link = () => {
    const query = route.params.i ? `?i=${encodeURIComponent(route.params.i)}` : '';
    return `${instance}${BASE_PATH}/tools/${route.params.slug}${query}`;
  };
  const report = (outcome: string) => {
    if (outcome === 'copied') {
      SnackbarUtil.show({message: t('tools.result.copied')});
    }
  };

  return (
    <>
      {/* Inside a floating panel the panel is the surface. */}
      <Card mode={floating ? 'contained' : 'elevated'} style={floating ? styles.inPanel : undefined}>
        <Card.Title title={props.title} titleVariant="titleMedium" />
        <Card.Content style={styles.content}>
          {props.sections.map((section, index) => (
            <View key={index} style={styles.section}>
              {section.title &&
                <View style={styles.header}>
                  {section.icon && <Icon source={section.icon} size={18} color={theme.colors.primary} />}
                  <Text variant="titleSmall" style={{color: theme.colors.primary}}>{section.title}</Text>
                </View>}
              {section.lines.map((line, lineIndex) => (
                <View key={lineIndex} style={styles.line}>
                  <Text variant="bodyMedium" style={styles.label}>{line.label}</Text>
                  <Text variant="bodyLarge" style={styles.value}>{line.value}</Text>
                </View>
              ))}
              {index < props.sections.length - 1 && <Divider />}
            </View>
          ))}
          {props.children}
        </Card.Content>
        {/* Equal buttons that grow to fill each row, so a narrow card wraps them evenly. */}
        <View style={styles.actions}>
          <Button mode="contained-tonal" icon="content-copy" style={styles.action}
            onPress={() => shareText(resultText(props.title, props.sections)).then(report).catch(() => undefined)}>
            {t('tools.result.copy')}
          </Button>
          <Button mode="contained-tonal" icon="printer" style={styles.action}
            onPress={() => printHtmlDocument(resultHtml(props.title, props.sections)).catch(() => undefined)}>
            {t('tools.result.print')}
          </Button>
          <Button mode="contained-tonal" icon="link-variant" style={styles.action}
            onPress={() => shareLink(props.title, link()).then(report).catch(() => undefined)}>
            {t('tools.result.shareLink')}
          </Button>
        </View>
      </Card>
      <SignupHintCard />
    </>
  );
};

const styles = StyleSheet.create({
  content: {gap: 16},
  section: {gap: 6},
  header: {flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2},
  line: {flexDirection: 'row', alignItems: 'baseline', gap: 12},
  label: {flex: 1},
  value: {fontWeight: 'bold', textAlign: 'right'},
  actions: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 16},
  action: {flexGrow: 1},
  inPanel: {backgroundColor: 'transparent'},
});
